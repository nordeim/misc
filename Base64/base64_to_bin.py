#!/usr/bin/env python3
"""
Binary to Base64 Text Converter

A production-grade utility that encodes binary files to RFC 2045 compliant Base64
text format, automatically changing the file extension from .bin to .txt.

Security Note: Implements heuristic detection to warn if input appears to be text,
preventing user error.

RFC 2045 Compliance: Base64 output is wrapped at 76 characters per line.
"""

import argparse
import base64
import os
import sys
import tempfile
from pathlib import Path
from typing import Optional, Tuple

# Configuration constants
LARGE_FILE_THRESHOLD = 100 * 1024 * 1024  # 100MB
CHUNK_SIZE = 64 * 1024  # 64KB chunks for streaming
BASE64_LINE_LENGTH = 76  # RFC 2045 standard
TEXT_DETECTION_THRESHOLD = 0.95  # 95% printable ASCII = likely text file


def validate_input_path(input_path: Path) -> Tuple[bool, Optional[str]]:
    """
    Validates the input file path with comprehensive checks.
    
    Returns: (is_valid, error_message)
    Checks:
    - File existence
    - Regular file type (not directory)
    - Read permissions
    - File size (warn if >1GB)
    - Content heuristic (warn if appears to be text)
    """
    if not input_path.exists():
        return False, f"Input file not found: {input_path}"
    
    if not input_path.is_file():
        return False, f"Path is not a regular file: {input_path}"
    
    if not os.access(input_path, os.R_OK):
        return False, f"Permission denied: cannot read {input_path}"
    
    # Check file size and warn about large files
    file_size = input_path.stat().st_size
    if file_size > 1024 * 1024 * 1024:  # 1GB
        print(f"⚠️  Warning: File is very large ({file_size / (1024**3):.2f} GB)", file=sys.stderr)
        print("   Consider using specialized tools for multi-GB files.", file=sys.stderr)
    
    # Heuristic: warn if file appears to be text (common user error)
    if file_size > 0:
        text_likelihood = _detect_text_content(input_path)
        if text_likelihood > TEXT_DETECTION_THRESHOLD:
            print(f"⚠️  Warning: Input file appears to be {text_likelihood:.1%} text content.", file=sys.stderr)
            print("   This tool is designed for binary files. Output may be meaningless.", file=sys.stderr)
    
    return True, None


def _detect_text_content(file_path: Path, sample_size: int = 1024) -> float:
    """
    Heuristic detection: returns ratio of printable ASCII characters in first sample_size bytes.
    """
    try:
        sample = file_path.read_bytes()[:sample_size]
        if not sample:
            return 0.0
        
        printable_count = sum(1 for byte in sample if 32 <= byte <= 126 or byte in (9, 10, 13))  # ASCII + tabs/newlines
        return printable_count / len(sample)
    except Exception:
        return 0.0  # If we can't read it, assume binary


def construct_output_path(input_path: Path, force: bool = False) -> Tuple[Optional[Path], Optional[str]]:
    """
    Constructs output path with safety checks and overwrite handling.
    
    Returns: (output_path, error_message)
    """
    output_path = input_path.with_suffix('.txt')
    
    if output_path.exists():
        if force:
            print(f"⚠️  Overwriting existing file: {output_path}")
            return output_path, None
        
        print(f"❌ Output file already exists: {output_path}", file=sys.stderr)
        print("   Use --force to overwrite or delete the file first.", file=sys.stderr)
        return None, "Output file exists"
    
    # Check directory writability
    if not os.access(output_path.parent, os.W_OK):
        return None, f"Permission denied: cannot write to directory {output_path.parent}"
    
    return output_path, None


def encode_file_to_base64(input_path: Path, verbose: bool = False) -> Tuple[Optional[bytes], Optional[str]]:
    """
    Encodes binary file to RFC 2045 compliant Base64 text.
    
    Returns: (encoded_bytes, error_message)
    Strategy: Small files → read all; Large files → chunked processing
    """
    file_size = input_path.stat().st_size
    
    try:
        if file_size < LARGE_FILE_THRESHOLD:
            return _encode_small_file(input_path, verbose)
        else:
            return _encode_large_file(input_path, verbose)
    
    except MemoryError:
        return None, "Memory error: file too large to process. Use a machine with more RAM."
    except OSError as e:
        return None, f"OS error during file processing: {e}"
    except Exception as e:
        return None, f"Unexpected error during encoding: {e}"


def _encode_small_file(input_path: Path, verbose: bool) -> Tuple[bytes, Optional[str]]:
    """Optimized path for files < 100MB: read entire file into memory."""
    if verbose:
        print(f"📄 Reading entire file ({input_path.stat().st_size:,} bytes)...")
    
    binary_data = input_path.read_bytes()
    
    if verbose:
        print(f"🔐 Encoding to Base64...")
    
    # Encode and wrap at 76 characters per RFC 2045
    encoded_lines = base64.encodebytes(binary_data).decode('ascii')
    
    if verbose:
        line_count = len(encoded_lines.splitlines())
        print(f"✂️  Wrapped into {line_count} lines of Base64 text")
    
    return encoded_lines.encode('utf-8'), None


def _encode_large_file(input_path: Path, verbose: bool) -> Tuple[bytes, Optional[str]]:
    """
    Streaming path for large files: processes in 64KB chunks.
    
    Note: This builds the complete output in memory due to Base64 padding requirements.
    For files >1GB, a fully streaming solution would require custom buffering logic.
    """
    if verbose:
        print(f"📄 Large file detected. Processing in {CHUNK_SIZE // 1024}KB chunks...")
    
    encoded_chunks = []
    
    with input_path.open('rb') as f:
        while True:
            chunk = f.read(CHUNK_SIZE)
            if not chunk:
                break
            # Process final chunk with proper padding
            encoded_chunk = base64.b64encode(chunk).decode('ascii')
            encoded_chunks.append(encoded_chunk)
    
    # Join and format according to RFC 2045
    raw_b64 = ''.join(encoded_chunks)
    wrapped_lines = '\n'.join(
        raw_b64[i:i + BASE64_LINE_LENGTH] 
        for i in range(0, len(raw_b64), BASE64_LINE_LENGTH)
    )
    
    if verbose:
        print(f"✂️  Wrapped into {wrapped_lines.count(chr(10)) + 1} lines of Base64 text")
    
    return wrapped_lines.encode('utf-8'), None


def write_text_atomic(data: bytes, output_path: Path, verbose: bool = False) -> Optional[str]:
    """
    Writes text data atomically using temporary file and rename.
    
    Prevents data corruption and ensures file appears only when complete.
    """
    temp_path = None
    
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write to temp file in same directory
        with tempfile.NamedTemporaryFile(
            mode='wb', 
            dir=output_path.parent,
            suffix='.tmp',
            delete=False
        ) as temp_file:
            temp_path = Path(temp_file.name)
            temp_file.write(data)
            
            if verbose:
                print(f"💾 Wrote {len(data):,} bytes to temporary file: {temp_path}")
        
        # Verify temp file was written successfully
        if temp_path.stat().st_size == 0 and len(data) > 0:
            temp_path.unlink(missing_ok=True)
            return "Failed to write data: temp file is empty"
        
        # Atomic rename (overwrites if exists, atomic on POSIX)
        os.replace(temp_path, output_path)
        
        if verbose:
            print(f"✅ Atomically renamed to: {output_path}")
        
        return None
    
    except PermissionError:
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)
        return f"Permission denied: cannot write to {output_path}"
    
    except OSError as e:
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)
        return f"OS error during file write: {e}"
    
    except Exception as e:
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)
        return f"Unexpected error writing file: {e}"


def main(argv: Optional[list[str]] = None) -> int:
    """
    Main entry point with production-grade error handling.
    
    Returns exit codes:
    - 0: Success
    - 1: Runtime error
    - 2: Usage/validation error
    """
    parser = argparse.ArgumentParser(
        description="Convert binary file to RFC 2045 compliant Base64 text (.bin → .txt)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  # Basic usage
  python bin_to_base64.py data.bin
  
  # Overwrite existing output
  python bin_to_base64.py data.bin --force
  
  # Verbose mode for debugging
  python bin_to_base64.py data.bin -v
  
  # Using with uv for modern Python management
  uv run bin_to_base64.py data.bin
        """
    )
    
    parser.add_argument(
        'input_file',
        type=Path,
        help='Path to the binary file to encode'
    )
    
    parser.add_argument(
        '--force', '-f',
        action='store_true',
        help='Overwrite output file if it already exists'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable detailed progress and diagnostic output'
    )
    
    args = parser.parse_args(argv)
    
    # Phase 1: Input Validation
    if args.verbose:
        print(f"🔍 Validating input file: {args.input_file}")
    
    is_valid, error_msg = validate_input_path(args.input_file)
    if not is_valid:
        print(f"❌ Validation Error: {error_msg}", file=sys.stderr)
        return 2
    
    # Phase 2: Output Path Construction
    output_path, error_msg = construct_output_path(args.input_file, args.force)
    if error_msg:
        print(f"❌ Output Error: {error_msg}", file=sys.stderr)
        return 1
    
    if args.verbose:
        print(f"📂 Output will be written to: {output_path}")
    
    # Phase 3: Encode Binary to Base64
    if args.verbose:
        print(f"⏳ Encoding {args.input_file.stat().st_size:,} bytes to Base64...")
    
    encoded_data, error_msg = encode_file_to_base64(args.input_file, args.verbose)
    if error_msg:
        print(f"❌ Encoding Error: {error_msg}", file=sys.stderr)
        return 1
    
    # Phase 4: Atomic Write
    if args.verbose:
        print("💿 Writing Base64 text to disk...")
    
    error_msg = write_text_atomic(encoded_data, output_path, args.verbose)
    if error_msg:
        print(f"❌ Write Error: {error_msg}", file=sys.stderr)
        return 1
    
    # Phase 5: Success Summary
    input_size = args.input_file.stat().st_size
    output_size = output_path.stat().st_size
    expansion_ratio = output_size / input_size if input_size > 0 else 0
    
    print(
        f"✅ Successfully encoded: {args.input_file}\n"
        f"   → {output_path}\n"
        f"   Input size: {input_size:,} bytes (binary)\n"
        f"   Output size: {output_size:,} bytes (Base64 text)\n"
        f"   Size increase: {expansion_ratio:.2f}x ({expansion_ratio * 100 - 100:+.1f}%)"
    )
    
    return 0


if __name__ == '__main__':
    sys.exit(main())

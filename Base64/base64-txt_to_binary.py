#!/usr/bin/env python3
"""
Base64 Text to Binary Converter

A production-grade utility that decodes Base64-encoded text files to their original
binary format, automatically changing the file extension from .txt to .bin.

Security Note: This script uses atomic file operations to prevent data corruption.
"""

import argparse
import base64
import binascii
import os
import sys
import tempfile
from pathlib import Path
from typing import Optional, Tuple


def validate_input_path(input_path: Path) -> Tuple[bool, Optional[str]]:
    """
    Validates the input file path and returns (is_valid, error_message).
    
    Checks:
    - File exists
    - Is a regular file (not directory)
    - Has .txt extension (warning only)
    - Is readable
    """
    if not input_path.exists():
        return False, f"Input file not found: {input_path}"
    
    if not input_path.is_file():
        return False, f"Path is not a regular file: {input_path}"
    
    if not os.access(input_path, os.R_OK):
        return False, f"Permission denied: cannot read {input_path}"
    
    if input_path.suffix.lower() != '.txt':
        print(f"⚠️  Warning: Input file does not have .txt extension: {input_path.suffix}", 
              file=sys.stderr)
    
    return True, None


def construct_output_path(input_path: Path, force: bool = False) -> Tuple[Optional[Path], Optional[str]]:
    """
    Constructs output path and handles existence checks.
    
    Returns (output_path, error_message) where error_message is set if
    output exists and force=False, prompting user confirmation.
    """
    output_path = input_path.with_suffix('.bin')
    
    if output_path.exists():
        if force:
            print(f"⚠️  Overwriting existing file: {output_path}")
            return output_path, None
        
        print(f"❌ Output file already exists: {output_path}", file=sys.stderr)
        print("   Use --force to overwrite or choose a different input file.", file=sys.stderr)
        return None, "Output file exists"
    
    return output_path, None


def read_base64_file(file_path: Path, verbose: bool = False) -> Tuple[Optional[bytes], Optional[str]]:
    """
    Reads and validates Base64 content from a text file.
    
    Returns (decoded_bytes, error_message) with robust error handling.
    """
    try:
        # Read with UTF-8 and replace any malformed characters
        content = file_path.read_text(encoding='utf-8', errors='replace')
        
        if verbose:
            print(f"📄 Read {len(content)} characters from {file_path}")
        
        # Clean whitespace that might be present (newlines, spaces)
        # This is common in formatted Base64 text files
        cleaned_content = ''.join(content.split())
        
        if not cleaned_content:
            return None, "Input file is empty after whitespace removal"
        
        # Validate Base64 alphabet before decoding
        # This provides clearer error messages
        try:
            # Validate=True raises binascii.Error for invalid characters
            decoded_data = base64.b64decode(cleaned_content, validate=True)
        except binascii.Error as e:
            return None, f"Invalid Base64 data: {e}"
        
        if verbose:
            print(f"🔍 Successfully decoded {len(decoded_data)} bytes")
        
        return decoded_data, None
    
    except UnicodeDecodeError as e:
        return None, f"Failed to decode file as UTF-8 text: {e}"
    except Exception as e:
        return None, f"Unexpected error reading file: {e}"


def write_binary_atomic(data: bytes, output_path: Path, verbose: bool = False) -> Optional[str]:
    """
    Writes binary data atomically using temporary file and rename.
    
    Prevents data corruption if script is interrupted during write.
    """
    try:
        # Ensure parent directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write to temp file in same directory for atomic rename
        with tempfile.NamedTemporaryFile(mode='wb', dir=output_path.parent, delete=False) as temp_file:
            temp_path = Path(temp_file.name)
            temp_file.write(data)
            
            if verbose:
                print(f"💾 Wrote {len(data)} bytes to temporary file: {temp_path}")
        
        # Atomic replace (works on both Unix and Windows)
        os.replace(temp_path, output_path)
        
        if verbose:
            print(f"✅ Atomically moved to: {output_path}")
        
        return None
    
    except PermissionError:
        # Clean up temp file if it exists
        if 'temp_path' in locals() and temp_path.exists():
            temp_path.unlink(missing_ok=True)
        return f"Permission denied: cannot write to {output_path}"
    
    except OSError as e:
        if 'temp_path' in locals() and temp_path.exists():
            temp_path.unlink(missing_ok=True)
        return f"OS error during file write: {e}"
    
    except Exception as e:
        if 'temp_path' in locals() and temp_path.exists():
            temp_path.unlink(missing_ok=True)
        return f"Unexpected error writing file: {e}"


def main(argv: Optional[list[str]] = None) -> int:
    """
    Main entry point with comprehensive error handling.
    
    Returns exit code:
    - 0: Success
    - 1: Runtime error
    - 2: Usage error
    """
    parser = argparse.ArgumentParser(
        description="Convert Base64-encoded text file to binary file (.txt → .bin)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  # Basic usage
  python base64_to_bin.py encoded.txt
  
  # Overwrite existing output file
  python base64_to_bin.py encoded.txt --force
  
  # Verbose output for debugging
  python base64_to_bin.py encoded.txt -v
  
  # Using with uv
  uv run base64_to_bin.py encoded.txt
        """
    )
    
    parser.add_argument(
        'input_file',
        type=Path,
        help='Path to the Base64-encoded .txt file'
    )
    
    parser.add_argument(
        '--force', '-f',
        action='store_true',
        help='Overwrite output file if it already exists'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable detailed progress output'
    )
    
    args = parser.parse_args(argv)
    
    # Phase 1: Input Validation
    if args.verbose:
        print(f"🔍 Validating input: {args.input_file}")
    
    is_valid, error_msg = validate_input_path(args.input_file)
    if not is_valid:
        print(f"❌ Error: {error_msg}", file=sys.stderr)
        return 2
    
    # Phase 2: Output Path Construction
    output_path, error_msg = construct_output_path(args.input_file, args.force)
    if error_msg:
        return 1
    
    if args.verbose:
        print(f"📂 Output will be written to: {output_path}")
    
    # Phase 3: Read and Decode
    if args.verbose:
        print("⏳ Reading and decoding Base64 content...")
    
    decoded_data, error_msg = read_base64_file(args.input_file, args.verbose)
    if error_msg:
        print(f"❌ Error: {error_msg}", file=sys.stderr)
        return 1
    
    # Phase 4: Atomic Write
    if args.verbose:
        print("💿 Writing binary data...")
    
    error_msg = write_binary_atomic(decoded_data, output_path, args.verbose)
    if error_msg:
        print(f"❌ Error: {error_msg}", file=sys.stderr)
        return 1
    
    # Success Summary
    compression_ratio = len(decoded_data) / args.input_file.stat().st_size
    print(
        f"✅ Successfully converted: {args.input_file}\n"
        f"   → {output_path}\n"
        f"   Input size: {args.input_file.stat().st_size:,} bytes\n"
        f"   Output size: {len(decoded_data):,} bytes\n"
        f"   Compression ratio: {compression_ratio:.2f}x"
    )
    
    return 0


if __name__ == '__main__':
    sys.exit(main())

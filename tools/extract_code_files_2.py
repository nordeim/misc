#!/usr/bin/env python3
import os
import sys
import re

def get_input_arguments():
    """Parse command-line arguments or prompt for missing input."""
    if len(sys.argv) >= 2:
        return sys.argv[1]
    
    input_file = input("Enter the path to the compacted input file: ")
    return input_file

def is_readable_text_file(file_path):
    """Check if the file exists and is a readable text file."""
    if not os.path.exists(file_path):
        return False, "File does not exist"
    
    if not os.path.isfile(file_path):
        return False, "Not a regular file"
    
    # Check for binary content
    try:
        with open(file_path, 'rb') as f:
            data = f.read(1024)
            if b'\0' in data:  # Null bytes indicate binary file
                return False, "File appears to be binary"
        
        # Try reading with common encodings
        for encoding in ['utf-8', 'latin-1', 'cp1252', 'utf-16']:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    f.read()
                return True, encoding
            except UnicodeDecodeError:
                continue
        
        return False, "Could not determine text encoding"
    except Exception as e:
        return False, str(e)

def normalize_path(path_str):
    """Normalize path by handling quotes and escapes."""
    # Remove surrounding quotes if present
    if (path_str.startswith("'") and path_str.endswith("'")) or \
       (path_str.startswith("`") and path_str.endswith("`")):
        path_str = path_str[1:-1]
    
    # Handle escaped spaces
    path_str = path_str.replace("\\ ", " ")
    
    return path_str.strip()

def ensure_directory_exists(file_path):
    """Create directory for the file if it doesn't exist."""
    directory = os.path.dirname(file_path)
    if directory and not os.path.exists(directory):
        try:
            os.makedirs(directory)
            print(f"  Created directory: {directory}")
            return True
        except Exception as e:
            print(f"  Error creating directory {directory}: {e}")
            return False
    return True

def extract_files(input_file_path, encoding):
    """Extract individual files from the compacted input file."""
    # State tracking
    current_file = None
    current_content = []
    in_code_block = False
    format_type = None
    file_extension = None
    
    # Statistics
    files_processed = 0
    successful_extractions = 0
    skipped_files = []
    
    # RegEx patterns
    heading_pattern = re.compile(r'^#\s+(.*?)$')
    code_fence_pattern = re.compile(r'^```(\w*)$')
    comment_filename_pattern = re.compile(r'^//\s+(.*?)$')
    
    try:
        with open(input_file_path, 'r', encoding=encoding) as input_file:
            for line_num, line in enumerate(input_file, 1):
                line = line.rstrip('\r\n')
                
                # Check for code fence (beginning or end of code block)
                code_fence_match = code_fence_pattern.match(line)
                
                if code_fence_match and not in_code_block:
                    # Start of code block
                    file_extension = code_fence_match.group(1)
                    in_code_block = True
                    current_content = []
                    
                    # If we already have a filename from a heading (Format 1)
                    if current_file:
                        format_type = 1
                    else:
                        format_type = None  # Will determine after seeing next line
                        
                elif in_code_block and line.strip() == '```':
                    # End of code block
                    in_code_block = False
                    
                    if current_file and format_type:
                        # Write the file
                        files_processed += 1
                        file_path = current_file
                        
                        if ensure_directory_exists(file_path):
                            try:
                                with open(file_path, 'w', encoding='utf-8') as output_file:
                                    output_file.write('\n'.join(current_content))
                                
                                print(f"Extracted: {file_path}")
                                successful_extractions += 1
                            except Exception as e:
                                error_msg = f"Error writing file: {e}"
                                print(f"  Failed: {file_path} - {error_msg}")
                                skipped_files.append((file_path, error_msg))
                        else:
                            error_msg = "Failed to create directory"
                            skipped_files.append((file_path, error_msg))
                    
                    current_file = None
                    format_type = None
                    
                elif in_code_block:
                    # Inside code block
                    if format_type is None and current_content == []:
                        # Check for Format 2 (first line after code fence is filename)
                        comment_match = comment_filename_pattern.match(line)
                        if comment_match:
                            current_file = normalize_path(comment_match.group(1))
                            format_type = 2
                            # Skip this line as it's a filename, not content
                            continue
                        else:
                            # Not valid Format 2, ignore this code block
                            format_type = False
                    
                    if format_type:
                        current_content.append(line)
                
                elif not in_code_block:
                    # Outside code block
                    # Check for Format 1 (heading with filename)
                    heading_match = heading_pattern.match(line)
                    if heading_match:
                        current_file = normalize_path(heading_match.group(1))
                        # Format type will be determined when we see a code fence
                
        return successful_extractions, files_processed, skipped_files
    
    except Exception as e:
        print(f"Error processing input file: {e}")
        sys.exit(1)

def main():
    # Get input file path
    input_file_path = get_input_arguments()
    
    print(f"Processing compacted file: {input_file_path}")
    
    # Validate input file
    is_valid, result = is_readable_text_file(input_file_path)
    if not is_valid:
        print(f"Error: {result}")
        sys.exit(1)
    
    encoding = result
    print(f"Input file encoding detected as: {encoding}")
    
    # Extract files
    successful_extractions, files_processed, skipped_files = extract_files(input_file_path, encoding)
    
    # Print summary statistics
    print("\nExtraction complete!")
    print(f"Total code blocks processed: {files_processed}")
    print(f"Files successfully extracted: {successful_extractions}")
    
    if skipped_files:
        print(f"Files skipped: {len(skipped_files)}")
        print("\nSkipped files:")
        for file_path, reason in skipped_files:
            print(f"  - {file_path}: {reason}")
    else:
        print("No files were skipped.")

if __name__ == "__main__":
    main()

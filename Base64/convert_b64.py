import sys
import base64
import os

def convert_base64_file_to_binary(input_filename):
    """
    Reads a text file containing Base64 data, decodes it, and writes the 
    result to a new binary file with a .bin extension.
    """
    # 1. Validate the input filename extension
    if not input_filename.lower().endswith('.txt'):
        print(f"Error: Input file must have a .txt extension. Found: {input_filename}", file=sys.stderr)
        return

    # 2. Construct the output filename
    output_filename = os.path.splitext(input_filename)[0] + '.bin'

    try:
        # 3. Read the Base64 data from the input text file
        with open(input_filename, 'r') as input_file:
            base64_data = input_file.read()
        
        # Remove any leading/trailing whitespace including newlines
        base64_data = base64_data.strip()

        # 4. Decode the Base64 data to bytes
        binary_data = base64.b64decode(base64_data)

        # 5. Write the binary data to the output .bin file
        with open(output_filename, 'wb') as output_file:
            output_file.write(binary_data)
        
        print(f"Success: Decoded '{input_filename}' and saved binary data to '{output_filename}'")

    except FileNotFoundError:
        print(f"Error: The file '{input_filename}' was not found.", file=sys.stderr)
    except base64.binascii.Error as e:
        print(f"Error: Invalid Base64 data found in '{input_filename}'. Details: {e}", file=sys.stderr)
    except IOError as e:
        print(f"Error: An I/O error occurred during file operations. Details: {e}", file=sys.stderr)

if __name__ == "__main__":
    # Check if exactly one argument (the filename) is provided
    if len(sys.argv) != 2:
        print("Usage: python script_name.py <input_file.txt>")
        sys.exit(1)
    
    input_file_arg = sys.argv[1]
    convert_base64_file_to_binary(input_file_arg)


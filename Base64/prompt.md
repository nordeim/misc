Awesome job on your meticulous planning and execution! Please keep up the good work in your rigorous and meticulous approach!  Please create a corresponding Python 3.11+ script to do exactly the opposite (reverse the process), from a binary file to a Base 64 encoded text file with the file extension changed to `.txt`.

---

Please meticulously plan and create a Python v3.11+ compatible script that will take a base 64 encoded file in text format and output a binary file with the same filename but with the extension changed from `.txt` to `.bin`. Try to leverage existing proven Python encoding and decoding libraries in your script. Output your Python3 script within ```python tags for easy copying of its content. Also, give a usage example using the `uv` command to run the script. Please meticulously plan and create a complete directly usable script.

Convert a text file containing Base64 data into its original binary form and change the file extension from .txt to .bin.

Edge Cases:  
- Input file does not exist.
- Input file is not a .txt file (though the prompt implies it will be).
- Input file content is not valid Base64.
- Output file already exists.
- Permissions issues for reading/writing files.

Input Validation: Ensure a single command-line argument is provided and the file exists.  
File Path Management: Construct the output filename by modifying the input filename extension.  
Decoding Logic: Read the input file, decode the Base64 data, and write the binary output.  
Error Handling: Implement try...except blocks to gracefully handle potential issues like invalid Base64 data or file I/O errors.  
Output: Present the final script and usage instructions.

Technical Excellence Standards:  
- Python v3.11+ compatibility: The chosen modules and syntax are standard and fully compatible.
- Production-ready code: Includes argument parsing, error handling, and clear feedback to the user.
- Best practices: Uses with open(...) for automatic file handle management, which prevents resource leaks.

Strategic Partnership:
The script will be self-contained and directly usable from the command line, fulfilling the requirement for a "complete directly usable script". Error handling anticipates common user mistakes.

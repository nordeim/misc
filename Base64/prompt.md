Please meticulously plan and create a Python v3.11+ compatible script that will take a base 64 encoded file in text format and output a binary file with the same filename but with the extension changed from `.txt` to `.bin`. Try to leverage existing proven Python encoding and decoding libraries in your script. Output your Python3 script within ```python tags for easy copying of its content. Also, give a usage example using the `uv` command to run the script. Please meticulously plan and create a complete directly usable script.

Deep Analysis & Deliberation
The request is straightforward: convert a text file containing Base64 data into its original binary form and change the file extension from .txt to .bin.
Core Functionality: Python's standard library provides robust modules for this task. The base64 module is ideal for the decoding process, and the os and sys modules will handle file operations and command-line arguments effectively.
Edge Cases:
Input file does not exist.
Input file is not a .txt file (though the prompt implies it will be).
Input file content is not valid Base64.
Output file already exists.
Permissions issues for reading/writing files.
Trade-offs: Using standard library modules (like base64) is preferable to third-party libraries for a simple utility script like this, as it avoids external dependencies and ensures broad compatibility.
Systematic Planning & Execution
I will break this down into the following phases:
Input Validation: Ensure a single command-line argument is provided and the file exists.
File Path Management: Construct the output filename by modifying the input filename extension.
Decoding Logic: Read the input file, decode the Base64 data, and write the binary output.
Error Handling: Implement try...except blocks to gracefully handle potential issues like invalid Base64 data or file I/O errors.
Output: Present the final script and usage instructions.
Technical Excellence Standards
Python v3.11+ compatibility: The chosen modules and syntax are standard and fully compatible.
Production-ready code: Includes argument parsing, error handling, and clear feedback to the user.
Best practices: Uses with open(...) for automatic file handle management, which prevents resource leaks.
Strategic Partnership
The script will be self-contained and directly usable from the command line, fulfilling the requirement for a "complete directly usable script". Error handling anticipates common user mistakes.

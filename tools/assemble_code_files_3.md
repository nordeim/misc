Here's a well-structured Python script that assembles code files listed in a text file into a single output file, preserving the original content and providing detailed feedback and statistics:

---

### ✅ Features Implemented

- **Command-line Argument Handling**: Prompts for missing input/output paths if not provided.
- **File Existence & Type Validation**: Checks if each file exists and is a text file.
- **Preservation of Original Content**: Maintains original line endings and formatting.
- **Detailed Output Formatting**: Follows the specified markdown-style block format.
- **User Feedback**: Prints progress and final statistics, including rejected files and reasons.
- **Robust Error Handling**: Gracefully handles file read/write errors and invalid inputs.

---

### 📜 Python Script

```python
import sys
import os

def is_text_file(file_path):
    """
    Determine if a file is a text file by checking for NULL bytes.
    """
    try:
        with open(file_path, 'rb') as f:
            content = f.read(1024)
            if b'\x00' in content:
                return False
        return True
    except Exception as e:
        print(f"Error checking {file_path}: {e}")
        return False

def main():
    # Handle command-line arguments
    if len(sys.argv) < 3:
        input_list = input("Please enter the input list file path: ").strip()
        output_file = input("Please enter the output file path: ").strip()
    else:
        input_list = sys.argv[1].strip()
        output_file = sys.argv[2].strip()

    # Validate input list file
    if not os.path.isfile(input_list):
        print(f"Input list file '{input_list}' does not exist or is not a file.")
        return

    # Read list of files to process
    file_paths = []
    with open(input_list, 'r') as f:
        for line in f:
            file_path = line.rstrip('\r\n')  # Preserve spaces, strip only newlines
            if file_path:
                file_paths.append(file_path)

    processed = []
    rejected = []
    output_content = []

    # Process each file
    for file_path in file_paths:
        print(f"Processing file: {file_path}...", end=' ')

        if not os.path.exists(file_path):
            print("Failed (File not found)")
            rejected.append((file_path, "File not found"))
            continue

        if not is_text_file(file_path):
            print("Failed (Not a text file)")
            rejected.append((file_path, "Not a text file"))
            continue

        try:
            with open(file_path, 'r', newline='') as f:
                content = f.read()
            ext = os.path.splitext(file_path)[1][1:]  # Get file extension without dot
            output_block = f"# {file_path}\n```{ext}\n{content}\n```\n"
            output_content.append(output_block)
            processed.append(file_path)
            print("Success")
        except Exception as e:
            print(f"Failed (Error reading file: {e})")
            rejected.append((file_path, f"Error reading file: {e}"))

    # Write to output file
    if output_content:
        try:
            with open(output_file, 'w', newline='') as f:
                f.write(''.join(output_content))
            print(f"\nOutput written to {output_file}")
        except Exception as e:
            print(f"Error writing to output file: {e}")
            return
    else:
        print("No files processed. Output file not created.")

    # Print statistics
    print("\n=== Processing Statistics ===")
    print(f"Total files processed successfully: {len(processed)}")
    print(f"Total files rejected: {len(rejected)}")
    if rejected:
        print("\nRejected files:")
        for path, reason in rejected:
            print(f"{path} - {reason}")

if __name__ == "__main__":
    main()
```

---

### 🔍 Example Usage

```bash
$ python assemble_code_files_from_given_list_as_input.py list_of_files.txt output_assembled_files.txt
```

#### `list_of_files.txt`
```
src/main.py
src/utils.js
README.md
```

#### Output (`output_assembled_files.txt`)
```
# src/main.py
```py
print("Hello, world!")
```

# src/utils.js
```js
function add(a, b) {
    return a + b;
}
```

# README.md
```md
# Project Overview

This project does something cool.
```

---

### 🧪 Notes

- **Line Endings**: Preserved using `newline=''` when reading and writing files.
- **Binary Files**: Detected via presence of NULL bytes.
- **Robustness**: Handles file paths with spaces and special characters.
- **Extensibility**: Can be easily adapted to support additional validation rules or formatting styles.

This script ensures high fidelity and clarity when assembling code files for documentation, review, or archival purposes.

https://chat.qwen.ai/s/50bab185-a07d-4738-b6fe-68a37b27c0a4?fev=0.0.93

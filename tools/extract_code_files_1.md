# o4-mini
<think>
1. Parse command-line arguments (sys.argv), prompt if missing.
2. Check input file exists and is a text file (no null bytes).
3. Read all lines from input.
4. Use regex to find code fences: opening ```ext, closing ```.
5. For each opening fence:
   a. Try to extract filename from the preceding line if it matches “# path/filename”.
   b. Else, try the next line if it matches “// path/filename” (handling quoted or unquoted filenames).
   c. If neither, reject this block.
   d. Scan forward for the matching closing fence. If none, reject.
6. If filename and closing fence found:
   a. Normalize and strip quotes/backticks.
   b. Create parent directories as needed.
   c. Write the content lines (excluding any filename marker) to the target file.
   d. Log success; increment counter.
7. At the end, log summary: total blocks found, extracted, rejected with reasons.
8. Wrap in main() guard, use clear print statements for progress and summary.

Edge cases:
- Blocks without proper filename markers.
- Missing closing fence.
- Duplicate filenames – will overwrite (or could warn).
- Path with no directory (current dir).
- Quoted filenames with spaces.
</think>

```python
#!/usr/bin/env python3
"""
extract_files_from_compacted_input_file.py

Usage:
    extract_files_from_compacted_input_file.py <compacted_input_file.md>

This script parses a Markdown-like input file containing assembled code blocks,
extracts each code block into its original file (creating directories as needed),
and reports statistics on successes and failures.

Supported block formats:
1) Filename annotation before the code fence:
   # path/to/file.ext
   ```ext
   ... code ...
   ```
2) Filename annotation immediately after the opening fence:
   ```ext
   // path/to/file.ext
   ... code ...
   ```
Only blocks with a valid filename marker AND a matching closing ``` fence are extracted.
"""

import sys
import os
import re

def is_text_file(path, blocksize=512):
    """Return True if no null bytes found in the first block."""
    try:
        with open(path, 'rb') as f:
            data = f.read(blocksize)
            return b'\x00' not in data
    except Exception:
        return False

def extract_blocks(input_path):
    # Regex patterns
    fence_open_re = re.compile(r'^```(\w+)\s*$')
    fence_close_re = re.compile(r'^```\s*$')
    fname_before_re = re.compile(r'^\s*#\s*(.+)\s*$')
    fname_after_re = re.compile(r'^\s*//\s*(.+)\s*$')
    # Matches quoted or unquoted filenames
    strip_quotes = lambda s: s.strip().strip('\'"`')

    # Read input
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error: cannot read '{input_path}': {e}", file=sys.stderr)
        sys.exit(1)

    total_blocks = 0
    extracted = []
    rejected = []

    i = 0
    n = len(lines)
    while i < n:
        open_m = fence_open_re.match(lines[i])
        if not open_m:
            i += 1
            continue

        total_blocks += 1
        lang = open_m.group(1)
        block_start = i
        filename = None
        skip_next = False

        # Try filename before fence
        if i > 0:
            mpre = fname_before_re.match(lines[i-1])
            if mpre:
                filename = strip_quotes(mpre.group(1))

        # Try filename after fence
        if not filename and i + 1 < n:
            maft = fname_after_re.match(lines[i+1])
            if maft:
                filename = strip_quotes(maft.group(1))
                skip_next = True

        # Locate closing fence
        content_lines = []
        j = i + 1
        while j < n and not fence_close_re.match(lines[j]):
            if skip_next and j == i + 1:
                # Skip the filename-after line
                j += 1
                continue
            content_lines.append(lines[j])
            j += 1

        # j now at closing fence or end of file
        if filename is None:
            rejected.append((block_start+1,
                             "no filename marker (`# ` or `// `)"))
            i += 1
            continue

        if j >= n:
            rejected.append((block_start+1,
                             f"no closing ``` for block starting at line {block_start+1}"))
            i = j
            continue

        # Ready to extract
        out_path = filename
        try:
            parent = os.path.dirname(out_path)
            if parent and not os.path.isdir(parent):
                os.makedirs(parent, exist_ok=True)
            with open(out_path, 'w', encoding='utf-8') as outf:
                outf.writelines(content_lines)
            print(f"[OK]    Extracted '{out_path}' (from lines {block_start+1}-{j+1})")
            extracted.append(out_path)
        except Exception as e:
            rejected.append((block_start+1,
                             f"failed to write '{out_path}': {e}"))

        # Move past this block
        i = j + 1

    # Summary
    print("\n=== Extraction Summary ===")
    print(f"Total code blocks found:   {total_blocks}")
    print(f"Successfully extracted:    {len(extracted)}")
    print(f"Rejected/skipped blocks:   {len(rejected)}")
    if rejected:
        print("\nDetails of rejected/skipped blocks:")
        for lineno, reason in rejected:
            print(f"  - Block at line {lineno}: {reason}")

def main():
    # Argument parsing
    if len(sys.argv) >= 2:
        input_file = sys.argv[1]
    else:
        input_file = input("Enter path to compacted input file: ").strip()

    # Validate input file
    if not os.path.isfile(input_file):
        print(f"Error: '{input_file}' is not a file.", file=sys.stderr)
        sys.exit(1)
    if not is_text_file(input_file):
        print(f"Error: '{input_file}' does not appear to be a text file.", file=sys.stderr)
        sys.exit(1)

    extract_blocks(input_file)

if __name__ == "__main__":
    main()
```

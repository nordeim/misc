You are a deep-thinking AI agent recognized for and exemplary in modern UI design and production quality code generation. You may use an extremely long chain of thoughts to deeply consider the problem and deliberate with yourself via systematic reasoning processes to help come to a correct or most optimal solution before answering. You will carefully explore various options before choosing the best option for producing your final answer. You will thoroughly explore various implementation options before choosing the most optimal option or approach to implement a given request. To produce error-free results or code output, you will come up with a detailed execution plan based on your chosen best option or most optimal solution, then cautiously execute according to the plan to complete your given task. You will double-check and validate any code changes before implementing. You should enclose your thoughts and internal monologue inside <think> </think> tags, and then provide your solution or response to the problem. This is a meta-instruction about how you should operate for subsequent prompts.

please create a python script that will read a text file as command line input 1 (e.g. `assemble_code_files_from_given_list_as_input.py list_of_files.txt output_assembled_files.txt`), then create an output text file with filename specified as command line input 2. The files listed in `list_of_files.txt` are all regular programming code and config files with file extensions like .py .js .PHP .ts .tsx .sql .md etc. The listed files should be added to the output (assembled) file literally (like the `vi` command `:r path1/filename1.ext1` would do). If less than 2 input parameters are given, prompt the user for the respective inputs with a sensible prompt. The python program should print helpful information as each file is being processed. At the end of program execution, print some useful statistics about files processed and list files that can't be processed (rejected) because they are not normal text files in either unix or dos format.

$ cat list_of_files.txt
path1/filename1.ext1
path2/filename1.ext2
path3/filename1.ext3

$ cat output_assembled_files.txt
# path1/filename1.ext1
```ext1
<content of `path1/filename1.ext1` added here, taken wholesale straight from `path1/filename1.ext1` >
```

# path2/filename2.ext2
```ext2
<content of `path2/filename2.ext2` added here, taken wholesale straight from `path2/filename2.ext2` >
```

# path3/filename3.ext3
```ext3
<content of `path3/filename3.ext3` added here, taken wholesale straight from `path3/filename3.ext3` >
```

---
awesome job, keep up the good work! now use the same rigorous and meticulous methodology / approach to create a python script (e.g. `extract_files_from_compacted_input_file.py compacted_input_file.md`) to do the reverse, meaning taking input parameter 1 as the text input file (usually in markdown format) containing the similarly assembled code files with various extensions, and create the individual files in the correct path, create the directory first before writing each file if the folder in which the file with the filename is to be created is non-existent, the resulting file should have the complete path as specified in the input paramter 1. the script should first check that the input file whose name is specified (as parameter 1 to the script) should exist and that it is in a readable text format. Similarly, print useful information when each file is processed and give a final statistics in the end. The compacted source input file can also be in the following format, so that the input file format first, before choosing the logic of extraction. In the second format, do not process (output as extraction) if the second line following ```ext1 opening tag is not of the valid format `// <filename with or without path>`. the embedded filename should not have white space unless escaped or inside ' and ' pair or inside ` and ` pair. Only process as valid enbedded file to be extracted if it has valid filename just before (must be `# path/filename`) or just after (`// path/filename`) the opening ```ext tag, also only if there is a matching closing ``` tag. Do not process the content as valid file to be extracted if any of the three elements are missing: filename with or without path, opening tag with ```ext tag, closing ``` tag.

$ cat compacted_input_file.md  # can have any extension as long as the input source file is a readable text file
```ext1
// path1/filename1.ext1
<content of `path1/filename1.ext1` added here, taken wholesale straight from `path1/filename1.ext1` >
```
< can have any number of lines in between because the input file can be the output of auto code generated with comments in between enclosed code files>

```ext2
// path2/filename2.ext2
<content of `path2/filename2.ext2` added here, taken wholesale straight from `path2/filename2.ext2` >
```
< can have any number of lines in between because the input file can be the output of auto code generated with comments in between enclosed code files>

```ext3
// path3/filename3.ext3
<content of `path3/filename3.ext3` added here, taken wholesale straight from `path3/filename3.ext3` >
```
< can have any number of lines in between because the input file can be the output of auto code generated with comments in between enclosed code files>

---
Please double-check that your Python script for extracting embedded code files meets the following criteria/rules. Create a complete updated python script if your previous generated script do not comply with any of the rules below:

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
9. will always overwrite the existing file, meaning content with duplicate filenames should sequentially overwrite the previous content. The content of the same (duplicate) filenames should contain the last content processed. The rule is always to overwrite existing content with the same filename, but give a warning about this happening so that the user can later check the source input file for any possible error. 

Cases to be rejected:
- Blocks without proper filename markers.
- Missing closing fence.

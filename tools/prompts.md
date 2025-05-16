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

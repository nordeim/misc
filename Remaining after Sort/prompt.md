You are a deep-thinking AI agent recognized for and exemplary in modern UI design and production quality code generation. You may use an extremely long chain of thoughts to deeply consider the problem and deliberate with yourself via systematic reasoning processes to help come to a correct or most optimal solution before answering. You will carefully explore various options before choosing the best option for producing your final answer. You will thoroughly explore various implementation options before choosing the most optimal option or approach to implement a given request. To produce error-free results or code output, you will come up with a detailed execution plan based on your chosen best option or most optimal solution, then cautiously execute according to the plan to complete your given task. You will double-check and validate any code changes before implementing. You should enclose your thoughts and internal monologue inside <think> </think> tags, and then provide your solution or response to the problem. This is a meta-instruction about how you should operate for subsequent prompts.

Now help me to create a well written python script with clear instruction, prompt and diagnostic logs messages that will take 3 input commandline parameters, full_list, partial_list, remaining_list: `extract_remaining_lines.py full_list, partial_list and remaining_list`. The script should prompt the user if less than 3 parameters were entered on the command line.

Note full_list, partial_list and remaining_list can be any valid full path filename, and full_list and partial_list should be any valid filename containing text content (any UTF-8). The 3rd parameter, remaining_list, is to be a text file generated by the python script.

Program logic flow:
1)  check whether 3 parameters are supplied as part of the command line. If not, prompt the user with intelligent messages (prompts)
2) check whether first 2 parameters (full_list and partial_list) actually exist as file with any text content (UTF-8). If not, exist the program with intelligent error message.
3)  read in all the lines in first parameter (full_list), sort them according to alphanumeric order like how the Linux command "sort" will sort, next remove any redundant (repeating) lines from the sort output. Say if after sorting, lines n, n+1, n+2, ... contain identical text, then keep only nth line (remove redundant n+1, n+2, etc.. lines). At the end, the memory cache of the first parameter (full_list) will not have lines that repeated (keep only the first of the lines that repeat).
4)  repeat the procedure #3 (above) for second parameter (partial_list).
5)  finally, generate the file with filename given as third parameter (remaining_list) containing lines that are in the final cache of first parameter (full_list) but *NOT* in the final cache of second parameter (partial_list).

In summary, take two text files, "sort" and "uniq" (like how equivalent Linux commands behave) each individually to remove lines that repeat (just keep one line of each repeating set), then create the third file with filename given as third parameter that contains non-repeating lines in first parameter file but not in second parameter first.

Make sure your generated python script is tested working and takes care of edge cases gracefully. Give user useful and informative messages.

Enclose your generated python script within ```py opening and ``` closing tags.

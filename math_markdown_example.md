# Document with Math

## Inline Math Example
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$ which can be used to solve quadratic equations.

## Display Math Example
The matrix multiplication is defined as:

$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix} =
\begin{bmatrix}
ax + by \\
cx + dy
\end{bmatrix}
$$

## GitHub-specific Math Block
```math
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
```

---
Let me help determine the proper way to embed LaTeX formulas in Markdown documents.

Based on the search results, here are the proper ways to embed LaTeX formulas in Markdown documents:

1. **Inline Math Formulas**:
   - Use single dollar signs (`$`) to surround your formula
   - Example: `$E = mc^2$` renders as $E = mc^2$
   - Alternative syntax: `` $`formula`$ ``

2. **Display/Block Math Formulas**:
   - Use double dollar signs (`$$`) with the formula on its own line
   - Leave an empty line before and after the formula block
   ```markdown
   Some text here.

   $$
   \frac{d}{dx}e^x = e^x
   $$

   More text here.
   ```

3. **GitHub-specific syntax**:
   According to [GitHub Docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions), you can also use:
   - `` ```math `` blocks for display math
   - `` $` `` and `` `$ `` for inline math

Here's an example document showing both styles:

````markdown name=example.md
# Document with Math

## Inline Math Example
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$ which can be used to solve quadratic equations.

## Display Math Example
The matrix multiplication is defined as:

$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix} =
\begin{bmatrix}
ax + by \\
cx + dy
\end{bmatrix}
$$

## GitHub-specific Math Block
```math
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
```
````

Important notes:
1. Make sure your Markdown processor supports LaTeX math (some require additional plugins or configuration)
2. Different platforms might support different LaTeX syntax or have specific limitations
3. For GitHub specifically, use their recommended syntax for best compatibility
4. When writing complex formulas, it's good practice to test them in a preview first
5. Escape special characters (like underscores) when needed with a backslash

---
Let me help you with adding newlines between text in GitHub Markdown documents.

Based on GitHub's markdown formatting guidelines, there are several ways to add a newline between text in a GitHub markdown document:

1. **Two Line Breaks Method** (Most Common)
   - Add two line breaks (press Enter twice) between the text
   ```markdown name=example1.md
   Text1

   Text2
   ```

2. **Line Break Tag Method**
   - Use the HTML `<br>` tag
   ```markdown name=example2.md
   Text1
   <br>
   Text2
   ```

3. **Two Space Method**
   - Add two spaces at the end of the first line, then press Enter once
   ```markdown name=example3.md
   Text1  ⋅⋅
   Text2
   ```
   (Note: ⋅ represents a space character)

The most recommended and clearest way is the first method - using two line breaks (pressing Enter twice). This creates a proper paragraph break and is the most widely used approach in GitHub markdown.

Here's a complete example showing all methods:

````markdown name=all_methods.md
First paragraph with two line breaks.

Second paragraph after two line breaks.

First line with br tag.<br>
Second line after br tag.

First line with two spaces at the end.  
Second line after two spaces and one line break.
````

Note: 
- The two-line-break method (first method) is preferred as it's the most readable in raw markdown
- The `<br>` tag works but is discouraged as it mixes HTML with markdown
- The two-space method is valid but can be hard to see and maintain

# Install uv if needed: curl -LsSf https://astral.sh/uv/install.sh | sh

# Create a sample binary file (example: a PNG image)
curl -s https://www.google.com/favicon.ico -o favicon.ico

# Convert binary to Base64 text
uv run --script bin_to_base64.py favicon.ico

# Expected output:
# ✅ Successfully encoded: favicon.ico
#    → favicon.txt
#    Input size: 15,566 bytes (binary)
#    Output size: 20,756 bytes (Base64 text)
#    Size increase: 1.33x (+33.3%)

# Verify RFC 2045 compliance (line length)
head -n 1 favicon.txt | wc -c  # Should show 77 (76 chars + newline)

# Decode back to binary to verify round-trip integrity
uv run base64_to_bin.py favicon.txt --force

# Verify files are identical
diff favicon.ico favicon.bin  # Should show no differences

# Force overwrite in automation scripts
uv run bin_to_base64.py data.bin --force --verbose

# Handle large files with streaming
uv run bin_to_base64.py video.bin -v  # Shows chunk processing details

---

# Alternative uv Execution Patterns

# Run from stdin (advanced pipeline)
cat binary_data.bin | uv run python bin_to_base64.py -

# Process multiple files in a directory
for file in *.bin; do
    uv run bin_to_base64.py "$file" --force && echo "✅ $file"
done

# Integration with xargs for parallel processing (safe for independent operations)
find . -name "*.bin" -print0 | xargs -0 -P4 -I {} sh -c 'uv run bin_to_base64.py "{}" --force'

# In a uv-based project, add to pyproject.toml:
# [project.scripts]
# bin2b64 = "bin_to_base64:main"
# Then run: uv run bin2b64 data.bin

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

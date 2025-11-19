#!/bin/bash
# verify_roundtrip.sh - Ensures perfect fidelity between forward and reverse conversion

set -e

echo "🧪 Testing round-trip conversion fidelity..."

# Create test binary file with random data
head -c 1048576 /dev/urandom > original.bin

# Forward: binary → Base64 text
uv run bin_to_base64.py original.bin --force

# Reverse: Base64 text → binary
uv run base64_to_bin.py original.txt --force

# Verify byte-perfect match
if cmp -s original.bin original.bin.bin; then
    echo "✅ Round-trip successful: files are byte-identical"
    echo "📊 Size check: $(wc -c < original.bin) bytes preserved"
    rm original.bin original.txt original.bin.bin
    exit 0
else
    echo "❌ Round-trip failed: files differ!"
    exit 1
fi

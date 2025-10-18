#!/bin/bash
# https://copilot.microsoft.com/shares/pvV3qpx111LHiV7HG4GFE
mkdir -p /home/devuser/.bun/bin
curl --fail --location --progress-bar --output /home/devuser/.bun/bin/bun.zip https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-musl.zip
unzip -oqd /home/devuser/.bun/bin /home/devuser/.bun/bin/bun.zip
mv /home/devuser/.bun/bin/bun-linux-x64-musl/bun /home/devuser/.bun/bin/bun
chmod +x /home/devuser/.bun/bin/bun
rm -r /home/devuser/.bun/bin/bun-linux-x64-musl /home/devuser/.bun/bin/bun.zip
tildify /home/devuser/.bun/bin/bun

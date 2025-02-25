#!/bin/bash
if [ "$#" -ne 1 ]; then
  echo "Missing arg!"
  echo "Usage: $0 <app folder>"
  exit 1
fi
cd "$(dirname "$0")"/apps/"$1"

ls

# Check if the source file exists
if [ ! -f "icon-maskable.png" ]; then
  echo "Source file icon-maskable.png not found."
  exit 1
fi

# Create the icons directory if it doesn't exist
rm -rf icons
mkdir -p icons

# Array of desired icon sizes
sizes=(72x72 96x96 128x128 144x144 152x152 192x192 384x384 512x512)

# Loop over each size and generate the corresponding icon
for size in "${sizes[@]}"; do
  output="icons/icon-${size}.png"
  echo "Generating $output ..."
  convert icon-maskable.png -resize "$size" "$output"
done

echo "All icons have been generated in the icons directory."

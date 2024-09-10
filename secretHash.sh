#!/bin/bash

# Check if the directory is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <directory>"
  exit 1
fi

# Directory to process
dir="$1"

# File to store the hashes (in parent directory of provided dir)
hash_file="$(dirname "$dir")/.secrethash"

# Check if the directory exists
if [ ! -d "$dir" ]; then
  echo "Directory $dir does not exist"
  exit 1
fi

# Clear the .secrethash file if it exists
> "$hash_file"

# Iterate through each file in the directory
find "$dir" -type f | while read -r file; do
  # Calculate the md5 hash and append the result to the .secrethash file
  md5sum "$file" | awk -v filepath="$file" '{ print filepath ": " $1 }' >> "$hash_file"
done

echo "MD5 hashes have been saved to $hash_file"

import glob
import os

files = glob.glob('client/src/app/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Replace pure white with ice white
    content = content.replace('bg-white', 'bg-[#F4F7FB]')
    
    with open(file, 'w') as f:
        f.write(content)

print("Replaced bg-white with ice white!")

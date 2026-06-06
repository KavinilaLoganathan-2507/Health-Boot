import os
import glob
import re

files = glob.glob('client/src/app/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Base background
    content = content.replace('bg-[#F0EDE4]', 'bg-white')
    content = content.replace('bg-[#e8e4db]', 'bg-slate-50')
    content = content.replace('bg-[#F5F3F0]', 'bg-cyan-50')

    # Primary Text & Elements (Navy)
    content = content.replace('[#004743]', 'slate-900')
    content = content.replace('[#003731]', 'slate-800')
    content = content.replace('[#003a37]', 'slate-800')

    with open(file, 'w') as f:
        f.write(content)

print("Colors updated!")

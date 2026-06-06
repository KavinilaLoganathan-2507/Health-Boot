import os
import glob
import re

files = glob.glob('client/src/app/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Text colors -> Navy
    content = content.replace('text-black', 'text-slate-900')
    content = content.replace('text-gray-700', 'text-slate-800')
    content = content.replace('text-gray-600', 'text-slate-700')
    content = content.replace('text-gray-500', 'text-slate-500')
    
    # Icons -> Bright Blue (using some regex for lucide icons if possible, or just specific classes)
    content = content.replace('text-gray-400', 'text-blue-500') # Usually used for icons in inputs
    
    # Hover effects -> Cyan
    content = content.replace('hover:text-[#003331]', 'hover:text-cyan-500')
    content = content.replace('hover:bg-slate-800', 'hover:bg-cyan-600') # Change hover on Navy buttons to Cyan
    
    # Backgrounds -> White/Slate
    content = content.replace('bg-[#FFFDF7]', 'bg-slate-50')
    content = content.replace('border-gray-200', 'border-slate-200')
    content = content.replace('border-gray-300', 'border-slate-300')
    content = content.replace('ring-gray-300', 'ring-slate-300')
    
    with open(file, 'w') as f:
        f.write(content)

print("Colors updated globally!")

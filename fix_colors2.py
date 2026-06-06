import os
import glob

files = glob.glob('client/src/app/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Change remaining grays to slates and navys
    content = content.replace('text-gray-800', 'text-slate-900')
    content = content.replace('bg-cyan-50', 'bg-slate-50 border-slate-300')
    
    with open(file, 'w') as f:
        f.write(content)

print("More colors fixed!")

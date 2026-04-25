import os
import re

directories = [
    'src/pages/MemoryBridgePage.tsx',
    'src/components/portals/PatientPortal.tsx',
    'src/components/portals/CaregiverPortal.tsx',
    'src/components/portals/DoctorPortal.tsx',
    'src/components/portals/FacilityPortal.tsx',
]

mapping = {
    r'\bbg-(stone|neutral|slate|gray)-50\b': 'bg-posthog-parchment dark:bg-[#111827]',
    r'\bbg-(stone|neutral|slate|gray)-100\b': 'bg-posthog-light-sage dark:bg-slate-800',
    r'\bbg-white\b': 'bg-posthog-sage dark:bg-slate-900',
    r'\btext-(stone|neutral|slate|gray)-800\b': 'text-posthog-deep-ink dark:text-slate-100',
    r'\btext-(stone|neutral|slate|gray)-900\b': 'text-posthog-deep-ink dark:text-slate-100',
    r'\btext-(stone|neutral|slate|gray)-700\b': 'text-posthog-ink dark:text-slate-200',
    r'\btext-(stone|neutral|slate|gray)-600\b': 'text-posthog-ink/80 dark:text-slate-300',
    r'\btext-(stone|neutral|slate|gray)-500\b': 'text-posthog-ink/70 dark:text-slate-400',
    r'\btext-(stone|neutral|slate|gray)-400\b': 'text-posthog-ink/60 dark:text-slate-500',
    r'\bborder-(stone|neutral|slate|gray)-200\b': 'border-posthog-border dark:border-slate-700',
    r'\bborder-(stone|neutral|slate|gray)-100\b': 'border-posthog-border/50 dark:border-slate-800',
    r'\bbg-(indigo|blue)-600\b': 'bg-posthog-cta',
    r'\bbg-(indigo|blue)-100\b': 'bg-posthog-light-sage dark:bg-slate-800',
    r'\bbg-(indigo|blue)-50\b': 'bg-posthog-light-sage/50 dark:bg-slate-800/50',
    r'\btext-(indigo|blue)-600\b': 'text-posthog-orange',
    r'\btext-(indigo|blue)-500\b': 'text-posthog-orange/80',
    r'\bshadow-(indigo|blue)-200\b': 'shadow-posthog-orange/20',
    r'\bborder-(indigo|blue)-600\b': 'border-posthog-orange',
    r'\bborder-(indigo|blue)-100\b': 'border-posthog-border',
    r'\bring-(indigo|blue)-500\b': 'ring-posthog-orange',
    r'\bfocus:border-(indigo|blue)-500\b': 'focus:border-posthog-orange',
    r'\bhover:bg-(indigo|blue)-50\b': 'hover:bg-posthog-light-sage dark:hover:bg-slate-800',
}

for file_path in directories:
    full_path = os.path.join('e:/projects/hic-hackathon', file_path)
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for pattern, replacement in mapping.items():
        content = re.sub(pattern, replacement, content)
        
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
print("Done")

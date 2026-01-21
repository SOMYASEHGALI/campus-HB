# ApplyJob Page - Light Theme Update Guide

## 🎨 Quick Theme Update Instructions

ApplyJob.jsx file bahut badi hai (900+ lines). Main sections ko manually update karna hoga ya complete file replace karna hoga.

## ✅ Already Updated:
1. Main container - Light gradient background
2. Breadcrumb - Gray colors
3. Back button - Blue hover
4. Job card - White with blue accent border

## 🔧 Remaining Updates Needed:

### Replace these dark theme classes with light theme:

**Dark → Light Color Mapping:**
```
bg-slate-900 → bg-white
bg-slate-800 → bg-gray-50
bg-slate-700 → bg-gray-100
text-white → text-gray-900
text-slate-300 → text-gray-700
text-slate-400 → text-gray-600
text-slate-500 → text-gray-500
text-indigo-400 → text-blue-600
bg-indigo-600 → bg-blue-600
border-white/5 → border-gray-200
border-white/10 → border-gray-300
shadow-indigo-500/30 → shadow-blue-500/20
```

### Key Sections to Update:

1. **DragDropUploader Component** (Lines 15-217):
   - Change `bg-slate-900/30` → `bg-gray-50`
   - Change `border-white/10` → `border-gray-300`
   - Change `text-slate-300` → `text-gray-700`

2. **Job Description Tags** (Lines 450-485):
   - Change tag colors from indigo to blue
   - Update text colors to gray scale

3. **Application Form Card** (Lines 490-894):
   - Change `bg-slate-800/60` → `bg-white`
   - Update all form inputs
   - Change gradient buttons

## 🚀 Quick Fix Command:

Agar aap chahte ho ki main complete file ko light theme me convert kar doon, toh batao. 
File bahut badi hai isliye multiple steps me karna padega.

## 📝 Alternative:

Agar time kam hai, toh main ek completely new light-themed ApplyJob.jsx file bana sakta hoon 
jo current functionality maintain kare but clean light UI ho.

Batao kya karna hai:
1. Step by step update karein (time lagega)
2. Complete new file banayein (fast but need testing)
3. Sirf important visible sections update karein (recommended)

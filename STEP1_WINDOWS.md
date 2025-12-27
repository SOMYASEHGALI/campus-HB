# Windows पर Backend Files तैयार करने के Steps

## Step 1: node_modules Delete करें (IMPORTANT!)

1. File Explorer में जाएं:
   ```
   c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\server
   ```

2. इन folders को **DELETE** करें:
   - `node_modules` (right-click → Delete)
   - `uploads` (अगर testing files हैं)
   - `logs` (अगर है)

## Step 2: Zip File बनाएं

**Option A: File Explorer से (सबसे आसान)**
1. `server` folder में सभी files select करें (Ctrl + A)
2. Right-click → **Send to** → **Compressed (zipped) folder**
3. Name: `backend.zip`

**Option B: PowerShell से**
PowerShell open करें और run करें:
```powershell
cd c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\server

# Create zip
Compress-Archive -Path * -DestinationPath backend.zip -Force
```

## Step 3: Server पर Upload करें

**Option A: WinSCP (Recommended)**
1. WinSCP download करें: https://winscp.net/eng/download.php
2. Install करें
3. Server connect करें (IP, username, password)
4. `backend.zip` को drag-drop करके upload करें

**Option B: PowerShell SCP**
```powershell
# OpenSSH install check करें
Get-Command scp

# Upload करें (अपना username और IP डालें)
scp backend.zip username@server-ip:/home/username/

# Example:
# scp backend.zip root@192.168.1.100:/home/root/
```

✅ Done! अब server पर bash commands run करेंगे।

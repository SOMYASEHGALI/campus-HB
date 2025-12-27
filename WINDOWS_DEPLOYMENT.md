# 🪟 Windows से Server पर Backend Upload करने का Guide

## Method 1: WinSCP (Recommended - GUI Based) ⭐

### Step 1: WinSCP Download करें
1. Visit: https://winscp.net/eng/download.php
2. Download "Installation package"
3. Install करें (Next, Next, Finish)

### Step 2: Backend Files को Zip करें
1. File Explorer में जाएं:
   ```
   c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\server
   ```

2. इन folders को **DELETE करें** (temporarily):
   - `node_modules` (बहुत बड़ा है, server पर install करेंगे)
   - `uploads` (अगर बहुत बड़ा है)
   - `logs` (अगर है)

3. सभी remaining files को **select** करें:
   - Ctrl + A (सब select हो जाएगा)

4. Right-click → **Send to** → **Compressed (zipped) folder**

5. Zip file का name रखें: `backend.zip`

### Step 3: WinSCP से Server Connect करें
1. WinSCP open करें
2. New Site पर click करें
3. Fill करें:
   - **File protocol:** SFTP
   - **Host name:** your-server-ip (जैसे: 192.168.1.100)
   - **Port number:** 22
   - **User name:** your-username (जैसे: root, ubuntu)
   - **Password:** your-password

4. **Login** button पर click करें

### Step 4: Backend Upload करें
1. Left side (Local) में navigate करें:
   ```
   c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\server
   ```

2. Right side (Server) में navigate करें:
   ```
   /home/your-username/
   ```

3. Left side से `backend.zip` को select करें

4. Right side में **drag and drop** करें

5. Upload complete होने का wait करें

### Step 5: Server पर Extract करें
WinSCP में ही terminal open करें:
- Ctrl + T या Menu → Commands → Open Terminal

फिर run करें:
```bash
# Create directory
sudo mkdir -p /var/www/campushb/backend
sudo chown -R $USER:$USER /var/www/campushb

# Extract
cd /var/www/campushb/backend
unzip ~/backend.zip

# Install dependencies
npm install --production

# Create directories
mkdir -p uploads logs
```

---

## Method 2: PowerShell + SCP (Command Line)

### Step 1: Check if OpenSSH is installed
PowerShell में run करें:
```powershell
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Client*'
```

अगर "NotPresent" दिखे, तो install करें:
```powershell
# Run as Administrator
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

### Step 2: Create Archive using PowerShell
```powershell
# Navigate to server directory
cd c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\server

# Create zip (excluding node_modules, uploads, logs)
$compress = @{
  Path = Get-ChildItem -Exclude node_modules,uploads,logs
  CompressionLevel = "Optimal"
  DestinationPath = "backend.zip"
}
Compress-Archive @compress -Force
```

### Step 3: Upload using SCP
```powershell
# Upload to server
scp backend.zip your-username@your-server-ip:/home/your-username/

# Example:
# scp backend.zip root@192.168.1.100:/home/root/
```

यह आपसे password पूछेगा, enter करें।

---

## Method 3: Git (अगर आपके पास Git repository है)

### Step 1: Push to Git
```bash
# Local machine पर
cd c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\server

git add .
git commit -m "Backend deployment"
git push origin main
```

### Step 2: Pull on Server
```bash
# Server पर
cd /var/www/campushb/backend
git pull origin main
npm install --production
```

---

## Method 4: FileZilla (Alternative GUI)

### Step 1: Download FileZilla
- Visit: https://filezilla-project.org/
- Download FileZilla Client
- Install करें

### Step 2: Connect to Server
1. Open FileZilla
2. Top में fill करें:
   - **Host:** sftp://your-server-ip
   - **Username:** your-username
   - **Password:** your-password
   - **Port:** 22

3. Click **Quickconnect**

### Step 3: Upload Files
1. Left side: Navigate to your server folder
2. Right side: Navigate to `/home/your-username/`
3. Drag and drop `backend.zip`

---

## 🎯 Recommended Approach for You

**मेरी recommendation:**

### **Use WinSCP** (सबसे आसान)
1. ✅ GUI based - easy to use
2. ✅ Built-in terminal
3. ✅ Free and safe
4. ✅ Shows upload progress

---

## 📝 Important Notes

### Before Creating Zip:
**MUST DELETE these folders:**
- ❌ `node_modules` (बहुत बड़ा - 100+ MB)
- ❌ `uploads` (अगर testing files हैं)
- ❌ `logs` (old logs)

**MUST INCLUDE these:**
- ✅ `server.js`
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `routes/` folder
- ✅ `models/` folder
- ✅ `config/` folder
- ✅ `middleware/` folder
- ✅ `services/` folder
- ✅ `ecosystem.config.js`
- ✅ `.env.example`

### After Upload on Server:
```bash
# Extract
unzip backend.zip

# Install dependencies (यहाँ node_modules बनेगा)
npm install --production

# Create missing directories
mkdir -p uploads logs

# Create .env file
nano .env
# (paste your configuration)

# Start with PM2
pm2 start ecosystem.config.js
```

---

## 🆘 Troubleshooting

### "tar: command not found" on Windows
- Use PowerShell method या WinSCP
- Windows में `tar` command नहीं है (by default)

### "scp: command not found"
- Install OpenSSH Client (PowerShell method देखें)
- या WinSCP/FileZilla use करें

### Upload बहुत slow है
- `node_modules` delete करना न भूलें!
- यह folder बहुत बड़ा होता है

### Connection refused
- Check server IP सही है
- Check port 22 open है
- Check username/password सही है

---

## ✅ Quick Checklist

- [ ] `node_modules` folder deleted
- [ ] Backend files zipped
- [ ] WinSCP installed (या alternative)
- [ ] Server credentials ready (IP, username, password)
- [ ] Connected to server
- [ ] Files uploaded
- [ ] Extracted on server
- [ ] `npm install` run किया
- [ ] `.env` file created
- [ ] PM2 से start किया

---

**Next:** एक बार files upload हो जाएं, तो मुझे बताना। मैं आपको server setup में help करूंगा! 🚀

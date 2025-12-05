# BrightSUM Quick Reference

## Start Development

### Option 1: Use Helper Script (Easiest)
```cmd
start-dev.cmd
```
Opens both servers in separate windows.

### Option 2: Manual Start

**Terminal 1 - Backend:**
```cmd
cd src\apps\api
.venv\Scripts\python.exe -m uvicorn brightsum_api.main:app --reload
```

**Terminal 2 - Frontend:**
```cmd
cd src\apps\web
npm run dev
```

---

## URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/api/health

---

## Common Commands

### Backend (Python/FastAPI)

```cmd
# Install dependencies
cd src\apps\api
.venv\Scripts\python.exe -m pip install -r ..\..\..\requirements.txt

# Run server
.venv\Scripts\python.exe -m uvicorn brightsum_api.main:app --reload

# Add new package
.venv\Scripts\python.exe -m pip install package-name
# Then update requirements.txt:
.venv\Scripts\python.exe -m pip freeze > ..\..\..\requirements.txt
```

### Frontend (React/Vite)

```cmd
cd src\apps\web

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Add new package
npm install package-name
```

---


## Troubleshooting

**PowerShell blocks npm/python scripts?**
Use Command Prompt (cmd) instead
Or enable script execution in PowerShell (run as administrator):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Port already in use?**
Backend: Add `--port 8001` to uvicorn command
Frontend: Vite will auto-use next available port

**Dependencies not found?**
Backend: Run pip install again
Frontend: Delete `node_modules` and run `npm install`

**Tailwind styles not working?**
Hard refresh browser: `Ctrl + Shift + R`

---

For detailed setup instructions, see: **docs/setup.md**

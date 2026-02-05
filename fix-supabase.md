# Fix Supabase Local Development Setup

## Issue Identified
Local Supabase services are not running properly, causing 503 errors for Edge Functions.

## Step-by-Step Fix

### 1. **Complete Reset (Recommended)**
```bash
# Stop all services
npx supabase stop --no-backup

# Clean up Docker (optional but recommended)
docker system prune

# Start fresh
npx supabase start
```

### 2. **Alternative: Gradual Fix**
```bash
# Check current status
npx supabase status

# If services are stopped, restart
npx supabase start

# If hanging on health checks, try:
npx supabase db start
npx supabase functions serve
```

### 3. **Verify Services Are Running**
After starting, check:
```bash
npx supabase status
```

You should see all services as "Running":
- Studio: http://127.0.0.1:54323
- DB URL: postgresql://postgres:postgres@127.0.0.1:54322
- Edge Runtime: http://127.0.0.1:54321
- Functions: http://127.0.0.1:54321/functions/v1/

### 4. **Test Edge Functions**
Once services are running:
```bash
# Test functions locally
npx supabase functions serve --no-verify-jwt

# In another terminal, test with your script
node test-functions.js
```

### 5. **Common Issues & Solutions**

#### Docker Issues
```bash
# Check Docker is running
docker --version
docker ps

# Restart Docker if needed
# (Restart Docker Desktop/Service)
```

#### Port Conflicts
```bash
# Check if ports are in use
netstat -ano | findstr :54321
netstat -ano | findstr :54322
netstat -ano | findstr :54323

# Kill processes using ports
taskkill /PID <PID> /F
```

#### Permission Issues (Windows)
```bash
# Run PowerShell as Administrator
# Or try:
npx supabase start --workdir .
```

### 6. **Environment Variables Check**
Ensure your `.env.local` matches local setup:
```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your_local_anon_key
```

### 7. **Start AI Engine (Required)**
```bash
cd ai-engine
python main.py
```

### 8. **Full Test Sequence**
```bash
# Terminal 1: Start Supabase
npx supabase start

# Terminal 2: Start AI Engine
cd ai-engine
python main.py

# Terminal 3: Test functions
node test-functions.js

# Terminal 4: Start frontend
npm run dev
```

## Expected Results
- All Supabase services running
- Edge Functions accessible at http://127.0.0.1:54321
- Resume analysis working in frontend
- No 503 errors

## If Still Failing
1. Check Docker Desktop is running
2. Verify no firewall blocking ports
3. Try different Docker network settings
4. Consider using Supabase cloud instead of local

@echo off
echo Fixing Supabase Local Setup...
echo.

echo Step 1: Stopping all services...
npx supabase stop --no-backup

echo Step 2: Cleaning up Docker (optional)...
docker system prune -f

echo Step 3: Starting fresh services...
npx supabase start

echo.
echo Checking status...
npx supabase status

echo.
echo If all services show "Running", you can start:
echo - AI Engine: cd ai-engine && python main.py
echo - Frontend: npm run dev
echo.
pause

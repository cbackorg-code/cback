@echo off
echo Seeding database...
backend\venv\Scripts\python backend\scripts\seed_data.py
if %errorlevel% neq 0 (
    echo Failed to seed database. usage: seed_db.bat
    exit /b %errorlevel%
)
echo Database seeded successfully!
pause

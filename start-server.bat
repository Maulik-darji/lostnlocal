@echo off
echo Starting LostnLocal PHP Server...
echo.
echo Server will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
cd /d "C:\xampp\htdocs\lostnlocal"
C:\xampp\php\php.exe -S localhost:8000 -t .
pause

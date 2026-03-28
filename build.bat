@echo off
echo Installiere Abhängigkeiten...
npm install

echo Erstelle EXE...
npx pkg index.js --targets node18-win-x64 --output jellyfin-rpc.exe

echo.
echo ============================================
echo Fertig! Die EXE wurde erstellt.
echo Starte mit: jellyfin-rpc.exe
echo ============================================
pause

@echo off
REM Quick command shortcuts for Jake's Resume Studio

if "%1"=="dev" (
    echo Starting development server...
    npm run dev
    goto :eof
)

if "%1"=="build" (
    echo Building for production...
    npm run build
    goto :eof
)

if "%1"=="lint" (
    echo Running linter...
    npm run lint
    goto :eof
)

if "%1"=="clean" (
    echo Cleaning build artifacts...
    if exist .next rmdir /s /q .next
    if exist node_modules\.cache rmdir /s /q node_modules\.cache
    echo Clean complete!
    goto :eof
)

if "%1"=="install-tectonic" (
    echo Installing Tectonic...
    echo.
    echo Please run one of these commands:
    echo   choco install tectonic
    echo   Or download from: https://github.com/tectonic-typesetting/tectonic/releases
    goto :eof
)

echo.
echo Jake's Resume Studio - Quick Commands
echo =====================================
echo.
echo   dev              - Start development server
echo   build            - Build for production
echo   lint             - Run ESLint
echo   clean            - Clean build artifacts
echo   install-tectonic - Show Tectonic installation instructions
echo.

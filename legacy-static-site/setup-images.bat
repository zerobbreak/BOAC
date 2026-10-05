@echo off
echo ================================================
echo   BOAC Website — Image Setup Script
echo ================================================
echo.

set SRC=C:\Users\mboni\.gemini\antigravity-ide\brain\ff6341ca-b6a3-46f4-b9d9-70121a4470f4
set DST=d:\BOAC Figma\BOAC-website\assets\images

echo Creating images folder...
if not exist "%DST%" mkdir "%DST%"

echo Copying images...
copy "%SRC%\boac_hero_elder_1786869717375.png"          "%DST%\hero-elder.png"
copy "%SRC%\boac_about_hero_1786869728861.png"          "%DST%\about-hero.png"
copy "%SRC%\boac_programme_learning_1786869758558.png"  "%DST%\programme-learning.png"
copy "%SRC%\boac_programme_skills_1786869769609.png"    "%DST%\programme-skills.png"
copy "%SRC%\boac_programme_youth_1786869780012.png"     "%DST%\programme-youth.png"
copy "%SRC%\boac_donate_hero_1786869788663.png"         "%DST%\donate-hero.png"

echo.
echo ================================================
echo   Done! All images are ready.
echo   You can now open index.html in your browser.
echo ================================================
pause

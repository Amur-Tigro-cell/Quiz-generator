# Quiz Generator

A modern, single-page quiz app built with HTML, CSS, and vanilla JavaScript.

This project generates quizzes using the Open Trivia Database API with a category-first flow and a polished SaaS-style interface.

## Live Features

- Category selection screen before quiz setup
- Category-specific topic options (Science, Programming, History, General Knowledge)
- Dynamic quiz generation from Open Trivia DB
- Progressive API fallback logic for better question availability
- Multiple difficulty levels
- Smooth question transitions and timer-based auto-skip
- Dynamic progress tracking
- Full results dashboard and answer review
- Leaderboard (Top 5) saved in localStorage
- CSV export and PDF export (question sheet, answer key, answer sheet)
- Dark mode with preference saved in localStorage
- English and Bangla UI support

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Open Trivia Database API
- html2pdf.js (for PDF export)

## Project Structure

- index.html: Main app markup and screen structure
- style.css: Full visual system, responsive styles, dark mode
- app.js: Quiz logic, API integration, UI state, exports, localization

## Run Locally

This is a static frontend app.

1. Clone the repository:
   git clone https://github.com/Amur-Tigro-cell/Quiz-generator.git
2. Open the project folder in VS Code.
3. Open index.html in a browser.

Optional: use a local static server for best behavior.

## GitHub Pages Deployment

If GitHub Pages is configured to deploy from main, pushing new commits automatically updates the live site.

1. Go to repository Settings > Pages.
2. Confirm deployment source:
   - Deploy from branch: main (root)
   or
   - GitHub Actions workflow for Pages
3. After pushing changes, wait a few minutes and refresh the site.

## API Reference

- Open Trivia Database: https://opentdb.com/

## License

This project is currently provided without a specific license file.

# GodOS Scrolls Documentation Setup

This documentation is built with MkDocs Material and automatically deployed to GitHub Pages.

## Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Serve locally:
   ```bash
   mkdocs serve
   ```

3. Build static site:
   ```bash
   mkdocs build
   ```

## Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### Setup GitHub Pages

1. Go to your repository settings
2. Navigate to Pages section
3. Set Source to "GitHub Actions"
4. Push your changes to `main` branch

The workflow will automatically build and deploy your documentation.

## Configuration

- `mkdocs.yml` - Main configuration file
- `index.md` - Homepage content
- `scrolls/` - All your markdown documentation

## Features

- Dark/light mode toggle
- Full-text search
- Mobile responsive
- Syntax highlighting
- Emoji support
- Navigation breadcrumbs
- Git revision dates

## URLs

Replace `yourusername` in `mkdocs.yml` with your actual GitHub username for proper links. 
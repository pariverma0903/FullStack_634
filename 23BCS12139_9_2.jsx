//Step 1: Directory Structure
.github/
 └── workflows/
      └── main.yml

//Step 2: GitHub Actions Workflow File
name: CI/CD Pipeline

# ------------------------------------------------
# Trigger workflow on every push to the main branch
# ------------------------------------------------
on:
  push:
    branches:
      - main

# ------------------------------------------------
# Define jobs
# ------------------------------------------------
jobs:
  build_and_test:
    name: Build and Test Application
    runs-on: ubuntu-latest

    steps:
      # Checkout source code
      - name: Checkout code
        uses: actions/checkout@v4

      # Set up Node.js environment
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      # Install dependencies
      - name: Install dependencies
        run: npm install

      # Run automated tests
      - name: Run tests
        run: npm test --if-present

      # Build the project
      - name: Build project
        run: npm run build

  # ----------------------------------------------
  # Optional: Deploy built files (example: GitHub Pages)
  # ----------------------------------------------
  deploy:
    name: Deploy to GitHub Pages
    needs: build_and_test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build

//Step 3: Add Required Secrets (for Deployment)

//step 4: Commit and Push
git add .github/workflows/main.yml
git commit -m "Add CI/CD pipeline with GitHub Actions"
git push origin main


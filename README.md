# AI Resume Builder

Live demo: https://lokesh20060.github.io/AI-Resume-Builder/

This is a static, client-side resume builder with local analytics, job-matcher, and export options.

How to publish & keep the demo live

1. Install Git (if not installed): https://git-scm.com/download/win
2. From the project root run:

```bash
git init
git add .
git commit -m "Initial AI Resume Builder commit"
git branch -M main
git remote add origin https://github.com/lokesh20060/AI-Resume-Builder.git
git push -u origin main
```

3. The repository includes a GitHub Actions workflow that will automatically deploy the repository root to the `gh-pages` branch and publish the site. Wait a few minutes after push and open the demo URL above.

If GitHub Pages does not show the site after deployment, open the repository Settings → Pages and ensure the source is set to the `gh-pages` branch.

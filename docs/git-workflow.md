# Git Workflow (GitFlow-lite)

This workflow directly matches the rubric requirement for Git commands, branching, PRs, and merge handling.

## Branches

- `main` → production deployment
- `develop` → development deployment
- `feature/*` → feature branches (work happens here)
- `hotfix/*` → urgent fixes to production (optional)

## Rules (simple and easy to demo)

1. Never commit directly to `main`
2. Create a `feature/*` branch for every change
3. Open a Pull Request to merge `feature/*` → `develop`
4. After validation, open PR `develop` → `main`

## Suggested commit message style

- `feat: add health endpoint`
- `fix: handle missing env var`
- `ci: add Jenkins pipeline`
- `docs: add architecture diagram`

## Example commands

```bash
git checkout -b feature/health-endpoint
git add .
git commit -m "feat: add health endpoint"
git push -u origin feature/health-endpoint
```

Then open a PR in GitHub and merge into `develop`.

## Merge vs Rebase (viva-ready)

- **Merge** keeps history with a merge commit; good for preserving team context.
- **Rebase** rewrites history to look linear; good for cleanup, but avoid rebasing shared branches.

## Extra marks (optional)

- Show a simple merge conflict and how you resolved it.
- Show tags/releases for production deploys (e.g., `v1.0.0`).

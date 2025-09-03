# CI + Lighthouse CI Documentation

## Overview

This project uses two GitHub Actions workflows for continuous integration:

1. **CI workflow** (`.github/workflows/ci.yml`) - Basic quality checks on push/PR
2. **Lighthouse CI workflow** (`.github/workflows/lighthouse.yml`) - Performance audits on PR

## Local Development

### Running CI Checks Locally

```bash
# Run lint check
npm run lint

# Run type check
npm run typecheck

# Run build
npm run build
```

### Running Lighthouse CI Locally

**Option 1: Manual setup**
```bash
# Terminal 1: Build and start server
npm run build
npm run start

# Terminal 2: Run LHCI after server is ready
npx wait-on http://localhost:3000
npx lhci autorun
```

**Option 2: Using the configured script**
```bash
# This runs the same as above but automated
npm run lhci:ci
```

## Configuration

### Lighthouse CI Settings (`lighthouserc.json`)

- **URLs tested**:
  - `http://localhost:3000/pt` - Homepage PT
  - `http://localhost:3000/pt/sacola` - Shopping bag
  - `http://localhost:3000/pt/checkout` - Checkout page
  - `http://localhost:3000/pt/favoritos` - Favorites page
  - `http://localhost:3000/pt/produto/slug-exemplo` - Product page (may 404, won't fail job)

- **Thresholds** (conservative, evidence-based changes only):
  - Performance: ≥ 80%
  - Accessibility: ≥ 90%
  - Best Practices: ≥ 90%
  - SEO: ≥ 90%

- **Settings**:
  - Desktop preset with devtools throttling
  - 2 runs per URL (reduces flakiness)
  - Results uploaded to temporary public storage

## Interpreting Failures

### CI Workflow Failures

1. **Lint errors**: Run `npm run lint` locally to see detailed output
2. **Type errors**: Run `npm run typecheck` locally to see specific issues
3. **Build errors**: Run `npm run build` locally to debug build issues

### Lighthouse CI Failures

1. **Threshold failures**: Check the PR comment for detailed metrics
2. **URL failures**: Some URLs (like product pages) may 404 - this won't fail the job
3. **Flakiness**: If scores are borderline, re-run the workflow

### Anti-Flakiness Tips

1. **Reduce URLs**: Comment out problematic URLs in `lighthouserc.json` temporarily
2. **Increase runs**: Change `numberOfRuns` from 2 to 3 for more stable results
3. **Check network**: Lighthouse CI can be affected by external resource loading

## Workflows

### CI Workflow
- **Triggers**: Push to any branch, Pull Requests
- **Jobs**: lint → typecheck → build (in that order)
- **Node version**: 20.x
- **Environment**: Production-like with dummy secrets for CI safety

### Lighthouse CI Workflow  
- **Triggers**: Pull Requests only
- **Features**:
  - Automatic PR comments with metrics
  - Artifacts uploaded (HTML/JSON reports)
  - Links to temporary public storage for detailed reports
  - Will fail PR if thresholds not met

## Environment Variables

Both workflows use safe CI environment variables:
- `NODE_ENV=production`
- `NEXT_PUBLIC_URL=http://localhost:3000`
- `SENTRY_DSN=""` (disabled for CI)
- `STRIPE_API_VERSION="2025-07-30.basil"`
- `STRIPE_SECRET_KEY="sk_test_dummy"`
- `NEXTAUTH_SECRET="dummysecretforci"`

## Branch Protection (Recommended Setup)

To enable these as required checks:

1. Go to repository Settings → Branches
2. Add branch protection rule for `main`
3. Require status checks to pass:
   - `CI / build`
   - `Lighthouse CI / lighthouse`

## Troubleshooting

### Common Issues

1. **Server not starting**: Check build errors first with `npm run build`
2. **LHCI hanging**: Ensure server is accessible at `http://localhost:3000`
3. **Permission errors**: Lighthouse CI workflow has `pull-requests: write` permission for PR comments

### Local Development Tips

- Always run `npm run build` before testing LHCI locally
- Use `npx wait-on http://localhost:3000` to ensure server readiness
- Check `.lighthouseci/` directory for local HTML reports
# Quality Gates Documentation

## Overview

This document explains the quality gates implemented in the INSANYCK project to ensure code quality, performance, and reliability through automated CI/CD pipelines.

## CI Workflow (`.github/workflows/ci.yml`)

### What It Validates

The CI workflow runs on every push and pull request and validates:

1. **Lint Check** (`npm run lint`)
   - ESLint rules compliance
   - Code style consistency  
   - Import/export validation
   - React Hooks rules
   - TypeScript-aware linting

2. **Type Check** (`npm run typecheck`)
   - TypeScript compilation without emit
   - Type safety validation
   - Interface compliance
   - Generic constraints

3. **Build Process** (`npm run build`)
   - Next.js production build
   - Static page generation (SSG)
   - Bundle optimization
   - Asset processing and optimization

### Failure Handling

When the CI workflow fails:
- **Artifacts**: Build trace files (`.next/trace`) are uploaded as `next-trace` artifact
- **Debugging**: Download artifacts from the failed workflow to analyze build issues
- **Environment**: Safe CI environment with dummy secrets prevents external service calls

## Lighthouse CI Workflow (`.github/workflows/lighthouse.yml`)

### What It Validates

The Lighthouse CI workflow runs on pull requests and measures:

1. **Performance Metrics**
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Speed Index
   - Time to Interactive (TTI)
   - Total Blocking Time (TBT)
   - Cumulative Layout Shift (CLS)

2. **Accessibility Audits**
   - ARIA attributes
   - Color contrast ratios
   - Keyboard navigation
   - Screen reader compatibility
   - Form labels and semantics

3. **Best Practices**
   - HTTPS usage
   - Security headers
   - Image optimization
   - JavaScript best practices
   - Modern web standards compliance

4. **SEO Checks**
   - Meta tags presence
   - Structured data
   - Mobile friendliness
   - Crawlability
   - Content quality indicators

### Tested URLs

The workflow tests these key pages (2 runs each for stability):
- `/pt` - Homepage (Portuguese)
- `/pt/sacola` - Shopping bag page
- `/pt/checkout` - Checkout flow
- `/pt/favoritos` - Favorites/wishlist page  
- `/pt/produto/slug-exemplo` - Product detail page (may 404, non-blocking)

### Thresholds & Policy

**Current Thresholds (Conservative)**:
- Performance: ≥ 80%
- Accessibility: ≥ 90%  
- Best Practices: ≥ 90%
- SEO: ≥ 90%

**Non-Regression Policy**:
- These thresholds MUST NOT be reduced without proper justification
- Evidence-based improvements may increase thresholds
- Any threshold changes require documentation and team approval

### PR Comments

The Lighthouse CI automatically posts comments on pull requests with:
- Score comparison vs. base branch
- Detailed metrics for each category
- Links to full HTML reports via temporary public storage
- Specific recommendations for improvements

### Failure Artifacts

When Lighthouse CI fails:
- **Always**: All Lighthouse reports uploaded as `lighthouse-ci-results`
- **On Failure**: Detailed failure reports uploaded as `lighthouse-failure-reports`
- **Reports**: HTML and JSON formats for analysis
- **Build Trace**: `.next/trace` files if build fails during lighthouse setup

## Running Quality Gates Locally

### Prerequisites
```bash
# Ensure dependencies are installed
npm ci
```

### CI Checks Locally

```bash
# Run all CI checks in sequence
npm run lint          # Check code style and rules
npm run typecheck     # Validate TypeScript types
npm run build         # Create production build
```

### Lighthouse CI Locally

**Method 1: Manual Setup**
```bash
# Terminal 1: Build and start server
npm run build
npm run start

# Terminal 2: Wait for server and run LHCI
npx wait-on http://localhost:3000
npx lhci autorun
```

**Method 2: Using npm script**
```bash
# Automated approach (recommended)
npm run lhci:ci
```

**Viewing Local Reports**:
- HTML reports: `.lighthouseci/lhci_reports/*.html`
- JSON data: `.lighthouseci/lhci_reports/*.json`
- Summary: Console output shows pass/fail status

## Troubleshooting

### Common CI Failures

1. **Lint Errors**
   ```bash
   npm run lint -- --fix  # Auto-fix simple issues
   ```

2. **Type Errors**
   ```bash
   npm run typecheck  # See detailed type errors
   # Fix types manually - no auto-fix available
   ```

3. **Build Failures**
   ```bash
   npm run clean && npm run build  # Clean rebuild
   # Check .next/trace files in artifacts for details
   ```

### Common Lighthouse CI Failures

1. **Performance Issues**
   - Check bundle size: `npm run build` and review build output
   - Analyze unused JavaScript with build trace
   - Review image optimization and lazy loading

2. **Accessibility Issues**
   - Validate ARIA attributes and roles
   - Check color contrast ratios
   - Ensure keyboard navigation works
   - Add alt text to images

3. **Flaky Results**
   - Network conditions can affect scores
   - Re-run the workflow if scores are borderline
   - Consider increasing `numberOfRuns` in `lighthouserc.json` from 2 to 3

### Debug Artifacts

**Download CI Artifacts**:
1. Go to failed workflow in GitHub Actions
2. Scroll to "Artifacts" section
3. Download `next-trace` for build issues
4. Download `lighthouse-failure-reports` for performance issues

**Analyzing Build Traces**:
- Open `.next/trace` files with Chrome DevTools Performance tab
- Look for long tasks and optimization opportunities

## Branch Protection Setup (GitHub UI)

**Recommended Settings**:
1. Go to Repository Settings → Branches
2. Add protection rule for `main` branch
3. Enable required status checks:
   - `CI / build` 
   - `Lighthouse CI / lighthouse`
4. Enable "Require branches to be up to date"
5. Enable "Include administrators" for consistency

**Status Check Names**:
- CI workflow: `CI / build`  
- Lighthouse workflow: `Lighthouse CI / lighthouse`

These checks will block merging if quality gates fail.

## Environment Variables

**CI-Safe Environment**:
Both workflows use production-like settings with safe dummy values:

```yaml
NODE_ENV: production
NEXT_PUBLIC_URL: http://localhost:3000
NEXT_TELEMETRY_DISABLED: "1"      # Disable Next.js telemetry
SENTRY_DSN: ""                    # Disable error reporting
NEXT_PUBLIC_SENTRY_DSN: ""        # Disable client-side error reporting  
SENTRY_ENVIRONMENT: "ci"          # Mark as CI environment
STRIPE_API_VERSION: "2025-07-30.basil"  # Fixed API version
STRIPE_SECRET_KEY: "sk_test_dummy"       # Safe dummy key
NEXTAUTH_SECRET: "dummysecretforci"      # Safe dummy secret
```

## Performance Optimizations

**Concurrency Control**:
- Both workflows use `cancel-in-progress: true`
- This cancels outdated runs when new commits are pushed
- Saves CI minutes and provides faster feedback

**Caching**:
- Node.js setup uses `cache: 'npm'` for dependency caching
- Reduces install time from ~30s to ~5s on cache hit

**Parallel Execution**:
- CI steps run sequentially (lint → typecheck → build)
- Multiple PR workflows can run concurrently
- Lighthouse runs only on PR (not push) to save resources

## Maintenance

### Regular Tasks

- **Monthly**: Review Lighthouse thresholds for opportunities to improve
- **Per release**: Validate CI passes on main branch
- **When performance degrades**: Analyze build traces and lighthouse reports

### Updating Dependencies

When updating CI-related dependencies:
- `@lhci/cli`: Update in `devDependencies`  
- `actions/*`: Update workflow action versions
- `treosh/lighthouse-ci-action`: Update lighthouse action version

Test locally before merging dependency updates.

### Threshold Adjustments

**Before reducing thresholds**:
1. Document the reason (external factors, intentional trade-offs)
2. Get team approval
3. Update this documentation
4. Consider temporary reduction with timeline to restore

**For increasing thresholds**:
1. Ensure consistent passing over multiple PRs
2. Gradually increase (5% increments)
3. Monitor for false failures after adjustment
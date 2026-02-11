# Automated Content Audit

This script helps enforce the "ZERO CONTENT LOSS" responsive rules by scanning the `src/` codebase for common forbidden patterns such as `display: none`, `hidden`, `sr-only`, `line-clamp`, and `overflow: hidden`.

Run locally:

```bash
npm run content-audit
```

Exit codes:
- `0` — no forbidden patterns found.
- `1` — forbidden patterns detected (script prints offending files and matched categories).

Notes:
- The audit is a fast, grep-style check to surface obvious violations. It is not a substitute for manual review.
- Consider adding `npm run content-audit` to CI to block merges that violate the policy.

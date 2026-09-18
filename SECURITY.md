# Security policy

## Supported release

Security fixes are made on the default branch. This repository is an
educational, backend-free Next.js application: it has no account system,
database, server-side mutation API, provider credential, analytics SDK, or
user-content submission feature.

## Reporting

Please use GitHub's private vulnerability-reporting feature when it is enabled.
Otherwise, contact the repository owner privately. Do not include credentials,
private logs, medical records, or other personal data in a report.

## Security invariants

- The browser bundle must not contain provider or deployment credentials.
- External source text must remain escaped React text, not parsed HTML.
- The production build must remain functional without secrets or cloud
  bindings.
- Dependencies and generated bundles must be scanned before a public release.
- Any future API, analytics, persistence, authentication, or user-content
  feature requires a new threat-model and privacy review before deployment.

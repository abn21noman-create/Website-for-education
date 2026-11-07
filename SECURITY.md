# Security Policy

Nokkhotro stores student-owned learning progress and uses Supabase authentication, Row Level Security, and server-authorized Admin access. Please report security and privacy problems responsibly.

## Supported version

Security fixes are made on the latest `main` branch and deployed production version. Older commits, forks, and unofficial deployments are not supported.

## Report a vulnerability privately

**Do not open a public issue, discussion, or pull request for an undisclosed vulnerability.** Email the maintainer at `abn21.noman@gmail.com` with the subject `[Nokkhotro security]`.

Include, when possible:

- The affected route, component, RPC, table, or migration
- Clear reproduction steps using synthetic data
- Expected and actual behavior
- Potential impact and who could be affected
- A suggested fix or mitigation, if known

Do not access, change, download, or retain another person's data while investigating. Do not perform denial-of-service testing, automated high-volume scanning, social engineering, or testing against accounts you do not own.

The maintainer aims to acknowledge a complete report within 7 days and provide a status update within 14 days. Timelines may vary with severity and complexity. Please allow a reasonable remediation period before public disclosure.

## In scope

Examples include authentication or authorization bypass, broken account isolation, RLS or Admin-access failures, exposure of private study data or identifiers, XSS, unsafe secrets, and privacy-threshold bypasses.

General bugs, feature requests, educational-content corrections, and availability problems without a security impact belong in the public [issue tracker](https://github.com/abn21noman-create/Website-for-education/issues).

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-21
### Added
- Added support for multiple execution environments via `SANDBOX_TYPE`.
- Integrated real OpenAI tutor engine with configurable model selection through `.env`.
- Added automatic retry logic with exponential backoff for transient OpenAI API failures.
- Added TypeORM migration support and a hardened database initialization flow.

### Fixed
- Fixed critical security issues by applying a global JWT guard and strict CORS policy.
- Fixed database integrity issues with foreign key constraints and replaced hard deletes with soft deletes.
- Resolved critical audit findings by hardening the backend and improving test coverage.

### Security
- Secured user endpoints with global authentication guard.
- Restricted Swagger access and tightened API exposure.

### Docs
- Added documentation and release notes summarizing architecture, test coverage, and audit remediation.

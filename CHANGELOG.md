# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Created `.env` and `.env.example` files to document and handle API environment variables.

### Changed
- Updated `.gitignore` with a comprehensive Node.js standard list to prevent sensitive files from being committed.
- Externalized API URL in `src/services/api.js`, relying exclusively on `VITE_API_BASE_URL`.
- Implemented immediate static fallback in `src/services/api.js` if the API URL is not configured or fails, addressing security audit recommendation CR-01 (eliminating single point of failure).
- Refined `ProductList` component to remove redundant error handling and caching logic, now handled by the API service.

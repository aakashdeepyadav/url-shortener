# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [1.0.0] - 2026-05-21

### Added

- URL Shortener (Node.js + Express) API (shorten, redirect, resolve, stats)
- Simple frontend at `GET /ui`
- JSON file persistence with hit counting
- CI pipeline (Jenkinsfile) with tests + packaging + EC2 deployment
- Systemd-based deployment script with persistent JSON store path

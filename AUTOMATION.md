# GitHub Actions Automation for DXT Extensions

This document explains how to set up automated building and releasing for your Canvas MCP DXT extension using GitHub Actions.

## Overview

GitHub Actions can automate the build and release process for your DXT extension, making distribution and version management seamless.

## 1. Automatic Building on Push

Create `.github/workflows/build.yml`:

```yaml
name: Build Extension
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npx @anthropic-ai/dxt pack
      - uses: actions/upload-artifact@v3
        with:
          name: canvas-mcp-extension
          path: '*.dxt'
```

## 2. Automatic Releases

Create `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install && npm run build
      - run: npx @anthropic-ai/dxt pack
      - uses: softprops/action-gh-release@v1
        with:
          files: '*.dxt'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 3. Version Bump Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc && node dist/server.js",
    "start": "node dist/server.js",
    "clean": "rm -rf dist",
    "version:patch": "npm version patch && git push --tags",
    "version:minor": "npm version minor && git push --tags",
    "version:major": "npm version major && git push --tags"
  }
}
```

## Benefits

- 🚀 **Automatic releases**: Tag a version (`git tag v1.0.1`) → automatic `.dxt` file in GitHub releases
- ✅ **CI testing**: Every commit builds and tests the extension  
- 📦 **Easy distribution**: Users download `.dxt` files directly from GitHub releases
- 🔄 **Version management**: Simple commands to bump versions and trigger releases

## Workflow

### For Development
1. Make changes to your code
2. Commit and push to GitHub
3. GitHub Actions automatically builds and tests the extension
4. Artifacts are available for download if needed

### For Releases
1. When ready to release, run one of:
   ```bash
   npm run version:patch   # 1.0.0 → 1.0.1
   npm run version:minor   # 1.0.0 → 1.1.0  
   npm run version:major   # 1.0.0 → 2.0.0
   ```
2. This creates a git tag and pushes it to GitHub
3. GitHub Actions automatically:
   - Builds the extension
   - Packages it as a `.dxt` file
   - Creates a GitHub release
   - Attaches the `.dxt` file to the release

### For Users
1. Go to your GitHub repository's Releases page
2. Download the latest `.dxt` file
3. Install in Claude Desktop

## Additional Considerations

### Security
- The `GITHUB_TOKEN` is automatically provided by GitHub Actions
- No additional secrets configuration needed for basic functionality

### Customization
- Modify the workflows to add testing, linting, or other quality checks
- Add multiple operating system builds if needed
- Include changelog generation or other release automation

### Dependencies
- Ensure `@anthropic-ai/dxt` is available as a dev dependency or install it globally in the workflow
- Consider caching `node_modules` for faster builds

## Getting Started

1. Create the `.github/workflows/` directory in your repository
2. Add the workflow files above
3. Update your `package.json` with the version scripts
4. Commit and push to GitHub
5. Test by creating a tag: `git tag v1.0.0 && git push --tags`

This automation setup makes your extension **professional-grade** with seamless distribution and version management! 🎯
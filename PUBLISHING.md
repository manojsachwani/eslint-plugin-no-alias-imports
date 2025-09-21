# Release and Publishing Guide

This guide explains how to publish your ESLint plugin to npm using GitHub Actions for automated releases.

## Prerequisites

### 1. NPM Account Setup

1. Create an account at [npmjs.com](https://www.npmjs.com) if you don't have one
2. Verify your email address
3. Enable two-factor authentication (2FA) for security

### 2. Generate NPM Access Token

1. Go to [npm Access Tokens](https://www.npmjs.com/settings/tokens)
2. Click "Generate New Token"
3. Select "Automation" type (for CI/CD)
4. Copy the token (you won't see it again!)

### 3. Configure GitHub Repository Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your npm access token
6. Click "Add secret"

## Publishing Process

### Automated Publishing (Recommended)

The repository is configured with GitHub Actions that automatically publish to npm when you create a release or push a version tag.

#### Method 1: Tag-Based Publishing (Quickest)

1. Ensure all changes are committed and pushed to the `master` branch
2. Verify tests pass: `npm test`
3. Verify linting passes: `npm run lint`
4. Create and push a version tag:
   ```bash
   git tag v1.0.1  # Use semantic versioning
   git push origin master --tags
   ```
5. GitHub Actions will automatically publish to npm

#### Method 2: GitHub Release Publishing

##### Step 1: Prepare for Release

1. Ensure all changes are committed and pushed to the `master` branch
2. Verify tests pass: `npm test`
3. Verify linting passes: `npm run lint`
4. Test package locally: `npm pack` (optional)

##### Step 2: Create a GitHub Release

1. Go to your GitHub repository
2. Click on "Releases" in the right sidebar
3. Click "Create a new release"
4. Choose a tag version (e.g., `v1.0.1`, `v1.1.0`, `v2.0.0`)
   - Follow [Semantic Versioning](https://semver.org/):
     - **Patch** (v1.0.1): Bug fixes
     - **Minor** (v1.1.0): New features (backward compatible)
     - **Major** (v2.0.0): Breaking changes
5. Set the release title (e.g., "Release v1.0.1")
6. Write release notes describing what changed
7. Click "Publish release"

##### Step 3: Monitor the Release

1. Go to Actions tab in your repository
2. Watch the "Release and Publish" workflow
3. If successful, your package will be published to npm
4. Check [npmjs.com](https://www.npmjs.com/package/eslint-plugin-no-alias-imports) to verify

### Manual Publishing (Backup Method)

If you need to publish manually:

```bash
# 1. Ensure you're logged into npm
npm login

# 2. Update version in package.json
npm version patch  # or minor, major

# 3. Run tests and linting
npm run test
npm run lint

# 4. Publish to npm
npm publish --access public

# 5. Push version tag to GitHub
git push && git push --tags
```

## Version Management

### Semantic Versioning Guidelines

- **Patch** (1.0.1): Bug fixes, typos, documentation updates
- **Minor** (1.1.0): New rules, new features, improvements
- **Major** (2.0.0): Breaking changes, API changes, removed features

### Version Examples for ESLint Plugin

- `1.0.1`: Fix a bug in the no-alias-imports rule
- `1.1.0`: Add a new rule or configuration option
- `2.0.0`: Change rule behavior in a breaking way

## Troubleshooting

### Common Issues

#### 1. NPM_TOKEN Secret Not Found

- Verify the secret is named exactly `NPM_TOKEN`
- Check that it's added to repository secrets, not environment secrets

#### 2. Permission Denied on npm publish

- Verify your npm token has publish permissions
- Check if package name is already taken
- Ensure you have access to the @scope if using scoped packages

#### 3. Version Already Published

- You cannot republish the same version
- Increment the version number and try again
- Use `npm version patch/minor/major` to update

#### 4. Tests Failing in CI

- Ensure all tests pass locally first
- Check Node.js version compatibility
- Verify all dependencies are in package.json

### Package Verification

Before publishing, verify your package contents:

```bash
# See what files will be included
npm pack --dry-run

# Create a test package
npm pack

# Extract and inspect (optional)
tar -xzf eslint-plugin-no-alias-imports-*.tgz
```

## Best Practices

1. **Always test locally** before creating a release
2. **Write meaningful release notes** describing changes
3. **Follow semantic versioning** strictly
4. **Keep dependencies up to date** but test thoroughly
5. **Monitor npm downloads** and user feedback
6. **Respond to issues** and maintain the package

## Security Notes

- Never commit npm tokens to your repository
- Use "Automation" type tokens for CI/CD
- Regularly rotate your npm access tokens
- Enable 2FA on your npm account
- Monitor your package for security vulnerabilities

## Next Steps

After your first successful publish:

1. Add a badge to your README showing npm version
2. Set up automated security scanning
3. Consider adding automated dependency updates
4. Monitor package usage and gather feedback

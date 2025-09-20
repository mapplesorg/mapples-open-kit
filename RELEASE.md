# Release Process

This document describes the release process for the Mapples Open Kit monorepo.

## Overview

This project uses [Changesets](https://github.com/changesets/changesets) for version management and automated releases. The process is designed to be:

- **Automated**: Releases happen automatically when changes are merged to main
- **Safe**: All changes are reviewed through pull requests
- **Transparent**: Changelogs are automatically generated
- **Consistent**: Semantic versioning is enforced

## How It Works

### 1. Making Changes

When you make changes to any package:

1. Create a feature branch
2. Make your changes
3. Add a changeset describing your changes:
   ```bash
   yarn changeset
   ```
4. Commit your changes and the changeset
5. Create a pull request

### 2. Changeset Creation

When you run `yarn changeset`, you'll be prompted to:

1. **Select packages**: Choose which packages have changes
2. **Choose version type**:
   - `patch`: Bug fixes, small improvements
   - `minor`: New features, backwards compatible
   - `major`: Breaking changes
3. **Write description**: Describe what changed

Example changeset:

```markdown
---
'@mapples/ui': minor
'@mapples/form': patch
---

Add new Button component and fix form validation bug
```

### 3. Automatic Release Process

When changes are merged to the `main` branch:

1. **CI runs**: Tests, linting, and builds are executed
2. **Version bump**: If changesets exist, versions are automatically bumped
3. **Release PR**: A PR is created with version bumps and changelog updates
4. **Publish**: When the release PR is merged, packages are published to npm

## Release Types

### Patch Release (0.0.X)

- Bug fixes
- Documentation updates
- Internal refactoring
- Performance improvements

### Minor Release (0.X.0)

- New features
- New components
- New utilities
- Backwards compatible API changes

### Major Release (X.0.0)

- Breaking changes
- API removals
- Significant architectural changes

## Manual Release Process

If you need to manually trigger a release:

```bash
# Version packages (updates package.json versions)
yarn version-packages

# Publish to npm
yarn release
```

## Release Checklist

Before releasing, ensure:

- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Documentation is updated
- [ ] Changesets are added for all changes
- [ ] Breaking changes are documented

## Troubleshooting

### Release Failed

If a release fails:

1. Check the GitHub Actions logs
2. Verify npm token permissions
3. Ensure all packages build successfully
4. Check for version conflicts

### Missing Changeset

If you forgot to add a changeset:

1. Add the changeset to your PR
2. Or create a new PR with just the changeset

### Version Conflicts

If there are version conflicts:

1. Check for duplicate changesets
2. Ensure proper dependency relationships
3. Review the changeset configuration

## Configuration

The release process is configured in:

- `.changeset/config.json` - Changeset configuration
- `.github/workflows/ci-and-release.yml` - GitHub Actions workflow
- `package.json` - Release scripts

## Best Practices

1. **Always add changesets** for any changes that should be released
2. **Use semantic versioning** appropriately
3. **Write clear descriptions** in changesets
4. **Test thoroughly** before creating PRs
5. **Review release PRs** carefully before merging

## Support

If you have questions about the release process:

1. Check this documentation
2. Review the [Changesets documentation](https://github.com/changesets/changesets)
3. Open an issue in the repository

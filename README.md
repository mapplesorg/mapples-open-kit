# Mapples Open Kit

A comprehensive React Native component library and toolkit for building modern mobile applications.

## Packages

This monorepo contains the following packages:

- **@mapples/action** - Action management and state handling
- **@mapples/dnd** - Drag and drop functionality for React Native
- **@mapples/form** - Form management and validation
- **@mapples/render** - Rendering utilities and components
- **@mapples/state** - State management utilities
- **@mapples/style** - Styling system and theming
- **@mapples/types** - TypeScript type definitions
- **@mapples/ui** - UI components library

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn 4.9.1+

### Installation

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run linting
yarn lint

# Run type checking
yarn type-check
```

## Development

### Adding a Changeset

When you make changes to any package, you need to add a changeset to describe what changed:

```bash
yarn changeset
```

This will prompt you to:
1. Select which packages changed
2. Choose the type of change (patch, minor, major)
3. Write a description of the changes

### Building

```bash
# Build all packages
yarn build

# Build specific package
yarn turbo run build --filter=@mapples/ui
```

### Testing

```bash
# Run tests for all packages
yarn test

# Run tests for specific package
yarn turbo run test --filter=@mapples/ui
```

## Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for version management and releases.

### Automatic Releases

1. Create a changeset for your changes: `yarn changeset`
2. Commit and push your changes
3. The CI will automatically create a PR with version bumps
4. Once the PR is merged, packages will be automatically published to npm

### Manual Release

```bash
# Version packages (updates package.json versions)
yarn version-packages

# Publish to npm
yarn release
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add a changeset: `yarn changeset`
5. Run tests and linting: `yarn test && yarn lint`
6. Submit a pull request

## License

MIT

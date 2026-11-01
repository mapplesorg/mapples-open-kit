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

### Where changes happen

This repository is a **read-only mirror**. The packages are developed and published from
[`mapplesorg/mapples-kit`](https://github.com/mapplesorg/mapples-kit); every commit here arrives
through a `sync/kit-*` pull request after a stable release. See [RELEASE.md](RELEASE.md).

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

## Releases

There is no release flow in this repository. Versions, changelogs and npm publishing come from
`mapples-kit`; the sync PR brings the bumped `package.json` and `CHANGELOG.md` files along with
the code. Details in [RELEASE.md](RELEASE.md).

## Contributing

Code changes are made in `mapplesorg/mapples-kit` and flow here through sync PRs. Pull requests
against this repository are limited to the mirror itself (CI, tests, docs); anything under
`packages/@mapples/*` will be overwritten by the next sync.

## License

MIT

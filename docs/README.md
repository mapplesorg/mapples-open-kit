# Mapples Open Kit Documentation

This directory contains the generated API documentation for all packages in the Mapples Open Kit monorepo.

## Available Documentation

- [@mapples/action](./action/README.md)
- [@mapples/dnd](./dnd/README.md)
- [@mapples/form](./form/README.md)
- [@mapples/render](./render/README.md)
- [@mapples/state](./state/README.md)
- [@mapples/style](./style/README.md)
- [@mapples/types](./types/README.md)
- [@mapples/ui](./ui/README.md)

## Generating Documentation

To regenerate all documentation:

```bash
yarn docs:all
```

To generate documentation for a specific package:

```bash
cd packages/@mapples/[package-name]
yarn docs
```

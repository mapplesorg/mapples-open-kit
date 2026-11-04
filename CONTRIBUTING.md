# Contributing

Thanks for helping with the Mapples Open Kit.

## How this repository works

This repository is a **read-only mirror** of the `@mapples/*` packages. They are developed and published from a private
repository, and every change under `packages/@mapples/*` reaches this repository through a `sync/kit-*` pull request
after a stable release. A change merged here directly would be overwritten or conflict with the next sync.

## Reporting a bug or asking for a feature

Open an issue with the templates provided. Include the package name and version (`npm ls @mapples/<name>`), the Expo
and React Native versions, and the smallest reproduction you can.

## Pull requests

- **Package code** (`packages/@mapples/*`): pull requests are welcome as proposals. A maintainer ports the change to the
  source repository, credits you in the commit, and closes your pull request with a link once the next sync lands here.
- **The mirror itself** (CI, tests, docs, repository files): these can be merged here directly.

Before opening a pull request:

```bash
yarn install
yarn lint
yarn type-check
yarn format:check
yarn build
yarn test
```

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages, e.g.
`fix(mapples-ui): keep focus ring inside rounded buttons`.

## Security

Do not open a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).

## License

By contributing you agree that your contribution is licensed under the [MIT License](LICENSE).

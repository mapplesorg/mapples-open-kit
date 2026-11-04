# Mapples Open Kit

[![CI](https://github.com/mapplesorg/mapples-open-kit/actions/workflows/ci-and-release.yml/badge.svg?branch=main)](https://github.com/mapplesorg/mapples-open-kit/actions/workflows/ci-and-release.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The open-source React Native packages behind [Mapples](https://mapples.org): UI components, styling and theming, forms,
state, actions, navigation and the renderer that turns a Mapples project into a running Expo app. Every package is
published to npm under `@mapples/*` and MIT-licensed.

## Install

```bash
npm i @mapples/ui @mapples/style
# or
yarn add @mapples/ui @mapples/style
```

## Packages

| Package                                               | What it does                                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`@mapples/action`](packages/@mapples/action)         | Action bus: dispatch and observe user actions with RxJS                             |
| [`@mapples/api-import`](packages/@mapples/api-import) | Turns cURL, OpenAPI 3 / Swagger 2 and Postman collections into Mapples API requests |
| [`@mapples/app`](packages/@mapples/app)               | `MapplesApp` root component, asset and font loading                                 |
| [`@mapples/codegen`](packages/@mapples/codegen)       | RenderDom to TSX file generation for pages and components                           |
| [`@mapples/components`](packages/@mapples/components) | Theme-driven widgets: actions, inputs, content, navigation, feedback                |
| [`@mapples/dnd`](packages/@mapples/dnd)               | Drag and drop with gesture handling, hit detection and nested drop targets          |
| [`@mapples/fonts`](packages/@mapples/fonts)           | 21 open-licensed font families, registered per weight                               |
| [`@mapples/form`](packages/@mapples/form)             | Form state, validation and history                                                  |
| [`@mapples/inlang`](packages/@mapples/inlang)         | Parser helpers for inline-lang expressions (`this`, dimensions, state conditions)   |
| [`@mapples/navigation`](packages/@mapples/navigation) | Renders a Mapples `NavigationDocument` with React Navigation (stack, tabs, drawer)  |
| [`@mapples/render`](packages/@mapples/render)         | Renders component trees from JSON definitions                                       |
| [`@mapples/request`](packages/@mapples/request)       | Runs `mapples:request` actions and publishes responses as bindable state            |
| [`@mapples/sid-ast`](packages/@mapples/sid-ast)       | TSX to RenderDom extraction and surgical patching for `$sid`-tagged JSX             |
| [`@mapples/state`](packages/@mapples/state)           | Lightweight state management on React Context                                       |
| [`@mapples/style`](packages/@mapples/style)           | Themes, typography and responsive styling                                           |
| [`@mapples/textpatch`](packages/@mapples/textpatch)   | Unified-diff hunks: generate, apply, 3-way merge, text hash                         |
| [`@mapples/types`](packages/@mapples/types)           | Shared TypeScript types                                                             |
| [`@mapples/ui`](packages/@mapples/ui)                 | UI components with built-in styling and visual-editor support                       |

Documentation: [docs.mapples.org](https://docs.mapples.org).

## Working in this repository

Prerequisites: Node.js 24, Yarn 4.9.1 (`corepack enable`).

```bash
yarn install
yarn build                                  # all packages
yarn turbo run build --filter=@mapples/ui   # one package
yarn lint
yarn type-check
yarn test
```

## Where development happens

This repository is a **read-only mirror**. The packages are developed and published from a private repository; every
commit here arrives through a `sync/kit-*` pull request after a stable release, together with the bumped versions and
changelogs. There is no release flow here. See [RELEASE.md](RELEASE.md).

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first: fixes to package code are ported
to the source repository by the maintainers rather than merged here. Report security issues as described in
[SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Mapples Software, LLC

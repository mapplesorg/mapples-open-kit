# Releases

This repository is a **read-only mirror** of the `@mapples/*` runtime packages. It has no release flow.

- **Source of truth and publishing:** [`mapplesorg/mapples-kit`](https://github.com/mapplesorg/mapples-kit). Its Release workflow versions the packages with Changesets and publishes them to npm: `dev` pushes `-beta.*`, `staging` pushes `-rc.*`, `main` publishes the stable version.
- **How this repo gets updated:** after each stable release a `sync/kit-*` branch is opened here with the kit commits that touched `packages/@mapples/*` (each carries a `cherry picked from commit <kit sha>` line), including the bumped `package.json` versions and `CHANGELOG.md` entries. Review the PR, let CI (lint, type-check, build, tests) pass, merge.
- **Do not** add changesets, bump versions, publish, or edit package sources directly in this repository; such changes would be overwritten by the next sync. Fix bugs in `mapples-kit`; a hotfix made here must be cherry-picked back there with `git cherry-pick -x`.

Every published `@mapples/*` package lists this repository as its `repository` field, so npm links here as the public source.

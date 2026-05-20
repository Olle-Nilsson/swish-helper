# Contributing to swish-helper

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Reporting issues

Before opening an issue, please check if one already exists. When reporting a bug, include:

- A clear description of the problem
- Steps to reproduce it
- Expected vs actual behaviour
- Your Node.js version and OS

[Open an issue](https://github.com/Olle-Nilsson/swish-helper/issues)

## Submitting pull requests

1. Fork the repository and create a branch from `main`.
2. Install dependencies and build the project:
    ```bash
    npm install
    npm run build
    ```
3. Make your changes.
4. Ensure the project still builds without errors:
    ```bash
    npm run build
    ```
5. Open a pull request with a clear description of what was changed and why.

For significant changes, please open an issue first to discuss the proposed change before submitting a PR.

## Commit messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification using the Angular preset. This is used to automatically generate the changelog.

Common types:

| Type       | When to use                                     |
| ---------- | ----------------------------------------------- |
| `feat`     | A new feature                                   |
| `fix`      | A bug fix                                       |
| `docs`     | Documentation changes only                      |
| `refactor` | Code change that is neither a fix nor a feature |
| `chore`    | Build process, dependency, or tooling changes   |

Examples:

```
feat: add support for refund requests
fix: handle missing payeeAlias in m-commerce flow
docs: update TLS configuration examples in README
```

## Code of conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to abide by its terms.

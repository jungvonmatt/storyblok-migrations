# Contributing to Sb Migrate

Thank you for your interest in contributing to Sb Migrate! This document provides guidelines and instructions for contributing to this project.

## Development Workflow

1. Fork the repository
2. Create a new branch for your feature/fix
3. Make your changes
4. Run tests locally
5. Submit a pull request

## Pull Request Process

### Using the PR Template

When creating a pull request, please use the provided PR template. The template will be automatically loaded when you create a new PR. It includes sections for:

- PR Title (following semantic versioning)
- Description of changes
- Changes made
- How to test
- Additional notes

Our GitHub Actions will automatically validate that:

- The PR title follows semantic versioning (Feature, Fix, Docs, etc.)
- All required sections are present in the PR description
- The PR follows the template structure

### Testing Requirements

Before submitting a PR, please ensure:

1. **Local Testing**

   - Run the test suite: `pnpm test`
   - Verify all tests pass
   - Test your changes manually

2. **Code Quality**

   - Code is properly formatted
   - No linting errors
   - Follows the project's coding standards

3. **Documentation**
   - Update documentation if necessary
   - Add comments for complex logic
   - Update README if adding new features

## Automated Checks

Our GitHub Actions workflows will automatically:

1. Run the test suite
2. Validate PR template usage
3. Check code formatting
4. Verify semantic versioning in PR titles

## Getting Help

If you need help or have questions:

1. Check the existing documentation
2. Open an issue for bugs or feature requests
3. Reach out to the maintainers

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

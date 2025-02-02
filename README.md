# storyblok-migrations

Helper to handle migrations in storyblok

## Getting Started

### Prerequisites

- Node.js
- Storyblok CLI (`npm install -g storyblok` or `yarn global add storyblok`)

### Install dependencies

```bash
pnpm install
```

```bash
pnpm dev
```

### Link to global to test package locally

1. Link the package globally

```bash
pnpm link -g
```

2. Run the command in your terminal to test the package

```bash
storyblok-migrate
```

3. Unlink the package

```bash
pnpm unlink -g
```

## Run tests

```bash
pnpm test
```

# Storyblok Migrations

Storyblok Migrations offers additional functionality on top of the existing Storyblok CLI. It helps developers manage Storyblok components, generate TypeScript types, and handle configuration across projects. The main features are:

- Configure Storyblok credentials (Space ID and OAuth token)
- Login to Storyblok
- Pull component schemas
- Generate TypeScript types
- Run Component(Schema) Migrations
- Run Content Migrations

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Tech Stack

- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **Commander.js** - Command-line interface framework
- **Inquirer.js** - Interactive command-line prompts
- **Storyblok CLI** - Official Storyblok command-line interface
- **Cosmiconfig** - Configuration file loader
- **Vitest** - Testing framework

## Features

- Configure Storyblok credentials (Space ID and OAuth token)
- Login to Storyblok CLI using configured credentials
- Pull component schemas from Storyblok spaces
- Generate TypeScript type definitions from component schemas
- Run Component(Schema) Migrations
- Run Content Migrations

## Getting Started

### Prerequisites

- Node.js (see .nvmrc for version)
- Storyblok CLI (`npm install -g storyblok` or `yarn global add storyblok`)

### Global Installation

```bash
npm install -g storyblok-migrations
# or
yarn global add storyblok-migrations
# or
pnpm add -g storyblok-migrations
```

### Local Installation

```bash
npm install storyblok-migrations --save-dev
# or
yarn add storyblok-migrations --dev
# or
pnpm add -D storyblok-migrations
```

## Commands

### Configure Storyblok

Set up your Storyblok credentials (Space ID and OAuth Token):

```bash
sb-migrate config
```

This command will:

- Check for existing configuration in `.storyblokrc.json` or environment variables
- Prompt you to verify or update existing configuration
- Prompt for new credentials if needed
- Save the configuration to `.storyblokrc.json` in your project root

### Login to Storyblok

Authenticate with Storyblok using your configured OAuth token:

```bash
sb-migrate login
```

This command will:

- Verify that Storyblok CLI is installed
- Use your configured OAuth token to log in to Storyblok
- Set the region to EU by default

#### Logout from Storyblok

In case you need to logout from Storyblok, you can use the following command:

```bash
npx storyblok logout
```

### Pull Component Schemas

Download component schemas from your Storyblok space:

```bash
sb-migrate pull-components
```

This command will:

- Verify that Storyblok CLI is installed
- Use your configured Space ID to pull component schemas
- Save the schemas to `components.[space-id].json` in your project root

### Generate TypeScript Types

Generate TypeScript type definitions from your component schemas:

```bash
sb-migrate generate-types
```

This command will:

- Look for the component schema file (`components.[space-id].json`)
- Generate TypeScript type definitions in `storyblok/types/storyblok.gen.d.ts`
- Add proper imports and type extensions for Storyblok Vue integration
- Include custom type parsing for special field types like color pickers and SEO metatags

### Generate Migration

Create a new migration file:

```bash
sb-migrate generate-migration
```

This command will:

- Ask whether you want to create a schema or content migration
- Prompt for a migration name
- Create a timestamped migration file in the appropriate directory
- Include a template with example code for the selected migration type

Options:

- `-t, --type`: Type of migration (schema or content)
- `-n, --name`: Name of the migration

Schema migrations are used to modify component structures, while content migrations are used to update content entries.

### Run Component(Schema) Migrations

Run a schema migration file against Storyblok:

```bash
sb-migrate run-schema <migration-file>
```

Options:

- `-d, --dry-run`: Preview changes without applying them
- `-s, --space <id>`: Storyblok space ID (overrides config)
- `-t, --token <token>`: Storyblok OAuth token (overrides config)
- `-p, --publish <mode>`: Publish mode (all, published, published-with-changes)
- `-l, --languages <langs>`: Languages to publish (default: ALL_LANGUAGES)

## Configuration

The tool looks for configuration in the following places (in order of precedence):

1. **Configuration file**: `.storyblokrc.json` in your project root

   ```json
   {
     "spaceId": "your-space-id",
     "oauthToken": "your-oauth-token"
   }
   ```

2. **Environment variables**: Create a `.env` file or set environment variables
   ```
   STORYBLOK_SPACE_ID=your-space-id
   STORYBLOK_OAUTH_TOKEN=your-oauth-token
   ```

## Development

### Clone the repository

```bash
git clone https://github.com/jungvonmatt/storyblok-migrations.git
cd storyblok-migrations
```

### Install dependencies

```bash
pnpm install
```

### Build the project

```bash
pnpm build
```

### Watch mode for development

```bash
pnpm dev
```

### Link to global to test package locally

1. Link the package globally

```bash
pnpm link -g
```

2. Run the command in your terminal to test the package locally

```bash
sb-migrate
```

3. Unlink the package when done

```bash
pnpm unlink -g
```

4. You can also pack the package and install it locally in a repository

```bash
pnpm pack
```

5. Install the package in a repository

```bash
pnpm install path/to/package.tgz
```

### Run tests

```bash
pnpm test
```

## License

MIT © Jung von Matt TECH

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Sb Migrate

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/jungvonmatt/storyblok-migrations/actions/workflows/test.yaml/badge.svg)](https://github.com/jungvonmatt/storyblok-migrations/actions/workflows/test.yaml)

Sb Migrate extends the core functionality of [Storyblok's CLI](https://github.com/storyblok/storyblok-cli) by providing a modern and simple command-line tool for creating, running, and managing not only content migrations but also schema migrations. It makes it easy and safe to deploy changes to your content model in a way that can be reviewed and tested before being deployed to production. This approach enables teams to evolve their content structure confidently, with greater control and traceability throughout the development lifecycle.

## Features

- Configure Storyblok credentials (Space ID, OAuth token and Region)
- Login to Storyblok CLI using configured credentials from the config file or environment variables
- Pull component schemas from Storyblok spaces
- Generate TypeScript type definitions from component schemas
- Generate migrations for schema and content migrations based on templates for each migration type
- Automatically create timestamped rollback migrations when running migrations that update existing schema or content
- Run Schema Migrations
- Run Content Migrations

## Built with

- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **Commander.js** - Command-line interface framework
- **Inquirer.js** - Interactive command-line prompts
- **Cosmiconfig** - Configuration file loader
- **Picocolors** - Colored console output
- **Storyblok CLI** - Official Storyblok command-line interface
- **Storyblok API** - Official Storyblok API
- **Vitest** - Testing framework
- **Husky** - Git hooks

## Getting Started

### Requirements

- Node.js 20.x or higher (use `.nvmrc` for auto-installation)
- Storyblok CLI:
  - `npm install -g storyblok` or
  - `yarn global add storyblok` or
  - `pnpm add -g storyblok`

### Install

#### Local Development

> If you want to run, test and develop `sb-migrate` locally please follow the instructions here: [DEVELOPMENT.md](DEVELOPMENT.md).

#### Global Installation

```bash
npm install -g sb-migrate
# or
yarn global add sb-migrate
# or
pnpm add -g sb-migrate
```

#### Local Installation

```bash
npm install sb-migrate
# or
yarn add sb-migrate
# or
pnpm add sb-migrate
```

#### Configuration

After installing the package, you need to configure your Storyblok credentials. You will be asked to provide your `Space ID` and `OAuth Token` and you can choose the `region` which defaults to `eu`.

- The `Space ID` is a unique identifier for your Storyblok Space. You can find it in the link of your Storyblok Space, e.g.
  `https://app.storyblok.com/#/me/spaces/SPACE_ID/dashboard`

- The `OAuth Token` is a personal access token that you can create in the [Storyblok Account Settings](https://app.storyblok.com/#/me/account?tab=token).

- The `region` is the region of your Storyblok account.

After you got your `Space ID` and `OAuth Token`, you can configure the tool by running the following command:

```bash
sb-migrate config
```

This command will:

- Check for existing configuration in `.storyblokrc.json` or `.env` file
- Prompt you to verify or add/update existing configuration
- Save the configuration to `.storyblokrc.json` in your project root

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

#### Login to Storyblok

As last step you need to login to Storyblok by just running the following command:

```bash
sb-migrate login
```

## Commands

| Name                                    | Options                                                                                                                                                                                                                                        | Description                                                                                                                                                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config`                                | None                                                                                                                                                                                                                                           | Sets up Storyblok credentials (Space ID and OAuth Token). Checks for existing configuration in `.storyblokrc.json` or environment variables, prompts to verify/update configuration, and saves to `.storyblokrc.json`. |
| `login`                                 | None                                                                                                                                                                                                                                           | Authenticates with Storyblok using configured OAuth token. Verifies Storyblok CLI installation and sets region to EU by default.                                                                                       |
| `npx storyblok logout`                  | None                                                                                                                                                                                                                                           | Logs out from Storyblok.                                                                                                                                                                                               |
| `pull-components`                       | None                                                                                                                                                                                                                                           | Downloads component schemas from Storyblok space. Verifies Storyblok CLI installation and saves schemas to `components.[space-id].json`.                                                                               |
| `generate-types`                        | None                                                                                                                                                                                                                                           | Generates TypeScript type definitions from component schemas. Creates types in `storyblok/types/storyblok.gen.d.ts` with proper imports and type extensions.                                                           |
| `generate-migration`                    | `-t, --type`: Type of migration<br>`-n, --name`: Name of the migration                                                                                                                                                                         | Creates a new migration file. Prompts for migration type (schema/content) and name, creates timestamped file with template.                                                                                            |
| `run <relative path to migration-file>` | `-d, --dry-run`: Preview changes<br>`-s, --space <id>`: Space ID<br>`-t, --token <token>`: OAuth token<br>`-p, --publish <mode>`: Publish mode<br>`-l, --languages <langs>`: Languages to publish<br>`--throttle <ms>`: Delay between requests | Runs a schema or content migration file against Storyblok. Supports various options for controlling the migration process.                                                                                             |

## Migrations

In this section you can see how to create migrations for schema and content migrations.

> When creating migrations, the file must have a `.js` extension to be executed by `sb-migrate`. Thanks to `JSDoc` documentation for all important functions, you’ll still benefit from autocompletion and type safety in your IDE.

### Type-Safe Migrations

The `defineMigration` function provides full TypeScript support for creating any type of migration:

```javascript
// migrations/create-component.js
import { defineMigration, textField } from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "new-component",
    display_name: "New Component",
    is_root: false,
    is_nestable: true,
    component_group_name: "Content",
    schema: {
      title: textField({
        pos: 0,
      }),
      subtitle: textField({
        pos: 1,
      }),
    },
    tabs: {
      general: ["title", "subtitle"],
    },
  },
});
```

### Migration Types

The following migration types are supported:

#### Schema Migrations

- `create-component-group` - Create a new component group
- `update-component-group` - Update an existing component group
- `delete-component-group` - Delete a component group
- `create-component` - Create a new component with schema
- `update-component` - Update an existing component schema
- `delete-component` - Delete a component
- `create-datasource` - Create a datasource and its entries
- `update-datasource` - Update a datasource slug, name and add, update or delete entries.
- `delete-datasource` - Delete a datasource

#### Content Migrations

- `create-story` - Create a new content entry
- `update-story` - Update an existing content entry
- `delete-story` - Delete a content entry
- `transform-entries` - Apply transformations to all entries using a specific component and a transform function.

### Schema Helper Functions (for component migrations)

When creating or updating components with `create-component` or `update-component`, the following helper functions are available to create type-safe schema fields:

- `textField()` - Creates a Text input field for short strings
- `textareaField()` - Creates a Textarea input field for longer strings
- `bloksField()` - Creates a Blocks field for nested blocks
- `richtextField()` - Creates a Rich text field with formatting options
- `markdownField()` - Creates a Markdown text field
- `numberField()` - Creates a number input field
- `datetimeField()` - Creates a date and time input field
- `booleanField()` - Creates a boolean input field
- `optionsField()` - Creates a multiple options select dropdown field
- `optionField()` - Creates a single option select dropdown field
- `assetField()` - Creates an asset field for files
- `multiassetField()` - Creates a multi-asset field for multiple files
- `multilinkField()` - Creates a link field
- `tableField()` - Creates a simple table editor
- `sectionField()` - Creates a section field to group fields
- `customField()` - Creates an extendable, customizable input
- `tabField()` - Creates tabs for the component

Example usage in a migration:

```javascript
import {
  defineMigration,
  textField,
  richtextField,
  booleanField,
} from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "feature-card",
    display_name: "Feature Card",
    is_root: false,
    is_nestable: true,
    component_group_name: "Content",
    schema: {
      title: textField({
        display_name: "Title",
        required: true,
        pos: 0,
      }),
      content: richtextField({
        display_name: "Content",
        translatable: true,
        pos: 1,
      }),
      is_featured: booleanField({
        display_name: "Is Featured",
        default_value: false,
        pos: 2,
      }),
    },
  },
});
```

These helper functions provide proper TypeScript typing, validation, and documentation for each field type.

### Content Migration Example

The most powerful way to perform content migrations is using the `transform-entries` type:

```javascript
import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "transform-entries",
  component: "my-component",
  transform: (content) => {
    // Rename a field
    if (content.old_field) {
      content.new_field = content.old_field;
      delete content.old_field;
    }

    // Convert format of existing field
    if (content.price) {
      content.price = Number(content.price).toFixed(2);
    }

    // Add new field with default value
    if (!content.status) {
      content.status = "active";
    }
  },
  // Optionally control publishing behavior
  publish: "published-with-changes",
});
```

This migration will be applied to all instances of "my-component" across your content, making it an efficient way to perform bulk content updates.

### More Examples

For more examples on how to use the tool, please refer to the [examples](examples) directory. You will find examples for any migration type.

## Contributing

Pull requests and contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

MIT © Jung von Matt TECH

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

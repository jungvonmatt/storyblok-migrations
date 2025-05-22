## Architecture

This section contains information about the full architecture of `sb-migrate`. It is intended to be used as a reference for the project and to understand the different components, methods, types, etc. and how they work together.

## Core Components

### CLI Interface

The CLI interface is defined in `/bin/cli.ts` using Commander.js. It exposes the following key commands:

- `config`: Configure Storyblok credentials
- `login`: Login to Storyblok CLI using configured credentials
- `pull-components`: Pull component schemas from Storyblok space
- `generate-types`: Generate TypeScript type definitions from component schemas
- `generate-migration`: Create template files for schema or content migrations
- `run`: Execute migration files against Storyblok

### Commands

Each command is implemented as a separate module in the `/src/commands/` directory:

- `config.ts`: Manages Storyblok credentials via .storyblokrc.json or .env files
- `login.ts`: Handles authentication with Storyblok
- `pull-components.ts`: Downloads component schemas from Storyblok
- `generate-types.ts`: Creates TypeScript types from schemas
- `generate-migration.ts`: Bootstraps migration files based on templates
- `run.ts`: Executes migration scripts with options for dry runs, publishing, etc.

### Migration Handlers

Migration logic is organized in `/src/handlers/` by entity type:

- `component/`: Handlers for component schema operations
- `componentGroup/`: Handlers for component group operations
- `datasource/`: Handlers for datasource operations
- `story/`: Handlers for content entry operations
- `transformEntries.ts`: Handler for bulk content transformations

### Type Definitions

The type system in `/src/types/` provides the full type support for migrations:

- `migration.ts`: Defines all migration types (create/update/delete operations)
- `IComponent.ts`: Component schema structure
- `IComponentGroup.ts`: Component group structure
- `IDataSource.ts`: Datasource structure
- `stories/`: Content entry structures
- `spaces/`: Storyblok space configurations

### Utility Functions

Helpers and utility functions in `/src/utils/` include:

- `migration.ts`: The migration system with these key features:

  - Defines the `defineMigration` function for type-safe migrations
  - Implements the `runMigration` function for executing migrations
  - Provides utility functions for tracking and displaying migration changes
  - Handles rollback creation for reversible migrations

- `schemaComponentHelpers.ts`:

  - Contains field creation helpers (`textField`, `richtextField`, etc.)
  - Provides TypeScript interfaces for all Storyblok field types

- `api.ts`: Complete API client for Storyblok:

  - Wraps the Storyblok JS Client with type-safe methods
  - Handles authentication, throttling, and error management
  - Provides methods for components, stories, datasources, etc.
  - Implements pagination and data transformation

- `storyblok.ts`: Contains core operations for Storyblok entities:

  - Implements operations like `addOrUpdateFields` and `moveToTab`
  - Handles the creation of rollback files for schema changes
  - Provides utilities for component and field processing
  - Contains functions for safe content transformations

- `component.ts`: Specialized utilities for component operations:

  - Functions for extracting and manipulating component data
  - Handles preview generation for components
  - Provides utilities for component schema comparison

- `config.ts`: Configuration management tools:

  - Loads and validates configuration from various sources
  - Handles environment variables and configuration files
  - Provides credential management for Storyblok API access
  - Implements configuration merging and validation

### Templates

The `src/templates/` directory contains template files used by the `generate-migration` command to create boilerplate migration files for different migration types.

## Flow Architecture

### Configuration Flow

1. User runs `sb-migrate config`
2. Tool checks for existing configuration in `.storyblokrc.json` or environment variables
3. User is prompted to verify or update credentials
4. Configuration is saved to `.storyblokrc.json`

### Migration Creation Flow

1. User runs `sb-migrate generate-migration`
2. Tool prompts for migration type and name
3. A timestamped migration file is created with the appropriate template

### Migration Execution Flow

1. User runs `sb-migrate run <path-to-migration>`
2. Tool loads and validates the migration file
3. Based on migration type, appropriate handler is selected
4. Migration is executed with specified options (dry-run, publish settings, etc.)
5. For operations that modify existing schema or content, a rollback migration is automatically generated

### Component Schema Management Flow

1. User runs `sb-migrate pull-components`
2. Component schemas are downloaded from Storyblok
3. User runs `sb-migrate generate-types`
4. TypeScript type definitions are generated from the schema

## Key Design Patterns

### Type-Safe Migrations

The `defineMigration` function ensures that migration schemas match the expected structure for each migration type, providing compile-time type safety.

### Field Type Helpers

Helper functions like `textField()`, `richtextField()`, etc., provide a type-safe way to define component fields with appropriate properties.

### Command Pattern

Each operation is implemented as a separate command, following the Command design pattern, which makes the codebase modular and maintainable.

### Adapter Pattern

Storyblok API interactions are abstracted behind handlers, making it easier to maintain compatibility with API changes.

## Dependencies

- **Commander.js**: Command-line interface framework
- **Inquirer.js**: Interactive command-line prompts
- **Cosmiconfig**: Configuration file loader
- **TypeScript**: For static typing
- **Storyblok API Client**: For API interactions
- **Storyblok CLI**: For authentication and some operations

## Extension Points

The architecture supports easy extension:

1. Add new migration types by extending the `MigrationType` union in `migration.ts`
2. Implement new handlers in the `handlers/` directory
3. Create templates for new migration types in the `templates/` directory
4. Update the CLI interface in `cli.ts` to expose new functionality

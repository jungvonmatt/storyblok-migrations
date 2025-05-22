#!/usr/bin/env node

import { Command } from "commander";
import { configureStoryblok } from "../src/commands/config";
import { loginToStoryblok } from "../src/commands/login";
import { pullComponents } from "../src/commands/pull-components";
import { generateTypes } from "../src/commands/generate-types";
import { generateMigration } from "../src/commands/generate-migration";
import { run } from "../src/commands/run";

const program = new Command();

program
  .name("sb-migrate")
  .description("CLI tool for managing Storyblok schema and content migrations.")
  .version("0.1.0");

program
  .command("config")
  .description("Configure Storyblok credentials")
  .action(configureStoryblok);

program
  .command("login")
  .description("Login to Storyblok CLI using configured credentials")
  .action(loginToStoryblok);

program
  .command("pull-components")
  .description("Pull components from Storyblok space")
  .action(pullComponents);

program
  .command("generate-types")
  .description("Generate TypeScript types from Storyblok components schema")
  .action(generateTypes);

program
  .command("generate-migration")
  .description("Generate a migration file for a schema or content migration")
  .option("-t,--type <TYPE>", "Type of migration (e.g. 'create-component')")
  .option("-n, --name <NAME>", "Name of the migration")
  .action((options) => generateMigration(options));

program
  .command("run")
  .description("Run a schema or content migration file against Storyblok")
  .argument("<file>", "Path to the migration file")
  .option("-d, --dry-run", "Preview changes without applying them", false)
  .option("-s, --space <id>", "Storyblok space ID (overrides config)")
  .option("-t, --token <token>", "Storyblok OAuth token (overrides config)")
  .option(
    "-p, --publish <mode>",
    "Publish mode (all, published, published-with-changes)",
    "published",
  )
  .option(
    "-l, --languages <langs>",
    "Languages to publish (default: ALL_LANGUAGES)",
    "ALL_LANGUAGES",
  )
  .option(
    "--throttle <ms>",
    "Add delay between API requests to avoid rate limiting (in milliseconds)",
    (value) => parseInt(value, 10),
    0,
  )
  .action((filePath, options) => run(filePath, options));

program.parse();

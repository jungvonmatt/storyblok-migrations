#!/usr/bin/env node

import { Command } from "commander";
import { configureStoryblok } from "../src/commands/config";
import { loginToStoryblok } from "../src/commands/login";
import { pullComponents } from "../src/commands/pull-components";
import { generateTypes } from "../src/commands/generate-types";
import { generateMigration } from "../src/commands/generate-migration";
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
  .option("-t,--type <TYPE>", "Type of migration ('schema' or 'content')")
  .option("-n, --name <NAME>", "Name of the migration")
  .action((options) => generateMigration(options));

program.parse();

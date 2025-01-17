#!/usr/bin/env node

import { Command } from "commander";
import { configureStoryblok } from "../src/commands/config";

const program = new Command();

program
  .name("storyblok-migrate")
  .description("CLI tool for managing Storyblok content migrations")
  .version("0.1.0");

program
  .command("config")
  .description("Configure Storyblok credentials")
  .action(configureStoryblok);

program.parse();

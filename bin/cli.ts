#!/usr/bin/env node

import { Command } from "commander";
import { configureStoryblok } from "../src/commands/config";
import { loginToStoryblok } from "../src/commands/login";
import { pullComponents } from "../src/commands/pull-components";

const program = new Command();

program
  .name("storyblok-migrate")
  .description("CLI tool for managing Storyblok content migrations")
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

program.parse();

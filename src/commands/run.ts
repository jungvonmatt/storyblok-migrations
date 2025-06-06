/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import pc from "picocolors";
import { select } from "@inquirer/prompts";
import { RunMigrationOptions, findMigrations } from "../utils/migration";
import { setRequestsPerSecond } from "../utils/api";
import { RunOptions } from "../types/migration";
import { createJiti } from "jiti";

import {
  handleCreateComponentGroup,
  handleCreateComponent,
  handleDeleteComponentGroup,
  handleUpdateComponentGroup,
  handleUpdateComponent,
  handleDeleteComponent,
  handleCreateStory,
  handleUpdateStory,
  handleDeleteStory,
  handleCreateDatasource,
  handleUpdateDatasource,
  handleDeleteDatasource,
  handleTransformEntries,
} from "../handlers";

// Initialize jiti with the current working directory
const jiti = createJiti(process.cwd());

/**
 * Runs a migration file based on the provided file path and options.
 * This function performs the following operations:
 * 1. Applies rate limiting to the API requests
 * 2. If no file path is provided, prompts the user to select a migration
 * 3. Resolves and loads the migration file
 * 4. Executes the migration based on the migration type
 *
 * @param {string} [filePath] - The path to the migration file to run. If not provided, will prompt interactively.
 * @param {RunOptions} [options] - Configuration options for the migration run
 * @param {number} [options.throttle] - The throttle time in milliseconds between API requests (default: 300ms)
 * @param {boolean} [options.dryRun] - Whether to perform a dry run of the migration (default: false)
 * @param {boolean} [options.publish] - Whether to publish the migration (default: false)
 * @param {string[]} [options.languages] - The languages to publish the migration to (default: all languages)
 */
export async function run(filePath?: string, options: RunOptions = {}) {
  // Apply rate limiting if provided
  if (options.throttle && options.throttle > 0) {
    // Convert throttle milliseconds to requests per second
    // e.g., 500ms throttle = 2 requests per second
    const requestsPerSecond = 1000 / options.throttle;
    console.log(
      `${pc.blue("-")} Setting API rate limit to ${requestsPerSecond.toFixed(2)} requests per second (${options.throttle}ms between requests)`,
    );
    setRequestsPerSecond(requestsPerSecond);
  } else {
    // Default to a safe rate limit of 3 requests per second
    setRequestsPerSecond(3);
  }

  // If no file path is provided, let the user select from available migrations
  if (!filePath) {
    const migrations = await findMigrations();
    if (migrations.length === 0) {
      console.error(
        `${pc.red("✗")} No migrations found in migrations directory`,
      );
      process.exit(1);
    }

    filePath = await select({
      message: "Select a migration to run:",
      choices: migrations.map((migration) => ({
        name: migration,
        value: migration,
      })),
    });
    filePath = path.join("migrations", filePath);
  }

  // Resolve and load the migration file
  const resolvedPath = path.resolve(process.cwd(), filePath);
  console.log(`${pc.blue("-")} Loading migration from ${resolvedPath}`);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`${pc.red("✗")} Migration file not found: ${resolvedPath}`);
    process.exit(1);
  }

  try {
    // Use jiti to load the migration file
    const migrationModule = (await jiti.import(resolvedPath)) as {
      default?: any;
      [key: string]: any;
    };
    const migration = migrationModule.default || migrationModule;

    // Common options for all migration types
    const migrationOptions: RunMigrationOptions = {
      isDryrun: options.dryRun,
      publish: options.publish,
      publishLanguages: options.languages,
    };

    try {
      switch (migration.type) {
        case "create-component-group":
          await handleCreateComponentGroup(migration, migrationOptions);
          break;
        case "update-component-group":
          await handleUpdateComponentGroup(migration, migrationOptions);
          break;
        case "delete-component-group":
          await handleDeleteComponentGroup(migration, migrationOptions);
          break;
        case "create-component":
          await handleCreateComponent(migration, migrationOptions);
          break;
        case "update-component":
          await handleUpdateComponent(migration, migrationOptions);
          break;
        case "delete-component":
          await handleDeleteComponent(migration, migrationOptions);
          break;
        case "create-story":
          await handleCreateStory(migration, migrationOptions);
          break;
        case "update-story":
          await handleUpdateStory(migration, migrationOptions);
          break;
        case "delete-story":
          await handleDeleteStory(migration, migrationOptions);
          break;
        case "create-datasource":
          await handleCreateDatasource(migration, migrationOptions);
          break;
        case "update-datasource":
          await handleUpdateDatasource(migration, migrationOptions);
          break;
        case "delete-datasource":
          await handleDeleteDatasource(migration, migrationOptions);
          break;
        case "transform-entries":
          await handleTransformEntries(migration, migrationOptions);
          break;
        default:
          console.error(
            `${pc.red("✗")} Unknown migration type: ${(migration as any).type}`,
          );
          process.exit(1);
      }
    } catch (error) {
      // This is a migration error, log it and exit
      console.error(`${pc.red("✗")} Migration failed:`, error);
      process.exit(1);
    }
  } catch (error) {
    // This is an import error, log it and exit
    console.error(`${pc.red("✗")} Failed to load migration:`, error);
    process.exit(1);
  }
}

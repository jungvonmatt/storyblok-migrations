/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import pc from "picocolors";
import { RunMigrationOptions } from "../utils/migration";
import { setRequestsPerSecond } from "../utils/api";
import { RunOptions } from "../types/migration";
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

export async function run(filePath: string, options: RunOptions = {}) {
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

  // Resolve and load the migration file
  const resolvedPath = path.resolve(process.cwd(), filePath);
  console.log(`${pc.blue("-")} Loading migration from ${resolvedPath}`);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`${pc.red("✗")} Migration file not found: ${resolvedPath}`);
    process.exit(1);
  }

  try {
    const migrationModule = await import(resolvedPath);
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

import { input, select } from "@inquirer/prompts";
import pc from "picocolors";
import fs from "fs";
import path from "path";
import { template } from "lodash";

type MigrationType = "schema" | "content";

interface GenerateMigrationOptions {
  type?: string;
  name?: string;
}

export async function generateMigration(
  options: GenerateMigrationOptions = {}
) {
  try {
    // Get migration type from options or prompt
    let migrationType: MigrationType | undefined = undefined;

    // Validate type if provided
    if (options.type) {
      if (options.type !== "schema" && options.type !== "content") {
        console.error(pc.red(`✗ Invalid migration type: ${options.type}`));
        console.error(
          pc.yellow(`Migration type must be either 'schema' or 'content'`)
        );
        process.exit(1);
      }
      migrationType = options.type as MigrationType;
    }

    // Prompt for type if not provided or invalid
    if (!migrationType) {
      migrationType = await select<MigrationType>({
        message: "What type of migration do you want to create?",
        choices: [
          { value: "schema", name: "Schema Migration (component structure)" },
          { value: "content", name: "Content Migration (content entries)" },
        ],
      });
    }

    // Get migration name from options or prompt
    let migrationName = options.name;
    if (!migrationName) {
      migrationName = await input({
        message: "Enter a name for your migration:",
        validate: (value) => {
          if (!value.trim()) return "Migration name cannot be empty";
          if (!/^[a-z0-9-_]+$/i.test(value))
            return "Migration name can only contain letters, numbers, hyphens, and underscores";
          return true;
        },
      });
    }

    // Create timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);
    const fileName = `${timestamp}-${migrationName}.ts`;

    // Create directory if it doesn't exist
    const migrationsDir = path.join(process.cwd(), "migrations", migrationType);
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const filePath = path.join(migrationsDir, fileName);

    // Read template based on migration type
    // Try different paths to find the template file
    const templatePaths = [
      // Try local development path first
      path.join(
        process.cwd(),
        "src",
        "templates",
        `${migrationType}-migration.ts`
      ),
      // Then try the dist/templates directory (for production)
      path.join(
        process.cwd(),
        "dist",
        "templates",
        `${migrationType}-migration.ts`
      ),
      // Then try relative to the current file (when installed as a package)
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "src",
        "templates",
        `${migrationType}-migration.ts`
      ),
      // Finally try a path relative to the compiled file
      path.join(__dirname, "..", "templates", `${migrationType}-migration.ts`),
    ];

    // Try each path until we find one that works
    let templateContent = null;
    for (const templatePath of templatePaths) {
      try {
        if (fs.existsSync(templatePath)) {
          templateContent = fs.readFileSync(templatePath, "utf8");
          break;
        }
      } catch (err) {
        // Continue to the next path
        console.error(pc.red(`✗ Failed to read template file: ${err}`));
      }
    }

    if (!templateContent) {
      throw new Error(
        `Could not find template file for ${migrationType} migration`
      );
    }

    // Use lodash template to replace placeholders
    const compile = template(templateContent, {
      interpolate: /{{([\s\S]+?)}}/g,
    });

    const finalTemplate = compile({
      migrationName,
    });

    // Write file
    fs.writeFileSync(filePath, finalTemplate);

    console.log(pc.green(`✓ Migration created at ${filePath}`));
  } catch (error) {
    console.error(pc.red(`✗ Failed to generate migration: ${error}`));
    process.exit(1);
  }
}

import { input, select } from "@inquirer/prompts";
import pc from "picocolors";
import fs from "fs";
import path from "path";
import { template } from "lodash";
import { MigrationType } from "../types/migration";

interface GenerateMigrationOptions {
  type?: string;
  name?: string;
}

export async function generateMigration(
  options: GenerateMigrationOptions = {},
) {
  try {
    let migrationType: MigrationType | undefined = undefined;

    // Define migration type groups
    const schemaTypes: Array<{ value: MigrationType; name: string }> = [
      { value: "create-component-group", name: "Create Component Group" },
      { value: "update-component-group", name: "Update Component Group" },
      { value: "delete-component-group", name: "Delete Component Group" },
      { value: "create-component", name: "Create Component" },
      { value: "update-component", name: "Update Component" },
      { value: "delete-component", name: "Delete Component" },
    ];

    const contentTypes: Array<{ value: MigrationType; name: string }> = [
      { value: "create-story", name: "Create Story" },
      { value: "update-story", name: "Update Story" },
      { value: "delete-story", name: "Delete Story" },
      { value: "transform-entries", name: "Transform Entries" },
    ];

    const datasourceTypes: Array<{ value: MigrationType; name: string }> = [
      { value: "create-datasource", name: "Create Datasource" },
      { value: "update-datasource", name: "Update Datasource" },
      { value: "delete-datasource", name: "Delete Datasource" },
    ];

    if (options.type) {
      const allTypes = [
        ...schemaTypes.map((t) => t.value),
        ...contentTypes.map((t) => t.value),
        ...datasourceTypes.map((t) => t.value),
      ];

      if (!allTypes.includes(options.type as MigrationType)) {
        console.error(pc.red(`✗ Invalid migration type: ${options.type}`));
        console.error(
          pc.yellow(`Valid migration types: ${allTypes.join(", ")}`),
        );
        process.exit(1);
      }

      migrationType = options.type as MigrationType;
    }

    if (!migrationType) {
      const categoryChoice = await select({
        message: "What category of migration do you want to create?",
        choices: [
          { value: "schema", name: "Schema Migration (component structure)" },
          { value: "content", name: "Content Migration (content entries)" },
          { value: "datasource", name: "Datasource Migration" },
        ],
      });

      const typeChoices =
        categoryChoice === "schema"
          ? schemaTypes
          : categoryChoice === "content"
            ? contentTypes
            : datasourceTypes;

      migrationType = await select<MigrationType>({
        message: `Select the type of ${categoryChoice} migration:`,
        choices: typeChoices,
      });
    }

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

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);
    const fileName = `${timestamp}-${migrationName}.js`;

    // Determine the category from the migration type
    const getCategory = (type: MigrationType): string => {
      if (schemaTypes.map((t) => t.value).includes(type)) return "schema";
      if (contentTypes.map((t) => t.value).includes(type)) return "content";
      return "datasource";
    };

    const category = getCategory(migrationType);

    // Create directory if it doesn't exist
    const migrationsDir = path.join(process.cwd(), "migrations", category);
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const filePath = path.join(migrationsDir, fileName);

    // Get template for the specific migration type
    const templateFilename = `${migrationType}.js`;

    const templatePaths = [
      path.join(process.cwd(), "src", "templates", templateFilename),
      path.join(process.cwd(), "dist", "templates", templateFilename),
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "src",
        "templates",
        templateFilename,
      ),
      path.join(__dirname, "..", "templates", templateFilename),
      path.join(process.cwd(), "src", "templates", `${category}-migration.js`),
      path.join(process.cwd(), "dist", "templates", `${category}-migration.js`),
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "src",
        "templates",
        `${category}-migration.js`,
      ),
      path.join(__dirname, "..", "templates", `${category}-migration.js`),
    ];

    let templateContent = null;
    for (const templatePath of templatePaths) {
      try {
        if (fs.existsSync(templatePath)) {
          templateContent = fs.readFileSync(templatePath, "utf8");
          break;
        }
      } catch {
        // Continue to the next path
      }
    }

    if (!templateContent) {
      throw new Error(
        `Could not find template file for ${migrationType} migration`,
      );
    }

    const compile = template(templateContent, {
      interpolate: /{{([\s\S]+?)}}/g,
    });

    const finalTemplate = compile({
      migrationName,
      migrationType,
    });

    fs.writeFileSync(filePath, finalTemplate);

    console.log(pc.green(`✓ Migration created at ${filePath}`));
  } catch (error) {
    console.error(pc.red(`✗ Failed to generate migration: ${error}`));
    process.exit(1);
  }
}

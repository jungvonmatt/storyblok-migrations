/**
 * Script to copy JavaScript template files from src/templates to dist/templates
 *
 * This ensures that template files are available in their original, readable format
 * and are not processed by TypeScript, giving us cleaner migration file output.
 */

const fs = require("fs");
const path = require("path");

// Create the dist/templates directory if it doesn't exist
const templatesDir = path.join(__dirname, "..", "dist", "templates");
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Get the source templates directory and list all files
const srcTemplatesDir = path.join(__dirname, "..", "src", "templates");
const files = fs.readdirSync(srcTemplatesDir);

// Copy each JavaScript file from source to destination
files.forEach((file) => {
  const srcPath = path.join(srcTemplatesDir, file);
  const destPath = path.join(templatesDir, file);

  if (file.endsWith(".js")) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcPath} to ${destPath}`);
  }
});

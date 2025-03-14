/**
 * Script to copy template files from src/templates to dist/templates
 *
 * This script ensures that TypeScript template files are available in the dist directory
 * after the build process. It creates the destination directory if it doesn't exist
 * and only copies files with the .ts extension.
 */

const fs = require("fs");
const path = require("path");

/**
 * Create the dist/templates directory if it doesn't exist
 * @type {string} Path to the destination templates directory
 */
const templatesDir = path.join(__dirname, "..", "dist", "templates");
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

/**
 * Get the source templates directory and list all files
 * @type {string} Path to the source templates directory
 */
const srcTemplatesDir = path.join(__dirname, "..", "src", "templates");
const files = fs.readdirSync(srcTemplatesDir);

/**
 * Copy each TypeScript file from source to destination
 */
files.forEach((file) => {
  const srcPath = path.join(srcTemplatesDir, file);
  const destPath = path.join(templatesDir, file);

  // Only copy .ts files
  if (file.endsWith(".ts")) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcPath} to ${destPath}`);
  }
});

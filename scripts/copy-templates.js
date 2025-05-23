/**
 * Script to copy TypeScript template files from src/templates to dist/templates and dist/src/templates
 *
 * This ensures that template files are available in their original, readable format
 * and are not processed by TypeScript, giving us cleaner migration file output.
 */

const fs = require("fs");
const path = require("path");

// Create both destination directories if they don't exist
const templatesDir = path.join(__dirname, "..", "dist", "templates");
const srcTemplatesDir = path.join(__dirname, "..", "dist", "src", "templates");

[templatesDir, srcTemplatesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Get the source templates directory and list all files
const sourceTemplatesDir = path.join(__dirname, "..", "src", "templates");
const files = fs.readdirSync(sourceTemplatesDir);

// Copy each TypeScript file from source to both destinations
files.forEach((file) => {
  const srcPath = path.join(sourceTemplatesDir, file);
  const destPaths = [
    path.join(templatesDir, file),
    path.join(srcTemplatesDir, file),
  ];

  if (file.endsWith(".ts")) {
    destPaths.forEach((destPath) => {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} to ${destPath}`);
    });
  }
});

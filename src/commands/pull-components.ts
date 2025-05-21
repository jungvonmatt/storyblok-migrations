import { execSync } from "child_process";
import pc from "picocolors";
import { loadConfig } from "../utils/config";
import { isStoryblokCliInstalled } from "./login";

/**
 * Pulls component definitions from a Storyblok space and saves them locally.
 *
 * This function performs the following operations:
 * 1. Verifies that the Storyblok CLI is installed
 * 2. Loads the configuration to get the Space ID
 * 3. Executes the Storyblok CLI command to pull components
 *
 * @throws {Error} If the Storyblok CLI is not installed
 * @throws {Error} If no Space ID is found in the configuration
 * @throws {Error} If the component pull operation fails
 *
 * @requires storyblok-cli - The Storyblok CLI must be installed globally
 * @requires config - A valid configuration with a Space ID must exist
 *
 * @see {@link https://github.com/storyblok/storyblok-cli?tab=readme-ov-file#pull-components|Storyblok CLI Documentation}
 */
export async function pullComponents() {
  try {
    if (!isStoryblokCliInstalled()) {
      console.error(
        pc.red(
          "✗ Storyblok CLI not found. Please install it first:\n" +
            "npm install -g storyblok\n" +
            "or\n" +
            "yarn global add storyblok",
        ),
      );
      process.exit(1);
    }

    const config = await loadConfig();

    if (!config?.spaceId) {
      console.error(
        pc.red(
          "✗ No Storyblok Space ID found. Please run 'sb-migrate config' first.",
        ),
      );
      process.exit(1);
    }

    console.log(pc.blue("Pulling components from Storyblok..."));

    try {
      execSync(`storyblok pull-components --space ${config.spaceId}`, {
        stdio: "inherit",
      });
      console.log(pc.green("✓ Successfully pulled components"));
    } catch (error) {
      console.error(
        pc.red(`✗ Failed to pull components from Storyblok: ${error}`),
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`✗ Failed to pull components: ${error}`));
    process.exit(1);
  }
}

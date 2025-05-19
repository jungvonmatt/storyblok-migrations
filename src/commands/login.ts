import { execSync, spawnSync } from "child_process";
import pc from "picocolors";
import { loadConfig } from "../utils/config";

export function isStoryblokCliInstalled(): boolean {
  try {
    const result = spawnSync("storyblok", ["--version"]);
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Authenticates with Storyblok using the CLI and OAuth token.
 *
 * This function performs the following steps:
 * 1. Checks if the Storyblok CLI is installed
 * 2. Loads the configuration to get the OAuth token
 * 3. Executes the Storyblok CLI login command with the token
 *
 * @throws {Error} If any of the following conditions are met:
 *   - Storyblok CLI is not installed
 *   - No OAuth token is found in the configuration
 *   - Login command execution fails
 *
 * @requires storyblok-cli - The Storyblok CLI must be installed globally
 * @requires config - A valid configuration with an OAuth token must exist
 *
 * @remarks
 * - Uses the EU region for Storyblok authentication
 * - Provides clear error messages with installation instructions when CLI is missing
 *
 * @see {@link https://github.com/storyblok/storyblok-cli?tab=readme-ov-file#login|Storyblok CLI Documentation}
 */
export async function loginToStoryblok() {
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

    if (!config?.oauthToken) {
      console.error(
        pc.red(
          "✗ No Storyblok OAuth token found. Please run 'sb-migrate config' first.",
        ),
      );
      process.exit(1);
    }

    console.log(pc.blue("Logging in to Storyblok..."));

    try {
      execSync(
        `storyblok login --token ${config.oauthToken} --region ${config.region}`,
        {
          stdio: "inherit",
        },
      );
      console.log(pc.green("✓ Successfully logged in to Storyblok"));
    } catch (error) {
      console.error(pc.red(`✗ Failed to login to Storyblok: ${error}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`✗ Failed to login: ${error}`));
    process.exit(1);
  }
}

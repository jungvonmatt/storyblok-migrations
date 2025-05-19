import pc from "picocolors";
import {
  loadEnvConfig,
  saveConfig,
  loadConfig,
  verifyExistingConfig,
  promptForConfig,
} from "../utils/config";

/**
 * Main configuration function for Storyblok CLI.
 *
 * This function:
 * 1. Loads existing configuration from file and environment variables
 * 2. If configuration exists:
 *    - Verifies existing values with user
 *    - Updates if needed
 * 3. If no configuration exists:
 *    - Prompts for all required values
 * 4. Saves the final configuration to .storyblokrc.json
 *
 * The configuration process follows this flow:
 * - First checks for existing config in .storyblokrc.json
 * - Then checks for environment variables
 * - If found, verifies with user
 * - If not found or user wants to update, prompts for new values
 *
 * @throws {Error} If configuration saving fails
 */
export async function configureStoryblok() {
  try {
    const existingConfig = await loadConfig();
    const envConfig = await loadEnvConfig();

    // Check if configuration exists in config file or .env
    if (existingConfig || envConfig.spaceId || envConfig.oauthToken) {
      const configToVerify = existingConfig || envConfig;
      const verifiedConfig = await verifyExistingConfig(configToVerify);
      if (verifiedConfig) {
        await saveConfig(verifiedConfig);
        console.log(pc.green("✓ Configuration saved successfully"));
        return;
      }
    } else {
      console.log(pc.yellow("No Storyblok configuration found."));
    }

    // If no configuration found or user wants to update
    const config = await promptForConfig(existingConfig || envConfig || {});
    await saveConfig(config);
    console.log(pc.green("✓ Configuration saved successfully"));
  } catch (error) {
    console.error(pc.red(`✗ Failed to configure Storyblok: ${error}`));
  }
}

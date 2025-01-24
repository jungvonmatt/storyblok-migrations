import { confirm, input } from "@inquirer/prompts";
import pc from "picocolors";
import { StoryblokConfig } from "../types/config";
import { loadEnvConfig, saveConfig } from "../utils/config";

export async function configureStoryblok() {
  try {
    const envConfig = await loadEnvConfig();

    // Check if configuration exists in .env
    if (envConfig.spaceId || envConfig.oauthToken) {
      // Found existing configuration in .env
      const useExisting = await verifyExistingConfig(envConfig);
      if (useExisting) {
        await saveConfig(envConfig as StoryblokConfig);
        console.log(pc.green("✓ Configuration saved successfully"));
        return;
      }
    } else {
      console.log(pc.yellow("No Storyblok configuration found."));
    }

    // If no configuration found in .env or user wants to update
    const config = await promptForConfig(envConfig);
    await saveConfig(config);
    console.log(pc.green("✓ Configuration saved successfully"));
  } catch (error) {
    console.error(pc.red(`✗ Failed to configure Storyblok: ${error}`));
  }
}

async function verifyExistingConfig(
  config: Partial<StoryblokConfig>
): Promise<boolean> {
  console.log(pc.blue("Please verify the following options:"));

  if (config.spaceId) {
    console.log(`Space ID: ${config.spaceId}`);
  }
  if (config.oauthToken) {
    console.log(`OAuth Token: ${config.oauthToken}`);
  }

  return confirm({
    message: "Would you like to use these values?",
    default: true,
  });
}

async function promptForConfig(
  existing: Partial<StoryblokConfig>
): Promise<StoryblokConfig> {
  const spaceId = await input({
    message: "Enter your Storyblok Space ID:",
    default: existing.spaceId,
    validate: (value) => value.length > 0,
  });

  const oauthToken = await input({
    message: "Enter your Storyblok OAuth Token:",
    default: existing.oauthToken,
    validate: (value) => value.length > 0,
  });

  return {
    spaceId,
    oauthToken,
  };
}

import { confirm, input } from "@inquirer/prompts";
import pc from "picocolors";
import { StoryblokConfig } from "../types/config";
import { loadEnvConfig, saveConfig, loadConfig } from "../utils/config";

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

async function verifyExistingConfig(
  config: Partial<StoryblokConfig>
): Promise<StoryblokConfig | null> {
  console.log(pc.blue("Please verify the following options:"));

  if (config.spaceId) {
    console.log(`Space ID: ${config.spaceId}`);
  }
  if (config.oauthToken) {
    console.log(`OAuth Token: ${config.oauthToken}`);
  }

  const useExisting = await confirm({
    message: "Would you like to use these values?",
    default: true,
  });

  if (!useExisting) {
    return null;
  }

  // If we're missing any required fields, prompt for them
  const updatedConfig: Partial<StoryblokConfig> = { ...config };

  if (!updatedConfig.spaceId) {
    updatedConfig.spaceId = await input({
      message: "Enter your Storyblok Space ID:",
      validate: (value) => value.length > 0,
    });
  }

  if (!updatedConfig.oauthToken) {
    updatedConfig.oauthToken = await input({
      message: "Enter your Storyblok OAuth Token:",
      validate: (value) => value.length > 0,
    });
  }

  return updatedConfig as StoryblokConfig;
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

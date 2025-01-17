import inquirer from "inquirer";
import pc from "picocolors";
import { StoryblokConfig } from "../types/config";
import { loadEnvConfig, saveConfig } from "../utils/config";

export async function configureStoryblok() {
  try {
    const envConfig = await loadEnvConfig();

    // Check if configuration exists in .env
    if (envConfig.spaceId || envConfig.oauthToken) {
      // Found existing configuration in .env
      const verificationAnswers = await verifyExistingConfig(envConfig);
      if (verificationAnswers.useExisting) {
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

async function verifyExistingConfig(config: Partial<StoryblokConfig>) {
  console.log(pc.blue("Please verify the following options:"));

  if (config.spaceId) {
    console.log(`Space ID: ${config.spaceId}`);
  }
  if (config.oauthToken) {
    console.log(`OAuth Token: ${config.oauthToken}`);
  }

  return inquirer.prompt([
    {
      type: "confirm",
      name: "useExisting",
      message: "Would you like to use these values?",
      default: true,
    },
  ]);
}

async function promptForConfig(
  existing: Partial<StoryblokConfig>
): Promise<StoryblokConfig> {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "spaceId",
      message: "Enter your Storyblok Space ID:",
      default: existing.spaceId,
      validate: (input) => input.length > 0,
    },
    {
      type: "input",
      name: "oauthToken",
      message: "Enter your Storyblok OAuth Token:",
      default: existing.oauthToken,
      validate: (input) => input.length > 0,
    },
  ]);

  return answers;
}

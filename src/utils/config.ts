import { cosmiconfig } from "cosmiconfig";
import { config } from "dotenv";
import { writeFile } from "fs/promises";
import path from "path";
import { StoryblokConfig, StoryblokRegion } from "../types/config";
import { confirm, input, select } from "@inquirer/prompts";
import pc from "picocolors";

export async function loadEnvConfig(): Promise<Partial<StoryblokConfig>> {
  config(); // Load .env file

  return {
    spaceId: process.env.STORYBLOK_SPACE_ID,
    oauthToken: process.env.STORYBLOK_OAUTH_TOKEN,
  };
}

export async function saveConfig(config: StoryblokConfig): Promise<void> {
  await writeFile(
    path.join(process.cwd(), ".storyblokrc.json"),
    JSON.stringify(config, null, 2),
  );
}

// Search for a storyblok config in the current working directory
export async function loadConfig(): Promise<StoryblokConfig | null> {
  const explorer = cosmiconfig("storyblok");

  try {
    const result = await explorer.search();
    return result?.config || null;
  } catch (error) {
    console.error("Error loading config:", error);
    return null;
  }
}

/**
 * Verifies and potentially updates an existing Storyblok configuration.
 *
 * This function:
 * 1. Displays current configuration values (spaceId, oauthToken, region)
 * 2. Asks user if they want to use existing values
 * 3. If user declines or values are missing, prompts for new values
 * 4. Ensures all required fields are present in the final configuration
 *
 * @param config - Partial configuration object containing existing values
 * @returns A complete StoryblokConfig object if user confirms or updates values, null if user declines
 */
export async function verifyExistingConfig(
  config: Partial<StoryblokConfig>,
): Promise<StoryblokConfig | null> {
  console.log(pc.blue("Please verify the following options:"));

  if (config.spaceId) {
    console.log(`Space ID: ${config.spaceId}`);
  }
  if (config.oauthToken) {
    console.log(`OAuth Token: ${config.oauthToken}`);
  }
  if (config.region) {
    console.log(`Region: ${config.region}`);
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

  if (!updatedConfig.region) {
    updatedConfig.region = await select({
      message: "Select your Storyblok region:",
      choices: [
        {
          value: "eu" as StoryblokRegion,
          name: "EU (default) - For spaces created in the EU",
        },
        {
          value: "us" as StoryblokRegion,
          name: "US - For spaces created in the US",
        },
        {
          value: "ap" as StoryblokRegion,
          name: "Australia - For spaces created in Australia",
        },
        {
          value: "ca" as StoryblokRegion,
          name: "Canada - For spaces created in Canada",
        },
        {
          value: "cn" as StoryblokRegion,
          name: "China - For spaces created in China",
        },
      ],
      default: "eu",
    });
  }

  return updatedConfig as StoryblokConfig;
}

/**
 * Prompts the user for all required Storyblok configuration values.
 *
 * This function:
 * 1. Prompts for Space ID with validation
 * 2. Prompts for OAuth Token with validation
 * 3. Prompts for Region with predefined options
 * 4. Uses existing values as defaults if provided
 *
 * @param existing - Partial configuration object containing existing values to use as defaults
 * @returns A complete StoryblokConfig object with all required fields
 */
export async function promptForConfig(
  existing: Partial<StoryblokConfig>,
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

  const region = await select({
    message: "Select your Storyblok region:",
    choices: [
      {
        value: "eu" as StoryblokRegion,
        name: "EU (default) - For spaces created in the EU",
      },
      {
        value: "us" as StoryblokRegion,
        name: "US - For spaces created in the US",
      },
      {
        value: "ap" as StoryblokRegion,
        name: "Australia - For spaces created in Australia",
      },
      {
        value: "ca" as StoryblokRegion,
        name: "Canada - For spaces created in Canada",
      },
      {
        value: "cn" as StoryblokRegion,
        name: "China - For spaces created in China",
      },
    ],
    default: existing.region || "eu",
  });

  return {
    spaceId,
    oauthToken,
    region,
  };
}

import { cosmiconfig } from "cosmiconfig";
import { config } from "dotenv";
import { writeFile } from "fs/promises";
import path from "path";
import { StoryblokConfig } from "../types/config";

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
    JSON.stringify(config, null, 2)
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

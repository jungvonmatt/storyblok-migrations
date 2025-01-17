import { cosmiconfig } from "cosmiconfig";
import { config } from "dotenv";
import { writeFile } from "fs/promises";
import path from "path";
import { StoryblokConfig } from "../types/config";

const explorer = cosmiconfig("storyblok");

export async function loadEnvConfig(): Promise<Partial<StoryblokConfig>> {
  config(); // Load .env file

  return {
    spaceId: process.env.STORYBLOK_SPACE_ID,
    oauthToken: process.env.STORYBLOK_OAUTH_TOKEN,
  };
}

export async function saveConfig(config: StoryblokConfig): Promise<void> {
  await writeFile(
    path.join(process.cwd(), ".storyblok.config.json"),
    JSON.stringify(config, null, 2)
  );
}

export async function loadConfig(): Promise<StoryblokConfig | null> {
  const result = await explorer.search();
  return result?.config || null;
}

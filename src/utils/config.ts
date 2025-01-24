import { cosmiconfig } from "cosmiconfig";
import { config } from "dotenv";
import { writeFile } from "fs/promises";
import path from "path";
import { StoryblokConfig } from "../types/config";

const explorer = cosmiconfig("storyblok");

// TODO:
// 1. gibt es eine config
// 2. evtl. ueberschreiben mit env variables
// 3. ansonsten mit cli arguments
// 4. Falls eine von beiden fehlt, spaceId oder oauthToken, dann nach der fehlenden fragen
// 5. config speichern in .storyblok.config.json

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

export async function loadConfig(): Promise<StoryblokConfig | null> {
  try {
    const result = await explorer.search();
    return result?.config || null;
  } catch (error) {
    console.error("Error loading config:", error);
    return null;
  }
}

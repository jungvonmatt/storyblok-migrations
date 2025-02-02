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

export async function loginToStoryblok() {
  try {
    if (!isStoryblokCliInstalled()) {
      console.error(
        pc.red(
          "✗ Storyblok CLI not found. Please install it first:\n" +
            "npm install -g storyblok\n" +
            "or\n" +
            "yarn global add storyblok"
        )
      );
      process.exit(1);
    }

    const config = await loadConfig();

    if (!config?.oauthToken) {
      console.error(
        pc.red(
          "✗ No Storyblok OAuth token found. Please run 'storyblok-migrate config' first."
        )
      );
      process.exit(1);
    }

    console.log(pc.blue("Logging in to Storyblok..."));

    try {
      execSync(`storyblok login --token ${config.oauthToken} --region eu`, {
        stdio: "inherit",
      });
      console.log(pc.green("✓ Successfully logged in to Storyblok"));
    } catch (error) {
      console.error(pc.red("✗ Failed to login to Storyblok."));
      process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`✗ Failed to login: ${error}`));
    process.exit(1);
  }
}

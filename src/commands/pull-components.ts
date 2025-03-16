import { execSync } from "child_process";
import pc from "picocolors";
import { loadConfig } from "../utils/config";
import { isStoryblokCliInstalled } from "./login";

export async function pullComponents() {
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

    if (!config?.spaceId) {
      console.error(
        pc.red(
          "✗ No Storyblok Space ID found. Please run 'sb-migrate config' first."
        )
      );
      process.exit(1);
    }

    console.log(pc.blue("Pulling components from Storyblok..."));

    try {
      execSync(`storyblok pull-components --space ${config.spaceId}`, {
        stdio: "inherit",
      });
      console.log(pc.green("✓ Successfully pulled components"));
    } catch (error) {
      console.error(
        pc.red(`✗ Failed to pull components from Storyblok: ${error}`)
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`✗ Failed to pull components: ${error}`));
    process.exit(1);
  }
}

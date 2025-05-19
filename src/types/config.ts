export type StoryblokRegion = "eu" | "us" | "ap" | "ca" | "cn";

export interface StoryblokConfig {
  spaceId: string;
  oauthToken: string;
  region: StoryblokRegion;
}

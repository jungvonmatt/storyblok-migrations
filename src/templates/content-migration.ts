import StoryblokClient from "storyblok-js-client";

/**
 * Content migration: {{migrationName}}
 *
 * This migration modifies content entries in Storyblok.
 */
export default async function (client: StoryblokClient) {
  // Example: Get stories
  // const { data } = await client.get('stories', {
  //   starts_with: 'your-folder/',
  //   per_page: 100
  // });

  // Example: Update a story
  // await client.put('stories/12345', {
  //   story: {
  //     name: 'Updated Story Title',
  //     content: {
  //       component: 'page',
  //       body: [
  //         // Your content blocks
  //       ]
  //     }
  //   }
  // });

  console.log("Content migration completed");
}

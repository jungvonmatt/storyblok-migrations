import StoryblokClient from "storyblok-js-client";

/**
 * Schema migration: {{migrationName}}
 *
 * This migration modifies component schemas in Storyblok.
 */
export default async function (client: StoryblokClient) {
  // Get components
  // const { data } = await client.get('components');

  // Example: Create a new component
  // await client.post('components', {
  //   component: {
  //     name: 'example',
  //     display_name: 'Example',
  //     schema: {
  //       title: {
  //         type: 'text',
  //         pos: 0
  //       }
  //     }
  //   }
  // });

  // Example: Update an existing component
  // await client.put('components/12345', {
  //   component: {
  //     name: 'example',
  //     display_name: 'Example Updated',
  //     schema: {
  //       title: {
  //         type: 'text',
  //         pos: 0
  //       },
  //       subtitle: {
  //         type: 'text',
  //         pos: 1
  //       }
  //     }
  //   }
  // });

  console.log(`Schema migration completed ${client}`);
}

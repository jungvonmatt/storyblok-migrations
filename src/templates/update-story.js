import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "update-story",
  description: "{{migrationName}}",
  // Can be either a numeric ID or a slug
  id: "example-page",
  story: {
    // Uncomment to update the story name
    // name: "Updated Page Title",

    // Uncomment to update the story slug
    // slug: "updated-page-slug",

    // Update the content
    content: {
      component: "page",
      body: [
        {
          component: "headline",
          text: "Updated Headline",
          // Add additional properties based on your headline component
        },
        {
          component: "text",
          body: "<p>Updated content paragraph.</p>",
          // Add additional properties based on your text component
        },
      ],
    },

    // Set to true if you want to publish the story after updating
    publish: true,
  },
});

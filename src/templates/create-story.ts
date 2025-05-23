import { defineMigration } from "@jungvonmatt/sb-migrate";

export default defineMigration({
  type: "create-story",
  description: "{{migrationName}}",
  story: {
    name: "Example Page",
    slug: "example-page",
    content: {
      component: "page",
      body: [
        {
          component: "headline",
          text: "Example Heading",
          // Add additional properties based on your headline component
        },
        {
          component: "text",
          body: "<p>Example content paragraph.</p>",
          // Add additional properties based on your text component
        },
      ],
    },
    // Set to true if you want to publish the story immediately
    publish: true,
    // Uncomment to set a parent for the story
    // parent_id: 123456,
  },
});

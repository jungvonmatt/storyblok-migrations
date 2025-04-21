import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "page",
    display_name: "Page",
    is_root: true,
    is_nestable: false,
    component_group_name: "Structure",

    schema: {
      body: {
        type: "bloks",
        display_name: "Content Blocks",
        restrict_components: true,
        component_whitelist: ["headline", "text", "image", "link"],
      },
      meta_title: {
        type: "text",
        display_name: "Meta Title",
        translatable: true,
        description: "Used for browser title and social sharing",
      },
      meta_description: {
        type: "textarea",
        display_name: "Meta Description",
        translatable: true,
        max_length: 160,
        description: "Used for search results and social sharing",
      },
      meta_image: {
        type: "asset",
        filetypes: ["images"],
        display_name: "Social Sharing Image",
      },
    },

    tabs: {
      general: ["body"],
      seo: ["meta_title", "meta_description", "meta_image"],
    },
  },
});

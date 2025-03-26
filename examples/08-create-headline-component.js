/* eslint-disable no-undef */
const type = "create-component";

const schema = {
  name: "headline",
  display_name: "Headline",
  is_root: false,
  is_nestable: true,
  component_group_name: "Content",

  schema: {
    text: {
      type: "text",
      display_name: "Headline Text",
      translatable: true,
      required: true,
    },
    look: {
      type: "option",
      display_name: "Appearance",
      source: "internal",
      datasource_slug: "headline-look",
      default_value: "h1",
    },
    tag: {
      type: "option",
      display_name: "HTML Tag",
      source: "internal",
      datasource_slug: "headline-tag",
      default_value: "h2",
    },
    weight: {
      type: "option",
      display_name: "Font Weight",
      source: "internal",
      datasource_slug: "headline-weight",
      default_value: "semibold",
    },
    color: {
      type: "custom",
      field_type: "storyblok-colorpicker",
      display_name: "Text Color",
      options: [],
    },
  },

  tabs: {
    general: ["text"],
    settings: ["look", "tag", "weight", "color"],
  },
};

module.exports = { type, schema };

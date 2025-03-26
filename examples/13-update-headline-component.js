/* eslint-disable no-undef */
const type = "update-component";

const name = "headline";

const schema = {
  schema: {
    margin_top: {
      type: "option",
      display_name: "Margin Top",
      source: "internal",
      datasource_slug: "margin",
      default_value: "none",
    },
  },

  tabs: {
    general: ["text"],
    settings: ["look", "tag", "weight", "color", "margin_top"],
  },
};

module.exports = { type, name, schema };

import {
  defineMigration,
  richtextField,
  textField,
  optionField,
  booleanField,
} from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "Text",
    display_name: "Text",
    is_root: false,
    is_nestable: true,
    component_group_name: "Content",
    schema: {
      body: richtextField({
        translatable: true,
        customize_toolbar: true,
        toolbar: [
          "bold",
          "italic",
          "strike",
          "underline",
          "inlinecode",
          "code",
          "paragraph",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "list",
          "olist",
          "quote",
          "hrule",
          "link",
          "paste",
          "blok",
          "image",
        ],
      }),
      id: textField({
        display_name: "Id",
        regex: "^([a-zA-Z]+(?:[a-zA-Z0-9\\-_.:]+)*)*$",
        description:
          'Id of this element (must start with letter)\n(only characters, numbers, "_", ".", ":" and "-",eg. "Test-Id-2")',
      }),
      margin_top: optionField({
        display_name: "Margin Top",
        source: "internal",
        datasource_slug: "margin",
        default_value: "none",
      }),
      no_margin: booleanField({
        display_name: "No Margin",
        default_value: false,
      }),
    },
    tabs: {
      general: ["body"],
      settings: ["id", "margin_top", "no_margin"],
    },
  },
});

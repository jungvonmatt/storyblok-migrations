import {
  defineMigration,
  textField,
  optionField,
  booleanField,
  bloksField,
  sectionField,
} from "sb-migrate";

export default defineMigration({
  type: "create-component",
  schema: {
    name: "ProductSlider",
    display_name: "Product Slider",
    is_root: false,
    is_nestable: true,
    component_group_name: "Content",
    schema: {
      product_ids: textField({
        display_name: "Product Ids",
        description:
          "Scayle product ids separated by comma.\nDeprecated because ids are different accross environments",
      }),
      product_reference_keys: textField({
        display_name: "Product Reference keys",
        description:
          "Add referenceKeys separated by comma.\nThe reference key is same on all Scayle environments and refers to the Akeneo ID",
      }),
      paragraph: sectionField({
        keys: [
          "paragraph_active",
          "paragraph_overline",
          "paragraph_headline",
          "paragraph_subline",
          "cta_ref",
        ],
      }),
      paragraph_active: booleanField({
        display_name: "Include Paragraph",
        default_value: false,
      }),
      paragraph_overline: textField({
        display_name: "Overline",
        translatable: true,
      }),
      paragraph_headline: textField({
        display_name: "Headline",
        translatable: true,
      }),
      paragraph_subline: textField({
        display_name: "Subline",
        translatable: true,
      }),
      cta_ref: bloksField({
        display_name: "Call to Action",
        restrict_components: true,
        maximum: 1,
        component_whitelist: ["Link"],
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
        default_value: "none",
        datasource_slug: "margin",
      }),
      creative_name: textField({
        display_name: "Creative Name",
      }),
      promotion_name: textField({
        display_name: "Promotion Name",
      }),
    },
    tabs: {
      general: [
        "product_reference_keys",
        "product_ids",
        "paragraph",
        "paragraph_active",
        "paragraph_overline",
        "paragraph_headline",
        "paragraph_subline",
        "cta_ref",
      ],
      settings: ["id", "margin_top", "creative_name", "promotion_name"],
      deprecated: [
        "headline",
        "headline_tag",
        "headline_look",
        "cta_label",
        "cta_url",
        "cta_variant",
        "id_target",
        "cta_target_blank",
        "paragraph_category",
        "paragraph_subheadline",
      ],
    },
  },
});

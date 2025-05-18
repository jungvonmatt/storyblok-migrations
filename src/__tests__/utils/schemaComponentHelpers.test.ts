import { describe, it, expect } from "vitest";
import {
  textField,
  textareaField,
  bloksField,
  richtextField,
  markdownField,
  numberField,
  datetimeField,
  booleanField,
  optionsField,
  optionField,
  assetField,
  multiassetField,
  multilinkField,
  tableField,
  sectionField,
  customField,
  tabField,
} from "../../utils/schemaComponentHelpers";
import {
  RichtextToolbarKeys,
  MarkdownToolbarKeys,
  AssetFileTypes,
} from "../../types/IComponent";

describe("Schema Component Helpers", () => {
  describe("textField", () => {
    it("should create a text field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Title",
        required: true,
        translatable: true,
      };

      // Act
      const result = textField(props);

      // Assert
      expect(result).toEqual({
        type: "text",
        display_name: "Title",
        required: true,
        translatable: true,
      });
    });

    it("should create a text field with all optional properties", () => {
      // Arrange
      const props = {
        display_name: "Title",
        required: true,
        translatable: true,
        description: "Enter the title",
        tooltip: true,
        rtl: true,
        default_value: "Default Title",
        max_length: 50,
        regex: "^[A-Za-z0-9 ]+$",
        pos: 0,
      };

      // Act
      const result = textField(props);

      // Assert
      expect(result).toEqual({
        type: "text",
        ...props,
      });
    });
  });

  describe("textareaField", () => {
    it("should create a textarea field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Description",
        required: false,
        translatable: true,
      };

      // Act
      const result = textareaField(props);

      // Assert
      expect(result).toEqual({
        type: "textarea",
        display_name: "Description",
        required: false,
        translatable: true,
      });
    });

    it("should create a textarea field with all optional properties", () => {
      // Arrange
      const props = {
        display_name: "Description",
        required: false,
        translatable: true,
        description: "Enter the description",
        tooltip: true,
        rtl: true,
        default_value: "Default Description",
        max_length: 255,
        pos: 1,
      };

      // Act
      const result = textareaField(props);

      // Assert
      expect(result).toEqual({
        type: "textarea",
        ...props,
      });
    });
  });

  describe("bloksField", () => {
    it("should create a blocks field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Content",
        required: true,
        translatable: true,
      };

      // Act
      const result = bloksField(props);

      // Assert
      expect(result).toEqual({
        type: "bloks",
        display_name: "Content",
        required: true,
        translatable: true,
      });
    });

    it("should create a blocks field with component restrictions", () => {
      // Arrange
      const props = {
        display_name: "Content",
        required: true,
        translatable: true,
        restrict_components: true as const,
        component_whitelist: ["text", "image"],
        minimum: 1,
        maximum: 5,
      };

      // Act
      const result = bloksField(props);

      // Assert
      expect(result).toEqual({
        type: "bloks",
        ...props,
      });
    });
  });

  describe("richtextField", () => {
    it("should create a richtext field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Content",
        required: true,
        translatable: true,
      };

      // Act
      const result = richtextField(props);

      // Assert
      expect(result).toEqual({
        type: "richtext",
        display_name: "Content",
        required: true,
        translatable: true,
      });
    });

    it("should create a richtext field with toolbar customization", () => {
      // Arrange
      const props = {
        display_name: "Content",
        required: true,
        translatable: true,
        customize_toolbar: true,
        toolbar: ["bold", "italic", "link"] as RichtextToolbarKeys[],
        allow_target_blank: true,
        allow_custom_attributes: true,
      };

      // Act
      const result = richtextField(props);

      // Assert
      expect(result).toEqual({
        type: "richtext",
        ...props,
      });
    });
  });

  describe("markdownField", () => {
    it("should create a markdown field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Content",
        required: true,
        translatable: true,
      };

      // Act
      const result = markdownField(props);

      // Assert
      expect(result).toEqual({
        type: "markdown",
        display_name: "Content",
        required: true,
        translatable: true,
      });
    });

    it("should create a markdown field with rich markdown options", () => {
      // Arrange
      const props = {
        display_name: "Content",
        required: true,
        translatable: true,
        rich_markdown: true,
        allow_multiline: true,
        customize_toolbar: true,
        toolbar: ["bold", "italic", "link"] as MarkdownToolbarKeys[],
      };

      // Act
      const result = markdownField(props);

      // Assert
      expect(result).toEqual({
        type: "markdown",
        ...props,
      });
    });
  });

  describe("numberField", () => {
    it("should create a number field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Quantity",
        required: true,
        translatable: false,
      };

      // Act
      const result = numberField(props);

      // Assert
      expect(result).toEqual({
        type: "number",
        display_name: "Quantity",
        required: true,
        translatable: false,
      });
    });

    it("should create a number field with validation constraints", () => {
      // Arrange
      const props = {
        display_name: "Quantity",
        required: true,
        translatable: false,
        min_value: 0 as const,
        max_value: 1 as const,
        decimals: 2 as const,
        steps: 10 as const,
        default_value: "0",
      };

      // Act
      const result = numberField(props);

      // Assert
      expect(result).toEqual({
        type: "number",
        ...props,
      });
    });
  });

  describe("datetimeField", () => {
    it("should create a datetime field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Date and Time",
        required: true,
        translatable: false,
      };

      // Act
      const result = datetimeField(props);

      // Assert
      expect(result).toEqual({
        type: "datetime",
        display_name: "Date and Time",
        required: true,
        translatable: false,
      });
    });

    it("should create a datetime field with time disabled", () => {
      // Arrange
      const props = {
        display_name: "Date",
        required: true,
        translatable: false,
        disable_time: true,
        default_value: "2024-01-01",
      };

      // Act
      const result = datetimeField(props);

      // Assert
      expect(result).toEqual({
        type: "datetime",
        ...props,
      });
    });
  });

  describe("booleanField", () => {
    it("should create a boolean field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Active",
        required: true,
        translatable: false,
      };

      // Act
      const result = booleanField(props);

      // Assert
      expect(result).toEqual({
        type: "boolean",
        display_name: "Active",
        required: true,
        translatable: false,
      });
    });

    it("should create a boolean field with inline label", () => {
      // Arrange
      const props = {
        display_name: "Active",
        required: true,
        translatable: false,
        inline_label: true,
        default_value: true,
      };

      // Act
      const result = booleanField(props);

      // Assert
      expect(result).toEqual({
        type: "boolean",
        ...props,
      });
    });
  });

  describe("optionsField", () => {
    it("should create an options field with self-defined options", () => {
      // Arrange
      const props = {
        display_name: "Size",
        source: "self" as const,
        options: [
          { name: "Small", value: "small" },
          { name: "Medium", value: "medium" },
          { name: "Large", value: "large" },
        ],
        default_value: "medium",
      };

      // Act
      const result = optionsField(props);

      // Assert
      expect(result).toEqual({
        type: "options",
        ...props,
      });
    });

    it("should create an options field with datasource", () => {
      // Arrange
      const props = {
        display_name: "Category",
        source: "internal" as const,
        datasource_slug: "categories",
        default_value: "electronics",
      };

      // Act
      const result = optionsField(props);

      // Assert
      expect(result).toEqual({
        type: "options",
        ...props,
      });
    });
  });

  describe("optionField", () => {
    it("should create an option field with self-defined options", () => {
      // Arrange
      const props = {
        display_name: "Alignment",
        source: "self" as const,
        options: [
          { name: "Left", value: "left" },
          { name: "Center", value: "center" },
          { name: "Right", value: "right" },
        ],
        default_value: "left",
      };

      // Act
      const result = optionField(props);

      // Assert
      expect(result).toEqual({
        type: "option",
        ...props,
      });
    });

    it("should create an option field with UUID support", () => {
      // Arrange
      const props = {
        display_name: "Category",
        source: "internal" as const,
        datasource_slug: "categories",
        use_uuid: true,
      };

      // Act
      const result = optionField(props);

      // Assert
      expect(result).toEqual({
        type: "option",
        ...props,
      });
    });
  });

  describe("assetField", () => {
    it("should create an asset field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Image",
        required: true,
        translatable: false,
      };

      // Act
      const result = assetField(props);

      // Assert
      expect(result).toEqual({
        type: "asset",
        display_name: "Image",
        required: true,
        translatable: false,
      });
    });

    it("should create an asset field with file type restrictions", () => {
      // Arrange
      const props = {
        display_name: "Image",
        required: true,
        translatable: false,
        filetypes: ["images"] as AssetFileTypes[],
        allow_external_url: true,
      };

      // Act
      const result = assetField(props);

      // Assert
      expect(result).toEqual({
        type: "asset",
        ...props,
      });
    });
  });

  describe("multiassetField", () => {
    it("should create a multiasset field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Gallery",
        required: true,
        translatable: false,
      };

      // Act
      const result = multiassetField(props);

      // Assert
      expect(result).toEqual({
        type: "multiasset",
        display_name: "Gallery",
        required: true,
        translatable: false,
      });
    });

    it("should create a multiasset field with file type restrictions", () => {
      // Arrange
      const props = {
        display_name: "Gallery",
        required: true,
        translatable: false,
        filetypes: ["images", "videos"] as AssetFileTypes[],
        allow_external_url: true,
      };

      // Act
      const result = multiassetField(props);

      // Assert
      expect(result).toEqual({
        type: "multiasset",
        ...props,
      });
    });
  });

  describe("multilinkField", () => {
    it("should create a multilink field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Link",
        required: true,
        translatable: false,
      };

      // Act
      const result = multilinkField(props);

      // Assert
      expect(result).toEqual({
        type: "multilink",
        display_name: "Link",
        required: true,
        translatable: false,
      });
    });

    it("should create a multilink field with advanced options", () => {
      // Arrange
      const props = {
        display_name: "Link",
        required: true,
        translatable: false,
        show_anchor: true,
        allow_target_blank: true,
        allow_custom_attributes: true,
        restrict_content_types: true,
        component_whitelist: ["page", "post"],
      };

      // Act
      const result = multilinkField(props);

      // Assert
      expect(result).toEqual({
        type: "multilink",
        ...props,
      });
    });
  });

  describe("tableField", () => {
    it("should create a table field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Table",
        required: true,
        translatable: false,
      };

      // Act
      const result = tableField(props);

      // Assert
      expect(result).toEqual({
        type: "table",
        display_name: "Table",
        required: true,
        translatable: false,
      });
    });
  });

  describe("sectionField", () => {
    it("should create a section field with keys", () => {
      // Arrange
      const props = {
        display_name: "Section",
        required: true,
        translatable: false,
        keys: ["title", "description", "image"],
      };

      // Act
      const result = sectionField(props);

      // Assert
      expect(result).toEqual({
        type: "section",
        display_name: "Section",
        required: true,
        translatable: false,
        keys: ["title", "description", "image"],
      });
    });
  });

  describe("customField", () => {
    it("should create a custom field with basic properties", () => {
      // Arrange
      const props = {
        display_name: "Custom",
        required: true,
        translatable: false,
        field_type: "custom_type",
      };

      // Act
      const result = customField(props);

      // Assert
      expect(result).toEqual({
        type: "custom",
        display_name: "Custom",
        required: true,
        translatable: false,
        field_type: "custom_type",
      });
    });

    it("should create a custom field with options and required fields", () => {
      // Arrange
      const props = {
        display_name: "Custom",
        required: true,
        translatable: false,
        field_type: "custom_type",
        options: [{ name: "Option 1", value: "opt1" }],
        required_fields: "field1,field2",
      };

      // Act
      const result = customField(props);

      // Assert
      expect(result).toEqual({
        type: "custom",
        ...props,
      });
    });
  });

  describe("tabField", () => {
    it("should create a tab field with keys", () => {
      // Arrange
      const props = {
        display_name: "Tab",
        required: true,
        translatable: false,
        keys: ["tab1", "tab2", "tab3"],
      };

      // Act
      const result = tabField(props);

      // Assert
      expect(result).toEqual({
        type: "tab",
        display_name: "Tab",
        required: true,
        translatable: false,
        keys: ["tab1", "tab2", "tab3"],
      });
    });
  });
});

import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "transform-entries",
  component: "headline",
  transform: (blok) => {
    // Standardize all headlines to use correct casing
    if (blok.text) {
      // Convert first letter of each word to uppercase
      blok.text = blok.text.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    // Set default margin if not specified
    if (!blok.margin_top) {
      blok.margin_top = "medium";
    }
  },

  publish: "all",
  languages: "ALL_LANGUAGES",
});

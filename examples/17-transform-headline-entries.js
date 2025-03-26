/* eslint-disable no-undef */
const type = "transform-entries";

const component = "headline";

const transform = (blok) => {
  // Standardize all headlines to use correct casing
  if (blok.text) {
    // Convert first letter of each word to uppercase
    blok.text = blok.text.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // Set default margin if not specified
  if (!blok.margin_top) {
    blok.margin_top = "medium";
  }
};

// Optional: Configure publish behavior
const publish = "published"; // Only publish already published stories
const languages = "ALL_LANGUAGES"; // Apply to all languages

module.exports = { type, component, transform, publish, languages };

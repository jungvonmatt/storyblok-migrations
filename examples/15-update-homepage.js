/* eslint-disable no-undef */
const type = "update-story";

const id = 1; // You'd need to find the actual ID after creating it

const story = {
  content: {
    // Update existing content
    body: [
      {
        component: "headline",
        text: "Welcome to Our New Website",
        look: "h1",
        tag: "h1",
        weight: "bold",
        color: "#3a86ff", // Adding color
        margin_top: "medium", // Using new field
      },
      {
        component: "text",
        body: "<p>We've updated our website with a fresh new look. Take a look around!</p>",
      },
      // Existing components will remain
    ],
  },

  publish: true,
};

module.exports = { type, id, story };

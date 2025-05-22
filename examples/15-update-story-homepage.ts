import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "update-story",
  id: "home",
  story: {
    content: {
      component: "page",
      body: [
        {
          component: "headline",
          text: "Welcome to Our New Website",
          look: "h1",
          tag: "h1",
          weight: "bold",
          color: "#3a86ff",
          margin_top: "medium",
        },
        {
          component: "text",
          body: "<p>We've updated our website with a fresh new look. Take a look around!</p>",
        },
      ],
    },

    publish: true,
  },
});

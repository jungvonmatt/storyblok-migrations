import { defineMigration } from "@jungvonmatt/sb-migrate";

export default defineMigration({
  type: "create-story",
  story: {
    name: "About",
    slug: "about",

    content: {
      component: "page",
      body: [
        {
          component: "headline",
          text: "About Our Company",
          look: "h1",
          tag: "h1",
          weight: "bold",
          margin_top: "none",
        },
        {
          component: "text",
          body: "<p>Founded in 2023, our company has been dedicated to providing the best service possible.</p>",
        },
      ],
      meta_title: "About Our Company",
      meta_description:
        "Learn more about our company history, mission and values.",
    },

    publish: true,
  },
});

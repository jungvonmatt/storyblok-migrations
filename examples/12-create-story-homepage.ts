import { defineMigration } from "@jungvonmatt/sb-migrate";

export default defineMigration({
  type: "create-story",
  story: {
    name: "Home",
    slug: "home",

    content: {
      component: "page",
      body: [
        {
          component: "headline",
          text: "Welcome to Our Website",
          look: "h1",
          tag: "h1",
          weight: "bold",
        },
        {
          component: "text",
          body: "<p>This is our new website built with Storyblok. We're excited to share our content with you.</p>",
        },
        {
          component: "image",
          desktop_image: {
            id: 0,
            alt: "Placeholder - upload an image",
            name: "",
          },
          alt_text: "Hero image",
        },
        {
          component: "link",
          text: "Learn More",
          url: "/about",
          appearance: "button",
        },
      ],
      meta_title: "Welcome to Our Website",
      meta_description:
        "Our official website homepage with the latest information and updates.",
    },

    publish: true,
  },
});

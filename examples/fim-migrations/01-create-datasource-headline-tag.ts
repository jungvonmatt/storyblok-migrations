import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Headline Tag",
  slug: "headline-tag",
};

const entries = [
  { name: "Heading 1", value: "h1" },
  { name: "Heading 2", value: "h2" },
  { name: "Heading 3", value: "h3" },
  { name: "Heading 4", value: "h4" },
  { name: "Heading 5", value: "h5" },
  { name: "Heading 6", value: "h6" },
  { name: "Paragraph", value: "p" },
  { name: "Div", value: "div" },
  { name: "Span", value: "span" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});

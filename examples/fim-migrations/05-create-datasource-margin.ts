import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Margin",
  slug: "margin",
};

const entries = [
  { name: "None", value: "none" },
  { name: "XS", value: "xs" },
  { name: "SM", value: "sm" },
  { name: "MD", value: "md" },
  { name: "LG", value: "lg" },
  { name: "XL", value: "xl" },
  { name: "2XL", value: "2xl" },
  { name: "3XL", value: "3xl" },
  { name: "4XL", value: "4xl" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});

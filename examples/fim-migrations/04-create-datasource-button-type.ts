import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Button Type",
  slug: "button-type",
};

const entries = [
  { name: "Primary", value: "primary" },
  { name: "Secondary", value: "secondary" },
  { name: "Play Store", value: "play-store" },
  { name: "App Store", value: "app-store" },
  { name: "Link", value: "link" },
  { name: "Link Alternative", value: "link-alternative" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});

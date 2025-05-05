import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Overlay Product Types",
  slug: "overlay-product-types",
};

const entries = [
  { name: "RX Glasses", value: "glasses" },
  { name: "Sunglasses", value: "sunglasses" },
  { name: "Readymade Glasses", value: "readyMadeGlasses" },
  { name: "Contact Lenses", value: "contactLenses" },
  { name: "Care Products", value: "careproducts" },
  { name: "Merchandise", value: "merch" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});

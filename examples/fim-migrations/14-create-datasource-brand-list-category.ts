import { defineMigration } from "sb-migrate";

const datasource = {
  name: "Brand List Category",
  slug: "brand-list-category",
};

const entries = [
  { name: "Glasses", value: "brillen" },
  { name: "Sunglasses", value: "sonnenbrillen" },
  { name: "Contact Lenses", value: "kontaktlinsen" },
  { name: "Contact Lens Care", value: "kontaktlinsenpflege" },
];

export default defineMigration({
  type: "create-datasource",
  datasource,
  entries,
});

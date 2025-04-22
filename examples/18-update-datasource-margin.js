import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "update-datasource",
  id: "margin",
  datasource: {
    name: "Margin",
  },
});

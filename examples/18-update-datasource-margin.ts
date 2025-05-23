import { defineMigration } from "@jungvonmatt/sb-migrate";

export default defineMigration({
  type: "update-datasource",
  id: "margin",
  datasource: {
    name: "Margin",
  },
});

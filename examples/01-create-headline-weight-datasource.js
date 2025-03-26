/* eslint-disable no-undef */
const type = "create-datasource";

const datasource = {
  name: "Headline Weight",
  slug: "headline-weight",
};

const entries = [
  { name: "Regular", value: "regular" },
  { name: "Medium", value: "medium" },
  { name: "SemiBold", value: "semibold" },
  { name: "Bold", value: "bold" },
];

module.exports = { type, datasource, entries };

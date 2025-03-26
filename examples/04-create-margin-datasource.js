/* eslint-disable no-undef */
const type = "create-datasource";

const datasource = {
  name: "Margin",
  slug: "margin",
};

const entries = [
  { name: "None", value: "none" },
  { name: "Small", value: "small" },
  { name: "Medium", value: "medium" },
  { name: "Large", value: "large" },
  { name: "Extra Large", value: "xl" },
];

module.exports = { type, datasource, entries };

/* eslint-disable no-undef */
const type = "create-datasource";

const datasource = {
  name: "Object Fit",
  slug: "object-fit",
};

const entries = [
  { name: "Cover", value: "cover" },
  { name: "Contain", value: "contain" },
  { name: "Fill", value: "fill" },
  { name: "ScaleDown", value: "scale-down" },
  { name: "None", value: "none" },
];

module.exports = { type, datasource, entries };

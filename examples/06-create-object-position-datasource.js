/* eslint-disable no-undef */
const type = "create-datasource";

const datasource = {
  name: "Object Position",
  slug: "object-position",
};

const entries = [
  { name: "Center", value: "center" },
  { name: "Top", value: "top" },
  { name: "Bottom", value: "bottom" },
  { name: "Left", value: "left" },
  { name: "Right", value: "right" },
  { name: "Top Left", value: "top left" },
  { name: "Top Right", value: "top right" },
  { name: "Bottom Left", value: "bottom left" },
  { name: "Bottom Right", value: "bottom right" },
];

module.exports = { type, datasource, entries };

import { defineMigration } from "sb-migrate";

export default defineMigration({
  type: "transform-entries",
  component: "Headline",
  transform: (blok: Record<string, any>) => {
    // Transfer content from label to text field
    if (blok.label) {
      blok.text = blok.label;
    }

    return blok;
  },
});

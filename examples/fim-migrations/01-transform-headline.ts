import { defineMigration } from "sb-migrate";
import { IStoryContent } from "../../dist/src/types/stories/IStoryContent";
export default defineMigration({
  type: "transform-entries",
  component: "Headline",
  transform: (blok: IStoryContent) => {
    // Transfer content from label to text field
    if (blok.label) {
      blok.text = blok.label;
    }

    return blok;
  },
});

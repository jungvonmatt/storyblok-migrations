import { defineMigration } from "sb-migrate";
import { IStoryContent } from "../../dist/src/types/stories/IStoryContent";
export default defineMigration({
  type: "transform-entries",
  component: "BrandList",
  transform: (blok: IStoryContent) => {
    // Transform headline fields to headline_ref blok
    if (blok.headline) {
      blok.headline_ref = [
        {
          component: "Headline",
          text: blok.headline,
          tag: blok.headline_tag || "h2",
          look: blok.headline_look || "h1",
          weight: "semibold",
        },
      ];
    }

    return blok;
  },
});

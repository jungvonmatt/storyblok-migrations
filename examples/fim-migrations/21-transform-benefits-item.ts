import { defineMigration } from "sb-migrate";
import { IStoryContent } from "../../dist/src/types/stories/IStoryContent";
export default defineMigration({
  type: "transform-entries",
  component: "BenefitsItem",
  transform: (blok: IStoryContent) => {
    // Transform text field to text_ref blok
    if (blok.text) {
      blok.text_ref = [
        {
          component: "Text",
          body: blok.text,
        },
      ];
    }

    // Convert string icon to asset object if needed
    if (typeof blok.icon === "string") {
      blok.icon = {
        id: blok.icon,
        filename: blok.icon,
        alt: "",
      };
    }

    return blok;
  },
});

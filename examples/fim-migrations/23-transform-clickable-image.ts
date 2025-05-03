import { defineMigration } from "sb-migrate";
import { IStoryContent } from "../../dist/src/types/stories/IStoryContent";
export default defineMigration({
  type: "transform-entries",
  component: "ClickableImage",
  transform: (blok: IStoryContent) => {
    // Transform cta fields to cta_ref blok
    if (blok.cta_url || blok.cta_label) {
      blok.cta_ref = [
        {
          component: "Link",
          text: blok.cta_label || "",
          url: blok.cta_url || "#",
          target_blank: blok.cta_target_blank || false,
          id: blok.id_target || "",
          appearance: "button", // Default to button appearance
        },
      ];
    }

    // Transfer object_fit and object_position to the first image item if it exists
    if (blok?.image?.[0]) {
      if (blok.object_fit) {
        blok.image[0].object_fit = blok.object_fit;
      }

      if (blok.object_position) {
        blok.image[0].object_position = blok.object_position;
      }
    }

    return blok;
  },
});

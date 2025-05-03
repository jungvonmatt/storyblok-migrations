import { defineMigration } from "sb-migrate";
import { IStoryContent } from "../../dist/src/types/stories/IStoryContent";
export default defineMigration({
  type: "transform-entries",
  component: "ProductSlider",
  transform: (blok: IStoryContent) => {
    // Copy fields and translations
    if (blok.paragraph_category) {
      blok.paragraph_overline = blok.paragraph_category;
    }

    if (blok.paragraph_subheadline) {
      blok.paragraph_subline = blok.paragraph_subheadline;
    }

    // Transform CTA fields to cta_ref blok
    if (blok.cta_url || blok.cta_label) {
      blok.cta_ref = [
        {
          component: "Link",
          text: blok.cta_label || "",
          url: blok.cta_url || "#",
          target_blank: blok.cta_target_blank || false,
          id: blok.id_target || "",
          appearance: blok.cta_variant || "button",
        },
      ];
    }

    // Set paragraph_active to true if paragraph data exists
    if (
      blok.paragraph_headline ||
      blok.paragraph_overline ||
      blok.paragraph_subline ||
      blok.cta_ref
    ) {
      blok.paragraph_active = true;
    }

    return blok;
  },
});

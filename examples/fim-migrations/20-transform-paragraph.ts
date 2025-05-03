import { defineMigration } from "sb-migrate";
import { IStoryContent } from "../../dist/src/types/stories/IStoryContent";
export default defineMigration({
  type: "transform-entries",
  component: "Paragraph",
  transform: (blok: IStoryContent) => {
    // Transform headline fields to headline_ref blok
    if (blok.headline) {
      blok.headline_ref = [
        {
          component: "Headline",
          text: blok.headline,
          tag: blok.headline_tag || "h2",
          look: blok.headline_look || "h1",
          weight: blok.headline_weight || "semibold",
        },
      ];
    }

    // Transform sub_title to subline_ref blok
    if (blok.sub_title) {
      blok.subline_ref = [
        {
          component: "Text",
          body: blok.sub_title,
        },
      ];
    }

    // Transform body to text_ref blok
    if (blok.body) {
      blok.text_ref = [
        {
          component: "Text",
          body: blok.body,
        },
      ];
    }

    // Convert numeric margin to proper margin value
    if (blok.margin_top_desktop !== undefined) {
      const marginMap: Record<number, string> = {
        0: "none",
        1: "xs",
        2: "sm",
        3: "md",
        4: "lg",
        5: "xl",
        6: "xxl",
      };

      const numericMargin = parseInt(blok.margin_top_desktop, 10);
      if (!isNaN(numericMargin) && marginMap[numericMargin]) {
        blok.margin_top = marginMap[numericMargin];
      } else {
        blok.margin_top = "none";
      }
    }

    return blok;
  },
});

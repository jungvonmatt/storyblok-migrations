import pc from "picocolors";
import { helper } from "../utils/migration";
import { TransformEntriesMigration } from "../types/migration";
import { RunMigrationOptions } from "../utils/migration";

export const handleTransformEntries = async (
  migration: TransformEntriesMigration,
  options: RunMigrationOptions,
) => {
  console.log(
    `${pc.blue("-")} Transforming entries for component: ${migration.component}`,
  );

  if (!migration.component || typeof migration.transform !== "function") {
    throw new Error(
      "Transform migration requires a component name and transform function",
    );
  }

  try {
    const component = await helper.updateComponent(migration.component);

    await component.transformEntries(migration.transform, {
      isDryrun: options.isDryrun,
      publish: migration.publish || options.publish,
      publishLanguages: migration.languages || options.publishLanguages,
    });

    console.log(
      `${pc.green("✓")} Entries transformed successfully for: ${migration.component}`,
    );
  } catch (error) {
    console.error(`${pc.red("✗")} Failed to transform entries:`, error);
    throw error;
  }
};

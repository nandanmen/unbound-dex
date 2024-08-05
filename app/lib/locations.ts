import * as path from "path";
import { readFile } from "fs/promises";
import { cache } from "react";

export const getLocations = cache(async function getLocations(): Promise<
  Record<string, string[]>
> {
  const rawFile = await readFile(
    path.join(process.cwd(), "app/lib/locations.json"),
    "utf-8"
  );
  return JSON.parse(rawFile);
});

// turns a row-based CSV into a column-based object
export function parseLocations(records: Record<string, string>[]) {
  const locations = {} as Record<string, string[]>;

  for (const record of records) {
    Object.entries(record).forEach(([key, value]) => {
      if (!locations[key]) locations[key] = [];
      if (value) {
        locations[key].push(value.trim());
      }
    });
  }

  return locations;
}

import { cache } from "react";
import { getLocations } from "../locations";
import {
  regexBaseStats,
  regexEvolution,
  regexSpecies,
  regexSprite,
} from "./regexSpecies";
import { REPO_1, REPO_2 } from "../constants";

type Species = {
  name: string;
  readableName: string;
  id: number;
  evolutions?: Array<{
    name: string;
    evolutions?: [string, string, string][];
  }>;
  type1: string;
  type2: string;
  sprite: string;
};

type Location = {
  location: string;
  subLocations: SubLocation[];
};

type SubLocation = {
  name: string;
  encounters: Encounter[];
};

export type Encounter = {
  name: string;
  readableName: string;
  type1: string;
  type2: string;
  sprite: string;
};

export async function getSpecies({
  type,
}: {
  type?: string;
}): Promise<Location[]> {
  const [species, evolutions, locations] = await Promise.all([
    getSpeciesList(),
    getEvolution(),
    getLocations(),
  ]);

  const _species = species as Record<string, Species>;

  Object.entries(evolutions).forEach(([name, evolutions]) => {
    _species[name].evolutions = evolutions;
  });

  await Promise.all([getBaseStats(_species), getSprite(_species)]);

  const seen = new Set<string>();

  const matchType = (species: Species): boolean => {
    if (!type) return true;
    seen.add(species.name);
    const matchDirect = [species.type1, species.type2].some((t) =>
      t?.toLowerCase().endsWith(type)
    );
    if (matchDirect) return true;
    if (species.evolutions) {
      for (const evolution of species.evolutions) {
        if (seen.has(evolution.name)) continue;
        return matchType(_species[evolution.name]);
      }
    }
    return false;
  };

  const populated = Object.entries(locations).map(([key, value]) => {
    return {
      location: key,
      subLocations: groupEncounters(
        value
          .map((name) => {
            const entry = Object.values(_species).find(
              (species) => species.readableName === name
            );
            if (!entry) return name;
            if (!matchType(entry)) return null;
            return {
              name: entry.name,
              readableName: entry.readableName,
              sprite: entry.sprite,
              type1: entry.type1,
              type2: entry.type2,
            };
          })
          .filter(Boolean) as (string | Encounter)[]
      ),
    };
  });

  return populated as Location[];
}

const groupEncounters = (encounters: (string | Encounter)[]): SubLocation[] => {
  const grouped = [];
  let currentGroup: SubLocation = { name: "regular", encounters: [] };
  for (const encounter of encounters) {
    if (typeof encounter === "string") {
      if (currentGroup) {
        grouped.push(currentGroup);
      }
      currentGroup = { name: encounter, encounters: [] };
    } else {
      currentGroup.encounters.push(encounter);
    }
  }
  if (currentGroup) {
    grouped.push(currentGroup);
  }
  return grouped;
};

const getSprite = cache(async function getSprite(species: Record<string, any>) {
  const rawSprite = await fetch(
    `https://raw.githubusercontent.com/${REPO_2}/src/Front_Pic_Table.c`,
    { cache: "force-cache" }
  );
  const textSprite = await rawSprite.text();

  return regexSprite(textSprite, species);
});

const getBaseStats = cache(async function getBaseStats(
  species: Record<string, any>
) {
  const rawBaseStats = await fetch(
    `https://raw.githubusercontent.com/${REPO_2}/src/Base_Stats.c`,
    { cache: "force-cache" }
  );
  const textBaseStats = await rawBaseStats.text();
  return regexBaseStats(textBaseStats, species);
});

const getSpeciesList = cache(async function getSpeciesList() {
  const rawSpecies = await fetch(
    `https://raw.githubusercontent.com/${REPO_1}/include/constants/species.h`,
    { cache: "force-cache" }
  );
  const textSpecies = await rawSpecies.text();

  return regexSpecies(textSpecies);
});

const getEvolution = cache(async function getEvolution() {
  const rawEvolution = await fetch(
    `https://raw.githubusercontent.com/${REPO_2}/src/Evolution%20Table.c`,
    { cache: "force-cache" }
  );
  const textEvolution = await rawEvolution.text();

  return regexEvolution(textEvolution);
});

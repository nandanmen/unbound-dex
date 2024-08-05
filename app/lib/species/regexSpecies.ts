import { REPO_2 } from "../constants";

export function regexSpecies(textSpecies: string) {
  const species = {} as Record<
    string,
    { name: string; id: number; readableName: string }
  >;
  const lines = textSpecies.split("\n");
  let id = 0;

  lines.forEach((line) => {
    const matchSpecies = line.match(/#define *(SPECIES_\w+)/i);
    if (matchSpecies) {
      const name = matchSpecies[1];
      const matchID = line.match(/0[xX][0-9a-fA-F]+/i);
      if (matchID) {
        id = parseInt(matchID[0]);
        species[name] = {
          name,
          readableName: getReadableName(name),
          id,
        };
      }
    }
  });
  return species;
}

function getReadableName(key: string) {
  if (key === "SPECIES_FLABEBE") return "Flabébé";
  if (key === "SPECIES_MR_MIME") return "Mr. Mime";
  if (key === "SPECIES_MR_RIME") return "Mr. Rime";
  if (key === "SPECIES_MR_MIME_G") return "Galarian Mr. Mime";
  if (key === "SPECIES_FARFETCHD_G") return "Galarian Farfetch'd";
  if (key === "SPECIES_SIRFETCHD") return "Sirfetch'd";
  if (key === "SPECIES_FARFETCHD") return "Farfetch'd";
  if (key === "SPECIES_NIDORAN_F") return "Nidoran♀️";
  if (key === "SPECIES_NIDORAN_M") return "Nidoran♂️";
  if (key === "SPECIES_INDEEDEE_FEMALE") return "Indeedee♀️";
  if (key === "SPECIES_INDEEDEE") return "Indeedee♂️";
  if (key === "SPECIES_HAKAMO_O") return "Hakamo-o";
  const regionMap = {
    G: "Galarian",
    H: "Hisuian",
    A: "Alolan",
  } as Record<string, string>;
  const withoutSpecies = key.replace(/SPECIES_/, "");
  const [name, regional] = withoutSpecies.split("_");
  const capsName =
    name.toLowerCase()[0].toUpperCase() + name.toLowerCase().slice(1);
  return `${regionMap[regional] || ""} ${capsName}`.trim();
}

export function regexEvolution(textEvolution: string) {
  const species = {} as Record<string, Array<[string, string, string]>>;
  const lines = textEvolution.split("\n");
  let name: string;

  lines.forEach((line) => {
    const matchSpecies = line.match(/\[ *(SPECIES_\w+) *\]/i);
    if (matchSpecies) name = matchSpecies[1];

    const matchEvoInfo = line.match(/(\w+), *(\w+), *(\w+)/);
    if (matchEvoInfo) {
      let method = matchEvoInfo[1];
      if (/ITEM_HISUI_ROCK/i.test(line)) {
        method = method.replace(/HOLD_ITEM$/, "HOLD_HISUI_ROCK");
      }
      const condition = matchEvoInfo[2];
      const targetSpecies = matchEvoInfo[3];
      if (!species[name]) species[name] = [];
      species[name].push([method, condition, targetSpecies]);
    }
  });

  // return species;
  return getEvolutionLine(species);
}

function getEvolutionLine(
  species: Record<string, Array<[string, string, string]>>
) {
  const evolutionLines = {} as Record<
    string,
    Array<{
      name: string;
      evolutions?: Array<[string, string, string]>;
    }>
  >;

  for (const name of Object.keys(species)) {
    let evolutionLine = [name];

    for (let i = 0; i < evolutionLine.length; i++) {
      const currentName = evolutionLine[i];
      const currentTarget = species[currentName];
      if (!currentTarget) continue; // this pokemon does not evolve
      // this pokemon DOES involve, loop through its evolutions and add them to the queue
      for (const evolutions of currentTarget) {
        const target = evolutions[2];
        if (!evolutionLine.includes(target)) {
          evolutionLine.push(target);
        }
      }
    }

    evolutionLines[name] = evolutionLine
      .map((name) => {
        return {
          name,
          evolutions: species[name],
        };
      })
      .filter(({ name }) => {
        const skip = ["MEGA", "GIGA", "MEGA_X", "MEGA_Y"];
        return !skip.some((s) => name.endsWith(s));
      });
  }

  for (const species of Object.keys(evolutionLines)) {
    const evolutionLine = evolutionLines[species];
    evolutionLine.forEach(({ name }) => {
      const evo = evolutionLines[name];
      if (!evo) {
        evolutionLines[name] = evolutionLine;
        return;
      }
      if (evolutionLine.length > evolutionLines[name].length) {
        evolutionLines[name] = evolutionLine;
      }
    });
  }

  return evolutionLines;
}

export function regexBaseStats(
  textBaseStats: string,
  species: Record<string, any>
) {
  const lines = textBaseStats.split("\n");

  const regex =
    /baseHP|baseAttack|baseDefense|baseSpeed|baseSpAttack|baseSpDefense|type1|type2|item1|item2|eggGroup1|eggGroup2|ability1|ability2|hiddenAbility/;
  let change = false,
    value: string | number | any[] | null,
    name: string;

  lines.forEach((line) => {
    const part = {
      changes: [],
      abilities: [],
    };

    if (/#else/i.test(line)) change = true;
    if (/#endif/i.test(line)) change = false;

    const matchSpecies = line.match(/SPECIES_\w+/i);
    if (matchSpecies) {
      name = matchSpecies[0];
      change = false;
    }

    const matchRegex = line.match(regex);
    if (matchRegex && name in species) {
      // name in species necessary, don't touch
      const match = matchRegex[0];

      if (
        match === "baseHP" ||
        match === "baseAttack" ||
        match === "baseDefense" ||
        match === "baseSpeed" ||
        match === "baseSpAttack" ||
        match === "baseSpDefense"
      ) {
        const matchInt = line.match(/\d+/);
        if (matchInt) value = parseInt(matchInt[0]);
      } else if (
        match === "type1" ||
        match === "type2" ||
        match === "item1" ||
        match === "item2" ||
        match === "eggGroup1" ||
        match === "eggGroup2" ||
        match === "ability1" ||
        match === "ability2" ||
        match === "hiddenAbility"
      ) {
        value = line.match(/\w+_\w+/i);
        if (value) value = value[0];
      }

      // @ts-expect-error
      if (change === true) part.changes.push([match, value]);
      else if (change === false) {
        if (
          match === "ability1" ||
          match === "ability2" ||
          match === "hiddenAbility"
        ) {
          // @ts-expect-error
          part.abilities.push(value);
        } else {
          // @ts-expect-error
          part[match] = value;
        }
      }

      species[name] = { ...species[name], ...part };
    }
  });
  return species;
}

export function regexSprite(textSprite: string, species: Record<string, any>) {
  const lines = textSprite.split("\n");

  lines.forEach((line) => {
    let url = null;
    const matchSpecies = line.match(/SPECIES_\w+/i);
    if (matchSpecies) {
      let name = matchSpecies[0];
      if (name === "SPECIES_ENAMORUS_T") name = "SPECIES_ENAMORUS_THERIAN";

      const matchURL = line.match(/gFrontSprite\w+Tiles/i);
      if (matchURL || name === "SPECIES_SHADOW_WARRIOR") {
        if (name === "SPECIES_SHADOW_WARRIOR") {
          url = `https://raw.githubusercontent.com/${REPO_2}/graphics/frontspr/gSpriteShadowWarrior.png`;
        } else {
          url = `https://raw.githubusercontent.com/${REPO_2}/graphics/frontspr/${matchURL?.[0].replace(
            "Tiles",
            ".png"
          )}`;
        }

        if (name === "SPECIES_CASTFORM") {
          url = `https://raw.githubusercontent.com/${REPO_2}/graphics/castform/gFrontSprite385Castform.png`;
        }

        if (name in species) {
          species[name]["sprite"] = url;
        }
      }
    }
  });
  return species;
}

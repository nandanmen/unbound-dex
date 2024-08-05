import { TypeForm } from "./form";
import { Encounter, getSpecies } from "./lib/species/fetchSpecies";

export default async function Home({
  searchParams,
}: {
  searchParams?: { type: string };
}) {
  const locations = await getSpecies({ type: searchParams?.type });
  return (
    <main className="p-8 lg:p-16">
      <ul className="max-w-[800px] mx-auto space-y-4">
        <TypeForm />
        {locations.map(({ location, subLocations }) => {
          const hasEncounters = subLocations.some(
            (l) => l.encounters.length > 0
          );
          const [regular, ...locs] = subLocations;
          return (
            <li
              key={location}
              className={
                hasEncounters
                  ? "space-y-2"
                  : "flex items-center justify-between"
              }
            >
              <h2 className="font-semibold pl-2">{location}</h2>
              {hasEncounters ? (
                <>
                  <EncounterList encounters={regular.encounters} />
                  <ul className="space-y-3">
                    {locs
                      .filter((l) => l.encounters.length > 0)
                      .map(({ name, encounters }) => {
                        return (
                          <li key={`${location}-${name}`}>
                            <p className="text-gray-11 pl-2 mb-1 font-medium">
                              {name}
                            </p>
                            <EncounterList encounters={encounters} />
                          </li>
                        );
                      })}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-gray-11">No encounters</p>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

function EncounterList({ encounters }: { encounters: Encounter[] }) {
  return (
    <ul>
      {encounters.map((s) => {
        return (
          <li
            className="flex items-center px-2 py-1 odd:bg-gray-3 rounded-md"
            key={s.name}
          >
            <p>{s.readableName}</p>
            <div className="flex gap-1 capitalize text-sm ml-auto">
              <p>{toReadableType(s.type1)}</p>
              {s.type2 !== s.type1 && <p>{toReadableType(s.type2)}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function toReadableType(type: string) {
  return type.replace("TYPE_", "").toLowerCase();
}

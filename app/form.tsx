"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TypeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get("type");

  return (
    <form className="flex">
      <select
        className="w-full rounded-md text-sm h-8 px-2 border border-gray3"
        value={type ?? undefined}
        onChange={(e) => {
          const type = e.target.value;
          if (!type) {
            router.push("/");
          } else {
            router.push(`/?type=${type}`);
          }
        }}
      >
        <option value="">All</option>
        <option value="normal">Normal</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="electric">Electric</option>
        <option value="grass">Grass</option>
        <option value="ice">Ice</option>
        <option value="fighting">Fighting</option>
        <option value="poison">Poison</option>
        <option value="ground">Ground</option>
        <option value="flying">Flying</option>
        <option value="psychic">Psychic</option>
        <option value="bug">Bug</option>
        <option value="rock">Rock</option>
        <option value="ghost">Ghost</option>
        <option value="dragon">Dragon</option>
        <option value="dark">Dark</option>
        <option value="steel">Steel</option>
        <option value="fairy">Fairy</option>
      </select>
    </form>
  );
}

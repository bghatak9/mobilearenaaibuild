"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import PhoneGrid from "@/components/phone/PhoneGrid";
import { Button } from "@/design-system/buttons/Button";
import { SearchBar } from "@/design-system/forms/SearchBar";
import { SpectrumPanel } from "@/design-system/panels/SpectrumPanel";
import { useCompare } from "@/lib/compare-context";

export function CompareSelectClient() {
  const router = useRouter();
  const { items, compareHref } = useCompare();
  const [search, setSearch] = useState("");

  return (
    <>
      <SpectrumPanel className="mb-6 p-4">
        <p className="text-sm text-[var(--text-secondary)]">
          Selected:{" "}
          <strong className="text-[var(--text-primary)]">
            {items.length ? items.map((i) => i.name).join(" · ") : "None yet"}
          </strong>
        </p>
        {compareHref ? (
          <Button
            type="button"
            className="mt-3"
            onClick={() => router.push(compareHref)}
          >
            Compare {items.length} devices
          </Button>
        ) : null}
      </SpectrumPanel>
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSubmit={(q) => setSearch(q)}
        placeholder="Search catalog…"
        className="mb-4"
      />
      <PhoneGrid search={search} pageSize={9} swipePaginate />
    </>
  );
}

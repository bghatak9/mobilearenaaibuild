"use client";

import { memo, useEffect, useMemo, useState } from "react";

import type { CountryStat } from "@/lib/api";
import { countryName } from "@/lib/countries";

const GEO_URL = "/geo/world-countries.geojson";

const MAP_W = 960;
const MAP_H = 480;

type GeoGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

type GeoFeature = {
  type: "Feature";
  properties: Record<string, string>;
  geometry: GeoGeometry;
};

/** Natural Earth uses -99 when ISO code is unavailable. */
const NAME_TO_CODE: Record<string, string> = {
  "N. Cyprus": "CY",
  Somaliland: "SO",
  Kosovo: "XK",
};

function resolveCountryCode(props: Record<string, string>): string {
  for (const key of ["ISO_A2_EH", "ISO_A2", "WB_A2", "iso_a2"]) {
    const code = props[key];
    if (code && code !== "-99" && code.length === 2) {
      return code.toUpperCase();
    }
  }
  const name = props.NAME ?? props.ADMIN ?? "";
  return NAME_TO_CODE[name] ?? "";
}

function resolveCountryName(
  code: string,
  props: Record<string, string>,
): string {
  if (code) return countryName(code);
  return props.NAME ?? props.ADMIN ?? "Unknown";
}

/** Simple equirectangular projection — no external deps. */
function project(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return [x, y];
}

function ringToPath(ring: number[][]): string {
  return (
    ring
      .map((coord, i) => {
        const [x, y] = project(coord[0], coord[1]);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

function geometryToPath(geometry: GeoGeometry): string {
  if (geometry.type === "Polygon") {
    return geometry.coordinates
      .map((ring) => ringToPath(ring as number[][]))
      .join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .flatMap((poly) =>
        (poly as number[][][]).map((ring) => ringToPath(ring)),
      )
      .join(" ");
  }
  return "";
}

function fillForVisitors(count: number, max: number): string {
  if (count <= 0) return "#e5e7eb";
  const t = Math.min(1, count / max);
  const r = Math.round(254 - t * 120);
  const g = Math.round(226 - t * 180);
  const b = Math.round(226 - t * 180);
  return `rgb(${r},${g},${b})`;
}

function WorldMapInner({ data = [] }: { data?: CountryStat[] }) {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((geo: { features: GeoFeature[] }) => {
        if (!cancelled) setFeatures(geo.features ?? []);
      })
      .catch(() => {
        if (!cancelled) setFeatures([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byCode = useMemo(() => {
    const m = new Map<string, CountryStat>();
    for (const row of data) {
      if (row.code) m.set(row.code.toUpperCase(), row);
    }
    return m;
  }, [data]);

  const max = useMemo(
    () => Math.max(...data.map((d) => d.visitors ?? 0), 1),
    [data],
  );

  const paths = useMemo(
    () =>
      features.map((feature, i) => {
        const props = feature.properties;
        const code = resolveCountryCode(props);
        const stat = code ? byCode.get(code) : undefined;
        const visitors = stat?.visitors ?? 0;
        const name =
          stat?.name ?? resolveCountryName(code, props);
        const d = geometryToPath(feature.geometry);
        return { key: `${code || props.NAME}-${i}`, code, name, visitors, d };
      }),
    [features, byCode],
  );

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">
        Interactive world map
      </h2>
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="mx-auto w-full max-w-4xl"
        role="img"
        aria-label="World traffic map"
      >
        {paths.map(({ key, name, visitors, d }) =>
          d ? (
            <path
              key={key}
              d={d}
              fill={fillForVisitors(visitors, max)}
              stroke="#fff"
              strokeWidth={0.35}
              className="cursor-pointer transition-colors hover:fill-red-600"
              onMouseEnter={() =>
                setTooltip(
                  visitors > 0
                    ? `${name}: ${visitors.toLocaleString()} visitors`
                    : `${name}: no traffic yet`,
                )
              }
              onMouseLeave={() => setTooltip(null)}
            />
          ) : null,
        )}
      </svg>
      {features.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">Loading map…</p>
      )}
      {features.length > 0 && (
        <p className="mt-1 text-center text-xs text-gray-400">
          {paths.length} countries · hover for traffic
        </p>
      )}
      {tooltip && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white shadow-lg">
          {tooltip}
        </div>
      )}
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
        <span>Low</span>
        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-gray-200 to-red-600" />
        <span>High</span>
      </div>
    </div>
  );
}

export default memo(WorldMapInner);

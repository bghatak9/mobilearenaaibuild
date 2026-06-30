"use client";

import { createContext, useContext, type ReactNode } from "react";

type CatalogMode = {
  importedOnly: boolean;
};

const CatalogContext = createContext<CatalogMode>({ importedOnly: false });

export function CatalogProvider({
  importedOnly,
  children,
}: {
  importedOnly: boolean;
  children: ReactNode;
}) {
  return (
    <CatalogContext.Provider value={{ importedOnly }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalogMode() {
  return useContext(CatalogContext);
}

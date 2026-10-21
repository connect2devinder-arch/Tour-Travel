import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { destinations as sampleDestinations } from "./mockData.js";
import { listPublishedPackages, mergePackagesIntoDestinations } from "./packages.js";

const PackagesContext = createContext(null);

/**
 * Loads the published packages from Firestore once and merges them over the
 * bundled sample packages. When nothing is published (or Firebase is not
 * configured) the sample packages stay in place.
 */
export function PackagesProvider({ children }) {
  const location = useLocation();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("sample");
  const firstRun = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listPublishedPackages();
    setPackages(result);
    setSource(result.length ? "managed" : "sample");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh when the visitor comes back to the public site, so newly
  // published packages show up without a hard reload.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (location.pathname === "/" || location.pathname.startsWith("/packages")) load();
  }, [location.pathname, load]);

  const destinations = useMemo(
    () => mergePackagesIntoDestinations(sampleDestinations, packages),
    [packages],
  );

  const value = useMemo(
    () => ({ destinations, packages, loading, source, refresh: load }),
    [destinations, packages, loading, source, load],
  );

  return <PackagesContext.Provider value={value}>{children}</PackagesContext.Provider>;
}

export function usePackages() {
  return useContext(PackagesContext) ?? {
    destinations: sampleDestinations,
    packages: [],
    loading: false,
    source: "sample",
    refresh: async () => {},
  };
}

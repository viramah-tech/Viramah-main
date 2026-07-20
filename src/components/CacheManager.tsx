"use client";

import { useEffect } from "react";

export function CacheManager() {
  useEffect(() => {
    // 1. Dev-only Diagnostic Check on mount (verifying no leftovers from previous session)
    if (process.env.NODE_ENV === "development") {
      runDiagnosticCheck("On Mount (Previous Session Check)");
    }

    // 2. Register beforeunload / unload event listener
    const handleUnload = () => {
      // Clear non-essential localStorage items or all localStorage
      try {
        localStorage.clear();
      } catch (e) {
        console.error("Failed to clear localStorage:", e);
      }

      // Clear SessionStorage if any leftovers
      try {
        sessionStorage.clear();
      } catch (e) {
        console.error("Failed to clear sessionStorage:", e);
      }

      // Clear Cache Storage (Cache API)
      if (typeof caches !== "undefined" && caches.keys) {
        try {
          caches.keys().then((keys) => {
            keys.forEach((key) => caches.delete(key));
          });
        } catch (e) {
          console.error("Failed to clear Cache Storage:", e);
        }
      }

      // Clear Service Worker Cache or databases if any (IndexedDB)
      if (typeof indexedDB !== "undefined" && indexedDB.databases) {
        try {
          indexedDB.databases().then((dbs) => {
            dbs.forEach((db) => {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
              }
            });
          });
        } catch (e) {
          console.error("Failed to clear IndexedDB databases:", e);
        }
      }

      // Dev-only Diagnostic Check right on unload
      if (process.env.NODE_ENV === "development") {
        runDiagnosticCheck("On Unload (Post-Clearing Check)");
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  const runDiagnosticCheck = async (stage: string) => {
    const isLocalStorageEmpty = localStorage.length === 0;

    let isCacheStorageEmpty = true;
    if (typeof caches !== "undefined" && caches.keys) {
      try {
        const keys = await caches.keys();
        isCacheStorageEmpty = keys.length === 0;
      } catch {
        isCacheStorageEmpty = false;
      }
    }

    let isIndexedDBEmpty = true;
    if (typeof indexedDB !== "undefined" && indexedDB.databases) {
      try {
        const dbs = await indexedDB.databases();
        isIndexedDBEmpty = dbs.length === 0;
      } catch {
        isIndexedDBEmpty = false;
      }
    }

    console.group(`[Cache Diagnostics - ${stage}]`);
    console.log("LocalStorage Empty:", isLocalStorageEmpty ? "PASSED ✅" : "FAILED ❌");
    console.log("CacheStorage Empty:", isCacheStorageEmpty ? "PASSED ✅" : "FAILED ❌");
    console.log("IndexedDB Empty:", isIndexedDBEmpty ? "PASSED ✅" : "FAILED ❌");
    console.groupEnd();
  };

  return null;
}

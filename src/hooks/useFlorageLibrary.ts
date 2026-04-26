import { useCallback, useEffect, useState } from "react";

import {
  createFloragePlant,
  getDefaultFlorageLibrary,
  loadFlorageLibrary,
  saveFlorageLibrary,
  subscribeToFlorageLibrary,
  updateFloragePlant,
  type FloragePlant,
  type FloragePlantInput,
} from "@/lib/florage";

export function useFlorageLibrary() {
  const [plants, setPlants] = useState<FloragePlant[]>(() => loadFlorageLibrary());

  useEffect(() => {
    return subscribeToFlorageLibrary(() => {
      setPlants(loadFlorageLibrary());
    });
  }, []);

  const replaceAll = useCallback((nextPlants: FloragePlant[]) => {
    const saved = saveFlorageLibrary(nextPlants);
    setPlants(saved);
    return saved;
  }, []);

  const createPlant = useCallback((input: FloragePlantInput) => {
    const next = createFloragePlant(input);
    const saved = saveFlorageLibrary([...plants, next]);
    setPlants(saved);
    return next;
  }, [plants]);

  const editPlant = useCallback((id: string, input: FloragePlantInput) => {
    const existing = plants.find((plant) => plant.id === id);
    if (!existing) return null;

    const next = updateFloragePlant(existing, input);
    const saved = saveFlorageLibrary(plants.map((plant) => (plant.id === id ? next : plant)));
    setPlants(saved);
    return next;
  }, [plants]);

  const deletePlant = useCallback((id: string) => {
    const saved = saveFlorageLibrary(plants.filter((plant) => plant.id !== id));
    setPlants(saved);
    return saved;
  }, [plants]);

  const resetLibrary = useCallback(() => {
    const saved = saveFlorageLibrary(getDefaultFlorageLibrary());
    setPlants(saved);
    return saved;
  }, []);

  return {
    plants,
    createPlant,
    editPlant,
    deletePlant,
    replaceAll,
    resetLibrary,
  };
}

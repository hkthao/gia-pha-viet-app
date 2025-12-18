import { create } from 'zustand';

interface MapSelectionState {
  selectedLatitude: number | undefined;
  selectedLongitude: number | undefined;
  setCoordinates: (latitude: number | undefined, longitude: number | undefined) => void;
  clearCoordinates: () => void;
}

export const useMapSelectionStore = create<MapSelectionState>((set) => ({
  selectedLatitude: undefined,
  selectedLongitude: undefined,
  setCoordinates: (latitude, longitude) => set({ selectedLatitude: latitude, selectedLongitude: longitude }),
  clearCoordinates: () => set({ selectedLatitude: undefined, selectedLongitude: undefined }),
}));

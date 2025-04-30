import { create } from "zustand";

type FavoriteCitiesStore = {
  favoriteCities: string[];
  setFavoriteCities: (cities: string[]) => void;
  toggleFavorite: (city: string) => void;
};

export const useFavoriteCitiesStore = create<FavoriteCitiesStore>(
  (set, get) => ({
    favoriteCities: [],
    setFavoriteCities: (cities) => {
      localStorage.setItem("favoriteCities", JSON.stringify(cities)); // Persist to local storage
      set({ favoriteCities: cities }); // Update state
    },
    toggleFavorite: (city) => {
      const current = get().favoriteCities;
      let updated;

      if (current.includes(city)) {
        updated = current.filter((c) => c !== city); // Remove from favorites
      } else {
        if (current.length >= 3) {
          alert("You can only have up to 3 favorite cities.");
          return;
        }
        updated = [...current, city]; // Add to favorites
      }

      localStorage.setItem("favoriteCities", JSON.stringify(updated)); // Persist to local storage
      set({ favoriteCities: updated }); // Update state
    },
  })
);

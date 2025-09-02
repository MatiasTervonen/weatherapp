"use client";

import { useTranslation } from "@/app/lib/useTranslation";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { AllAvailableCities } from "@/app/lib/allAvailableCities";
import LocaleSwitcher from "@/app/components/localeSwitcher";
import { useFavoriteCitiesStore } from "@/app/lib/favoriteCitiesStore"; // Zustand store for favorite cities

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState(""); // User input
  const [filteredCities, setFilteredCities] = useState<string[]>([]); // Filtered list
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown
  const [selectedIndex, setSelectedIndex] = useState(-1); // Highlighted city in dropdown
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Ref for dropdown

  // When clicking outside the dropdown, close it and clear the input

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside); // Add event listener for clicks
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup event listener
    };
  }, []);

  //  Handles user input and filters cities dynamically
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      const filtered = AllAvailableCities.filter((city) =>
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowDropdown(true);
      setSelectedIndex(-1); // Reset highlight when typing
    } else {
      setShowDropdown(false);
    }
  };

  //  Handles selection (dropdown click OR enter key)
  const handleSelectCity = (city: string) => {
    setSearchQuery(city);
    setShowDropdown(false);
    router.push(`/weather/${encodeURIComponent(city)}`);
  };

  //  Handles form submission when manually typing
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      router.push(`/weather/${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  //  Handles arrow key navigation in the dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredCities.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCities.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCities.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex !== -1) {
        handleSelectCity(filteredCities[selectedIndex]); // Select highlighted city
      } else {
        handleFormSubmit(e as unknown as React.FormEvent<HTMLFormElement>); // If no dropdown selection, submit manually entered text
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false); // Close dropdown when pressing Escape
    }
  };

  const favoriteCities = useFavoriteCitiesStore(
    (state) => state.favoriteCities
  ); // Get favorite cities from Zustand store
  const setFavoriteCities = useFavoriteCitiesStore(
    (state) => state.setFavoriteCities
  ); // Set favorite cities in Zustand store
  const toggleFavorite = useFavoriteCitiesStore(
    (state) => state.toggleFavorite
  ); // Toggle favorite city in Zustand store

  useEffect(() => {
    const savedFavorities = localStorage.getItem("favoriteCities");
    if (savedFavorities) {
      setFavoriteCities(JSON.parse(savedFavorities)); // Load favorite cities from local storage
    }
  }, [setFavoriteCities]);

  const pathname = usePathname();
  const showHomeButton = pathname !== `/`;
  const { t } = useTranslation("navbar");

  const extraClass = pathname === "/radar" ? "hidden sm:block" : "block";

  return (
    <>
      <div className={`relative z-50 ${extraClass}`}>
        {/* Header */}
        <div className="bg-blue-900 flex justify-center w-full relative z-50 dark:bg-slate-950">
          <h1 className=" py-5 font-semibold text-gray-100 md:py-10 text-3xl md:text-5xl ">
            {t("title")}
          </h1>
        </div>

        {/* Navbar */}
        <div className="flex h-[60px] justify-between items-center py-2 gap-1 bg-blue-400 w-full  border-y-2 dark:bg-slate-950  border-gray-100 z-50">
          {/* Search Bar with Keyboard Navigation */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex">
            {showHomeButton && (
              <div className="hover:scale-95 mr-2 sm:mr-5 hidden sm:flex">
                <Link href={`/`}>
                  <Image
                    src="/Back-Arrow.png"
                    width={50}
                    height={50}
                    alt="Back"
                  />
                </Link>
              </div>
            )}
            <form
              onSubmit={handleFormSubmit}
              className="relative flex items-center"
            >
              <input
                className="text-lg text-black p-2 rounded-full border-2 border-gray-100 z-10 w-[256px] placeholder-gray-500  dark:text-gray-100 bg-gray-100 dark:bg-gray-900 hover:border-blue-500 focus:outline-none focus:border-green-300"
                type="text"
                spellCheck={false}
                placeholder={t("placeHolder")}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown} //  Add keyboard navigation
                name="searchCity"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute px-4 dark:right-1 right-[2px] top-1/2 transform -translate-y-1/2 py-[9.6px] dark:py-[8px] rounded-r-full z-10 hover:scale-95 bg-blue-900 dark:bg-gray-900"
              >
                <Image
                  src="/Search_28x28.webp"
                  width={25}
                  height={25}
                  alt="Search icon"
                />
              </button>
              {/*  Dropdown for City Suggestions */}
              {showDropdown && filteredCities.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-12 w-full bg-white border rounded-md shadow-md dark:bg-slate-950"
                >
                  {filteredCities.map((city, index) => {
                    const isFavorite = favoriteCities.includes(city);

                    return (
                      <div
                        className="flex justify-between items-center"
                        key={index}
                      >
                        <div
                          key={index}
                          onClick={() => handleSelectCity(city)} //  Select city when clicked
                          className={`px-4 py-2 text-lg cursor-pointer z-50 text-black dark:text-gray-100 flex-grow ${
                            selectedIndex === index
                              ? "bg-blue-200 dark:bg-slate-800"
                              : "hover:bg-blue-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {city}
                        </div>
                        <div className="relative group ml-2">
                          <button
                            type="button"
                            onClick={() => toggleFavorite(city)} //  Toggle favorite city
                            className="mr-3"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill={isFavorite ? "currentColor" : "none"}
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className={`size-6 hover:scale-95 ${
                                isFavorite ? "text-yellow-300" : "text-gray-500"
                              }`}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                              />
                            </svg>
                          </button>
                          <span className="hidden md:flex absolute pointer-events-none bottom-8 left-1/2 -translate-x-1/2 w-max rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 bg-gray-800 text-gray-100 px-2 py-1 transition-opacity duration-200 z-50">
                            {isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </form>
          </div>
          <div className="ml-auto mr-10 hidden gap-4 sm:flex">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}

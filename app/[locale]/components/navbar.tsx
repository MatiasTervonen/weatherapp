"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { AllAvailableCities } from "../lib/allAvailableCities";
import LocaleSwitcher from "./localeSwitcher";

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState(""); // User input
  const [filteredCities, setFilteredCities] = useState<string[]>([]); // Filtered list
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown
  const [selectedIndex, setSelectedIndex] = useState(-1); // Highlighted city in dropdown
  const router = useRouter();

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

  const pathname = usePathname();
  const showHomeButton = pathname !== "/fin" && pathname !== "/en";
  const t = useTranslations("navbar");

  return (
    <>
      <div className="relative z-50">
        {/* Header */}
        <div className="bg-blue-900 flex justify-center w-full relative z-50  dark:bg-slate-950">
          <h1 className=" py-5 font-semibold text-gray-100 md:py-10 text-3xl md:text-5xl ">
            {t("title")}
          </h1>
        </div>

        {/* Navbar */}
        <div className="flex h-[60px] justify-between items-center py-2 gap-1 bg-blue-400 w-full  border-y-2 dark:bg-slate-950  dark:border-gray-100 z-50">
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
              className="relative flex items-center mr-10 z-50"
            >
              <input
                className="text-lg text-black p-2 rounded-full border z-10 w-[200px] md:w-[256px] dark:text-gray-100 bg-gray-100 dark:bg-gray-900"
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
                className="absolute -right-10 pl-10 py-2  rounded-full  bg-blue-800 hover:scale-95 hover:bg-blue-700 dark:bg-slate-950 "
              >
                <Image
                  src="/Search.svg"
                  width={36}
                  height={36}
                  alt="Search icon"
                  className="pr-2"
                />
              </button>

              {/*  Dropdown for City Suggestions */}
              {showDropdown && filteredCities.length > 0 && (
                <ul className="absolute top-12 w-full bg-white border rounded-md shadow-md dark:bg-slate-950">
                  {filteredCities.map((city, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectCity(city)} //  Select city when clicked
                      className={`px-4 py-2 text-lg cursor-pointer z-50 text-black dark:text-gray-100 ${
                        selectedIndex === index
                          ? "bg-blue-200 dark:bg-slate-800"
                          : "hover:bg-blue-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AllAvailableCities from "./allavailablecities";

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState(""); // User input
  const [filteredCities, setFilteredCities] = useState<string[]>([]); // Filtered list
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown
  const [selectedIndex, setSelectedIndex] = useState(-1); // Highlighted city in dropdown
  const router = useRouter();

  const availableCities = AllAvailableCities();

  // 🔹 Handles user input and filters cities dynamically
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      const filtered = availableCities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowDropdown(true);
      setSelectedIndex(-1); // Reset highlight when typing
    } else {
      setShowDropdown(false);
    }
  };

  // 🔹 Handles selection (dropdown click OR enter key)
  const handleSelectCity = (city: string) => {
    setSearchQuery(city);
    setShowDropdown(false);
    router.push(`/weather/${encodeURIComponent(city)}`);
  };

  // 🔹 Handles form submission when manually typing
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      router.push(`/weather/${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  // 🔹 Handles arrow key navigation in the dropdown
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

  return (
    <div>
      {/* Header */}
      <div className="bg-blue-900 flex justify-center w-full z-50">
        <h1 className="text-3xl py-5 font-semibold text-white md:py-10 md:text-5xl">
          The Weather Channel
        </h1>
      </div>

      {/* Navbar */}
      <div className="flex flex-col justify-center items-center py-2 gap-5 text-white text-3xl font-semibold  bg-blue-400 w-full z-40 sm:flex-row md:text-3xl">
        <Link href={`/`}>Home</Link>

        {/* ✅ Search Bar with Keyboard Navigation */}
        <form
          onSubmit={handleFormSubmit}
          className="relative flex items-center"
        >
          <input
            className="text-lg z-10 text-black p-2 pl-10 rounded-full border"
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown} // ✅ Add keyboard navigation
          />
          <button
            type="submit"
            className="absolute z-0 -right-12 pl-14 pr-2 py-2 rounded-full bg-blue-800 hover:scale-95 hover:bg-blue-700"
          >
            <Image src="/Search.png" width={40} height={40} alt="Search icon" />
          </button>

          {/* 🔹 Dropdown for City Suggestions */}
          {showDropdown && filteredCities.length > 0 && (
            <ul className="absolute top-12 w-full bg-white border rounded-md shadow-md z-50">
              {filteredCities.map((city, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectCity(city)} // ✅ Select city when clicked
                  className={`px-4 py-2 cursor-pointer text-black ${
                    selectedIndex === index
                      ? "bg-blue-200"
                      : "hover:bg-blue-100"
                  }`}
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>
    </div>
  );
}

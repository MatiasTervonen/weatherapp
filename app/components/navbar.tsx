"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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

  //  Handles user input and filters cities dynamically
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      const filtered = availableCities.filter((city) =>
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

  const pathname = usePathname();
  const showHomeButton = pathname !== "/";

  return (
    <div>
      {/* Header */}
      <div className="bg-blue-900 flex justify-center w-full z-50">
        <h1 className=" py-5 font-semibold text-white md:py-10 text-3xl md:text-5xl ">
          The Weather Channel
        </h1>
      </div>

      {/* Navbar */}
      <div className="flex  justify-center items-center py-2 gap-1 bg-blue-400 w-full md:gap-5">
        {showHomeButton && (
          <div className="hover:scale-95">
            <Link href={`/`}>
              <Image src="/Back Arrow.png" width={50} height={50} alt="Back" />
            </Link>
          </div>
        )}
        {/* ✅ Search Bar with Keyboard Navigation */}
        <form
          onSubmit={handleFormSubmit}
          className="relative flex items-center mr-10"
        >
          <input
            className="text-lg text-black p-2 rounded-full border z-10 w-[200px] md:w-[256px] "
            type="text"
            spellCheck={false}
            placeholder="Search location..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown} // ✅ Add keyboard navigation
            name="searchCity"
          />
          <button
            type="submit"
            className="absolute -right-10 pl-10 py-2 z-0 rounded-full bg-blue-800 hover:scale-95 hover:bg-blue-700"
          >
            <Image src="/Search.png" width={42} height={30} alt="Search icon" />
          </button>

          {/* 🔹 Dropdown for City Suggestions */}
          {showDropdown && filteredCities.length > 0 && (
            <ul className="absolute top-12 w-full bg-white border rounded-md shadow-md z-50">
              {filteredCities.map((city, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectCity(city)} // ✅ Select city when clicked
                  className={`px-4 py-2 text-lg cursor-pointer text-black ${
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

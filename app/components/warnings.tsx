"use client";

import { useEffect, useState } from "react";

interface WarningData {
  time: string;
  title: string;
  description: string;
}

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<WarningData[]>([]);

  useEffect(() => {
    async function fetchWarnings() {
      try {
        const response = await fetch("/api/warnings");
        const data = await response.json();
        setWarnings(data);
      } catch (error) {
        console.error("Error fetching warnings", error);
      } finally {
      }
    }

    fetchWarnings();
  }, []);

  return (
    <>
      <div className="flex justify-center mt-10">
        <div className="bg-blue-400 p-10  rounded-xl">
          <div className="flex justify-center text-2xl  font-bold text-red-600">
            <h1>Weather Warnings</h1>
          </div>
          {warnings.length === 0 ? (
            <p>No warnings available</p>
          ) : (
            <div>
              {warnings.map((warning, index) => (
                <div key={index}>
                  {/* <p>
                    {new Date(warning.time).toLocaleString("en-GB", {
                      weekday: "short",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hourCycle: "h23", // Forces 24-hour format
                    })}
                  </p> */}
                  <div>
                    <h2 className="text-xl py-6">{warning.title}</h2>
                  </div>
                  <div>
                    <p>{warning.description}</p>
                  </div>
                  <div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

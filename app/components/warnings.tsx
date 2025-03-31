"use client";

import { useEffect, useState } from "react";
import { SkeletonWarning } from "@/app/ui/skeleton";

interface WarningData {
  time: string;
  title: string;
  description: string;
}

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<WarningData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchWarnings() {
      try {
        const response = await fetch("/api/warnings");
        const data = await response.json();
        setWarnings(data);
      } catch (error) {
        console.error("Error fetching warnings", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWarnings();
  }, []);

  return (
    <>
      <div className="flex justify-center my-10">
        <div className="bg-blue-400 p-10 rounded-xl w-full max-w-5xl">
          <div className="flex justify-center text-2xl  font-bold text-red-600">
            <h1>Weather Warnings</h1>
          </div>

          {loading ? (
            <div className="space-y-6 mt-6 w-full">
              <SkeletonWarning />
              <SkeletonWarning />
            </div>
          ) : warnings.length === 0 ? (
            <p>No warnings available</p>
          ) : (
            <div>
              {warnings.map((warning, index) => (
                <div key={index}>
                  <div>
                    <h2 className="text-xl py-6">{warning.title}</h2>
                  </div>
                  <div>
                    <p>{warning.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

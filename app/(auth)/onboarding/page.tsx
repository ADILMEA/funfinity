"use client";

import * as React from "react";
import { completeOnboarding, getPlayerData } from "./_actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const [selectedTeam, setSelectedTeam] = React.useState<string | null>(null);
  const [playerName, setPlayerName] = React.useState<string>("");
  const [clerkID, setClerkID] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch player data on mount
    async function fetchPlayer() {
      if (!isLoaded) return;

      try {
        const playerData = await getPlayerData();
        if (playerData) {
          setPlayerName(playerData.firstName);
          setClerkID(playerData.clerkId);
        }
      } catch (error) {
        console.error("Error fetching player:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlayer();
  }, [isLoaded]);

  const handleConfirm = async () => {
    if (selectedTeam && clerkID) {
      setIsSubmitting(true);

      try {
        const result = await completeOnboarding(selectedTeam, clerkID);

        if (result.success) {
          // Small delay to ensure Clerk metadata is propagated
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Force a hard navigation to ensure metadata is refreshed
          window.location.href = "/arena";
        } else {
          console.error(result.error || result.message);
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error("Error during onboarding:", error);
        setIsSubmitting(false);
      }
    }
  };

  const teams = [
    "Aurora",
    "Barkkath",
    "ClashX",
    "Ethereal",
    "Foxtrot",
    "Gallashtra",
    "Infinio",
    "Knightly Questers",
    "Leophora",
    "Orion",
    "Patronus",
    "Synergy",
    "Thunder Squad",
    "Vespera",
    "Xaviens",
    "Zephyr",
  ];

  if (isLoading || !isLoaded) {
    return (
      <div className="w-full p-4 sm:p-8 md:p-16 lg:p-32 text-center">
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-4">
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-8 md:p-16 lg:p-32 text-center">
      <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-4">
        Hi, {playerName}
      </h2>
      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-neutral-700 mb-6 sm:mb-8">
        Select your team to begin
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto">
        {teams.map((team, index) => (
          <button
            key={index}
            onClick={() => setSelectedTeam(team)}
            disabled={isSubmitting}
            className={`bg-white border rounded-xl shadow-md transition-all hover:shadow-lg p-2 ${
              selectedTeam === team
                ? "border-blue-500 border-4 ring-4 ring-blue-200"
                : "border-neutral-300"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto">
              <Image
                src={"/teams/" + team + ".webp"}
                alt={team + " logo"}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <p className="py-1 sm:py-2 font-semibold text-xs sm:text-sm">
              {team}
            </p>
          </button>
        ))}
      </div>
      <button
        onClick={handleConfirm}
        disabled={!selectedTeam || isSubmitting}
        className={`px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-semibold rounded-lg transition-all duration-300 ${
          selectedTeam && !isSubmitting
            ? "bg-white text-black border border-neutral-300 rounded-lg shadow-md cursor-pointer"
            : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
        }`}
      >
        {isSubmitting ? "Confirming..." : "Confirm Selection"}
      </button>
    </div>
  );
}

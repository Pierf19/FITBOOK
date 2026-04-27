// src/hooks/useRecommendation.js
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useRecommendation(trainerId) {
  const suggestedSlots = useQuery(
    api.recommendations.getSuggestedSlots,
    trainerId ? { trainerId } : "skip"
  );

  function isRecommended(day, startTime) {
    if (!suggestedSlots) return null;
    return suggestedSlots.find(
      (s) => s.day === day && s.startTime === startTime
    ) ?? null;
  }

  return { suggestedSlots: suggestedSlots ?? [], isRecommended };
}

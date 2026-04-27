// src/components/RecommendationBadge.jsx
export default function RecommendationBadge({ frequency }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
      ★ Recommended for you
      {frequency > 1 && (
        <span className="text-amber-500">({frequency}x)</span>
      )}
    </span>
  );
}

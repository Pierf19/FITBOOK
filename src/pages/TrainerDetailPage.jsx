// src/pages/TrainerDetailPage.jsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "../hooks/useCurrentUser.js";

export default function TrainerDetailPage() {
  const { trainerId } = useParams();
  const trainer = useQuery(api.trainers.getTrainer, { trainerId });
  const { me } = useCurrentUser();

  if (trainer === undefined) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="text-center py-20 text-gray-400">Trainer not found.</div>
    );
  }

  // Group available slots by day
  const slotsByDay = trainer.availableSlots.reduce((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {});

  const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex gap-5 items-start">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 flex-shrink-0">
          {trainer.userName?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{trainer.userName}</h1>
          <div className="flex flex-wrap gap-1 mt-1">
            {trainer.specialization.map((s) => (
              <span
                key={s}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="text-gray-600 mt-3 text-sm leading-relaxed">{trainer.bio}</p>
          <p className="text-blue-600 font-semibold mt-3">
            ${trainer.pricePerSession}
            <span className="text-gray-400 font-normal text-sm"> / session</span>
          </p>
        </div>
      </div>

      {/* Availability grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Weekly Availability
        </h2>
        {Object.keys(slotsByDay).length === 0 ? (
          <p className="text-gray-400 text-sm">No availability set yet.</p>
        ) : (
          <div className="space-y-3">
            {dayOrder
              .filter((d) => slotsByDay[d])
              .map((day) => (
                <div key={day} className="flex flex-wrap gap-2 items-center">
                  <span className="w-28 text-sm font-medium text-gray-600">{day}</span>
                  {slotsByDay[day].map((s) => (
                    <span
                      key={`${s.startTime}-${s.endTime}`}
                      className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium"
                    >
                      {s.startTime}–{s.endTime}
                    </span>
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Book CTA */}
      <div className="text-center">
        {me ? (
          <Link
            to={`/book/${trainer._id}`}
            className="inline-block bg-blue-600 text-white px-10 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Book a Session
          </Link>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-500 text-sm">Sign in to book a session</p>
            <Link
              to="/auth"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In / Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// src/components/BookingForm.jsx
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function BookingForm({ trainer, selectedSlot, onSuccess }) {
  const createBooking = useMutation(api.bookings.createBooking);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success"|"error", message }

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);
    try {
      await createBooking({
        trainerId: trainer._id,
        sessionDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });
      showToast("success", "Booking confirmed! See your dashboard for details.");
      onSuccess?.();
    } catch (err) {
      showToast("error", err.message ?? "Failed to book. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!selectedSlot) {
    return (
      <p className="text-gray-400 text-sm italic">
        Select a time slot from the calendar to continue.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4 space-y-1 text-sm">
        <p className="font-semibold text-blue-800">Booking Summary</p>
        <p className="text-gray-600">
          Trainer: <span className="font-medium text-gray-800">{trainer.userName}</span>
        </p>
        <p className="text-gray-600">
          Date: <span className="font-medium text-gray-800">{selectedSlot.date}</span>
        </p>
        <p className="text-gray-600">
          Time:{" "}
          <span className="font-medium text-gray-800">
            {selectedSlot.startTime} – {selectedSlot.endTime}
          </span>
        </p>
        <p className="text-gray-600">
          Price:{" "}
          <span className="font-medium text-gray-800">
            ${trainer.pricePerSession}
          </span>
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Booking…" : "Confirm Booking"}
      </button>
    </div>
  );
}

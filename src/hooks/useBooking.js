// src/hooks/useBooking.js
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createBookingMutation = useMutation(api.bookings.createBooking);
  const cancelBookingMutation = useMutation(api.bookings.cancelBooking);

  async function createBooking(args) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const id = await createBookingMutation(args);
      setSuccess(true);
      return id;
    } catch (err) {
      setError(err.message ?? "Failed to create booking");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(bookingId, userEmail) {
    setLoading(true);
    setError(null);
    try {
      await cancelBookingMutation({ bookingId, userEmail });
    } catch (err) {
      setError(err.message ?? "Failed to cancel booking");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setError(null);
    setSuccess(false);
  }

  return { createBooking, cancelBooking, loading, error, success, reset };
}

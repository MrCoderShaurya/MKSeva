import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function EventSelector({ selectedEvent, onEventChange }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("project")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch event error:", error.message);
    } else {
      setEvents(data || []);
    }

    setLoading(false);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Event
      </label>

      <select
        value={selectedEvent || ""}
        onChange={(e) => onEventChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">
          {loading ? "Loading events..." : "Choose an event"}
        </option>

        {events.map((eventItem) => (
          <option key={eventItem.id} value={eventItem.name}>
            {eventItem.name}
            {eventItem.created_at &&
              ` - ${new Date(eventItem.created_at).toLocaleDateString()}`}
          </option>
        ))}
      </select>
    </div>
  );
}

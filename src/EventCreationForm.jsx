import { useState } from "react";
import { supabase } from "./supabaseClient";
import NotificationPopup from "./NotificationPopup";

export default function EventCreationForm({ onEventCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    discription: "",
    date: "",
    location: "",
    requirements: "",
    status: "active"
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("project")
        .insert([{ ...formData, created_at: new Date().toISOString() }])
        .select();
      
      if (error) {
        console.error("Create error:", error);
        setNotification({ message: "Error creating event: " + error.message, type: "error" });
        return;
      }
      
      setNotification({ message: "Event created successfully!", type: "success" });
      setFormData({
        name: "",
        discription: "",
        date: "",
        location: "",
        requirements: "",
        status: "active"
      });
      
      if (onEventCreated) onEventCreated();
    } catch (err) {
      console.error("Submit error:", err);
      setNotification({ message: "Error: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter event name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.discription}
              onChange={(e) => setFormData({ ...formData, discription: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event location"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ID proof, dress code, etc."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Creating Event..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

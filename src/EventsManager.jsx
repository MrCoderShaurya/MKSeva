import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import NotificationPopup from "./NotificationPopup";

export default function EventsManager() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("project")
      .select("*")
      .order("created_at", { ascending: false });
    setEvents(data || []);
  };

  const toggleStatus = async (eventName, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("project")
      .update({ status: newStatus })
      .eq("name", eventName);

    if (!error) {
      setNotification({ message: `Event ${newStatus}!`, type: "success" });
      fetchEvents();
    }
  };

  const deleteEvent = async (eventName) => {
    if (!confirm(`Delete event "${eventName}"?`)) return;
    
    const { error } = await supabase
      .from("project")
      .delete()
      .eq("name", eventName);

    if (!error) {
      setNotification({ message: "Event deleted!", type: "success" });
      fetchEvents();
    }
  };

  const toggleRowSelection = (eventName) => {
    setSelectedRows(prev => 
      prev.includes(eventName) 
        ? prev.filter(name => name !== eventName)
        : [...prev, eventName]
    );
  };

  const bulkActivate = async () => {
    for (const eventName of selectedRows) {
      await supabase.from("project").update({ status: "active" }).eq("name", eventName);
    }
    setNotification({ message: `${selectedRows.length} events activated!`, type: "success" });
    setSelectedRows([]);
    fetchEvents();
  };

  const bulkDeactivate = async () => {
    for (const eventName of selectedRows) {
      await supabase.from("project").update({ status: "inactive" }).eq("name", eventName);
    }
    setNotification({ message: `${selectedRows.length} events deactivated!`, type: "success" });
    setSelectedRows([]);
    fetchEvents();
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedRows.length} events?`)) return;
    for (const eventName of selectedRows) {
      await supabase.from("project").delete().eq("name", eventName);
    }
    setNotification({ message: `${selectedRows.length} events deleted!`, type: "success" });
    setSelectedRows([]);
    fetchEvents();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredEvents = events.filter(e =>
    e.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let sortedEvents = [...filteredEvents];
  if (sortConfig.key) {
    sortedEvents.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = sortedEvents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white rounded border border-gray-300 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-300 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-gray-900">Event Management</h2>
              <span className="text-sm text-gray-500">({filteredEvents.length} events)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-2 w-48"
              />
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-sm border border-gray-300 rounded px-3 py-2"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setShowModal(true);
                }}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Create Event
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-auto" style={{maxHeight: '70vh'}}>
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Select</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('name')}>
                  Event Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('date')}>
                  Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('location')}>
                  Location {sortConfig.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Description</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map((event, index) => (
                <tr key={event.name} className={`hover:bg-blue-50 ${selectedRows.includes(event.name) ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="border border-gray-300 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(event.name)}
                      onChange={() => toggleRowSelection(event.name)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-2 font-medium">{event.name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{event.date || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{event.location || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{event.discription || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border-l-4 ${
                      event.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-600' 
                        : 'bg-gray-100 text-gray-700 border-gray-400'
                    }`}>
                      {event.status || 'active'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleStatus(event.name, event.status)}
                        className={`text-sm px-2 py-1 rounded focus:outline-none focus:ring-2 ${
                          event.status === 'active'
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
                            : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                        }`}
                        aria-label={event.status === 'active' ? 'Deactivate event' : 'Activate event'}
                      >
                        <span aria-hidden="true">{event.status === 'active' ? '⏸' : '▶'}</span>
                        <span className="sr-only">{event.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setShowModal(true);
                        }}
                        className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Edit event"
                      >
                        <span aria-hidden="true">✎</span>
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => deleteEvent(event.name)}
                        className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Delete event"
                      >
                        <span aria-hidden="true">✗</span>
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-3 py-2 border-t border-gray-300 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEvents.length)} of {filteredEvents.length}
            </span>
            {selectedRows.length > 0 && (
              <div className="flex gap-1">
                <button
                  onClick={bulkActivate}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Bulk Activate ({selectedRows.length})
                </button>
                <button
                  onClick={bulkDeactivate}
                  className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                >
                  Bulk Deactivate ({selectedRows.length})
                </button>
                <button
                  onClick={bulkDelete}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Bulk Delete ({selectedRows.length})
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-100"
            >
              ‹
            </button>
            <span className="px-2 py-1 text-xs">{currentPage}/{totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-100"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <EventModal
          event={editingEvent}
          onClose={() => {
            setShowModal(false);
            setEditingEvent(null);
          }}
          onSuccess={() => {
            fetchEvents();
            setShowModal(false);
            setEditingEvent(null);
            setNotification({ 
              message: editingEvent ? "Event updated!" : "Event created!", 
              type: "success" 
            });
          }}
        />
      )}
    </div>
  );
}

function EventModal({ event, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: event?.name || "",
    discription: event?.discription || "",
    date: event?.date || "",
    location: event?.location || "",
    requirements: event?.requirements || "",
    status: event?.status || "active"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      if (event) {
        const { error } = await supabase
          .from("project")
          .update(formData)
          .eq("name", event.name);
        if (!error) onSuccess();
      } else {
        const { error } = await supabase
          .from("project")
          .insert([{ ...formData, created_at: new Date().toISOString() }]);
        if (!error) onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {event ? "Edit Event" : "Create Event"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Event Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
              disabled={!!event}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.discription}
              onChange={(e) => setFormData({ ...formData, discription: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 h-20"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Requirements</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              placeholder="ID proof, dress code, etc."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : event ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

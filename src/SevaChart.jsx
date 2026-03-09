import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function SevaChart({ selectedEvent, onBack }) {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(selectedEvent || "");
  const [sevaAssignments, setSevaAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (currentEvent) {
      fetchSevaAssignments();
    }
  }, [currentEvent]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("project")
      .select("name")
      .order("created_at", { ascending: false });
    setEvents(data || []);
    if (data && data.length > 0 && !currentEvent) {
      setCurrentEvent(data[0].name);
    }
  };

  const fetchSevaAssignments = async () => {
    const { data: users } = await supabase
      .from("users")
      .select("name, department, role, slotn")
      .eq("event", currentEvent)
      .eq("status", "approved")
      .order("department");

    if (users) {
      const assignments = {};
      users.forEach(user => {
        const dept = user.department || "Unassigned";
        const role = user.role || "Volunteer";
        const slot = user.slotn || "General";
        const key = `${dept}|${role}|${slot}`;
        
        if (!assignments[key]) {
          assignments[key] = {
            department: dept,
            role: role,
            slot: slot,
            persons: []
          };
        }
        assignments[key].persons.push(user.name);
      });
      
      setSevaAssignments(Object.values(assignments));
    }
  };

  const filteredAssignments = sevaAssignments.filter(item =>
    item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.persons.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
        <select
          value={currentEvent}
          onChange={(e) => setCurrentEvent(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Select Event</option>
          {events.map((event) => (
            <option key={event.name} value={event.name}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by department, role, or person name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-md border border-gray-300 rounded px-3 py-2"
        />
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      <div className="bg-white rounded border border-gray-300 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-300 bg-gray-50">
          <h3 className="text-base font-medium text-gray-900">Seva Assignments ({filteredAssignments.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Department / Role</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Slot</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Assigned Person(s)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssignments.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="font-medium text-gray-900">{item.department}</div>
                    <div className="text-xs text-gray-600 mt-1">{item.role}</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    {item.slot}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">
                    {item.persons.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-300 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-600">
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length}
          </span>
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
    </div>
  );
}

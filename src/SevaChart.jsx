import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function SevaChart({ selectedEvent, onBack }) {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(selectedEvent || "");
  const [stats, setStats] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (currentEvent) {
      fetchStats();
      fetchDepartmentStats();
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

  const fetchStats = async () => {
    const { data: users } = await supabase
      .from("users")
      .select("role, department, status")
      .eq("event", currentEvent);

    if (users) {
      const total = users.length;
      const approved = users.filter(u => u.status === "approved").length;
      const pending = users.filter(u => u.status === "pending").length;
      const volunteers = users.filter(u => u.role?.toLowerCase().includes("volunteer")).length;
      const prabhuji = users.filter(u => u.role === "Volunteer Prabhuji").length;
      const mataji = users.filter(u => u.role === "Volunteer Mataji").length;
      const staff = users.filter(u => u.role === "Staff (paid-volunteer)").length;
      const brahmachari = users.filter(u => u.role === "Brahmachari").length;

      setStats({ total, approved, pending, volunteers, prabhuji, mataji, staff, brahmachari });
    }
  };

  const fetchDepartmentStats = async () => {
    const { data: users } = await supabase
      .from("users")
      .select("department, role, status")
      .eq("event", currentEvent)
      .eq("status", "approved");

    if (users) {
      const deptMap = {};
      users.forEach(user => {
        const dept = user.department || "Unassigned";
        if (!deptMap[dept]) {
          deptMap[dept] = {
            name: dept,
            total: 0,
            prabhuji: 0,
            mataji: 0,
            staff: 0,
            brahmachari: 0,
            volunteers: 0
          };
        }
        deptMap[dept].total++;
        if (user.role === "Volunteer Prabhuji") deptMap[dept].prabhuji++;
        else if (user.role === "Volunteer Mataji") deptMap[dept].mataji++;
        else if (user.role === "Staff (paid-volunteer)") deptMap[dept].staff++;
        else if (user.role === "Brahmachari") deptMap[dept].brahmachari++;
        else if (user.role?.toLowerCase().includes("volunteer")) deptMap[dept].volunteers++;
      });
      setDepartmentStats(Object.values(deptMap));
    }
  };

  const filteredDepts = departmentStats.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {stats && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600 mt-1">Approved</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600">{stats.volunteers}</div>
              <div className="text-sm text-gray-600 mt-1">Volunteers</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-indigo-600">{stats.prabhuji}</div>
              <div className="text-sm text-gray-600 mt-1">Prabhuji</div>
            </div>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-pink-600">{stats.mataji}</div>
              <div className="text-sm text-gray-600 mt-1">Mataji</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-600">{stats.staff}</div>
              <div className="text-sm text-gray-600 mt-1">Staff</div>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-teal-600">{stats.brahmachari}</div>
              <div className="text-sm text-gray-600 mt-1">Brahmachari</div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department-wise Allocation</h3>
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md border border-gray-300 rounded px-3 py-2 mb-4"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Department</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Total</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Volunteers</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Prabhuji</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Mataji</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Staff</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Brahmachari</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepts.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">{dept.name}</td>
                    <td className="px-4 py-3 text-sm text-center font-semibold text-blue-600 border-b">{dept.total}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 border-b">{dept.volunteers}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 border-b">{dept.prabhuji}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 border-b">{dept.mataji}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 border-b">{dept.staff}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 border-b">{dept.brahmachari}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

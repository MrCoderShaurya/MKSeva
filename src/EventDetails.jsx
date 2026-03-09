import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function EventDetails({ selectedEvent }) {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedEvent]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: deptData } = await supabase
        .from("dep")
        .select("name, depinc, depphno, tmem")
        .order("name");

      const { data: userData } = await supabase
        .from("users")
        .select("name, email, phone_number, department, role, status")
        .eq("event", selectedEvent)
        .eq("status", "approved");

      setDepartments(deptData || []);
      setUsers(userData || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded border border-gray-300 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-300 bg-gray-50">
          <h3 className="text-base font-medium text-gray-900">Department Information</h3>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Department</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">In-charge Name</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">In-charge Phone</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Total Members</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={dept.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 font-medium">{dept.name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{dept.depinc || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{dept.depphno || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-blue-600 font-medium">{dept.tmem || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-300 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-300 bg-gray-50">
          <h3 className="text-base font-medium text-gray-900">User Details ({users.length} users)</h3>
        </div>
        <div className="overflow-auto" style={{maxHeight: '50vh'}}>
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Name</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Email</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Phone</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Department</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 font-medium">{user.name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{user.email}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{user.phone_number || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{user.department || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'paid-volunteer' ? 'bg-green-100 text-green-800' :
                      user.role === 'volunteer' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function SalaryManagement({ selectedEvent }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalSalary: 0,
    totalExtra: 0,
    totalTravelling: 0,
    totalPettyCash: 0,
    grandTotal: 0
  });

  useEffect(() => {
    fetchSalaryData();
  }, [selectedEvent]);

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("users")
        .select("name, role, department, salaryamount, extra, travelling, petty_cash, total")
        .eq("status", "approved");

      if (selectedEvent) {
        query = query.eq("event", selectedEvent);
      }

      const { data, error } = await query;

      if (!error && data) {
        setUsers(data);
        calculateTotals(data);
      }
    } catch (err) {
      console.error("Fetch salary data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (data) => {
    const totals = data.reduce((acc, user) => {
      acc.totalSalary += parseFloat(user.salaryamount) || 0;
      acc.totalExtra += parseFloat(user.extra) || 0;
      acc.totalTravelling += parseFloat(user.travelling) || 0;
      acc.totalPettyCash += parseFloat(user.petty_cash) || 0;
      acc.grandTotal += parseFloat(user.total) || 0;
      return acc;
    }, {
      totalSalary: 0,
      totalExtra: 0,
      totalTravelling: 0,
      totalPettyCash: 0,
      grandTotal: 0
    });

    setTotals(totals);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Role', 'Department', 'Salary', 'Extra', 'Travelling', 'Petty Cash', 'Total'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.name,
        user.role || '',
        user.department || '',
        user.salaryamount || 0,
        user.extra || 0,
        user.travelling || 0,
        user.petty_cash || 0,
        user.total || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary_report_${selectedEvent || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Salary</p>
          <p className="text-2xl font-bold text-blue-600">₹{totals.totalSalary.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Extra</p>
          <p className="text-2xl font-bold text-green-600">₹{totals.totalExtra.toFixed(2)}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Travelling</p>
          <p className="text-2xl font-bold text-yellow-600">₹{totals.totalTravelling.toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Petty Cash</p>
          <p className="text-2xl font-bold text-purple-600">₹{totals.totalPettyCash.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 text-white rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-1">Grand Total</p>
          <p className="text-2xl font-bold">₹{totals.grandTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-300 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-300 bg-gray-50 flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-900">Salary Details ({users.length} users)</h3>
          <button
            onClick={exportToCSV}
            className="text-sm bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-auto" style={{maxHeight: '60vh'}}>
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Name</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Role</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Department</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-medium">Salary</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-medium">Extra</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-medium">Travelling</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-medium">Petty Cash</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-3 py-2 font-medium">{user.name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{user.role || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{user.department || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-blue-600">₹{parseFloat(user.salaryamount || 0).toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-green-600">₹{parseFloat(user.extra || 0).toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-yellow-600">₹{parseFloat(user.travelling || 0).toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-purple-600">₹{parseFloat(user.petty_cash || 0).toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-bold text-gray-900">₹{parseFloat(user.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

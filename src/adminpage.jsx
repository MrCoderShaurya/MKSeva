import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useLanguage } from "./LanguageContext";
import NotificationPopup from "./NotificationPopup";

export default function AdminPage({ onBack, defaultSection = "registrations", selectedEvent }) {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [notification, setNotification] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    fetchUsers();
  }, [selectedEvent]);

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from("users")
        .select("id, name, email, phone_number, role, department, status, event, created_at, attendance, atotal, r_id")
        .neq("name", "Event Creator")
        .neq("email", "admin@event.com")
        .not("status", "eq", "event_created")
        .order("created_at", { ascending: false });
      
      // Filter by selected event if provided
      if (selectedEvent) {
        query = query.eq("event", selectedEvent);
      }
      
      const { data, error } = await query;
      
      if (!error) setUsers(data || []);
      else console.error(error);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };



  useEffect(() => {
    fetchUsers();
  }, [selectedEvent]);

  const handleApprove = async (formData) => {
    try {
      // Only include fields that exist in the users table
      const validFields = ['department', 'role', 'a_date', 'slotn', 'slots', 'slote', 'extra', 'travelling', 'salaryamount', 'petty_cash', 'total', 'depinc'];
      const updateData = { status: "approved" };
      
      validFields.forEach(field => {
        if (field in formData && formData[field] !== '') {
          updateData[field] = formData[field];
        }
      });

      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", selectedUser.id)
        .select();

      if (error) {
        console.error("Approve error:", error);
        setNotification({ message: 'Error: ' + error.message, type: 'error' });
        throw new Error(error.message);
      }

      // Send approval email
      await sendApprovalEmail(data[0]);

      fetchUsers();
      setSelectedUser(null);
      setActionType(null);
      setNotification({ message: 'User approved successfully!', type: 'success' });
      return { success: true };
    } catch (err) {
      console.error("Approve catch:", err);
      throw err;
    }
  };

  const sendApprovalEmail = async (user) => {
    try {
      // Fetch department details
      const { data: deptData } = await supabase
        .from("dep")
        .select("depinc, depphno")
        .eq("name", user.department)
        .single();

      await fetch('http://localhost:3001/api/send-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.name,
          eventName: user.event,
          eventDate: user.eventdate,
          department: user.department,
          role: user.role,
          depinc: deptData?.depinc || 'Not assigned',
          depphno: deptData?.depphno || 'Not provided',
          r_id: user.r_id || 'Not assigned'
        })
      });
    } catch (error) {
      console.error('Email notification error:', error);
    }
  };

  const handleReject = async (reason) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ 
          status: "rejected",
          comments: reason
        })
        .eq("id", selectedUser.id)
        .select();

      if (error) {
        console.error("Reject error:", error);
        setNotification({ message: 'Error: ' + error.message, type: 'error' });
        return;
      }

      fetchUsers();
      setSelectedUser(null);
      setActionType(null);
      setNotification({ message: 'User rejected!', type: 'success' });
    } catch (err) {
      console.error("Reject catch:", err);
      setNotification({ message: 'Error rejecting user', type: 'error' });
    }
  };

  const handleEdit = async (formData) => {
    try {
      // Only include fields that exist in the users table
      const validFields = ['department', 'role', 'a_date', 'slotn', 'slots', 'slote', 'extra', 'travelling', 'salaryamount', 'petty_cash', 'total', 'depinc'];
      const updateData = {};
      
      validFields.forEach(field => {
        if (field in formData && formData[field] !== '') {
          updateData[field] = formData[field];
        }
      });

      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", selectedUser.id)
        .select();

      if (error) {
        console.error("Edit error:", error);
        setNotification({ message: 'Error: ' + error.message, type: 'error' });
        return;
      }

      fetchUsers();
      setSelectedUser(null);
      setActionType(null);
      setNotification({ message: 'User updated!', type: 'success' });
    } catch (err) {
      console.error("Edit catch:", err);
      setNotification({ message: 'Error updating user', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {t('adminPanel')} - User Management
              {selectedEvent && (
                <span className="text-sm font-normal text-blue-600 ml-2">
                  ({selectedEvent})
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {onBack && (
              <button
                onClick={onBack}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('backToHome')}
              </button>
            )}
          </div>
        </div>
      </div>

      <RegistrationSection
        users={users}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        actionType={actionType}
        setActionType={setActionType}
        handleApprove={handleApprove}
        handleReject={handleReject}
        handleEdit={handleEdit}
      />
    </div>
  );
}

function RegistrationSection({
  users,
  selectedUser,
  setSelectedUser,
  actionType,
  setActionType,
  handleApprove,
  handleReject,
  handleEdit
}) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleRowSelection = (userId) => {
    setSelectedRows(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const bulkApprove = async (userIds) => {
    setLoading(true);
    try {
      for (const userId of userIds) {
        const user = users.find(u => u.id === userId);
        if (user && user.status === 'pending') {
          setSelectedUser(user);
          await handleApprove({ department: '', role: 'volunteer' });
        }
      }
      setSelectedRows([]);
    } catch (error) {
      console.error('Bulk approve error:', error);
    } finally {
      setLoading(false);
    }
  };

  const bulkReject = async (userIds) => {
    setLoading(true);
    try {
      for (const userId of userIds) {
        const user = users.find(u => u.id === userId);
        if (user && user.status === 'pending') {
          setSelectedUser(user);
          await handleReject('Bulk rejection');
        }
      }
      setSelectedRows([]);
    } catch (error) {
      console.error('Bulk reject error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data) => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Department', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(user => [
        user.name,
        user.email,
        user.phone_number || '',
        user.role || '',
        user.department || '',
        user.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  let sortedUsers = [...filteredUsers];
  if (sortConfig.key) {
    sortedUsers.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const generatePDF = (user) => {
    const printWindow = window.open('', '_blank');
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>User Details - ${user.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .field { margin-bottom: 10px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>User Registration Details</h1>
          <h2>${user.event || 'Event Registration'}</h2>
        </div>
        <div class="section">
          <h3>Personal Information</h3>
          <div class="field"><span class="label">Name:</span> ${user.name}</div>
          <div class="field"><span class="label">Email:</span> ${user.email}</div>
          <div class="field"><span class="label">Phone:</span> ${user.phone_number || 'Not provided'}</div>
          <div class="field"><span class="label">Role:</span> ${user.role || 'Not assigned'}</div>
          <div class="field"><span class="label">Department:</span> ${user.department || 'Not assigned'}</div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
      <div className="bg-white mx-4 mt-4 rounded border border-gray-300 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-300 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-gray-900">{t('registrationManagement')}</h2>
              <span className="text-sm text-gray-500">({filteredUsers.length} records)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search registrations by name, email, or department"
              />
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Items per page"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <button
                onClick={() => exportToCSV(filteredUsers)}
                className="text-sm bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Export registration data to CSV file"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-auto" style={{maxHeight: '70vh'}}>
          <table className="w-full text-sm border-collapse" role="table" aria-label="User registrations management">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('name')} scope="col" aria-sort={sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('email')} scope="col" aria-sort={sortConfig.key === 'email' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('phone_number')} scope="col" aria-sort={sortConfig.key === 'phone_number' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Phone {sortConfig.key === 'phone_number' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('role')} scope="col" aria-sort={sortConfig.key === 'role' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('department')} scope="col" aria-sort={sortConfig.key === 'department' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Department {sortConfig.key === 'department' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('attendance')} scope="col" aria-sort={sortConfig.key === 'attendance' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Attendance {sortConfig.key === 'attendance' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('atotal')} scope="col" aria-sort={sortConfig.key === 'atotal' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Hours Worked {sortConfig.key === 'atotal' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-200" onClick={() => handleSort('status')} scope="col" aria-sort={sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, index) => (
                <tr key={user.id} className={`hover:bg-blue-50 ${selectedRows.includes(user.id) ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(user.id)}
                        onChange={() => toggleRowSelection(user.id)}
                        className="w-4 h-4 focus:ring-2 focus:ring-blue-500"
                        aria-label={`Select ${user.name} for bulk actions`}
                      />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{user.email}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{user.phone_number || 'N/A'}</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border-l-4 ${
                      user.role === 'paid-volunteer' ? 'bg-green-100 text-green-800 border-green-600' :
                      user.role === 'volunteer' ? 'bg-blue-100 text-blue-800 border-blue-600' :
                      user.role === 'bramachari' ? 'bg-purple-100 text-purple-800 border-purple-600' :
                      'bg-gray-100 text-gray-600 border-gray-400'
                    }`}>
                      <span className="sr-only">Role: </span>
                      {user.role || 'Unassigned'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{user.department || 'Unassigned'}</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <span className={`px-1 py-0.5 rounded text-xs font-medium border-l-4 ${
                      user.attendance === 'present' ? 'bg-green-100 text-green-800 border-green-600' : 'bg-gray-100 text-gray-600 border-gray-400'
                    }`}>
                      <span className="sr-only">Attendance: </span>
                      {user.attendance === 'present' ? '✓ Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-blue-600 font-medium">
                    {user.atotal || '0h 0m'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border-l-4 ${
                      user.status === 'approved' ? 'bg-green-100 text-green-800 border-green-600' :
                      user.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-600' :
                      'bg-yellow-100 text-yellow-800 border-yellow-600'
                    }`}>
                      <span className="sr-only">Status: </span>
                      {user.status === 'approved' && <span aria-hidden="true">✓ </span>}
                      {user.status === 'rejected' && <span aria-hidden="true">✗ </span>}
                      {user.status === 'pending' && <span aria-hidden="true">⏳ </span>}
                      {user.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="flex gap-1">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('approve');
                            }}
                            className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            aria-label={`Approve registration for ${user.name}`}
                          >
                            <span aria-hidden="true">✓</span>
                            <span className="sr-only">Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('reject');
                            }}
                            className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label={`Reject registration for ${user.name}`}
                          >
                            <span aria-hidden="true">✗</span>
                            <span className="sr-only">Reject</span>
                          </button>
                        </>
                      )}
                      {user.status === 'approved' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('edit');
                            }}
                            className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label={`Edit details for ${user.name}`}
                          >
                            <span aria-hidden="true">✎</span>
                            <span className="sr-only">Edit</span>
                          </button>
                          <button
                            onClick={() => generatePDF(user)}
                            className="text-sm bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            aria-label={`Generate PDF for ${user.name}`}
                          >
                            <span aria-hidden="true">📄</span>
                            <span className="sr-only">PDF</span>
                          </button>
                        </>
                      )}
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
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
          </span>
          {selectedRows.length > 0 && (
            <div className="flex gap-1">
              <button
                onClick={() => bulkApprove(selectedRows)}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                Bulk Approve ({selectedRows.length})
              </button>
              <button
                onClick={() => bulkReject(selectedRows)}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Bulk Reject ({selectedRows.length})
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

      {selectedUser && actionType === "edit" && (
        <EditModal
          user={selectedUser}
          onSubmit={handleEdit}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {selectedUser && actionType === "approve" && (
        <ApproveModal
          user={selectedUser}
          onSubmit={handleApprove}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {selectedUser && actionType === "reject" && (
        <RejectModal
          onSubmit={handleReject}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}



function EditModal({ user, onSubmit, onClose }) {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({
    department: user.department || "",
    depinc: user.depinc || "",
    role: user.role || "",
    a_date: user.a_date || "",
    slotn: user.slotn || "",
    slots: user.slots || "",
    slote: user.slote || "",
    extra: user.extra || "",
    travelling: user.travelling || "",
    salaryamount: user.salaryamount || "",
    petty_cash: user.petty_cash || ""
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("dep")
        .select("name, depinc, depphno")
        .order("name");

      if (!error) {
        setDepartments(data || []);
      }
    } catch (err) {
      console.error("Fetch departments error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedData);
    
    if (name === 'department') {
      const dept = departments.find(d => d.name === value);
      setSelectedDept(dept);
      if (dept) {
        updatedData.depinc = dept.depinc || "";
        setFormData(updatedData);
      }
    }
  };

  const isPaidVolunteer = formData.role === "paid-volunteer";

  const calculateTotal = () => {
    if (!isPaidVolunteer) return 0;
    
    const extra = parseFloat(formData.extra) || 0;
    const travelling = parseFloat(formData.travelling) || 0;
    const salaryAmount = parseFloat(formData.salaryamount) || 0;
    const pettyCash = parseFloat(formData.petty_cash) || 0;
    
    return extra + travelling + salaryAmount + pettyCash;
  };

  const handleSubmit = async () => {
    try {
      const submitData = { ...formData };
      
      if (submitData.extra === "") submitData.extra = null;
      if (submitData.travelling === "") submitData.travelling = null;
      if (submitData.salaryamount === "") submitData.salaryamount = null;
      if (submitData.petty_cash === "") submitData.petty_cash = null;
      
      if (isPaidVolunteer) {
        submitData.total = calculateTotal();
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit User Details</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="w-full border p-2 mb-2 rounded"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.name} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
        
        {formData.department && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-700 mb-2">Department In-charge</h4>
            {selectedDept && (
              <p className="text-sm text-gray-600 mb-2">Phone: {selectedDept.depphno || 'Not provided'}</p>
            )}
          </div>
        )}
        
        <label className="block text-sm font-medium text-gray-700 mb-1">Department In-charge Name</label>
        <input
          type="text"
          name="depinc"
          value={formData.depinc}
          readOnly
          className="w-full border p-2 mb-4 rounded bg-gray-100"
          placeholder="Auto-populated from department"
        />
        
        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border p-2 mb-2 rounded"
        >
          <option value="">Select Registration Type</option>
          <option value="volunteer">Volunteer Prabhuji</option>
          <option value="volunteer">Volunteer Mataji</option>
          <option value="paid-volunteer">Staff</option>
          <option value="bramachari">Brahmachari</option>
        </select>
        
        <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Date</label>
        <input
          type="date"
          name="a_date"
          value={formData.a_date}
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
        />

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3 text-gray-700">Slot Assignment</h3>
          
          <label className="block text-sm font-medium text-gray-700 mb-1">Slot Name</label>
          <input
            name="slotn"
            placeholder="Slot Name"
            value={formData.slotn}
            onChange={handleChange}
            className="w-full border p-2 mb-2 rounded"
          />
          
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            name="slots"
            value={formData.slots}
            onChange={handleChange}
            className="w-full border p-2 mb-2 rounded"
          />
          
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            name="slote"
            value={formData.slote}
            onChange={handleChange}
            className="w-full border p-2 mb-4 rounded"
          />
        </div>

        {isPaidVolunteer && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3 text-gray-700">Financial Details</h3>
            
            <label className="block text-sm font-medium text-gray-700 mb-1">Extra Amount</label>
            <input
              type="number"
              name="extra"
              placeholder="Extra Amount"
              value={formData.extra}
              onChange={handleChange}
              className="w-full border p-2 mb-2 rounded"
            />
            
            <label className="block text-sm font-medium text-gray-700 mb-1">Travelling Amount</label>
            <input
              type="number"
              name="travelling"
              placeholder="Travelling Amount"
              value={formData.travelling}
              onChange={handleChange}
              className="w-full border p-2 mb-2 rounded"
            />
            
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Amount</label>
            <input
              type="number"
              name="salaryamount"
              placeholder="Salary Amount"
              value={formData.salaryamount}
              onChange={handleChange}
              className="w-full border p-2 mb-2 rounded"
            />
            
            <label className="block text-sm font-medium text-gray-700 mb-1">Petty Cash Amount</label>
            <input
              type="number"
              name="petty_cash"
              placeholder="Petty Cash Amount"
              value={formData.petty_cash}
              onChange={handleChange}
              className="w-full border p-2 mb-4 rounded"
            />

            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <p className="text-sm font-semibold text-gray-700">
                Total Amount: <span className="text-blue-600 text-lg">₹{calculateTotal().toFixed(2)}</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

function ApproveModal({ user, onSubmit, onClose }) {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    department: "",
    depinc: "",
    role: "",
    a_date: "",
    slotn: "",
    slots: "",
    slote: "",
    extra: "",
    travelling: "",
    salaryamount: "",
    petty_cash: ""
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("dep")
        .select("name, depinc, depphno")
        .order("name");

      if (!error) {
        setDepartments(data || []);
      }
    } catch (err) {
      console.error("Fetch departments error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedData);
    
    if (name === 'department') {
      const dept = departments.find(d => d.name === value);
      setSelectedDept(dept);
      if (dept) {
        updatedData.depinc = dept.depinc || "";
        setFormData(updatedData);
      }
    }
  };

  const isPaidVolunteer = formData.role === "paid-volunteer";

  const calculateTotal = () => {
    if (!isPaidVolunteer) return 0;
    
    const extra = parseFloat(formData.extra) || 0;
    const travelling = parseFloat(formData.travelling) || 0;
    const salaryAmount = parseFloat(formData.salaryamount) || 0;
    const pettyCash = parseFloat(formData.petty_cash) || 0;
    
    return extra + travelling + salaryAmount + pettyCash;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = { ...formData };
      
      if (submitData.extra === "") submitData.extra = null;
      if (submitData.travelling === "") submitData.travelling = null;
      if (submitData.salaryamount === "") submitData.salaryamount = null;
      if (submitData.petty_cash === "") submitData.petty_cash = null;
      
      if (isPaidVolunteer) {
        submitData.total = calculateTotal();
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error("Approve error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Approve Registration</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="w-full border p-2 mb-2 rounded"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.name} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
        
        {formData.department && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-700 mb-2">Department In-charge</h4>
            {selectedDept && (
              <p className="text-sm text-gray-600 mb-2">Phone: {selectedDept.depphno || 'Not provided'}</p>
            )}
          </div>
        )}
        
        <label className="block text-sm font-medium text-gray-700 mb-1">Department In-charge Name</label>
        <input
          type="text"
          name="depinc"
          value={formData.depinc}
          readOnly
          className="w-full border p-2 mb-4 rounded bg-gray-100"
          placeholder="Auto-populated from department"
        />
        
        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full border p-2 mb-2 rounded"
        >
          <option value="">Select Registration Type</option>
          <option value="volunteer">Volunteer Prabhuji</option>
          <option value="volunteer">Volunteer Mataji</option>
          <option value="paid-volunteer">Staff</option>
          <option value="bramachari">Brahmachari</option>
        </select>
        
        <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Date</label>
        <input
          type="date"
          name="a_date"
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
        />

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3 text-gray-700">Slot Assignment</h3>
          
          <label className="block text-sm font-medium text-gray-700 mb-1">Slot Name</label>
          <input
            name="slotn"
            placeholder="Slot Name"
            value={formData.slotn}
            onChange={handleChange}
            className="w-full border p-2 mb-2 rounded"
          />
          
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            name="slots"
            value={formData.slots}
            onChange={handleChange}
            className="w-full border p-2 mb-2 rounded"
          />
          
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            name="slote"
            value={formData.slote}
            onChange={handleChange}
            className="w-full border p-2 mb-4 rounded"
          />
        </div>

        {isPaidVolunteer && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3 text-gray-700">Financial Details</h3>
            
            <label className="block text-sm font-medium text-gray-700 mb-1">Extra Amount</label>
            <input
              type="number"
              name="extra"
              placeholder="Extra Amount"
              value={formData.extra}
              onChange={handleChange}
              className="w-full border p-2 mb-2 rounded"
            />
            
            <label className="block text-sm font-medium text-gray-700 mb-1">Travelling Amount</label>
            <input
              type="number"
              name="travelling"
              placeholder="Travelling Amount"
              value={formData.travelling}
              onChange={handleChange}
              className="w-full border p-2 mb-2 rounded"
            />
            
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Amount</label>
            <input
              type="number"
              name="salaryamount"
              placeholder="Salary Amount"
              value={formData.salaryamount}
              onChange={handleChange}
              className="w-full border p-2 mb-2 rounded"
            />
            
            <label className="block text-sm font-medium text-gray-700 mb-1">Petty Cash Amount</label>
            <input
              type="number"
              name="petty_cash"
              placeholder="Petty Cash Amount"
              value={formData.petty_cash}
              onChange={handleChange}
              className="w-full border p-2 mb-4 rounded"
            />

            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <p className="text-sm font-semibold text-gray-700">
                Total Amount: <span className="text-blue-600 text-lg">₹{calculateTotal().toFixed(2)}</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ onSubmit, onClose }) {
  const { t } = useLanguage();
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">{t('rejectRegistration')}</h2>

        <textarea
          placeholder={t('reasonForRejection')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border p-2 mb-4"
        />

        <div className="flex justify-end space-x-2">
          <button onClick={onClose}>{t('cancel')}</button>
          <button
            onClick={() => onSubmit(reason)}
            className="bg-red-600 text-white px-4 py-1 rounded"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}



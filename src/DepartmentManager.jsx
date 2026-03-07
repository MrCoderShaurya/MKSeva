import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useLanguage } from "./LanguageContext";
import NotificationPopup from "./NotificationPopup";

export default function DepartmentManager({ onBack }) {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inchargeFilter, setInchargeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(dept => 
    (!searchTerm || 
     dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     dept.depinc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     dept.depphno?.includes(searchTerm)) &&
    (!inchargeFilter || dept.depinc === inchargeFilter)
  );

  const uniqueIncharges = [...new Set(departments.map(d => d.depinc).filter(Boolean))];

  // Pagination logic
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dep")
        .select("*");

      if (!error) {
        setDepartments(data || []);
      } else {
        console.error("Error fetching departments:", error);
      }
    } catch (err) {
      console.error("Fetch departments error:", err);
    }
    setLoading(false);
  };

  const handleExcelImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        const departmentsToImport = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 3) {
            departmentsToImport.push({
              name: values[0]?.trim(),
              depinc: values[1]?.trim(),
              depphno: values[2]?.trim(),
              tmem: parseInt(values[3]) || 0
            });
          }
        }

        if (departmentsToImport.length > 0) {
          const { error } = await supabase
            .from("dep")
            .insert(departmentsToImport);

          if (!error) {
            setNotification({ message: `Imported ${departmentsToImport.length} departments`, type: 'success' });
            fetchDepartments();
          } else {
            setNotification({ message: 'Error: ' + error.message, type: 'error' });
          }
        }
      } catch (error) {
        setNotification({ message: 'Error processing file', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleAddDepartment = async (departmentData) => {
    try {
      const { error } = await supabase
        .from("dep")
        .insert([departmentData]);

      if (error) {
        setNotification({ message: 'Error: ' + error.message, type: 'error' });
        return;
      }

      setNotification({ message: 'Department created!', type: 'success' });
      fetchDepartments();
      setShowAddModal(false);
    } catch (err) {
      console.error("Add department error:", err);
      setNotification({ message: 'Error creating department', type: 'error' });
    }
  };

  const handleEditDepartment = async (departmentData) => {
    try {
      const { error } = await supabase
        .from("dep")
        .update(departmentData)
        .eq("id", editingDepartment.id);

      if (error) {
        setNotification({ message: 'Error: ' + error.message, type: 'error' });
        return;
      }

      setNotification({ message: 'Department updated!', type: 'success' });
      fetchDepartments();
      setShowEditModal(false);
      setEditingDepartment(null);
    } catch (err) {
      console.error("Edit department error:", err);
      setNotification({ message: 'Error updating department', type: 'error' });
    }
  };

  const handleDeleteDepartment = async (department) => {
    if (!confirm(`Are you sure you want to delete "${department.name}" department?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("dep")
        .delete()
        .eq("name", department.name);

      if (error) {
        setNotification({ message: 'Error: ' + error.message, type: 'error' });
        return;
      }

      setNotification({ message: 'Department deleted!', type: 'success' });
      fetchDepartments();
    } catch (err) {
      console.error("Delete department error:", err);
      setNotification({ message: 'Error deleting department', type: 'error' });
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-medium text-gray-900">{t('departmentManagement')}</h1>
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {t('backToHome')}
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mb-6 flex gap-3 items-center flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium"
          >
            {t('addNewDepartment')}
          </button>
          
          <label className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 cursor-pointer font-medium">
            Import Excel (Name, In-charge, Phone)
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleExcelImport}
              className="hidden"
            />
          </label>
          
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm w-64"
          />
          
          <select
            value={inchargeFilter}
            onChange={(e) => setInchargeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All Incharges</option>
            {uniqueIncharges.map(incharge => (
              <option key={incharge} value={incharge}>{incharge}</option>
            ))}
          </select>
          
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
          
          <span className="text-sm text-gray-500">({filteredDepartments.length} departments)</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">In-charge</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Members</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {paginatedDepartments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500 border border-gray-300">
                        {searchTerm ? 'No departments found matching your search' : t('noDepartmentsFound')}
                      </td>
                    </tr>
                  ) : (
                    paginatedDepartments.map((dept, index) => (
                      <DepartmentRow
                        key={dept.id}
                        department={dept}
                        index={index}
                        onViewDetails={() => setSelectedDepartment(dept)}
                        onEdit={() => {
                          setEditingDepartment(dept);
                          setShowEditModal(true);
                        }}
                        onDelete={() => handleDeleteDepartment(dept)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} departments
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded text-sm ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAddModal && (
        <AddDepartmentModal
          onSubmit={handleAddDepartment}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && editingDepartment && (
        <EditDepartmentModal
          department={editingDepartment}
          onSubmit={handleEditDepartment}
          onClose={() => {
            setShowEditModal(false);
            setEditingDepartment(null);
          }}
        />
      )}

      {selectedDepartment && (
        <DepartmentDetailsModal
          department={selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
        />
      )}
    </div>
  );
}

function DepartmentRow({ department, index, onViewDetails, onEdit, onDelete }) {
  const { t } = useLanguage();
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    fetchUserCount();
  }, [department.name]);

  const fetchUserCount = async () => {
    try {
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("department", department.name)
        .eq("status", "approved");

      if (!error) {
        setUserCount(count || 0);
      }
    } catch (err) {
      console.error("Fetch user count error:", err);
    }
  };

  return (
    <tr className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
      <td className="px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300">{department.name}</td>
      <td className="px-4 py-3 text-sm text-gray-500 border border-gray-300">{department.depinc}</td>
      <td className="px-4 py-3 text-sm text-gray-500 border border-gray-300">{department.depphno}</td>
      <td className="px-4 py-3 text-sm text-gray-500 border border-gray-300">{department.tmem || userCount}</td>
      <td className="px-4 py-3 text-sm font-medium border border-gray-300">
        <div className="flex gap-1">
          <button
            onClick={onViewDetails}
            className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            View
          </button>
          <button
            onClick={onEdit}
            className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddDepartmentModal({ onSubmit, onClose }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    depinc: "",
    depphno: "",
    tmem: 0
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.depinc) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">{t('addNewDepartment')}</h2>

        <input
          name="name"
          placeholder={`${t('departmentName')} *`}
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 mb-2 rounded"
          required
        />

        <input
          name="depinc"
          placeholder={`${t('inCharge')} *`}
          value={formData.depinc}
          onChange={handleChange}
          className="w-full border p-2 mb-2 rounded"
          required
        />

        <input
          name="depphno"
          placeholder={t('phone')}
          value={formData.depphno}
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {t('addDepartment')}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditDepartmentModal({ department, onSubmit, onClose }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: department.name || "",
    depinc: department.depinc || "",
    depphno: department.depphno || "",
    tmem: department.tmem || 0
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.depinc) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Department</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
        <input
          name="name"
          placeholder="Department Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 mb-2 rounded"
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">In-charge Name *</label>
        <input
          name="depinc"
          placeholder="In-charge Name"
          value={formData.depinc}
          onChange={handleChange}
          className="w-full border p-2 mb-2 rounded"
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          name="depphno"
          placeholder="Phone Number"
          value={formData.depphno}
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

function DepartmentDetailsModal({ department, onClose }) {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchDepartmentUsers();
  }, [department.name]);

  const fetchDepartmentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("name, phone_number, role, event, email, status")
        .eq("department", department.name)
        .eq("status", "approved");

      if (!error) {
        setUsers(data || []);
      }
    } catch (err) {
      console.error("Fetch department users error:", err);
    }
  };

  const uniqueRoles = [...new Set(users.map(u => u.role).filter(Boolean))];
  const uniqueEvents = [...new Set(users.map(u => u.event).filter(Boolean))];

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesEvent = eventFilter === 'all' || user.event === eventFilter;
    
    return matchesSearch && matchesRole && matchesEvent;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-[90vw] max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-900">{department.name} - Department Details</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-lg font-medium"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded border">
            <div>
              <span className="text-sm font-medium text-gray-500">Department In-charge</span>
              <p className="text-base font-medium text-gray-900">{department.depinc || 'Not assigned'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Phone Number</span>
              <p className="text-base font-medium text-gray-900">{department.depphno || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Total Members</span>
              <p className="text-base font-medium text-gray-900">{users.length}</p>
            </div>
          </div>

          <div className="mb-4 flex gap-3 items-center flex-wrap">
            <h3 className="text-lg font-medium text-gray-900">Department Members</h3>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm w-48"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Events</option>
              {uniqueEvents.map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <span className="text-sm text-gray-500">({filteredUsers.length} members)</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setEventFilter('all');
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              Clear
            </button>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || roleFilter !== 'all' || eventFilter !== 'all' ? 'No members found matching your filters' : 'No members assigned to this department'}
            </div>
          ) : (
            <>
              <div className="bg-white border border-gray-200 rounded overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Event</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {paginatedUsers.map((user, index) => (
                        <tr key={`${user.name}-${index}`} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300">{user.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 border border-gray-300">{user.email || 'Not provided'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 border border-gray-300">{user.phone_number || 'Not provided'}</td>
                          <td className="px-4 py-3 text-sm border border-gray-300">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'paid-volunteer' ? 'bg-green-100 text-green-800' :
                              user.role === 'volunteer' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'bramachari' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {user.role || 'Unassigned'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 border border-gray-300">{user.event || 'Not assigned'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} members
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === page 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
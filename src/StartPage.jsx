import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AdminPage from "./adminpage";
import DepartmentManager from "./DepartmentManager";
import SevaChart from "./SevaChart";
import EventCreationForm from "./EventCreationForm";
import SalaryManagement from "./SalaryManagement";
import EventDetails from "./EventDetails";
import { useLanguage } from "./LanguageContext";
import NotificationPopup from "./NotificationPopup";

function Sidebar({ currentPage, setCurrentPage, events, selectedEvent, setSelectedEvent, setEventSubTab }) {
  return (
    <div className="w-64 bg-white border-r border-gray-300 flex flex-col h-screen overflow-y-auto">
      <div className="px-5 py-4 border-b border-gray-300 bg-gradient-to-r from-blue-600 to-blue-700">
        <h1 className="text-lg font-bold text-white">Event Manager</h1>
        <p className="text-xs text-blue-100 mt-0.5">Admin Dashboard</p>
      </div>
      
      <nav className="flex-1 px-3 py-3">
        <div className="mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Main Menu</h3>
          <button
            onClick={() => {
              setCurrentPage("home");
              setSelectedEvent(null);
            }}
            className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg mb-1 flex items-center gap-2 transition-all ${
              currentPage === "home"
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">🏠</span>
            <span>Home</span>
          </button>

        </div>

        {events.length > 0 && (
          <div className="mb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Events</h3>
            {events.map((event) => (
              <button
                key={event.name}
                onClick={() => {
                  setSelectedEvent(event.name);
                  setCurrentPage("event-detail");
                  setEventSubTab("details");
                }}
                className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg mb-1 flex items-center gap-2 transition-all ${
                  selectedEvent === event.name
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">🎯</span>
                <span className="truncate">{event.name}</span>
              </button>
            ))}
          </div>
        )}
        
        <div className="mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Data Management</h3>
          <button
            onClick={() => {
              setCurrentPage("import");
              setSelectedEvent(null);
            }}
            className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg mb-1 flex items-center gap-2 transition-all ${
              currentPage === "import"
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">📥</span>
            <span>Import</span>
          </button>
          <button
            onClick={() => {
              setCurrentPage("export");
              setSelectedEvent(null);
            }}
            className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg mb-1 flex items-center gap-2 transition-all ${
              currentPage === "export"
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">📤</span>
            <span>Export</span>
          </button>
        </div>
      </nav>
      
      <div className="px-3 py-3 border-t border-gray-300 bg-gray-50">
        <div className="text-xs text-gray-600 text-center">
          <p className="font-semibold">Admin User</p>
          <p className="text-gray-500 mt-0.5">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export default function StartPage() {
  const { t, language, changeLanguage } = useLanguage();
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventSubTab, setEventSubTab] = useState("seva-chart");
  const [events, setEvents] = useState([]);
  const [notification, setNotification] = useState(null);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("project")
        .select("name, date, discription, location, status")
        .order("created_at", { ascending: false });

      if (!error) {
        setEvents(data || []);
      }
    } catch (err) {
      console.error("Fetch events error:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventCreated = () => {
    fetchEvents();
    setNotification({ message: "Event created! Check sidebar.", type: "success" });
  };

  if (currentPage === "import") {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          events={events}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          setEventSubTab={setEventSubTab}
        />
        <div className="flex-1">
          <div className="bg-white border-b border-gray-300 px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Import Data</h1>
          </div>
          <div className="p-6">
            <ExcelImportModal onClose={() => setCurrentPage("home")} />
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === "export") {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          events={events}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          setEventSubTab={setEventSubTab}
        />
        <div className="flex-1">
          <div className="bg-white border-b border-gray-300 px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Export Data</h1>
          </div>
          <div className="p-6">
            <ExportModal onClose={() => setCurrentPage("home")} />
          </div>
        </div>
      </div>
    );
  }



  if (currentPage === "event-detail" && selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          events={events}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          setEventSubTab={setEventSubTab}
        />
        <div className="flex-1">
          <div className="bg-white border-b border-gray-300">
            <div className="px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-900">{selectedEvent}</h1>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setEventSubTab("details")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  eventSubTab === "details"
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                📋 Details
              </button>
              <button
                onClick={() => setEventSubTab("admin-panel")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  eventSubTab === "admin-panel"
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                👥 Admin Panel
              </button>
              <button
                onClick={() => setEventSubTab("departments")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  eventSubTab === "departments"
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🏢 Departments
              </button>
              <button
                onClick={() => setEventSubTab("seva-chart")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  eventSubTab === "seva-chart"
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                📊 Seva Chart
              </button>
              <button
                onClick={() => setEventSubTab("salary")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  eventSubTab === "salary"
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                💰 Accounts
              </button>
            </div>
          </div>
          <div className="p-6">
            {eventSubTab === "details" && <EventDetails selectedEvent={selectedEvent} />}
            {eventSubTab === "admin-panel" && <AdminPage selectedEvent={selectedEvent} />}
            {eventSubTab === "departments" && <DepartmentManager selectedEvent={selectedEvent} />}
            {eventSubTab === "seva-chart" && <SevaChart selectedEvent={selectedEvent} />}
            {eventSubTab === "salary" && <SalaryManagement selectedEvent={selectedEvent} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        events={events}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        setEventSubTab={setEventSubTab}
      />
      <div className="flex-1">
        <div className="bg-white border-b border-gray-300 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('eventManagementSystem')}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Create and manage events</p>
            </div>
            <button
              onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 font-medium"
            >
              {language === 'en' ? 'हिंदी' : 'EN'}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {notification && (
            <NotificationPopup
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
          
          <EventCreationForm onEventCreated={handleEventCreated} />
        </div>
      </div>
    </div>
  );
}

function ExcelImportModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("project")
        .select("name")
        .order("created_at", { ascending: false });

      if (!error) {
        setEvents(data || []);
      }
    } catch (err) {
      console.error("Fetch events error:", err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').map(row => row.split(','));
      
      const data = rows.slice(1).filter(row => row.length >= 3 && row[0].trim()).map(row => ({
        name: row[0]?.trim() || '',
        email: row[1]?.trim() || '',
        phone_number: row[2]?.trim() || '',
        department: row[3]?.trim() || '',
        role: row[4]?.trim() || 'volunteer'
      }));
      
      setPreview(data.slice(0, 10));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file || !selectedEvent) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.split(','));
        
        const users = rows.slice(1).filter(row => row.length >= 3 && row[0].trim()).map(row => ({
          name: row[0]?.trim() || '',
          email: row[1]?.trim() || '',
          phone_number: row[2]?.trim() || '',
          department: row[3]?.trim() || '',
          role: row[4]?.trim() || 'volunteer',
          event: selectedEvent,
          status: 'pending',
          created_at: new Date().toISOString()
        }));

        const batchSize = 50;
        let successCount = 0;
        
        for (let i = 0; i < users.length; i += batchSize) {
          const batch = users.slice(i, i + batchSize);
          
          const { data, error } = await supabase
            .from('users')
            .insert(batch)
            .select();

          if (!error) {
            successCount += batch.length;
          } else {
            console.error('Batch insert error:', error);
          }
        }

        setNotification({ message: `Imported ${successCount}/${users.length} users`, type: 'success' });
        setTimeout(onClose, 2000);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      setNotification({ message: 'Error importing data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <h2 className="text-lg font-medium mb-4">Import Users from Excel</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        >
          <option value="">Select Event</option>
          {events.map((event) => (
            <option key={event.name} value={event.name}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV/Excel File
        </label>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          Format: Name, Email, Phone, Department, Role
        </p>
      </div>

      {preview.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Preview (First 10 rows)</h3>
          <div className="border border-gray-300 rounded max-h-40 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Email</th>
                  <th className="px-2 py-1 text-left">Phone</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-2 py-1">{row.name}</td>
                    <td className="px-2 py-1">{row.email}</td>
                    <td className="px-2 py-1">{row.phone_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={!file || !selectedEvent || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Importing...' : 'Import'}
        </button>
      </div>
    </div>
  );
}

function ExportModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('all');
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState(null);

  const exportData = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      const exports = [];
      
      if (exportType === 'all' || exportType === 'users') {
        setProgress(20);
        const { data: users, error } = await supabase
          .from('users')
          .select('name, email, phone_number, event, role, department, status, ain, aout, atotal, attendance')
          .neq('name', 'Event Creator')
          .limit(1000);

        if (!error && users) {
          const headers = ['Name', 'Email', 'Phone', 'Event', 'Role', 'Department', 'Status', 'In Time', 'Out Time', 'Total Time', 'Attendance'];
          const csvContent = [
            headers.join(','),
            ...users.map(user => [
              user.name || '',
              user.email || '',
              user.phone_number || '',
              user.event || '',
              user.role || '',
              user.department || '',
              user.status || '',
              user.ain || '',
              user.aout || '',
              user.atotal || '',
              user.attendance || ''
            ].join(','))
          ].join('\n');
          
          exports.push({ content: csvContent, filename: 'users_data.csv' });
        }
      }

      if (exportType === 'all' || exportType === 'events') {
        setProgress(50);
        const { data: events, error } = await supabase
          .from('project')
          .select('name, discription, date, location, status');

        if (!error && events) {
          const headers = ['Event Name', 'Description', 'Date', 'Location', 'Status'];
          const csvContent = [
            headers.join(','),
            ...events.map(event => [
              event.name || '',
              event.discription || '',
              event.date || '',
              event.location || '',
              event.status || 'active'
            ].join(','))
          ].join('\n');
          
          exports.push({ content: csvContent, filename: 'events_data.csv' });
        }
      }

      if (exportType === 'all' || exportType === 'departments') {
        setProgress(80);
        const { data: departments, error } = await supabase
          .from('dep')
          .select('name, depinc, depphno, tmem');

        if (!error && departments) {
          const headers = ['Department Name', 'In-charge', 'Phone', 'Total Members'];
          const csvContent = [
            headers.join(','),
            ...departments.map(dept => [
              dept.name || '',
              dept.depinc || '',
              dept.depphno || '',
              dept.tmem || ''
            ].join(','))
          ].join('\n');
          
          exports.push({ content: csvContent, filename: 'departments_data.csv' });
        }
      }

      setProgress(100);
      
      for (let i = 0; i < exports.length; i++) {
        const { content, filename } = exports[i];
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        
        if (i < exports.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setNotification({ message: `Exported ${exports.length} file(s)`, type: 'success' });
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Export error:', error);
      setNotification({ message: 'Error exporting data', type: 'error' });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <h2 className="text-xl font-medium mb-4">Export All Data</h2>

      <div className="mb-4">
        <label className="block text-base font-medium text-gray-700 mb-2">
          Select Data to Export
        </label>
        <select
          value={exportType}
          onChange={(e) => setExportType(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-base"
        >
          <option value="all">📊 All Data (Complete Export)</option>
          <option value="users">👥 User Details Only</option>
          <option value="events">🎯 Event Details Only</option>
          <option value="departments">🏢 Department Details Only</option>
        </select>
      </div>

      {loading && (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-center mb-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm text-blue-800">Exporting data... {progress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-base text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={exportData}
          disabled={loading}
          className="px-4 py-2 text-base bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Exporting...
            </>
          ) : (
            <>📥 Export</>  
          )}
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useLanguage } from "./LanguageContext";
import NotificationPopup from "./NotificationPopup";

export default function AttendanceChecker() {
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [notification, setNotification] = useState(null);

  const searchUser = async () => {
    if (!phoneNumber.trim()) {
      setNotification({ message: 'Please enter a phone number', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone_number", phoneNumber.trim())
        .eq("status", "approved")
        .neq("name", "Event Creator")
        .neq("email", "admin@event.com");

      if (error) {
        console.error("Search error:", error);
        setNotification({ message: 'Error searching user', type: 'error' });
        return;
      }

      if (data && data.length > 0) {
        setSearchResult(data[0]);
      } else {
        setSearchResult(null);
        setNotification({ message: 'No approved user found', type: 'warning' });
      }
    } catch (err) {
      console.error("Search error:", err);
      setNotification({ message: 'Error searching user', type: 'error' });
    }
    setLoading(false);
  };

  const markInTime = async () => {
    if (!searchResult || !inTime) {
      setNotification({ message: 'Please enter in time', type: 'warning' });
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          attendance: 'present',
          ain: inTime
        })
        .eq("id", searchResult.id);

      if (error) {
        console.error("In time error:", error);
        setNotification({ message: 'Error marking in time', type: 'error' });
        return;
      }

      setNotification({ message: 'In time marked!', type: 'success' });
      setSearchResult({ ...searchResult, attendance: 'present', ain: inTime });
      setInTime("");
    } catch (err) {
      console.error("In time error:", err);
      setNotification({ message: 'Error marking in time', type: 'error' });
    }
  };

  const markOutTime = async () => {
    if (!searchResult || !outTime) {
      setNotification({ message: 'Please enter out time', type: 'warning' });
      return;
    }

    if (!searchResult.ain) {
      setNotification({ message: 'Please mark in time first', type: 'warning' });
      return;
    }

    try {
      const totalTime = calculateTotalTime(searchResult.ain, outTime);
      
      const { error } = await supabase
        .from("users")
        .update({ 
          aout: outTime,
          atotal: totalTime
        })
        .eq("id", searchResult.id);

      if (error) {
        console.error("Out time error:", error);
        setNotification({ message: 'Error: ' + error.message, type: 'error' });
        return;
      }

      setNotification({ message: 'Out time marked!', type: 'success' });
      setSearchResult({ ...searchResult, aout: outTime, atotal: totalTime });
      setOutTime("");
    } catch (err) {
      console.error("Out time error:", err);
      setNotification({ message: 'Error marking out time', type: 'error' });
    }
  };

  const calculateTotalTime = (inTime, outTime) => {
    if (!inTime || !outTime) return "0h 0m";
    
    const [inHour, inMin] = inTime.split(':').map(Number);
    const [outHour, outMin] = outTime.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    
    let totalMinutes = outMinutes - inMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle next day
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          {t('attendanceChecker')}
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('phoneNumber')}
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t('enterPhoneNumber')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && searchUser()}
            />
          </div>

          <button
            onClick={searchUser}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? t('searching') : t('searchUser')}
          </button>

          {searchResult && (
            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="text-lg font-bold mb-2">{t('userFound')}</h3>
              <p><b>{t('name')}:</b> {searchResult.name}</p>
              <p><b>{t('email')}:</b> {searchResult.email}</p>
              <p><b>{t('event')}:</b> {searchResult.event}</p>
              <p><b>{t('role')}:</b> {searchResult.role}</p>
              <p><b>{t('currentStatus')}:</b> 
                <span className={`ml-2 font-semibold ${
                  searchResult.attendance === 'present' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {searchResult.attendance === 'present' ? t('present') : t('notMarked')}
                </span>
              </p>
              <p><b>In Time:</b> {searchResult.ain || 'Not marked'}</p>
              <p><b>Out Time:</b> {searchResult.aout || 'Not marked'}</p>
              <p><b>Total Time:</b> {searchResult.atotal || '0h 0m'}</p>

              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    className="border p-2 rounded flex-1"
                    placeholder="In Time"
                  />
                  <button
                    onClick={markInTime}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Mark In
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    className="border p-2 rounded flex-1"
                    placeholder="Out Time"
                  />
                  <button
                    onClick={markOutTime}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    disabled={!searchResult.ain}
                  >
                    Mark Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
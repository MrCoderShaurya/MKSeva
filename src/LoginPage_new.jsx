import { useState } from 'react';
import { useAuth } from './AuthContext';
import Popup from './Popup';

export default function LoginPage({ onBack }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const success = login(password);
    
    if (success) {
      setPopup({ message: 'Login successful!', type: 'success' });
    } else {
      setPopup({ message: 'Invalid password', type: 'error' });
    }
    
    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-medium text-gray-900">Admin Login</h1>
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <strong>Note:</strong> Contact system administrator for login credentials.
          </div>
        </div>
      </div>
      
      {popup && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  );
}
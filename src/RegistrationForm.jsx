import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { useLanguage } from "./LanguageContext";
import NotificationPopup from "./NotificationPopup";

export default function RegistrationForm({ selectedEvent }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    emergency_number: "",
    address: "",
    gender: "",
    event: "",
    eventdate: "",
    a_date: "",
    d_date: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const formRef = useRef(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchLatestEvent();
  }, []);

  // If a `selectedEvent` prop is provided (from URL / external link), use it
  useEffect(() => {
    if (selectedEvent) {
      setLatestEvent({ name: selectedEvent });
      setForm(prev => ({ ...prev, event: selectedEvent }));

      // Scroll the form into view when opened via external link
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedEvent]);

  const fetchLatestEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("project")
        .select("name, date, discription, location, requirements")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const event = data[0];
        const eventNameToUse = selectedEvent || event.name;
        setLatestEvent({ 
          name: eventNameToUse, 
          date: event.date,
          discription: event.discription,
          location: event.location,
          requirements: event.requirements
        });
        setForm(prev => ({
          ...prev,
          event: eventNameToUse,
          eventdate: event.date
        }));
      }
    } catch (err) {
      console.error("Fetch latest event error:", err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // prevent duplicate phone numbers
    if (form.phone_number) {
      const { data: existing, error: lookupError } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', form.phone_number)
        .limit(1);

      if (lookupError) {
        console.error('Lookup error:', lookupError);
        setNotification({ message: 'Error checking phone number', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      if (existing && existing.length > 0) {
        setNotification({ message: 'Phone number already registered', type: 'warning' });
        setIsSubmitting(false);
        return;
      }
    }

    const userData = {
      name: form.name,
      email: form.email,
      phone_number: form.phone_number,
      emergency_number: form.emergency_number,
      address: form.address,
      gender: form.gender,
      event: form.event,
      eventdate: form.eventdate,
      status: "pending",
      a_date: form.a_date,
      d_date: form.d_date
    };

    const { error } = await supabase
      .from("users")
      .insert([userData]);

    if (error) {
      console.error("Supabase Error:", error.message);
      setNotification({ message: 'Error: ' + error.message, type: 'error' });
    } else {
      setNotification({ message: t('registrationSuccessful'), type: 'success' });

      setForm({
        name: "",
        email: "",
        phone_number: "",
        emergency_number: "",
        address: "",
        gender: "",
        event: latestEvent ? latestEvent.name : "",
        eventdate: latestEvent ? latestEvent.date : "",
        a_date: "",
        d_date: ""
      });
    }

    setIsSubmitting(false);
  };

  return (
    <>
      {notification && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto"
      >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {t('userRegistration')}
      </h2>

      {/* Current Event Display */}
      {latestEvent && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-semibold text-blue-900 mb-1">Registering for:</h3>
              <p className="text-blue-800 font-medium">
                <strong>{latestEvent.name}</strong>
                {latestEvent.date && ` - ${new Date(latestEvent.date).toLocaleDateString()}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEventDetails(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          name="name"
          placeholder={t('fullName')}
          value={form.name}
          onChange={handleChange}
          required
          className="input"
        />

        <input
          name="email"
          type="email"
          placeholder={t('email')}
          value={form.email}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      {/* Gender */}
      <div className="mb-4">
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="input w-full"
        >
          <option value="">{t('selectGender')}</option>
          <option>{t('prabhuji')}</option>
          <option>{t('mataji')}</option>
          <option>{t('other')}</option>
        </select>
      </div>

      {/* Phone & Emergency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          name="phone_number"
          placeholder={t('phoneNumber')}
          value={form.phone_number}
          onChange={handleChange}
          className="input"
        />

        <input
          name="emergency_number"
          placeholder={t('emergencyContact')}
          value={form.emergency_number}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* Address */}
      <textarea
        name="address"
        placeholder={t('address')}
        value={form.address}
        onChange={handleChange}
        className="input mb-4"
      />

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('arrivalDate')}</label>
          <input
            type="date"
            name="a_date"
            value={form.a_date}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('departureDate')}</label>
          <input
            type="date"
            name="d_date"
            value={form.d_date}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition disabled:opacity-50 font-medium"
      >
        {isSubmitting ? t('submitting') : t('submitRegistration')}
      </button>
    </form>

    {/* Event Details Modal */}
    {showEventDetails && latestEvent && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded p-6 w-96 max-w-[90vw]">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
            <button
              onClick={() => setShowEventDetails(false)}
              className="text-gray-600 hover:text-gray-900 text-xl font-medium"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Event Name</label>
              <p className="text-base text-gray-900">{latestEvent.name}</p>
            </div>
            
            {latestEvent.date && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Date</label>
                <p className="text-base text-gray-900">{new Date(latestEvent.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            )}
            
            {latestEvent.location && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                <p className="text-base text-gray-900">{latestEvent.location}</p>
              </div>
            )}
            
            {latestEvent.discription && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <p className="text-base text-gray-900">{latestEvent.discription}</p>
              </div>
            )}
            
            {latestEvent.requirements && (
              <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Requirements</label>
                <p className="text-sm text-yellow-900 whitespace-pre-line">{latestEvent.requirements}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowEventDetails(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
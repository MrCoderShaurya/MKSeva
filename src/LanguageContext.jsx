import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    // Main Page
    eventManagementSystem: "Event Management System",
    createEvent: "Create Event",
    eventManagement: "Event Management",
    userRegistration: "User Registration",
    attendanceChecker: "Attendance Checker",
    adminPanel: "Admin Panel",
    createNewEvent: "Create New Event",
    manageEvents: "Manage Events",
    registerNow: "Register Now",
    checkAttendance: "Check Attendance",
    adminAccess: "Admin Access",
    backToHome: "← Back to Home",
    
    // Registration Form
    fullName: "Full Name",
    email: "Email",
    selectEvent: "Select Event",
    chooseEvent: "Choose an event",
    selectRegistrationType: "Select Registration Type",
    volunteer: "Volunteer",
    paidVolunteer: "Paid - Volunteer",
    bramachari: "Bramachari",
    selectGender: "Select Gender",
    prabhuji: "Prabhuji",
    mataji: "Mataji",
    other: "Other",
    phoneNumber: "Phone Number",
    emergencyContact: "Emergency Contact",
    address: "Address",
    submitRegistration: "Submit Registration",
    submitting: "Submitting...",
    registrationSuccessful: "✅ Registration successful!",
    
    // Attendance Checker
    enterPhoneNumber: "Enter phone number",
    searchUser: "Search User",
    searching: "Searching...",
    userFound: "User Found",
    name: "Name",
    event: "Event",
    role: "Role",
    currentStatus: "Current Status",
    present: "Present",
    notMarked: "Not marked",
    markPresent: "Mark Present",
    
    // Admin Panel
    registrationManagement: "Registration Management",
    attendanceManagement: "Attendance Management",
    registrations: "Registrations",
    attendance: "Attendance",
    status: "Status",
    approved: "approved",
    pending: "pending",
    rejected: "rejected",
    edit: "Edit",
    approve: "Approve",
    reject: "Reject",
    loadAttendance: "Load Attendance",
    total: "Total",
    
    // Common
    cancel: "Cancel",
    confirm: "Confirm",
    update: "Update",
    department: "Department",
    slotAssignment: "Slot Assignment",
    slotName: "Slot Name",
    startTime: "Start Time",
    endTime: "End Time",
    financialDetails: "Financial Details",
    totalAmount: "Total Amount",
    
    // Admin Panel Extended
    generatePDF: "Generate PDF",
    userDetails: "User Details",
    personalInformation: "Personal Information",
    eventAssignmentDetails: "Event & Assignment Details",
    statusInformation: "Status Information",
    registrationStatus: "Registration Status",
    registrationType: "Registration Type",
    emergencyNumber: "Emergency Contact",
    phoneNumber: "Phone Number",
    notProvided: "Not provided",
    notAssigned: "Not assigned",
    notSpecified: "Not specified",
    arrivalDate: "Arrival Date",
    departureDate: "Departure Date",
    extraAmount: "Extra Amount",
    travellingAmount: "Travelling Amount",
    salaryAmount: "Salary Amount",
    pettyCash: "Petty Cash",
    generatedOn: "Generated on",
    
    // Department Management
    departmentManagement: "Department Management",
    manageDepartments: "Manage Departments",
    addNewDepartment: "Add New Department",
    departmentName: "Department Name",
    inCharge: "In-charge",
    phone: "Phone",
    totalMembers: "Total Members",
    viewDetails: "View Details",
    departmentInformation: "Department Information",
    departmentMembers: "Department Members",
    noMembersAssigned: "No members assigned to this department yet",
    noDepartmentsFound: "No departments found. Add a new department to get started",
    close: "Close",
    addDepartment: "Add Department",
    selectDepartment: "Select Department",
    
    // Additional translations
    eventRegistration: "Event Registration",
    attendanceFor: "Attendance for",
    notMarked: "Not Marked",
    editUserDetails: "Edit User Details",
    approveRegistration: "Approve Registration",
    rejectRegistration: "Reject Registration",
    reasonForRejection: "Reason for rejection",
    selectRegistrationType: "Select Registration Type",
    eventDate: "Event Date",
    gender: "Gender",
    address: "Address",
    eventCreator: "Event Creator",
    adminEmail: "admin@event.com",
    manageEvent: "Manage Event"
  },
  hi: {
    // Main Page
    eventManagementSystem: "कार्यक्रम प्रबंधन प्रणाली",
    createEvent: "कार्यक्रम बनाएं",
    eventManagement: "कार्यक्रम प्रबंधन",
    userRegistration: "उपयोगकर्ता पंजीकरण",
    attendanceChecker: "उपस्थिति जांचकर्ता",
    adminPanel: "प्रशासक पैनल",
    createNewEvent: "नया कार्यक्रम बनाएं",
    manageEvents: "कार्यक्रम प्रबंधित करें",
    registerNow: "अभी पंजीकरण करें",
    checkAttendance: "उपस्थिति जांचें",
    adminAccess: "प्रशासक पहुंच",
    backToHome: "← होम पर वापस",
    
    // Registration Form
    fullName: "पूरा नाम",
    email: "ईमेल",
    selectEvent: "कार्यक्रम चुनें",
    chooseEvent: "एक कार्यक्रम चुनें",
    selectRegistrationType: "पंजीकरण प्रकार चुनें",
    volunteer: "स्वयंसेवक",
    paidVolunteer: "वेतनभोगी - स्वयंसेवक",
    bramachari: "ब्रह्मचारी",
    selectGender: "लिंग चुनें",
    prabhuji: "प्रभुजी",
    mataji: "माताजी",
    other: "अन्य",
    phoneNumber: "फोन नंबर",
    emergencyContact: "आपातकालीन संपर्क",
    address: "पता",
    submitRegistration: "पंजीकरण जमा करें",
    submitting: "जमा कर रहे हैं...",
    registrationSuccessful: "✅ पंजीकरण सफल!",
    
    // Attendance Checker
    enterPhoneNumber: "फोन नंबर दर्ज करें",
    searchUser: "उपयोगकर्ता खोजें",
    searching: "खोज रहे हैं...",
    userFound: "उपयोगकर्ता मिला",
    name: "नाम",
    event: "कार्यक्रम",
    role: "भूमिका",
    currentStatus: "वर्तमान स्थिति",
    present: "उपस्थित",
    notMarked: "चिह्नित नहीं",
    markPresent: "उपस्थित चिह्नित करें",
    
    // Admin Panel
    registrationManagement: "पंजीकरण प्रबंधन",
    attendanceManagement: "उपस्थिति प्रबंधन",
    registrations: "पंजीकरण",
    attendance: "उपस्थिति",
    status: "स्थिति",
    approved: "स्वीकृत",
    pending: "लंबित",
    rejected: "अस्वीकृत",
    edit: "संपादित करें",
    approve: "स्वीकृत करें",
    reject: "अस्वीकार करें",
    loadAttendance: "उपस्थिति लोड करें",
    total: "कुल",
    
    // Common
    cancel: "रद्द करें",
    confirm: "पुष्टि करें",
    update: "अपडेट करें",
    department: "विभाग",
    slotAssignment: "स्लॉट असाइनमेंट",
    slotName: "स्लॉट नाम",
    startTime: "शुरुआत का समय",
    endTime: "समाप्ति का समय",
    financialDetails: "वित्तीय विवरण",
    totalAmount: "कुल राशि",
    
    // Admin Panel Extended
    generatePDF: "पीडीएफ जेनरेट करें",
    userDetails: "उपयोगकर्ता विवरण",
    personalInformation: "व्यक्तिगत जानकारी",
    eventAssignmentDetails: "कार्यक्रम और असाइनमेंट विवरण",
    statusInformation: "स्थिति जानकारी",
    registrationStatus: "पंजीकरण स्थिति",
    registrationType: "पंजीकरण प्रकार",
    emergencyNumber: "आपातकालीन संपर्क",
    phoneNumber: "फोन नंबर",
    notProvided: "प्रदान नहीं किया गया",
    notAssigned: "असाइन नहीं किया गया",
    notSpecified: "निर्दिष्ट नहीं",
    arrivalDate: "आगमन तिथि",
    departureDate: "प्रस्थान तिथि",
    extraAmount: "अतिरिक्त राशि",
    travellingAmount: "यात्रा राशि",
    salaryAmount: "वेतन राशि",
    pettyCash: "पेटी कैश",
    generatedOn: "जेनरेट किया गया",
    
    // Department Management
    departmentManagement: "विभाग प्रबंधन",
    manageDepartments: "विभाग प्रबंधित करें",
    addNewDepartment: "नया विभाग जोड़ें",
    departmentName: "विभाग का नाम",
    inCharge: "प्रभारी",
    phone: "फोन",
    totalMembers: "कुल सदस्य",
    viewDetails: "विवरण देखें",
    departmentInformation: "विभाग की जानकारी",
    departmentMembers: "विभाग के सदस्य",
    noMembersAssigned: "इस विभाग में अभी तक कोई सदस्य असाइन नहीं किया गया है",
    noDepartmentsFound: "कोई विभाग नहीं मिला। शुरुआत करने के लिए एक नया विभाग जोड़ें",
    close: "बंद करें",
    addDepartment: "विभाग जोड़ें",
    selectDepartment: "विभाग चुनें",
    
    // Additional translations
    eventRegistration: "कार्यक्रम पंजीकरण",
    attendanceFor: "उपस्थिति के लिए",
    notMarked: "चिह्नित नहीं",
    editUserDetails: "उपयोगकर्ता विवरण संपादित करें",
    approveRegistration: "पंजीकरण स्वीकृत करें",
    rejectRegistration: "पंजीकरण अस्वीकार करें",
    reasonForRejection: "अस्वीकार करने का कारण",
    selectRegistrationType: "पंजीकरण प्रकार चुनें",
    eventDate: "कार्यक्रम तिथि",
    gender: "लिंग",
    address: "पता",
    eventCreator: "कार्यक्रम निर्माता",
    adminEmail: "admin@event.com",
    manageEvent: "कार्यक्रम प्रबंधित करें"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => translations[language][key] || key;

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
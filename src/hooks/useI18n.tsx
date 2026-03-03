import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'ta';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.patients': 'Patients',
    'nav.appointments': 'Appointments',
    'nav.emergency': 'Emergency',
    'nav.records': 'Records',
    'nav.prescriptions': 'Prescriptions',
    'nav.analytics': 'Analytics',
    'nav.reports': 'Reports',
    'nav.devices': 'Devices',
    'nav.settings': 'Settings',
    'nav.branches': 'Branches',
    'nav.templates': 'Templates',
    'nav.staff': 'Staff',
    'nav.departments': 'Departments',
    'nav.doctors_staff': 'Doctors & Staff',
    'nav.menu': 'Menu',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.no_data': 'No data available',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.view': 'View',
    'common.actions': 'Actions',

    // Auth
    'auth.sign_in': 'Sign In',
    'auth.sign_up': 'Sign Up',
    'auth.sign_out': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgot_password': 'Forgot Password?',
    'auth.reset_password': 'Reset Password',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.total_patients': 'Total Patients',
    'dashboard.todays_appointments': "Today's Appointments",
    'dashboard.pending_reports': 'Pending Reports',
    'dashboard.active_prescriptions': 'Active Prescriptions',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account and preferences',
    'settings.profile': 'Profile',
    'settings.security': 'Security',
    'settings.notifications': 'Notifications',
    'settings.organization': 'Organization',
    'settings.profile_info': 'Profile Information',
    'settings.change_password': 'Change Password',
    'settings.save_changes': 'Save Changes',
    'settings.language': 'Language',

    // Patient
    'patient.name': 'Patient Name',
    'patient.age': 'Age',
    'patient.gender': 'Gender',
    'patient.blood_group': 'Blood Group',
    'patient.phone': 'Phone',
    'patient.add_new': 'Add New Patient',

    // Appointments
    'appointment.schedule': 'Schedule Appointment',
    'appointment.scheduled': 'Scheduled',
    'appointment.completed': 'Completed',
    'appointment.cancelled': 'Cancelled',
    'appointment.in_progress': 'In Progress',

    // Accessibility
    'a11y.skip_to_content': 'Skip to main content',
    'a11y.main_navigation': 'Main navigation',
    'a11y.search_patients': 'Search patients',
    'a11y.notifications': 'Notifications',
    'a11y.toggle_theme': 'Toggle theme',
    'a11y.toggle_sidebar': 'Toggle sidebar',
    'a11y.open_menu': 'Open menu',
    'a11y.close_menu': 'Close menu',
  },
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.patients': 'मरीज़',
    'nav.appointments': 'अपॉइंटमेंट',
    'nav.emergency': 'आपातकाल',
    'nav.records': 'रिकॉर्ड्स',
    'nav.prescriptions': 'प्रिस्क्रिप्शन',
    'nav.analytics': 'एनालिटिक्स',
    'nav.reports': 'रिपोर्ट',
    'nav.devices': 'उपकरण',
    'nav.settings': 'सेटिंग्स',
    'nav.branches': 'शाखाएँ',
    'nav.templates': 'टेम्पलेट्स',
    'nav.staff': 'स्टाफ़',
    'nav.departments': 'विभाग',
    'nav.doctors_staff': 'डॉक्टर और स्टाफ़',
    'nav.menu': 'मेनू',

    // Common
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.search': 'खोजें',
    'common.loading': 'लोड हो रहा है...',
    'common.no_data': 'कोई डेटा उपलब्ध नहीं',
    'common.confirm': 'पुष्टि करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.submit': 'जमा करें',
    'common.close': 'बंद करें',
    'common.view': 'देखें',
    'common.actions': 'क्रियाएँ',

    // Auth
    'auth.sign_in': 'साइन इन',
    'auth.sign_up': 'साइन अप',
    'auth.sign_out': 'साइन आउट',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.forgot_password': 'पासवर्ड भूल गए?',
    'auth.reset_password': 'पासवर्ड रीसेट करें',

    // Dashboard
    'dashboard.welcome': 'वापस स्वागत है',
    'dashboard.total_patients': 'कुल मरीज़',
    'dashboard.todays_appointments': 'आज की अपॉइंटमेंट',
    'dashboard.pending_reports': 'लंबित रिपोर्ट',
    'dashboard.active_prescriptions': 'सक्रिय प्रिस्क्रिप्शन',

    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.subtitle': 'अपना खाता और प्राथमिकताएँ प्रबंधित करें',
    'settings.profile': 'प्रोफ़ाइल',
    'settings.security': 'सुरक्षा',
    'settings.notifications': 'सूचनाएँ',
    'settings.organization': 'संगठन',
    'settings.profile_info': 'प्रोफ़ाइल जानकारी',
    'settings.change_password': 'पासवर्ड बदलें',
    'settings.save_changes': 'परिवर्तन सहेजें',
    'settings.language': 'भाषा',

    // Patient
    'patient.name': 'मरीज़ का नाम',
    'patient.age': 'आयु',
    'patient.gender': 'लिंग',
    'patient.blood_group': 'रक्त समूह',
    'patient.phone': 'फ़ोन',
    'patient.add_new': 'नया मरीज़ जोड़ें',

    // Appointments
    'appointment.schedule': 'अपॉइंटमेंट बुक करें',
    'appointment.scheduled': 'निर्धारित',
    'appointment.completed': 'पूर्ण',
    'appointment.cancelled': 'रद्द',
    'appointment.in_progress': 'प्रगति में',

    // Accessibility
    'a11y.skip_to_content': 'मुख्य सामग्री पर जाएं',
    'a11y.main_navigation': 'मुख्य नेविगेशन',
    'a11y.search_patients': 'मरीज़ खोजें',
    'a11y.notifications': 'सूचनाएँ',
    'a11y.toggle_theme': 'थीम बदलें',
    'a11y.toggle_sidebar': 'साइडबार टॉगल करें',
    'a11y.open_menu': 'मेनू खोलें',
    'a11y.close_menu': 'मेनू बंद करें',
  },
  ta: {
    // Navigation
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.patients': 'நோயாளிகள்',
    'nav.appointments': 'சந்திப்புகள்',
    'nav.emergency': 'அவசரநிலை',
    'nav.records': 'பதிவுகள்',
    'nav.prescriptions': 'மருந்து சீட்டுகள்',
    'nav.analytics': 'பகுப்பாய்வு',
    'nav.reports': 'அறிக்கைகள்',
    'nav.devices': 'சாதனங்கள்',
    'nav.settings': 'அமைப்புகள்',
    'nav.branches': 'கிளைகள்',
    'nav.templates': 'வார்ப்புருக்கள்',
    'nav.staff': 'ஊழியர்கள்',
    'nav.departments': 'துறைகள்',
    'nav.doctors_staff': 'மருத்துவர்கள் & ஊழியர்கள்',
    'nav.menu': 'பட்டியல்',

    // Common
    'common.save': 'சேமி',
    'common.cancel': 'ரத்து',
    'common.delete': 'நீக்கு',
    'common.edit': 'திருத்து',
    'common.search': 'தேடு',
    'common.loading': 'ஏற்றுகிறது...',
    'common.no_data': 'தரவு இல்லை',
    'common.confirm': 'உறுதிப்படுத்து',
    'common.back': 'பின்னால்',
    'common.next': 'அடுத்து',
    'common.submit': 'சமர்ப்பி',
    'common.close': 'மூடு',
    'common.view': 'பார்',
    'common.actions': 'செயல்கள்',

    // Auth
    'auth.sign_in': 'உள்நுழைக',
    'auth.sign_up': 'பதிவு செய்க',
    'auth.sign_out': 'வெளியேறு',
    'auth.email': 'மின்னஞ்சல்',
    'auth.password': 'கடவுச்சொல்',
    'auth.forgot_password': 'கடவுச்சொல் மறந்துவிட்டதா?',
    'auth.reset_password': 'கடவுச்சொல் மீட்டமை',

    // Dashboard
    'dashboard.welcome': 'மீண்டும் வருக',
    'dashboard.total_patients': 'மொத்த நோயாளிகள்',
    'dashboard.todays_appointments': 'இன்றைய சந்திப்புகள்',
    'dashboard.pending_reports': 'நிலுவை அறிக்கைகள்',
    'dashboard.active_prescriptions': 'செயலில் உள்ள மருந்து சீட்டுகள்',

    // Settings
    'settings.title': 'அமைப்புகள்',
    'settings.subtitle': 'உங்கள் கணக்கு மற்றும் விருப்பங்களை நிர்வகிக்கவும்',
    'settings.profile': 'சுயவிவரம்',
    'settings.security': 'பாதுகாப்பு',
    'settings.notifications': 'அறிவிப்புகள்',
    'settings.organization': 'நிறுவனம்',
    'settings.profile_info': 'சுயவிவர தகவல்',
    'settings.change_password': 'கடவுச்சொல் மாற்று',
    'settings.save_changes': 'மாற்றங்களை சேமி',
    'settings.language': 'மொழி',

    // Patient
    'patient.name': 'நோயாளி பெயர்',
    'patient.age': 'வயது',
    'patient.gender': 'பாலினம்',
    'patient.blood_group': 'இரத்தக் குழு',
    'patient.phone': 'தொலைபேசி',
    'patient.add_new': 'புதிய நோயாளி சேர்',

    // Appointments
    'appointment.schedule': 'சந்திப்பு திட்டமிடு',
    'appointment.scheduled': 'திட்டமிடப்பட்டது',
    'appointment.completed': 'நிறைவடைந்தது',
    'appointment.cancelled': 'ரத்து செய்யப்பட்டது',
    'appointment.in_progress': 'நடப்பில் உள்ளது',

    // Accessibility
    'a11y.skip_to_content': 'முதன்மை உள்ளடக்கத்திற்கு செல்',
    'a11y.main_navigation': 'முதன்மை வழிசெலுத்தல்',
    'a11y.search_patients': 'நோயாளிகளை தேடு',
    'a11y.notifications': 'அறிவிப்புகள்',
    'a11y.toggle_theme': 'தீம் மாற்று',
    'a11y.toggle_sidebar': 'பக்கப்பட்டி மாற்று',
    'a11y.open_menu': 'பட்டியல் திற',
    'a11y.close_menu': 'பட்டியல் மூடு',
  },
};

const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: typeof languageNames;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('caretag-language');
    return (stored as Language) || 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('caretag-language', lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: languageNames }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}

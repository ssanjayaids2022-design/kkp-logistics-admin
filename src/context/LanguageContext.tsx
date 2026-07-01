import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta';

// ─── Translation Dictionary ─────────────────────────────────────────────────

const translations = {
  // Sidebar & Navigation
  'nav.dashboard': { en: 'Dashboard', ta: 'டாஷ்போர்டு' },
  'nav.loads': { en: 'Loads', ta: 'சுமைகள்' },
  'nav.postLoad': { en: 'Post Load', ta: 'சுமை பதிவு' },
  'nav.bids': { en: 'Bids', ta: 'ஏலங்கள்' },
  'nav.drivers': { en: 'Drivers', ta: 'ஓட்டுநர்கள்' },
  'nav.payments': { en: 'Payments', ta: 'கொடுப்பனவுகள்' },
  'nav.home': { en: 'Home', ta: 'முகப்பு' },
  'nav.auditLogs': { en: 'Audit Logs', ta: 'ஆடிட் பதிவுகள்' },
  'nav.adminUsers': { en: 'Admin Directory', ta: 'அட்மின் அடைவு' },
  'nav.accessMatrix': { en: 'Access Matrix', ta: 'அணுகல் மேட்ரிக்ஸ்' },
  'nav.systemAdmin': { en: 'Administration', ta: 'நிர்வாகம்' },

  // Sidebar branding
  'brand.tagline': { en: 'Safe and Fast', ta: 'பாதுகாப்பு மற்றும் வேகம்' },

  // Header
  'header.search': { en: 'Search logistics network...', ta: 'லாஜிஸ்டிக்ஸ் நெட்வொர்க் தேடுக...' },
  'header.profile': { en: 'Profile', ta: 'சுயவிவரம்' },
  'header.settings': { en: 'Settings', ta: 'அமைப்புகள்' },
  'header.logout': { en: 'Logout', ta: 'வெளியேறு' },

  // Profile Page
  'profile.subtitle': { en: 'Manage your personal information and account details', ta: 'உங்கள் தனிப்பட்ட தகவல் மற்றும் கணக்கு விவரங்களை நிர்வகிக்கவும்' },
  'profile.edit': { en: 'Edit Profile', ta: 'சுயவிவரத்தைத் திருத்து' },
  'profile.persInfo': { en: 'Personal Information', ta: 'தனிப்பட்ட தகவல்' },
  'profile.email': { en: 'Email', ta: 'மின்னஞ்சல்' },
  'profile.phone': { en: 'Phone', ta: 'தொலைபேசி' },
  'profile.role': { en: 'Role', ta: 'பங்கு' },
  'profile.accStatus': { en: 'Account Status', ta: 'கணக்கு நிலை' },
  'profile.active': { en: 'Active', ta: 'செயலில்' },

  // Settings Page
  'settings.subtitle': { en: 'Configure your application preferences', ta: 'உங்கள் பயன்பாட்டு விருப்பங்களை உள்ளமைக்கவும்' },
  'settings.language': { en: 'Language', ta: 'மொழி' },
  'settings.languageDesc': { en: 'Choose your preferred language for the dashboard', ta: 'டாஷ்போர்டுக்கான உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்' },
  'settings.pushNotifications': { en: 'Push Notifications', ta: 'புஷ் அறிவிப்புகள்' },
  'settings.pushNotificationsDesc': { en: 'Receive alerts for new bids and load updates', ta: 'புதிய ஏலங்கள் மற்றும் சுமை புதுப்பிப்புகளுக்கான விழிப்பூட்டல்களைப் பெறவும்' },
  'settings.darkMode': { en: 'Dark Mode', ta: 'டார்க் மோட்' },
  'settings.darkModeDesc': { en: 'Switch between light and dark themes (Coming soon)', ta: 'லைட் மற்றும் டார்க் மோடுகளுக்கு இடையே மாறுக (விரைவில்)' },
  'settings.security': { en: 'Security', ta: 'பாதுகாப்பு' },
  'settings.password': { en: 'Password', ta: 'கடவுச்சொல்' },
  'settings.passwordDesc': { en: 'Update your account password', ta: 'உங்கள் கணக்கு கடவுச்சொல்லைப் புதுப்பிக்கவும்' },
  'settings.changePassword': { en: 'Change Password', ta: 'கடவுச்சொல்லை மாற்று' },

  // Dashboard
  'dashboard.title': { en: 'Operational Dashboard', ta: 'செயல்பாட்டு டாஷ்போர்டு' },
  'dashboard.subtitle': { en: 'Real-time logistics performance and asset tracking', ta: 'நிகழ்நேர லாஜிஸ்டிக்ஸ் செயல்திறன் மற்றும் சொத்து கண்காணிப்பு' },
  'dashboard.createLoad': { en: 'Create New Load', ta: 'புதிய சுமை உருவாக்கு' },
  'dashboard.totalLoads': { en: 'Total Loads', ta: 'மொத்த சுமைகள்' },
  'dashboard.activeTrips': { en: 'Active Trips', ta: 'செயலில் உள்ள பயணங்கள்' },
  'dashboard.availableTrucks': { en: 'Available Trucks', ta: 'கிடைக்கும் டிரக்குகள்' },
  'dashboard.revenue': { en: 'Revenue (MTD)', ta: 'வருவாய் (MTD)' },
  'dashboard.monthlyRevenue': { en: 'Monthly Revenue', ta: 'மாதாந்திர வருவாய்' },
  'dashboard.loadVolume': { en: 'Load Volume (This Week)', ta: 'சுமை அளவு (இந்த வாரம்)' },
  'dashboard.recentActivity': { en: 'Recent Activity', ta: 'சமீபத்திய செயல்பாடு' },
  'dashboard.viewAll': { en: 'View All', ta: 'அனைத்தையும் காண' },
  'dashboard.postLoad': { en: 'Post Load', ta: 'சுமை பதிவு' },
  'dashboard.pendingBids': { en: 'Pending Bids', ta: 'நிலுவை ஏலங்கள்' },
  'dashboard.approveDrivers': { en: 'Approve Drivers', ta: 'ஓட்டுநர்களை ஒப்புதல்' },

  // Analytics
  'analytics.load': { en: 'Load Analytics', ta: 'சுமை பகுப்பாய்வு' },
  'analytics.predictive': { en: 'Predictive Analytics', ta: 'முன்கணிப்பு பகுப்பாய்வு' },
  'analytics.financial': { en: 'Financial Analytics', ta: 'நிதிப் பகுப்பாய்வு' },
  'analytics.drivers': { en: 'Driver Analytics', ta: 'ஓட்டுநர் பகுப்பாய்வு' },
  'analytics.trips': { en: 'Trip & POD Analytics', ta: 'பயணம் மற்றும் POD பகுப்பாய்வு' },
  'analytics.payments-analytics': { en: 'Payment Analytics', ta: 'கொடுப்பனவு பகுப்பாய்வு' },
  'analytics.operations': { en: 'Operational Efficiency', ta: 'செயல்பாட்டு திறன்' },
  'analytics.routes': { en: 'Route & Geography', ta: 'பாதை & புவியியல்' },

  // Load Management
  'loads.title': { en: 'Load Management', ta: 'சுமை மேலாண்மை' },
  'loads.searchPlaceholder': { en: 'Search loads...', ta: 'சுமைகள் தேடுக...' },
  'loads.postNew': { en: 'Post New Load', ta: 'புதிய சுமை பதிவு' },
  'loads.totalLoads': { en: 'total loads', ta: 'மொத்த சுமைகள்' },
  'loads.active': { en: 'active', ta: 'செயலில்' },
  'loads.summary': { en: '{total} total loads — {active} active', ta: 'மொத்த சுமைகள்: {total} — செயலில்: {active}' },
  'loads.loadId': { en: 'Load ID', ta: 'சுமை எண்' },
  'loads.route': { en: 'Route', ta: 'வழி' },
  'loads.vehicle': { en: 'Vehicle', ta: 'வாகனம்' },
  'loads.weight': { en: 'Weight', ta: 'எடை' },
  'loads.status': { en: 'Status', ta: 'நிலை' },
  'loads.bids': { en: 'Bids', ta: 'ஏலங்கள்' },
  'loads.budget': { en: 'Budget', ta: 'பட்ஜெட்' },
  'loads.date': { en: 'Date', ta: 'தேதி' },
  'loads.viewBids': { en: 'View Bids', ta: 'ஏலங்களை காண' },
  'loads.editLoad': { en: 'Edit Load', ta: 'சுமை திருத்து' },
  'loads.cancelLoad': { en: 'Cancel Load', ta: 'சுமை ரத்து' },

  // Load Posting Form
  'postLoad.title': { en: 'Post New Load', ta: 'புதிய சுமை பதிவு' },
  'postLoad.subtitle': { en: 'Fill in the shipment details to publish a new load for bidding', ta: 'ஏலத்திற்கான புதிய சுமையை வெளியிட விவரங்களை நிரப்பவும்' },
  'postLoad.source': { en: 'Source Location', ta: 'புறப்படும் இடம்' },
  'postLoad.destination': { en: 'Destination', ta: 'சேரும் இடம்' },
  'postLoad.pickupDate': { en: 'Pickup Date', ta: 'பிக்கப் தேதி' },
  'postLoad.vehicleType': { en: 'Vehicle Type', ta: 'வாகன வகை' },
  'postLoad.weight': { en: 'Weight (ton)', ta: 'எடை (டன்)' },
  'postLoad.budget': { en: 'Budget (₹)', ta: 'பட்ஜெட் (₹)' },
  'postLoad.notes': { en: 'Additional Notes', ta: 'கூடுதல் குறிப்புகள்' },
  'postLoad.submit': { en: 'Post Load for Bidding', ta: 'ஏலத்திற்கு சுமை பதிவு செய்' },
  'postLoad.selectSource': { en: 'Select pickup city', ta: 'பிக்கப் நகரை தேர்வுசெய்க' },
  'postLoad.selectDest': { en: 'Select delivery city', ta: 'டெலிவரி நகரை தேர்வுசெய்க' },
  'postLoad.selectVehicle': { en: 'Select vehicle type', ta: 'வாகன வகையை தேர்வுசெய்க' },

  // Bids
  'bids.title': { en: 'Bid Comparison', ta: 'ஏல ஒப்பீடு' },
  'bids.comparing': { en: 'Comparing', ta: 'ஒப்பிடுகிறது' },
  'bids.bidsFor': { en: 'bids for load', ta: 'சுமைக்கான ஏலங்கள்' },
  'bids.comparingFor': { en: 'Comparing {count} bids for load {loadId}', ta: 'சுமை {loadId}-க்கான {count} ஏலங்களை ஒப்பிடுகிறது' },
  'bids.bestPrice': { en: 'Best Price', ta: 'சிறந்த விலை' },
  'bids.bidPrice': { en: 'Bid Price', ta: 'ஏல விலை' },
  'bids.assign': { en: 'Assign', ta: 'ஒதுக்கு' },
  'bids.reject': { en: 'Reject', ta: 'நிராகரி' },
  'bids.sortLowest': { en: 'Sort: Lowest Price', ta: 'வரிசை: குறைந்த விலை' },
  'bids.sortRating': { en: 'Sort: Highest Rating', ta: 'வரிசை: அதிக மதிப்பீடு' },
  'bids.confirmTitle': { en: 'Confirm Driver Assignment', ta: 'ஓட்டுநர் ஒதுக்கீட்டை உறுதிப்படுத்து' },
  'bids.confirmBtn': { en: 'Confirm Assignment', ta: 'ஒதுக்கீட்டை உறுதிசெய்' },
  'bids.trips': { en: 'completed', ta: 'முடிந்தது' },

  // Drivers
  'drivers.title': { en: 'Driver Approval', ta: 'ஓட்டுநர் ஒப்புதல்' },
  'drivers.pending': { en: 'drivers pending review', ta: 'ஓட்டுநர்கள் மதிப்பாய்வு நிலுவையில்' },
  'drivers.summary': { en: '{count} drivers pending review', ta: '{count} ஓட்டுநர்கள் மதிப்பாய்வு நிலுவையில் உள்ளனர்' },
  'drivers.searchPlaceholder': { en: 'Search drivers...', ta: 'ஓட்டுநர்களைத் தேடுக...' },
  'drivers.approve': { en: 'Approve', ta: 'ஒப்புதல்' },
  'drivers.documents': { en: 'Documents', ta: 'ஆவணங்கள்' },
  'drivers.trips': { en: 'Trips', ta: 'பயணங்கள்' },
  'drivers.details': { en: 'Details', ta: 'விவரங்கள்' },

  // Payments
  'payments.title': { en: 'Payment Management', ta: 'கொடுப்பனவு மேலாண்மை' },
  'payments.totalTracked': { en: 'total payments tracked', ta: 'மொத்த கொடுப்பனவுகள் கண்காணிக்கப்பட்டது' },
  'payments.summary': { en: '{count} total payments tracked', ta: 'மொத்தம் {count} கொடுப்பனவுகள் கண்காணிக்கப்பட்டுள்ளன' },
  'payments.exportExcel': { en: 'Export Excel', ta: 'எக்சல் ஏற்றுமதி' },
  'payments.searchPlaceholder': { en: 'Search payments...', ta: 'கொடுப்பனவுகளை தேடுக...' },
  'payments.totalPaid': { en: 'Total Paid', ta: 'மொத்த செலுத்தியது' },
  'payments.pendingAmount': { en: 'Pending', ta: 'நிலுவை' },
  'payments.overdue': { en: 'Overdue', ta: 'தாமதமானது' },
  'payments.loadId': { en: 'Load ID', ta: 'சுமை எண்' },
  'payments.driver': { en: 'Driver', ta: 'ஓட்டுநர்' },
  'payments.amount': { en: 'Amount', ta: 'தொகை' },
  'payments.dueDate': { en: 'Due Date', ta: 'நிலுவை தேதி' },
  'payments.method': { en: 'Method', ta: 'முறை' },
  'payments.pay': { en: 'Pay', ta: 'செலுத்து' },

  // Status labels
  'status.pending': { en: 'Pending', ta: 'நிலுவையில்' },
  'status.active': { en: 'Active', ta: 'செயலில்' },
  'status.inTransit': { en: 'In Transit', ta: 'போக்குவரத்தில்' },
  'status.delivered': { en: 'Delivered', ta: 'வழங்கப்பட்டது' },
  'status.completed': { en: 'Completed', ta: 'முடிந்தது' },
  'status.cancelled': { en: 'Cancelled', ta: 'ரத்து' },
  'status.delayed': { en: 'Delayed', ta: 'தாமதம்' },
  'status.paid': { en: 'Paid', ta: 'செலுத்தியது' },
  'status.overdue': { en: 'Overdue', ta: 'தாமதமானது' },
  'status.processing': { en: 'Processing', ta: 'செயலாக்கம்' },

  // Notifications
  'notifications.title': { en: 'Notifications', ta: 'அறிவிப்புகள்' },
  'notifications.markAllRead': { en: 'Mark all read', ta: 'அனைத்தையும் படிக்கப்பட்டதாக குறி' },
  'notifications.noNew': { en: 'No new notifications', ta: 'புதிய அறிவிப்புகள் இல்லை' },

  // Common
  'common.total': { en: 'Total', ta: 'மொத்தம்' },
  'common.filter': { en: 'Status', ta: 'நிலை' },
} satisfies Record<string, Record<Language, string>>;

export type TranslationKey = keyof typeof translations;
export type LooseTranslationKey = TranslationKey | (string & {});

// ─── Context ─────────────────────────────────────────────────────────────────

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: LooseTranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('kkp_lang') as Language;
    if (saved === 'en' || saved === 'ta') return saved;
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'ta') return 'ta';
    return 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('kkp_lang', lang);
  };

  const t = (key: LooseTranslationKey, params?: Record<string, string | number>): string => {
    const entry = translations[key as keyof typeof translations];
    let val = entry?.[language] || entry?.['en'] || (key as string);
    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        val = val.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }
    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

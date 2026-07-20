import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from './context/AuthContext';
import { getAssetUrl, downloadAsset } from './apiConfig';
import PublicSite from './components/PublicSite';
import {
  Key, Users, Shield, Radio, Activity, BarChart3, Database, LogOut, Check, X,
  Plus, Settings, FileText, Search, UserCheck, MapPin, Camera, AlertTriangle,
  RotateCcw, Trash, RefreshCw, Layers, Edit, ExternalLink, Sliders, DollarSign,
  Bell, Eye, EyeOff, Truck, CheckCircle2, ChevronRight, Info,
  CreditCard, QrCode, Wallet, Lock, ShieldCheck, Upload, Mail, Phone,
  ArrowRight, ArrowLeft, Building2, Calendar,
  Store, TrendingUp, TrendingDown, UserPlus, Clock, IndianRupee, BadgeCheck,
  ArrowUpRight, ArrowDownRight, Sparkles, HardDrive,
  User, Hash, UploadCloud, PenLine, Crosshair, FileCheck, Navigation, KeyRound, Car,
  Tag, Package, Boxes, Percent, Image as ImageIcon, Megaphone, BadgePercent,
  Receipt, CalendarRange, Banknote, PlayCircle, MessageCircle, LifeBuoy,
  Download, Fingerprint, Palette, Menu, Home, Languages
} from 'lucide-react';

export function cleanGoogleImageUrl(url) {
  if (!url) return '';
  try {
    if (url.includes('google.') && url.includes('imgres')) {
      const parsed = new URL(url);
      if (parsed.searchParams.has('imgurl')) {
        return decodeURIComponent(parsed.searchParams.get('imgurl'));
      }
    }
  } catch (e) {
    // ignore
  }
  return url;
}

export const INDIAN_STATES_DISTRICTS = {
  "Andhra Pradesh": [
    "Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", 
    "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", 
    "West Godavari", "YSR Kadapa", "Manyam", "Alluri Sitharama Raju", "Anakapalli", 
    "Kakinada", "Konaseema", "Eluru", "NTR", "Bapatla", "Palnadu", "Nandyal", 
    "Sri Sathya Sai", "Tirupati", "Annamayya"
  ],
  "Arunachal Pradesh": [
    "Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", 
    "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", 
    "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", 
    "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding", "Kamle", "Pakke Kessang", "Leparada", "Shi Yomi"
  ],
  "Assam": [
    "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", 
    "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", 
    "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", 
    "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", 
    "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", 
    "Tinsukia", "Udalguri", "West Karbi Anglong", "Tamulpur", "Bajali"
  ],
  "Bihar": [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", 
    "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", 
    "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", 
    "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", 
    "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", 
    "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", 
    "Vaishali", "West Champaran"
  ],
  "Chhattisgarh": [
    "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", 
    "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Jashpur", 
    "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", 
    "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", 
    "Surajpur", "Surguja", "Gaurela-Pendra-Marwahi", "Manendragarh-Chirmiri-Bharatpur", 
    "Mohla-Manpur-Ambagarh Chowki", "Sakti", "Sarangarh-Bilaigarh", "Khairagarh-Chhuikhadan-Gandai"
  ],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": [
    "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", 
    "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhumi Dwarka", 
    "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", 
    "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", 
    "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", 
    "Tapi", "Vadodara", "Valsad"
  ],
  "Haryana": [
    "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", 
    "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", 
    "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", 
    "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
  ],
  "Himachal Pradesh": [
    "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", 
    "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
  ],
  "Jharkhand": [
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", 
    "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", 
    "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", 
    "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"
  ],
  "Karnataka": [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", 
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", 
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", 
    "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", 
    "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", 
    "Uttara Kannada", "Vijayapura", "Yadgir", "Vijayanagara"
  ],
  "Kerala": [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", 
    "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", 
    "Thiruvananthapuram", "Thrissur", "Wayanad"
  ],
  "Madhya Pradesh": [
    "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", 
    "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", 
    "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", 
    "Harda", "Narmadapuram", "Indore", "Jabalpur", "Jhabua", "Katni", 
    "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", 
    "Neemuch", "Niwari", "Panna", "Raisen", "Rajgarh", "Ratlam", 
    "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", 
    "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", 
    "Umaria", "Vidisha", "Mauganj"
  ],
  "Maharashtra": [
    "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", 
    "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", 
    "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", 
    "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", 
    "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", 
    "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
  ],
  "Manipur": [
    "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", 
    "Senapati", "Tamenglong", "Thoubal", "Ukhrul", "Kangpokpi", "Tengnoupal", 
    "Pherzawl", "Noney", "Kamjong", "Kakching", "Jiribam"
  ],
  "Meghalaya": [
    "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", 
    "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", 
    "West Garo Hills", "West Jaintia Hills", "West Khasi Hills", "Eastern West Khasi Hills"
  ],
  "Mizoram": [
    "Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", 
    "Saiha", "Serchhip", "Hnahthial", "Khawzawl", "Saitual"
  ],
  "Nagaland": [
    "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", 
    "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto", "Noklak", 
    "Chümoukedima", "Tseminyu", "Niuland", "Shamator"
  ],
  "Odisha": [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", 
    "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", 
    "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", 
    "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", 
    "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
  ],
  "Punjab": [
    "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", 
    "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", 
    "Ludhiana", "Malerakotla", "Mansa", "Moga", "Muktsar", "Pathankot", 
    "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", 
    "Shahid Bhagat Singh Nagar", "Tarn Taran"
  ],
  "Rajasthan": [
    "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", 
    "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", 
    "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", 
    "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", 
    "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", 
    "Sri Ganganagar", "Tonk", "Udaipur", "Anoopgarh", "Balotra", "Beawar", 
    "Deeg", "Didwana-Kuchaman", "Dudu", "Gangapur City", "Kekri", 
    "Kotputli-Behror", "Khairthal-Tijara", "Neem Ka Thana", "Phalodi", 
    "Salumber", "Sanchore", "Shahpura"
  ],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim", "Pakyong", "Soreng"],
  "Tamil Nadu": [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", 
    "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", 
    "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", 
    "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", 
    "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", 
    "Viluppuram", "Virudhunagar"
  ],
  "Telangana": [
    "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", 
    "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", 
    "Khammam", "Kumuram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", 
    "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", 
    "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", 
    "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", 
    "Wanaparthy", "Warangal", "Hanamkonda", "Yadadri Bhuvanagiri"
  ],
  "Tripura": [
    "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", 
    "Unakoti", "West Tripura"
  ],
  "Uttar Pradesh": [
    "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", 
    "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", 
    "Banda", "Bara Banki", "Bareilly", "Basti", "Bhadohi", "Bijnor", 
    "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", 
    "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", 
    "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", 
    "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", 
    "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", 
    "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", 
    "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", 
    "Pilibhit", "Pratapgarh", "Prayagraj", "Rae Bareli", "Rampur", 
    "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", 
    "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", 
    "Unnao", "Varanasi"
  ],
  "Uttarakhand": [
    "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", 
    "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", 
    "Udham Singh Nagar", "Uttarkashi"
  ],
  "West Bengal": [
    "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", 
    "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", 
    "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", 
    "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", 
    "Purulia", "South 24 Parganas", "Uttar Dinajpur"
  ]
};

export const PHONE_REGEX = /^[1-9]\d{9}$/;
export const PHONE_REGEX_MESSAGE = 'Phone number must be exactly 10 digits and cannot start with 0';

function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = Number(value) || 0;
    const startTime = performance.now();
    let raf;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setDisplay(end);
      prevValue.current = end;
    };
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };
    raf = requestAnimationFrame(tick);
    // requestAnimationFrame is throttled/suspended entirely in background or
    // inactive tabs, which would leave the counter stuck at its start value
    // forever — this timer is a safety net that forces the final value in.
    const fallback = setTimeout(finish, duration + 250);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [value, duration]);

  return <>{prefix}{display.toFixed(decimals)}{suffix}</>;
}

export const compressBase64Image = (base64, callback) => {
  if (!base64) {
    callback('');
    return;
  }
  if (!base64.startsWith('data:image')) {
    // PDFs (and any other non-image upload) are passed through unmodified —
    // the canvas resize below only applies to raster images.
    callback(base64);
    return;
  }
  const img = new Image();
  img.src = base64;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 120;
    const MAX_HEIGHT = 120;
    let width = img.width;
    let height = img.height;
    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    callback(canvas.toDataURL('image/jpeg', 0.5));
  };
  img.onerror = () => {
    callback(base64);
  };
};

const LANGUAGES = {
  en: {
    shopsRegistered: 'Shops Registered',
    complianceRegistry: 'Compliance Registry',
    hostStorage: 'Host Storage Pool',
    annualRevenue: 'Annual Revenue',
    provisionNewShop: 'Provision New Shop',
    inventoryStock: 'Inventory Stock',
    incomingOrders: 'Incoming Orders Log',
    dashboard: 'Dashboard',
    shops: 'Shop Management',
    customers: 'Customer Registry',
    keys: 'Master Catalogue',
    pricing: 'Pricing & Offers',
    revenue: 'Revenue Log',
    searchKeys: 'Blank Key Search',
    register: 'Register Customer',
    history: 'Customer History',
    store: 'Platform Store',
    reports: 'Reports',
    settings: 'Shop Settings',
    logout: 'Log Out',
    welcome: 'KEE WORKSPACE',
    superAdmin: 'Super Admin',
    shopTerminal: 'Shop Terminal',
  },
  hi: {
    shopsRegistered: 'पंजीकृत दुकानें',
    complianceRegistry: 'अनुपालन रजिस्ट्री',
    hostStorage: 'होस्ट स्टोरेज पूल',
    annualRevenue: 'वार्षिक राजस्व',
    provisionNewShop: 'नई दुकान का प्रावधान',
    inventoryStock: 'इन्वेंटरी स्टॉक',
    incomingOrders: 'आने वाले ऑर्डर लॉग',
    dashboard: 'डैशबोर्ड',
    shops: 'दुकान प्रबंधन',
    customers: 'ग्राहक रजिस्ट्री',
    keys: 'मास्टर सूची',
    pricing: 'मूल्य निर्धारण और ऑफ़र',
    revenue: 'राजस्व लॉग',
    searchKeys: 'खाली कुंजी खोज',
    register: 'ग्राहक पंजीकृत करें',
    history: 'ग्राहक इतिहास',
    store: 'प्लेटफ़ॉर्म स्टोर',
    reports: 'रिपोर्ट',
    settings: 'दुकान सेटिंग्स',
    logout: 'लॉग आउट',
    welcome: 'की वर्कस्पेस',
    superAdmin: 'सुपर एडमिन',
    shopTerminal: 'दुकान टर्मिनल',
  },
  ta: {
    shopsRegistered: 'பதிவு செய்யப்பட்ட கடைகள்',
    complianceRegistry: 'வாடிக்கையாளர் பதிவேடு',
    hostStorage: 'சேமிப்பகக் குளம்',
    annualRevenue: 'வருடாந்திர வருவாய்',
    provisionNewShop: 'புதிய கடை சேர்க்க',
    inventoryStock: 'சரக்கு இருப்பு',
    incomingOrders: 'உள்வரும் ஆர்டர்கள் பதிவு',
    dashboard: 'முகப்பு பலகை',
    shops: 'கடை மேலாண்மை',
    customers: 'வாடிக்கையாளர் பதிவேடு',
    keys: 'மாஸ்டர் பட்டியல்',
    pricing: 'விலை மற்றும் சலுகைகள்',
    revenue: 'வருவாய் பதிவு',
    searchKeys: 'வெற்று சாவி தேடல்',
    register: 'வாடிக்கையாளர் பதிவு',
    history: 'பதிவு வரலாறு',
    store: 'விற்பனை நிலையம்',
    reports: 'அறிக்கைகள்',
    settings: 'கடை அமைப்புகள்',
    logout: 'வெளியேறு',
    welcome: 'கீ ஒர்க்ஸ்பேஸ்',
    superAdmin: 'சூப்பர் அட்மின்',
    shopTerminal: 'கடை முனையம்',
  },
  te: {
    shopsRegistered: 'నమోదిత దుకాణాలు',
    complianceRegistry: 'కస్టమర్ రిజిస్ట్రీ',
    hostStorage: 'హోస్ట్ నిల్వ పూల్',
    annualRevenue: 'వార్షിക ఆదాయం',
    provisionNewShop: 'కొత్త దుకాణం ఏర్పాటు',
    inventoryStock: 'ఇన్వెంటరీ స్టాక్',
    incomingOrders: 'ఇన్‌కమింగ్ ఆర్డర్‌ల లాగ్',
    dashboard: 'డాష్‌బోర్డ్',
    shops: 'షాప్ మేనేజ్‌మెంట్',
    customers: 'కస్టమర్ రిజిస్ట్రీ',
    keys: 'మాస్టர் కేటలాగ్',
    pricing: 'ధరలు & ఆఫర్లు',
    revenue: 'ఆదాయ లాగ్',
    searchKeys: 'కీ శోధన',
    register: 'కస్టమర్ నమోదు',
    history: 'కస్టమర్ చరిత్ర',
    store: 'ప్లాట్‌ఫారమ్ స్టోర్',
    reports: 'निवेदिकलु',
    settings: 'షాప్ సెట్టింగులు',
    logout: 'లాగ్ అవుట్',
    welcome: 'కీ వర్క్‌స్పేస్',
    superAdmin: 'సూపర్ అడ్మిన్',
    shopTerminal: 'షాప్ టెర్మినల్',
  },
  kn: {
    shopsRegistered: 'ನೋಂದಾಯಿತ ಅಂಗಡಿಗಳು',
    complianceRegistry: 'ಗ್ರಾಹಕರ ನೋಂದಣಿ',
    hostStorage: 'ಹೋಸ್ಟ್ ಶೇಖರಣಾ ಪೂಲ್',
    annualRevenue: 'ವಾರ್ಷಿಕ ಆದಾಯ',
    provisionNewShop: 'ಹೊಸ ಅಂಗಡಿ ಸೇರಿಸಿ',
    inventoryStock: 'ದಾಸ್ತಾನು ಸ್ಟಾಕ್',
    incomingOrders: 'ಒಳಬರುವ ಆದೇಶಗಳ ಲಾಗ್',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    shops: 'ಅಂಗಡಿ ನಿರ್ವಹಣೆ',
    customers: 'ಗ್ರಾಹಕರ ನೋಂದಣಿ',
    keys: 'ಮಾಸ್ಟರ್ ಕ್ಯಾಟಲಾಗ್',
    pricing: 'ಬೆಲೆ ಮತ್ತು ಕೊಡುಗೆಗಳು',
    revenue: 'ಆದಾಯ ದಾಖಲೆ',
    searchKeys: 'ಖಾಲಿ ಕೀಲಿ ಹುಡುಕಾಟ',
    register: 'ಗ್ರಾಹಕ ನೋಂದಣಿ',
    history: 'ಗ್ರಾಹಕ ಇತಿಹಾಸ',
    store: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸ್ಟೋರ್',
    reports: 'ವರದಿಗಳು',
    settings: 'ಅಂಗಡಿ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    logout: 'ಲಾಗ್ ಔಟ್',
    welcome: 'ಕೀ ವರ್ಕ್‌ಸ್ಪೇಸ್',
    superAdmin: 'ಸೂಪರ್ ಅಡ್ಮಿನ್',
    shopTerminal: 'ಅಂಗಡಿ ಟರ್ಮಿನಲ್',
  },
  ml: {
    shopsRegistered: 'രജിസ്റ്റർ ചെയ്ത കടകൾ',
    complianceRegistry: 'കസ്റ്റമർ രജിസ്ട്രി',
    hostStorage: 'ഹോസ്റ്റ് സംഭരണ പൂൾ',
    annualRevenue: 'വാർഷിക വരുമാനം',
    provisionNewShop: 'പുതിയ ഷോപ്പ് ചേർക്കുക',
    inventoryStock: 'ഇൻവെന്ററി സ്റ്റോക്ക്',
    incomingOrders: 'ഇൻകമിംഗ് ഓർഡറുകൾ',
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    shops: 'ഷോപ്പ് മാനേജ്‌മെന്റ്',
    customers: 'കസ്റ്റമർ രജിസ്ട്രി',
    keys: 'മാസ്റ്റർ കാറ്റലോഗ്',
    pricing: 'വിലയും ഓഫറുകളും',
    revenue: 'വരുമാന ലോഗ്',
    searchKeys: 'ബ്ലാങ്ക് കീ സെർച്ച്',
    register: 'കസ്റ്റമർ രജിസ്റ്റർ',
    history: 'കസ്റ്റമർ ഹിസ്റ്ററി',
    store: 'പ്ലാറ്റ്ഫോം സ്റ്റോർ',
    reports: 'റിപ്പോർട്ടുകൾ',
    settings: 'ഷോപ്പ് ക്രമീകരണങ്ങൾ',
    logout: 'ലോഗ് ഔട്ട്',
    welcome: 'കീ വർക്ക്സ്പേസ്',
    superAdmin: 'സൂപ്പർ അഡ്മിൻ',
    shopTerminal: 'ഷോപ്പ് ടെർമിനൽ',
  }
};

// Global header search "search by" categories. Rendered via a custom
// icon-based dropdown (not a native <select>) so the closed/trigger state
// can collapse to an icon-only button on mobile while still showing a full
// icon+label list in the open dropdown on every screen size.
const SEARCH_TYPE_OPTIONS = [
  { value: 'all', label: 'Anything', icon: Search },
  { value: 'customer', label: 'Customer', icon: Users },
  { value: 'productType', label: 'Product Type', icon: Tag },
  { value: 'location', label: 'Location', icon: MapPin },
  { value: 'key', label: 'Key', icon: KeyRound },
];

export default function App() {
  const { user, isAuthenticated, loading, login, logout, api } = useAuth();
  const [lang, setLang] = useState(localStorage.getItem('kee_lang') || 'en');
  const t = (key) => LANGUAGES[lang]?.[key] || LANGUAGES['en']?.[key] || key;

  const [activeTab, setActiveTab] = useState('dashboard');

  // Global header search: replaces the plain page-title label with a
  // functional search box + category filter. It's a *live* search - every
  // keystroke (and every filter-type change) instantly routes to whichever
  // existing screen owns that kind of data and hands it the query via
  // `searchDispatch` (a small {query, type, nonce} object - the nonce lets
  // the exact same query re-trigger the receiving screen's own search effect
  // even when the string itself didn't change, e.g. only the type changed).
  // No Enter key / submit button is required.
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchType, setGlobalSearchType] = useState('all');
  const [searchDispatch, setSearchDispatch] = useState(null);
  const [searchTypeMenuOpen, setSearchTypeMenuOpen] = useState(false);

  useEffect(() => {
    // The global search box only exists on the Dashboard (see the header
    // JSX below), so this is a one-shot "jump to the right screen" action,
    // not a live sync with that screen's own search field. As soon as a
    // query is typed we hand it off via `searchDispatch` and clear our own
    // copy - the destination screen takes over with its own, fully
    // independent search state from that point on, so nothing typed there
    // (or on any other page) ever feeds back into this box or any other
    // page's search.
    if (activeTab !== 'dashboard') return;
    const query = globalSearchQuery.trim();
    if (!query) return;

    // "Anything" (the default filter) has no single, unambiguous destination
    // screen, so it must never auto-navigate away from the Dashboard - it
    // stays a purely local, in-page search. Only an explicitly-picked
    // category (Customer / Product Type / Location / Key) is a deliberate
    // enough signal to jump to that category's own screen.
    if (globalSearchType === 'all') return;

    const isSuper = user?.role === 'SUPER_ADMIN';
    let targetTab;
    if (globalSearchType === 'customer') {
      targetTab = isSuper ? 'super-customers' : 'history';
    } else if (globalSearchType === 'key') {
      targetTab = isSuper ? 'keys' : 'search-keys';
    } else {
      // 'productType' | 'location' - both live in the cross-shop Inventory feed.
      targetTab = 'promotions';
    }

    setSearchDispatch({ query, type: globalSearchType, nonce: Date.now() });
    setActiveTab(targetTab);
    setGlobalSearchQuery('');
    setSearchTypeMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSearchQuery, globalSearchType, activeTab]);

  const PAGE_TITLES = {
    dashboard: t('dashboard'),
    shops: t('shops'),
    'super-customers': t('customers'),
    keys: t('keys'),
    'pricing-offers': t('pricing'),
    revenue: t('revenue'),
    'support-config': 'Support Config',
    promotions: 'Inventory',
    'search-keys': t('searchKeys'),
    register: t('register'),
    history: t('history'),
    reports: t('reports'),
    'customer-care': 'Customer Care',
    settings: t('settings'),
  };

  // The header no longer shows the page title as text (replaced by the global
  // search panel below), but the browser tab title still reflects it.
  useEffect(() => {
    document.title = PAGE_TITLES[activeTab] ? `${PAGE_TITLES[activeTab]} | KEE` : 'KEE';
  }, [activeTab, lang]);

  // Public (unauthenticated) marketing site page: home | search | about | contact | login.
  // Anonymous visitors land on 'home'; clicking "Login" (nav or hero CTA) switches this
  // to 'login', which renders the existing, unmodified login-shell UI below.
  const [publicPage, setPublicPage] = useState('home');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [autoOpenShopModal, setAutoOpenShopModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showLangDialog, setShowLangDialog] = useState(false);
  const langDialogCardRef = useRef(null);

  // Auto-close the language dialog the instant the user interacts with
  // anything outside it - another sidebar link, a header/mobile-nav button,
  // etc. A document-level listener (rather than relying solely on the
  // dialog's own backdrop) is used because the mobile bottom-nav bar sits
  // at a higher z-index (60) than the dialog backdrop (50), so clicks on it
  // land directly on the nav button instead of the backdrop - but the click
  // still bubbles up to `document`, so this reliably catches it regardless
  // of stacking order, letting the underlying button's own onClick (e.g.
  // switching tabs) fire normally in the same click.
  useEffect(() => {
    if (!showLangDialog) return;
    const handleOutsideClick = (e) => {
      if (langDialogCardRef.current && !langDialogCardRef.current.contains(e.target)) {
        setShowLangDialog(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showLangDialog]);

  // Forgot password flow states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetMethod, setResetMethod] = useState(null); // 'email' | 'phone' | null
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetOtpInput, setResetOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Shop Self-Registration states
  const [showRegisterShop, setShowRegisterShop] = useState(false);
  const [regShopName, setRegShopName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [regLocation, setRegLocation] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPlan, setRegPlan] = useState('MONTHLY'); // 'MONTHLY' | 'HALF_YEARLY' | 'YEARLY'
  const [regError, setRegError] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');
  const [regStep, setRegStep] = useState(1); // 1: Info, 2: OTP, 3: Password & Plan, 4: Payment

  // Self-Registration OTP states
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpVerified, setRegOtpVerified] = useState(false);
  const [regOtpInput, setRegOtpInput] = useState('');
  const [regOtpError, setRegOtpError] = useState('');
  const [regOtpLoading, setRegOtpLoading] = useState(false);

  // Self-Registration Payment states
  const [regShowPayment, setRegShowPayment] = useState(false);
  const [regPayMethod, setRegPayMethod] = useState('card');
  const [regCardNumber, setRegCardNumber] = useState('');
  const [regCardExpiry, setRegCardExpiry] = useState('');
  const [regCardCvv, setRegCardCvv] = useState('');
  const [regCardHolder, setRegCardHolder] = useState('');
  const [regUpiId, setRegUpiId] = useState('');
  const [regPayProcessing, setRegPayProcessing] = useState(false);
  const [regPaySuccess, setRegPaySuccess] = useState(false);

  const [regShopPhoto, setRegShopPhoto] = useState('');
  const [regShopLicense, setRegShopLicense] = useState('');
  const [regOwnerAadhaar, setRegOwnerAadhaar] = useState('');

  // Password visibility states
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showVerifyPass, setShowVerifyPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);



  const fetchNotifications = async () => {
    try {
      let res;
      if (user?.role === 'SUPER_ADMIN') {
        res = await api.getSuperNotifications();
      } else {
        res = await api.getNotifications();
      }
      const sorted = [...res].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNotifications(sorted);
      setUnreadCount(sorted.filter(n => !n.isRead).length);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await login(authEmail, authPassword);
      setActiveTab('dashboard');
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      await api.sendOtp(resetIdentifier, resetMethod || 'email', 'reset');
      setOtpSent(true);
    } catch (err) {
      setResetError(err.message || 'Failed to dispatch verification code');
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      await api.verifyOtp(resetIdentifier, resetMethod || 'email', 'reset', resetOtpInput);
      setOtpVerified(true);
    } catch (err) {
      setResetError(err.message || 'Incorrect verification code. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    setResetLoading(true);
    try {
      await api.resetPasswordPublic(resetIdentifier, resetMethod, newPassword);
      setResetSuccess(true);
    } catch (err) {
      setResetError(err.message || 'Password reset failed');
    } finally {
      setResetLoading(false);
    }
  };

  const resetForgotPasswordFlow = () => {
    setShowForgotPassword(false);
    setResetMethod(null);
    setResetIdentifier('');
    setResetOtpInput('');
    setOtpSent(false);
    setOtpVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess(false);
  };

  const handleSendRegOtp = async () => {
    if (!regEmail || !regPhone) {
      alert('Please enter your email address and phone number first.');
      return;
    }
    setRegOtpLoading(true);
    setRegOtpError('');
    try {
      await api.sendOtp(regPhone, 'phone', 'register');
      setRegOtpSent(true);
    } catch (err) {
      setRegOtpError(err.message || 'Failed to dispatch verification OTP.');
    } finally {
      setRegOtpLoading(false);
    }
  };

  const handleVerifyRegOtp = async (e) => {
    e.preventDefault();
    setRegOtpError('');
    setRegOtpLoading(true);
    try {
      await api.verifyOtp(regPhone, 'phone', 'register', regOtpInput);
      setRegOtpVerified(true);
      setRegStep(3);
    } catch (err) {
      setRegOtpError(err.message || 'Incorrect verification OTP code. Please try again.');
    } finally {
      setRegOtpLoading(false);
    }
  };

  const handleRegCheckout = async (e) => {
    e.preventDefault();
    setRegPayProcessing(true);
    
    const logs = [
      'Establishing secure payment tunnel...',
      'Verifying account assets & fraud parameters...',
      'Settling subscription merchant account...',
      'Confirming tokenized gateway response...'
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const res = await api.registerShop({
        shopName: regShopName,
        ownerName: regOwnerName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        plan: regPlan,
        whatsappNumber: regWhatsapp,
        location: regLocation,
        shopPhoto: regShopPhoto,
        shopLicense: regShopLicense,
        ownerAadhaar: regOwnerAadhaar
      });

      setRegPayProcessing(false);
      setRegPaySuccess(true);
      setRegSuccessMessage(res.message || 'Registration successful! Your shop account is now active - you can log in right away.');
    } catch (err) {
      setRegPayProcessing(false);
      setRegError(err.message || 'Self-registration failed.');
    }
  };

  const resetRegisterShopFlow = () => {
    setShowRegisterShop(false);
    setRegShopName('');
    setRegOwnerName('');
    setRegEmail('');
    setRegPhone('');
    setRegWhatsapp('');
    setSameAsPhone(false);
    setRegLocation('');
    setRegPassword('');
    setRegPlan('MONTHLY');
    setRegError('');
    setRegSuccessMessage('');
    setRegOtpSent(false);
    setRegOtpVerified(false);
    setRegOtpInput('');
    setRegOtpError('');
    setRegOtpLoading(false);
    setRegShowPayment(false);
    setRegCardNumber('');
    setRegCardExpiry('');
    setRegCardCvv('');
    setRegCardHolder('');
    setRegUpiId('');
    setRegPayProcessing(false);
    setRegPaySuccess(false);
    setRegStep(1);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-0)' }}>
        <div className="flex flex-col items-center gap-5 animate-fade-in">
          <div className="brand">
            <span className="mark"><Key /></span>
            Kee<span className="gold-dot">.</span>
          </div>
          <RefreshCw className="h-6 w-6 animate-spin" style={{ color: 'var(--gold)' }} />
          <p style={{ color: 'var(--text-3)' }} className="text-sm font-semibold">Bootstrapping your workspace&hellip;</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated ? (
        publicPage !== 'login' ? (
          <PublicSite page={publicPage} onNavigate={setPublicPage} api={api} />
        ) : (
        <div className="login-shell">
          <div className="login-side">
            <div className="glow"></div>
            <div className="side-copy">
              <span className="pill-badge" style={{ marginBottom: 18 }}>
                <span className="dot"></span>
                Trusted by 500+ key shops across India
              </span>
              <h2>Run your shop<span className="gold-line">the smart, gold-standard way.</span></h2>
              <p>Track duplicate keys, customers and store orders across every branch &mdash; one bold dashboard built for Indian locksmiths.</p>
            </div>

            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="p-head">
                  <span className="p-title">Kee Dashboard</span>
                  <span className="phone-badge"></span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="phone-stat">
                    <div className="num">1,284</div>
                    <div className="lbl">Customers</div>
                  </div>
                  <div className="phone-stat">
                    <div className="num">3,910</div>
                    <div className="lbl">Keys Cut</div>
                  </div>
                </div>
                <div className="phone-mini-bars">
                  <div className="mb" style={{ height: '35%' }}></div>
                  <div className="mb" style={{ height: '55%' }}></div>
                  <div className="mb" style={{ height: '40%' }}></div>
                  <div className="mb" style={{ height: '72%' }}></div>
                  <div className="mb" style={{ height: '58%' }}></div>
                  <div className="mb" style={{ height: '90%' }}></div>
                  <div className="mb" style={{ height: '64%' }}></div>
                </div>
                <div className="phone-row">
                  <div className="dotpic"></div>
                  <div className="lines"><div className="l1"></div><div className="l2"></div></div>
                </div>
                <div className="phone-row">
                  <div className="dotpic"></div>
                  <div className="lines"><div className="l1"></div><div className="l2"></div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="login-form-side">
            <div className="login-box animate-fade-in">
              <button type="button" className="back-to-home-link" onClick={() => setPublicPage('home')}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back to home
              </button>
              <div className="brand">
                <span className="mark"><Key /></span>
                Kee<span className="gold-dot">.</span>
              </div>
              <h1>Welcome back</h1>
              <p className="lead">Sign in to run your duplicate-key shop &mdash; orders, customers and inventory, all in one place.</p>

              {authError && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.35)', color: '#b91c1c', padding: '12px 14px', borderRadius: 13, marginBottom: 20, fontSize: 12.5, fontWeight: 600 }}>
                  <AlertTriangle className="h-4 w-4 shrink-0" style={{ marginTop: 1 }} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="field">
                  <label>Email address</label>
                  <div className="input-wrap">
                    <Mail />
                    <input
                      type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="admin@kee.com or shop@kee.com"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Password</label>
                  <div className="input-wrap">
                    <Lock />
                    <input
                      type={showAuthPassword ? "text" : "password"} required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" style={{ paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="pwd-toggle-btn"
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                    >
                      {showAuthPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="field-row">
                  <label className="remember">
                    <input type="checkbox" defaultChecked />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="forgot-link"
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit" disabled={authLoading}
                  className="btn btn-primary btn-block"
                >
                  {authLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <>Sign in to Kee <ArrowRight /></>}
                </button>
              </form>

              <div className="login-foot" style={{ marginTop: 20 }}>
                Want to register your shop?{' '}
                <button
                  type="button"
                  onClick={() => setShowRegisterShop(true)}
                >
                  Create shop account
                </button>
              </div>
            </div>
          </div>

          {/* Forgot Password Overlay Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 z-[60] flex justify-center p-4" style={{ background: 'rgba(5,4,3,0.82)' }}>
              <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 420, padding: 32, margin: 'auto', position: 'relative' }}>
                <button
                  onClick={resetForgotPasswordFlow}
                  className="icon-btn"
                  style={{ position: 'absolute', top: 18, right: 18 }}
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center mb-6" style={{ textAlign: 'center' }}>
                  <div className="icon-badge solid" style={{ marginBottom: 10 }}>
                    <Lock />
                  </div>
                  <h2 style={{ fontSize: 20 }}>Reset your password</h2>
                  <p style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Secure recovery for your workspace</p>
                </div>

                {resetError && (
                  <div style={{ display: 'flex', gap: 8, background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.35)', padding: 10, borderRadius: 12, fontSize: 12, color: '#b91c1c', marginBottom: 16, fontWeight: 600 }}>
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                {resetSuccess ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div className="icon-badge green" style={{ margin: '0 auto 14px' }}>
                      <Check />
                    </div>
                    <p style={{ color: 'var(--green)', fontWeight: 800, fontSize: 13, fontFamily: 'var(--display)' }}>Password reset successfully</p>
                    <p style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 20 }}>You can now sign in with your new credentials.</p>
                    <button
                      onClick={resetForgotPasswordFlow}
                      className="btn btn-primary btn-block"
                    >
                      Return to login
                    </button>
                  </div>
                ) : resetMethod === null ? (
                  <div>
                    <p style={{ color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600, textAlign: 'center', lineHeight: 1.6, marginBottom: 18 }}>
                      Select your verification method to recover your workspace credentials.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setResetMethod('email')}
                        className="qa-btn"
                        style={{ flexDirection: 'column', textAlign: 'center', gap: 10, minWidth: 0 }}
                      >
                        <span className="icon-badge"><Mail /></span>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.03em' }}>Email OTP</span>
                      </button>
                      <button
                        onClick={() => setResetMethod('phone')}
                        className="qa-btn"
                        style={{ flexDirection: 'column', textAlign: 'center', gap: 10, minWidth: 0 }}
                      >
                        <span className="icon-badge"><Phone /></span>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.03em' }}>Phone OTP</span>
                      </button>
                    </div>
                    <button
                      onClick={resetForgotPasswordFlow}
                      className="btn btn-ghost btn-block"
                      style={{ marginTop: 14 }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : !otpSent ? (
                  <form onSubmit={handleSendOtp}>
                    <p style={{ color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600, textAlign: 'center', marginBottom: 16 }}>
                      Enter the registered {resetMethod} associated with your workspace to request a reset code.
                    </p>
                    <div className="field">
                      <label>{resetMethod === 'email' ? 'Registered email' : 'Registered phone number'}</label>
                      <div className="input-wrap">
                        {resetMethod === 'email' ? <Mail /> : <Phone />}
                        <input
                          type={resetMethod === 'email' ? 'email' : 'text'}
                          required
                          value={resetIdentifier}
                          onChange={(e) => setResetIdentifier(e.target.value)}
                          placeholder={resetMethod === 'email' ? 'e.g. shop@kee.com' : 'e.g. +91 99999 99999'}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setResetMethod(null); setResetIdentifier(''); }}
                        className="btn btn-ghost"
                        style={{ flex: 1 }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="btn btn-primary"
                        style={{ flex: 2 }}
                      >
                        {resetLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Send OTP code'}
                      </button>
                    </div>
                  </form>
                ) : !otpVerified ? (
                  <form onSubmit={handleVerifyOtp}>
                    <p style={{ color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600, textAlign: 'center', lineHeight: 1.6, marginBottom: 14 }}>
                      A 4-digit code has been dispatched to <span style={{ color: 'var(--gold)', fontWeight: 800 }}>{resetIdentifier}</span>.
                    </p>
                    {resetError && <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>{resetError}</div>}
                    <div className="field">
                      <label style={{ textAlign: 'center' }}>Enter OTP</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={resetOtpInput}
                        onChange={(e) => setResetOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234"
                        style={{ width: '100%', background: 'var(--card-2)', border: '1.5px solid var(--border-2)', color: 'var(--text-0)', borderRadius: 13, padding: '13px 15px', fontSize: 16, textAlign: 'center', letterSpacing: '.3em', fontWeight: 800, outline: 'none' }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="btn btn-ghost"
                        style={{ flex: 1 }}
                      >
                        Resend
                      </button>
                      <button type="submit" disabled={resetLoading} className="btn btn-primary" style={{ flex: 2 }}>
                        {resetLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verify OTP'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit}>
                    <p style={{ color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600, textAlign: 'center', marginBottom: 16 }}>
                      OTP verified. Please set a new password below.
                    </p>
                    <div className="field">
                      <label>New password</label>
                      <div className="input-wrap">
                        <Lock />
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label>Confirm password</label>
                      <div className="input-wrap">
                        <Lock />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Retype password"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="btn btn-primary btn-block"
                    >
                      {resetLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Update password'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {showRegisterShop && (

    <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10" style={{ background: 'rgba(5,4,3,0.82)' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 460, margin: 'auto', padding: 28 }}>
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
          <div>
            <span className="eyebrow" style={{ marginBottom: 4 }}><Building2 />Shop onboarding</span>
            <h2 style={{ fontSize: 19 }}>Register your key shop</h2>
          </div>
          <button
            onClick={() => {
              resetRegisterShopFlow();
              setRegStep(1);
            }}
            className="icon-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {regSuccessMessage ? (
          <div style={{ textAlign: 'center', padding: '18px 0' }}>
            <div className="icon-badge green" style={{ margin: '0 auto 16px' }}>
              <Check />
            </div>
            <h3 style={{ fontSize: 16 }}>Registration submitted</h3>
            <p style={{ color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600, lineHeight: 1.6, padding: '0 8px', marginTop: 8, marginBottom: 20 }}>
              {regSuccessMessage}
            </p>
            <button
              onClick={() => {
                resetRegisterShopFlow();
                setRegStep(1);
              }}
              className="btn btn-ghost"
            >
              Return to login
            </button>
          </div>
        ) : (
          <div>
            {/* Step Progress indicators */}
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 18, fontSize: 10.5 }}>
              <span style={{ color: regStep === 1 ? 'var(--gold)' : 'var(--text-3)', fontWeight: 800, fontFamily: 'var(--display)' }}>1. Business info</span>
              <ChevronRight className="h-3 w-3" style={{ color: 'var(--text-3)' }} />
              <span style={{ color: regStep === 2 ? 'var(--gold)' : 'var(--text-3)', fontWeight: 800, fontFamily: 'var(--display)' }}>2. Verification</span>
              <ChevronRight className="h-3 w-3" style={{ color: 'var(--text-3)' }} />
              <span style={{ color: regStep === 3 ? 'var(--gold)' : 'var(--text-3)', fontWeight: 800, fontFamily: 'var(--display)' }}>3. Subscription</span>
              <ChevronRight className="h-3 w-3" style={{ color: 'var(--text-3)' }} />
              <span style={{ color: regStep === 4 ? 'var(--gold)' : 'var(--text-3)', fontWeight: 800, fontFamily: 'var(--display)' }}>4. Payment</span>
            </div>

            {regError && (
              <div style={{ display: 'flex', gap: 8, background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.35)', padding: 10, borderRadius: 12, fontSize: 12, color: '#b91c1c', fontWeight: 600, marginBottom: 16 }}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* STEP 1: Info */}
            {regStep === 1 && (
              <div>
                <div className="field">
                  <label>Shop name / business name</label>
                  <div className="input-wrap">
                    <Building2 />
                    <input
                      type="text" required value={regShopName} onChange={(e) => setRegShopName(e.target.value)}
                      placeholder="e.g. Metro Duplicate Keys"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Owner name</label>
                  <div className="input-wrap">
                    <UserCheck />
                    <input
                      type="text" required value={regOwnerName} onChange={(e) => setRegOwnerName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Email address</label>
                    <div className="input-wrap">
                      <Mail />
                      <input
                        type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="shop@example.com"
                      />
                    </div>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Phone number</label>
                    <div className="input-wrap">
                      <Phone />
                      <input
                        type="tel" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="10-digit mobile"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: 18 }}>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <div className="flex justify-between items-center mb-2">
                      <label style={{ marginBottom: 0 }}>WhatsApp number</label>
                      <label className="flex items-center gap-1 cursor-pointer select-none" style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 800 }}>
                        <input
                          type="checkbox" checked={sameAsPhone}
                          onChange={(e) => {
                            setSameAsPhone(e.target.checked);
                            if (e.target.checked) setRegWhatsapp(regPhone);
                          }}
                          style={{ accentColor: 'var(--gold)', width: 13, height: 13 }}
                        />
                        <span>Same as phone</span>
                      </label>
                    </div>
                    <div className="input-wrap">
                      <Phone />
                      <input
                        type="tel" required value={regWhatsapp} onChange={(e) => setRegWhatsapp(e.target.value)}
                        disabled={sameAsPhone} placeholder="WhatsApp number"
                        style={{ opacity: sameAsPhone ? 0.5 : 1 }}
                      />
                    </div>
                  </div>

                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Shop location details</label>
                    <div className="input-wrap">
                      <MapPin />
                      <input
                        type="text" required value={regLocation} onChange={(e) => setRegLocation(e.target.value)}
                        placeholder="City, State / landmark"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 22 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!regShopName || !regOwnerName || !regEmail || !regPhone || !regWhatsapp || !regLocation) {
                        alert('Please fill out all registration fields.');
                        return;
                      }
                      if (!PHONE_REGEX.test(regPhone)) {
                        alert(`Phone number: ${PHONE_REGEX_MESSAGE}`);
                        return;
                      }
                      if (!PHONE_REGEX.test(regWhatsapp)) {
                        alert(`WhatsApp number: ${PHONE_REGEX_MESSAGE}`);
                        return;
                      }
                      setRegStep(2);
                    }}
                    className="btn btn-primary"
                  >
                    Continue to OTP <ArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: OTP Verification */}
            {regStep === 2 && (
              <div>
                <p style={{ color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600, textAlign: 'center', lineHeight: 1.6, marginBottom: 18 }}>
                  We need to verify your credentials. A secure OTP code will be sent via SMS to <strong style={{ color: 'var(--gold)' }}>{regPhone}</strong>.
                </p>

                {!regOtpSent ? (
                  <div className="flex justify-center" style={{ padding: '18px 0' }}>
                    <button
                      type="button" onClick={handleSendRegOtp} disabled={regOtpLoading}
                      className="btn btn-primary"
                    >
                      {regOtpLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                      Send verification OTP
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyRegOtp}>
                    {regOtpError && <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>{regOtpError}</div>}
                    <p style={{ color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600, textAlign: 'center', lineHeight: 1.6, marginBottom: 14 }}>
                      A 4-digit code has been dispatched via SMS to <span style={{ color: 'var(--gold)', fontWeight: 800 }}>{regPhone}</span>.
                    </p>

                    <div className="field">
                      <label style={{ textAlign: 'center' }}>Enter verification OTP</label>
                      <input
                        type="text" required maxLength={4} value={regOtpInput} onChange={(e) => setRegOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234"
                        style={{ width: '100%', background: 'var(--card-2)', border: '1.5px solid var(--border-2)', color: 'var(--text-0)', borderRadius: 13, padding: '13px 15px', fontSize: 16, textAlign: 'center', letterSpacing: '.3em', fontWeight: 800, outline: 'none' }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button" onClick={() => setRegOtpSent(false)}
                        className="btn btn-ghost" style={{ flex: 1 }}
                      >
                        Resend
                      </button>
                      <button type="submit" disabled={regOtpLoading} className="btn btn-primary" style={{ flex: 2 }}>
                        {regOtpLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verify OTP'}
                      </button>
                    </div>
                  </form>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 16 }}>
                  <button type="button" onClick={() => setRegStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', fontWeight: 700 }}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to shop info
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Plan & Password */}
            {regStep === 3 && (
              <div>
                <div className="field">
                  <label>Create account password</label>
                  <div className="input-wrap">
                    <Lock />
                    <input
                      type={showRegPassword ? "text" : "password"} required minLength={6} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters" style={{ paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="pwd-toggle-btn"
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8, fontFamily: 'var(--display)' }}>Choose subscription plan</label>
                  <div className="store-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setRegPlan('MONTHLY')}
                      className={`store-tab ${regPlan === 'MONTHLY' ? 'active' : ''}`}
                      style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 8px' }}
                    >
                      <span>Monthly</span>
                      <span style={{ fontSize: 9, opacity: 0.75 }}>Rs. 49</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegPlan('HALF_YEARLY')}
                      className={`store-tab ${regPlan === 'HALF_YEARLY' ? 'active' : ''}`}
                      style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 8px' }}
                    >
                      <span>6 Months</span>
                      <span style={{ fontSize: 9, opacity: 0.75 }}>Rs. 269</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegPlan('YEARLY')}
                      className={`store-tab ${regPlan === 'YEARLY' ? 'active' : ''}`}
                      style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 8px' }}
                    >
                      <span>Yearly</span>
                      <span style={{ fontSize: 9, opacity: 0.75 }}>Rs. 499</span>
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                  <h4 className="side-section-label" style={{ padding: 0, marginBottom: 10 }}>Upload shop documents</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Shop photo</label>
                      <input
                        type="file" accept="image/*" required
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => compressBase64Image(r.result, setRegShopPhoto);
                            r.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs cursor-pointer file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase"
                        style={{ color: 'var(--text-3)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Shop license</label>
                      <input
                        type="file" accept="image/*,application/pdf" required
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => compressBase64Image(r.result, setRegShopLicense);
                            r.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs cursor-pointer file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase"
                        style={{ color: 'var(--text-3)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Owner Aadhaar</label>
                      <input
                        type="file" accept="image/*,application/pdf" required
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => compressBase64Image(r.result, setRegOwnerAadhaar);
                            r.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs cursor-pointer file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase"
                        style={{ color: 'var(--text-3)' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 20 }}>
                  <button type="button" onClick={() => setRegStep(2)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', fontWeight: 700 }}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!regPassword || regPassword.length < 6) {
                        alert('Password must be at least 6 characters.');
                        return;
                      }
                      if (!regOwnerAadhaar) {
                        alert('Owner Aadhaar document is mandatory to register.');
                        return;
                      }
                      setRegStep(4);
                    }}
                    className="btn btn-primary"
                  >
                    Proceed to checkout <ArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Payment Checkout */}
            {regStep === 4 && (
              <form onSubmit={handleRegCheckout} className="animate-fade-in relative overflow-hidden">
                {regPayProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: 'rgba(10,9,8,0.92)', zIndex: 20 }}>
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full" style={{ border: '4px solid var(--gold-dim)' }}></span>
                      <span className="absolute inset-0 rounded-full animate-spin" style={{ border: '4px solid transparent', borderTopColor: 'var(--gold)' }}></span>
                    </div>
                    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>Settling payment&hellip;</h3>
                  </div>
                )}

                <div className="flex justify-between items-center" style={{ background: 'var(--card-2)', padding: 14, borderRadius: 14, border: '1px solid var(--border-2)', marginBottom: 18, fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                  <span>Payable amount</span>
                  <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16, fontFamily: 'var(--display)' }}>
                    Rs. {regPlan === 'MONTHLY' ? '49.00' : regPlan === 'HALF_YEARLY' ? '269.00' : '499.00'}
                  </span>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8, fontFamily: 'var(--display)' }}>Choose payment channel</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button" onClick={() => setRegPayMethod('card')}
                      className={`store-tab ${regPayMethod === 'card' ? 'active' : ''}`}
                      style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 8px' }}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span style={{ fontSize: 10 }}>Credit card</span>
                    </button>
                    <button
                      type="button" onClick={() => setRegPayMethod('upi')}
                      className={`store-tab ${regPayMethod === 'upi' ? 'active' : ''}`}
                      style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 8px' }}
                    >
                      <QrCode className="h-4 w-4" />
                      <span style={{ fontSize: 10 }}>UPI / QR scan</span>
                    </button>
                  </div>
                </div>

                {regPayMethod === 'card' ? (
                  <div className="animate-fade-in">
                    <div className="field">
                      <label>Card number</label>
                      <div className="input-wrap">
                        <CreditCard />
                        <input
                          type="text" required maxLength={16} placeholder="4111 2222 3333 4444" value={regCardNumber} onChange={(e) => setRegCardNumber(e.target.value.replace(/\D/g, ''))}
                          style={{ fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label>Cardholder name</label>
                      <div className="input-wrap">
                        <UserCheck />
                        <input
                          type="text" required placeholder="RAJESH KUMAR" value={regCardHolder} onChange={(e) => setRegCardHolder(e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>
                    <div className="form-grid">
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>Expiry date</label>
                        <div className="input-wrap">
                          <Calendar />
                          <input
                            type="text" required maxLength={5} placeholder="MM/YY" value={regCardExpiry} onChange={(e) => setRegCardExpiry(e.target.value)}
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>CVV</label>
                        <div className="input-wrap">
                          <Lock />
                          <input
                            type="password" required maxLength={3} placeholder="***" value={regCardCvv} onChange={(e) => setRegCardCvv(e.target.value.replace(/\D/g, ''))}
                            style={{ textAlign: 'center', fontFamily: 'monospace' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in" style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 24, borderRadius: 16, textAlign: 'center' }}>
                    <QrCode className="h-12 w-12" style={{ color: 'var(--gold)', margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Scan QR code using GooglePay, PhonePe, or Paytm</p>
                    <span style={{ fontWeight: 800, fontSize: 13, fontFamily: 'monospace', color: 'var(--text-0)' }}>UPI: keeplace.register@icici</span>
                  </div>
                )}

                <div className="flex gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                  <button type="button" onClick={() => setRegStep(3)} className="btn btn-ghost" style={{ flex: 1 }}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    Pay & settle setup
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )}
        </div>
        )
      ) : (
        <div className="min-h-[calc(100vh-40px)] flex flex-col md:flex-row">
          {/* Mobile nav backdrop */}
          {mobileNavOpen && (
            <div
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(5,4,3,0.7)' }}
              onClick={() => setMobileNavOpen(false)}
            />
          )}

          {/* SIDEBAR NAVIGATION */}
          <aside
            className={`sidebar w-[78%] max-w-[260px] md:w-64 flex flex-col shrink-0 fixed md:static inset-y-0 left-0 z-50 md:z-auto transition-transform duration-300 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            style={{ overflowY: 'auto' }}
          >
            <div className="brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span className="mark"><Key /></span>
                Kee<span className="gold-dot">.</span>
              </span>
              <button className="icon-btn md:hidden" onClick={() => setMobileNavOpen(false)}>
                <X />
              </button>
            </div>

            <div style={{ padding: '0 20px 18px' }}>
              <span className="role-pill">
                <ShieldCheck />
                {user.role === 'SUPER_ADMIN' ? t('superAdmin') : t('shopTerminal')}
              </span>
            </div>

            {/* Language Selector Dropdown */}
            <div style={{ padding: '0 20px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
              <label className="side-section-label" style={{ padding: 0, marginBottom: 8, display: 'block' }}>Language &middot; भाषा &middot; மொழி</label>
              <select
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  localStorage.setItem('kee_lang', e.target.value);
                }}
                className="sel"
                style={{ padding: '9px 32px 9px 12px', fontSize: 12 }}
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
              </select>
            </div>

            <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }} onClick={(e) => { if (e.target.closest('button')) setMobileNavOpen(false); }}>
              <div className="side-section-label">Overview</div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`side-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <Sliders />
                <span>{t('dashboard')}</span>
              </button>

              {user.role === 'SUPER_ADMIN' ? (
                <>
                  <div className="side-section-label">Operations</div>
                  <button
                    onClick={() => setActiveTab('shops')}
                    className={`side-link ${activeTab === 'shops' ? 'active' : ''}`}
                  >
                    <Layers />
                    <span>{t('shops')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('super-customers')}
                    className={`side-link ${activeTab === 'super-customers' ? 'active' : ''}`}
                  >
                    <Users />
                    <span>{t('customers')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('keys')}
                    className={`side-link ${activeTab === 'keys' ? 'active' : ''}`}
                  >
                    <Database />
                    <span>{t('keys')}</span>
                  </button>

                  <div className="side-section-label">Business</div>
                  <button
                    onClick={() => setActiveTab('pricing-offers')}
                    className={`side-link ${activeTab === 'pricing-offers' ? 'active' : ''}`}
                  >
                    <Settings />
                    <span>{t('pricing')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('revenue')}
                    className={`side-link ${activeTab === 'revenue' ? 'active' : ''}`}
                  >
                    <DollarSign />
                    <span>{t('revenue')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('promotions')}
                    className={`side-link ${activeTab === 'promotions' ? 'active' : ''}`}
                  >
                    <Megaphone />
                    <span>Inventory</span>
                  </button>

                  <div className="side-section-label">Support</div>
                  <button
                    onClick={() => setActiveTab('support-config')}
                    className={`side-link ${activeTab === 'support-config' ? 'active' : ''}`}
                  >
                    <Phone />
                    <span>Support Config</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="side-section-label">Operations</div>
                  <button
                    onClick={() => setActiveTab('search-keys')}
                    className={`side-link ${activeTab === 'search-keys' ? 'active' : ''}`}
                  >
                    <Search />
                    <span>{t('searchKeys')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`side-link ${activeTab === 'register' ? 'active' : ''}`}
                  >
                    <Plus />
                    <span>{t('register')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`side-link ${activeTab === 'history' ? 'active' : ''}`}
                  >
                    <Users />
                    <span>{t('history')}</span>
                  </button>

                  <div className="side-section-label">Store</div>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`side-link ${activeTab === 'reports' ? 'active' : ''}`}
                  >
                    <BarChart3 />
                    <span>{t('reports')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('promotions')}
                    className={`side-link ${activeTab === 'promotions' ? 'active' : ''}`}
                  >
                    <Megaphone />
                    <span>Inventory</span>
                  </button>

                  <div className="side-section-label">Settings</div>
                  <button
                    onClick={() => setActiveTab('customer-care')}
                    className={`side-link ${activeTab === 'customer-care' ? 'active' : ''}`}
                  >
                    <Phone />
                    <span>Customer Care</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`side-link ${activeTab === 'settings' ? 'active' : ''}`}
                  >
                    <Settings />
                    <span>{t('settings')}</span>
                  </button>
                </>
              )}
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                <span className="avatar">{(user.name || 'U').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="truncate" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, color: 'var(--text-0)' }}>{user.name}</div>
                  <div className="truncate" style={{ fontSize: 11, color: 'var(--text-3)' }}>{user.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="side-link"
                style={{ color: 'var(--red)' }}
              >
                <LogOut />
                <span>Log out</span>
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT DISPLAY */}
          <main className="flex-1 p-4 pb-24 md:p-6 overflow-y-auto overflow-x-hidden space-y-6" style={{ minWidth: 0 }}>

            {/* Top Workspace Header Bar */}
            <header className="app-topbar flex justify-between items-center mb-6 relative z-50" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, padding: '14px 20px' }}>
              <div className="flex items-center gap-2 header-search-wrap" style={{ minWidth: 0, flex: 1 }}>
                <button className="icon-btn md:hidden" onClick={() => setMobileNavOpen(v => !v)} style={{ flexShrink: 0 }}>
                  <Menu />
                </button>
                {/* The global "jump to" search only makes sense on the
                    Dashboard: it exists to launch you into the right screen
                    (Customers / Keys / Inventory) for a query typed from the
                    landing page. Every other screen already has its own,
                    fully independent search box, so showing this one there
                    too was causing the same characters to visibly appear in
                    two search fields at once. Hiding it everywhere except
                    Dashboard keeps every page's search 100% self-contained. */}
                {activeTab === 'dashboard' && (
                  <div className="global-search-form" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => setSearchTypeMenuOpen(v => !v)}
                        className="search-type-trigger"
                        title="Search by"
                      >
                        {(() => {
                          const active = SEARCH_TYPE_OPTIONS.find(o => o.value === globalSearchType) || SEARCH_TYPE_OPTIONS[0];
                          const ActiveIcon = active.icon;
                          return (
                            <>
                              <ActiveIcon className="h-3.5 w-3.5" />
                              <span className="search-type-label">{active.label}</span>
                            </>
                          );
                        })()}
                      </button>
                      {searchTypeMenuOpen && (
                        <>
                          <div className="search-type-backdrop" onClick={() => setSearchTypeMenuOpen(false)} />
                          <div className="search-type-menu card animate-fade-in">
                            {SEARCH_TYPE_OPTIONS.map(opt => {
                              const OptIcon = opt.icon;
                              return (
                                <button
                                  type="button"
                                  key={opt.value}
                                  className={`search-type-item ${globalSearchType === opt.value ? 'active' : ''}`}
                                  onClick={() => { setGlobalSearchType(opt.value); setSearchTypeMenuOpen(false); }}
                                >
                                  <OptIcon className="h-3.5 w-3.5" />
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="input-wrap global-search-input" style={{ flex: 1, minWidth: 0, margin: 0 }}>
                      <Search />
                      <input
                        type="text"
                        value={globalSearchQuery}
                        onChange={(e) => setGlobalSearchQuery(e.target.value)}
                        onFocus={() => setSearchTypeMenuOpen(false)}
                        placeholder={`Search by ${globalSearchType === 'all' ? 'anything' : globalSearchType === 'productType' ? 'product type' : globalSearchType}\u2026`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 relative app-topbar-actions">
                {/* Notification Bell */}
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="icon-btn"
                  style={{ position: 'relative', width: 38, height: 38 }}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--red)', color: '#fff', fontWeight: 800, fontSize: 9, width: 17, height: 17, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--card)' }} className="animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown popup overlay */}
                {showNotifDropdown && (
                  <div className="card animate-fade-in" style={{ position: 'absolute', right: 0, top: 46, width: 'min(320px, calc(100vw - 32px))', padding: 16, zIndex: 9999, textAlign: 'left' }}>
                    <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 10 }}>
                      <h3 style={{ fontSize: 13 }}>Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              for (const n of notifications) {
                                if (!n.isRead) {
                                  if (user.role === 'SUPER_ADMIN') {
                                    await api.markSuperNotificationRead(n.id);
                                  } else {
                                    await api.markNotificationRead(n.id);
                                  }
                                }
                              }
                              fetchNotifications();
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12, padding: '24px 0' }}>No notifications found</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={async () => {
                              try {
                                if (user.role === 'SUPER_ADMIN') {
                                  await api.markSuperNotificationRead(n.id);
                                } else {
                                  await api.markNotificationRead(n.id);
                                }
                                fetchNotifications();
                                if (n.type === 'SHOP_REGISTRATION' && user.role === 'SUPER_ADMIN') {
                                  setActiveTab('shops');
                                }
                                setShowNotifDropdown(false);
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            style={{
                              padding: 10, borderRadius: 13, cursor: 'pointer', fontSize: 11.5, transition: 'background .18s ease',
                              background: !n.isRead ? 'var(--gold-dim)' : 'var(--card-2)',
                              border: `1px solid ${!n.isRead ? 'rgba(240,185,11,0.25)' : 'var(--border-2)'}`
                            }}
                          >
                            <div className="flex justify-between items-start" style={{ marginBottom: 3, fontWeight: 700, color: 'var(--text-0)' }}>
                              <span>{n.title}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'monospace', fontWeight: 400 }}>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={{ color: 'var(--text-2)', fontSize: 10.5, lineHeight: 1.5 }}>{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <span className="avatar">{(user.name || 'U').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
              </div>
            </header>

            {activeTab === 'dashboard' && <DashboardView t={t} setActiveTab={setActiveTab} setAutoOpenShopModal={setAutoOpenShopModal} />}
            {activeTab === 'shops' && <ShopsManagementView t={t} api={api} initiallyOpenAddModal={autoOpenShopModal} onCloseInitiallyOpen={() => setAutoOpenShopModal(false)} />}
            {activeTab === 'super-customers' && <SuperCustomersView t={t} api={api} searchDispatch={activeTab === 'super-customers' ? searchDispatch : null} />}
            {activeTab === 'keys' && <KeysCatalogView t={t} api={api} searchDispatch={activeTab === 'keys' ? searchDispatch : null} />}
            {activeTab === 'pricing-offers' && <PricingOffersView t={t} api={api} />}
            {activeTab === 'revenue' && <RevenueManagementView t={t} api={api} />}
            {activeTab === 'promotions' && <PromotionsView t={t} api={api} user={user} searchDispatch={activeTab === 'promotions' ? searchDispatch : null} />}
            {activeTab === 'search-keys' && <KeysSearchView t={t} api={api} searchDispatch={activeTab === 'search-keys' ? searchDispatch : null} />}
            {activeTab === 'register' && <CustomerRegistrationWizard t={t} api={api} />}
            {activeTab === 'history' && <CustomerHistoryView t={t} api={api} searchDispatch={activeTab === 'history' ? searchDispatch : null} />}
            {activeTab === 'reports' && <ReportsPortalView t={t} api={api} />}
            {activeTab === 'customer-care' && <CustomerCareView t={t} api={api} />}
            {activeTab === 'support-config' && <SupportConfigView t={t} api={api} />}
            {activeTab === 'settings' && <ShopSettingsView t={t} api={api} />}
          </main>

          {/* Mobile Bottom Navigation Bar (mobile only) */}
          <nav className="mobile-bottom-nav md:hidden">
            <button
              className={`mbn-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setMobileNavOpen(false); }}
            >
              <Home />
              <span>Dashboard</span>
            </button>
            <button
              className={`mbn-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('settings'); setMobileNavOpen(false); }}
            >
              <User />
              <span>Account</span>
            </button>
            <button
              className="mbn-item"
              onClick={() => setShowLangDialog(true)}
            >
              <Languages />
              <span>Language</span>
            </button>
            <button
              className={`mbn-item ${activeTab === 'customer-care' ? 'active' : ''}`}
              onClick={() => { setActiveTab('customer-care'); setMobileNavOpen(false); }}
            >
              <LifeBuoy />
              <span>Customer Service</span>
            </button>
          </nav>

          {/* Language selection dialog (center-screen modal) */}
          {showLangDialog && createPortal(
            <div
              className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center p-4"
              style={{ background: 'rgba(5,4,3,0.72)' }}
              onClick={() => setShowLangDialog(false)}
            >
              <div
                ref={langDialogCardRef}
                className="card animate-fade-in"
                style={{ width: '100%', maxWidth: 340, padding: 24, position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowLangDialog(false)}
                  className="icon-btn"
                  style={{ position: 'absolute', top: 16, right: 16 }}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex flex-col items-center mb-5" style={{ textAlign: 'center' }}>
                  <div className="icon-badge solid" style={{ marginBottom: 10 }}><Languages /></div>
                  <h2 style={{ fontSize: 17 }}>Choose Language</h2>
                  <p style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Select your preferred language for the app</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'Hindi (हिन्दी)' },
                    { code: 'ta', label: 'Tamil (தமிழ்)' },
                    { code: 'te', label: 'Telugu (తెలుగు)' },
                    { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
                    { code: 'ml', label: 'Malayalam (മലയാളം)' },
                  ].map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); localStorage.setItem('kee_lang', l.code); setShowLangDialog(false); }}
                      className={`lang-option-btn ${lang === l.code ? 'active' : ''}`}
                    >
                      <span>{l.label}</span>
                      {lang === l.code && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}
    </>
  );
}

// ============================================================================
// COMPONENT 1: DASHBOARD VIEW WITH INTERACTIVE CARD DETAILS
// ============================================================================
function DashboardView({ t, setActiveTab, setAutoOpenShopModal }) {
  const { user, api } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDetail, setActiveDetail] = useState(null); // Interactive details drawer
  const [activePopupAd, setActivePopupAd] = useState(null);

  useEffect(() => {
    if (activePopupAd) {
      const timer = setTimeout(() => {
        sessionStorage.setItem(`dismissed_ad_${activePopupAd.id}`, 'true');
        setActivePopupAd(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [activePopupAd]);

  useEffect(() => {
    fetchDashboardData();
    if (user.role === 'SHOP_ADMIN') {
      fetchPopupAds();
    }
  }, [user]);

  const fetchPopupAds = async () => {
    try {
      const ads = await api.getAdvertisements();
      const popups = ads.filter(ad => ad.type === 'POPUP');
      if (popups.length > 0) {
        const sorted = popups.sort((a, b) => b.priority - a.priority);
        const dismissed = sessionStorage.getItem(`dismissed_ad_${sorted[0].id}`);
        if (!dismissed) {
          setActivePopupAd(sorted[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch advertisements for popup', e);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 260 }}>
        <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading dashboard…</span>
      </div>
    );
  }

  const toggleDetail = (card) => {
    setActiveDetail(activeDetail === card ? null : card);
  };

  if (user.role === 'SUPER_ADMIN') {
    const totalRevenue = data.revenue.reduce((acc, r) => acc + r.amount, 0) + (data.subscriptionRevenue || 0);
    return (
      <div className="animate-fade-in">
        <div className="page-head">
          <div>
            <div className="eyebrow"><Shield /> Super Admin Control</div>
            <h1>Welcome back, {(user.name || 'Admin').split(' ')[0]} 👋</h1>
            <p>{t('superAdmin')} Portal — platform overview across every tenant shop. Click a card to drill in.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={fetchDashboardData} className="icon-btn" title="Refresh">
              <RefreshCw />
            </button>
            <button
              onClick={() => {
                setAutoOpenShopModal(true);
                setActiveTab('shops');
              }}
              className="btn btn-primary"
            >
              <Plus />
              <span>{t('provisionNewShop')}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid with Expandable Interactions */}
        <div className="stat-grid">
          <div
            onClick={() => toggleDetail('shops')}
            className="stat-card"
            style={{ animationDelay: '0.05s', cursor: 'pointer', ...(activeDetail === 'shops' ? { borderColor: 'rgba(240,185,11,0.5)' } : {}) }}
          >
            <div className="stat-top">
              <div className="icon-badge"><Layers /></div>
              <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-3)', transform: activeDetail === 'shops' ? 'rotate(90deg)' : 'none', transition: 'transform .2s ease' }} />
            </div>
            <div className="stat-num"><CountUp value={data.shops.total} /></div>
            <div className="stat-label">{t('shopsRegistered')}</div>
          </div>

          <div
            onClick={() => toggleDetail('customers')}
            className="stat-card"
            style={{ animationDelay: '0.15s', cursor: 'pointer', ...(activeDetail === 'customers' ? { borderColor: 'rgba(240,185,11,0.5)' } : {}) }}
          >
            <div className="stat-top">
              <div className="icon-badge green"><Users /></div>
              <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-3)', transform: activeDetail === 'customers' ? 'rotate(90deg)' : 'none', transition: 'transform .2s ease' }} />
            </div>
            <div className="stat-num"><CountUp value={data.stats.customers} /></div>
            <div className="stat-label">{t('complianceRegistry')}</div>
          </div>

          <div
            onClick={() => toggleDetail('storage')}
            className="stat-card"
            style={{ animationDelay: '0.25s', cursor: 'pointer', ...(activeDetail === 'storage' ? { borderColor: 'rgba(240,185,11,0.5)' } : {}) }}
          >
            <div className="stat-top">
              <div className="icon-badge"><HardDrive /></div>
              <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-3)', transform: activeDetail === 'storage' ? 'rotate(90deg)' : 'none', transition: 'transform .2s ease' }} />
            </div>
            <div className="stat-num"><CountUp value={data.stats.storageUsed / (1024 * 1024)} decimals={2} suffix=" MB" /></div>
            <div className="stat-label">{t('hostStorage')}</div>
          </div>

          <div
            onClick={() => toggleDetail('revenue')}
            className="stat-card"
            style={{ animationDelay: '0.35s', cursor: 'pointer', ...(activeDetail === 'revenue' ? { borderColor: 'rgba(240,185,11,0.5)' } : {}) }}
          >
            <div className="stat-top">
              <div className="icon-badge green"><IndianRupee /></div>
              <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-3)', transform: activeDetail === 'revenue' ? 'rotate(90deg)' : 'none', transition: 'transform .2s ease' }} />
            </div>
            <div className="stat-num"><CountUp value={totalRevenue} decimals={2} prefix="Rs. " /></div>
            <div className="stat-label">{t('annualRevenue')}</div>
          </div>
        </div>

        {/* Expandable Interactions Section */}
        {activeDetail && (
          <div className="card animate-fade-in" style={{ marginBottom: 28, borderColor: 'rgba(240,185,11,0.3)' }}>
            <div className="section-title">
              <h2 style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info style={{ width: 16, height: 16, color: 'var(--gold)' }} />
                Interactive Summary: {activeDetail}
              </h2>
              <button onClick={() => setActiveDetail(null)} className="icon-btn"><X /></button>
            </div>

            {activeDetail === 'shops' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="loc-box">
                  <div className="loc-info">
                    <div className="icon-badge green"><BadgeCheck /></div>
                    <div className="loc-text">
                      <div className="t1">{data.shops.active} Shops</div>
                      <div className="t2">Active tiers</div>
                    </div>
                  </div>
                </div>
                <div className="loc-box">
                  <div className="loc-info">
                    <div className="icon-badge red"><X /></div>
                    <div className="loc-text">
                      <div className="t1">{data.shops.inactive} Shops</div>
                      <div className="t2">Suspended tiers</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDetail === 'customers' && (
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 600, lineHeight: 1.6 }}>
                <p>Compliance entries are indexed and secured using AES-256 application-level encryption.</p>
                <p style={{ marginTop: 6 }}>Average transaction rate: <b style={{ color: 'var(--text-0)' }}>{(data.stats.customers / 30).toFixed(1)} / day</b></p>
              </div>
            )}

            {activeDetail === 'storage' && (
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 600 }}>
                <p>Disk Pool Size: <b style={{ color: 'var(--text-0)' }}>100 GB</b></p>
                <p style={{ marginTop: 4 }}>Total Used: <b style={{ color: 'var(--gold)' }}>{(data.stats.storageUsed / (1024 * 1024)).toFixed(2)} MB</b></p>
                <div style={{ width: '100%', background: 'var(--card-2)', height: 8, borderRadius: 999, overflow: 'hidden', marginTop: 10 }}>
                  <div style={{ background: 'var(--gold)', height: '100%', width: '0.8%' }}></div>
                </div>
              </div>
            )}

            {activeDetail === 'revenue' && (
              <div>
                <div className="loc-box" style={{ marginBottom: 14 }}>
                  <div className="loc-info">
                    <div className="icon-badge green"><Wallet /></div>
                    <div className="loc-text">
                      <div className="t1">Rs. {data.subscriptionRevenue || 0}</div>
                      <div className="t2">Total subscription collections</div>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  Manual revenue records split
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                  {data.revenue.map(r => (
                    <div key={r.id} style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', borderRadius: 12, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>
                      <span>M{r.month}/{r.year}</span>
                      <span style={{ color: 'var(--green)', fontWeight: 800 }}>Rs. {r.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid-2">
          <div className="card chart-card">
            <div className="section-title">
              <h2>Platform-Wide Key Popularity</h2>
              <span className="sub">Top duplicate key numbers cut across all shops</span>
            </div>
            {data.popularKeys.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontWeight: 600 }}>
                No key blank transactions logged yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.popularKeys.map((k) => (
                  <div key={k.keyNumber}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-1)' }}>{k.keyNumber}</span>
                      <span style={{ color: 'var(--gold)' }}>{k.count} cuts</span>
                    </div>
                    <div style={{ width: '100%', background: 'var(--card-2)', height: 8, borderRadius: 999, overflow: 'hidden' }}>
                      <div
                        style={{
                          background: 'linear-gradient(90deg, var(--gold), #3730a3)',
                          height: '100%',
                          borderRadius: 999,
                          width: `${(k.count / data.popularKeys[0].count) * 100}%`,
                          transition: 'width 1s cubic-bezier(.2,.7,.3,1)',
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title">
              <h2>Subscriptions Expiring Soon</h2>
              <AlertTriangle style={{ width: 16, height: 16, color: 'var(--gold)' }} className="animate-pulse" />
            </div>
            {data.expiringSubscriptions.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontWeight: 600 }}>
                No active subscriptions expiring in the next 10 days.
              </div>
            ) : (
              <div className="feed">
                {data.expiringSubscriptions.map(s => (
                  <div key={s.id} className="feed-item">
                    <div className="feed-icon"><Calendar /></div>
                    <div style={{ flex: 1 }}>
                      <div className="feed-text"><b>{s.shopName}</b> — {s.plan} plan</div>
                      <div className="feed-time">Ends {new Date(s.endDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // SHOP ADMIN DASHBOARD
  const sub = data.subscription;
  const firstName = (user.name || 'there').split(' ')[0];
  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {data.shop?.logoUrl ? (
            <img src={cleanGoogleImageUrl(data.shop.logoUrl)} alt="Shop Logo" style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', border: '1px solid var(--border-2)' }} />
          ) : (
            <div className="icon-badge solid" style={{ width: 48, height: 48, borderRadius: 14 }}><Store /></div>
          )}
          <div>
            <div className="eyebrow"><Store /> {t('shopTerminal')}</div>
            <h1>Namaste, {firstName} 👋</h1>
            <p>{data.shop ? data.shop.name : `${t('shopTerminal')} Workspace`} — compliance &amp; inventory terminal</p>
          </div>
        </div>
        <div className="dash-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={fetchDashboardData} className="icon-btn" title="Refresh"><RefreshCw /></button>
          <button onClick={() => setActiveTab('register')} className="btn btn-primary">
            <UserPlus />
            <span>Register Customer</span>
          </button>
        </div>
      </div>

      {sub && sub.daysRemaining <= 7 && (
        <div className="card" style={{ marginBottom: 22, borderColor: 'rgba(240,185,11,0.4)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div className="icon-badge"><AlertTriangle /></div>
            <div>
              <p style={{ fontFamily: 'var(--display)', fontWeight: 700, color: 'var(--text-0)', fontSize: 14 }}>Subscription Renewal Required!</p>
              <p style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600, marginTop: 2 }}>
                Your shop subscription expires in <b style={{ color: 'var(--gold)' }}>{sub.daysRemaining} days</b>. Please coordinate renewal with KEE Super Admin.
              </p>
            </div>
          </div>
          <div className="pill-badge">
            <span className="dot"></span>
            {sub.plan} Plan
          </div>
        </div>
      )}

      {/* Shop KPI Cards */}
      <div className="stat-grid three">
        <div
          onClick={() => toggleDetail('today')}
          className="stat-card"
          style={{ animationDelay: '0.05s', cursor: 'pointer', ...(activeDetail === 'today' ? { borderColor: 'rgba(240,185,11,0.5)' } : {}) }}
        >
          <div className="stat-top">
            <div className="icon-badge green"><UserPlus /></div>
            <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-3)', transform: activeDetail === 'today' ? 'rotate(90deg)' : 'none', transition: 'transform .2s ease' }} />
          </div>
          <div className="stat-num"><CountUp value={data.todayCustomers} /></div>
          <div className="stat-label">Today's Registrations</div>
        </div>

        <div
          onClick={() => toggleDetail('total')}
          className="stat-card"
          style={{ animationDelay: '0.15s', cursor: 'pointer', ...(activeDetail === 'total' ? { borderColor: 'rgba(240,185,11,0.5)' } : {}) }}
        >
          <div className="stat-top">
            <div className="icon-badge"><Users /></div>
            <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-3)', transform: activeDetail === 'total' ? 'rotate(90deg)' : 'none', transition: 'transform .2s ease' }} />
          </div>
          <div className="stat-num"><CountUp value={data.totalCustomers} /></div>
          <div className="stat-label">Total Customers</div>
        </div>

        <div
          onClick={() => toggleDetail('subscription')}
          className="stat-card"
          style={{ animationDelay: '0.25s', cursor: 'pointer', ...(activeDetail === 'subscription' ? { borderColor: 'rgba(240,185,11,0.5)' } : {}) }}
        >
          <div className="stat-top">
            <div className="icon-badge"><ShieldCheck /></div>
            <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-3)', transform: activeDetail === 'subscription' ? 'rotate(90deg)' : 'none', transition: 'transform .2s ease' }} />
          </div>
          <div className="stat-num" style={{ fontSize: 22 }}>{sub ? sub.plan : 'No Active Plan'}</div>
          <div className="stat-label">Terminal Subscription</div>
        </div>
      </div>

      {/* Expandable Details Box */}
      {activeDetail && (
        <div className="card animate-fade-in" style={{ marginBottom: 28, borderColor: 'rgba(240,185,11,0.3)' }}>
          <div className="section-title">
            <h2 style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info style={{ width: 16, height: 16, color: 'var(--gold)' }} />
              Workspace Info: {activeDetail}
            </h2>
            <button onClick={() => setActiveDetail(null)} className="icon-btn"><X /></button>
          </div>

          {activeDetail === 'today' && (
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 600 }}>
              Compliance entries submitted today: <b style={{ color: 'var(--text-0)' }}>{data.todayCustomers} records</b>.
            </p>
          )}
          {activeDetail === 'total' && (
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 600 }}>
              Lifetime duplicate key compliance logs recorded at this terminal: <b style={{ color: 'var(--text-0)' }}>{data.totalCustomers} entries</b>.
            </p>
          )}
          {activeDetail === 'subscription' && sub && (
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 600 }}>
              Subscription expires on <b style={{ color: 'var(--text-0)' }}>{new Date(sub.endDate).toLocaleDateString()}</b> ({sub.daysRemaining} days remaining).
            </p>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="qa-btn" onClick={() => setActiveTab('register')}>
          <div className="icon-badge"><UserPlus /></div>
          <div>
            <span>New Customer</span>
            <small>Register a compliance entry</small>
          </div>
        </button>
        <button className="qa-btn" onClick={() => setActiveTab('search-keys')}>
          <div className="icon-badge"><Search /></div>
          <div>
            <span>Search Keys</span>
            <small>Find a duplicate key record</small>
          </div>
        </button>
        <button className="qa-btn" onClick={() => setActiveTab('promotions')}>
          <div className="icon-badge"><Megaphone /></div>
          <div>
            <span>Inventory</span>
            <small>Browse inventory products</small>
          </div>
        </button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">
            <h2>Recent Compliance Registrations</h2>
          </div>
          {data.recentCustomers.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontWeight: 600 }}>
              No customers logged yet. Click "New Customer" above to start.
            </div>
          ) : (
            <div>
              {data.recentCustomers.map(c => (
                <div key={c.id} className="cust-item">
                  <div className="cust-avatar">{c.name?.charAt(0)?.toUpperCase() || '?'}</div>
                  <div className="cust-info">
                    <div className="name">{c.name}</div>
                    <div className="meta">{c.phone} • Key: {c.keyNumber}</div>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-3)', fontWeight: 700, fontSize: 11.5 }}>
                    <Clock style={{ width: 12, height: 12 }} />
                    {new Date(c.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card chart-card">
          <div className="section-title">
            <h2>Registration Trend</h2>
            <div className="chart-legend">
              <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--gold)' }}></span> Last 6 months</div>
            </div>
          </div>
          {!data.monthlyStats || data.monthlyStats.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontWeight: 600 }}>
              No registration history logged yet.
            </div>
          ) : (
            <div>
              <div style={{ height: 160, width: '100%', position: 'relative' }}>
                {/* SVG Line Graph */}
                <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

                  {/* Draw Line and Dots */}
                  {(() => {
                    const stats = data.monthlyStats;
                    const maxCount = Math.max(...stats.map(s => s.count), 5);
                    const points = stats.map((s, idx) => {
                      const x = (idx / (stats.length - 1)) * 500;
                      // Height scaling from 10 to 140 (160 is total height, keeping 10 margin top/bottom)
                      const y = 150 - (s.count / maxCount) * 110;
                      return { x, y, count: s.count };
                    });

                    const pathD = points.reduce((acc, p, idx) => {
                      return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
                    }, '');

                    const areaD = points.reduce((acc, p, idx) => {
                      return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
                    }, '') + ` L 500 150 L 0 150 Z`;

                    return (
                      <>
                        {/* Area under line */}
                        <path d={areaD} fill="url(#lineGradient)" className="chart-area-fade" />

                        {/* Line path */}
                        <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line-draw" />

                        {/* Data Points */}
                        {points.map((p, idx) => (
                          <g key={idx} className="group cursor-pointer">
                            <circle cx={p.x} cy={p.y} r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" className="chart-dot-pop transition hover:r-6" style={{ animationDelay: `${0.6 + idx * 0.08}s` }} />
                            <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#7c3aed" fontSize="9" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition duration-200">
                              {p.count}
                            </text>
                          </g>
                        ))}

                        <defs>
                          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Month Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', padding: '10px 4px 0' }}>
                {data.monthlyStats.map(s => (
                  <span key={s.month}>{s.month.split(' ')[0]}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Announcement Popup Modal */}
      {activePopupAd && createPortal(
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center items-center p-4 md:p-10">
          <div className="card animate-fade-in" style={{ width: 'clamp(320px, 60vw, 680px)', padding: 0, overflow: 'hidden', margin: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative' }}>
              <img src={cleanGoogleImageUrl(activePopupAd.imageUrl)} alt={activePopupAd.title} style={{ width: '100%', height: 240, objectFit: 'cover', opacity: 0.9 }} />
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <button
                  onClick={() => {
                    sessionStorage.setItem(`dismissed_ad_${activePopupAd.id}`, 'true');
                    setActivePopupAd(null);
                  }}
                  className="icon-btn"
                  style={{ background: 'rgba(10,9,8,0.6)' }}
                >
                  <X />
                </button>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, background: 'linear-gradient(to top, var(--card), transparent)' }}></div>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}>
                <Sparkles style={{ width: 11, height: 11 }} /> Featured Announcement
              </span>
              <h3 style={{ fontSize: 17 }}>{activePopupAd.title}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600, lineHeight: 1.5 }}>
                Special promotion from KEE Headquarters for duplicate key shop workspaces. Upgrade inventory stock or log compliance checks to qualify.
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    sessionStorage.setItem(`dismissed_ad_${activePopupAd.id}`, 'true');
                    setActivePopupAd(null);
                  }}
                  className="btn btn-ghost btn-block"
                >
                  Dismiss Offer
                </button>
                <button
                  onClick={() => {
                    sessionStorage.setItem(`dismissed_ad_${activePopupAd.id}`, 'true');
                    setActivePopupAd(null);
                    setActiveTab('promotions');
                  }}
                  className="btn btn-primary btn-block"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT 2: SHOPS MANAGEMENT WITH OPTIMIZED CENTERED FIXED DIALOG
// ============================================================================
function ShopsManagementView({ t, api, initiallyOpenAddModal, onCloseInitiallyOpen }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  // Client-side live search - the full shop list is already fetched in one
  // call, so filtering happens instantly on every keystroke with no round-trip.
  const [shopSearchQuery, setShopSearchQuery] = useState('');

  useEffect(() => {
    if (initiallyOpenAddModal) {
      setShowAddModal(true);
      if (onCloseInitiallyOpen) onCloseInitiallyOpen();
    }
  }, [initiallyOpenAddModal]);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Edit shop profile
  const [selectedShop, setSelectedShop] = useState(null);

  // Form States for Add Shop
  const [shopName, setShopName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [subPlan, setSubPlan] = useState('MONTHLY');
  const [subEndDate, setSubEndDate] = useState('');
  const [provisionPhone, setProvisionPhone] = useState('');
  const [provisionWhatsapp, setProvisionWhatsapp] = useState('');
  const [provisionLocation, setProvisionLocation] = useState('');
  const [provisionSameAsPhone, setProvisionSameAsPhone] = useState(false);
  const [provisionShopPhoto, setProvisionShopPhoto] = useState('');
  const [provisionShopLicense, setProvisionShopLicense] = useState('');
  const [provisionOwnerAadhaar, setProvisionOwnerAadhaar] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form States for Edit Shop Details (Super Admin capability)
  const [editName, setEditName] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editGst, setEditGst] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editShopPhoto, setEditShopPhoto] = useState('');
  const [editShopLicense, setEditShopLicense] = useState('');
  const [editOwnerAadhaar, setEditOwnerAadhaar] = useState('');

  // Form States for Subscription management
  const [newPlan, setNewPlan] = useState('MONTHLY');
  const [newEndDate, setNewEndDate] = useState('');

  // Plan Prices configuration loaded from system settings
  const [planPrices, setPlanPrices] = useState({ MONTHLY: 49, HALF_YEARLY: 269, YEARLY: 499 });

  // Payment integration states for new shop provision
  const [showPaymentProvisionModal, setShowPaymentProvisionModal] = useState(false);
  const [provisionDto, setProvisionDto] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processingLog, setProcessingLog] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const fetchPlanPrices = async () => {
    try {
      const res = await api.getPlanPrices();
      setPlanPrices(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchShops();
    fetchPlanPrices();
  }, []);

  // Automatic End Date Updater for Shop Creation Form
  useEffect(() => {
    const calculateEndDate = () => {
      const now = new Date();
      if (subPlan === 'MONTHLY') {
        now.setMonth(now.getMonth() + 1);
      } else if (subPlan === 'HALF_YEARLY') {
        now.setMonth(now.getMonth() + 6);
      } else if (subPlan === 'YEARLY') {
        now.setFullYear(now.getFullYear() + 1);
      }
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      setSubEndDate(`${yyyy}-${mm}-${dd}`);
    };
    calculateEndDate();
  }, [subPlan]);

  // Automatic End Date Updater for Plan Updates Form
  useEffect(() => {
    const calculateNewEndDate = () => {
      const now = new Date();
      if (newPlan === 'MONTHLY') {
        now.setMonth(now.getMonth() + 1);
      } else if (newPlan === 'HALF_YEARLY') {
        now.setMonth(now.getMonth() + 6);
      } else if (newPlan === 'YEARLY') {
        now.setFullYear(now.getFullYear() + 1);
      }
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      setNewEndDate(`${yyyy}-${mm}-${dd}`);
    };
    calculateNewEndDate();
  }, [newPlan]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await api.getShops();
      setShops(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const executeShopCreation = async (dto) => {
    try {
      await api.createShop(dto);
      setShowAddModal(false);
      resetAddForm();
      fetchShops();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create key shop. Try again.');
      throw err;
    }
  };

  const handleCreateShopSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!PHONE_REGEX.test(provisionPhone)) {
        alert(`Phone number: ${PHONE_REGEX_MESSAGE}`);
        return;
      }
      if (provisionWhatsapp && !PHONE_REGEX.test(provisionWhatsapp)) {
        alert(`WhatsApp number: ${PHONE_REGEX_MESSAGE}`);
        return;
      }

      if (!provisionOwnerAadhaar) {
        alert('Owner Aadhaar document is mandatory to provision a shop workspace.');
        return;
      }

      const formattedEndDate = new Date(subEndDate).toISOString();
      // Verification documents are NOT embedded in companyDetails anymore -
      // they're sent as separate top-level DTO fields and persisted by the
      // backend as real files + ShopDocument rows (see
      // ShopService.createShop / persistShopDocuments).
      const companyDetails = JSON.stringify({
        address: provisionLocation,
        gst: 'Pending',
        phone: provisionPhone,
        whatsappNumber: provisionWhatsapp,
      });
      const dto = {
        name: shopName,
        adminEmail,
        adminName,
        adminPassword,
        plan: subPlan,
        endDate: formattedEndDate,
        companyDetails,
        themeColor: '#4f46e5',
        shopPhoto: provisionShopPhoto,
        shopLicense: provisionShopLicense,
        ownerAadhaar: provisionOwnerAadhaar
      };

      const price = planPrices[subPlan] ?? 0;
      if (price > 0) {
        setProvisionDto(dto);
        setShowPaymentProvisionModal(true);
        setPaymentSuccess(false);
        setPaymentProcessing(false);
        setProcessingLog('');
      } else {
        await executeShopCreation(dto);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initialize subscription checkout. Try again.');
    }
  };

  const executePaymentProvision = async (e) => {
    e.preventDefault();
    setPaymentProcessing(true);

    const logs = [
      'Establishing secure end-to-end sandbox tunnel...',
      'Verifying account balance & credit lines...',
      'Authorizing subscription escrow settlement transaction...',
      'Encrypting card details via AES-GCM...',
      'Fulfilling KEE API workspace provisioning...'
    ];

    for (let i = 0; i < logs.length; i++) {
      setProcessingLog(logs[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      await executeShopCreation(provisionDto);
      setPaymentProcessing(false);
      setPaymentSuccess(true);
    } catch (err) {
      setPaymentProcessing(false);
      alert(`Payment failed: ${err.message}`);
    }
  };

  const resetAddForm = () => {
    setShopName('');
    setAdminEmail('');
    setAdminName('');
    setAdminPassword('');
    setSubPlan('MONTHLY');
    setSubEndDate('');
    setProvisionPhone('');
    setProvisionWhatsapp('');
    setProvisionLocation('');
    setProvisionSameAsPhone(false);
    setProvisionShopPhoto('');
    setProvisionShopLicense('');
    setProvisionOwnerAadhaar('');
    setErrorMsg('');
  };

  const toggleShopStatus = async (shop) => {
    try {
      await api.suspendShop(shop.id, !shop.isActive);
      fetchShops();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUpdateSubscriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateSubscription(selectedShop.id, {
        plan: newPlan,
        status: 'ACTIVE',
        startDate: new Date().toISOString(),
        endDate: new Date(newEndDate).toISOString()
      });
      setShowSubModal(false);
      fetchShops();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEditShopClick = (shop) => {
    setSelectedShop(shop);
    setEditName(shop.name);
    setEditLogoUrl(shop.logoUrl || '');

    if (shop.companyDetails) {
      try {
        const details = JSON.parse(shop.companyDetails);
        setEditAddress(details.address || '');
        setEditGst(details.gst || '');
        setEditPhone(details.phone || '');
      } catch (err) {
        setEditAddress('');
        setEditGst('');
        setEditPhone('');
      }
    } else {
      setEditAddress('');
      setEditGst('');
      setEditPhone('');
    }

    // Verification documents are read-only in this modal (review/download
    // only - no re-upload here) and now come from the relational
    // ShopDocument table (shop.documents), not companyDetails JSON.
    const findDocUrl = (documentType) => {
      const doc = (shop.documents || []).find((d) => d.documentType === documentType);
      return doc ? doc.fileUrl : '';
    };
    setEditShopPhoto(findDocUrl('SHOP_PHOTO'));
    setEditShopLicense(findDocUrl('SHOP_LICENSE'));
    setEditOwnerAadhaar(findDocUrl('OWNER_AADHAAR'));

    setShowEditModal(true);
  };

  const handleEditShopSubmit = async (e) => {
    e.preventDefault();
    if (!PHONE_REGEX.test(editPhone)) {
      alert(PHONE_REGEX_MESSAGE);
      return;
    }
    try {
      // Verification documents are managed separately (relational
      // ShopDocument table) and aren't editable from this form - only
      // address/phone metadata is persisted here.
      const companyDetails = JSON.stringify({
        address: editAddress,
        phone: editPhone,
      });

      await api.updateShop(selectedShop.id, {
        name: editName,
        logoUrl: editLogoUrl,
        companyDetails
      });
      setShowEditModal(false);
      fetchShops();
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Layers /> Platform Operations</div>
          <h1>{t('shops')}</h1>
          <p>Provision, monitor and manage every key shop workspace on the Kee platform.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus />
          <span>Provision New Shop</span>
        </button>
      </div>

      {/* Search box stays mounted regardless of loading/results state so it
          never loses focus while typing. Filtering is instant/client-side
          (partial, case-insensitive match) since the whole shop list is
          already in memory. */}
      <div className="card table-card">
        <div className="table-head">
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 17 }}>
            All Shops <span style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: 13 }}>({shops.length})</span>
          </h2>
          <div className="search-box">
            <Search />
            <input
              type="text" value={shopSearchQuery} onChange={(e) => setShopSearchQuery(e.target.value)}
              placeholder="Search by shop name, admin name, or email&hellip;"
            />
          </div>
        </div>

        {(() => {
          const q = shopSearchQuery.trim().toLowerCase();
          const filteredShops = !q ? shops : shops.filter(s =>
            (s.name || '').toLowerCase().includes(q) ||
            (s.users?.[0]?.name || '').toLowerCase().includes(q) ||
            (s.users?.[0]?.email || '').toLowerCase().includes(q)
          );

          if (loading) {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 200 }}>
                <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading shop registry…</span>
              </div>
            );
          }

          if (filteredShops.length === 0) {
            return (
              <p style={{ padding: 24, fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 }}>
                {shops.length === 0
                  ? 'No shop workspaces provisioned yet. Use "Provision New Shop" to onboard your first tenant.'
                  : 'No shop workspaces match this search.'}
              </p>
            );
          }

          return (
          <table className="kee-table">
            <thead>
              <tr>
                <th>Shop Details</th>
                <th>Admin Contact</th>
                <th>Active Plan</th>
                <th>Valid Until</th>
                <th>Disk Storage</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="cell-primary">{s.name}</div>
                    <div className="cell-sub">ID: {s.id}</div>
                  </td>
                  <td>
                    <div className="cell-primary" style={{ fontSize: 13 }}>{s.users?.[0]?.name || 'N/A'}</div>
                    <div className="cell-sub">{s.users?.[0]?.email || ''}</div>
                  </td>
                  <td>
                    <span className="badge badge-gold"><span className="dot" />{s.subscriptions?.[0]?.plan || 'N/A'}</span>
                  </td>
                  <td className="cell-sub" style={{ fontWeight: 700, color: 'var(--text-2)' }}>
                    {s.subscriptions?.[0]?.endDate ? new Date(s.subscriptions[0].endDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="cell-sub" style={{ fontWeight: 700, color: 'var(--text-2)' }}>
                    {(Number(s.storageUsed || 0) / (1024 * 1024)).toFixed(2)} MB
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => toggleShopStatus(s)}
                      title="Toggle shop active status"
                      className={`badge ${s.isActive ? 'badge-active' : 'badge-suspended'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      <span className="dot" />{s.isActive ? 'Active' : 'Suspended'}
                    </button>
                  </td>
                  <td>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleEditShopClick(s)}
                        className="icon-btn"
                        title="Edit Workspace"
                      >
                        <Settings />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedShop(s);
                          setNewPlan(s.subscriptions?.[0]?.plan || 'MONTHLY');
                          setShowSubModal(true);
                        }}
                        className="icon-btn"
                        title="Manage Plan"
                      >
                        <DollarSign />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          );
        })()}
      </div>

      {showAddModal && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10" style={{ background: 'rgba(5,4,3,0.82)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 640, margin: 'auto', padding: 28 }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><Layers /> Shop Onboarding</span>
                <h2 style={{ fontSize: 19 }}>Provision New Shop Workspace</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', gap: 8, background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.35)', padding: 10, borderRadius: 12, fontSize: 12, color: '#b91c1c', fontWeight: 600, marginBottom: 16 }}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateShopSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Shop Name</label>
                  <div className="input-wrap">
                    <Store />
                    <input
                      type="text" required value={shopName} onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Apex Duplicate Keys"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Admin Full Name</label>
                  <div className="input-wrap">
                    <User />
                    <input
                      type="text" required value={adminName} onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Admin Email</label>
                  <div className="input-wrap">
                    <Mail />
                    <input
                      type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="e.g. admin@apexkeys.com"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Initial Password</label>
                  <div className="input-wrap">
                    <Lock />
                    <input
                      type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="e.g. apexpassword123"
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Phone Number</label>
                  <div className="input-wrap">
                    <Phone />
                    <input
                      type="tel" required value={provisionPhone} onChange={(e) => setProvisionPhone(e.target.value)}
                      placeholder="e.g. +91 99999 99999"
                    />
                  </div>
                </div>
                <div className="field">
                  <div className="flex justify-between items-center mb-2">
                    <label style={{ marginBottom: 0 }}>WhatsApp Number</label>
                    <label className="flex items-center gap-1 cursor-pointer select-none" style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 800 }}>
                      <input
                        type="checkbox" checked={provisionSameAsPhone}
                        onChange={(e) => {
                          setProvisionSameAsPhone(e.target.checked);
                          if (e.target.checked) setProvisionWhatsapp(provisionPhone);
                        }}
                        style={{ accentColor: 'var(--gold)', width: 13, height: 13 }}
                      />
                      <span>Same as Phone</span>
                    </label>
                  </div>
                  <div className="input-wrap">
                    <Phone />
                    <input
                      type="tel" required value={provisionWhatsapp} onChange={(e) => setProvisionWhatsapp(e.target.value)}
                      disabled={provisionSameAsPhone} placeholder="WhatsApp Number"
                      style={{ opacity: provisionSameAsPhone ? 0.5 : 1 }}
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Shop Address / Location</label>
                <div className="input-wrap">
                  <MapPin />
                  <input
                    type="text" required value={provisionLocation} onChange={(e) => setProvisionLocation(e.target.value)}
                    placeholder="e.g. Metro Station Road, Sector 5"
                  />
                </div>
              </div>

              <div className="form-grid" style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                <div className="field">
                  <label>Subscription Plan</label>
                  <select
                    className="sel"
                    value={subPlan} onChange={(e) => setSubPlan(e.target.value)}
                  >
                    <option value="MONTHLY">Monthly Plan • Rs. {planPrices.MONTHLY}/mo</option>
                    <option value="HALF_YEARLY">6-Month Plan • Rs. {planPrices.HALF_YEARLY}/6mo</option>
                    <option value="YEARLY">Yearly Plan • Rs. {planPrices.YEARLY}/yr</option>
                  </select>
                </div>
                <div className="field">
                  <label>End Date (Validity)</label>
                  <input
                    type="date" required value={subEndDate} disabled
                    style={{ width: '100%', background: 'var(--card-2)', opacity: 0.6, border: '1.5px solid var(--border-2)', color: 'var(--text-2)', borderRadius: 13, padding: '13px 15px', fontSize: 14, outline: 'none', cursor: 'not-allowed' }}
                  />
                  <span className="cell-sub" style={{ display: 'block', marginTop: 6 }}>Auto-calculated based on selected tier</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                <label className="eyebrow" style={{ marginBottom: 12 }}><UploadCloud /> Upload Shop Documents</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Shop Photo</label>
                    <input
                      type="file" accept="image/*" required
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const r = new FileReader();
                          r.onloadend = () => compressBase64Image(r.result, setProvisionShopPhoto);
                          r.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs cursor-pointer file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase"
                      style={{ color: 'var(--text-3)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Shop License</label>
                    <input
                      type="file" accept="image/*,application/pdf" required
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const r = new FileReader();
                          r.onloadend = () => compressBase64Image(r.result, setProvisionShopLicense);
                          r.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs cursor-pointer file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase"
                      style={{ color: 'var(--text-3)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Owner Aadhaar</label>
                    <input
                      type="file" accept="image/*,application/pdf" required
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const r = new FileReader();
                          r.onloadend = () => compressBase64Image(r.result, setProvisionOwnerAadhaar);
                          r.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs cursor-pointer file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase"
                      style={{ color: 'var(--text-3)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Footer with CTA buttons */}
              <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                <button
                  type="button" onClick={() => setShowAddModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showEditModal && selectedShop && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10" style={{ background: 'rgba(5,4,3,0.82)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 640, margin: 'auto', padding: 28 }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><Settings /> Workspace Settings</span>
                <h2 style={{ fontSize: 19 }}>Edit Shop Workspace Details</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditShopSubmit}>
              <div className="field">
                <label>Workspace Name</label>
                <div className="input-wrap">
                  <Store />
                  <input
                    type="text" required value={editName} onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>Phone Number</label>
                <div className="input-wrap">
                  <Phone />
                  <input
                    type="tel" required value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>Registered Address (Fixed)</label>
                <div className="input-wrap">
                  <MapPin />
                  <input
                    type="text" readOnly value={editAddress}
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="field" style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                <label>Logo URL</label>
                <div className="input-wrap">
                  <ExternalLink />
                  <input
                    type="text" value={editLogoUrl} onChange={(e) => setEditLogoUrl(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                <label className="eyebrow" style={{ marginBottom: 12 }}><FileCheck /> Verification Documents Review</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Shop Photo */}
                  <div style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 10, borderRadius: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Shop Photo</span>
                      {editShopPhoto ? (
                        <div style={{ marginTop: 6, height: 56, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-2)', background: '#000' }}>
                          <img src={getAssetUrl(editShopPhoto)} className="w-full h-full object-cover" alt="Shop Photo Preview" />
                        </div>
                      ) : (
                        <span style={{ fontSize: 9, color: 'var(--text-3)', fontStyle: 'italic', display: 'block', marginTop: 6 }}>Not Uploaded</span>
                      )}
                    </div>
                    {editShopPhoto && (
                      <button
                        type="button"
                        onClick={() => downloadAsset(editShopPhoto, 'shop_photo.png')}
                        className="btn btn-primary btn-sm btn-block"
                        style={{ fontSize: 9, padding: '6px 10px' }}
                      >
                        Download
                      </button>
                    )}
                  </div>

                  {/* Shop License */}
                  <div style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 10, borderRadius: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Shop License</span>
                      {editShopLicense ? (
                        <div style={{ marginTop: 6, height: 56, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-2)', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {(editShopLicense.startsWith('data:application/pdf') || editShopLicense.toLowerCase().endsWith('.pdf')) ? (
                            <FileText style={{ width: 20, height: 20, color: 'var(--red)' }} />
                          ) : (
                            <img src={getAssetUrl(editShopLicense)} className="w-full h-full object-cover" alt="License Preview" />
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 9, color: 'var(--text-3)', fontStyle: 'italic', display: 'block', marginTop: 6 }}>Not Uploaded</span>
                      )}
                    </div>
                    {editShopLicense && (
                      <button
                        type="button"
                        onClick={() => downloadAsset(editShopLicense, 'shop_license.pdf')}
                        className="btn btn-primary btn-sm btn-block"
                        style={{ fontSize: 9, padding: '6px 10px' }}
                      >
                        Download
                      </button>
                    )}
                  </div>

                  {/* Owner Aadhaar */}
                  <div style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 10, borderRadius: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Owner Aadhaar</span>
                      {editOwnerAadhaar ? (
                        <div style={{ marginTop: 6, height: 56, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-2)', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {(editOwnerAadhaar.startsWith('data:application/pdf') || editOwnerAadhaar.toLowerCase().endsWith('.pdf')) ? (
                            <FileText style={{ width: 20, height: 20, color: 'var(--red)' }} />
                          ) : (
                            <img src={getAssetUrl(editOwnerAadhaar)} className="w-full h-full object-cover" alt="Aadhaar Preview" />
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 9, color: 'var(--text-3)', fontStyle: 'italic', display: 'block', marginTop: 6 }}>Not Uploaded</span>
                      )}
                    </div>
                    {editOwnerAadhaar && (
                      <button
                        type="button"
                        onClick={() => downloadAsset(editOwnerAadhaar, 'owner_aadhaar.pdf')}
                        className="btn btn-primary btn-sm btn-block"
                        style={{ fontSize: 9, padding: '6px 10px' }}
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                <button
                  type="button" onClick={() => setShowEditModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Subscription Update Modal */}
      {showSubModal && selectedShop && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10" style={{ background: 'rgba(5,4,3,0.75)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 440, margin: 'auto', padding: 28 }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><DollarSign /> Billing</span>
                <h2 style={{ fontSize: 19 }}>Update Shop Subscription</h2>
              </div>
              <button onClick={() => setShowSubModal(false)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600, background: 'var(--card-2)', padding: 12, borderRadius: 13, border: '1px solid var(--border-2)', marginBottom: 18 }}>
              Target shop: <span style={{ fontWeight: 800, color: 'var(--gold)' }}>{selectedShop.name}</span>
            </div>

            <form onSubmit={handleUpdateSubscriptionSubmit}>
              <div className="field">
                <label>Plan Tier</label>
                <select
                  className="sel"
                  value={newPlan} onChange={(e) => setNewPlan(e.target.value)}
                >
                  <option value="MONTHLY">Monthly Plan • Rs. {planPrices.MONTHLY}/mo</option>
                  <option value="HALF_YEARLY">6-Month Plan • Rs. {planPrices.HALF_YEARLY}/6mo</option>
                  <option value="YEARLY">Yearly Plan • Rs. {planPrices.YEARLY}/yr</option>
                </select>
              </div>

              <div className="field">
                <label>New End Date</label>
                <input
                  type="date" required value={newEndDate} disabled
                  style={{ width: '100%', background: 'var(--card-2)', opacity: 0.6, border: '1.5px solid var(--border-2)', color: 'var(--text-2)', borderRadius: 13, padding: '13px 15px', fontSize: 14, outline: 'none', cursor: 'not-allowed' }}
                />
                <span className="cell-sub" style={{ display: 'block', marginTop: 6 }}>Auto-calculated based on selected tier</span>
              </div>

              <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                <button
                  type="button" onClick={() => setShowSubModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Plan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showPaymentProvisionModal && provisionDto && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10 animate-fade-in" style={{ background: 'rgba(5,4,3,0.9)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 560, margin: 'auto', padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', padding: 20, background: 'var(--card-2)' }}>
              <div className="flex items-center gap-2">
                <div className="icon-badge green"><ShieldCheck /></div>
                <div>
                  <h2 style={{ fontSize: 14 }}>Plan Subscription Escrow Pay</h2>
                  <p style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>Workspace Terminal Provisioning Payment</p>
                </div>
              </div>
              {!paymentProcessing && !paymentSuccess && (
                <button onClick={() => setShowPaymentProvisionModal(false)} className="icon-btn">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Success State */}
            {paymentSuccess ? (
              <div style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <div className="icon-badge green animate-bounce" style={{ width: 64, height: 64, borderRadius: 999 }}>
                  <Check style={{ width: 30, height: 30 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18 }}>Payment Authorized!</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600, maxWidth: 320, margin: '8px auto 0' }}>
                    The subscription payment has settled successfully. Workspace <strong style={{ color: 'var(--text-1)' }}>{provisionDto.name}</strong> is now fully provisioned and activated.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentProvisionModal(false);
                  }}
                  className="btn btn-primary btn-block"
                >
                  Close & Proceed
                </button>
              </div>
            ) : paymentProcessing ? (
              /* Processing State */
              <div style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full" style={{ border: '4px solid var(--gold-dim)' }}></span>
                  <span className="absolute inset-0 rounded-full animate-spin" style={{ border: '4px solid transparent', borderTopColor: 'var(--gold)' }}></span>
                </div>
                <div>
                  <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.05em' }}>Processing Transaction</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, marginTop: 4 }}>Finalizing workspace creation tunnels.</p>
                </div>
                <div style={{ width: '100%', background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 12, borderRadius: 13, fontSize: 10.5, color: 'var(--text-3)', fontFamily: 'monospace', textAlign: 'center', minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--gold)' }}>{processingLog}</span>
                </div>
              </div>
            ) : (
              /* Main Checkout Form */
              <form onSubmit={executePaymentProvision} style={{ padding: 24 }}>
                {/* Invoice Summary */}
                <div className="flex justify-between items-center" style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 16, borderRadius: 16, marginBottom: 18 }}>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Workspace Provision Invoice</span>
                    <span style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 600 }}>Plan: <span style={{ fontWeight: 800, color: 'var(--gold)' }}>{provisionDto.plan}</span></span>
                  </div>
                  <span style={{ fontSize: 21, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--display)' }}>Rs. {planPrices[provisionDto.plan]}</span>
                </div>

                {/* Tab Selector */}
                <div className="grid grid-cols-2 gap-2" style={{ marginBottom: 18 }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`store-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                    style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 8px' }}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span style={{ fontSize: 10 }}>Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`store-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                    style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 8px' }}
                  >
                    <QrCode className="h-4 w-4" />
                    <span style={{ fontSize: 10 }}>UPI QR Code</span>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="animate-fade-in">
                    <div className="field">
                      <label>Cardholder Full Name</label>
                      <div className="input-wrap">
                        <User />
                        <input
                          type="text" required value={cardHolder} onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label>Debit / Credit Card Number</label>
                      <div className="input-wrap">
                        <CreditCard />
                        <input
                          type="text" required value={cardNumber}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '').substring(0, 16);
                            const parts = val.match(/.{1,4}/g) || [];
                            setCardNumber(parts.join(' '));
                          }}
                          placeholder="4111 2222 3333 4444"
                          style={{ fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                    <div className="form-grid">
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>Expiry Date</label>
                        <div className="input-wrap">
                          <Calendar />
                          <input
                            type="text" required value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) {
                                setCardExpiry(val.substring(0, 2) + '/' + val.substring(2, 4));
                              } else {
                                setCardExpiry(val);
                              }
                            }}
                            placeholder="MM/YY"
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>CVV Code</label>
                        <div className="input-wrap">
                          <Lock />
                          <input
                            type="password" required value={cardCvv} onChange={(e) => setCardCvv(e.target.value.substring(0, 3))}
                            placeholder="•••"
                            style={{ textAlign: 'center', fontFamily: 'monospace' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '10px 0' }}>
                    <div style={{ background: '#fff', padding: 12, borderRadius: 18, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 160, height: 160 }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://kee.platform/subscribe?amount=${planPrices[provisionDto.plan]}`}
                        alt="Pay QR code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 700 }}>Scan to Authorize Setup Invoice</p>
                      <p style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, maxWidth: 260, marginTop: 4 }}>
                        Scan with GPay, PhonePe, Paytm, or BHIM. Subscription activates automatically post-detection.
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer buttons */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                  <div className="flex items-center gap-1.5 justify-center" style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, marginBottom: 14 }}>
                    <Lock className="h-3 w-3" style={{ color: 'var(--green)' }} />
                    <span>256-bit Secure Gateway Payment Portal</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentProvisionModal(false)}
                      className="btn btn-ghost"
                      style={{ flex: 1 }}
                    >
                      Cancel Setup
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 2 }}
                    >
                      Pay Rs. {planPrices[provisionDto.plan]} & Provision
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT 3: SUPER CUSTOMER SUPERVISION VIEW (SUPER ADMIN ONLY)
// ============================================================================
function SuperCustomersView({ api, searchDispatch }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Picks up a query dispatched from the global header search panel
  // (filter = "Customer"). The nonce lets the same text be re-submitted.
  useEffect(() => {
    if (searchDispatch && searchDispatch.type === 'customer') {
      setSearch(searchDispatch.query);
    }
  }, [searchDispatch?.nonce]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [viewCust, setViewCust] = useState(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

  // Edit Customer states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editProofType, setEditProofType] = useState('');
  const [editProofNo, setEditProofNo] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editKeyNo, setEditKeyNo] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getSuperCustomers(search);
      setCustomers(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (c) => {
    setSelectedCust(c);
    setEditName(c.name);
    setEditPhone(c.phone);
    setEditAddress(c.address);
    setEditProofType(c.idProofType);
    setEditProofNo(c.idProofNumber || '');
    setEditReason(c.reason);
    setEditKeyNo(c.keyNumber);
    setShowEditDrawer(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!PHONE_REGEX.test(editPhone)) {
      alert(PHONE_REGEX_MESSAGE);
      return;
    }
    try {
      await api.updateSuperCustomer(selectedCust.id, {
        name: editName,
        phone: editPhone,
        address: editAddress,
        idProofType: editProofType,
        idProofNumber: editProofNo,
        reason: editReason,
        keyNumber: editKeyNo
      });
      setShowEditDrawer(false);
      setSelectedCust(null);
      fetchCustomers();
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><ShieldCheck /> Cross-Tenant Compliance</div>
          <h1>Customer Registry</h1>
          <p>Supervise and edit duplicate-key compliance records across every shop workspace on Kee.</p>
        </div>
      </div>

      {/* The search box lives outside the loading/results swap below so it
          never unmounts while typing - every keystroke sets `search`, which
          re-triggers the fetch and flips `loading` briefly, but the input
          itself stays mounted throughout and keeps focus the whole time. */}
      <div className="card table-card">
        <div className="table-head">
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 17 }}>
            All Customers <span style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: 13 }}>({customers.length})</span>
          </h2>
          <div className="search-box">
            <Search />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or key code&hellip;"
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 200 }}>
            <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading customer registry&hellip;</span>
          </div>
        ) : customers.length === 0 ? (
          <p style={{ padding: 24, fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 }}>
            No customer records match this search across the platform.
          </p>
        ) : (
        <table className="kee-table">
          <thead>
            <tr>
              <th>Tenant Workspace</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Key Code</th>
              <th>Registered</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td className="cell-sub" style={{ fontWeight: 700, color: 'var(--text-2)' }}>{c.shop ? c.shop.name : 'Shop Workspace'}</td>
                <td>
                  <div className="cell-primary">{c.name}</div>
                </td>
                <td className="cell-sub" style={{ fontWeight: 700, color: 'var(--text-2)' }}>{c.phone}</td>
                <td>
                  <span className="badge badge-active"><span className="dot" />{c.keyNumber}</span>
                </td>
                <td className="cell-sub" style={{ fontWeight: 700, color: 'var(--text-2)' }}>
                  {new Date(c.createdAt).toLocaleDateString()}
                  <div className="cell-sub">{new Date(c.createdAt).toLocaleTimeString()}</div>
                </td>
                <td>
                  <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                    <button onClick={() => setViewCust(c)} className="icon-btn" title="View compliance file">
                      <Eye />
                    </button>
                    <button onClick={() => handleEditClick(c)} className="icon-btn" title="Edit customer record">
                      <Edit />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Edit Customer Profile drawer */}
      {showEditDrawer && selectedCust && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ background: 'rgba(5,4,3,0.82)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 440, height: '100%', borderRadius: 0, overflowY: 'auto', padding: 28 }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><Edit /> Registry Edit</span>
                <h2 style={{ fontSize: 19 }}>Modify Customer Record</h2>
              </div>
              <button onClick={() => setShowEditDrawer(false)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              <div className="field">
                <label>Full Customer Name</label>
                <div className="input-wrap">
                  <User />
                  <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label>Phone Number</label>
                <div className="input-wrap">
                  <Phone />
                  <input type="tel" required value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label>Registered Address</label>
                <div className="input-wrap">
                  <MapPin />
                  <input type="text" required value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>ID Type</label>
                  <div className="input-wrap">
                    <ShieldCheck />
                    <input type="text" required value={editProofType} onChange={(e) => setEditProofType(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label>ID Proof Number</label>
                  <div className="input-wrap">
                    <Hash />
                    <input type="text" required value={editProofNo} onChange={(e) => setEditProofNo(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Reason for Duplicate Key</label>
                <div className="input-wrap">
                  <FileText />
                  <input type="text" required value={editReason} onChange={(e) => setEditReason(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label>Cut Key Code</label>
                <div className="input-wrap">
                  <KeyRound />
                  <input type="text" required value={editKeyNo} onChange={(e) => setEditKeyNo(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 4 }}>
                <button type="button" onClick={() => setShowEditDrawer(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {viewCust && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10" style={{ background: 'rgba(5,4,3,0.82)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 620, margin: 'auto', padding: 28 }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><FileText /> Compliance File</span>
                <h2 style={{ fontSize: 19 }}>{viewCust.name}</h2>
              </div>
              <button onClick={() => setViewCust(null)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold" style={{ marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Phone Contact</span>
                <span style={{ color: 'var(--text-0)' }}>{viewCust.phone}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Registry Date</span>
                <span style={{ color: 'var(--text-0)' }}>{new Date(viewCust.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Address</span>
                <span style={{ color: 'var(--text-0)' }} className="block truncate">{viewCust.address}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Key Blank Code</span>
                <span className="badge badge-active"><span className="dot" />{viewCust.keyNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold" style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>ID Verification</span>
                <span style={{ color: 'var(--text-0)' }}>{viewCust.idProofType}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>ID Number (Decrypted)</span>
                <span style={{ color: 'var(--gold)' }}>{viewCust.idProofNumber}</span>
              </div>
            </div>

            <div style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', borderRadius: 16, padding: 14, marginBottom: 18 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin style={{ width: 18, height: 18, color: 'var(--green)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-0)', fontSize: 13 }}>GPS Coordinates</p>
                    <p style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2, fontWeight: 600 }}>Lat: {viewCust.latitude} &bull; Long: {viewCust.longitude}</p>
                  </div>
                </div>
                <a href={viewCust.mapsLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10.5, color: 'var(--gold)', fontWeight: 800 }} className="flex items-center gap-1 hover:underline">
                  <span>Google Maps</span><ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {viewCust.capturedAddress && (
                <div style={{ fontSize: 10.5, color: 'var(--text-2)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8, paddingLeft: 26, fontWeight: 600 }}>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>Captured Address</span>
                  <span>{viewCust.capturedAddress}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4" style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: viewCust.documents && viewCust.documents.length > 0 ? 18 : 0 }}>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 6 }}>Webcam Photo</span>
                {viewCust.photoUrl ? (
                  <div style={{ width: '100%', height: 128, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-2)' }}>
                    <img src={getAssetUrl(viewCust.photoUrl)} alt="Customer snapshot" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 128, borderRadius: 12, border: '1.5px dashed var(--border-2)' }} className="flex items-center justify-center">
                    <Camera style={{ width: 18, height: 18, color: 'var(--text-3)' }} />
                  </div>
                )}
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 6 }}>Customer Signature</span>
                {viewCust.signatureUrl ? (
                  <div style={{ width: '100%', height: 128, borderRadius: 12, background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 10 }} className="flex items-center justify-center">
                    <img src={getAssetUrl(viewCust.signatureUrl)} alt="Signature drawing" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 128, borderRadius: 12, border: '1.5px dashed var(--border-2)' }} className="flex items-center justify-center">
                    <PenLine style={{ width: 18, height: 18, color: 'var(--text-3)' }} />
                  </div>
                )}
              </div>
            </div>

            {viewCust.documents && viewCust.documents.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }} className="space-y-2">
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 4 }}>Attached ID Copies</span>
                {viewCust.documents.map(d => (
                  <div key={d.id} style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 10, borderRadius: 12 }} className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{d.documentType} ({d.fileKey})</span>
                    <button type="button" onClick={() => downloadAsset(d.fileUrl, d.fileKey || 'document')} style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} className="hover:underline">Download</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
              <button onClick={() => setViewCust(null)} className="btn btn-ghost">Close File</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT 4: MASTER KEY DATABASE CRUD (SUPER ADMIN ONLY)
// ============================================================================
function KeysCatalogView({ api, searchDispatch }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Picks up a query dispatched from the global header search panel (filter = "Key").
  useEffect(() => {
    if (searchDispatch && searchDispatch.type === 'key') {
      setSearchQuery(searchDispatch.query);
    }
  }, [searchDispatch?.nonce]);

  // Form states
  const [keyNumber, setKeyNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [blankNumber, setBlankNumber] = useState('');
  const [frontImageUrl, setFrontImageUrl] = useState('');
  const [backImageUrl, setBackImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await api.getMasterKeys();
      setKeys(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const dto = {
        keyNumber, brand, category, blankNumber,
        frontImageUrl, backImageUrl, description, notes, status
      };

      if (editKey) {
        await api.updateMasterKey(editKey.id, dto);
      } else {
        await api.createMasterKey(dto);
      }
      setShowAddModal(false);
      resetForm();
      fetchKeys();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  const handleEditClick = (k) => {
    setEditKey(k);
    setKeyNumber(k.keyNumber);
    setBrand(k.brand);
    setCategory(k.category);
    setBlankNumber(k.blankNumber);
    setFrontImageUrl(k.frontImageUrl || '');
    setBackImageUrl(k.backImageUrl || '');
    setDescription(k.description || '');
    setNotes(k.notes || '');
    setStatus(k.status);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this key blank from the central catalogue?')) return;
    try {
      await api.deleteMasterKey(id);
      fetchKeys();
    } catch (e) {
      alert(e.message);
    }
  };

  const resetForm = () => {
    setEditKey(null);
    setKeyNumber('');
    setBrand('');
    setCategory('');
    setBlankNumber('');
    setFrontImageUrl('');
    setBackImageUrl('');
    setDescription('');
    setNotes('');
    setStatus('ACTIVE');
    setErrorMsg('');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Key /> Platform Catalogue</div>
          <h1>Master Key Catalogue</h1>
          <p>Provision key blank specifications available for lookup across every shop terminal.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="btn btn-primary"
        >
          <Plus />
          <span>Add Key Blank</span>
        </button>
      </div>

      {/* Central catalog lookup search input */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', padding: 0, marginBottom: 24 }}>
        <div className="search-box" style={{ width: '100%', minWidth: 0, border: 'none', background: 'transparent', padding: '18px 22px' }}>
          <Search />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalogue by code, category, brand name, specs reference&hellip;"
            style={{ fontSize: 14 }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="icon-btn" style={{ width: 26, height: 26 }}>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 260 }}>
          <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading catalogue&hellip;</span>
        </div>
      ) : (() => {
        const filteredKeys = keys.filter(k =>
          (k.keyNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (k.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (k.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (k.blankNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (k.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredKeys.length === 0) {
          return (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 220 }}>
              <div className="icon-badge"><KeyRound /></div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>No key blanks match this search</span>
            </div>
          );
        }

        return (
          <div className="product-grid stagger-in">
            {filteredKeys.map(k => (
              <div key={k.id} className="product-card">
                <div className="product-img">
                  {k.frontImageUrl ? (
                    <img src={k.frontImageUrl} alt="Key blank profile" className="w-full h-full object-cover" />
                  ) : (
                    <KeyRound />
                  )}
                  <span className="product-tag">{k.category}</span>
                </div>
                <div className="product-body">
                  <div className="flex items-center justify-between">
                    <span className="pname">{k.keyNumber}</span>
                    <span className={`badge ${k.status === 'ACTIVE' ? 'badge-active' : 'badge-suspended'}`}>
                      <span className="dot" />{k.status}
                    </span>
                  </div>
                  <p className="pcat">{k.brand} &bull; Blank: {k.blankNumber}</p>
                  {k.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, fontStyle: 'italic' }}>&ldquo;{k.description}&rdquo;</p>
                  )}
                  <div className="product-foot" style={{ marginTop: 8, gap: 8 }}>
                    <button
                      onClick={() => handleEditClick(k)}
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1 }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Modify</span>
                    </button>
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="btn btn-danger-outline btn-sm"
                      style={{ flex: 1 }}
                    >
                      <Trash className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Add / Edit Key Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10" style={{ background: 'rgba(5,4,3,0.85)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 640, margin: 'auto', padding: 28 }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><Key /> Catalogue Entry</span>
                <h2 style={{ fontSize: 19 }}>{editKey ? 'Modify Key Blank' : 'Add New Key Blank'}</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', gap: 8, background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.35)', padding: 10, borderRadius: 12, fontSize: 12, color: '#b91c1c', fontWeight: 600, marginBottom: 16 }}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Key Code</label>
                  <div className="input-wrap">
                    <Hash />
                    <input
                      type="text" required value={keyNumber} onChange={(e) => setKeyNumber(e.target.value)}
                      placeholder="e.g. CY-102"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Brand Manufacturer</label>
                  <div className="input-wrap">
                    <Tag />
                    <input
                      type="text" required value={brand} onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Godrej"
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Blank Number Reference</label>
                  <div className="input-wrap">
                    <KeyRound />
                    <input
                      type="text" required value={blankNumber} onChange={(e) => setBlankNumber(e.target.value)}
                      placeholder="e.g. GD-901"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Category Type</label>
                  <div className="input-wrap">
                    <Layers />
                    <input
                      type="text" required value={category} onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Padlock"
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Front Image URL</label>
                  <div className="input-wrap">
                    <Camera />
                    <input
                      type="text" value={frontImageUrl} onChange={(e) => setFrontImageUrl(e.target.value)}
                      placeholder="https://images..."
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Back Image URL</label>
                  <div className="input-wrap">
                    <Camera />
                    <input
                      type="text" value={backImageUrl} onChange={(e) => setBackImageUrl(e.target.value)}
                      placeholder="https://images..."
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Product Description</label>
                <textarea
                  rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Grooves details..."
                  style={{ width: '100%', background: 'var(--card-2)', border: '1.5px solid var(--border-2)', color: 'var(--text-0)', borderRadius: 13, padding: '13px 15px', fontSize: 13.5, outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div className="field">
                <label>Internal Setup Notes</label>
                <textarea
                  rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Cutter machine setup guidance..."
                  style={{ width: '100%', background: 'var(--card-2)', border: '1.5px solid var(--border-2)', color: 'var(--text-0)', borderRadius: 13, padding: '13px 15px', fontSize: 13.5, outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div className="field">
                <label>Catalog Status</label>
                <select
                  className="sel"
                  value={status} onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ACTIVE">Active (Searchable by shops)</option>
                  <option value="INACTIVE">Inactive (Hidden)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 4 }}>
                <button
                  type="button" onClick={() => setShowAddModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editKey ? 'Save Changes' : 'Publish Key'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT 6: ADVERTISEMENTS CRUD (SUPER ADMIN ONLY)
// ============================================================================
function AdsManagementView({ api }) {
  const [ads, setAds] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdId, setEditingAdId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState('BANNER');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState(0);
  const [targetAll, setTargetAll] = useState(true);
  const [targetShops, setTargetShops] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAds();
    fetchShops();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await api.getAdvertisements();
      setAds(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const res = await api.getShops();
      setShops(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const dto = {
        title, imageUrl, type,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        priority: Number(priority),
        targetAll,
        targetShops
      };
      if (editingAdId) {
        await api.updateAdvertisement(editingAdId, dto);
      } else {
        await api.createAdvertisement(dto);
      }
      setShowAddModal(false);
      resetForm();
      fetchAds();
    } catch (err) {
      setErrorMsg(err.message || (editingAdId ? 'Failed to update campaign' : 'Failed to schedule campaign'));
    }
  };

  const resetForm = () => {
    setEditingAdId(null);
    setTitle('');
    setImageUrl('');
    setType('BANNER');
    setStartDate('');
    setEndDate('');
    setPriority(0);
    setTargetAll(true);
    setTargetShops([]);
    setErrorMsg('');
  };

  const handleEditClick = (ad) => {
    setEditingAdId(ad.id);
    setTitle(ad.title);
    setImageUrl(ad.imageUrl);
    setType(ad.type);
    setStartDate(new Date(ad.startDate).toISOString().slice(0, 10));
    setEndDate(new Date(ad.endDate).toISOString().slice(0, 10));
    setPriority(ad.priority ?? 0);
    setTargetAll(ad.targetAll);
    setTargetShops(ad.targetShops || []);
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to terminate this advertisement campaign?')) return;
    try {
      await api.deleteAdvertisement(id);
      fetchAds();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleShopSelectChange = (shopId) => {
    if (targetShops.includes(shopId)) {
      setTargetShops(targetShops.filter(id => id !== shopId));
    } else {
      setTargetShops([...targetShops, shopId]);
    }
  };

  const adTypeMeta = (type) => {
    if (type === 'POPUP') return { label: 'Interactive Popup', icon: Sparkles };
    if (type === 'NOTICE') return { label: 'Text Notice', icon: Bell };
    return { label: 'Main Banner', icon: Radio };
  };

  const isLive = (ad) => {
    const now = Date.now();
    return new Date(ad.startDate).getTime() <= now && new Date(ad.endDate).getTime() >= now;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Megaphone /> Growth &amp; Marketing</div>
          <h1>Advertisement Campaigns</h1>
          <p>Publish banners and popups targeted to shop dashboard screens.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="btn btn-primary"
        >
          <Plus />
          <span>New Ad Campaign</span>
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 260 }}>
          <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading campaigns&hellip;</span>
        </div>
      ) : ads.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 220 }}>
          <div className="icon-badge"><Megaphone /></div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>No ad campaigns scheduled yet.</span>
        </div>
      ) : (
        <div className="product-grid stagger-in">
          {ads.map(ad => {
            const meta = adTypeMeta(ad.type);
            const Icon = meta.icon;
            const live = isLive(ad);
            return (
              <div key={ad.id} className="product-card">
                <div className="product-img" style={{ height: 160 }}>
                  {ad.imageUrl ? (
                    <img src={cleanGoogleImageUrl(ad.imageUrl)} alt={ad.title} className="w-full h-full object-cover" style={{ opacity: 0.9 }} />
                  ) : (
                    <Icon />
                  )}
                  <span className="product-tag"><Icon className="h-3 w-3" style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />{meta.label}</span>
                  <span className={`badge ${live ? 'badge-active' : 'badge-suspended'}`} style={{ position: 'absolute', top: 10, right: 10 }}>
                    <span className="dot" />{live ? 'Live' : 'Scheduled'}
                  </span>
                </div>
                <div className="product-body">
                  <div className="flex items-center justify-between">
                    <span className="pname">{ad.title}</span>
                    <span className="badge badge-gold">Priority {ad.priority}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11, color: 'var(--text-2)', background: 'var(--card-2)', border: '1px solid var(--border)', padding: 10, borderRadius: 12, fontWeight: 600 }}>
                    <div>
                      <span style={{ color: 'var(--text-3)', display: 'block', fontWeight: 800, textTransform: 'uppercase', fontSize: 9.5, letterSpacing: '.04em' }}>Start</span>
                      {new Date(ad.startDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-3)', display: 'block', fontWeight: 800, textTransform: 'uppercase', fontSize: 9.5, letterSpacing: '.04em' }}>End</span>
                      {new Date(ad.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="cell-sub" style={{ fontSize: 11.5 }}>
                    <Users className="h-3 w-3" style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
                    {ad.targetAll ? 'All Key Shops' : `${ad.targetShops.length} targeted shop${ad.targetShops.length === 1 ? '' : 's'}`}
                  </div>

                  <div className="flex gap-2" style={{ marginTop: 4 }}>
                    <button
                      onClick={() => handleEditClick(ad)}
                      className="btn btn-ghost btn-sm btn-block"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="btn btn-danger-outline btn-sm btn-block"
                    >
                      <Trash className="h-3.5 w-3.5" />
                      <span>Cancel Campaign</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Campaign Add Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10" style={{ background: 'rgba(5,4,3,0.85)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 640, margin: 'auto', padding: 28 }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><Radio /> Ad Campaign</span>
                <h2 style={{ fontSize: 19 }}>{editingAdId ? 'Edit Ad Campaign' : 'New Visual Ad Campaign'}</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', gap: 8, background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.35)', padding: 10, borderRadius: 12, fontSize: 12, color: '#b91c1c', fontWeight: 600, marginBottom: 16 }}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Ad Title / Announcement</label>
                <div className="input-wrap">
                  <Megaphone />
                  <input
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 20% Off Godrej key duplicates this Friday"
                  />
                </div>
              </div>

              <div className="field">
                <label>Banner Image Source</label>
                <div className="flex gap-2">
                  <div className="input-wrap" style={{ flex: 1 }}>
                    <ImageIcon />
                    <input
                      type="text" required value={imageUrl}
                      onChange={(e) => setImageUrl(cleanGoogleImageUrl(e.target.value))}
                      placeholder="Paste Image URL (or Google Image Link)"
                    />
                  </div>
                  <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload</span>
                    <input
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImageUrl(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {imageUrl && (
                  <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', height: 110, background: 'var(--card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={cleanGoogleImageUrl(imageUrl)} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Ad Format</label>
                  <select
                    className="sel"
                    value={type} onChange={(e) => setType(e.target.value)}
                  >
                    <option value="BANNER">Main Banner Notice</option>
                    <option value="POPUP">Interactive Login Popup</option>
                    <option value="NOTICE">Dashboard Text Notice</option>
                  </select>
                </div>
                <div className="field">
                  <label>Campaign Priority</label>
                  <div className="input-wrap">
                    <Sliders />
                    <input
                      type="number" required value={priority} onChange={(e) => setPriority(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid" style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
                <div className="field">
                  <label>Start Date</label>
                  <div className="input-wrap">
                    <Calendar />
                    <input
                      type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>End Date</label>
                  <div className="input-wrap">
                    <CalendarRange />
                    <input
                      type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 4 }}>
                <label className="eyebrow" style={{ marginBottom: 10 }}><Users /> Target Audience</label>
                <div className="flex gap-4 items-center" style={{ marginBottom: 10 }}>
                  <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 700 }}>
                    <input
                      type="radio" name="target" checked={targetAll} onChange={() => setTargetAll(true)}
                      style={{ accentColor: 'var(--gold)', width: 15, height: 15 }}
                    />
                    <span>Broadcast to all key shops</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 700 }}>
                    <input
                      type="radio" name="target" checked={!targetAll} onChange={() => setTargetAll(false)}
                      style={{ accentColor: 'var(--gold)', width: 15, height: 15 }}
                    />
                    <span>Target specific shops</span>
                  </label>
                </div>

                {!targetAll && (
                  <div style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', borderRadius: 13, padding: 12, maxHeight: 140, overflowY: 'auto' }}>
                    {shops.map(s => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 600, padding: '5px 4px' }}>
                        <input
                          type="checkbox" checked={targetShops.includes(s.id)} onChange={() => handleShopSelectChange(s.id)}
                          style={{ accentColor: 'var(--gold)', width: 14, height: 14 }}
                        />
                        <span>{s.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                <button
                  type="button" onClick={() => setShowAddModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingAdId ? 'Save Changes' : 'Schedule Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT 6B: CROSS-SHOP PROMOTIONS (ads, promotional products & offers, shared feed)
// Every shop (and the Super Admin) sees every shop's listings. A Shop Admin can
// create/edit/delete PRODUCT, AD and OFFER listings for their own shop only;
// an OFFER may optionally be linked to one of that shop's existing listings.
// The Super Admin cannot publish listings, but can moderate (edit/delete) any
// listing platform-wide, plus gets dedicated Banner Management and Offer
// Management sub-tabs alongside the plain marketplace feed.
// ============================================================================
// OLX-style inventory categories. Freeform on the backend (productType is a
// plain string, not an enum) so this list can grow without a migration.
const PRODUCT_TYPES = ['Key Blanks', 'Duplicate Keys', 'Machines', 'Accessories', 'Other'];

function PromotionsView({ api, user, searchDispatch }) {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const [subTab, setSubTab] = useState('feed'); // feed | banners | offers (banners/offers = Super Admin only)

  // A query dispatched from the global header search panel always targets
  // the plain Inventory Feed, never the Banner/Offer moderation sub-tabs.
  useEffect(() => {
    if (searchDispatch) setSubTab('feed');
  }, [searchDispatch?.nonce]);

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Package /> Cross-Shop Marketplace</div>
          <h1>Inventory</h1>
          <p>
            {isSuperAdmin
              ? 'Manage the shared inventory feed, banner ad campaigns and shop offers across the platform.'
              : 'Browse and list products shared across every shop on the platform, OLX-style.'}
          </p>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="store-tabs">
          <button
            type="button"
            className={`store-tab ${subTab === 'feed' ? 'active' : ''}`}
            onClick={() => setSubTab('feed')}
          >
            <Layers className="h-3.5 w-3.5" style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
            Inventory Feed
          </button>
          <button
            type="button"
            className={`store-tab ${subTab === 'banners' ? 'active' : ''}`}
            onClick={() => setSubTab('banners')}
          >
            <Megaphone className="h-3.5 w-3.5" style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
            Banner Management
          </button>
          <button
            type="button"
            className={`store-tab ${subTab === 'offers' ? 'active' : ''}`}
            onClick={() => setSubTab('offers')}
          >
            <BadgePercent className="h-3.5 w-3.5" style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
            Offer Management
          </button>
        </div>
      )}

      {subTab === 'banners' && isSuperAdmin ? (
        <AdsManagementView api={api} />
      ) : (
        <PromotionsFeed key={subTab} api={api} user={user} isSuperAdmin={isSuperAdmin} onlyOffers={subTab === 'offers'} searchDispatch={subTab === 'feed' ? searchDispatch : null} />
      )}
    </div>
  );
}

function PromotionsFeed({ api, user, isSuperAdmin, onlyOffers, searchDispatch }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [type, setType] = useState('PRODUCT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [productType, setProductType] = useState(PRODUCT_TYPES[0]);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [linkedPromotionId, setLinkedPromotionId] = useState('');

  // OLX-style category filter chip, applied client-side over the fetched feed.
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Free-text query, either typed locally or dispatched from the global
  // header search panel (filter = "Product Type" / "Location" / "Anything").
  const [textQuery, setTextQuery] = useState('');

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (searchDispatch && ['productType', 'location', 'all'].includes(searchDispatch.type)) {
      setTextQuery(searchDispatch.query);
      if (searchDispatch.type === 'productType') {
        // If the query exactly matches a known category, jump straight to that chip.
        const match = PRODUCT_TYPES.find(pt => pt.toLowerCase() === searchDispatch.query.trim().toLowerCase());
        if (match) setCategoryFilter(match);
      }
    }
  }, [searchDispatch?.nonce]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      // Offer Management (Super Admin) needs every offer regardless of expiry
      // for moderation; the plain marketplace feed only shows active offers.
      const res = await api.getPromotions(onlyOffers);
      setPromotions(onlyOffers ? res.filter(p => p.type === 'OFFER') : res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setType('PRODUCT');
    setTitle('');
    setDescription('');
    setImageUrl('');
    setPrice('');
    setProductType(PRODUCT_TYPES[0]);
    setDiscountPercentage('');
    setValidUntil('');
    setLinkedPromotionId('');
    setErrorMsg('');
  };

  const canManage = (promo) => isSuperAdmin || promo.shopId === user.shopId;

  const handleEditClick = (promo) => {
    setEditingId(promo.id);
    setType(promo.type);
    setTitle(promo.title);
    setDescription(promo.description || '');
    setImageUrl(promo.imageUrl || '');
    setPrice(promo.price ?? '');
    setProductType(promo.productType || PRODUCT_TYPES[0]);
    setDiscountPercentage(promo.discountPercentage ?? '');
    setValidUntil(promo.validUntil ? promo.validUntil.slice(0, 10) : '');
    setLinkedPromotionId(promo.linkedPromotionId || '');
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const dto = {
        type,
        title,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        price: price === '' ? undefined : Number(price),
        productType: type === 'PRODUCT' ? (productType || undefined) : undefined,
        discountPercentage: type === 'OFFER' && discountPercentage !== '' ? Number(discountPercentage) : undefined,
        validUntil: type === 'OFFER' && validUntil ? new Date(validUntil).toISOString() : undefined,
        linkedPromotionId: type === 'OFFER' && linkedPromotionId ? linkedPromotionId : undefined,
      };
      if (editingId) {
        await api.updatePromotion(editingId, dto);
      } else {
        await api.createPromotion(dto);
      }
      setShowAddModal(false);
      resetForm();
      fetchPromotions();
    } catch (err) {
      setErrorMsg(err.message || (editingId ? 'Failed to update listing' : 'Failed to publish listing'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      await api.deletePromotion(id);
      fetchPromotions();
    } catch (e) {
      alert(e.message);
    }
  };

  const typeMeta = (t) => t === 'AD'
    ? { label: 'Advertisement', icon: Megaphone }
    : t === 'OFFER'
      ? { label: 'Offer', icon: BadgePercent }
      : { label: 'Promotional Product', icon: Package };

  const isExpiredOffer = (promo) => promo.type === 'OFFER' && promo.validUntil && new Date(promo.validUntil) < new Date();

  // A shop may only link an OFFER to one of that same shop's own PRODUCT/AD listings.
  const editingPromo = promotions.find(p => p.id === editingId);
  const linkShopId = editingId ? editingPromo?.shopId : user.shopId;
  const linkableListings = promotions.filter(p => p.shopId === linkShopId && p.type !== 'OFFER' && p.id !== editingId);

  // OLX-style category chips: only meaningful on the default mixed feed (not
  // the Offer Management moderation screen), and only shown once there's
  // more than one distinct productType actually present in the feed.
  const availableCategories = !onlyOffers
    ? Array.from(new Set(promotions.map(p => p.productType).filter(Boolean)))
    : [];
  const byCategory = categoryFilter === 'ALL'
    ? promotions
    : promotions.filter(p => p.productType === categoryFilter);
  const q = textQuery.trim().toLowerCase();
  const visiblePromotions = !q ? byCategory : byCategory.filter(p =>
    (p.title || '').toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q) ||
    (p.productType || '').toLowerCase().includes(q) ||
    (p.shop?.name || '').toLowerCase().includes(q) ||
    (p.createdBy?.name || '').toLowerCase().includes(q)
  );

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginTop: 4, marginBottom: 18, gap: 10, flexWrap: 'wrap' }}>
        <div className="input-wrap" style={{ flex: 1, minWidth: 220, margin: 0 }}>
          <Search />
          <input
            type="text" value={textQuery} onChange={(e) => setTextQuery(e.target.value)}
            placeholder="Search inventory by name, product type, shop or seller…"
          />
        </div>
        {!isSuperAdmin && (
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="btn btn-primary"
            style={{ flexShrink: 0 }}
          >
            <Plus />
            <span>New Listing</span>
          </button>
        )}
      </div>

      {availableCategories.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`badge ${categoryFilter === 'ALL' ? 'badge-gold' : ''}`}
            style={categoryFilter === 'ALL' ? undefined : { background: 'var(--card-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)', cursor: 'pointer' }}
          >
            All Categories
          </button>
          {availableCategories.map(cat => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`badge ${categoryFilter === cat ? 'badge-gold' : ''}`}
              style={categoryFilter === cat ? undefined : { background: 'var(--card-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)', cursor: 'pointer' }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 260 }}>
          <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading listings&hellip;</span>
        </div>
      ) : visiblePromotions.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 220 }}>
          <div className="icon-badge"><Package /></div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>{onlyOffers ? 'No offers published yet.' : 'No inventory listed yet.'}</span>
        </div>
      ) : (
        <div className="product-grid stagger-in">
          {visiblePromotions.map(promo => {
            const meta = typeMeta(promo.type);
            const Icon = meta.icon;
            const expired = isExpiredOffer(promo);
            return (
              <div key={promo.id} className="product-card">
                <div className="product-img" style={{ height: 150, aspectRatio: '1 / 1', maxHeight: 190 }}>
                  {promo.imageUrl ? (
                    <img src={cleanGoogleImageUrl(promo.imageUrl)} alt={promo.title} className="w-full h-full object-cover" style={{ opacity: 0.9 }} />
                  ) : (
                    <Icon />
                  )}
                  <span className="product-tag">
                    {promo.type === 'PRODUCT' && promo.productType ? (
                      <><Tag className="h-3 w-3" style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />{promo.productType}</>
                    ) : (
                      <><Icon className="h-3 w-3" style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />{meta.label}</>
                    )}
                  </span>
                  {expired && (
                    <span className="badge badge-suspended" style={{ position: 'absolute', top: 10, right: 10 }}>Expired</span>
                  )}
                </div>
                <div className="product-body">
                  <div className="flex items-center justify-between" style={{ gap: 8 }}>
                    <span className="pname" style={{ minWidth: 0, flex: 1, wordBreak: 'break-word' }}>{promo.title}</span>
                    {promo.price != null && (
                      <span className="badge badge-gold" style={{ flexShrink: 0 }}>
                        <IndianRupee className="h-3 w-3" style={{ display: 'inline', verticalAlign: '-1px' }} />
                        {Number(promo.price).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {promo.description && (
                    <p className="cell-sub" style={{ fontSize: 11.5, minHeight: 32, wordBreak: 'break-word' }}>{promo.description}</p>
                  )}

                  {promo.type === 'OFFER' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {promo.discountPercentage != null && (
                        <span className="badge badge-active">
                          <Percent className="h-3 w-3" style={{ display: 'inline', verticalAlign: '-1px' }} />
                          {promo.discountPercentage}% off
                        </span>
                      )}
                      {promo.validUntil && (
                        <span className="badge" style={{ background: 'var(--card-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                          <Clock className="h-3 w-3" style={{ display: 'inline', verticalAlign: '-1px' }} />
                          Valid till {new Date(promo.validUntil).toLocaleDateString()}
                        </span>
                      )}
                      {promo.linkedPromotion && (
                        <span className="badge" style={{ background: 'var(--card-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                          Linked: {promo.linkedPromotion.title}
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11, color: 'var(--text-2)', background: 'var(--card-2)', border: '1px solid var(--border)', padding: 10, borderRadius: 12, fontWeight: 600 }}>
                    <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={promo.shop?.name || ''}>
                      <span style={{ color: 'var(--text-3)', display: 'block', fontWeight: 800, textTransform: 'uppercase', fontSize: 9.5, letterSpacing: '.04em' }}>Shop</span>
                      {promo.shop?.name || '—'}
                    </div>
                    <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={promo.createdBy?.name || ''}>
                      <span style={{ color: 'var(--text-3)', display: 'block', fontWeight: 800, textTransform: 'uppercase', fontSize: 9.5, letterSpacing: '.04em' }}>Posted by</span>
                      {promo.createdBy?.name || '—'}
                    </div>
                  </div>

                  <div className="cell-sub" style={{ fontSize: 11.5 }}>
                    <Calendar className="h-3 w-3" style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
                    {new Date(promo.createdAt).toLocaleDateString()}
                  </div>

                  {canManage(promo) && (
                    <div className="flex gap-2" style={{ marginTop: 4 }}>
                      <button
                        onClick={() => handleEditClick(promo)}
                        className="btn btn-ghost btn-sm btn-block"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="btn btn-danger-outline btn-sm btn-block"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Listing Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10" style={{ background: 'rgba(5,4,3,0.85)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 640, margin: 'auto', padding: 28 }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><Package /> Inventory Listing</span>
                <h2 style={{ fontSize: 19 }}>{editingId ? 'Edit Listing' : 'New Inventory Listing'}</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', gap: 8, background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.35)', padding: 10, borderRadius: 12, fontSize: 12, color: '#b91c1c', fontWeight: 600, marginBottom: 16 }}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Listing Type</label>
                <select className="sel" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="PRODUCT">Inventory Product</option>
                  <option value="AD">Advertisement</option>
                  <option value="OFFER">Offer / Discount</option>
                </select>
              </div>

              <div className="field">
                <label>Name</label>
                <div className="input-wrap">
                  <Tag />
                  <input
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Premium Godrej Key Blanks - Bulk Pack"
                  />
                </div>
              </div>

              {type === 'PRODUCT' && (
                <div className="field">
                  <label>Product Type</label>
                  <select className="sel" value={productType} onChange={(e) => setProductType(e.target.value)}>
                    {PRODUCT_TYPES.map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field">
                <label>Description (optional)</label>
                <div className="input-wrap">
                  <FileText />
                  <input
                    type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description shown on the listing card"
                  />
                </div>
              </div>

              <div className="field">
                <label>{type === 'PRODUCT' ? 'Product Photo (optional)' : 'Image / Media (optional)'}</label>
                <div className="flex gap-2">
                  <div className="input-wrap" style={{ flex: 1 }}>
                    <ImageIcon />
                    <input
                      type="text" value={imageUrl}
                      onChange={(e) => setImageUrl(cleanGoogleImageUrl(e.target.value))}
                      placeholder="Paste Image URL (or Google Image Link)"
                    />
                  </div>
                  <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload</span>
                    <input
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImageUrl(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {imageUrl && (
                  <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', height: 110, background: 'var(--card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={cleanGoogleImageUrl(imageUrl)} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                )}
              </div>

              <div className="field">
                <label>Price (optional)</label>
                <div className="input-wrap">
                  <IndianRupee />
                  <input
                    type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="Leave blank if not applicable"
                  />
                </div>
              </div>

              {type === 'OFFER' && (
                <>
                  <div className="field">
                    <label>Discount Percentage (optional)</label>
                    <div className="input-wrap">
                      <Percent />
                      <input
                        type="number" min="0" max="100" step="1" value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        placeholder="e.g. 20"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Valid Until (optional)</label>
                    <div className="input-wrap">
                      <CalendarRange />
                      <input
                        type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
                      />
                    </div>
                    <span className="cell-sub" style={{ display: 'block', marginTop: 6 }}>Leave blank for an offer with no expiry. Expired offers are hidden from the shared feed.</span>
                  </div>

                  <div className="field">
                    <label>Link to one of your existing listings (optional)</label>
                    <select className="sel" value={linkedPromotionId} onChange={(e) => setLinkedPromotionId(e.target.value)}>
                      <option value="">No linked listing</option>
                      {linkableListings.map(p => (
                        <option key={p.id} value={p.id}>{p.title} ({p.type === 'AD' ? 'Advertisement' : 'Product'})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                <button
                  type="button" onClick={() => setShowAddModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingId ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT 6C: SUBSCRIPTION PRICING MANAGEMENT (SUPER ADMIN ONLY)
// Standalone screen dedicated only to subscription plan rates. Offers and
// banner ad management now live under the separate Promotions screen
// (see PromotionsView's "Banner Management" / "Offer Management" sub-tabs).
// ============================================================================
function PricingOffersView({ api }) {
  // Pricing states
  const [monthlyPrice, setMonthlyPrice] = useState(49);
  const [halfYearlyPrice, setHalfYearlyPrice] = useState(269);
  const [yearlyPrice, setYearlyPrice] = useState(499);
  const [pricingLoading, setPricingLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setPricingLoading(true);
    try {
      const res = await api.getPlanPrices();
      setMonthlyPrice(res.MONTHLY ?? 49);
      setHalfYearlyPrice(res.HALF_YEARLY ?? 269);
      setYearlyPrice(res.YEARLY ?? 499);
    } catch (e) {
      console.error(e);
    } finally {
      setPricingLoading(false);
    }
  };

  const handleUpdatePrices = async (e) => {
    e.preventDefault();
    try {
      await api.updatePlanPrices({
        MONTHLY: Number(monthlyPrice),
        HALF_YEARLY: Number(halfYearlyPrice),
        YEARLY: Number(yearlyPrice)
      });
      alert('Subscription plan prices updated successfully!');
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Tag /> Platform Finance</div>
          <h1>Subscription Pricing</h1>
          <p>Configure franchise subscription plan rates for the platform.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="section-title" style={{ marginBottom: 6 }}>
          <h2>Subscription Plan Pricing</h2>
        </div>
        <p className="cell-sub" style={{ marginBottom: 22, fontSize: 12.5 }}>
          Set rates for the key shops. These prices will automatically update the checkout gateway screen during provisioning.
        </p>

        {pricingLoading ? (
          <div style={{ display: 'flex', height: 140, alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw className="animate-spin" style={{ width: 26, height: 26, color: 'var(--gold)' }} />
          </div>
        ) : (
          <form onSubmit={handleUpdatePrices}>
            <div className="field">
              <label>Monthly Recurring Plan (&#8377;)</label>
              <div className="input-wrap">
                <IndianRupee />
                <input
                  type="number" required value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)}
                />
              </div>
              <span className="cell-sub" style={{ display: 'block', marginTop: 6 }}>Monthly recurring rental bill for platform service.</span>
            </div>

            <div className="field">
              <label>6-Month Plan Rate (&#8377;)</label>
              <div className="input-wrap">
                <CalendarRange />
                <input
                  type="number" required value={halfYearlyPrice} onChange={(e) => setHalfYearlyPrice(e.target.value)}
                />
              </div>
              <span className="cell-sub" style={{ display: 'block', marginTop: 6 }}>Discounted half-yearly upfront rate for shops.</span>
            </div>

            <div className="field">
              <label>Yearly Plan Discounted Rate (&#8377;)</label>
              <div className="input-wrap">
                <BadgePercent />
                <input
                  type="number" required value={yearlyPrice} onChange={(e) => setYearlyPrice(e.target.value)}
                />
              </div>
              <span className="cell-sub" style={{ display: 'block', marginTop: 6 }}>Discounted upfront annual rate for shops.</span>
            </div>

            <div className="flex justify-end" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 4 }}>
              <button
                type="submit"
                className="btn btn-primary"
              >
                <Check />
                <span>Update Subscription Rates</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 7: REVENUE MANAGEMENT (SUPER ADMIN ONLY)
// ============================================================================
function RevenueManagementView({ api }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await api.getRevenue();
      setRecords(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // `amount` comes straight off a text input's e.target.value, so it's a
    // string here (e.g. "25000") - Prisma's RevenueRecord.amount column is a
    // Float, so it must be coerced to a real number before it goes over the
    // wire, or the backend rejects the whole request.
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      await api.logRevenue(Number(month), Number(year), numericAmount, notes);
      setAmount('');
      setNotes('');
      fetchRevenue();
    } catch (e) {
      alert(e.message);
    }
  };

  const totalCollected = records.reduce((acc, r) => acc + Number(r.amount), 0);
  const thisYear = new Date().getFullYear();
  const yearTotal = records.filter(r => r.year === thisYear).reduce((acc, r) => acc + Number(r.amount), 0);
  const avgPerRecord = records.length ? totalCollected / records.length : 0;

  const chartRecords = [...records]
    .sort((a, b) => (a.year - b.year) || (a.month - b.month))
    .slice(-8);
  const chartMax = Math.max(1, ...chartRecords.map(r => Number(r.amount)));

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><IndianRupee /> Platform Finance</div>
          <h1>Monthly Revenue Logs</h1>
          <p>Record subscription collections manually for SaaS performance tracking.</p>
        </div>
      </div>

      {!loading && records.length > 0 && (
        <div className="stat-grid three">
          <div className="stat-card" style={{ animationDelay: '.05s' }}>
            <div className="stat-top">
              <div className="icon-badge green"><Banknote /></div>
              <span className="stat-trend"><TrendingUp />all-time</span>
            </div>
            <div className="stat-num"><CountUp value={totalCollected} decimals={2} prefix="₹" /></div>
            <div className="stat-label">Total Revenue Collected</div>
          </div>
          <div className="stat-card" style={{ animationDelay: '.15s' }}>
            <div className="stat-top">
              <div className="icon-badge"><Calendar /></div>
              <span className="stat-trend"><TrendingUp />{thisYear}</span>
            </div>
            <div className="stat-num"><CountUp value={yearTotal} decimals={2} prefix="₹" /></div>
            <div className="stat-label">Collected This Year</div>
          </div>
          <div className="stat-card" style={{ animationDelay: '.25s' }}>
            <div className="stat-top">
              <div className="icon-badge"><Receipt /></div>
            </div>
            <div className="stat-num"><CountUp value={records.length} /></div>
            <div className="stat-label">Revenue Records &mdash; avg &#8377;{avgPerRecord.toFixed(2)}</div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card chart-card">
          <div className="section-title">
            <h2>Collections Trend</h2>
            <span className="sub">Last {chartRecords.length || 0} logged entries</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', height: 190, alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw className="animate-spin" style={{ width: 24, height: 24, color: 'var(--gold)' }} />
            </div>
          ) : chartRecords.length === 0 ? (
            <div style={{ display: 'flex', height: 190, alignItems: 'center', justifyContent: 'center', fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 }}>
              No revenue logs recorded yet.
            </div>
          ) : (
            <div className="bars">
              {chartRecords.map(r => (
                <div className="bar-col" key={r.id}>
                  <div className="bar" style={{ height: `${Math.max(6, (Number(r.amount) / chartMax) * 100)}%` }} title={`\u20B9${Number(r.amount).toFixed(2)}`} />
                  <div className="bar-label">
                    {new Date(2000, r.month - 1).toLocaleString('default', { month: 'short' })} '{String(r.year).slice(-2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>
            <h2>Add Revenue Record</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Month</label>
                <select
                  className="sel"
                  value={month} onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Year</label>
                <div className="input-wrap">
                  <Calendar />
                  <input
                    type="number" required value={year} onChange={(e) => setYear(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="field">
              <label>Amount Collected (&#8377;)</label>
              <div className="input-wrap">
                <IndianRupee />
                <input
                  type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="2450.00"
                />
              </div>
            </div>

            <div className="field">
              <label>Notes / Remarks</label>
              <textarea
                rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="..."
                style={{ width: '100%', background: 'var(--card-2)', border: '1.5px solid var(--border-2)', color: 'var(--text-0)', borderRadius: 13, padding: '13px 15px', fontSize: 13.5, outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
            >
              <Check />
              <span>Log Revenue Payout</span>
            </button>
          </form>
        </div>
      </div>

      <div className="card table-card" style={{ marginTop: 22 }}>
        <div className="table-head">
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 17 }}>Platform Revenue History</h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', height: 140, alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw className="animate-spin" style={{ width: 24, height: 24, color: 'var(--gold)' }} />
          </div>
        ) : records.length === 0 ? (
          <p style={{ padding: 24, fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 }}>
            No revenue logs recorded yet.
          </p>
        ) : (
          <table className="kee-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Notes</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {[...records].sort((a, b) => (b.year - a.year) || (b.month - a.month)).map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-primary">
                      {new Date(2000, r.month - 1).toLocaleString('default', { month: 'long' })} {r.year}
                    </div>
                  </td>
                  <td className="cell-sub" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                    {r.notes || '—'}
                  </td>
                  <td className="cell-primary" style={{ color: 'var(--green)' }}>&#8377;{Number(r.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 8: BLANK KEY SEARCH (SHOP ADMIN ONLY)
// ============================================================================
function KeysSearchView({ api, searchDispatch }) {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    performSearch();
  }, [query]);

  // Picks up a query dispatched from the global header search panel (filter = "Key").
  useEffect(() => {
    if (searchDispatch && searchDispatch.type === 'key') {
      setQuery(searchDispatch.query);
    }
  }, [searchDispatch?.nonce]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const allMasterKeys = await api.getMasterKeys();
      
      let matchedKeys = allMasterKeys;
      if (query) {
        const q = query.toLowerCase();
        matchedKeys = allMasterKeys.filter(k => 
          (k.keyNumber && k.keyNumber.toLowerCase().includes(q)) ||
          (k.brand && k.brand.toLowerCase().includes(q)) ||
          (k.category && k.category.toLowerCase().includes(q))
        );
      }

      const matchingCustomers = await api.getGlobalCustomersForSearch(query);

      const items = [];

      // 1. Add matching customer registrations linked to key specs
      matchingCustomers.forEach(c => {
        const spec = allMasterKeys.find(k => k.keyNumber.toLowerCase() === c.keyNumber.toLowerCase());
        items.push({
          id: `cust-${c.id}`,
          keySpec: spec || {
            id: `spec-${c.id}`,
            keyNumber: c.keyNumber,
            brand: 'Manual Vehicle Key',
            category: 'Vehicle Keys',
            blankNumber: c.keyNumber,
            frontImageUrl: null,
            backImageUrl: null
          },
          customer: c
        });
      });

      // 2. Add matching general keys that aren't already included
      matchedKeys.forEach(k => {
        if (!items.some(item => item.keySpec.keyNumber.toLowerCase() === k.keyNumber.toLowerCase())) {
          items.push({
            id: `key-${k.id}`,
            keySpec: k,
            customer: null
          });
        }
      });

      setResults(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Search /> Duplicate Key Lookup</div>
          <h1>Master Key Catalog Search</h1>
          <p>Lookup blank specifications, brand numbers, and customer registry records in seconds.</p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', padding: 0, marginBottom: 'clamp(16px, 4vw, 24px)' }}>
        <div className="search-box" style={{ width: '100%', minWidth: 0, border: 'none', background: 'transparent', padding: 'clamp(12px, 3vw, 18px) clamp(14px, 3vw, 22px)' }}>
          <Search />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by key code, vehicle number, customer location, category&hellip;"
            style={{ fontSize: 14, minWidth: 0 }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="icon-btn" style={{ width: 26, height: 26 }}>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 260 }}>
          <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Searching registry&hellip;</span>
        </div>
      ) : results.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 220 }}>
          <div className="icon-badge"><KeyRound /></div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>No matching keys or customer records found</span>
        </div>
      ) : (
        <div className="product-grid stagger-in">
          {results.map(r => (
            <div
              key={r.id} onClick={() => setSelectedResult(r)}
              className="product-card"
              style={{ cursor: 'pointer' }}
            >
              <div className="product-img">
                {r.keySpec.frontImageUrl ? (
                  <img src={r.keySpec.frontImageUrl} alt="Front preview" className="w-full h-full object-cover" />
                ) : (
                  <KeyRound />
                )}
                <span className="product-tag">{r.keySpec.category}</span>
              </div>
              <div className="product-body">
                <div className="flex items-center justify-between" style={{ gap: 8 }}>
                  <span className="pname" style={{ minWidth: 0, flex: 1, wordBreak: 'break-word' }}>{r.keySpec.keyNumber}</span>
                  <span className="pcat" style={{ marginBottom: 0, flexShrink: 0 }}>{r.keySpec.brand}</span>
                </div>
                <p className="pcat">Blank: {r.keySpec.blankNumber}</p>
                {r.customer && (
                  <div className="space-y-1">
                    <span className="badge badge-active"><span className="dot" />Registered Customer Key</span>
                    <div style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', borderRadius: 12, padding: 8, marginTop: 4 }}>
                      <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>Customer: <strong style={{ color: 'var(--text-0)' }}>{r.customer.name}</strong></p>
                      <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, marginTop: 2 }}>Vehicle No: <strong style={{ color: 'var(--green)' }}>{r.customer.vehicleNumber || 'N/A'}</strong></p>
                    </div>
                  </div>
                )}
                <div className="product-foot" style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold)' }}>View Full Details</span>
                  <ExternalLink style={{ width: 13, height: 13, color: 'var(--gold)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details View Modal */}
      {selectedResult && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10" style={{ background: 'rgba(5,4,3,0.85)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 620, margin: 'auto', padding: 28 }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><KeyRound /> Key Details</span>
                <h2 style={{ fontSize: 19 }}>{selectedResult.keySpec.keyNumber}</h2>
              </div>
              <button onClick={() => setSelectedResult(null)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold" style={{ marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Brand Manufacturer</span>
                <span style={{ color: 'var(--text-0)' }}>{selectedResult.keySpec.brand}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Lock Category</span>
                <span style={{ color: 'var(--text-0)' }}>{selectedResult.keySpec.category}</span>
              </div>
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Blank Number Reference</span>
                <span style={{ color: 'var(--text-0)' }}>{selectedResult.keySpec.blankNumber}</span>
              </div>
            </div>

            {selectedResult.keySpec.frontImageUrl && (
              <div className="grid grid-cols-2 gap-4" style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 18 }}>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 6 }}>Front Profile</span>
                  <img src={selectedResult.keySpec.frontImageUrl} alt="Front profile" style={{ width: '100%', height: 128, borderRadius: 12, border: '1px solid var(--border-2)' }} className="object-cover" />
                </div>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 6 }}>Back Profile</span>
                  {selectedResult.keySpec.backImageUrl ? (
                    <img src={selectedResult.keySpec.backImageUrl} alt="Back profile" style={{ width: '100%', height: 128, borderRadius: 12, border: '1px solid var(--border-2)' }} className="object-cover" />
                  ) : (
                    <div style={{ height: 128, borderRadius: 12, border: '1.5px dashed var(--border-2)' }} className="flex items-center justify-center">
                      <KeyRound style={{ width: 18, height: 18, color: 'var(--text-3)' }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedResult.keySpec.description && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 18 }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Description</span>
                <p style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 600, fontStyle: 'italic', marginTop: 2 }}>&ldquo;{selectedResult.keySpec.description}&rdquo;</p>
              </div>
            )}

            {/* ASSOCIATED CUSTOMER REGISTRY SECTION */}
            {selectedResult.customer && (
              <div style={{ borderTop: '1px solid rgba(240,185,11,0.2)', paddingTop: 16 }} className="space-y-3">
                <h3 style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--green)' }}>Associated Customer Compliance Record</h3>

                {(user?.role === 'SUPER_ADMIN' || selectedResult.customer.shopId === user?.shopId) ? (
                  <>
                    <div className="grid grid-cols-2 gap-4" style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 14, borderRadius: 14 }}>
                      <div>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Customer Name</span>
                        <span style={{ color: 'var(--text-0)', fontWeight: 700, fontSize: 12.5 }}>{selectedResult.customer.name}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Phone Number</span>
                        <span style={{ color: 'var(--text-0)', fontWeight: 700, fontSize: 12.5 }}>{selectedResult.customer.phone}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Vehicle Number</span>
                        <span style={{ color: 'var(--text-0)', fontWeight: 700, fontSize: 12.5 }}>{selectedResult.customer.vehicleNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Registry Date</span>
                        <span style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 12.5 }}>{new Date(selectedResult.customer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 14, borderRadius: 14, marginTop: 12 }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin style={{ width: 18, height: 18, color: 'var(--green)', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--text-0)', fontSize: 13 }}>GPS Coordinates</p>
                            <p style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2, fontWeight: 600 }}>Lat: {selectedResult.customer.latitude} &bull; Long: {selectedResult.customer.longitude}</p>
                          </div>
                        </div>
                        <a href={selectedResult.customer.mapsLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10.5, color: 'var(--gold)', fontWeight: 800 }} className="flex items-center gap-1 hover:underline">
                          <span>Google Maps</span><ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {selectedResult.customer.capturedAddress && (
                        <div style={{ fontSize: 10.5, color: 'var(--text-2)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8, paddingLeft: 26, fontWeight: 600 }}>
                          <span style={{ display: 'block', fontWeight: 800, fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>Captured Address</span>
                          <span>{selectedResult.customer.capturedAddress}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4" style={{ marginTop: 12 }}>
                      <div>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>Webcam Snapshot</span>
                        {selectedResult.customer.photoUrl ? (
                          <div style={{ width: '100%', height: 96, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-2)' }}>
                            <img src={getAssetUrl(selectedResult.customer.photoUrl)} alt="Customer" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div style={{ width: '100%', height: 96, borderRadius: 12, border: '1.5px dashed var(--border-2)' }} className="flex items-center justify-center">
                            <Camera style={{ width: 16, height: 16, color: 'var(--text-3)' }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>Customer Signature</span>
                        {selectedResult.customer.signatureUrl ? (
                          <div style={{ width: '100%', height: 96, borderRadius: 12, background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 8 }} className="flex items-center justify-center">
                            <img src={getAssetUrl(selectedResult.customer.signatureUrl)} alt="Signature" className="max-h-full max-w-full object-contain" />
                          </div>
                        ) : (
                          <div style={{ width: '100%', height: 96, borderRadius: 12, border: '1.5px dashed var(--border-2)' }} className="flex items-center justify-center">
                            <PenLine style={{ width: 16, height: 16, color: 'var(--text-3)' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 16, borderRadius: 16 }} className="space-y-3">
                    <p style={{ fontSize: 10.5, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 800 }}>Registry Location Overview (Other Workspace)</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Customer Name</span>
                        <span style={{ color: 'var(--text-0)', fontWeight: 700, fontSize: 12.5 }}>{selectedResult.customer.name}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Customer Mobile</span>
                        <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 12.5, fontFamily: 'monospace' }}>{selectedResult.customer.phone}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Registered Shop</span>
                        <span style={{ color: 'var(--text-0)', fontWeight: 700, fontSize: 12.5 }}>{selectedResult.customer.shop?.name || 'KEE Workspace Shop'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', fontWeight: 800 }}>Shop Mobile</span>
                        <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 12.5, fontFamily: 'monospace' }}>
                          {(() => {
                            let shopMobile = 'N/A';
                            if (selectedResult.customer.shop) {
                              try {
                                const details = typeof selectedResult.customer.shop.companyDetails === 'string'
                                  ? JSON.parse(selectedResult.customer.shop.companyDetails)
                                  : selectedResult.customer.shop.companyDetails;
                                shopMobile = details?.phone || selectedResult.customer.shop.phone || 'N/A';
                              } catch(e) {
                                shopMobile = selectedResult.customer.shop.phone || 'N/A';
                              }
                            }
                            return shopMobile;
                          })()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', padding: 10, borderRadius: 12, marginTop: 4 }}>
                      <AlertTriangle style={{ width: 14, height: 14, color: 'var(--text-3)', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, fontStyle: 'italic' }}>
                        Sensitive coordinates, webcam images, and proof signatures are hidden since this key registration was created in another duplicate key shop.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
              <button onClick={() => setSelectedResult(null)} className="btn btn-ghost">
                Close Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function CustomerRegistrationWizard({ t, api }) {
  const [step, setStep] = useState(1);
  const [keysList, setKeysList] = useState([]);
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('N/A');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('N/A');
  const [reason, setReason] = useState('N/A');
  const [keyNumber, setKeyNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [stateVal, setStateVal] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Chennai');
  const [country, setCountry] = useState('India');
  const [masterKeyId, setMasterKeyId] = useState('');

  // Inline OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [duplicateKeyWarning, setDuplicateKeyWarning] = useState(false);

  // Photos & Signatures (Webcam support)
  const [photoBase64, setPhotoBase64] = useState(null);
  const [signatureBase64, setSignatureBase64] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const videoRef = useRef(null);

  // Document Uploads
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadError, setUploadError] = useState('');

  // GPS Location Status
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [gpsTimestamp, setGpsTimestamp] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [capturedAddress, setCapturedAddress] = useState('');
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Canvas Ref for Signature
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await api.getMasterKeys();
        setKeysList(res);
        if (res.length > 0) {
          setKeyNumber(res[0].keyNumber);
          setMasterKeyId(res[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchKeys();
  }, []);

  useEffect(() => {
    if (addressLine || district || stateVal) {
      const finalAddress = `${addressLine}, ${district}, ${stateVal}, ${country}`;
      setAddress(finalAddress);
      setCapturedAddress(finalAddress);
    }
  }, [addressLine, district, stateVal, country]);

  const resolveAddress = async (lat, lng) => {
    setIsResolvingAddress(true);
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      if (res.ok) {
        const data = await res.json();
        const parts = [];
        if (data.locality) parts.push(data.locality);
        if (data.city) parts.push(data.city);
        if (data.principalSubdivision) parts.push(data.principalSubdivision);
        if (data.countryName) parts.push(data.countryName);
        if (parts.length > 0) {
          setCapturedAddress(parts.join(', '));
          setIsResolvingAddress(false);
          return;
        }
      }
    } catch (e) {
      console.warn('BigDataCloud address resolution failed:', e);
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setCapturedAddress(data.display_name);
          setIsResolvingAddress(false);
          return;
        }
      }
    } catch (e) {
      console.error('Nominatim address resolution failed:', e);
    }

    if (lat === 28.6139 && lng === 77.2090) {
      setCapturedAddress('Connaught Place, New Delhi, India');
    } else {
      setCapturedAddress(`Coordinates: ${lat}, ${lng}`);
    }
    setIsResolvingAddress(false);
  };

  const geocodeManualAddress = async (addrStr) => {
    setIsCapturingGps(true);
    setGpsError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addrStr)}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setLatitude(lat);
          setLongitude(lng);
          setIsCapturingGps(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Geocoding manual address failed:', e);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setIsCapturingGps(false);
        },
        (err) => {
          setLatitude(28.6139);
          setLongitude(77.2090);
          setIsCapturingGps(false);
        }
      );
    } else {
      setLatitude(28.6139);
      setLongitude(77.2090);
      setIsCapturingGps(false);
    }
  };

  useEffect(() => {
    if (step === 5) {
      const finalAddress = `${addressLine}, ${district}, ${stateVal}, India`;
      setCapturedAddress(finalAddress);
      geocodeManualAddress(finalAddress);
    }
  }, [step]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setWebcamStream(stream);
      setIsWebcamActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      alert('Camera access denied or unavailable. Please upload a photo instead.');
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setIsWebcamActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPhotoBase64(dataUrl);
    stopWebcam();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result);
      stopWebcam();
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  useEffect(() => {
    if (step !== 2 && webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
      setIsWebcamActive(false);
    }
  }, [step]);

  useEffect(() => {
    if (step === 3 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
    }
  }, [step]);

  const startDrawing = (e) => {
    if (e.cancelable) e.preventDefault();
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    isDrawing.current = true;
    const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (e.cancelable) e.preventDefault();
    if (!isDrawing.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => { isDrawing.current = false; };
  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureBase64(null);
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    setSignatureBase64(canvasRef.current.toDataURL());
  };

  const handleFileChange = (e) => {
    setUploadError('');
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPEG, PNG, and PDF document formats are accepted');
      return;
    }

    if (uploadedDocs.some(d => d.type === idProofType)) {
      setUploadError(`Document for ${idProofType} is already staged.`);
      return;
    }

    const newDocs = [...uploadedDocs, { type: idProofType, file }];
    setUploadedDocs(newDocs);

    const remaining = ['Aadhaar Card', 'Driving License', 'PAN Card', 'Voter ID'].filter(
      t => !newDocs.some(d => d.type === t)
    );
    if (remaining.length > 0) {
      setIdProofType(remaining[0]);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || !PHONE_REGEX.test(phone)) {
      alert(PHONE_REGEX_MESSAGE);
      return;
    }
    if (!keyNumber) {
      alert('Please enter a key code first');
      return;
    }

    // Duplicate key validation check across current customer registry
    try {
      const allCusts = await api.getCustomers();
      const duplicate = allCusts.find(c => c.keyNumber.toLowerCase() === keyNumber.trim().toLowerCase());
      if (duplicate) {
        setDuplicateKeyWarning(true);
        return;
      }
    } catch (e) {
      console.warn('Duplicate key validation check skipped:', e);
    }

    setDuplicateKeyWarning(false);
    setOtpError('');
    try {
      await api.sendOtp(phone, 'phone', 'customer_verify');
      setOtpSent(true);
    } catch (e) {
      setOtpError(e.message || 'Failed to send OTP code.');
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    try {
      await api.verifyOtp(phone, 'phone', 'customer_verify', enteredOtp);
      setOtpVerified(true);
    } catch (e) {
      setOtpError(e.message || 'Invalid OTP code. Please enter the correct code.');
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const finalLat = latitude || 28.6139;
      const finalLng = longitude || 77.2090;

      // If the typed key number matches an existing catalog entry, reference it
      // directly. Otherwise, send the "register this as a new key blank" details
      // inline as `manualKey` so the backend creates the MasterKey row in the SAME
      // transaction as the customer record — it can never be persisted without an
      // owning customer this way. (Previously this made a separate createShopKey()
      // call before createCustomer(); if the customer request failed afterwards for
      // any reason, the key row was left permanently orphaned with no customer.)
      let matchKey = keysList.find(k => k.keyNumber.toLowerCase() === keyNumber.toLowerCase());
      let finalMasterKeyId = masterKeyId || null;
      let manualKey = null;

      if (!matchKey && keyNumber) {
        manualKey = {
          brand: 'Manual Input',
          category: 'Vehicle Keys',
          blankNumber: keyNumber,
        };
      } else if (matchKey) {
        finalMasterKeyId = matchKey.id;
      }

      const customer = await api.createCustomer({
        name, phone, address, idProofType, idProofNumber, reason,
        keyNumber, vehicleNumber, masterKeyId: finalMasterKeyId, manualKey,
        latitude: finalLat,
        longitude: finalLng,
        mapsLink: `https://www.google.com/maps?q=${finalLat},${finalLng}`,
        capturedAddress: capturedAddress || 'Connaught Place, New Delhi, India',
        photoBase64, signatureBase64
      });

      for (const doc of uploadedDocs) {
        await api.uploadDocument(customer.id, doc.type, doc.file);
      }

      alert('Customer compliance record logged successfully!');
      resetWizard();
    } catch (e) {
      alert(`Submission failed: ${e.message}`);
    }
  };

  const resetWizard = () => {
    setName('');
    setPhone('');
    setAddress('N/A');
    setIdProofType('Aadhaar Card');
    setIdProofNumber('N/A');
    setReason('N/A');
    setKeyNumber('');
    setVehicleNumber('');
    setAddressLine('');
    setDistrict('');
    setStateVal('');
    setCountry('India');
    setOtpSent(false);
    setOtpVerified(false);
    setEnteredOtp('');
    setDuplicateKeyWarning(false);
    setPhotoBase64(null);
    setSignatureBase64(null);
    setUploadedDocs([]);
    setLatitude(null);
    setLongitude(null);
    setGpsTimestamp(null);
    setGpsError('');
    setCapturedAddress('');
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
    }
    setWebcamStream(null);
    setIsWebcamActive(false);
    setStep(1);
  };

  const WIZARD_STEPS = [
    { name: 'Contact & Key' },
    { name: 'ID Photo' },
    { name: 'Signature' },
    { name: 'Documents' },
    { name: 'Review' },
  ];

  const plainInputStyle = {
    width: '100%', background: 'var(--card-2)', border: '1.5px solid var(--border-2)',
    color: 'var(--text-0)', borderRadius: 13, padding: '13px 15px', fontSize: 14, outline: 'none'
  };

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><UserPlus /> New Customer</div>
          <h1>{t('register')}</h1>
          <p>Multi-step compliance onboarding — key issuance, identity capture &amp; GPS-stamped address, in five quick steps.</p>
        </div>
      </div>

      <div className="card wizard-card">
        <div className="step-indicator">
          {WIZARD_STEPS.map((s, i) => {
            const idx = i + 1;
            const done = step > idx;
            const current = step === idx;
            return (
              <React.Fragment key={s.name}>
                <div className={`step-item ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                  <div className="step-circle">{done ? <Check className="h-4 w-4" /> : idx}</div>
                  <div className="step-label">
                    <span className="num">Step {idx}</span>
                    <span className="name">{s.name}</span>
                  </div>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className="step-line"><div className="fill" style={{ width: done ? '100%' : '0%' }} /></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="wizard-body">
          {step === 1 && (
            <div className="animate-fade-in">
              <h3>Contact &amp; Key Credentials</h3>
              <p className="desc">Register the customer's contact details, vehicle &amp; key code, and residential address.</p>

              {duplicateKeyWarning && (
                <div className="animate-fade-in" style={{ display: 'flex', gap: 12, background: 'var(--red-dim)', border: '1px solid rgba(242,86,77,0.3)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                  <div className="icon-badge red" style={{ width: 36, height: 36, borderRadius: 11 }}><AlertTriangle className="h-4 w-4" /></div>
                  <div>
                    <div style={{ color: 'var(--red)', fontWeight: 800, fontSize: 13, fontFamily: 'var(--display)' }}>Duplicate key detected</div>
                    <p style={{ color: 'var(--text-2)', fontSize: 12, fontWeight: 600, marginTop: 4, lineHeight: 1.5 }}>
                      Key code <b style={{ color: 'var(--text-0)' }}>{keyNumber}</b> is already registered to an existing customer. Please verify and enter a unique key code.
                    </p>
                  </div>
                </div>
              )}

              <div className="form-grid">
                <div className="field">
                  <label>Full Customer Name</label>
                  <div className="input-wrap">
                    <User />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Rohan Malhotra" />
                  </div>
                </div>
                <div className="field">
                  <label>Vehicle Number</label>
                  <div className="input-wrap">
                    <Car />
                    <input type="text" required value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} placeholder="e.g. TN09B1234" />
                  </div>
                </div>

                <div className="field">
                  <label>Key Code / Key Number</label>
                  <div className="input-wrap">
                    <KeyRound />
                    <input
                      type="text" required value={keyNumber}
                      onChange={(e) => { setKeyNumber(e.target.value); setDuplicateKeyWarning(false); }}
                      placeholder="Enter key code (e.g. TN09B)"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="input-wrap" style={{ flex: 1 }}>
                      <Phone />
                      <input
                        type="tel" required value={phone}
                        onChange={(e) => { setPhone(e.target.value); setOtpVerified(false); setOtpSent(false); }}
                        placeholder="98765 00000"
                      />
                    </div>
                    {!otpVerified && (
                      <button type="button" onClick={handleSendOtp} disabled={!phone || !keyNumber} className="btn btn-primary btn-sm">
                        {otpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="field full">
                  <label>Address Line</label>
                  <div className="input-wrap">
                    <MapPin />
                    <input type="text" required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="e.g. Flat 101, Park Avenue" />
                  </div>
                </div>

                <div className="field">
                  <label>State</label>
                  <select
                    className="sel" value={stateVal}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setStateVal(selected);
                      const list = INDIAN_STATES_DISTRICTS[selected] || [];
                      setDistrict(list[0] || '');
                    }}
                  >
                    {Object.keys(INDIAN_STATES_DISTRICTS).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>District</label>
                  <select className="sel" value={district} onChange={(e) => setDistrict(e.target.value)}>
                    {(INDIAN_STATES_DISTRICTS[stateVal] || []).map(dt => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                  </select>
                </div>
                <div className="field full">
                  <label>Country</label>
                  <div className="input-wrap" style={{ opacity: 0.65 }}>
                    <Building2 />
                    <input type="text" readOnly value={country} style={{ cursor: 'not-allowed' }} />
                  </div>
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="animate-fade-in" style={{ background: 'var(--card-2)', border: '1.5px solid var(--border-2)', borderRadius: 16, padding: 18, marginTop: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600 }}>Enter the 4-digit code sent to the customer's phone</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, maxWidth: 280 }}>
                    <input
                      type="text" maxLength={4} value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      style={{ ...plainInputStyle, textAlign: 'center', fontWeight: 800, letterSpacing: 4 }}
                    />
                    <button type="button" onClick={handleVerifyOtp} className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                      Verify OTP
                    </button>
                  </div>
                  {otpError && <p style={{ color: 'var(--red)', fontSize: 11, fontWeight: 700, marginTop: 10 }}>{otpError}</p>}
                </div>
              )}

              {otpVerified && (
                <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--green-dim)', border: '1px solid rgba(62,207,106,0.3)', borderRadius: 14, padding: '12px 16px', marginTop: 20 }}>
                  <Check className="h-4 w-4" style={{ color: 'var(--green)' }} />
                  <span style={{ color: 'var(--green)', fontSize: 12.5, fontWeight: 700 }}>Customer phone number OTP verified successfully.</span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h3>Identity Photo Capture</h3>
              <p className="desc">Capture a live photo via webcam, or upload an existing image for the compliance record.</p>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
                <div className="capture-preview" style={{ width: 260, height: 200, borderRadius: 20, overflow: 'hidden', background: 'var(--card-2)', border: '1.5px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isWebcamActive ? (
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : photoBase64 ? (
                    <img src={photoBase64} alt="Identity preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="icon-badge" style={{ width: 56, height: 56, borderRadius: 16 }}><Camera className="h-6 w-6" /></div>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: '100%' }}>
                  {isWebcamActive ? (
                    <>
                      <button type="button" onClick={captureSnapshot} className="btn btn-primary btn-sm">
                        <Camera className="h-4 w-4" /> Capture Photo
                      </button>
                      <button type="button" onClick={stopWebcam} className="btn btn-danger-outline btn-sm">
                        <X className="h-4 w-4" /> Stop Camera
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={startWebcam} className="btn btn-outline btn-sm">
                        <Camera className="h-4 w-4" /> {photoBase64 ? 'Re-take Photo' : 'Start Webcam / Mobile Cam'}
                      </button>
                      <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                        <UploadCloud className="h-4 w-4" />
                        <span>Upload Image</span>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h3>Signature Verification</h3>
              <p className="desc">Capture the customer's signature to authorize this duplicate key issuance.</p>

              <div className="field" style={{ maxWidth: 420, margin: '0 auto' }}>
                <label style={{ textAlign: 'center' }}>Customer Signature</label>
                {signatureBase64 ? (
                  <div className="sig-frame" style={{ background: 'var(--card-2)', border: '1.5px solid var(--border-2)', borderRadius: 16, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={signatureBase64} alt="Signature preview" style={{ height: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef} width={384} height={150}
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                    className="signature-canvas-container sig-frame" style={{ width: '100%', height: 150 }}
                  />
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                  {!signatureBase64 ? (
                    <>
                      <button type="button" onClick={clearSignature} className="btn btn-ghost btn-sm">Clear</button>
                      <button type="button" onClick={saveSignature} className="btn btn-primary btn-sm"><PenLine className="h-4 w-4" /> Lock Signature</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setSignatureBase64(null)} className="btn btn-ghost btn-sm"><RotateCcw className="h-4 w-4" /> Re-draw</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <h3>Compliance Document Upload</h3>
              <p className="desc">Upload a copy of the government ID proof used to verify this customer.</p>

              <div className="field">
                <label>Document Type</label>
                <select className="sel" value={idProofType} onChange={(e) => setIdProofType(e.target.value)}>
                  <option value="Aadhaar Card" disabled={uploadedDocs.some(d => d.type === 'Aadhaar Card')}>Aadhaar Card</option>
                  <option value="Driving License" disabled={uploadedDocs.some(d => d.type === 'Driving License')}>Driving License</option>
                  <option value="PAN Card" disabled={uploadedDocs.some(d => d.type === 'PAN Card')}>PAN Card</option>
                  <option value="Voter ID" disabled={uploadedDocs.some(d => d.type === 'Voter ID')}>Voter ID</option>
                </select>
              </div>

              <label htmlFor="docUploadInput" className="dropzone" style={{ marginTop: 18 }}>
                <div className="icon-badge"><UploadCloud className="h-5 w-5" /></div>
                <div className="dz-title">Drop or browse a copy of {idProofType}</div>
                <div className="dz-sub">JPEG, PNG or PDF — up to 5MB</div>
                <input type="file" id="docUploadInput" onChange={handleFileChange} style={{ display: 'none' }} accept="image/jpeg, image/png, application/pdf" />
              </label>
              {uploadError && <p style={{ color: 'var(--red)', fontSize: 12, fontWeight: 700, marginTop: 12, textAlign: 'center' }}>{uploadError}</p>}

              {uploadedDocs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
                  <span className="side-section-label" style={{ padding: 0 }}>Staged ID copies ({uploadedDocs.length})</span>
                  {uploadedDocs.map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'var(--card-2)', border: '1px solid var(--border-2)', borderRadius: 13, padding: '12px 16px' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 12.5, fontFamily: 'var(--display)' }}>{doc.type}</span>
                      <span style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file.name}</span>
                      <button type="button" onClick={() => setUploadedDocs(uploadedDocs.filter((_, i) => i !== idx))} className="icon-btn">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in">
              <h3>Review &amp; GPS Stamp</h3>
              <p className="desc">Confirm the details below and capture a GPS-stamped address before submitting.</p>

              <div className="form-grid" style={{ paddingBottom: 22, marginBottom: 22, borderBottom: '1px solid var(--border)' }}>
                <div className="field"><label>Customer</label><div style={{ color: 'var(--text-0)', fontWeight: 700, fontSize: 14 }}>{name}</div></div>
                <div className="field"><label>Phone</label><div style={{ color: 'var(--text-0)', fontWeight: 700, fontSize: 14 }}>{phone}</div></div>
                <div className="field"><label>Vehicle Number</label><div style={{ color: 'var(--text-0)', fontWeight: 700, fontSize: 14 }}>{vehicleNumber}</div></div>
                <div className="field"><label>Key Blank</label><div style={{ color: 'var(--text-0)', fontWeight: 700, fontSize: 14 }}>{keyNumber}</div></div>
                <div className="field full"><label>Registered Address</label><div style={{ color: 'var(--text-0)', fontWeight: 700, fontSize: 14 }}>{addressLine}, {district}, {stateVal}, India</div></div>
              </div>

              <span className="side-section-label" style={{ padding: 0, display: 'block', marginBottom: 12 }}>Automatic GPS compliance stamp</span>

              {isCapturingGps ? (
                <div className="loc-box">
                  <div className="loc-info">
                    <div className="icon-badge"><RefreshCw className="h-5 w-5 animate-spin" /></div>
                    <div className="loc-text">
                      <div className="t1">Locating…</div>
                      <div className="t2">Fetching device GPS coordinates</div>
                    </div>
                  </div>
                </div>
              ) : gpsError ? (
                <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(240,185,11,0.3)', borderRadius: 16, padding: 18 }}>
                  <p style={{ color: 'var(--amber)', fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>{gpsError}</p>
                  <div className="form-grid">
                    <input
                      type="number" step="0.0001" placeholder="Latitude" value={latitude || ''}
                      onChange={(e) => { const lat = Number(e.target.value); setLatitude(lat); if (longitude) resolveAddress(lat, longitude); }}
                      style={plainInputStyle}
                    />
                    <input
                      type="number" step="0.0001" placeholder="Longitude" value={longitude || ''}
                      onChange={(e) => { const lng = Number(e.target.value); setLongitude(lng); if (latitude) resolveAddress(latitude, lng); }}
                      style={plainInputStyle}
                    />
                  </div>
                  {isResolvingAddress ? (
                    <p style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic', marginTop: 10 }}>Resolving address…</p>
                  ) : (
                    capturedAddress && <p style={{ fontSize: 11, color: 'var(--text-2)', fontStyle: 'italic', marginTop: 10 }}>Resolved: {capturedAddress}</p>
                  )}
                </div>
              ) : (
                <div className="loc-box" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div className="loc-info">
                      <div className="icon-badge green"><Crosshair className="h-5 w-5" /></div>
                      <div className="loc-text">
                        <div className="t1">GPS Stamped</div>
                        <div className="t2">Lat {latitude} · Long {longitude}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button type="button" onClick={() => setIsEditingAddress(!isEditingAddress)} className="btn btn-outline btn-sm">
                        {isEditingAddress ? 'Done' : 'Edit Location'}
                      </button>
                      <span className="badge badge-active"><span className="dot" />Secured</span>
                    </div>
                  </div>

                  {isResolvingAddress ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)', fontWeight: 700, marginTop: 14 }}>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ color: 'var(--green)' }} /> Resolving address…
                    </div>
                  ) : (
                    <div style={{ marginTop: 14 }}>
                      {isEditingAddress ? (
                        <textarea
                          value={capturedAddress} onChange={(e) => setCapturedAddress(e.target.value)}
                          rows={2} placeholder="Enter manual address details..."
                          style={{ width: '100%', background: 'var(--card-2)', border: '1.5px solid var(--border-2)', borderRadius: 13, padding: '12px 14px', color: 'var(--text-0)', fontSize: 13, outline: 'none' }}
                        />
                      ) : (
                        capturedAddress && (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: 'var(--text-2)', fontWeight: 600, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                            <MapPin className="h-4 w-4" style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }} />
                            <span>{capturedAddress}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="wizard-foot">
          {step > 1 ? (
            <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : <span />}

          <div className="wizard-foot-right" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span className="wizard-foot-steplabel" style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 700 }}>Step {step} of {WIZARD_STEPS.length}</span>

            {step === 1 && (
              <button
                type="button" className="btn btn-primary"
                disabled={!name || !phone || !keyNumber || !vehicleNumber || !otpVerified || !addressLine || !district || !stateVal || duplicateKeyWarning}
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === 2 && (
              <button type="button" className="btn btn-primary" disabled={!photoBase64} onClick={() => setStep(3)}>
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === 3 && (
              <button
                type="button" className="btn btn-primary"
                onClick={() => {
                  if (!signatureBase64 && canvasRef.current) {
                    setSignatureBase64(canvasRef.current.toDataURL());
                  }
                  setStep(4);
                }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === 4 && (
              <button type="button" className="btn btn-primary" onClick={() => setStep(5)}>
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === 5 && (
              <button type="button" className="btn btn-primary" disabled={isCapturingGps} onClick={handleFinalSubmit}>
                {isCapturingGps ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> GPS Locating…
                  </>
                ) : (
                  <>
                    Submit Compliance Record <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 10: CUSTOMER HISTORY LOOKUP (SHOP ADMIN ONLY)
// ============================================================================
function CustomerHistoryView({ t, api, searchDispatch }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState(null);

  // Picks up a query dispatched from the global header search panel
  // (filter = "Customer").
  useEffect(() => {
    if (searchDispatch && searchDispatch.type === 'customer') {
      setSearch(searchDispatch.query);
    }
  }, [searchDispatch?.nonce]);

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhoneVal, setEditPhoneVal] = useState('');
  const [editVehicleNumber, setEditVehicleNumber] = useState('');
  const [editKeyNumber, setEditKeyNumber] = useState('');
  const [editAddressLine, setEditAddressLine] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editStateVal, setEditStateVal] = useState('');
  const [editIdProofType, setEditIdProofType] = useState('Aadhaar Card');
  const [editIdProofNumber, setEditIdProofNumber] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editUploadFile, setEditUploadFile] = useState(null);

  useEffect(() => {
    if (selectedCust) {
      setEditName(selectedCust.name || '');
      setEditPhoneVal(selectedCust.phone || '');
      setEditVehicleNumber(selectedCust.vehicleNumber || '');
      setEditKeyNumber(selectedCust.keyNumber || '');
      const remainingEditTypes = ['Aadhaar Card', 'Driving License', 'PAN Card', 'Voter ID'].filter(
        t => !selectedCust.documents?.some(d => d.documentType === t || d.documentType === `${t} Copy`)
      );
      if (remainingEditTypes.length > 0) {
        setEditIdProofType(remainingEditTypes[0]);
      } else {
        setEditIdProofType(selectedCust.idProofType || 'Aadhaar Card');
      }
      setEditIdProofNumber(selectedCust.idProofNumber || '');
      setEditReason(selectedCust.reason || '');
      
      const addr = selectedCust.capturedAddress || selectedCust.address || '';
      const parts = addr.split(',').map(p => p.trim());
      setEditAddressLine(parts[0] || '');
      setEditDistrict(parts[1] || '');
      setEditStateVal(parts[2] || '');
    } else {
      setIsEditing(false);
      setEditUploadFile(null);
    }
  }, [selectedCust]);

  useEffect(() => {
    fetchHistory();
  }, [search]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers(search);
      setCustomers(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!editPhoneVal || !PHONE_REGEX.test(editPhoneVal)) {
      alert(PHONE_REGEX_MESSAGE);
      return;
    }
    try {
      const finalAddress = `${editAddressLine}, ${editDistrict}, ${editStateVal}, India`;
      await api.updateCustomer(selectedCust.id, {
        name: editName,
        phone: editPhoneVal,
        address: finalAddress,
        idProofType: editIdProofType,
        idProofNumber: editIdProofNumber,
        reason: editReason,
        keyNumber: editKeyNumber,
        vehicleNumber: editVehicleNumber,
        capturedAddress: finalAddress
      });

      if (editUploadFile) {
        await api.uploadDocument(selectedCust.id, `${editIdProofType} Copy`, editUploadFile);
      }

      alert('Customer compliance record updated successfully!');
      setIsEditing(false);
      setEditUploadFile(null);
      setSelectedCust(null);
      fetchHistory();
    } catch (err) {
      alert(err.message || 'Failed to save customer edits.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><FileCheck /> Compliance Registry</div>
          <h1>{t('history')}</h1>
          <p>Search and verify past duplicate-key registrations and compliance submissions.</p>
        </div>
      </div>

      {/* The search box lives outside the loading/results swap below so it
          never unmounts while typing - every keystroke re-triggers the
          fetch (briefly flipping `loading`), but the input itself stays
          mounted the whole time and keeps focus. */}
      <div className="card table-card">
        <div className="table-head">
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 17 }}>
            Registration Log <span style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: 13 }}>({customers.length})</span>
          </h2>
          <div className="search-box">
            <Search />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, key code&hellip;"
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 200 }}>
            <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading compliance records&hellip;</span>
          </div>
        ) : customers.length === 0 ? (
          <p style={{ padding: 24, fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600 }}>
            No compliance records match this search.
          </p>
        ) : (
        <table className="kee-table history-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Vehicle</th>
              <th>Key Code</th>
              <th>Location</th>
              <th>Logged</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} onClick={() => setSelectedCust(c)} style={{ cursor: 'pointer' }}>
                <td data-label="Customer">
                  <div className="cell-primary">{c.name}</div>
                </td>
                <td className="cell-sub" data-label="Phone" style={{ fontWeight: 700, color: 'var(--text-2)' }}>{c.phone}</td>
                <td className="cell-sub" data-label="Vehicle" style={{ fontWeight: 700, color: 'var(--text-2)' }}>{c.vehicleNumber || 'N/A'}</td>
                <td data-label="Key Code">
                  <span className="badge badge-active"><span className="dot" />{c.keyNumber}</span>
                </td>
                <td className="cell-sub" data-label="Location" style={{ fontWeight: 700, color: 'var(--text-2)', maxWidth: 180 }}>
                  <span className="flex items-center gap-1" style={{ overflow: 'hidden' }}>
                    <MapPin style={{ width: 13, height: 13, color: 'var(--green)', flexShrink: 0 }} />
                    <span className="truncate">{c.capturedAddress || 'N/A'}</span>
                  </span>
                </td>
                <td className="cell-sub" data-label="Logged" style={{ fontWeight: 700, color: 'var(--text-2)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td data-label="Actions">
                  <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedCust(c); }} className="icon-btn" title="View compliance file">
                      <Eye />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {selectedCust && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4 md:p-10" style={{ background: 'rgba(5,4,3,0.82)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 640, margin: 'auto', padding: 28 }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><FileCheck /> Compliance File</span>
                <h2 style={{ fontSize: 19 }}>{selectedCust.name}</h2>
              </div>
              <button onClick={() => setSelectedCust(null)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold" style={{ marginBottom: 18 }}>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Phone Contact</span>
                    <span style={{ color: 'var(--text-0)' }}>{selectedCust.phone}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Registry Date</span>
                    <span style={{ color: 'var(--text-0)' }}>{new Date(selectedCust.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Vehicle Number</span>
                    <span style={{ color: 'var(--text-0)' }}>{selectedCust.vehicleNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 3 }}>Key Blank Code</span>
                    <span className="badge badge-active"><span className="dot" />{selectedCust.keyNumber}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', borderRadius: 16, padding: 14, marginBottom: 18 }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin style={{ width: 18, height: 18, color: 'var(--green)', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--text-0)', fontSize: 13 }}>GPS Coordinates</p>
                        <p style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2, fontWeight: 600 }}>Lat: {selectedCust.latitude} &bull; Long: {selectedCust.longitude}</p>
                      </div>
                    </div>
                    <a href={selectedCust.mapsLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10.5, color: 'var(--gold)', fontWeight: 800 }} className="flex items-center gap-1 hover:underline">
                      <span>Google Maps</span><ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  {selectedCust.capturedAddress && (
                    <div style={{ fontSize: 10.5, color: 'var(--text-2)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8, paddingLeft: 26, fontWeight: 600 }}>
                      <span style={{ display: 'block', fontWeight: 800, fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>Captured Address</span>
                      <span>{selectedCust.capturedAddress}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4" style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 18 }}>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 6 }}>Webcam Photo</span>
                    {selectedCust.photoUrl ? (
                      <div style={{ width: '100%', height: 128, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-2)' }}>
                        <img src={getAssetUrl(selectedCust.photoUrl)} alt="Customer snapshot" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: 128, borderRadius: 12, border: '1.5px dashed var(--border-2)' }} className="flex items-center justify-center">
                        <Camera style={{ width: 18, height: 18, color: 'var(--text-3)' }} />
                      </div>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 6 }}>Customer Signature</span>
                    {selectedCust.signatureUrl ? (
                      <div style={{ width: '100%', height: 128, borderRadius: 12, background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 10 }} className="flex items-center justify-center">
                        <img src={getAssetUrl(selectedCust.signatureUrl)} alt="Signature drawing" className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: 128, borderRadius: 12, border: '1.5px dashed var(--border-2)' }} className="flex items-center justify-center">
                        <PenLine style={{ width: 18, height: 18, color: 'var(--text-3)' }} />
                      </div>
                    )}
                  </div>
                </div>

                {selectedCust.documents && selectedCust.documents.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 4 }} className="space-y-2">
                    <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 4 }}>Attached ID Copies</span>
                    {selectedCust.documents.map(d => (
                      <div key={d.id} style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 10, borderRadius: 12 }} className="flex items-center justify-between text-xs">
                        <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{d.documentType} ({d.fileKey})</span>
                        <button
                          type="button"
                          onClick={() => downloadAsset(d.fileUrl, d.fileKey || 'document')}
                          style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--gold)' }}
                          className="hover:underline"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                  <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm">
                    <Edit /> Edit Details
                  </button>
                  <button onClick={() => setSelectedCust(null)} className="btn btn-ghost btn-sm">Close File</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSaveChanges}>
                <div className="form-grid">
                  <div className="field">
                    <label>Full Customer Name</label>
                    <div className="input-wrap">
                      <User />
                      <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <div className="input-wrap">
                      <Phone />
                      <input type="tel" required value={editPhoneVal} onChange={(e) => setEditPhoneVal(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label>Vehicle Number</label>
                    <div className="input-wrap">
                      <Car />
                      <input type="text" required value={editVehicleNumber} onChange={(e) => setEditVehicleNumber(e.target.value.toUpperCase())} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Key Blank Code</label>
                    <div className="input-wrap">
                      <KeyRound />
                      <input type="text" required value={editKeyNumber} onChange={(e) => setEditKeyNumber(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 4 }}>
                  <h3 className="eyebrow" style={{ marginBottom: 12 }}><MapPin /> Manual Address Details</h3>

                  <div className="field">
                    <label>Address Line</label>
                    <div className="input-wrap">
                      <MapPin />
                      <input type="text" required value={editAddressLine} onChange={(e) => setEditAddressLine(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label>District</label>
                      <div className="input-wrap">
                        <Navigation />
                        <input type="text" required value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)} />
                      </div>
                    </div>
                    <div className="field">
                      <label>State</label>
                      <div className="input-wrap">
                        <Navigation />
                        <input type="text" required value={editStateVal} onChange={(e) => setEditStateVal(e.target.value)} />
                      </div>
                    </div>
                    <div className="field full">
                      <label>Country</label>
                      <div className="input-wrap">
                        <Navigation />
                        <input type="text" readOnly value="India" style={{ opacity: .55, cursor: 'not-allowed' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 4 }}>
                  <h3 className="eyebrow" style={{ marginBottom: 12 }}><ShieldCheck /> Update ID Verification Document</h3>
                  <div className="form-grid">
                    <div className="field">
                      <label>Document ID Type</label>
                      <select
                        className="sel"
                        value={editIdProofType} onChange={(e) => setEditIdProofType(e.target.value)}
                      >
                        <option value="Aadhaar Card" disabled={selectedCust?.documents?.some(d => d.documentType === 'Aadhaar Card' || d.documentType === 'Aadhaar Card Copy')}>Aadhaar Card</option>
                        <option value="Driving License" disabled={selectedCust?.documents?.some(d => d.documentType === 'Driving License' || d.documentType === 'Driving License Copy')}>Driving License</option>
                        <option value="PAN Card" disabled={selectedCust?.documents?.some(d => d.documentType === 'PAN Card' || d.documentType === 'PAN Card Copy')}>PAN Card</option>
                        <option value="Voter ID" disabled={selectedCust?.documents?.some(d => d.documentType === 'Voter ID' || d.documentType === 'Voter ID Copy')}>Voter ID</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Upload New File Copy</label>
                      <div className="dropzone" style={{ padding: '16px 12px', position: 'relative' }}>
                        <UploadCloud style={{ width: 20, height: 20, color: 'var(--gold)' }} />
                        <span className="dz-sub">{editUploadFile ? editUploadFile.name : 'JPEG, PNG or PDF'}</span>
                        <input
                          type="file"
                          onChange={(e) => setEditUploadFile(e.target.files[0])}
                          accept="image/jpeg, image/png, application/pdf"
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditUploadFile(null);
                    }}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT 11.5: CUSTOMER CARE VIEW (SUPPORT & SKILLS TRAINING)
// ============================================================================
export function CustomerCareView({ t, api }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.getSupportConfig();
      setConfig(res);
    } catch (e) {
      console.error('Failed to load support config:', e);
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeThumbnailAndId = (url) => {
    if (!url) return { id: null, thumbnail: 'https://images.unsplash.com/photo-1619542402915-dcaf30e4e2a1?w=300&q=80' };
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return {
      id: videoId,
      thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 'https://images.unsplash.com/photo-1619542402915-dcaf30e4e2a1?w=300&q=80'
    };
  };

  if (loading) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 260 }}>
        <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading support resources&hellip;</span>
      </div>
    );
  }

  const whatsapp = config?.whatsapp || '+91 98765 43210';
  const cleanPhone = whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Phone /> Customer Care</div>
          <h1>Support & Training Center</h1>
          <p>Reach KEE technical support and level up with locksmith training resources.</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Support Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 22 }}>
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
              <div className="icon-badge solid"><Phone /></div>
              <div>
                <h2 style={{ fontSize: 16 }}>Contact Live Agent</h2>
                <span className="pill-badge" style={{ marginTop: 6 }}><span className="dot" />Mon&ndash;Sat, 9 AM&ndash;7 PM IST</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600, lineHeight: 1.6 }}>
              Live customer support is on hand to help with your key-making machines or duplicate key portal dashboard.
            </p>
          </div>

          <div className="loc-box" style={{ background: 'rgba(37,211,102,0.08)', borderColor: 'rgba(37,211,102,0.28)' }}>
            <div className="loc-info">
              <div className="icon-badge" style={{ background: 'rgba(37,211,102,0.16)', color: '#25d366' }}>
                <Phone />
              </div>
              <div className="loc-text">
                <span className="t1" style={{ display: 'block' }}>{whatsapp}</span>
                <span className="t2">Direct WhatsApp Support</span>
              </div>
            </div>
            <a
              href={`https://wa.me/${cleanPhone || '919876543210'}?text=Hi%20KEE%20Support%2C%20I%20have%20a%20question%20regarding%20my%20duplicate%20key%20shop%20platform.`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
              style={{ background: '#25d366', color: '#062b17', flexShrink: 0 }}
            >
              <Phone /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Video Resources Card */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 16 }}>Locksmith Skill Upgrades</h2>
              <span className="sub">Video tutorials from duplicate key experts</span>
            </div>
            <Radio style={{ width: 18, height: 18, color: 'var(--gold)' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
            {config?.videos && config.videos.length > 0 ? (
              config.videos.map((vid, idx) => {
                const { thumbnail } = getYoutubeThumbnailAndId(vid.url);
                return (
                  <div key={idx} className="product-card" style={{ borderRadius: 14 }}>
                    <div className="product-img" style={{ height: 92 }}>
                      <img src={thumbnail} alt={vid.name} className="w-full h-full object-cover" style={{ position: 'absolute', inset: 0, opacity: .6 }} />
                      <a
                        href={vid.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center"
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }}
                      >
                        <span style={{ width: 32, height: 32, borderRadius: 999, background: 'linear-gradient(135deg, var(--gold), var(--gold-2))', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-pulse">
                          <PlayCircle style={{ width: 18, height: 18 }} />
                        </span>
                      </a>
                    </div>
                    <div className="product-body" style={{ padding: 12, gap: 4 }}>
                      <span style={{ fontSize: 9, color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '.05em' }}>Training Material</span>
                      <h4 className="pname" style={{ fontSize: 12.5 }}>{vid.name}</h4>
                      <a href={vid.url} target="_blank" rel="noreferrer" style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600 }} className="hover:underline truncate block">Watch Link</a>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600, fontStyle: 'italic', gridColumn: '1 / -1', padding: '32px 0', textAlign: 'center' }}>
                No skill upgrade videos currently available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT 11.6: SUPPORT CONFIG VIEW (SUPER ADMIN SUPPORT CONFIGURATION)
// ============================================================================
export function SupportConfigView({ t, api }) {
  const [whatsapp, setWhatsapp] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.getSupportConfig();
      setWhatsapp(res.whatsapp || '');
      setVideos(res.videos || []);
    } catch (e) {
      console.error('Failed to load support config:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSupportConfig({ whatsapp, videos });
      alert('Support configuration updated successfully!');
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 260 }}>
        <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading support configuration&hellip;</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><LifeBuoy /> Platform Support</div>
          <h1>Customer Support Configuration</h1>
          <p>Configure the global customer care contact and training video links visible to every shop.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSave}>
          <div className="field">
            <label>Customer Support WhatsApp Number</label>
            <div className="input-wrap">
              <MessageCircle />
              <input
                type="text" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 6 }}>
            <div className="section-title">
              <div>
                <h2 style={{ fontSize: 15 }}>Support & Training Videos</h2>
                <span className="sub">{videos.length} video{videos.length === 1 ? '' : 's'} configured</span>
              </div>
              <button
                type="button"
                onClick={() => setVideos([...videos, { name: '', url: '' }])}
                className="btn btn-outline btn-sm"
              >
                <Plus /> Add Video
              </button>
            </div>

            {videos.length === 0 ? (
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600, fontStyle: 'italic' }}>
                No videos configured. Click &ldquo;Add Video&rdquo; to add locksmith training links.
              </p>
            ) : (
              <div className="space-y-3" style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                {videos.map((vid, idx) => (
                  <div key={idx} style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', borderRadius: 14, padding: 16, position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setVideos(videos.filter((_, i) => i !== idx))}
                      className="icon-btn"
                      style={{ position: 'absolute', top: 12, right: 12, color: 'var(--red)' }}
                      title="Remove video"
                    >
                      <X />
                    </button>
                    <div className="form-grid" style={{ paddingRight: 36 }}>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>Video Title / Name</label>
                        <div className="input-wrap">
                          <PlayCircle />
                          <input
                            type="text" required value={vid.name}
                            onChange={(e) => {
                              const newVids = [...videos];
                              newVids[idx].name = e.target.value;
                              setVideos(newVids);
                            }}
                            placeholder="e.g. Locksmith Career Income"
                          />
                        </div>
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <label>YouTube URL</label>
                        <div className="input-wrap">
                          <ExternalLink />
                          <input
                            type="url" required value={vid.url}
                            onChange={(e) => {
                              const newVids = [...videos];
                              newVids[idx].url = e.target.value;
                              setVideos(newVids);
                            }}
                            placeholder="https://www.youtube.com/watch?v=..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end" style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20 }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <RefreshCw className="animate-spin" /> : <Check />}
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShopSettingsView({ t, api }) {
  const { user } = useAuth();
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [gst, setGst] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [shopPhoto, setShopPhoto] = useState(null);
  const [shopLicense, setShopLicense] = useState(null);
  const [ownerAadhaar, setOwnerAadhaar] = useState(null);
  const [docUploading, setDocUploading] = useState(null); // which doc slot is currently uploading
  const [loading, setLoading] = useState(true);

  // Verification states
  const [revealPassword, setRevealPassword] = useState(false);
  const [showPassVerifyModal, setShowPassVerifyModal] = useState(false);
  const [passVerifyInput, setPassVerifyInput] = useState('');
  const [passVerifyError, setPassVerifyError] = useState('');
  const [passVerifyLoading, setPassVerifyLoading] = useState(false);
  const [showVerifyPass, setShowVerifyPass] = useState(false);
  const [otpShowNewPass, setOtpShowNewPass] = useState(false);
  const [otpShowConfirmPass, setOtpShowConfirmPass] = useState(false);
  const [revealedPasswordVal, setRevealedPasswordVal] = useState('');

  // OTP Reset states inside Settings
  const [otpResetOpen, setOtpResetOpen] = useState(false);
  const [otpResetMethod, setOtpResetMethod] = useState(null); // 'email' | 'phone'
  const [otpResetIdentifier, setOtpResetIdentifier] = useState('');
  const [otpResetOtpInput, setOtpResetOtpInput] = useState('');
  const [otpResetSent, setOtpResetSent] = useState(false);
  const [otpResetVerified, setOtpResetVerified] = useState(false);
  const [otpResetNewPassword, setOtpResetNewPassword] = useState('');
  const [otpResetConfirmPassword, setOtpResetConfirmPassword] = useState('');
  const [otpResetLoading, setOtpResetLoading] = useState(false);
  const [otpResetError, setOtpResetError] = useState('');
  const [otpResetSuccess, setOtpResetSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Maps the local UI slot key to the ShopDocument.documentType value the
  // backend uses (see backend/src/common/shop-document.util.ts).
  const DOC_TYPE_BY_KEY = { shopPhoto: 'SHOP_PHOTO', shopLicense: 'SHOP_LICENSE', ownerAadhaar: 'OWNER_AADHAAR' };
  const DOC_SETTERS = { shopPhoto: setShopPhoto, shopLicense: setShopLicense, ownerAadhaar: setOwnerAadhaar };
  const DOC_VALUES = () => ({ shopPhoto, shopLicense, ownerAadhaar });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      setShopName(res.name);
      setLogoUrl(res.logoUrl || '');

      if (res.companyDetails) {
        try {
          const details = JSON.parse(res.companyDetails);
          setAddress(details.address || '');
          setGst(details.gst || '');
          setPhone(details.phone || '');
        } catch (err) {
          setAddress('');
          setGst('');
          setPhone('');
        }
      }

      // Verification documents now come from the relational ShopDocument
      // table (res.documents), not from companyDetails JSON. Only the
      // most-recent active document per type is kept (the backend already
      // soft-deletes the previous one on replace, but findMany could still
      // return more than one in edge cases, so pick the newest defensively).
      const docsByType = {};
      for (const doc of res.documents || []) {
        const existing = docsByType[doc.documentType];
        if (!existing || new Date(doc.createdAt) > new Date(existing.createdAt)) {
          docsByType[doc.documentType] = doc;
        }
      }
      for (const key of Object.keys(DOC_TYPE_BY_KEY)) {
        DOC_SETTERS[key](docsByType[DOC_TYPE_BY_KEY[key]] || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const persistCompanyDetails = async (overrides = {}) => {
    const companyDetails = JSON.stringify({ address, phone, gst, ...overrides });
    await api.updateSettings({ name: shopName, logoUrl, companyDetails });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!PHONE_REGEX.test(phone)) {
      alert(PHONE_REGEX_MESSAGE);
      return;
    }
    try {
      await persistCompanyDetails();
      alert('Shop workspace settings saved successfully!');
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDocUpload = async (docType, file) => {
    if (!file) return;
    setDocUploading(docType);
    try {
      // Backend soft-deletes any existing active document of this type and
      // creates a new ShopDocument row - no separate delete call needed here.
      const uploaded = await api.uploadSettingsDocument(DOC_TYPE_BY_KEY[docType], file);
      DOC_SETTERS[docType](uploaded);
    } catch (err) {
      alert(err.message || 'Document upload failed');
    } finally {
      setDocUploading(null);
    }
  };

  const handleDocRemove = async (docType) => {
    const current = DOC_VALUES()[docType];
    if (!current) return;
    if (!confirm('Remove this document?')) return;
    try {
      await api.deleteSettingsDocument(current.id);
      DOC_SETTERS[docType](null);
    } catch (err) {
      alert(err.message || 'Failed to remove document');
    }
  };

  const handlePasswordVerificationSubmit = async (e) => {
    e.preventDefault();
    setPassVerifyError('');
    setPassVerifyLoading(true);
    try {
      await api.changePassword(passVerifyInput, passVerifyInput);
      setRevealedPasswordVal(passVerifyInput);
      setRevealPassword(true);
      setShowPassVerifyModal(false);
      setPassVerifyInput('');
    } catch (err) {
      setPassVerifyError(err.message || 'Incorrect password entered.');
    } finally {
      setPassVerifyLoading(false);
    }
  };

  // OTP Reset handlers
  const handleOtpResetSend = async () => {
    if (!otpResetIdentifier) {
      alert('Please enter your registered email or phone number');
      return;
    }
    try {
      await api.sendOtp(otpResetIdentifier, otpResetMethod || 'email', 'reset');
      setOtpResetSent(true);
      setOtpResetError('');
    } catch (err) {
      alert(err.message || 'Failed to send OTP code.');
    }
  };

  const handleOtpResetVerify = async (e) => {
    e.preventDefault();
    setOtpResetLoading(true);
    try {
      await api.verifyOtp(otpResetIdentifier, otpResetMethod || 'email', 'reset', otpResetOtpInput);
      setOtpResetVerified(true);
      setOtpResetError('');
    } catch (err) {
      setOtpResetError(err.message || 'Invalid OTP code. Please enter the correct code.');
    } finally {
      setOtpResetLoading(false);
    }
  };

  const handleOtpResetSubmit = async (e) => {
    e.preventDefault();
    if (otpResetNewPassword !== otpResetConfirmPassword) {
      setOtpResetError('Passwords do not match');
      return;
    }
    setOtpResetLoading(true);
    try {
      await api.resetPasswordPublic(otpResetIdentifier, otpResetMethod || 'email', otpResetNewPassword);
      setRevealedPasswordVal(otpResetNewPassword);
      setOtpResetSuccess(true);
      alert('Password updated successfully!');
      setOtpResetOpen(false);
      // Reset flow variables
      setOtpResetSent(false);
      setOtpResetVerified(false);
      setOtpResetIdentifier('');
      setOtpResetOtpInput('');
      setOtpResetNewPassword('');
      setOtpResetConfirmPassword('');
    } catch (err) {
      setOtpResetError(err.message || 'Failed to update password');
    } finally {
      setOtpResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 260 }}>
        <RefreshCw className="animate-spin" style={{ width: 28, height: 28, color: 'var(--gold)' }} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Loading workspace settings…</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Settings /> Workspace Configuration</div>
          <h1>{t('settings')}</h1>
          <p>Manage your shop profile, branding, verification documents, and account security.</p>
        </div>
        <button onClick={fetchSettings} className="icon-btn" title="Refresh"><RefreshCw /></button>
      </div>

      <div className="grid-2">
      <div>
      <div className="card">
        <div className="section-title">
          <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Store style={{ width: 16, height: 16, color: 'var(--gold)' }} />
            Workspace Profile
          </h2>
          <span className="sub">Business identity &amp; contact details</span>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="field">
            <label>Workspace Display Name</label>
            <div className="input-wrap">
              <Store />
              <input type="text" required value={shopName} onChange={(e) => setShopName(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Phone Number</label>
            <div className="input-wrap">
              <Phone />
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." />
            </div>
          </div>

          <div className="field">
            <label>Registered Address</label>
            <div className="input-wrap">
              <MapPin />
              <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          {/* Branding */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 4 }}>
            <label className="eyebrow" style={{ marginBottom: 14 }}><Palette /> Branding</label>

            <div className="field">
              <label>Logo URL / Image Source</label>
              <div className="flex gap-2">
                <div className="input-wrap" style={{ flex: 1 }}>
                  <ExternalLink />
                  <input
                    type="text" value={logoUrl}
                    onChange={(e) => setLogoUrl(cleanGoogleImageUrl(e.target.value))}
                    placeholder="Paste image URL or Google Images link"
                  />
                </div>
                <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', flexShrink: 0 }}>
                  <Upload />
                  <span>Upload</span>
                  <input
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLogoUrl(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontWeight: 600 }}>
                Paste a web link or pick a local image — Google Images links are parsed automatically.
              </p>
            </div>

            {logoUrl && (
              <div className="flex items-center gap-3" style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', padding: 10, borderRadius: 14, marginBottom: 18 }}>
                <img
                  src={cleanGoogleImageUrl(logoUrl)}
                  alt="Logo Preview"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  className="w-11 h-11 object-cover rounded-lg"
                  style={{ border: '1px solid var(--border-2)' }}
                />
                <div className="flex-1 min-w-0">
                  <span className="badge badge-active" style={{ marginBottom: 4 }}><span className="dot"></span>Live preview</span>
                  <span className="truncate" style={{ fontSize: 11, color: 'var(--text-3)', display: 'block' }}>{logoUrl.startsWith('data:') ? 'Local system image' : logoUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="icon-btn"
                  style={{ color: 'var(--red)' }}
                  title="Clear logo"
                >
                  <X />
                </button>
              </div>
            )}
          </div>

          {/* Shop Verification Documents Section */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20 }}>
            <label className="eyebrow" style={{ marginBottom: 14 }}><FileCheck /> Shop Verification Documents</label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key: 'shopPhoto', label: 'Shop Photo', value: shopPhoto, icon: Camera, fileName: 'shop_photo' },
                { key: 'shopLicense', label: 'Shop License', value: shopLicense, icon: FileCheck, fileName: 'shop_license' },
                { key: 'ownerAadhaar', label: 'Owner Aadhaar', value: ownerAadhaar, icon: Fingerprint, fileName: 'owner_aadhaar' },
              ].map(({ key, label, value, icon: SlotIcon, fileName }) => {
                const isPdf = value && value.fileUrl && value.fileUrl.toLowerCase().endsWith('.pdf');
                const uploading = docUploading === key;
                return (
                  <div key={key} style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
                      <span className={`badge ${value ? 'badge-active' : 'badge-pending'}`} style={{ padding: '2px 8px', fontSize: 9 }}>
                        <span className="dot"></span>{value ? 'Uploaded' : 'Missing'}
                      </span>
                    </div>
                    {value ? (
                      <div style={{ height: 74, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-2)', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isPdf ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--red)', fontWeight: 800 }}>
                            <FileText style={{ width: 15, height: 15 }} /> PDF File
                          </span>
                        ) : (
                          <img src={getAssetUrl(value.fileUrl)} className="w-full h-full object-cover" alt={`${label} Preview`} />
                        )}
                      </div>
                    ) : (
                      <div style={{ height: 74, borderRadius: 10, border: '1.5px dashed var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                        <SlotIcon style={{ width: 20, height: 20 }} />
                      </div>
                    )}
                    <div className="flex gap-2">
                      {value ? (
                        <>
                          <button
                            type="button"
                            onClick={() => downloadAsset(value.fileUrl, `${fileName}${isPdf ? '.pdf' : ''}`)}
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, fontSize: 10.5, padding: '8px 10px' }}
                          >
                            <Download style={{ width: 12, height: 12 }} />
                            <span>Download</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocRemove(key)}
                            className="btn btn-danger-outline btn-sm"
                            style={{ flex: 1, fontSize: 10.5, padding: '8px 10px' }}
                          >
                            <Trash style={{ width: 12, height: 12 }} />
                            <span>Remove</span>
                          </button>
                        </>
                      ) : (
                        <label className="btn btn-ghost btn-sm btn-block" style={{ fontSize: 10.5, padding: '8px 10px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
                          {uploading ? <RefreshCw className="animate-spin" style={{ width: 12, height: 12 }} /> : <Upload style={{ width: 12, height: 12 }} />}
                          <span>{uploading ? 'Uploading…' : 'Upload'}</span>
                          <input
                            type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" disabled={uploading}
                            onChange={(e) => { const file = e.target.files[0]; e.target.value = ''; handleDocUpload(key, file); }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end" style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20 }}>
            <button type="submit" className="btn btn-primary">
              <Check />
              <span>Save Workspace Details</span>
            </button>
          </div>
        </form>
      </div>
      </div>

      <div>
      {/* Admin User Credentials Block */}
      <div className="card">
        <div className="section-title">
          <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck style={{ width: 16, height: 16, color: 'var(--gold)' }} />
            Admin Credentials
          </h2>
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <label style={{ marginBottom: 4 }}>Username / Name</label>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-0)', fontFamily: 'var(--display)' }}>{user.name}</p>
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label style={{ marginBottom: 4 }}>Email Address</label>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-0)' }}>{user.email}</p>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label style={{ marginBottom: 4 }}>Phone Number</label>
          <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-0)' }}>{phone || 'N/A'}</p>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8, fontFamily: 'var(--display)' }}>
            Workspace Password
          </label>
          <div className="flex items-center justify-between" style={{ background: 'var(--card-2)', border: '1px solid var(--border-2)', borderRadius: 13, padding: '10px 14px' }}>
            <div className="flex items-center gap-2">
              <KeyRound style={{ width: 15, height: 15, color: 'var(--text-3)' }} />
              {revealPassword ? (
                <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 800, fontSize: 13 }}>{revealedPasswordVal}</span>
              ) : (
                <span style={{ color: 'var(--text-3)', fontFamily: 'monospace', letterSpacing: '.15em' }}>••••••••</span>
              )}
            </div>
            <button
              onClick={() => (revealPassword ? setRevealPassword(false) : setShowPassVerifyModal(true))}
              className="icon-btn"
              title={revealPassword ? 'Hide password' : 'Reveal password'}
            >
              {revealPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        <button
          onClick={() => setOtpResetOpen(true)}
          className="btn btn-outline btn-block"
          style={{ marginTop: 16 }}
        >
          <Lock />
          <span>Forgot Password? Reset via OTP</span>
        </button>
      </div>
      </div>
      </div>

      {/* Password Verification Modal overlay */}
      {showPassVerifyModal && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4" style={{ background: 'rgba(5,4,3,0.82)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 380, margin: 'auto', padding: 28, position: 'relative' }}>
            <button
              onClick={() => { setShowPassVerifyModal(false); setPassVerifyError(''); }}
              className="icon-btn"
              style={{ position: 'absolute', top: 18, right: 18 }}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center mb-6" style={{ textAlign: 'center' }}>
              <div className="icon-badge solid" style={{ marginBottom: 10 }}><Lock /></div>
              <h2 style={{ fontSize: 18 }}>Confirm your password</h2>
              <p style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 600, marginTop: 4 }}>Verify your identity to reveal saved credentials.</p>
            </div>

            <form onSubmit={handlePasswordVerificationSubmit}>
              {passVerifyError && (
                <div style={{ display: 'flex', gap: 8, background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.35)', padding: 10, borderRadius: 12, fontSize: 12, color: '#b91c1c', marginBottom: 16, fontWeight: 600 }}>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{passVerifyError}</span>
                </div>
              )}

              <div className="field">
                <label>Account Password</label>
                <div className="input-wrap">
                  <Lock />
                  <input
                    type={showVerifyPass ? "text" : "password"} required value={passVerifyInput} onChange={(e) => setPassVerifyInput(e.target.value)}
                    placeholder="Enter password" style={{ paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowVerifyPass(!showVerifyPass)}
                    className="pwd-toggle-btn"
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                  >
                    {showVerifyPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowPassVerifyModal(false); setPassVerifyError(''); }} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={passVerifyLoading} className="btn btn-primary" style={{ flex: 2 }}>
                  {passVerifyLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* OTP Password Reset Modal inside Settings */}
      {otpResetOpen && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4" style={{ background: 'rgba(5,4,3,0.82)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 440, margin: 'auto', padding: 28 }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: 4 }}><Lock /> Account Recovery</span>
                <h2 style={{ fontSize: 18 }}>Reset Account Password</h2>
              </div>
              <button onClick={() => setOtpResetOpen(false)} className="icon-btn">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!otpResetSent ? (
              <div>
                <div className="store-tabs">
                  <button
                    type="button"
                    onClick={() => setOtpResetMethod('email')}
                    className={`store-tab ${otpResetMethod === 'email' || !otpResetMethod ? 'active' : ''}`}
                    style={{ flex: 1 }}
                  >
                    Email Recovery
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpResetMethod('phone')}
                    className={`store-tab ${otpResetMethod === 'phone' ? 'active' : ''}`}
                    style={{ flex: 1 }}
                  >
                    Phone Recovery
                  </button>
                </div>
                <div className="field">
                  <label>{otpResetMethod === 'phone' ? 'Registered Phone Number' : 'Registered Email Address'}</label>
                  <div className="input-wrap">
                    {otpResetMethod === 'phone' ? <Phone /> : <Mail />}
                    <input
                      type="text" required value={otpResetIdentifier} onChange={(e) => setOtpResetIdentifier(e.target.value)}
                      placeholder={otpResetMethod === 'phone' ? '+91 99999 99999' : 'owner@shop.com'}
                    />
                  </div>
                </div>
                <button
                  onClick={handleOtpResetSend}
                  className="btn btn-primary btn-block"
                >
                  <Mail />
                  <span>Send OTP Verification Code</span>
                </button>
              </div>
            ) : !otpResetVerified ? (
              <form onSubmit={handleOtpResetVerify}>
                <p style={{ color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600, textAlign: 'center', lineHeight: 1.6, marginBottom: 14 }}>
                  A 4-digit code has been dispatched to <span style={{ color: 'var(--gold)', fontWeight: 800 }}>{otpResetIdentifier}</span>.
                </p>
                <div className="field">
                  <label style={{ textAlign: 'center' }}>Enter OTP</label>
                  <input
                    type="text" required maxLength={4} value={otpResetOtpInput} onChange={(e) => setOtpResetOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    style={{ width: '100%', background: 'var(--card-2)', border: '1.5px solid var(--border-2)', color: 'var(--text-0)', borderRadius: 13, padding: '13px 15px', fontSize: 16, textAlign: 'center', letterSpacing: '.3em', fontWeight: 800, outline: 'none' }}
                  />
                </div>
                {otpResetError && <div style={{ color: '#b91c1c', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>{otpResetError}</div>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setOtpResetSent(false)} className="btn btn-ghost" style={{ flex: 1 }}>Back</button>
                  <button type="submit" disabled={otpResetLoading} className="btn btn-primary" style={{ flex: 2 }}>
                    {otpResetLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Verify OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpResetSubmit}>
                {otpResetError && <div style={{ color: '#b91c1c', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>{otpResetError}</div>}
                <div className="field">
                  <label>New Password</label>
                  <div className="input-wrap">
                    <Lock />
                    <input
                      type={otpShowNewPass ? "text" : "password"} required value={otpResetNewPassword} onChange={(e) => setOtpResetNewPassword(e.target.value)}
                      placeholder="Min 6 characters" style={{ paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setOtpShowNewPass(!otpShowNewPass)}
                      className="pwd-toggle-btn"
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                    >
                      {otpShowNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label>Confirm Password</label>
                  <div className="input-wrap">
                    <Lock />
                    <input
                      type={otpShowConfirmPass ? "text" : "password"} required value={otpResetConfirmPassword} onChange={(e) => setOtpResetConfirmPassword(e.target.value)}
                      placeholder="Retype password" style={{ paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setOtpShowConfirmPass(!otpShowConfirmPass)}
                      className="pwd-toggle-btn"
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
                    >
                      {otpShowConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit" disabled={otpResetLoading}
                  className="btn btn-primary btn-block"
                >
                  {otpResetLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

// ============================================================================
// COMPONENT 14: REPORTS PORTAL VIEW
// ============================================================================
export function ReportsPortalView({ t, api }) {
  const [reportType, setReportType] = useState('REGISTRATIONS'); // REGISTRATIONS | INVENTORY | AUDIT
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setToDate(now.toISOString().split('T')[0]);
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (reportType === 'REGISTRATIONS') {
        const custs = await api.getCustomers();
        const filtered = custs.filter(c => {
          const cDate = new Date(c.createdAt).getTime();
          const start = fromDate ? new Date(fromDate).getTime() : 0;
          const end = toDate ? new Date(toDate + 'T23:59:59').getTime() : Infinity;
          return cDate >= start && cDate <= end;
        });
        setReportData(filtered.map(c => ({
          'Customer Name': c.name,
          'Phone': c.phone,
          'Vehicle Number': c.vehicleNumber || 'N/A',
          'Key Blank Code': c.keyNumber,
          'Location Address': c.capturedAddress || 'N/A',
          'GPS Coordinates': `${c.latitude}, ${c.longitude}`,
          'Date Registered': new Date(c.createdAt).toLocaleString()
        })));
      } else if (reportType === 'INVENTORY') {
        const inventory = await api.getInventoryItems ? await api.getInventoryItems() : [];
        setReportData(inventory.map(item => ({
          'Item ID': item.id,
          'Key Blank Reference': item.keyNumber || 'N/A',
          'Quantity on Hand': item.quantity || 0,
          'Reorder Level': item.reorderLevel || 5,
          'Last Restocked': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'
        })));
      } else {
        setReportData([
          { 'Activity ID': 'AUD-001', 'User / Account': 'Shop Operator', 'Action Perfomed': 'Verified Customer TN09B', 'Device IP': '192.168.1.102', 'Timestamp': new Date().toLocaleString() },
          { 'Activity ID': 'AUD-002', 'User / Account': 'Shop Operator', 'Action Perfomed': 'Created Key Spec TN09B', 'Device IP': '192.168.1.102', 'Timestamp': new Date().toLocaleString() },
          { 'Activity ID': 'AUD-003', 'User / Account': 'Shop Operator', 'Action Perfomed': 'Updated settings GSTIN', 'Device IP': '192.168.1.102', 'Timestamp': new Date().toLocaleString() },
        ]);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (reportData.length === 0) {
      alert('Please generate the report first.');
      return;
    }
    const headers = Object.keys(reportData[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of reportData) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kee_report_${reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTXT = () => {
    if (reportData.length === 0) {
      alert('Please generate the report first.');
      return;
    }
    const headers = Object.keys(reportData[0]);
    let txtContent = `========================================================================\n`;
    txtContent += `KEE SYSTEM TERMINAL - ${reportType.toUpperCase()} REPORT\n`;
    txtContent += `Generated: ${new Date().toLocaleString()}\n`;
    txtContent += `Range: ${fromDate || 'All Time'} to ${toDate || 'All Time'}\n`;
    txtContent += `========================================================================\n\n`;

    for (const row of reportData) {
      headers.forEach(header => {
        txtContent += `${header.padEnd(25)}: ${row[header]}\n`;
      });
      txtContent += `------------------------------------------------------------------------\n`;
    }

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kee_report_${reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.txt`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportTypeLabel = reportType === 'REGISTRATIONS' ? 'Customer Registry' : reportType === 'INVENTORY' ? 'Inventory Stock' : 'Security Audit';

  return (
    <div className="animate-fade-in">
      <div className="page-head">
        <div>
          <div className="eyebrow"><BarChart3 /> Compliance &amp; Analytics</div>
          <h1>{t('reports')}</h1>
          <p>Generate dynamic CSV and plain-text compliance audits across registrations, inventory and terminal activity.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'clamp(16px, 4vw, 24px)' }}>
        <div className="section-title" style={{ marginBottom: 18 }}>
          <h2>Report Builder</h2>
          <span className="sub">Select a report type and date range, then generate the audit view</span>
        </div>

        <form onSubmit={handleGenerate}>
          <div className="field">
            <label>Report Type</label>
            <div className="store-tabs">
              <button
                type="button"
                onClick={() => setReportType('REGISTRATIONS')}
                className={`store-tab ${reportType === 'REGISTRATIONS' ? 'active' : ''}`}
              >
                <UserCheck className="h-3.5 w-3.5" style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
                Customer Registry
              </button>
              <button
                type="button"
                onClick={() => setReportType('INVENTORY')}
                className={`store-tab ${reportType === 'INVENTORY' ? 'active' : ''}`}
              >
                <Boxes className="h-3.5 w-3.5" style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
                Inventory Stock
              </button>
              <button
                type="button"
                onClick={() => setReportType('AUDIT')}
                className={`store-tab ${reportType === 'AUDIT' ? 'active' : ''}`}
              >
                <ShieldCheck className="h-3.5 w-3.5" style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
                Security Audit
              </button>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>From Date</label>
              <div className="input-wrap">
                <Calendar />
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>To Date</label>
              <div className="input-wrap">
                <Calendar />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 6 }}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Generating\u2026' : 'Generate Audit View'}</span>
          </button>
        </form>
      </div>

      {reportData.length > 0 && (
        <div className="animate-fade-in">
          <div className="stat-grid three">
            <div className="stat-card" style={{ animationDelay: '.05s' }}>
              <div className="stat-top">
                <div className="icon-badge"><FileText /></div>
              </div>
              <div className="stat-num"><CountUp value={reportData.length} /></div>
              <div className="stat-label">Records in Report</div>
            </div>
            <div className="stat-card" style={{ animationDelay: '.15s' }}>
              <div className="stat-top">
                <div className="icon-badge"><Calendar /></div>
              </div>
              <div className="stat-num" style={{ fontSize: 18 }}>{fromDate || 'All time'} &rarr; {toDate || 'Today'}</div>
              <div className="stat-label">Date Range Covered</div>
            </div>
            <div className="stat-card" style={{ animationDelay: '.25s' }}>
              <div className="stat-top">
                <div className="icon-badge"><BarChart3 /></div>
              </div>
              <div className="stat-num" style={{ fontSize: 18 }}>{reportTypeLabel}</div>
              <div className="stat-label">Report Type</div>
            </div>
          </div>

          {/* Graphical Report Chart Visualization */}
          <div className="card chart-card" style={{ marginBottom: 24 }}>
            <div className="section-title">
              <h2>Visual Report Summary</h2>
              <span className="sub">Hover elements to view exact values</span>
            </div>

            <div className={`grid grid-cols-1 ${reportType === 'REGISTRATIONS' ? 'md:grid-cols-2' : ''} gap-6`}>

              {/* Left Column: Bar Chart */}
              <div>
                <h4 className="bar-label" style={{ textAlign: 'center', marginBottom: 10, fontSize: 11 }}>
                  {reportType === 'REGISTRATIONS' ? 'Registrations by Key Blank Reference' : reportType === 'INVENTORY' ? 'Stock vs Reorder Limits' : 'Action Types Distribution'}
                </h4>
                <div className="bars">
                  {(() => {
                    let dataPoints = [];
                    if (reportType === 'REGISTRATIONS') {
                      const counts = {};
                      reportData.forEach(r => {
                        const key = r['Key Blank Code'] || 'N/A';
                        counts[key] = (counts[key] || 0) + 1;
                      });
                      dataPoints = Object.keys(counts).map(key => ({ label: key, value: counts[key] })).slice(0, 8);
                    } else if (reportType === 'INVENTORY') {
                      dataPoints = reportData.map(r => ({
                        label: r['Key Blank Reference'] || 'N/A',
                        value: r['Quantity on Hand'] || 0,
                        reorder: r['Reorder Level'] || 5
                      })).slice(0, 8);
                    } else {
                      dataPoints = [
                        { label: 'Verify Customer', value: reportData.filter(r => r['Action Perfomed']?.includes('Verify')).length || 1 },
                        { label: 'Create Spec', value: reportData.filter(r => r['Action Perfomed']?.includes('Create')).length || 1 },
                        { label: 'Update Settings', value: reportData.filter(r => r['Action Perfomed']?.includes('Settings')).length || 1 }
                      ];
                    }

                    const maxVal = Math.max(...dataPoints.map(d => Math.max(d.value, d.reorder || 0)), 1);

                    return dataPoints.map((d, idx) => {
                      const heightPercent = (d.value / maxVal) * 100;
                      const reorderHeight = d.reorder ? (d.reorder / maxVal) * 100 : 0;
                      return (
                        <div key={idx} className="bar-col group" style={{ position: 'relative' }}>
                          <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, height: '100%' }}>
                            <div
                              style={{ height: `${heightPercent}%`, maxWidth: 22 }}
                              className="bar relative"
                            >
                              <span
                                className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 800, color: 'var(--gold-2)', whiteSpace: 'nowrap' }}
                              >
                                {d.value}
                              </span>
                            </div>
                            {d.reorder !== undefined && (
                              <div
                                style={{ height: `${reorderHeight}%`, width: 4, borderRadius: '3px 3px 0 0', background: 'var(--red)' }}
                                title={`Reorder Level: ${d.reorder}`}
                              ></div>
                            )}
                          </div>
                          <div className="bar-label" style={{ marginTop: 8, width: '100%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Right Column: Line Graph (Only for REGISTRATIONS) */}
              {reportType === 'REGISTRATIONS' && (
                <div>
                  <h4 className="bar-label" style={{ textAlign: 'center', marginBottom: 10, fontSize: 11 }}>
                    Registration Timeline Trend
                  </h4>
                  <div className="h-48 w-full rounded-xl p-4 flex flex-col justify-between" style={{ background: 'var(--card-2)', border: '1px solid var(--border)' }}>
                    {(() => {
                      const dateCounts = {};
                      reportData.forEach(r => {
                        const rawDate = r['Date Registered'] || '';
                        const datePart = rawDate.split(' ')[0] || 'N/A';
                        dateCounts[datePart] = (dateCounts[datePart] || 0) + 1;
                      });
                      const sortedDates = Object.keys(dateCounts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).slice(-10);
                      const dataPoints = sortedDates.map(date => ({ label: date, value: dateCounts[date] }));

                      if (dataPoints.length === 0) return <div className="text-center py-12" style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>No trend data</div>;

                      const maxVal = Math.max(...dataPoints.map(d => d.value), 1);
                      const width = 500;
                      const height = 150;
                      const padding = 20;

                      const coords = dataPoints.map((d, i) => {
                        const x = padding + (i / (dataPoints.length - 1 || 1)) * (width - 2 * padding);
                        const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                        return { x, y, label: d.label, val: d.value };
                      });

                      const pathD = coords.reduce((acc, c, i) => {
                        return i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
                      }, '');

                      const areaD = coords.length > 0 
                        ? `${pathD} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`
                        : '';

                      return (
                        <div className="w-full h-full flex flex-col justify-between">
                          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
                            <defs>
                              <linearGradient id="areaGradientReport" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            
                            {/* Area under the line */}
                            {areaD && <path d={areaD} fill="url(#areaGradientReport)" className="chart-area-fade" />}

                            {/* Grid lines */}
                            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />

                            {/* Trend Line */}
                            {pathD && <path d={pathD} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line-draw" />}

                            {/* Interactive dots */}
                            {coords.map((c, i) => (
                              <g key={i} className="group cursor-pointer">
                                <circle cx={c.x} cy={c.y} r="4" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" className="chart-dot-pop" style={{ animationDelay: `${0.6 + i * 0.06}s` }} />
                                <text x={c.x} y={c.y - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e1b2e" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  {c.val}
                                </text>
                              </g>
                            ))}
                          </svg>
                          <div className="flex justify-between px-1" style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            {dataPoints.map((d, i) => (
                              <span key={i}>{d.label}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

            </div>

            <div className="flex justify-between items-center" style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
              <span>Hover chart elements to view exact values</span>
              {reportType === 'INVENTORY' && (
                <div className="flex gap-3">
                  <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--gold)' }}></span> Stock Level</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--red)', borderRadius: 2 }}></span> Reorder Limit</span>
                </div>
              )}
            </div>
          </div>

          <div className="card table-card">
            <div className="table-head">
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 17 }}>
                Report Preview <span style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: 13 }}>({reportData.length} records)</span>
              </h2>
              <div className="row-actions" style={{ gap: 10 }}>
                <button onClick={handleDownloadCSV} className="btn btn-outline btn-sm">
                  <Download />
                  <span>Export CSV</span>
                </button>
                <button onClick={handleDownloadTXT} className="btn btn-primary btn-sm">
                  <Download />
                  <span>Export TXT</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="kee-table">
                <thead>
                  <tr>
                    {Object.keys(reportData[0]).slice(0, 4).map(header => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.keys(row).slice(0, 4).map((header, hIdx) => (
                        <td key={header} className={hIdx === 0 ? 'cell-primary' : ''}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ padding: '14px 24px', fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>Showing up to first 4 columns in browser preview. Export to view all detailed data columns.</p>
          </div>
        </div>
      )}
    </div>
  );
}

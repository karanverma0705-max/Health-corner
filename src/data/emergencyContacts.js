// Campus Emergency Contacts and Protocol Data
export const emergencyContacts = [
  {
    id: "campus-ambulance",
    title: "Campus Rapid Ambulance & Triage",
    phone: "Ext. 911 / (555) 019-0911",
    available: "24/7/365 On Campus",
    location: "Ambulance Bay, West Wing Health Center",
    avgResponse: "3-5 mins anywhere on campus grounds",
    action: "Emergency medical transport, severe injuries, fainting, seizures",
    primary: true
  },
  {
    id: "campus-police",
    title: "Campus Security & Safety Dispatch",
    phone: "Ext. 4040 / (555) 019-4040",
    available: "24/7/365",
    location: "Public Safety Headquarters, North Quad",
    avgResponse: "2 mins rapid arrival",
    action: "Building access, safe walk escort, physical security, incident de-escalation",
    primary: true
  },
  {
    id: "mental-crisis",
    title: "24/7 Suicide & Crisis Lifeline",
    phone: "Call or Text 988",
    available: "24/7 Free & Confidential",
    location: "National Crisis Network & Campus Counselor Handshake",
    avgResponse: "Immediate connection",
    action: "Immediate emotional distress, thoughts of self-harm, overwhelming panic",
    primary: true
  },
  {
    id: "affiliated-hospital",
    title: "University Hospital Trauma Center (Level 1)",
    phone: "(555) 942-8000",
    available: "24/7",
    location: "2.1 miles from South Campus Gate (7 min transit)",
    avgResponse: "Direct triage bypass for university students",
    action: "Major surgical trauma, advanced imaging (MRI/CT), emergency ICU admission",
    primary: false
  },
  {
    id: "poison-control",
    title: "Poison Control Center & Chemical Spills",
    phone: "1-800-222-1222",
    available: "24/7 Free Expert Medical Advice",
    location: "National Poison Action Network",
    avgResponse: "Immediate phone toxicologist",
    action: "Accidental chemical ingestion in labs, medication overdoses, toxic stings",
    primary: false
  },
  {
    id: "sexual-assault",
    title: "Campus Safe Haven & Title IX Support",
    phone: "Ext. 7233 (SAFE) / (555) 019-7233",
    available: "24/7 Confidential Advocates",
    location: "Student Services Bldg, Private Suite 104",
    avgResponse: "Immediate trauma-informed support",
    action: "Sexual assault medical forensic exam, confidential counseling, protective orders",
    primary: false
  }
];

export const campusHotspots = [
  {
    id: "loc-health-center",
    name: "Main Campus Health Center",
    building: "Building 12, Central Quad",
    floor: "Ground & 1st Floor",
    type: "Full Clinic & Urgent Care",
    aedAvailable: true,
    firstAidKiosk: true,
    coordinates: { x: 50, y: 48 }, // percentage on campus map
    hours: "24/7 Urgent Care • Clinics 8:00 AM - 6:00 PM"
  },
  {
    id: "loc-library",
    name: "Central Memorial Library",
    building: "Building 3",
    floor: "1st Floor Lobby (Near Turnstiles)",
    type: "AED Station & First Aid Kiosk",
    aedAvailable: true,
    firstAidKiosk: true,
    coordinates: { x: 32, y: 35 },
    hours: "Open 24 Hours during semester"
  },
  {
    id: "loc-sports-complex",
    name: "Varsity Arena & Recreation Center",
    building: "Athletics Complex",
    floor: "Gymnasium Entry & Pool Deck",
    type: "Sports Rehab & Trauma Kit + AED",
    aedAvailable: true,
    firstAidKiosk: true,
    coordinates: { x: 78, y: 62 },
    hours: "6:00 AM - 11:00 PM"
  },
  {
    id: "loc-hostel-north",
    name: "North Residence Halls (A-D)",
    building: "Pioneer Commons",
    floor: "Resident Advisor Office & Common Room",
    type: "AED Unit & Sanitary Care Dispenser",
    aedAvailable: true,
    firstAidKiosk: true,
    coordinates: { x: 25, y: 18 },
    hours: "24/7 Resident Access"
  },
  {
    id: "loc-hostel-south",
    name: "South Campus Towers & Dining",
    building: "Hawthorn Hall",
    floor: "Lobby Front Desk",
    type: "AED Station & Emergency Call Box",
    aedAvailable: true,
    firstAidKiosk: true,
    coordinates: { x: 68, y: 82 },
    hours: "24/7 Resident Access"
  },
  {
    id: "loc-engineering",
    name: "STEM & Engineering Quad",
    building: "Turing Science Hall",
    floor: "Lab Wing 2 Corridor",
    type: "Chemical Eye Wash, Burn Kit & AED",
    aedAvailable: true,
    firstAidKiosk: true,
    coordinates: { x: 70, y: 30 },
    hours: "7:00 AM - 10:00 PM"
  },
  {
    id: "loc-student-union",
    name: "Student Union & MindCare Pavilion",
    building: "Campus Center",
    floor: "2nd Floor Wellness Suite",
    type: "Peer Support, Nap Pods & First Aid",
    aedAvailable: true,
    firstAidKiosk: true,
    coordinates: { x: 42, y: 65 },
    hours: "8:00 AM - 10:00 PM"
  }
];

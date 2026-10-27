// SQLite Database Initialization & Helper Queries
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists
const dbDir = path.resolve(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbFilePath = path.join(dbDir, 'campus_health.sqlite');
console.log(`[SQLite] Opening database at: ${dbFilePath}`);

export const db = new DatabaseSync(dbFilePath);

// Enable WAL mode & foreign keys for high performance
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabaseSchema() {
  console.log('[SQLite] Initializing tables...');

  // 1. Professionals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS professionals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      qualification TEXT,
      experience TEXT,
      room TEXT,
      availableToday INTEGER DEFAULT 1,
      rating REAL DEFAULT 5.0,
      reviewsCount INTEGER DEFAULT 0,
      avatar TEXT,
      languages TEXT,
      schedule TEXT,
      slotsToday TEXT,
      bio TEXT,
      specialties TEXT
    );
  `);

  // 2. Appointments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      doctorId TEXT,
      doctorName TEXT,
      department TEXT,
      room TEXT,
      date TEXT,
      time TEXT,
      studentName TEXT,
      studentId TEXT,
      studentEmail TEXT,
      hostel TEXT,
      reason TEXT,
      isConfidential INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Confirmed',
      createdAt TEXT
    );
  `);

  // 3. Pharmacy Inventory Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pharmacy_inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT,
      stockStatus TEXT,
      stockQuantity INTEGER DEFAULT 0,
      cost TEXT,
      dosage TEXT,
      indications TEXT,
      requiresPrescription INTEGER DEFAULT 0
    );
  `);

  // 4. Emergency Contacts Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      phone TEXT NOT NULL,
      available TEXT,
      location TEXT,
      avgResponse TEXT,
      action TEXT,
      isPrimary INTEGER DEFAULT 0
    );
  `);

  // 5. Emergency SOS Dispatch Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_logs (
      id TEXT PRIMARY KEY,
      location TEXT NOT NULL,
      crisisNature TEXT NOT NULL,
      status TEXT DEFAULT 'Dispatched',
      assignedUnit TEXT,
      createdAt TEXT
    );
  `);

  // 6. Dispensary Fast Pickup Tokens
  db.exec(`
    CREATE TABLE IF NOT EXISTS dispensary_tokens (
      token TEXT PRIMARY KEY,
      medName TEXT NOT NULL,
      studentId TEXT,
      validUntil TEXT,
      status TEXT DEFAULT 'Ready for Pickup',
      createdAt TEXT
    );
  `);

  // 7. Student Profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      department TEXT,
      year TEXT,
      residence TEXT,
      bloodGroup TEXT,
      allergies TEXT,
      emergencyContact TEXT,
      insuranceStatus TEXT,
      vaccinationStatus TEXT
    );
  `);

  // 8. Health Drives
  db.exec(`
    CREATE TABLE IF NOT EXISTS health_drives (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      partner TEXT,
      date TEXT,
      venue TEXT,
      badge TEXT,
      perk TEXT,
      registeredCount INTEGER DEFAULT 0,
      targetCount INTEGER DEFAULT 100
    );
  `);

  // 9. FAQs
  db.exec(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    );
  `);

  // 10. System Users & Accounts (Students & Staff/Admin)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      studentId TEXT,
      department TEXT,
      createdAt TEXT
    );
  `);

  // Seed default data if empty
  seedInitialData();
  console.log('[SQLite] Schema and seed verification complete.');
}

function seedInitialData() {
  // Check professionals count
  const profCount = db.prepare('SELECT COUNT(*) as count FROM professionals').get();
  if (profCount.count === 0) {
    console.log('[SQLite] Seeding professionals...');
    const insertProf = db.prepare(`
      INSERT INTO professionals (
        id, name, title, department, qualification, experience, room,
        availableToday, rating, reviewsCount, avatar, languages, schedule,
        slotsToday, bio, specialties
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const defaults = [
      {
        id: "dr-jenkins",
        name: "Dr. Sarah Jenkins, MD",
        title: "Chief Medical Officer & General Physician",
        department: "General Outpatient & Acute Care",
        qualification: "MD, Board Certified Internal Medicine (Johns Hopkins)",
        experience: "14+ Years",
        room: "Health Center Block C, Clinic 101",
        availableToday: 1,
        rating: 4.9,
        reviewsCount: 342,
        avatar: "/images/doctor-consultation.jpg",
        languages: JSON.stringify(["English", "Spanish"]),
        schedule: "Mon - Fri: 8:30 AM - 4:30 PM",
        slotsToday: JSON.stringify(["10:30 AM", "11:15 AM", "02:00 PM", "03:30 PM", "04:15 PM"]),
        bio: "Specializing in student health, preventative wellness, infectious disease management, and sports physicals for collegiate athletes.",
        specialties: JSON.stringify(["General Medicine", "Travel Vaccines", "Fever & Infection", "Annual Checkups"])
      },
      {
        id: "dr-rostova",
        name: "Dr. Elena Rostova, PsyD",
        title: "Senior Clinical Psychologist & MindCare Director",
        department: "Mental Health & Counseling Services",
        qualification: "PsyD in Clinical Psychology (Columbia University)",
        experience: "11+ Years",
        room: "Student Wellness Pavilion, Suite 204",
        availableToday: 1,
        rating: 5.0,
        reviewsCount: 428,
        avatar: "/images/counseling-support.jpg",
        languages: JSON.stringify(["English", "Russian", "French"]),
        schedule: "Mon - Sat: 9:00 AM - 5:00 PM",
        slotsToday: JSON.stringify(["11:00 AM", "01:30 PM", "03:00 PM", "04:30 PM"]),
        bio: "Dedicated to helping students manage exam anxiety, imposter syndrome, depression, grief, and navigating major life transitions. 100% confidential.",
        specialties: JSON.stringify(["Anxiety & Stress", "Depression Support", "ADHD Coaching", "Crisis Intervention"])
      },
      {
        id: "dr-vance",
        name: "Dr. Marcus Vance, PT, DPT",
        title: "Lead Sports Physiotherapist & Ergonomics Specialist",
        department: "Sports Medicine & Physical Therapy",
        qualification: "Doctor of Physical Therapy (USC), OCS Certified",
        experience: "9+ Years",
        room: "Campus Recreation Center, Rehab Wing R-12",
        availableToday: 1,
        rating: 4.8,
        reviewsCount: 215,
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
        languages: JSON.stringify(["English"]),
        schedule: "Mon, Wed, Fri: 8:00 AM - 4:00 PM",
        slotsToday: JSON.stringify(["09:30 AM", "11:00 AM", "02:30 PM"]),
        bio: "Helping varsity athletes, gym enthusiasts, and students with tech-neck, posture strain, repetitive strain injuries (RSI), and post-op rehab.",
        specialties: JSON.stringify(["Sports Injuries", "Postural Strain", "RSI Treatment", "Joint Mobility"])
      },
      {
        id: "nurse-amy",
        name: "Amy Chen, MSN, FNP-C",
        title: "Family Nurse Practitioner & Triage Coordinator",
        department: "Urgent Care & Immunization Clinic",
        qualification: "MSN, Family Nurse Practitioner (UCLA)",
        experience: "8+ Years",
        room: "Health Center Block C, Triage Station 1",
        availableToday: 1,
        rating: 4.9,
        reviewsCount: 512,
        avatar: "https://images.unsplash.com/photo-1594824813583-05708892d274?auto=format&fit=crop&w=600&q=80",
        languages: JSON.stringify(["English", "Mandarin"]),
        schedule: "Daily: 7:30 AM - 6:00 PM",
        slotsToday: JSON.stringify(["09:00 AM", "10:00 AM", "11:30 AM", "01:00 PM", "03:15 PM"]),
        bio: "Leads walk-in triage, minor wound sutures, seasonal allergy treatments, routine vaccinations, and emergency first response dispatch.",
        specialties: JSON.stringify(["Triage Care", "Vaccinations", "Wound Dressing", "Allergy Management"])
      },
      {
        id: "dr-kalu",
        name: "Dr. David Kalu, DDS",
        title: "Campus Dental Health Specialist",
        department: "Dental & Oral Health Care",
        qualification: "DDS, University Dental College",
        experience: "12+ Years",
        room: "Health Center Block C, Dental Suite 105",
        availableToday: 0,
        rating: 4.8,
        reviewsCount: 189,
        avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
        languages: JSON.stringify(["English", "Yoruba"]),
        schedule: "Tue, Thu, Sat: 9:00 AM - 4:00 PM",
        slotsToday: JSON.stringify(["Tomorrow at 9:30 AM", "Tomorrow at 11:00 AM"]),
        bio: "Preventative dental checkups, ultrasonic scaling & cleaning, emergency toothache relief, wisdom tooth consultations, and mouthguards.",
        specialties: JSON.stringify(["Teeth Cleaning", "Emergency Toothache", "Wisdom Tooth Consult", "Dental Trauma"])
      },
      {
        id: "dr-patel",
        name: "Dr. Ananya Patel, MD, FACOG",
        title: "Gynecologist & Women's Health Consultant",
        department: "Women's Health & Reproductive Care",
        qualification: "MD Obstetrics & Gynecology (Johns Hopkins)",
        experience: "10+ Years",
        room: "Health Center Block C, Suite 108",
        availableToday: 1,
        rating: 5.0,
        reviewsCount: 295,
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
        languages: JSON.stringify(["English", "Hindi", "Gujarati"]),
        schedule: "Mon, Wed, Thu: 9:30 AM - 3:30 PM",
        slotsToday: JSON.stringify(["10:00 AM", "01:15 PM", "02:45 PM"]),
        bio: "Compassionate, non-judgmental guidance for menstrual disorders, PCOS management, reproductive health, contraception counseling, and screenings.",
        specialties: JSON.stringify(["PCOS & Menstrual Health", "Reproductive Wellness", "Contraceptive Care", "Wellness Screenings"])
      }
    ];

    for (const p of defaults) {
      insertProf.run(
        p.id, p.name, p.title, p.department, p.qualification, p.experience,
        p.room, p.availableToday, p.rating, p.reviewsCount, p.avatar,
        p.languages, p.schedule, p.slotsToday, p.bio, p.specialties
      );
    }
  }

  // Check Pharmacy Inventory
  const pharmCount = db.prepare('SELECT COUNT(*) as count FROM pharmacy_inventory').get();
  if (pharmCount.count === 0) {
    console.log('[SQLite] Seeding pharmacy inventory...');
    const insertMed = db.prepare(`
      INSERT INTO pharmacy_inventory (
        id, name, category, type, stockStatus, stockQuantity, cost, dosage, indications, requiresPrescription
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const meds = [
      ["med-01", "Paracetamol 500mg", "Pain & Fever", "OTC", "In Stock", 450, "Free with Student ID", "1-2 tablets every 4-6 hours (Max 4g/day)", "Fever, headache, muscular aches, mild viral flu symptoms", 0],
      ["med-02", "Ibuprofen 400mg", "Pain & Fever", "OTC", "In Stock", 280, "Free with Student ID", "1 tablet after meals (Every 8 hours)", "Menstrual cramps, sports inflammation, dental pain, swelling", 0],
      ["med-03", "Cetirizine 10mg", "Allergy & Cold", "OTC", "In Stock", 320, "Free with Student ID", "1 tablet daily before bed or in morning", "Pollen allergy, allergic rhinitis, hives, itchy eyes, sneezing", 0],
      ["med-04", "Albuterol Inhaler (100mcg)", "Respiratory", "Prescription", "In Stock", 65, "Subsidized ($5.00 / Free with Insurance)", "1-2 puffs as needed for bronchospasm relief", "Acute asthma flare-ups, exercise-induced wheezing", 1],
      ["med-05", "Oral Rehydration Salts (ORS Sachet)", "Hydration & Digestion", "OTC", "In Stock", 600, "Free with Student ID", "Dissolve 1 packet in 1L clean water; sip regularly", "Dehydration, heat exhaustion, gastrointestinal upset", 0],
      ["med-06", "Antiseptic Povidone-Iodine Ointment", "First Aid & Wound Care", "OTC", "In Stock", 190, "Free with Student ID", "Apply thin layer to clean dry abrasions 1-2 times daily", "Minor cuts, bike scrapes, lab turf burns", 0],
      ["med-07", "Sterile Bandage & Gauze Kit", "First Aid & Wound Care", "OTC", "In Stock", 520, "Free with Student ID", "As needed for wound compression and sterile covering", "Wound protection, bleeding control, blister cushioning", 0],
      ["med-08", "Plan B Emergency Contraceptive", "Reproductive Wellness", "Confidential OTC", "In Stock", 95, "100% Free & Confidential at Counter", "Take as soon as possible within 72h of unprotected intercourse", "Emergency pregnancy prevention. No questions asked.", 0],
      ["med-09", "Antacid Chewables & Omeprazole 20mg", "Hydration & Digestion", "OTC", "Low Stock", 34, "Free with Student ID", "1 tablet daily 30 mins before breakfast", "Acid reflux, gastritis, heart burn during exam stress", 0],
      ["med-10", "EpiPen Auto-Injector (0.3mg)", "Emergency & Anaphylaxis", "Emergency", "In Stock", 40, "Immediate Free Access at all Stations", "Intramuscular injection into mid-outer thigh immediately", "Severe life-threatening allergic reactions", 1],
      ["med-11", "Organic Sanitary Pads & Tampons Box", "Reproductive Wellness", "Kiosk Dispenser", "In Stock", 850, "100% Free in all campus restrooms & kiosks", "Dispense freely from contactless wall stations", "Menstrual hygiene support", 0]
    ];

    for (const m of meds) {
      insertMed.run(...m);
    }
  }

  // Check Student Profile
  const studentCount = db.prepare('SELECT COUNT(*) as count FROM student_profiles').get();
  if (studentCount.count === 0) {
    console.log('[SQLite] Seeding student profile...');
    db.prepare(`
      INSERT INTO student_profiles (
        id, name, email, department, year, residence, bloodGroup, allergies,
        emergencyContact, insuranceStatus, vaccinationStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "U-2024-88419",
      "Alex Rivera",
      "alex.rivera@campus.edu",
      "Computer Science & Engineering",
      "3rd Year (Junior)",
      "North Pioneer Commons, Room 314",
      "O+",
      "Penicillin, Tree nuts",
      "Maria Rivera (Parent) • (555) 234-5678",
      "Active - University Care Plus Plan",
      "Verified & Fully Compliant (MMR, Tdap, MenACWY, COVID)"
    );
  }

  // Check Health Drives
  const driveCount = db.prepare('SELECT COUNT(*) as count FROM health_drives').get();
  if (driveCount.count === 0) {
    console.log('[SQLite] Seeding health drives...');
    const insertDrive = db.prepare(`
      INSERT INTO health_drives (id, title, partner, date, venue, badge, perk, registeredCount, targetCount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDrive.run("drive-1", "Fall Campus Blood Donation Drive", "In partnership with American Red Cross", "Thursday, Nov 12 • 9:00 AM - 4:00 PM", "Student Union Ballroom", "Urgent O- & B+ Needed", "Free campus wellness T-shirt + hot lunch voucher", 142, 200);
    insertDrive.run("drive-2", "Quad Seasonal Flu & COVID Booster Fair", "Campus Immunization Clinic", "Monday - Wednesday, Nov 16-18 • 10:00 AM - 3:00 PM", "Central Quad Gazebo (Walk-up tent)", "Free for All Students", "Flu vaccine certificate uploaded to student portal in 5 mins", 380, 500);
    insertDrive.run("drive-3", "Finals Week De-Stress & Therapy Dogs", "MindCare Wellness Coalition", "Friday, Nov 27 • 1:00 PM - 5:00 PM", "Library South Lawn", "Mental Wellness", "Certified therapy golden retrievers, tea bar, free stress balls", 215, 300);
  }

  // Check Users (Admin & Student)
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    console.log('[SQLite] Seeding user accounts (Admin & Student)...');
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, email, password, role, name, studentId, department, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Primary Clinic Administrator
    insertUser.run(
      "usr-admin-1",
      "admin",
      "admin@campus.edu",
      "admin123",
      "admin",
      "Dr. Sarah Jenkins",
      null,
      "Clinical Operations & Health Center Administration",
      new Date().toISOString()
    );

    // 2. Default Student / Patient
    insertUser.run(
      "usr-student-1",
      "alex.rivera",
      "alex.rivera@campus.edu",
      "student123",
      "student",
      "Alex Rivera",
      "U-2024-88419",
      "Computer Science & Engineering",
      new Date().toISOString()
    );
  }
}

// Campus Dispensary & First-Aid Inventory Data
export const pharmacyInventory = [
  {
    id: "med-01",
    name: "Paracetamol (Acetaminophen) 500mg",
    category: "Pain & Fever",
    type: "OTC (Over-The-Counter)",
    stockStatus: "In Stock",
    stockQuantity: 450,
    cost: "Free with Student ID",
    dosage: "1-2 tablets every 4-6 hours (Max 4g/day)",
    indications: "Fever, headache, muscular aches, mild viral flu symptoms",
    requiresPrescription: false
  },
  {
    id: "med-02",
    name: "Ibuprofen 400mg",
    category: "Pain & Fever",
    type: "OTC (Over-The-Counter)",
    stockStatus: "In Stock",
    stockQuantity: 280,
    cost: "Free with Student ID",
    dosage: "1 tablet after meals (Every 8 hours)",
    indications: "Menstrual cramps, sports inflammation, dental pain, swelling",
    requiresPrescription: false
  },
  {
    id: "med-03",
    name: "Cetirizine 10mg (Non-Drowsy Antihistamine)",
    category: "Allergy & Cold",
    type: "OTC (Over-The-Counter)",
    stockStatus: "In Stock",
    stockQuantity: 320,
    cost: "Free with Student ID",
    dosage: "1 tablet daily before bed or in morning",
    indications: "Pollen allergy, allergic rhinitis, hives, itchy eyes, sneezing",
    requiresPrescription: false
  },
  {
    id: "med-04",
    name: "Albuterol Inhaler (Salbutamol 100mcg)",
    category: "Respiratory",
    type: "Prescription Required",
    stockStatus: "In Stock",
    stockQuantity: 65,
    cost: "Subsidized ($5.00 / Free with Campus Health Insurance)",
    dosage: "1-2 puffs as needed for bronchospasm relief",
    indications: "Acute asthma flare-ups, exercise-induced wheezing",
    requiresPrescription: true
  },
  {
    id: "med-05",
    name: "Oral Rehydration Salts (ORS Electral Sachet)",
    category: "Hydration & Digestion",
    type: "OTC (Over-The-Counter)",
    stockStatus: "In Stock",
    stockQuantity: 600,
    cost: "Free with Student ID",
    dosage: "Dissolve 1 packet in 1 Liter clean water; sip regularly",
    indications: "Dehydration, heat exhaustion, gastrointestinal upset, food poisoning",
    requiresPrescription: false
  },
  {
    id: "med-06",
    name: "Antiseptic Povidone-Iodine & Neosporin Ointment",
    category: "First Aid & Wound Care",
    type: "OTC (Over-The-Counter)",
    stockStatus: "In Stock",
    stockQuantity: 190,
    cost: "Free with Student ID",
    dosage: "Apply thin layer to clean dry abrasions 1-2 times daily",
    indications: "Minor cuts, bike scrapes, laboratory turf burns",
    requiresPrescription: false
  },
  {
    id: "med-07",
    name: "Sterile Gauze, Bandages & Waterproof Dressing Kit",
    category: "First Aid & Wound Care",
    type: "OTC (Over-The-Counter)",
    stockStatus: "In Stock",
    stockQuantity: 520,
    cost: "Free with Student ID",
    dosage: "As needed for wound compression and sterile covering",
    indications: "Wound protection, bleeding control, blister cushioning",
    requiresPrescription: false
  },
  {
    id: "med-08",
    name: "Emergency Contraceptive Pill (Plan B / Levonorgestrel 1.5mg)",
    category: "Reproductive Wellness",
    type: "Confidential OTC",
    stockStatus: "In Stock",
    stockQuantity: 95,
    cost: "100% Free & Confidential at Health Center Counter",
    dosage: "Take as soon as possible within 72 hours of unprotected intercourse",
    indications: "Emergency pregnancy prevention. No questions asked.",
    requiresPrescription: false
  },
  {
    id: "med-09",
    name: "Antacid Chewables & Omeprazole 20mg",
    category: "Hydration & Digestion",
    type: "OTC (Over-The-Counter)",
    stockStatus: "Low Stock",
    stockQuantity: 34,
    cost: "Free with Student ID",
    dosage: "1 tablet daily 30 minutes before breakfast",
    indications: "Acid reflux, gastritis, heart burn during exam stress",
    requiresPrescription: false
  },
  {
    id: "med-10",
    name: "EpiPen Auto-Injector (Epinephrine 0.3mg)",
    category: "Emergency & Anaphylaxis",
    type: "Emergency Medication",
    stockStatus: "In Stock",
    stockQuantity: 40,
    cost: "Immediate Free Access at all Campus Stations",
    dosage: "Intramuscular injection into mid-outer thigh immediately",
    indications: "Severe life-threatening allergic reactions (peanuts, bee stings)",
    requiresPrescription: true
  },
  {
    id: "med-11",
    name: "Organic Menstrual Sanitary Pads & Tampons Box",
    category: "Reproductive Wellness",
    type: "Kiosk Free Dispenser",
    stockStatus: "In Stock",
    stockQuantity: 850,
    cost: "100% Free in all campus restrooms and clinic kiosks",
    dosage: "Dispense freely from contactless wall stations",
    indications: "Menstrual hygiene support",
    requiresPrescription: false
  },
  {
    id: "med-12",
    name: "Electrolyte Sports Recovery Tablets + Multivitamin B-Complex",
    category: "Preventative & Nutrition",
    type: "OTC (Over-The-Counter)",
    stockStatus: "In Stock",
    stockQuantity: 210,
    cost: "Free with Student ID",
    dosage: "1 effervescent tablet dissolved in water after sports",
    indications: "Post-workout recovery, energy fatigue, student athlete nutrition",
    requiresPrescription: false
  }
];

export const dispensaryHours = {
  weekday: "Monday - Friday: 8:00 AM - 9:00 PM",
  weekend: "Saturday - Sunday: 9:00 AM - 5:00 PM",
  nightEmergency: "Emergency Counter open 24/7 at Main Health Center Gate 2",
  phone: "Campus Ext: 4120 / Direct: (555) 019-4120"
};

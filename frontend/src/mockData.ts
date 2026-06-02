import { TaskItem, WeeklyLog, UserProfile } from './types';

export const INITIAL_PROFILE: UserProfile = {
  name: "Anusha",
  avatarLetter: "A",
  group: "TNPSC Group 1 - 2026",
  isVerified: true,
  phone: "+91 9845678734",
  email: "anusha1890@gmail.com"
};

export const INITIAL_WEEKLY_LOGS: WeeklyLog[] = [
  { day: "Mon", percentage: 40 },
  { day: "Tue", percentage: 20 },
  { day: "Wed", percentage: 80 },
  { day: "Thu", percentage: 10 },
  { day: "Fri", percentage: 50 },
  { day: "Sat", percentage: 90 },
  { day: "Sun", percentage: 30 }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-science",
    title: "Science",
    time: "09:00 AM",
    completed: false
  },
  {
    id: "task-maths",
    title: "Maths",
    time: "09:20 AM",
    completed: false
  },
  {
    id: "task-english",
    title: "English",
    time: "09:40 AM",
    completed: false
  },
  {
    id: "task-geo-templates",
    title: "Geography Templates",
    time: "10:20 AM",
    completed: true
  },
  {
    id: "task-tea-break",
    title: "Break",
    time: "10:30 AM",
    completed: false
  },
  {
    id: "task-historical-theory",
    title: "Historical Theory",
    time: "10:40 AM",
    completed: false
  }
];

// Rich syllabus subjects data to make the Syllabus tab highly responsive
export interface SyllabusUnit {
  id: string;
  name: string;
  weightage: string;
  completed: boolean;
}

export interface SyllabusSubject {
  id: string;
  title: string;
  code: string;
  progress: number;
  units: SyllabusUnit[];
}

export const SYLLABUS_DATA: SyllabusSubject[] = [
  {
    id: "subj-1",
    title: "History and Culture of India",
    code: "UNIT-IV",
    progress: 45,
    units: [
      { id: "u1-1", name: "Indus Valley Civilization & Vedic Age", weightage: "High", completed: true },
      { id: "u1-2", name: "Guptas, Delhi Sultans & Mughals", weightage: "High", completed: true },
      { id: "u1-3", name: "South Indian History & Culture", weightage: "Medium", completed: false },
      { id: "u1-4", name: "Social Reform Movements in India", weightage: "Medium", completed: false }
    ]
  },
  {
    id: "subj-2",
    title: "Geography of India",
    code: "UNIT-III",
    progress: 30,
    units: [
      { id: "u2-1", name: "Location, Physical Features & Monsoon", weightage: "High", completed: true },
      { id: "u2-2", name: "Water Resources, Rivers & Soil Types", weightage: "High", completed: false },
      { id: "u2-3", name: "Forest, Wildlife & Natural Vegetation", weightage: "Medium", completed: false },
      { id: "u2-4", name: "Agricultural Patterns & Livestock", weightage: "Low", completed: false }
    ]
  },
  {
    id: "subj-3",
    title: "Indian Polity",
    code: "UNIT-V",
    progress: 60,
    units: [
      { id: "u3-1", name: "Constitution of India & Preamble", weightage: "High", completed: true },
      { id: "u3-2", name: "Citizenship, Fundamental Rights & Duties", weightage: "High", completed: true },
      { id: "u3-3", name: "Union Executive, Legislature & Judiciary", weightage: "High", completed: true },
      { id: "u3-4", name: "Local Government & Panchayat Raj", weightage: "Medium", completed: false }
    ]
  },
  {
    id: "subj-4",
    title: "Aptitude and Mental Ability",
    code: "UNIT-X",
    progress: 80,
    units: [
      { id: "u4-1", name: "Simplification, Percentage & HCF / LCM", weightage: "High", completed: true },
      { id: "u4-2", name: "Simple Interest and Compound Interest", weightage: "High", completed: true },
      { id: "u4-3", name: "Ratio, Proportion & Time and Work", weightage: "High", completed: true },
      { id: "u4-4", name: "Logical Reasoning & Visual Reasoning", weightage: "Medium", completed: false }
    ]
  }
];

// NEET PG Complete Syllabus — 19 subjects across Pre-Clinical, Para-Clinical, and Clinical parts
export const NEET_PG_SYLLABUS_DATA: SyllabusSubject[] = [
  // PART A — Pre-Clinical
  {
    id: "neet-1", title: "Anatomy", code: "PART-A", progress: 0,
    units: [
      { id: "na1-1", name: "Gross Anatomy — Musculoskeletal, Thorax, Abdomen, Pelvis, Head & Neck", weightage: "High", completed: false },
      { id: "na1-2", name: "Histology — Epithelial, Connective, Muscle & Nervous Tissues", weightage: "Medium", completed: false },
      { id: "na1-3", name: "Embryology — Organogenesis, Developmental Anomalies, Gametogenesis", weightage: "Medium", completed: false },
      { id: "na1-4", name: "Neuroanatomy — Brain, Spinal Cord, Cranial Nerves, PNS", weightage: "High", completed: false },
    ]
  },
  {
    id: "neet-2", title: "Physiology", code: "PART-A", progress: 0,
    units: [
      { id: "na2-1", name: "Blood & Body Fluids — Haemopoiesis, Coagulation", weightage: "High", completed: false },
      { id: "na2-2", name: "Cardiovascular System — Cardiac Cycle, ECG, BP Regulation", weightage: "High", completed: false },
      { id: "na2-3", name: "Respiratory System — Mechanics, Gas Exchange, Transport", weightage: "High", completed: false },
      { id: "na2-4", name: "GI System — Secretion, Motility, Digestion & Absorption", weightage: "Medium", completed: false },
      { id: "na2-5", name: "Renal Physiology — GFR, Tubular Function, Acid-Base Balance", weightage: "High", completed: false },
      { id: "na2-6", name: "Endocrine System — Pituitary, Thyroid, Adrenal, Pancreas, Gonads", weightage: "High", completed: false },
      { id: "na2-7", name: "Neurophysiology — Membrane Potentials, Synaptic Transmission, Reflexes", weightage: "Medium", completed: false },
    ]
  },
  {
    id: "neet-3", title: "Biochemistry", code: "PART-A", progress: 0,
    units: [
      { id: "na3-1", name: "Molecular Biology & Genetics — DNA Replication, Transcription, Translation", weightage: "High", completed: false },
      { id: "na3-2", name: "Enzymology — Enzyme Kinetics, Inhibition, Regulation", weightage: "Medium", completed: false },
      { id: "na3-3", name: "Carbohydrate Metabolism — Glycolysis, TCA Cycle, Glycogen Storage", weightage: "High", completed: false },
      { id: "na3-4", name: "Protein & Amino Acid Metabolism — Urea Cycle, Inborn Errors", weightage: "Medium", completed: false },
      { id: "na3-5", name: "Lipid Metabolism — Fatty Acid Oxidation, Synthesis, Cholesterol", weightage: "High", completed: false },
      { id: "na3-6", name: "Vitamins & Hormones — Fat-Soluble & Water-Soluble Vitamins", weightage: "Medium", completed: false },
      { id: "na3-7", name: "Genetic Disorders & Inborn Errors of Metabolism", weightage: "Medium", completed: false },
    ]
  },
  // PART B — Para-Clinical
  {
    id: "neet-4", title: "Pharmacology", code: "PART-B", progress: 0,
    units: [
      { id: "nb4-1", name: "Drug Classification & Mechanisms of Action", weightage: "High", completed: false },
      { id: "nb4-2", name: "Autonomic Pharmacology — Adrenergic, Cholinergic Drugs", weightage: "High", completed: false },
      { id: "nb4-3", name: "Cardiovascular Drugs — Antihypertensives, Antiarrhythmics, Antianginals", weightage: "High", completed: false },
      { id: "nb4-4", name: "CNS Drugs — Sedatives, Antipsychotics, Antidepressants, Antiepileptics", weightage: "High", completed: false },
      { id: "nb4-5", name: "Antimicrobials & Antibiotics — Mechanisms, Resistance, Clinical Use", weightage: "High", completed: false },
      { id: "nb4-6", name: "Adverse Drug Reactions, Drug Interactions & Toxicology", weightage: "Medium", completed: false },
    ]
  },
  {
    id: "neet-5", title: "Pathology", code: "PART-B", progress: 0,
    units: [
      { id: "nb5-1", name: "General Pathology — Cell Injury, Inflammation, Repair, Neoplasia", weightage: "High", completed: false },
      { id: "nb5-2", name: "Systemic Pathology — Organ-Wise Disease Processes", weightage: "High", completed: false },
      { id: "nb5-3", name: "Hematology — Anemias, Leukemias, Bleeding & Clotting Disorders", weightage: "High", completed: false },
      { id: "nb5-4", name: "Cytopathology — Fine Needle Aspiration, Exfoliative Cytology", weightage: "Medium", completed: false },
    ]
  },
  {
    id: "neet-6", title: "Microbiology", code: "PART-B", progress: 0,
    units: [
      { id: "nb6-1", name: "Bacteriology — Gram-Positive & Gram-Negative Organisms, Tuberculosis", weightage: "High", completed: false },
      { id: "nb6-2", name: "Virology — Hepatitis Viruses, HIV, Herpes, Arboviruses", weightage: "High", completed: false },
      { id: "nb6-3", name: "Mycology — Candida, Aspergillus, Dermatophytes", weightage: "Medium", completed: false },
      { id: "nb6-4", name: "Parasitology — Malaria, Amoeba, Helminths, Leishmania", weightage: "High", completed: false },
      { id: "nb6-5", name: "Immunology — Innate & Adaptive Immunity, Hypersensitivity Reactions", weightage: "High", completed: false },
    ]
  },
  {
    id: "neet-7", title: "Forensic Medicine & Toxicology", code: "PART-B", progress: 0,
    units: [
      { id: "nb7-1", name: "Medico-Legal Aspects — IPC Sections, MLC Procedures", weightage: "High", completed: false },
      { id: "nb7-2", name: "Autopsy & Post-Mortem Findings — Time Since Death, Injuries", weightage: "Medium", completed: false },
      { id: "nb7-3", name: "Identification — Age, Sex, Stature, Dental Evidence", weightage: "Medium", completed: false },
      { id: "nb7-4", name: "Mechanical, Thermal & Electrical Injuries", weightage: "Medium", completed: false },
      { id: "nb7-5", name: "Toxicology — Corrosive, Organophosphate, Heavy Metal, Alcohol Poisoning", weightage: "High", completed: false },
      { id: "nb7-6", name: "Sexual Offenses — Examination, Evidence Collection", weightage: "Low", completed: false },
    ]
  },
  {
    id: "neet-8", title: "Community Medicine (PSM)", code: "PART-B", progress: 0,
    units: [
      { id: "nb8-1", name: "Epidemiology — Study Designs, Measures of Association", weightage: "High", completed: false },
      { id: "nb8-2", name: "Biostatistics — Mean, SD, Tests of Significance, Sensitivity/Specificity", weightage: "High", completed: false },
      { id: "nb8-3", name: "National Health Programs — TB, Leprosy, Malaria, RMNCH+A", weightage: "High", completed: false },
      { id: "nb8-4", name: "Environmental Health — Water, Air, Sanitation", weightage: "Medium", completed: false },
      { id: "nb8-5", name: "Nutrition — PEM, Micronutrient Deficiencies, Dietary Assessment", weightage: "Medium", completed: false },
      { id: "nb8-6", name: "Immunization — EPI Schedule, Cold Chain Management", weightage: "High", completed: false },
      { id: "nb8-7", name: "Healthcare Delivery in India — NHM, AYUSHMAN Bharat", weightage: "Medium", completed: false },
    ]
  },
  // PART C — Clinical (Highest Weightage)
  {
    id: "neet-9", title: "General Medicine", code: "PART-C", progress: 0,
    units: [
      { id: "nc9-1", name: "Cardiovascular — IHD, Hypertension, Heart Failure, Valvular Diseases", weightage: "High", completed: false },
      { id: "nc9-2", name: "Respiratory — TB, COPD, Asthma, Pneumonia, Pleural Effusion", weightage: "High", completed: false },
      { id: "nc9-3", name: "Gastroenterology — Peptic Ulcer, IBD, Liver Diseases, Pancreatitis", weightage: "High", completed: false },
      { id: "nc9-4", name: "Neurology — Stroke, Epilepsy, Parkinson's, Meningitis", weightage: "High", completed: false },
      { id: "nc9-5", name: "Endocrinology — Diabetes Mellitus, Thyroid, Adrenal, Pituitary Disorders", weightage: "High", completed: false },
      { id: "nc9-6", name: "Infectious Diseases — HIV, Malaria, Typhoid, Dengue, Viral Hepatitis", weightage: "High", completed: false },
      { id: "nc9-7", name: "Nephrology — Acute/Chronic Kidney Disease, Nephrotic Syndrome", weightage: "High", completed: false },
      { id: "nc9-8", name: "Rheumatology — SLE, Rheumatoid Arthritis, Gout", weightage: "Medium", completed: false },
    ]
  },
  {
    id: "neet-10", title: "General Surgery", code: "PART-C", progress: 0,
    units: [
      { id: "nc10-1", name: "Pre- & Post-Operative Care, Fluid & Electrolyte Management", weightage: "High", completed: false },
      { id: "nc10-2", name: "Surgical Infections — Cellulitis, Abscess, Gangrene, Tetanus", weightage: "High", completed: false },
      { id: "nc10-3", name: "GI Surgery — Appendicitis, Hernia, Intestinal Obstruction, Colorectal", weightage: "High", completed: false },
      { id: "nc10-4", name: "Trauma & Burns — ATLS Principles, Wound Management", weightage: "High", completed: false },
      { id: "nc10-5", name: "Urology — BPH, Urinary Calculi, Renal Tumors", weightage: "Medium", completed: false },
      { id: "nc10-6", name: "Surgical Oncology — Breast, Thyroid, GI Cancers", weightage: "High", completed: false },
    ]
  },
  {
    id: "neet-11", title: "Obstetrics & Gynecology", code: "PART-C", progress: 0,
    units: [
      { id: "nc11-1", name: "Antenatal Care — ANC Visits, Investigations, High-Risk Pregnancy", weightage: "High", completed: false },
      { id: "nc11-2", name: "Normal & Abnormal Labor — Stages, Complications, Operative Delivery", weightage: "High", completed: false },
      { id: "nc11-3", name: "Postnatal Care & Complications — PPH, Puerperal Sepsis", weightage: "High", completed: false },
      { id: "nc11-4", name: "Gynecological Disorders — PCOS, Fibroids, Endometriosis, PID", weightage: "High", completed: false },
      { id: "nc11-5", name: "Family Planning & Contraception — Hormonal, Barrier, IUCD", weightage: "Medium", completed: false },
      { id: "nc11-6", name: "Obstetric Emergencies — Eclampsia, Abruptio Placentae, Placenta Praevia", weightage: "High", completed: false },
    ]
  },
  {
    id: "neet-12", title: "Pediatrics", code: "PART-C", progress: 0,
    units: [
      { id: "nc12-1", name: "Neonatology — Birth Asphyxia, Neonatal Jaundice, NEC, RDS", weightage: "High", completed: false },
      { id: "nc12-2", name: "Growth & Development Milestones", weightage: "High", completed: false },
      { id: "nc12-3", name: "Immunization Schedule (IAP & NIP)", weightage: "High", completed: false },
      { id: "nc12-4", name: "Pediatric Infections — Meningitis, Pneumonia, Diarrhea, Typhoid", weightage: "High", completed: false },
      { id: "nc12-5", name: "Nutritional Disorders — PEM, Rickets, Scurvy, Iron Deficiency", weightage: "Medium", completed: false },
      { id: "nc12-6", name: "Congenital Heart Diseases — ASD, VSD, TOF, PDA", weightage: "Medium", completed: false },
    ]
  },
  {
    id: "neet-13", title: "ENT (Ear, Nose & Throat)", code: "PART-C", progress: 0,
    units: [
      { id: "nc13-1", name: "Ear — Otitis Media (Acute & Chronic), CSOM, Hearing Loss, Otosclerosis", weightage: "High", completed: false },
      { id: "nc13-2", name: "Nose — Sinusitis, DNS, Epistaxis, Nasal Polyps", weightage: "High", completed: false },
      { id: "nc13-3", name: "Throat & Larynx — Tonsillitis, Adenoids, Laryngeal Carcinoma", weightage: "Medium", completed: false },
    ]
  },
  {
    id: "neet-14", title: "Ophthalmology", code: "PART-C", progress: 0,
    units: [
      { id: "nc14-1", name: "Anatomy of the Eye — Refractive Media, IOP", weightage: "Medium", completed: false },
      { id: "nc14-2", name: "Refractive Errors — Myopia, Hypermetropia, Astigmatism, Presbyopia", weightage: "High", completed: false },
      { id: "nc14-3", name: "Cataract — Types, Surgical Management", weightage: "High", completed: false },
      { id: "nc14-4", name: "Glaucoma — Open-Angle, Angle-Closure, Management", weightage: "High", completed: false },
      { id: "nc14-5", name: "Retinal Disorders — Diabetic Retinopathy, Retinal Detachment, ARMD", weightage: "High", completed: false },
      { id: "nc14-6", name: "Uveitis, Corneal Diseases, Conjunctivitis", weightage: "Medium", completed: false },
    ]
  },
  {
    id: "neet-15", title: "Orthopedics", code: "PART-C", progress: 0,
    units: [
      { id: "nc15-1", name: "Fractures & Dislocations — Types, Healing, Principles of Management", weightage: "High", completed: false },
      { id: "nc15-2", name: "Joint Diseases — Osteoarthritis, Rheumatoid Arthritis, Infections", weightage: "High", completed: false },
      { id: "nc15-3", name: "Spine Disorders — Prolapsed IV Disc, Spondylosis, TB Spine", weightage: "High", completed: false },
      { id: "nc15-4", name: "Pediatric Orthopedics — DDH, CTEV, Perthes Disease", weightage: "Medium", completed: false },
    ]
  },
  {
    id: "neet-16", title: "Dermatology", code: "PART-C", progress: 0,
    units: [
      { id: "nc16-1", name: "Bacterial Skin Infections — Impetigo, Cellulitis, Erysipelas", weightage: "Medium", completed: false },
      { id: "nc16-2", name: "Fungal Infections — Tinea, Candidiasis, Pityriasis Versicolor", weightage: "Medium", completed: false },
      { id: "nc16-3", name: "Allergic & Eczematous Conditions — Contact Dermatitis, Atopic Eczema", weightage: "High", completed: false },
      { id: "nc16-4", name: "Autoimmune Skin Diseases — Pemphigus, Psoriasis, SLE", weightage: "High", completed: false },
      { id: "nc16-5", name: "STIs — Syphilis, Gonorrhoea, HSV, HPV, LGV", weightage: "Medium", completed: false },
    ]
  },
  {
    id: "neet-17", title: "Psychiatry", code: "PART-C", progress: 0,
    units: [
      { id: "nc17-1", name: "Mood Disorders — Major Depression, Bipolar Disorder", weightage: "High", completed: false },
      { id: "nc17-2", name: "Psychotic Disorders — Schizophrenia, Schizoaffective Disorder", weightage: "High", completed: false },
      { id: "nc17-3", name: "Anxiety, OCD, Somatoform & Dissociative Disorders", weightage: "High", completed: false },
      { id: "nc17-4", name: "Substance Use Disorders — Alcohol, Opioids, Sedatives", weightage: "Medium", completed: false },
      { id: "nc17-5", name: "Psychopharmacology — Antipsychotics, Antidepressants, Mood Stabilizers", weightage: "High", completed: false },
    ]
  },
  {
    id: "neet-18", title: "Anesthesiology", code: "PART-C", progress: 0,
    units: [
      { id: "nc18-1", name: "General Anesthesia — Stages, Inhalational & IV Agents", weightage: "High", completed: false },
      { id: "nc18-2", name: "Local & Regional Anesthesia — Spinal, Epidural, Nerve Blocks", weightage: "High", completed: false },
      { id: "nc18-3", name: "Pre-Operative Evaluation — ASA Grading, Airway Assessment", weightage: "Medium", completed: false },
      { id: "nc18-4", name: "ICU Basics — Mechanical Ventilation, Sedation, Monitoring", weightage: "High", completed: false },
    ]
  },
  {
    id: "neet-19", title: "Radiology", code: "PART-C", progress: 0,
    units: [
      { id: "nc19-1", name: "Imaging Modalities — X-ray, CT Scan, MRI, Ultrasound", weightage: "High", completed: false },
      { id: "nc19-2", name: "Radiation Safety — Units, Protection Principles", weightage: "Medium", completed: false },
      { id: "nc19-3", name: "Contrast Media — Types, Reactions, Precautions", weightage: "Medium", completed: false },
      { id: "nc19-4", name: "Interpretation of Chest X-ray, Abdominal X-ray, Skull X-ray", weightage: "High", completed: false },
      { id: "nc19-5", name: "Interventional Radiology Basics", weightage: "Low", completed: false },
    ]
  },
];

export const PRINTABLE_MATERIALS = [
  { id: "p1", name: "Ancient History Consolidated PDF", pages: 34, rating: "4.9" },
  { id: "p2", name: "Geography Hand-drawn Diagrams Pack", pages: 18, rating: "5.0" },
  { id: "p3", name: "Polity Quick-Revision Mind Maps", pages: 25, rating: "4.8" },
  { id: "p4", name: "General Science Mock Test Papers", pages: 52, rating: "4.7" }
];

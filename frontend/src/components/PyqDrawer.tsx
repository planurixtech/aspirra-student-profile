import React, { useState, useEffect } from 'react';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Question {
  id: string;
  year: string;
  exam: string;
  sectionName: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  theoryNote: string;
}

interface PyqDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topicName: string;
}

// Parent Subject Helper mapping
const getSubjectName = (topic: string): string => {
  const t = topic.toLowerCase();
  if (
    t.includes("scientific") || 
    t.includes("elements") || 
    t.includes("life science") || 
    t.includes("nutrition") || 
    t.includes("environment")
  ) {
    return "General Science";
  }
  if (
    t.includes("location") || 
    t.includes("water") || 
    t.includes("forests")
  ) {
    return "Geography of India";
  }
  if (
    t.includes("indus") || 
    t.includes("guptas") || 
    t.includes("national movement")
  ) {
    return "History & Culture";
  }
  if (
    t.includes("constitution") || 
    t.includes("citizenship") || 
    t.includes("executive") || 
    t.includes("union")
  ) {
    return "Indian Polity";
  }
  if (
    t.includes("five year") || 
    t.includes("gst") || 
    t.includes("inflation") || 
    t.includes("rbi") || 
    t.includes("policy")
  ) {
    return "Indian Economy";
  }
  if (
    t.includes("sangam") || 
    t.includes("pallavas") || 
    t.includes("self-respect") || 
    t.includes("dravidian")
  ) {
    return "Tamil Nadu Legacy";
  }
  if (
    t.includes("simplification") || 
    t.includes("interest") || 
    t.includes("ratio") || 
    t.includes("proportion")
  ) {
    return "Aptitude & Mental";
  }
  return "General Studies";
};

// Helper to convert index to lowercase Roman numerals (e.g., i, ii, iii, iv, etc.)
const toRoman = (num: number): string => {
  const roman = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
  return roman[num] || `${num + 1}`;
};

// High-Fidelity Question Database for TNPSC Syllabus Topics
const PYQ_DATABASE: Record<string, Question[]> = {
  // --- GENERAL SCIENCE ---
  "Scientific Laws & Mechanics": [
    {
      id: "sci-mech-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Scientific Laws & Fluid Mechanics",
      questionText: "Which scientific law states that at constant temperature, the volume of a given mass of gas is inversely proportional to its pressure?",
      options: [
        "A) Charles's Law",
        "B) Boyle's Law",
        "C) Avogadro's Law",
        "D) Gay-Lussac's Law"
      ],
      correctAnswer: "B) Boyle's Law",
      theoryNote: "Boyle's Law establishes that P × V = k when temperature remains static. This principle is fundamental in gas kinetics and thermodynamics calculations under the TNPSC General Science paradigm."
    },
    {
      id: "sci-mech-2",
      year: "2023",
      exam: "Group 2",
      sectionName: "1. Scientific Laws & Fluid Mechanics",
      questionText: "The working principle of a hydraulic lift is based on which of the following laws?",
      options: [
        "A) Pascal's Law",
        "B) Archimedes' Principle",
        "C) Bernoulli's Theorem",
        "D) Hooke's Law"
      ],
      correctAnswer: "A) Pascal's Law",
      theoryNote: "Pascal's Law states that pressure applied to an enclosed fluid is transmitted undiminished to every part of the fluid. This is crucial for heavy mechanical lifts and braking systems."
    },
    {
      id: "sci-mech-3",
      year: "2021",
      exam: "Group 4",
      sectionName: "2. Gravitation and Laws of Motion",
      questionText: "If the distance between two masses is doubled, the gravitational force between them becomes:",
      options: [
        "A) Doubled",
        "B) Halved",
        "C) Four times",
        "D) One-fourth"
      ],
      correctAnswer: "D) One-fourth",
      theoryNote: "According to Newton's Law of Universal Gravitation, force is inversely proportional to the square of the distance (F ∝ 1/r²). Hence, doubling the distance reduces the force to quarterly value."
    }
  ],
  "Elements, Acids, Bases & Salts": [
    {
      id: "sci-chem-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Chemistry of Acids and Bases",
      questionText: "Which acid is predominantly found in tamarind and is responsible for its sour taste?",
      options: [
        "A) Citric Acid",
        "B) Tartaric Acid",
        "C) Acetic Acid",
        "D) Lactic Acid"
      ],
      correctAnswer: "B) Tartaric Acid",
      theoryNote: "Tamarind contains Tartaric Acid. It is a white, crystalline organic acid that occurs naturally in many fruits, acting as a natural food preservative and antioxidant."
    },
    {
      id: "sci-chem-2",
      year: "2023",
      exam: "Group 4",
      sectionName: "1. Chemistry of Acids and Bases",
      questionText: "The chemical formula of Plaster of Paris is represented as:",
      options: [
        "A) CaSO4 · 2H2O",
        "B) CaSO4 · 1/2H2O",
        "C) CuSO4 · 5H2O",
        "D) CaSO4 · H2O"
      ],
      correctAnswer: "B) CaSO4 · 1/2H2O",
      theoryNote: "Plaster of Paris is Calcium Sulfate Hemihydrate (CaSO4 · 0.5H2O). It is prepared by heating gypsum (CaSO4 · 2H2O) to about 373 Kelvin."
    },
    {
      id: "sci-chem-3",
      year: "2020",
      exam: "Group 2",
      sectionName: "2. Common Salts and Compounds",
      questionText: "Which gas is released when sodium bicarbonate reacts with dilute hydrochloric acid?",
      options: [
        "A) Hydrogen",
        "B) Carbon dioxide",
        "C) Nitrogen dioxide",
        "D) Oxygen"
      ],
      correctAnswer: "B) Carbon dioxide",
      theoryNote: "Sodium bicarbonate (NaHCO3) reacts with HCl to produce Sodium Chloride, Water, and Carbon Dioxide gas (NaHCO3 + HCl → NaCl + H2O + CO2↑)."
    }
  ],
  "Main Concepts of Life Science": [
    {
      id: "sci-life-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Cell Biology and Organelles",
      questionText: "Which cellular organelle is responsible for cellular respiration and energy generation?",
      options: [
        "A) Lysosome",
        "B) Golgi Apparatus",
        "C) Mitochondria",
        "D) Endoplasmic Reticulum"
      ],
      correctAnswer: "C) Mitochondria",
      theoryNote: "Mitochondria are known as the powerhouses of the cell. They generate adenosine triphosphate (ATP) through aerobic cellular respiration."
    },
    {
      id: "sci-life-2",
      year: "2021",
      exam: "Group 2",
      sectionName: "2. Classification of Living World",
      questionText: "The 'Five Kingdom Classification' of living organisms was proposed by:",
      options: [
        "A) Carl Woese",
        "B) Robert Whittaker",
        "C) Carolus Linnaeus",
        "D) Gregor Mendel"
      ],
      correctAnswer: "B) Robert Whittaker",
      theoryNote: "Robert Whittaker introduced the five kingdoms in 1969: Monera, Protista, Fungi, Plantae, and Animalia, categorizing based on complexity of cell structure and source of nutrition."
    }
  ],
  "Nutrition, Health & Hygiene": [
    {
      id: "sci-health-1",
      year: "2024",
      exam: "Group 2",
      sectionName: "1. Human Nutrition and Deficiencies",
      questionText: "The deficiency of which of the following vitamins causes night blindness?",
      options: [
        "A) Vitamin A",
        "B) Vitamin B1",
        "C) Vitamin C",
        "D) Vitamin D"
      ],
      correctAnswer: "A) Vitamin A",
      theoryNote: "Vitamin A (Retinol) deficiency leads to Xerophthalmia and night blindness. Source foods rich in Vitamin A include carrots, sweet potatoes, and green leafy vegetables."
    },
    {
      id: "sci-health-2",
      year: "2023",
      exam: "Group 1",
      sectionName: "2. Bacterial and Viral Pathogens",
      questionText: "Which of the following diseases is caused by a bacterial pathogen?",
      options: [
        "A) Tuberculosis",
        "B) Influenza",
        "C) Malaria",
        "D) Dengue Fever"
      ],
      correctAnswer: "A) Tuberculosis",
      theoryNote: "Tuberculosis (TB) is caused by the bacterium Mycobacterium tuberculosis. Influenza and Dengue are viral, whereas malaria is caused by the protozoan parasite Plasmodium."
    }
  ],
  "Environment, Pollution & Human Diseases": [
    {
      id: "sci-env-1",
      year: "2023",
      exam: "Group 1",
      sectionName: "1. Pollution and Ecological Hazards",
      questionText: "A high concentration of mercury in water bodies leads to which human physiological disease?",
      options: [
        "A) Itai-Itai Disease",
        "B) Minamata Disease",
        "C) Blue Baby Syndrome",
        "D) Silicosis"
      ],
      correctAnswer: "B) Minamata Disease",
      theoryNote: "Minamata disease is a neurological syndrome caused by severe mercury poisoning. It was first discovered in Minamata City in Kumamoto Prefecture, Japan, in 1956."
    },
    {
      id: "sci-env-2",
      year: "2021",
      exam: "Group 4",
      sectionName: "1. Pollution and Ecological Hazards",
      questionText: "Which of the following gases is majorly responsible for the formation of Acid Rain?",
      options: [
        "A) Carbon monoxide & Carbon dioxide",
        "B) Sulphur dioxide & Nitrogen oxides",
        "C) Helium & Argon",
        "D) Methane & Ozone"
      ],
      correctAnswer: "B) Sulphur dioxide & Nitrogen oxides",
      theoryNote: "Sulphur dioxide (SO2) and Nitrogen oxides (NOx) react with water molecules in the atmosphere to produce sulfurous/sulfuric acid and nitric acid, leading to acid rain."
    }
  ],

  // --- GEOGRAPHY OF INDIA ---
  "Location, Physical Features & Monsoon": [
    {
      id: "geo-loc-1",
      year: "2023",
      exam: "Group 1",
      sectionName: "1. Location, Physical Features & The Universe",
      questionText: "Which of the following passes connects the Nilgiris and Anamalai hills in the Western Ghats?",
      options: [
        "A) Palghat Gap",
        "B) Shencottah Gap",
        "C) Thalghat",
        "D) Bhorghat"
      ],
      correctAnswer: "A) Palghat Gap",
      theoryNote: "The Palghat Gap is a major low mountain pass in the Western Ghats of India, spanning about 32 km in width and serving as a crucial link between Tamil Nadu and Kerala states."
    },
    {
      id: "geo-loc-2",
      year: "2021",
      exam: "Group 2",
      sectionName: "1. Location, Physical Features & The Universe",
      questionText: "Which imaginary line passes through the center of the Earth, connecting the North Pole and the South Pole?",
      options: [
        "A) Equator",
        "B) Axis",
        "C) Tropic of Cancer",
        "D) Prime Meridian"
      ],
      correctAnswer: "B) Axis",
      theoryNote: "The Earth's axis of rotation is tilted at an angle of 23.5 degrees relative to its orbital plane around the Sun, which is the primary cause of the seasons."
    },
    {
      id: "geo-loc-3",
      year: "2024",
      exam: "Group 4",
      sectionName: "2. Weather and Climate (Monsoon)",
      questionText: "The retreating monsoon brings rainfall to which part of India?",
      options: [
        "A) Malabar Coast",
        "B) Coromandel Coast",
        "C) Konkan Coast",
        "D) Gujarat Coast"
      ],
      correctAnswer: "B) Coromandel Coast",
      theoryNote: "The retreating southwest monsoon (northeast monsoon) picks up moisture from the Bay of Bengal and causes heavy rainfall in the coastal regions of Tamil Nadu and Andhra Pradesh during October and November."
    },
    {
      id: "geo-loc-4",
      year: "2020",
      exam: "Group 1",
      sectionName: "2. Weather and Climate (Monsoon)",
      questionText: "Which wind is responsible for rains in Jammu and Kashmir during winter?",
      options: [
        "A) Western Disturbances",
        "B) Kalbaisakhi",
        "C) Loo",
        "D) Mango Showers"
      ],
      correctAnswer: "A) Western Disturbances",
      theoryNote: "Western Disturbances are extra-tropical storms originating in the Mediterranean region. They bring sudden winter rain and snow to northwestern regions of the Indian subcontinent."
    }
  ],
  "Water Resources, Rivers & Soil Types": [
    {
      id: "geo-water-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Indian River Systems and Hydro Energy",
      questionText: "Which of the following peninsular rivers is also known as the 'Dakshin Ganga'?",
      options: [
        "A) Krishna",
        "B) Kaveri",
        "C) Godavari",
        "D) Mahanadi"
      ],
      correctAnswer: "C) Godavari",
      theoryNote: "The Godavari is the largest peninsular river system in India. It is often referred to as 'Dakshin Ganga' (Ganges of the South) owing to its massive length and geographical basin coverage."
    },
    {
      id: "geo-water-2",
      year: "2022",
      exam: "Group 2",
      sectionName: "2. Properties of Soils in India",
      questionText: "Which soil type is self-ploughing in nature and is highly suitable for cotton cultivation?",
      options: [
        "A) Alluvial Soil",
        "B) Red Soil",
        "C) Black Soil",
        "D) Laterite Soil"
      ],
      correctAnswer: "C) Black Soil",
      theoryNote: "Black soil (Regur soil) is rich in clay. On drying, it develops deep cracks, which aids in self-aeration. This is why it is called 'self-ploughing' and is ideal for growing cotton crops."
    }
  ],
  "Forests, Wildlife & Natural Vegetation": [
    {
      id: "geo-forest-1",
      year: "2025",
      exam: "Group 1",
      sectionName: "1. Natural Vegetation & Sanctuaries",
      questionText: "Which state in India possesses the largest total area of forest cover as per the Indian State of Forest Report?",
      options: [
        "A) Arunachal Pradesh",
        "B) Madhya Pradesh",
        "C) Chhattisgarh",
        "D) Mizoram"
      ],
      correctAnswer: "B) Madhya Pradesh",
      theoryNote: "Area-wise, Madhya Pradesh has the largest forest cover in the country, followed by Arunachal Pradesh, Chhattisgarh, Odisha, and Maharashtra."
    },
    {
      id: "geo-forest-2",
      year: "2022",
      exam: "Group 1",
      sectionName: "2. Biosphere Reserves & Ecosystems",
      questionText: "The Gulf of Mannar Biosphere Reserve is located in which Indian State?",
      options: [
        "A) Kerala",
        "B) Andhra Pradesh",
        "C) West Bengal",
        "D) Tamil Nadu"
      ],
      correctAnswer: "D) Tamil Nadu",
      theoryNote: "The Gulf of Mannar Biosphere Reserve is a large shallow bay forming part of the Laccadive Sea in the Indian Ocean, situated off the southeastern tip of Tamil Nadu."
    }
  ],

  // --- HISTORY & CULTURE ---
  "Indus Valley Civilization & Vedic Age": [
    {
      id: "his-ivc-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Indus Valley Civilisation Site Analysis",
      questionText: "The exclusive Harappan urban site with evidence of unique water harvesting systems consisting of giant reservoirs is:",
      options: [
        "A) Kalibangan",
        "B) Lothal",
        "C) Dholavira",
        "D) Banawali"
      ],
      correctAnswer: "C) Dholavira",
      theoryNote: "Dholavira in Gujarat is famous for its intricate water management system comprising sophisticated stone-cut reservoirs and channels. It is a UNESCO World Heritage Site."
    },
    {
      id: "his-ivc-2",
      year: "2021",
      exam: "Group 2",
      sectionName: "1. Indus Valley Civilisation Site Analysis",
      questionText: "The famous bronze 'Dancing Girl' statuette of the Mohenjo-daro site was manufactured using which technique?",
      options: [
        "A) Stone carving",
        "B) Terracotta molding",
        "C) Lost-wax casting",
        "D) Iron beating"
      ],
      correctAnswer: "C) Lost-wax casting",
      theoryNote: "The 'Dancing Girl' was produced using the Cire Perdue (lost-wax) metallurgy technique, showing advanced sculptural mastery during the Bronze Age in 2500 BCE."
    }
  ],
  "Guptas, Delhi Sultans, Mughals & Marathas": [
    {
      id: "his-medieval-1",
      year: "2023",
      exam: "Group 1",
      sectionName: "1. Gupta Administration & Medieval Dynasties",
      questionText: "Which Gupta Emperor is designated as 'Kaviraja' (King of Poets) in Allahabad Pillar inscription?",
      options: [
        "A) Chandragupta I",
        "B) Samudragupta",
        "C) Chandragupta II",
        "D) Skandagupta"
      ],
      correctAnswer: "B) Samudragupta",
      theoryNote: "Samudragupta was a great patron of art and literature. Coins depicting him playing the veena substantiate his musical talents, making him the designated 'Kaviraja'."
    },
    {
      id: "his-medieval-2",
      year: "2022",
      exam: "Group 1",
      sectionName: "2. Delhi Sultanate & Mughal Innovations",
      questionText: "Who among the following Delhi Sultans introduced the market control regulations and price pricing policies?",
      options: [
        "A) Iltutmish",
        "B) Balban",
        "C) Alauddin Khalji",
        "D) Firoz Shah Tughlaq"
      ],
      correctAnswer: "C) Alauddin Khalji",
      theoryNote: "Alauddin Khalji established centralized market regulations, price controls, and dedicated grain silos to maintain a huge standing army at low costs."
    }
  ],
  "Indian National Movement & Social Reformers": [
    {
      id: "his-inm-1",
      year: "2024",
      exam: "Group 2",
      sectionName: "1. Key Milestones of Indian Struggle",
      questionText: "Who founded the 'East India Association' in London in the year 1866 to promote Indian interests?",
      options: [
        "A) Dadabhai Naoroji",
        "B) Surendranath Banerjee",
        "C) Gopal Krishna Gokhale",
        "D) Womesh Chandra Bonnerjee"
      ],
      correctAnswer: "A) Dadabhai Naoroji",
      theoryNote: "Dadabhai Naoroji (Grand Old Man of India) started the East India Association. He also put forward the 'Drain theory' explaining India's wealth exploitation."
    },
    {
      id: "his-inm-2",
      year: "2020",
      exam: "Group 1",
      sectionName: "1. Key Milestones of Indian Struggle",
      questionText: "In which year did the historic Bardoli Satyagraha, led by Sardar Vallabhbhai Patel, take place?",
      options: [
        "A) 1920",
        "B) 1924",
        "C) 1928",
        "D) 1932"
      ],
      correctAnswer: "C) 1928",
      theoryNote: "The Bardoli Satyagraha of 1928 in Gujarat was a highly successful farmers' movement against unjust tax collection, earning Patel the title of 'Sardar'."
    }
  ],

  // --- INDIAN POLITY ---
  "Constitution of India, Preamble & Union": [
    {
      id: "pol-const-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Historical Background & Drafting Model",
      questionText: "The idea of including Directive Principles of State Policy (DPSP) in the Indian Constitution was borrowed from?",
      options: [
        "A) Irish Constitution",
        "B) US Constitution",
        "C) Weimar Constitution",
        "D) Canadian Constitution"
      ],
      correctAnswer: "A) Irish Constitution",
      theoryNote: "DPSPs are listed under Part IV (Articles 36-51) of the Indian Constitution, modeled after the Irish Constitution, aiming to establish a socio-economic welfare state."
    },
    {
      id: "pol-const-2",
      year: "2021",
      exam: "Group 2",
      sectionName: "1. Historical Background & Drafting Model",
      questionText: "Who was appointed as the Constitutional Advisor to the Drafting Assembly in 1946?",
      options: [
        "A) Dr. Rajendra Prasad",
        "B) Sir B.N. Rau",
        "C) K.M. Munshi",
        "D) Dr. B.R. Ambedkar"
      ],
      correctAnswer: "B) Sir B.N. Rau",
      theoryNote: "Sir Benegal Narsing Rau was appointed as the advisor, preparing the skeletal draft of the constitution which was subsequently modified by the Ambedkar-led committee."
    }
  ],
  "Citizenship, Fundamental Rights & Duties": [
    {
      id: "pol-rights-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Fundamental Rights Protection",
      questionText: "Which Article of the Constitution abolishes practice of 'Untouchability' and patterns any penal offense?",
      options: [
        "A) Article 15",
        "B) Article 16",
        "C) Article 17",
        "D) Article 18"
      ],
      correctAnswer: "C) Article 17",
      theoryNote: "Article 17 is an absolute right that abolishes untouchability and forbids its practice in any form. It was reinforced by the Protection of Civil Rights Act."
    },
    {
      id: "pol-rights-2",
      year: "2023",
      exam: "Group 4",
      sectionName: "2. Fundamental Duties & Civic Ethics",
      questionText: "Fundamental Duties were incorporated into Part IV-A of the Constitution of India based on recommendation of which committee?",
      options: [
        "A) Sarkaria Commission",
        "B) Balwant Rai Mehta Committee",
        "C) Swaran Singh Committee",
        "D) Verma Committee"
      ],
      correctAnswer: "C) Swaran Singh Committee",
      theoryNote: "The 42nd Amendment of 1976 added Article 51A prescribing Fundamental Duties on recommendation of the Swaran Singh Committee during the Emergency era."
    }
  ],
  "Union Executive, Parliament, State & Panchayat Raj": [
    {
      id: "pol-governance-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Parliamentary Democracy",
      questionText: "Under which Article can the President of India declare a Failure of Constitutional Machinery in States (President's Rule)?",
      options: [
        "A) Article 352",
        "B) Article 356",
        "C) Article 360",
        "D) Article 365"
      ],
      correctAnswer: "B) Article 356",
      theoryNote: "Article 356 deals with the imposition of President's Rule in case a state government cannot carry out functions in accordance with the provisions of the Constitution."
    },
    {
      id: "pol-governance-2",
      year: "2020",
      exam: "Group 2",
      sectionName: "2. Local Government (Panchayat Raj)",
      questionText: "Which Constitutional Amendment act bestowed legal constitutional safety status upon Urban Local Bodies / Municipalities?",
      options: [
        "A) 73rd Amendment Act",
        "B) 74th Amendment Act",
        "C) 86th Amendment Act",
        "D) 91st Amendment Act"
      ],
      correctAnswer: "B) 74th Amendment Act",
      theoryNote: "The 74th Amendment Act of 1992 added Part IX-A and 12th Schedule, providing uniform structural status to urban local self-government institutions."
    }
  ],

  // --- Indian Economy ---
  "Five Year Plans & NITI Aayog Functions": [
    {
      id: "eco-plans-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Economic Planning in India",
      questionText: "Who is the ex-officio Chairperson of the NITI Aayog, which replaced the Planning Commission?",
      options: [
        "A) President of India",
        "B) Finance Minister of India",
        "C) Prime Minister of India",
        "D) Governor of RBI"
      ],
      correctAnswer: "C) Prime Minister of India",
      theoryNote: "NITI Aayog (National Institution for Transforming India) was formed on Jan 1, 2015. The ex-officio chairperson is always the serving Prime Minister."
    },
    {
      id: "eco-plans-2",
      year: "2021",
      exam: "Group 2",
      sectionName: "1. Economic Planning in India",
      questionText: "The historical Harrod-Domar growth model was used as the foundational template for which Indian Five Year Plan?",
      options: [
        "A) First Five Year Plan",
        "B) Second Five Year Plan",
        "C) Third Five Year Plan",
        "D) Fifth Five Year Plan"
      ],
      correctAnswer: "A) First Five Year Plan",
      theoryNote: "The First Five Year Plan (1951-1956) was based on the Harrod-Domar growth model and focused heavily on agriculture, irrigation, and power sectors."
    }
  ],
  "GST Structure, Public Finance & Direct/Indirect Taxes": [
    {
      id: "eco-taxes-1",
      year: "2023",
      exam: "Group 1",
      sectionName: "1. Taxation and Fiscal System",
      questionText: "Goods and Services Tax (GST) is a destination-based tax on consumption of goods and services. It was introduced via which amendment?",
      options: [
        "A) 99th Constitutional Amendment",
        "B) 100th Constitutional Amendment",
        "C) 101st Constitutional Amendment",
        "D) 102nd Constitutional Amendment"
      ],
      correctAnswer: "C) 101st Constitutional Amendment",
      theoryNote: "The 101st Amendment Act of 2016 introduced GST in India starting 1st July 2017, subsuming various state and central indirect taxes into a unified regime."
    }
  ],
  "Inflation, RBI, Commercial Banks & Monetary Policy": [
    {
      id: "eco-banking-1",
      year: "2023",
      exam: "Group 1",
      sectionName: "1. Banking Regulation & Inflation",
      questionText: "Which statutory committee recommended the creation of the Reserve Bank of India (RBI) as a central authority?",
      options: [
        "A) Hilton Young Commission",
        "B) Keynes Commission",
        "C) Chamberlain Committee",
        "D) Acworth Committee"
      ],
      correctAnswer: "A) Hilton Young Commission",
      theoryNote: "The Hilton Young Commission (Royal Commission on Indian Currency and Finance) recommended the creation of the RBI in 1926, which started functioning in 1935."
    },
    {
      id: "eco-banking-2",
      year: "2024",
      exam: "Group 4",
      sectionName: "1. Banking Regulation & Inflation",
      questionText: "When the Reserve Bank of India increase the Repo Rate, what is the expected outcome?",
      options: [
        "A) Inflation decreases",
        "B) Money supply increases",
        "C) Borrowing costs of commercial banks decrease",
        "D) Deposit rates decrease substantially"
      ],
      correctAnswer: "A) Inflation decreases",
      theoryNote: "Increasing the Repo Rate increases borrowing costs, thereby pulling down consumer spending and loan creation, ultimately helping to curb demand-pull inflation."
    }
  ],

  // --- TAMIL NADU LEGACY ---
  "Sangam Age Literature & Early Tamil Society": [
    {
      id: "tam-sangam-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Sangam Polity and Literature",
      questionText: "Which of the following ancient works represents the earliest available grammar book of classical Tamil literature?",
      options: [
        "A) Pattupattu",
        "B) Tolkappiyam",
        "C) Ettuthogai",
        "D) Silappathikaram"
      ],
      correctAnswer: "B) Tolkappiyam",
      theoryNote: "Tolkappiyam, written by Tolkappiyar, is a comprehensive treatise not only on grammar but also on the social life and culture of ancient Tamil lands during the Sangam Era."
    },
    {
      id: "tam-sangam-2",
      year: "2021",
      exam: "Group 2",
      sectionName: "1. Sangam Polity and Literature",
      questionText: "The Sangam classic Silappathikaram (The Tale of an Anklet) was authored by which royal ascetic poet?",
      options: [
        "A) Sittalai Sattanar",
        "B) Ilango Adigal",
        "C) Kapilar",
        "D) Thiruvalluvar"
      ],
      correctAnswer: "B) Ilango Adigal",
      theoryNote: "Ilango Adigal, a Chera prince, wrote Silappathikaram. It belongs to the Five Great Epics of Tamil literature."
    }
  ],
  "Pallavas, Imperial Cholas & Pandyas Dynasties": [
    {
      id: "tam-dynasties-1",
      year: "2023",
      exam: "Group 1",
      sectionName: "1. Temple Architecture and Administration",
      questionText: "The masterpiece world heritage monument 'Brihadisvara Temple' at Thanjavur was constructed by:",
      options: [
        "A) Rajendra Chola I",
        "B) Rajaraja Chola I",
        "C) Aditya Chola",
        "D) Vijayalaya Chola"
      ],
      correctAnswer: "B) Rajaraja Chola I",
      theoryNote: "Rajaraja Chola I commissioned this masterpiece temple (Big Temple) in 1010 CE. It stands as a brilliant achievement of Dravidian temple architecture."
    },
    {
      id: "tam-dynasties-2",
      year: "2020",
      exam: "Group 1",
      sectionName: "1. Temple Architecture and Administration",
      questionText: "The rock-cut Shore Temple of Mahabalipuram was constructed during the reign of which Pallava ruler?",
      options: [
        "A) Mahendravarman I",
        "B) Narasimhavarman II (Rajasimha)",
        "C) Nandivarman II",
        "D) Simhavishnu"
      ],
      correctAnswer: "B) Narasimhavarman II (Rajasimha)",
      theoryNote: "The Shore Temple was built under Rajasimha (Narasimhavarman II) in the early 8th century, pioneering structural stone temples in South India."
    }
  ],
  "Self-Respect Movement, Justice Party & Dravidian Legacy": [
    {
      id: "tam-reforms-1",
      year: "2024",
      exam: "Group 1",
      sectionName: "1. Social Reform Movements in Madras Presidency",
      questionText: "The Self-Respect Movement (Suyamariyadhai Iyakkam) was founded in the year 1925 by:",
      options: [
        "A) C. Natesa Mudaliar",
        "B) E.V. Ramasamy (Periyar)",
        "C) T.M. Nair",
        "D) C.N. Annadurai"
      ],
      correctAnswer: "B) E.V. Ramasamy (Periyar)",
      theoryNote: "E.V. Ramasamy launched the Self-Respect Movement to eliminate caste distinctions and push for equal rights, rationality, and women's liberation."
    },
    {
      id: "tam-reforms-2",
      year: "2021",
      exam: "Group 2",
      sectionName: "1. Social Reform Movements in Madras Presidency",
      questionText: "The Justice Party was responsible for implementing which crucial system in Madras Presidency in 1921 & 1922?",
      options: [
        "A) Communal G.O (Communal Representation)",
        "B) Zamindari Abolition System",
        "C) Ryotwari Revenue System",
        "D) Dual Government structure"
      ],
      correctAnswer: "A) Communal G.O (Communal Representation)",
      theoryNote: "The Justice Party passed the historic Communal G.O.s to ensure reservations in administrative jobs and educational admission for non-Brahmins."
    }
  ],

  // --- APTITUDE & MENTAL ---
  "Simplification, Percentage, LCM & HCF": [
    {
      id: "apt-math-1",
      year: "2023",
      exam: "Group 1",
      sectionName: "1. Mathematical Aptitude Unit",
      questionText: "Find the HCF of 24, 36, and 40.",
      options: [
        "A) 4",
        "B) 6",
        "C) 8",
        "D) 12"
      ],
      correctAnswer: "A) 4",
      theoryNote: "Factors of 24: 1,2,3,4,6,8,12,24. Factors of 36: 1,2,3,4,6,9,12,18,36. Factors of 40: 1,2,4,5,8,10,20,40. The highest common divisor is 4."
    },
    {
      id: "apt-math-2",
      year: "2021",
      exam: "Group 4",
      sectionName: "1. Mathematical Aptitude Unit",
      questionText: "If 20% of 30% of a number is 12, then find the value of that number?",
      options: [
        "A) 100",
        "B) 200",
        "C) 300",
        "D) 400"
      ],
      correctAnswer: "B) 200",
      theoryNote: "Let the number be x. Then: (20/100) * (30/100) * x = 12 => (6/100) * x = 12 => x = (12 * 100) / 6 = 200."
    }
  ],
  "Simple Interest & Compound Interest Formulae": [
    {
      id: "apt-interest-1",
      year: "2024",
      exam: "Group 2",
      sectionName: "1. Financial Mathematics and Interests",
      questionText: "The difference between simple interest and compound interest on Rs. 1000 at 10% per annum for 2 years is:",
      options: [
        "A) Rs. 10",
        "B) Rs. 15",
        "C) Rs. 20",
        "D) Rs. 25"
      ],
      correctAnswer: "A) Rs. 10",
      theoryNote: "The formula for difference for 2 years is D = P(r/100)². Here, D = 1000 × (10/100)² = 1000 × 0.01 = Rs. 10."
    }
  ],
  "Ratio, Proportion, Time and Work & Reasoning": [
    {
      id: "apt-ratio-1",
      year: "2023",
      exam: "Group 1",
      sectionName: "1. Proportionality & Time Calculations",
      questionText: "If A can complete a piece of work in 10 days and B can finish the same work in 15 days, in how many days can they complete it working together?",
      options: [
        "A) 5 days",
        "B) 6 days",
        "C) 7 days",
        "D) 8 days"
      ],
      correctAnswer: "B) 6 days",
      theoryNote: "Combined efficiency/rate: (1/10) + (1/15) = (3 + 2)/30 = 5/30 = 1/6. Taking the reciprocal gives the total days, which is 6 days."
    }
  ]
};

export default function PyqDrawer({ isOpen, onClose, topicName }: PyqDrawerProps) {
  const [selectedYear, setSelectedYear] = useState<string>("All");

  if (!isOpen) return null;

  const subjectName = getSubjectName(topicName);
  
  // Retrieve questions for this topic, fallback to sample templates if undefined
  const topicQuestions = PYQ_DATABASE[topicName] || [
    {
      id: "fallback-q1",
      year: "2023",
      exam: "Group 1",
      sectionName: `1. Core Fundamentals of ${topicName}`,
      questionText: `Which of the following aspects is most crucial for solving questions related to '${topicName}'?`,
      options: [
        "A) Factual memory of chronological milestones",
        "B) Application of analytical core principles",
        "C) Evaluating state legislative updates",
        "D) Understanding socio-economic indicators"
      ],
      correctAnswer: "B) Application of analytical core principles",
      theoryNote: `For ${topicName}, mastering the conceptual core framework and revision of standard test paradigms under the TNPSC syllabus ensures a high retention model score.`
    },
    {
      id: "fallback-q2",
      year: "2021",
      exam: "Group 2",
      sectionName: `1. Core Fundamentals of ${topicName}`,
      questionText: `Consider the following statements regarding the provisions of '${topicName}':\n1. It emphasizes systemic decentralization.\n2. The state-level authority maintains exclusive jurisdiction over local conflicts.\nWhich of the statements given above is/are correct?`,
      options: [
        "A) 1 only",
        "B) 2 only",
        "C) Both 1 and 2",
        "D) Neither 1 nor 2"
      ],
      correctAnswer: "A) 1 only",
      theoryNote: "The apex central regulatory framework overrides state bodies in case of a direct legislative conflict, rendering statement 2 false under the Indian administration structure."
    }
  ];

  // Available filters span from 2020 to 2026 as per Image 3
  const filterYears = ["All", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];

  // Helper code to get count of questions for a specific year
  const getYearCount = (year: string): number => {
    if (year === "All") return topicQuestions.length;
    return topicQuestions.filter(q => q.year === year).length;
  };

  // Filter original list based on year selection
  const filteredQuestions = selectedYear === "All" 
    ? topicQuestions 
    : topicQuestions.filter(q => q.year === selectedYear);

  // Group questions by section name
  const sectionsMap: Record<string, Question[]> = {};
  filteredQuestions.forEach(q => {
    if (!sectionsMap[q.sectionName]) {
      sectionsMap[q.sectionName] = [];
    }
    sectionsMap[q.sectionName].push(q);
  });

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end select-none" id="pyq-fullview-overlay">
      {/* Visual background glass backdrop with fade trigger */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] cursor-pointer"
        onClick={onClose}
      />

      {/* Dynamic full-cover container sliding from Right to Left (Matches exact layout) */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-full md:max-w-2xl bg-[#edf4fc] flex flex-col h-full z-50 shadow-2xl border-l border-slate-200"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* TOP BAR / NAVIGATION HEADER (Matches Image 4) */}
        <div className="bg-[#edf4fc] pt-4.5 pb-2.5 px-5 flex items-center justify-between border-b border-slate-200/50 shrink-0">
          <button 
            onClick={onClose}
            className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center bg-white shadow-sm cursor-pointer hover:bg-slate-50 active:scale-95 transition"
            title="Go back to syllabus overview"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
          </button>

          {/* Central PYQ Tag badge matches Image 4 */}
          <div className="px-5 py-1.5 bg-[#125652] text-white text-[11px] font-black tracking-widest rounded-full shadow-sm uppercase leading-none">
            PYQ
          </div>

          {/* Balanced right spacing */}
          <div className="w-10" />
        </div>

        {/* METADATA PILLS: Subject Pill & Subtopic Pill (Matches Image 1 and 2) */}
        <div className="px-5 pt-3 pb-3 bg-[#edf4fc] flex flex-wrap gap-2.5 items-center shrink-0">
          {/* Badge A (Subject Badge) - Matches Image 1 */}
          <div className="px-4 py-2 bg-[#207268] text-white text-[12.5px] font-extrabold rounded-xl shadow-sm tracking-tight leading-none">
            {subjectName}
          </div>

          {/* Badge B (Subtopic Badge) - Matches Image 2 */}
          <div className="px-3.5 py-2 bg-[#e4ecf5] text-slate-700 text-[11px] font-extrabold rounded-full border border-[#cadbe8] flex items-center gap-1 leading-none shadow-sm">
            <span>{topicName}</span>
            <span className="text-[#a0afbf] mx-0.5">•</span>
            <span className="text-slate-550">{subjectName}</span>
          </div>
        </div>

        {/* HORIZONTAL YEAR FILTER SELECTOR LIST (Matches Image 3) */}
        <div className="px-5 py-2 bg-[#edf4fc] border-b border-slate-200/65 shrink-0">
          <div className="flex items-center gap-3.5 overflow-x-auto pb-2.5 scrollbar-none">
            {filterYears.map((year) => {
              const count = getYearCount(year);
              const isActive = selectedYear === year;

              if (year === "All") {
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear("All")}
                    className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer border ${
                      isActive 
                        ? 'bg-[#125652] text-white border-[#125652] shadow-md' 
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-350 shadow-sm'
                    }`}
                  >
                    All
                  </button>
                );
              }

              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex flex-col items-center justify-center shrink-0 border min-w-[62px] ${
                    isActive 
                      ? 'bg-[#125652] text-white border-[#125652] shadow-md' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <span className="text-[12px] font-extrabold leading-tight">{year}</span>
                  <span className={`text-[9.5px] block font-semibold mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                    {count}Q
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SCROLLABLE QUESTION LIST VIEWPORT (Matches Image 4, 5, and 6) */}
        <div className="flex-grow overflow-y-auto bg-[#edf4fc] px-6 py-6 pb-20 text-left">
          {filteredQuestions.length > 0 ? (
            <div className="space-y-8 max-w-xl mx-auto">
              {Object.keys(sectionsMap).map((sectionTitle) => (
                <div key={sectionTitle} className="space-y-4">
                  {/* Section Label Heading: e.g. "1. Location, Physical Features & The Universe" */}
                  <h4 className="font-extrabold text-[15.5px] text-slate-900 tracking-tight leading-snug outline-none border-b border-slate-250/50 pb-1.5">
                    {sectionTitle}
                  </h4>

                  {/* List of Questions in Section */}
                  <div className="space-y-6 pl-1 pt-1">
                    {sectionsMap[sectionTitle].map((q, idx) => (
                      <div key={q.id} className="space-y-3.5 border-l-2 border-slate-200 pl-3.5 pb-2">
                        {/* Question Text with Roman Numeral */}
                        <div className="text-slate-800 text-[13.5px] font-bold leading-normal">
                          <span className="font-black text-slate-900">{toRoman(idx)} ) Question:</span>{" "}
                          <span>{q.questionText}</span>
                        </div>

                        {/* Answers Listed as Bullet Items */}
                        <ul className="space-y-1.5 pl-4 text-[13px] text-slate-700 font-semibold leading-relaxed">
                          {q.options.map((opt, optIdx) => (
                            <li key={optIdx} className="list-disc pl-1 text-slate-650">
                              {opt}
                            </li>
                          ))}
                        </ul>

                        {/* Correct Answer Identifier */}
                        <p className="text-[13px] font-black text-[#13514a] leading-none mt-2">
                          Answer: <span className="font-semibold text-slate-800">{q.correctAnswer}</span>
                        </p>

                        {/* Beautiful and informative Theory Note block */}
                        {q.theoryNote && (
                          <p className="text-[12.5px] text-slate-700 leading-relaxed mt-2.5">
                            <span className="font-extrabold text-slate-850">Theory Note: </span>
                            <span className="font-medium text-slate-600">{q.theoryNote}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 space-y-3.5 text-slate-500 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center mx-auto text-slate-400">
                <HelpCircle className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-slate-750">No questions found</p>
                <p className="text-xs text-slate-500 font-medium">There are no compiled past questions listed for the year {selectedYear}. Select another year or 'All' to review.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

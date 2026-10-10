import { DBComplaint } from '../db/dexieDb.js';

export const SAMPLE_COMPLAINTS: DBComplaint[] = [
  // 1. Acceptance Case: Lift stuck with elderly (Gujlish, Critical)
  {
    id: 'CMP-2026-001',
    trackingId: 'TRK-LIFT-8921',
    originalText: 'lift ma fasai gaya, ek vrudh chhe, 5 minute ma train chhe',
    normalizedText: 'lift ma fasai gaya, ek vrudh chhe, 5 minute ma train chhe',
    script: 'latin',
    lang_guess: 'gu',
    primaryDepartment: 'lifts',
    secondaryDepartments: ['safety'],
    allDepartments: ['lifts', 'safety'],
    urgencyScore: 100,
    urgencyBand: 'Critical',
    urgencyBreakdown: [
      { name: 'Base (safety)', points: 40, description: 'Department base score', category: 'base' },
      { name: 'Floor: stuck', points: 85, description: 'Critical danger floor', category: 'floor' },
      { name: 'Modifier: Vulnerable Person', points: 10, description: 'Elderly passenger trapped', category: 'modifier' },
      { name: 'Modifier: Time Pressure', points: 10, description: 'Train in 5 minutes', category: 'modifier' }
    ],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-02',
    assetId: 'LIFT-03',
    channel: 'app',
    contactName: 'Jignesh Patel',
    contactPhone: '+91 98250 11223',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    auditTrail: [
      { action: 'CREATED', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), actor: 'Passenger via App' }
    ]
  },

  // 2. Harassment case (English, Critical/High)
  {
    id: 'CMP-2026-002',
    trackingId: 'TRK-SAFE-4412',
    originalText: 'A man near Gate 1 was misbehaving, stalking and eve-teasing female passengers continuously',
    normalizedText: 'a man near gate 1 was misbehaving, stalking and eve-teasing female passengers continuously',
    script: 'latin',
    lang_guess: 'en',
    primaryDepartment: 'safety',
    secondaryDepartments: [],
    allDepartments: ['safety'],
    urgencyScore: 95,
    urgencyBand: 'Critical',
    urgencyBreakdown: [
      { name: 'Base (safety)', points: 40, description: 'Department base score', category: 'base' },
      { name: 'Floor: harassment', points: 85, description: 'Harassment danger floor', category: 'floor' },
      { name: 'Modifier: Vulnerable Person', points: 10, description: 'Female passenger targeted', category: 'modifier' }
    ],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    assetId: 'PF-01',
    channel: 'app',
    contactName: 'Priya Sharma',
    contactPhone: '+91 94280 44556',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    auditTrail: [
      { action: 'CREATED', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), actor: 'Passenger via App' },
      { action: 'TRIAGED', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), actor: 'System Auto-Triage' }
    ]
  },

  // 3. Fare overcharge (Devanagari Hindi, Low)
  {
    id: 'CMP-2026-003',
    trackingId: 'TRK-FARE-1192',
    originalText: 'टिकट मशीन ने 100 रुपये काट लिए पर टिकट नहीं दिया और रिफंड नहीं मिला',
    normalizedText: 'टिकट मशीन ने 100 रुपये काट लिए पर टिकट नहीं दिया और रिफंड नहीं मिला',
    script: 'devanagari',
    lang_guess: 'hi',
    primaryDepartment: 'fare',
    secondaryDepartments: [],
    allDepartments: ['fare'],
    urgencyScore: 15,
    urgencyBand: 'Low',
    urgencyBreakdown: [
      { name: 'Base (fare)', points: 15, description: 'Department base score for fare', category: 'base' }
    ],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-04',
    assetId: 'TVM-03',
    channel: 'app',
    contactName: 'Ramesh Verma',
    contactPhone: '+91 97120 77889',
    createdAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    auditTrail: [
      { action: 'CREATED', timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(), actor: 'Passenger via App' }
    ]
  },

  // 4. Cleanliness complaint in Gujarati script (Medium)
  {
    id: 'CMP-2026-004',
    trackingId: 'TRK-CLEN-3031',
    originalText: 'પ્લેટફોર્મ ૧ પર કચરો અને ગંદકી છે, ટોયલેટમાંથી ભારે દુર્ગંધ આવે છે',
    normalizedText: 'પ્લેટફોર્મ 1 પર કચરો અને ગંદકી છે, ટોયલેટમાંથી ભારે દુર્ગંધ આવે છે',
    script: 'gujarati',
    lang_guess: 'gu',
    primaryDepartment: 'cleanliness',
    secondaryDepartments: [],
    allDepartments: ['cleanliness'],
    urgencyScore: 20,
    urgencyBand: 'Low',
    urgencyBreakdown: [
      { name: 'Base (cleanliness)', points: 10, description: 'Department base score', category: 'base' },
      { name: 'Modifier: Duplicates', points: 10, description: 'Multiple sanitation alerts', category: 'modifier' }
    ],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    assetId: 'TOI-01',
    channel: 'paper',
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    auditTrail: [
      { action: 'CREATED', timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(), actor: 'Station Clerk (Paper Form Intake)' }
    ]
  },

  // 5. Staff behaviour tweet in English with tag (Medium)
  {
    id: 'CMP-2026-005',
    trackingId: 'TRK-STAF-9981',
    originalText: 'Counter staff was extremely rude and shouting @ahmedabadmetro fix your attitude immediately',
    normalizedText: 'counter staff was extremely rude and shouting @ahmedabadmetro fix your attitude immediately',
    script: 'latin',
    lang_guess: 'en',
    primaryDepartment: 'staff_behaviour',
    secondaryDepartments: [],
    allDepartments: ['staff_behaviour'],
    urgencyScore: 25,
    urgencyBand: 'Low',
    urgencyBreakdown: [
      { name: 'Base (staff_behaviour)', points: 20, description: 'Staff behaviour base', category: 'base' },
      { name: 'Modifier: Public Social', points: 5, description: 'Public tweet tagging authority', category: 'modifier' }
    ],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-05',
    channel: 'social',
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    auditTrail: [
      { action: 'CREATED', timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(), actor: 'Twitter Web Hook' }
    ]
  },

  // 6 - 10: 5 duplicate complaints about broken escalator ESC-01 at Kalupur (Clustered Incident)
  {
    id: 'CMP-2026-006',
    trackingId: 'TRK-CLUST-01',
    originalText: 'Kalupur escalator ESC-01 is completely stopped and making loud screeching noise',
    normalizedText: 'kalupur escalator esc-01 is completely stopped and making loud screeching noise',
    script: 'latin',
    lang_guess: 'en',
    primaryDepartment: 'lifts',
    secondaryDepartments: [],
    allDepartments: ['lifts'],
    urgencyScore: 40,
    urgencyBand: 'Medium',
    urgencyBreakdown: [
      { name: 'Base (lifts)', points: 25, description: 'Department base', category: 'base' },
      { name: 'Modifier: Duplicates', points: 15, description: '5 clustered reports', category: 'modifier' }
    ],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    assetId: 'ESC-01',
    channel: 'app',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },
  {
    id: 'CMP-2026-007',
    trackingId: 'TRK-CLUST-02',
    originalText: 'Escalator bandh chhe Kalupur par, chalvani taklif pade chhe',
    normalizedText: 'escalator bandh chhe kalupur par, chalvani taklif pade chhe',
    script: 'latin',
    lang_guess: 'gu',
    primaryDepartment: 'lifts',
    secondaryDepartments: [],
    allDepartments: ['lifts'],
    urgencyScore: 40,
    urgencyBand: 'Medium',
    urgencyBreakdown: [
      { name: 'Base (lifts)', points: 25, description: 'Department base', category: 'base' },
      { name: 'Modifier: Duplicates', points: 15, description: '5 clustered reports', category: 'modifier' }
    ],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    assetId: 'ESC-01',
    channel: 'app',
    createdAt: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 105 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },
  {
    id: 'CMP-2026-008',
    trackingId: 'TRK-CLUST-03',
    originalText: 'कालूपुर एस्केलेटर बंद पड़ा है, वरिष्ठ नागरिकों को सीढ़ियां चढ़नी पड़ रही हैं',
    normalizedText: 'कालूपुर एस्केलेटर बंद पड़ा है, वरिष्ठ नागरिकों को सीढ़ियां चढ़नी पड़ रही हैं',
    script: 'devanagari',
    lang_guess: 'hi',
    primaryDepartment: 'lifts',
    secondaryDepartments: [],
    allDepartments: ['lifts'],
    urgencyScore: 50,
    urgencyBand: 'Medium',
    urgencyBreakdown: [
      { name: 'Base (lifts)', points: 25, description: 'Department base', category: 'base' },
      { name: 'Modifier: Vulnerable Person', points: 10, description: 'Senior citizens walking stairs', category: 'modifier' },
      { name: 'Modifier: Duplicates', points: 15, description: '5 clustered reports', category: 'modifier' }
    ],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    assetId: 'ESC-01',
    channel: 'app',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },
  {
    id: 'CMP-2026-009',
    trackingId: 'TRK-CLUST-04',
    originalText: 'કાલુપુર એસ્કેલેટર અટકી ગયું છે, રિપેર કરો જલ્દી',
    normalizedText: 'કાલુપુર એસ્કેલેટર અટકી ગયું છે, રિપેર કરો જલ્દી',
    script: 'gujarati',
    lang_guess: 'gu',
    primaryDepartment: 'lifts',
    secondaryDepartments: [],
    allDepartments: ['lifts'],
    urgencyScore: 40,
    urgencyBand: 'Medium',
    urgencyBreakdown: [
      { name: 'Base (lifts)', points: 25, description: 'Department base', category: 'base' },
      { name: 'Modifier: Duplicates', points: 15, description: '5 clustered reports', category: 'modifier' }
    ],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    assetId: 'ESC-01',
    channel: 'paper',
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(), actor: 'Station Helpdesk' }]
  },
  {
    id: 'CMP-2026-010',
    trackingId: 'TRK-CLUST-05',
    originalText: 'Escalator ESC-01 still not working at Kalupur, huge crowd building up',
    normalizedText: 'escalator esc-01 still not working at kalupur, huge crowd building up',
    script: 'latin',
    lang_guess: 'en',
    primaryDepartment: 'lifts',
    secondaryDepartments: [],
    allDepartments: ['lifts'],
    urgencyScore: 40,
    urgencyBand: 'Medium',
    urgencyBreakdown: [
      { name: 'Base (lifts)', points: 25, description: 'Department base', category: 'base' },
      { name: 'Modifier: Duplicates', points: 15, description: '5 clustered reports', category: 'modifier' }
    ],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    assetId: 'ESC-01',
    channel: 'social',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), actor: 'Social Feed' }]
  },

  // 11 - 13: 3 ambiguous cases for Needs Human Eyes lane
  {
    id: 'CMP-2026-011',
    trackingId: 'TRK-AMB-01',
    originalText: 'platform par dhuvado chhe pan koi aag nathi, staff check karo',
    normalizedText: 'platform par dhuvado chhe pan koi aag nathi, staff check karo',
    script: 'latin',
    lang_guess: 'gu',
    primaryDepartment: 'safety',
    secondaryDepartments: [],
    allDepartments: ['safety'],
    urgencyScore: 40,
    urgencyBand: 'Medium',
    urgencyBreakdown: [{ name: 'Base (safety)', points: 40, description: 'Department base score', category: 'base' }],
    status: 'NEW',
    lane: 'needs_human',
    laneReason: 'Negation detected near critical or operational terms',
    stationId: 'STN-01',
    channel: 'app',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },
  {
    id: 'CMP-2026-012',
    trackingId: 'TRK-AMB-02',
    originalText: 'kal me subway gaya tha sandwich khane, par rate vadhi gaya',
    normalizedText: 'kal me subway gaya tha sandwich khane, par rate vadhi gaya',
    script: 'latin',
    lang_guess: 'hi',
    primaryDepartment: 'fare',
    secondaryDepartments: [],
    allDepartments: [],
    urgencyScore: 10,
    urgencyBand: 'Low',
    urgencyBreakdown: [{ name: 'Default Base', points: 10, description: 'Unclassified text base score', category: 'base' }],
    status: 'NEW',
    lane: 'needs_human',
    laneReason: 'No lexicon matches detected (unclassified text)',
    stationId: 'STN-03',
    channel: 'email',
    createdAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(), actor: 'Inbound Email' }]
  },
  {
    id: 'CMP-2026-013',
    trackingId: 'TRK-AMB-03',
    originalText: '??? !!! 10293 metro issue #$%^',
    normalizedText: '??? !!! 10293 metro issue #$%^',
    script: 'unknown',
    lang_guess: 'unknown',
    primaryDepartment: 'safety',
    secondaryDepartments: [],
    allDepartments: [],
    urgencyScore: 10,
    urgencyBand: 'Low',
    urgencyBreakdown: [{ name: 'Default Base', points: 10, description: 'Default base score', category: 'base' }],
    status: 'NEW',
    lane: 'needs_human',
    laneReason: 'Language could not be reliably determined',
    stationId: 'STN-02',
    channel: 'app',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 14. Stampede alert at Stadium (Devanagari, Critical)
  {
    id: 'CMP-2026-014',
    trackingId: 'TRK-SAFE-7711',
    originalText: 'स्टेडियम गेट पर भारी भगदड़ मच गई है, लोग कुचल रहे हैं, तुरंत बचाओ',
    normalizedText: 'स्टेडियम गेट पर भारी भगदड़ मच गई है, लोग कुचल रहे हैं, तुरंत बचाओ',
    script: 'devanagari',
    lang_guess: 'hi',
    primaryDepartment: 'safety',
    secondaryDepartments: [],
    allDepartments: ['safety'],
    urgencyScore: 95,
    urgencyBand: 'Critical',
    urgencyBreakdown: [
      { name: 'Floor: stampede', points: 95, description: 'Stampede floor triggered', category: 'floor' }
    ],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-05',
    assetId: 'GATE-01',
    channel: 'app',
    contactName: 'Anand Kumar',
    contactPhone: '+91 99090 12345',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 15. Child missing in Gujarati script (Critical)
  {
    id: 'CMP-2026-015',
    trackingId: 'TRK-SAFE-5520',
    originalText: 'ઓલ્ડ હાઈકોર્ટ ઇન્ટરચેન્જ પર ૫ વર્ષનું બાળક ખોવાયું છે, પીળો શર્ટ પહેર્યો છે',
    normalizedText: 'ઓલ્ડ હાઈકોર્ટ ઇન્ટરચેન્જ પર 5 વર્ષનું બાળક ખોવાયું છે, પીળો શર્ટ પહેર્યો છે',
    script: 'gujarati',
    lang_guess: 'gu',
    primaryDepartment: 'safety',
    secondaryDepartments: [],
    allDepartments: ['safety'],
    urgencyScore: 100,
    urgencyBand: 'Critical',
    urgencyBreakdown: [
      { name: 'Floor: child_missing', points: 95, description: 'Missing child floor', category: 'floor' },
      { name: 'Modifier: Vulnerable Person', points: 10, description: 'Child missing', category: 'modifier' }
    ],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-04',
    channel: 'app',
    contactName: 'Neelam Shah',
    contactPhone: '+91 98980 99887',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 16. Fall incident (Gujlish, High)
  {
    id: 'CMP-2026-016',
    trackingId: 'TRK-SAFE-6631',
    originalText: 'platform 2 par ek vridh dada padi gaya chhe, pag ma vāgyu chhe',
    normalizedText: 'platform 2 par ek vrudh dada padi gaya chhe, pag ma vagyu chhe',
    script: 'latin',
    lang_guess: 'gu',
    primaryDepartment: 'safety',
    secondaryDepartments: [],
    allDepartments: ['safety'],
    urgencyScore: 90,
    urgencyBand: 'Critical',
    urgencyBreakdown: [
      { name: 'Floor: fell', points: 80, description: 'Passenger fall floor', category: 'floor' },
      { name: 'Modifier: Vulnerable Person', points: 10, description: 'Elderly grandfather fell', category: 'modifier' }
    ],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    assetId: 'PF-02',
    channel: 'app',
    contactName: 'Mitesh Soni',
    contactPhone: '+91 97230 44332',
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 17. Unconscious passenger (English, Critical)
  {
    id: 'CMP-2026-017',
    trackingId: 'TRK-SAFE-1002',
    originalText: 'A pregnant woman fainted and is unconscious near Paldi concourse, send medical sos immediately',
    normalizedText: 'a pregnant woman fainted and is unconscious near paldi concourse, send medical sos immediately',
    script: 'latin',
    lang_guess: 'en',
    primaryDepartment: 'safety',
    secondaryDepartments: [],
    allDepartments: ['safety'],
    urgencyScore: 100,
    urgencyBand: 'Critical',
    urgencyBreakdown: [
      { name: 'Floor: unconscious', points: 95, description: 'Unconscious passenger floor', category: 'floor' },
      { name: 'Modifier: Vulnerable Person', points: 10, description: 'Pregnant woman', category: 'modifier' }
    ],
    status: 'APPROVED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-06',
    channel: 'app',
    replyText: 'Dear Passenger, Station security and ambulance unit have been dispatched to Paldi Concourse. ETA 3 minutes.',
    replyStatus: 'approved',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    auditTrail: [
      { action: 'CREATED', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), actor: 'Passenger via App' },
      { action: 'APPROVED', timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(), actor: 'Station Controller (SC-01)' }
    ]
  },

  // 18. Lift door jammed at Vastral (Gujarati, High)
  {
    id: 'CMP-2026-018',
    trackingId: 'TRK-LIFT-3310',
    originalText: 'વસ્ત્રાલ ગામ સ્ટેશન પર લિફ્ટનો દરવાજો ખૂલતો નથી અને અંદર લોકો છે',
    normalizedText: 'વસ્ત્રાલ ગામ સ્ટેશન પર લિફ્ટનો દરવાજો ખૂલતો નથી અને અંદર લોકો છે',
    script: 'gujarati',
    lang_guess: 'gu',
    primaryDepartment: 'lifts',
    secondaryDepartments: ['safety'],
    allDepartments: ['lifts', 'safety'],
    urgencyScore: 85,
    urgencyBand: 'Critical',
    urgencyBreakdown: [
      { name: 'Base (lifts)', points: 25, description: 'Lifts base score', category: 'base' },
      { name: 'Floor: stuck', points: 85, description: 'Stuck inside lift floor', category: 'floor' }
    ],
    status: 'DRAFTED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-03',
    assetId: 'LIFT-04',
    channel: 'app',
    replyText: 'નમસ્તે પેસેન્જર, વસ્ત્રાલ ગામ સ્ટેશન પર લિફ્ટ દરવાજો રિપેર કરવા ટેકનિશિયનો પહોંચ્યા છે. ૫ મિનિટમાં દરવાજો ખૂલશે.',
    replyStatus: 'draft',
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 19. Fare card deducted twice (English, Low)
  {
    id: 'CMP-2026-019',
    trackingId: 'TRK-FARE-8821',
    originalText: 'My smart card was double deducted at automatic gate, deducted 40 rupees twice',
    normalizedText: 'my smart card was double deducted at automatic gate, deducted 40 rupees twice',
    script: 'latin',
    lang_guess: 'en',
    primaryDepartment: 'fare',
    secondaryDepartments: [],
    allDepartments: ['fare'],
    urgencyScore: 15,
    urgencyBand: 'Low',
    urgencyBreakdown: [{ name: 'Base (fare)', points: 15, description: 'Fare base score', category: 'base' }],
    status: 'SENT',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-02',
    channel: 'app',
    replyText: 'Dear Passenger, your double deduction query is verified. ₹40 has been refunded to your smart card wallet balance.',
    replyStatus: 'sent',
    createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    auditTrail: [
      { action: 'CREATED', timestamp: new Date(Date.now() - 300 * 60 * 1000).toISOString(), actor: 'Passenger via App' },
      { action: 'SENT', timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(), actor: 'Fare Officer (FO-02)' }
    ]
  },

  // 20. Filthy toilet at Thaltej (Devanagari, Medium)
  {
    id: 'CMP-2026-020',
    trackingId: 'TRK-CLEN-4029',
    originalText: 'थलतेज स्टेशन पर शौचालय में पानी नहीं है और बहुत ज्यादा बदबू आ रही है',
    normalizedText: 'थलतेज स्टेशन पर शौचालय में पानी नहीं है और बहुत ज्यादा बदबू आ रही है',
    script: 'devanagari',
    lang_guess: 'hi',
    primaryDepartment: 'cleanliness',
    secondaryDepartments: [],
    allDepartments: ['cleanliness'],
    urgencyScore: 10,
    urgencyBand: 'Low',
    urgencyBreakdown: [{ name: 'Base (cleanliness)', points: 10, description: 'Cleanliness base score', category: 'base' }],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-02',
    assetId: 'TOI-02',
    channel: 'paper',
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(), actor: 'Cleaning Register' }]
  },

  // 21. Staff bribery attempt (Gujarati, Medium)
  {
    id: 'CMP-2026-021',
    trackingId: 'TRK-STAF-6119',
    originalText: 'કાલુપુર ટિકિટ કાઉન્ટર પર ક્લાર્કે મદદ કરવાની ના પાડી અને ગેરવર્તન કર્યું',
    normalizedText: 'કાલુપુર ટિકિટ કાઉન્ટર પર ક્લાર્કે મદદ કરવાની ના પાડી અને ગેરવર્તન કર્યું',
    script: 'gujarati',
    lang_guess: 'gu',
    primaryDepartment: 'staff_behaviour',
    secondaryDepartments: [],
    allDepartments: ['staff_behaviour'],
    urgencyScore: 20,
    urgencyBand: 'Low',
    urgencyBreakdown: [{ name: 'Base (staff_behaviour)', points: 20, description: 'Staff behaviour base', category: 'base' }],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    channel: 'app',
    createdAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 22. Lift door jerk at Old High Court (English, Medium)
  {
    id: 'CMP-2026-022',
    trackingId: 'TRK-LIFT-7128',
    originalText: 'Lift LIFT-04 at Interchange had a violent jerk while descending from concourse to platform',
    normalizedText: 'lift lift-04 at interchange had a violent jerk while descending from concourse to platform',
    script: 'latin',
    lang_guess: 'en',
    primaryDepartment: 'lifts',
    secondaryDepartments: [],
    allDepartments: ['lifts'],
    urgencyScore: 25,
    urgencyBand: 'Low',
    urgencyBreakdown: [{ name: 'Base (lifts)', points: 25, description: 'Lifts base score', category: 'base' }],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-04',
    assetId: 'LIFT-04',
    channel: 'app',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 23. Spilled pan gutka on platform (Gujlish, Low)
  {
    id: 'CMP-2026-023',
    trackingId: 'TRK-CLEN-5511',
    originalText: 'platform 1 par pan ni pichkari ane kachro fekela chhe, saaf karavo',
    normalizedText: 'platform 1 par pan ni pichkari ane kachro fekela chhe, saaf karavo',
    script: 'latin',
    lang_guess: 'gu',
    primaryDepartment: 'cleanliness',
    secondaryDepartments: [],
    allDepartments: ['cleanliness'],
    urgencyScore: 10,
    urgencyBand: 'Low',
    urgencyBreakdown: [{ name: 'Base (cleanliness)', points: 10, description: 'Cleanliness base score', category: 'base' }],
    status: 'RESOLVED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    assetId: 'PF-01',
    channel: 'app',
    createdAt: new Date(Date.now() - 420 * 60 * 1000).toISOString(),
    auditTrail: [
      { action: 'CREATED', timestamp: new Date(Date.now() - 420 * 60 * 1000).toISOString(), actor: 'Passenger via App' },
      { action: 'RESOLVED', timestamp: new Date(Date.now() - 360 * 60 * 1000).toISOString(), actor: 'Cleaning Supervisor' }
    ]
  },

  // 24. TVM coin stuck (Hindi, Low)
  {
    id: 'CMP-2026-024',
    trackingId: 'TRK-FARE-4011',
    originalText: 'टिकट वेंडिंग मशीन TVM-01 में 50 रुपये फंस गए और टोकन बाहर नहीं आया',
    normalizedText: 'टिकट वेंडिंग मशीन tvm-01 में 50 रुपये फंस गए और टोकन बाहर नहीं आया',
    script: 'devanagari',
    lang_guess: 'hi',
    primaryDepartment: 'fare',
    secondaryDepartments: [],
    allDepartments: ['fare'],
    urgencyScore: 15,
    urgencyBand: 'Low',
    urgencyBreakdown: [{ name: 'Base (fare)', points: 15, description: 'Fare base score', category: 'base' }],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    assetId: 'TVM-01',
    channel: 'paper',
    createdAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(), actor: 'Customer Care Desk' }]
  },

  // 25. Wheelchair passenger stranded (English, High)
  {
    id: 'CMP-2026-025',
    trackingId: 'TRK-LIFT-9912',
    originalText: 'Disabled passenger in wheelchair unable to reach platform as lift LIFT-03 is out of service at Thaltej',
    normalizedText: 'disabled passenger in wheelchair unable to reach platform as lift lift-03 is out of service at thaltej',
    script: 'latin',
    lang_guess: 'en',
    primaryDepartment: 'lifts',
    secondaryDepartments: [],
    allDepartments: ['lifts'],
    urgencyScore: 40,
    urgencyBand: 'Medium',
    urgencyBreakdown: [
      { name: 'Base (lifts)', points: 25, description: 'Lifts base score', category: 'base' },
      { name: 'Modifier: Vulnerable Person', points: 15, description: 'Disabled passenger in wheelchair (cap 15)', category: 'modifier' }
    ],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-02',
    assetId: 'LIFT-03',
    channel: 'app',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 26. Threat of fight / quarrel on train (Devanagari, High)
  {
    id: 'CMP-2026-026',
    trackingId: 'TRK-SAFE-8871',
    originalText: 'कोच में दो यात्री आपस में गाली-गलौज और मारपीट कर रहे हैं, सुरक्षा गार्ड भेजो',
    normalizedText: 'कोच में दो यात्री आपस में गाली-गलौज और मारपीट कर रहे हैं, सुरक्षा गार्ड भेजो',
    script: 'devanagari',
    lang_guess: 'hi',
    primaryDepartment: 'safety',
    secondaryDepartments: ['staff_behaviour'],
    allDepartments: ['safety', 'staff_behaviour'],
    urgencyScore: 40,
    urgencyBand: 'Medium',
    urgencyBreakdown: [{ name: 'Base (safety)', points: 40, description: 'Safety base score', category: 'base' }],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-05',
    channel: 'app',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 27. Gate barrier pinched passenger (Gujlish, Medium)
  {
    id: 'CMP-2026-027',
    trackingId: 'TRK-SAFE-3301',
    originalText: 'Automatic fare gate GATE-01 jaldi bandh thai gayu ane hath ma vagyu',
    normalizedText: 'automatic fare gate gate-01 jaldi bandh thai gayu ane hath ma vagyu',
    script: 'latin',
    lang_guess: 'gu',
    primaryDepartment: 'fare',
    secondaryDepartments: ['safety'],
    allDepartments: ['fare', 'safety'],
    urgencyScore: 40,
    urgencyBand: 'Medium',
    urgencyBreakdown: [{ name: 'Base (safety)', points: 40, description: 'Safety base score', category: 'base' }],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-01',
    channel: 'app',
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 28. Refused assistance to elderly lady (English, Low)
  {
    id: 'CMP-2026-028',
    trackingId: 'TRK-STAF-1982',
    originalText: 'Information desk officer refused assistance to an old lady looking for platform lift',
    normalizedText: 'information desk officer refused assistance to an old lady looking for platform lift',
    script: 'latin',
    lang_guess: 'en',
    primaryDepartment: 'staff_behaviour',
    secondaryDepartments: [],
    allDepartments: ['staff_behaviour'],
    urgencyScore: 30,
    urgencyBand: 'Low',
    urgencyBreakdown: [
      { name: 'Base (staff_behaviour)', points: 20, description: 'Staff behaviour base', category: 'base' },
      { name: 'Modifier: Vulnerable Person', points: 10, description: 'Old lady passenger', category: 'modifier' }
    ],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-06',
    channel: 'email',
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(), actor: 'Email Grievance Portal' }]
  },

  // 29. Fire extinguisher expired / missing (Gujarati, High)
  {
    id: 'CMP-2026-029',
    trackingId: 'TRK-SAFE-9014',
    originalText: 'મોટેરા સ્ટેડિયમ પ્લેટફોર્મ ૨ પર આગ બુઝાવવાનું સાધન ખાલી છે, ઈમરજન્સીમાં શું કરીશું?',
    normalizedText: 'મોટેરા સ્ટેડિયમ પ્લેટફોર્મ 2 પર આગ બુઝાવવાનું સાધન ખાલી છે, ઈમરજન્સીમાં શું કરીશું?',
    script: 'gujarati',
    lang_guess: 'gu',
    primaryDepartment: 'safety',
    secondaryDepartments: [],
    allDepartments: ['safety'],
    urgencyScore: 40,
    urgencyBand: 'Medium',
    urgencyBreakdown: [{ name: 'Base (safety)', points: 40, description: 'Safety base score', category: 'base' }],
    status: 'TRIAGED',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-05',
    assetId: 'PF-02',
    channel: 'app',
    createdAt: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 170 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  },

  // 30. Dog entering station track (Gujlish, High)
  {
    id: 'CMP-2026-030',
    trackingId: 'TRK-SAFE-7700',
    originalText: 'Track par kutro aavi gayo chhe Vastral Gam par, train accident thase jaldi hatau',
    normalizedText: 'track par kutro aavi gayo chhe vastral gam par, train accident thase jaldi hatau',
    script: 'latin',
    lang_guess: 'gu',
    primaryDepartment: 'safety',
    secondaryDepartments: [],
    allDepartments: ['safety'],
    urgencyScore: 50,
    urgencyBand: 'Medium',
    urgencyBreakdown: [
      { name: 'Base (safety)', points: 40, description: 'Safety base score', category: 'base' },
      { name: 'Modifier: Time Pressure', points: 10, description: 'Imminent train hazard', category: 'modifier' }
    ],
    status: 'NEW',
    lane: 'automated',
    laneReason: 'Standard automated classification',
    stationId: 'STN-03',
    channel: 'app',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    auditTrail: [{ action: 'CREATED', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), actor: 'Passenger via App' }]
  }
];

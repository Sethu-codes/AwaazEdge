export interface Station {
  id: string;
  name: string;
  nameGu: string;
  nameHi: string;
  code: string;
  line: string;
}

export interface Asset {
  id: string;
  stationId: string;
  name: string;
  type: 'lift' | 'escalator' | 'toilet' | 'ticket_machine' | 'platform' | 'gate';
  location: string;
}

export const STATIONS: Station[] = [
  { id: 'STN-01', name: 'Kalupur Railway Station', nameGu: 'કાલુપુર રેલ્વે સ્ટેશન', nameHi: 'कालूपुर रेलवे स्टेशन', code: 'KLP', line: 'East-West' },
  { id: 'STN-02', name: 'Thaltej', nameGu: 'થલતેજ', nameHi: 'थलतेज', code: 'THL', line: 'East-West' },
  { id: 'STN-03', name: 'Vastral Gam', nameGu: 'વસ્ત્રાલ ગામ', nameHi: 'वस्त्राल गांव', code: 'VAS', line: 'East-West' },
  { id: 'STN-04', name: 'Old High Court (Interchange)', nameGu: 'ઓલ્ડ હાઈકોર્ટ (ઇન્ટરચેન્જ)', nameHi: 'ओल्ड हाई कोर्ट (इंटरचेंज)', code: 'OHC', line: 'Interchange' },
  { id: 'STN-05', name: 'Motera Stadium', nameGu: 'મોટેરા સ્ટેડિયમ', nameHi: 'मोटेरा स्टेडियम', code: 'MOT', line: 'North-South' },
  { id: 'STN-06', name: 'Paldi', nameGu: 'પાલડી', nameHi: 'पालड़ी', code: 'PLD', line: 'North-South' }
];

export const ASSETS: Asset[] = [
  // Lifts
  { id: 'LIFT-01', stationId: 'STN-01', name: 'Concourse to PF 1 Lift', type: 'lift', location: 'Platform 1 East' },
  { id: 'LIFT-02', stationId: 'STN-01', name: 'Concourse to PF 2 Lift', type: 'lift', location: 'Platform 2 West' },
  { id: 'LIFT-03', stationId: 'STN-02', name: 'Gate A Entry Lift', type: 'lift', location: 'Street Level Gate A' },
  { id: 'LIFT-04', stationId: 'STN-04', name: 'Interchange Central Lift', type: 'lift', location: 'North-South Core' },
  // Escalators
  { id: 'ESC-01', stationId: 'STN-01', name: 'Entry 1 Escalator Up', type: 'escalator', location: 'Main Concourse' },
  { id: 'ESC-02', stationId: 'STN-02', name: 'Mezzanine Escalator Down', type: 'escalator', location: 'Gate B' },
  { id: 'ESC-03', stationId: 'STN-04', name: 'Transfer Corridor Escalator', type: 'escalator', location: 'Interchange Link' },
  // Toilets
  { id: 'TOI-01', stationId: 'STN-01', name: 'Restroom Block Concourse', type: 'toilet', location: 'Unpaid Concourse' },
  { id: 'TOI-02', stationId: 'STN-03', name: 'Platform 1 Restroom', type: 'toilet', location: 'Paid Area PF 1' },
  { id: 'TOI-03', stationId: 'STN-05', name: 'Public Restroom Stadium Gate', type: 'toilet', location: 'Gate 2 Concourse' },
  // Ticket Machines
  { id: 'TVM-01', stationId: 'STN-01', name: 'Kiosk TVM-01', type: 'ticket_machine', location: 'Booking Hall West' },
  { id: 'TVM-02', stationId: 'STN-02', name: 'Kiosk TVM-02', type: 'ticket_machine', location: 'Main Entrance Hall' },
  { id: 'TVM-03', stationId: 'STN-04', name: 'Interchange TVM-03', type: 'ticket_machine', location: 'Central Concourse' },
  // Platforms & Gates
  { id: 'PF-01', stationId: 'STN-01', name: 'Platform 1 (Eastbound)', type: 'platform', location: 'Track Level 1' },
  { id: 'PF-02', stationId: 'STN-01', name: 'Platform 2 (Westbound)', type: 'platform', location: 'Track Level 2' }
];

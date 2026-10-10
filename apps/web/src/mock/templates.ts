export interface ReplyTemplate {
  id: string;
  department: string;
  language: 'en' | 'gu' | 'hi';
  band: 'Critical' | 'High' | 'Medium' | 'Low';
  template: string;
  isReviewed: boolean; // "needs native review" flag
}

export const TEMPLATES: ReplyTemplate[] = [
  // SAFETY
  {
    id: 'TPL-SAFETY-EN-CRITICAL',
    department: 'safety',
    language: 'en',
    band: 'Critical',
    template: 'Dear {name}, we have received your emergency report ({ref_id}) at {station} ({asset}). Station security and emergency response teams have been dispatched immediately. Expected response ETA: {eta}. Please follow on-ground station staff instructions.',
    isReviewed: true
  },
  {
    id: 'TPL-SAFETY-GU-CRITICAL',
    department: 'safety',
    language: 'gu',
    band: 'Critical',
    template: 'નમસ્તે {name}, {station} ({asset}) પર આપની ઈમરજન્સી ફરિયાદ ({ref_id}) નોંધાઈ છે. સ્ટેશન સુરક્ષા ટીમ તાત્કાલિક રવાના કરવામાં આવી છે. અંદાજિત સમય: {eta}. કૃપા કરીને સ્ટેશન સ્ટાફની સૂચનાઓનું પાલન કરો.',
    isReviewed: false // Needs native review
  },
  {
    id: 'TPL-SAFETY-HI-CRITICAL',
    department: 'safety',
    language: 'hi',
    band: 'Critical',
    template: 'प्रिय {name}, {station} ({asset}) पर आपकी आपातकालीन शिकायत ({ref_id}) दर्ज कर ली गई है। सुरक्षा टीम को तुरंत रवाना कर दिया गया है। अनुमानित समय: {eta}। कृपया स्टेशन कर्मियों के निर्देशों का पालन करें।',
    isReviewed: false // Needs native review
  },

  // LIFTS
  {
    id: 'TPL-LIFTS-EN-CRITICAL',
    department: 'lifts',
    language: 'en',
    band: 'Critical',
    template: 'Dear {name}, our technical team has received the alert for trapped passengers at {station} ({asset}) under ref #{ref_id}. Technicians are on site with ETA: {eta}. Power and ventilation are active. Help is right outside.',
    isReviewed: true
  },
  {
    id: 'TPL-LIFTS-GU-CRITICAL',
    department: 'lifts',
    language: 'gu',
    band: 'Critical',
    template: 'નમસ્તે {name}, {station} પર {asset} માં પેસેન્જર ફસાયા હોવાની ફરિયાદ ({ref_id}) અમને મળી છે. ટેકનિશિયનો {eta} માં પહોંચી રહ્યા છે. વેન્ટિલેશન ચાલુ છે, ગભરાશો નહીં. મદદ નજીક છે.',
    isReviewed: false
  },
  {
    id: 'TPL-LIFTS-HI-CRITICAL',
    department: 'hi' as any,
    language: 'hi',
    band: 'Critical',
    template: 'प्रिय {name}, {station} ({asset}) में लिफ्ट फंसने की सूचना ({ref_id}) प्राप्त हुई है। तकनीकी दल {eta} में पहुंच रहा है। कृपया धैर्य रखें, सहायता रास्ते में है।',
    isReviewed: false
  },
  {
    id: 'TPL-LIFTS-EN-HIGH',
    department: 'lifts',
    language: 'en',
    band: 'High',
    template: 'Dear {name}, thank you for reporting the out-of-order {asset} at {station} (ref #{ref_id}). Maintenance crew has been alerted. Target restoration ETA: {eta}. We apologize for the inconvenience.',
    isReviewed: true
  },

  // CLEANLINESS
  {
    id: 'TPL-CLEAN-EN-MEDIUM',
    department: 'cleanliness',
    language: 'en',
    band: 'Medium',
    template: 'Dear {name}, your sanitation feedback ({ref_id}) for {station} ({asset}) has been forwarded to the housekeeping supervisor. Cleaning will be completed within {eta}. Thank you for helping keep our metro clean.',
    isReviewed: true
  },
  {
    id: 'TPL-CLEAN-GU-MEDIUM',
    department: 'cleanliness',
    language: 'gu',
    band: 'Medium',
    template: 'નમસ્તે {name}, {station} ({asset}) સ્વચ્છતા અંગેની આપની ફરિયાદ ({ref_id}) નોંધાઈ છે. હાઉસકીપિંગ સ્ટાફ {eta} માં સફાઈ પૂર્ણ કરશે. સ્વચ્છ મેટ્રો રાખવામાં સહયોગ બદલ આભાર.',
    isReviewed: false
  },
  {
    id: 'TPL-CLEAN-HI-MEDIUM',
    department: 'cleanliness',
    language: 'hi',
    band: 'Medium',
    template: 'प्रिय {name}, {station} ({asset}) पर स्वच्छता से संबंधित आपकी शिकायत ({ref_id}) सफाई पर्यवेक्षक को भेज दी गई है। {eta} में सफाई पूरी हो जाएगी। धन्यवाद।',
    isReviewed: false
  },

  // FARE
  {
    id: 'TPL-FARE-EN-LOW',
    department: 'fare',
    language: 'en',
    band: 'Low',
    template: 'Dear {name}, your ticketing query regarding {station} ({asset}) under reference #{ref_id} is under review by our accounts desk. Eligible refunds are processed within {eta}. You can track status at /app/track/{ref_id}.',
    isReviewed: true
  },
  {
    id: 'TPL-FARE-HI-LOW',
    department: 'fare',
    language: 'hi',
    band: 'Low',
    template: 'प्रिय {name}, {station} ({asset}) पर टिकट संबंधी शिकायत ({ref_id}) की जांच की जा रही है। पात्रता के आधार पर रिफंड {eta} में आपके खाते में भेज दिया जाएगा।',
    isReviewed: false
  },
  {
    id: 'TPL-FARE-GU-LOW',
    department: 'fare',
    language: 'gu',
    band: 'Low',
    template: 'નમસ્તે {name}, {station} ({asset}) પર ટિકિટ/ભાડા અંગેની આપની અરજી ({ref_id}) ચકાસણી હેઠળ છે. યોગ્ય રિફંડ {eta} દિવસમાં જમા કરવામાં આવશે.',
    isReviewed: false
  },

  // STAFF BEHAVIOUR
  {
    id: 'TPL-STAFF-EN-MEDIUM',
    department: 'staff_behaviour',
    language: 'en',
    band: 'Medium',
    template: 'Dear {name}, we take conduct complaints very seriously. Ref #{ref_id} regarding staff interaction at {station} has been logged with the Station Controller. An inquiry report will be reviewed within {eta}.',
    isReviewed: true
  },
  {
    id: 'TPL-STAFF-GU-MEDIUM',
    department: 'staff_behaviour',
    language: 'gu',
    band: 'Medium',
    template: 'નમસ્તે {name}, {station} પર સ્ટાફ વર્તન અંગેની ફરિયાદ ({ref_id}) સ્ટેશન કંટ્રોલર દ્વારા ગંભીરતાથી લેવામાં આવી છે. {eta} માં તપાસ પૂર્ણ કરી યોગ્ય પગલાં લેવાશે.',
    isReviewed: false
  }
];

export function fillTemplate(
  templateStr: string,
  slots: { name?: string; ref_id?: string; station?: string; asset?: string; eta?: string }
): string {
  return templateStr
    .replace(/{name}/g, slots.name || 'Passenger')
    .replace(/{ref_id}/g, slots.ref_id || 'REQ-0000')
    .replace(/{station}/g, slots.station || 'Station')
    .replace(/{asset}/g, slots.asset || 'Facility')
    .replace(/{eta}/g, slots.eta || '15 minutes');
}

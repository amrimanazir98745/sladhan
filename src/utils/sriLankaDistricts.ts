import { District } from '../types/prayer';

export const SRI_LANKA_DISTRICTS: District[] = [
  { id: 'ampara', name: 'Ampara', officialNote: '(Padiyatalawa & Dehiattakandiya follow Badulla)', tamilName: 'அம்பாறை', province: 'Eastern Province', lat: 7.2912, lng: 81.6724, explanationNote: 'Official ACJU Note: Padiyatalawa & Dehiattakandiya divisions follow Badulla / Monaragala schedule.' },
  { id: 'anuradhapura', name: 'Anuradhapura', tamilName: 'அனுராதபுரம்', province: 'North Central Province', lat: 8.3114, lng: 80.4037 },
  { id: 'badulla', name: 'Badulla', officialNote: '& Padiyatalawa / Dehiattakandiya', officialName: 'Badulla District & Padiyatalawa, Dehiattakandiya', tamilName: 'பதுளை (படியத்தலாவ, தெஹியத்தகண்டிய உட்பட)', province: 'Uva Province', lat: 6.9934, lng: 81.0550, explanationNote: 'Official ACJU Zone: Includes Badulla District, Padiyatalawa & Dehiattakandiya divisions.' },
  { id: 'batticaloa', name: 'Batticaloa', tamilName: 'மட்டக்களப்பு', province: 'Eastern Province', lat: 7.7170, lng: 81.7000 },
  { id: 'colombo', name: 'Colombo', tamilName: 'கொழும்பு', province: 'Western Province', lat: 6.9271, lng: 79.8612, isCapital: true },
  { id: 'galle', name: 'Galle', tamilName: 'காலி', province: 'Southern Province', lat: 6.0535, lng: 80.2210 },
  { id: 'gampaha', name: 'Gampaha', tamilName: 'கம்பஹா', province: 'Western Province', lat: 7.0840, lng: 79.9925 },
  { id: 'hambantota', name: 'Hambantota', tamilName: 'அம்பாந்தோட்டை', province: 'Southern Province', lat: 6.1248, lng: 81.1185 },
  { id: 'jaffna', name: 'Jaffna', officialNote: '& Nallur', officialName: 'Jaffna District & Nallur', tamilName: 'யாழ்ப்பாணம் & நல்லூர்', province: 'Northern Province', lat: 9.6615, lng: 80.0255, explanationNote: 'Covers Jaffna District and Nallur division prayer schedule.' },
  { id: 'kalutara', name: 'Kalutara', tamilName: 'களுத்துறை', province: 'Western Province', lat: 6.5854, lng: 79.9607 },
  { id: 'kandy', name: 'Kandy', tamilName: 'கண்டி', province: 'Central Province', lat: 7.2906, lng: 80.6337 },
  { id: 'kegalle', name: 'Kegalle', tamilName: 'கேகாலை', province: 'Sabaragamuwa Province', lat: 7.2513, lng: 80.3464 },
  { id: 'kilinochchi', name: 'Kilinochchi', tamilName: 'கிளிநொச்சி', province: 'Northern Province', lat: 9.3803, lng: 80.3992 },
  { id: 'kurunegala', name: 'Kurunegala', tamilName: 'குருநாகல்', province: 'North Western Province', lat: 7.4863, lng: 80.3623 },
  { id: 'mannar', name: 'Mannar', tamilName: 'மன்னார்', province: 'Northern Province', lat: 8.9810, lng: 79.9044 },
  { id: 'matale', name: 'Matale', tamilName: 'மாத்தளை', province: 'Central Province', lat: 7.4675, lng: 80.6234 },
  { id: 'matara', name: 'Matara', tamilName: 'மாத்தறை', province: 'Southern Province', lat: 5.9549, lng: 80.5550 },
  { id: 'monaragala', name: 'Monaragala', tamilName: 'மொனராகலை', province: 'Uva Province', lat: 6.8722, lng: 81.3510, explanationNote: 'Official ACJU Zone: Monaragala District (Padiyatalawa & Dehiattakandiya share Uva timetable).' },
  { id: 'mullaitivu', name: 'Mullaitivu', officialNote: '(Except Nallur)', officialName: 'Mullaitivu District (Except Nallur)', tamilName: 'முல்லைத்தீவு (நல்லூர் தவிர)', province: 'Northern Province', lat: 9.2671, lng: 80.8142, explanationNote: 'Official ACJU Zone: Mullaitivu District (Excludes Nallur division — Nallur follows Jaffna schedule).' },
  { id: 'nuwaraeliya', name: 'Nuwara Eliya', tamilName: 'நுவரெலியா', province: 'Central Province', lat: 6.9497, lng: 80.7891 },
  { id: 'polonnaruwa', name: 'Polonnaruwa', tamilName: 'பொலன்னறுவை', province: 'North Central Province', lat: 7.9403, lng: 81.0188 },
  { id: 'puttalam', name: 'Puttalam', tamilName: 'புத்தளம்', province: 'North Western Province', lat: 8.0362, lng: 79.8283 },
  { id: 'ratnapura', name: 'Ratnapura', tamilName: 'இரத்தினபுரி', province: 'Sabaragamuwa Province', lat: 6.6828, lng: 80.3992 },
  { id: 'trincomalee', name: 'Trincomalee', tamilName: 'திருகோணமலை', province: 'Eastern Province', lat: 8.5874, lng: 81.2152 },
  { id: 'vavuniya', name: 'Vavuniya', tamilName: 'வவுனியா', province: 'Northern Province', lat: 8.7542, lng: 80.4982 }
];

export const DEFAULT_DISTRICT = SRI_LANKA_DISTRICTS.find(d => d.id === 'batticaloa') || SRI_LANKA_DISTRICTS[5];

export function getDistrictDisplayName(district: District, language: 'en' | 'ta' = 'en'): string {
  if (language === 'ta' && district.tamilName) {
    return district.tamilName;
  }
  return getDistrictFullName(district);
}

export function getDistrictFullName(district: District): string {
  if (district.officialName) {
    return district.officialName;
  }
  if (district.officialNote) {
    return `${district.name} ${district.officialNote}`;
  }
  return district.name;
}

export function getDistrictExplanationNote(district: District): string | null {
  if (district.explanationNote) {
    return district.explanationNote;
  }
  if (district.id === 'jaffna') {
    return 'Official ACJU Zone: Includes Jaffna District & Nallur division.';
  }
  if (district.id === 'mullaitivu') {
    return 'Official ACJU Zone: Mullaitivu District (Nallur uses Jaffna schedule).';
  }
  return null;
}

export function getDistrictById(id: string): District {
  return SRI_LANKA_DISTRICTS.find(d => d.id === id) || DEFAULT_DISTRICT;
}

export function findClosestDistrict(lat: number, lng: number): District {
  let minDistance = Infinity;
  let closest = DEFAULT_DISTRICT;

  for (const district of SRI_LANKA_DISTRICTS) {
    const dist = Math.hypot(district.lat - lat, district.lng - lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = district;
    }
  }

  return closest;
}

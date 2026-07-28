// Safe to import from both client and server code — no server-only deps here.

export type WorkingHourEntry = {
  day: number; // 0 = Sunday ... 6 = Saturday (JS Date#getDay convention)
  open: string;
  close: string;
  closed: boolean;
};

export type ClinicSettingsData = {
  clinicName: string;
  doctorName: string;
  doctorTitle: string;
  clinicDescription: string;
  licenseNumber: string;
  logoUrl: string;
  faviconUrl: string;
  heroImageUrl: string;
  doctorPhotoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  country: string;
  city: string;
  address: string;
  googleMapsUrl: string;
  workingHours: WorkingHourEntry[];
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  xUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
};

export const DEFAULT_WORKING_HOURS: WorkingHourEntry[] = [
  { day: 0, open: "09:00", close: "20:00", closed: false },
  { day: 1, open: "09:00", close: "20:00", closed: false },
  { day: 2, open: "09:00", close: "20:00", closed: false },
  { day: 3, open: "09:00", close: "20:00", closed: false },
  { day: 4, open: "09:00", close: "20:00", closed: false },
  { day: 5, open: "09:00", close: "20:00", closed: true },
  { day: 6, open: "09:00", close: "20:00", closed: false },
];

export const DEFAULT_CLINIC_SETTINGS: ClinicSettingsData = {
  clinicName: "عيادة د. خليل",
  doctorName: "د. خليل",
  doctorTitle: "طبيب أسنان عام",
  clinicDescription: "رعاية أسنان حديثة تركّز على الدقة وراحة المريض.",
  licenseNumber: "",
  logoUrl: "",
  faviconUrl: "",
  heroImageUrl: "",
  doctorPhotoUrl: "",
  primaryColor: "",
  secondaryColor: "",
  phone: "+963 999 000 000",
  whatsapp: "+963999000000",
  email: "info@khalil-clinic.com",
  website: "",
  country: "سوريا",
  city: "دمشق",
  address: "دمشق، سوريا",
  googleMapsUrl: "",
  workingHours: DEFAULT_WORKING_HOURS,
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  xUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
};

export function isValidWorkingHours(value: unknown): value is WorkingHourEntry[] {
  return (
    Array.isArray(value) &&
    value.length === 7 &&
    value.every(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        typeof (entry as WorkingHourEntry).day === "number" &&
        typeof (entry as WorkingHourEntry).open === "string" &&
        typeof (entry as WorkingHourEntry).close === "string" &&
        typeof (entry as WorkingHourEntry).closed === "boolean"
    )
  );
}

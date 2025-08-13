export const BUSINESS_STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "temporary_closed", label: "Temporary Closed" },
  { value: "busy", label: "Busy" },
  { value: "holiday", label: "Holiday" },
  { value: "by_appointment", label: "By Appointment" },
  { value: "maintenance", label: "Maintenance" },
] as const;

export type BusinessStatusValue = (typeof BUSINESS_STATUS_OPTIONS)[number]["value"];



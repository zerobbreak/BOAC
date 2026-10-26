// What a contact message is about. The keys match the backend's subjects (backend/src/contact.ts);
// the contact form and the desk's Messages page both show these labels.
export const contactSubjects = [
  ['general', 'General question'],
  ['volunteer', 'Volunteering'],
  ['donation', 'Donations and sponsorship'],
  ['partnership', 'Partnership'],
] as const

export type ContactSubject = (typeof contactSubjects)[number][0]

export function subjectLabel(value: string) {
  return contactSubjects.find(([key]) => key === value)?.[1] ?? value
}

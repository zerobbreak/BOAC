import { Navigate, Route, Routes } from 'react-router-dom'
import { SchedulePage } from './schedule-page'
import { SpacesPage } from './spaces-page'
import { WorkPage } from './work-page'

export const volunteerLinks = [
  ['/', 'Schedule'],
  ['/work', 'Work'],
  ['/spaces', 'Spaces'],
] as const

export function VolunteerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SchedulePage />} />
      <Route path="/work" element={<WorkPage />} />
      <Route path="/spaces" element={<SpacesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

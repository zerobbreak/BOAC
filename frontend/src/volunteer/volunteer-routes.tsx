import { Navigate, Route, Routes } from 'react-router-dom'
import { SchedulePage } from './schedule-page'
import { SpacesPage } from './spaces-page'
import { WorkPage } from './work-page'

export const volunteerLinks = [
  ['/desk', 'Schedule'],
  ['/desk/work', 'My work'],
  ['/desk/spaces', 'Places'],
] as const

export function VolunteerRoutes() {
  return (
    <Routes>
      <Route index element={<SchedulePage />} />
      <Route path="work" element={<WorkPage />} />
      <Route path="spaces" element={<SpacesPage />} />
      <Route path="*" element={<Navigate to="/desk" replace />} />
    </Routes>
  )
}

import { Navigate, Route, Routes } from 'react-router-dom'
import { ApplicationsPage } from './applications-page'
import { AssignPage } from './assign-page'
import { ContentPage } from './content-page'
import { DeskPage } from './desk-page'
import { LibraryPage } from './library-page'
import { MessagesPage } from './messages-page'
import { OpportunitiesPage } from './opportunities-page'

export const adminLinks = [
  ['/', 'Desk'],
  ['/content', 'Content'],
  ['/library', 'Library'],
  ['/opportunities', 'Opportunities'],
  ['/applications', 'Applications'],
  ['/assign', 'Assign'],
  ['/messages', 'Messages'],
] as const

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DeskPage />} />
      <Route path="/content" element={<ContentPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/opportunities" element={<OpportunitiesPage />} />
      <Route path="/applications" element={<ApplicationsPage />} />
      <Route path="/assign" element={<AssignPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { Route, Routes } from 'react-router-dom'
import { LoginPage } from '../auth/login-page'
import { ContactPage } from '../public/contact-page'
import { DonatePage } from '../public/donate-page'
import { GetInvolvedPage } from '../public/get-involved-page'
import { VolunteerFormPage } from '../public/volunteer-form-page'
import { PublicLayout } from './public-layout'
import { Shell } from './shell'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PublicLayout />}>
        <Route path="/get-involved" element={<GetInvolvedPage />} />
        <Route path="/volunteer-form" element={<VolunteerFormPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      <Route path="/*" element={<Shell />} />
    </Routes>
  )
}

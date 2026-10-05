import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../auth/login-page'
import { AboutPage } from '../public/about-page'
import { ContactPage } from '../public/contact-page'
import { DonatePage } from '../public/donate-page'
import { GetInvolvedPage } from '../public/get-involved-page'
import { HomePage } from '../public/home-page'
import { MediaArticlePage } from '../public/media-article-page'
import { MediaPage } from '../public/media-page'
import { ProgrammesPage } from '../public/programmes-page'
import { VolunteerFormPage } from '../public/volunteer-form-page'
import { YouthPage } from '../public/youth-page'
import { PublicLayout } from './public-layout'
import { Shell } from './shell'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/desk/*" element={<Shell />} />
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/programmes" element={<ProgrammesPage />} />
        <Route path="/youth" element={<YouthPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/media/:id" element={<MediaArticlePage />} />
        <Route path="/get-involved" element={<GetInvolvedPage />} />
        <Route path="/volunteer" element={<VolunteerFormPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

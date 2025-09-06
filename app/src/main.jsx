import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DashboardLayout from './layouts/dashboardLayout.jsx'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './components/home/home.jsx'
import Courses from './components/courses/courses.jsx'
import Schedule from './components/schedule/schedule.jsx'
import Settings from './components/settings/settings.jsx'
import Reviews from './components/reviews/reviews.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/dashboard/edu" element={<DashboardLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
         <Route path="courses" element={<Courses />} />
         <Route path="schedule" element={<Schedule />} />
         <Route path="settings" element={<Settings />} />
         <Route path="new" element={<Settings />} />
         <Route path="reviews" element={<Reviews />} />
        {/*<Route path="reviews" element={<CreateProject />} />
        <Route path="payments" element={<ViewProject />} />
        <Route path="settings" element={<Schedule />} /> */}
      </Route>
    </Routes>
  </BrowserRouter>
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DashboardLayout from './layouts/dashboardLayout.jsx'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './components/home/home.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/dashboard/edu" element={<DashboardLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        {/* <Route path="courses" element={<Project />} />
        <Route path="reviews" element={<CreateProject />} />
        <Route path="payments" element={<ViewProject />} />
        <Route path="settings" element={<Schedule />} /> */}
      </Route>
    </Routes>
  </BrowserRouter>
)

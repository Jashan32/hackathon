import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DashboardLayout from './layouts/dashboardLayout.jsx'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './components/home/home.jsx'
import Courses from './components/courses/courses.jsx'
import Schedule from './components/schedule/schedule.jsx'
import Settings from './components/settings/settings.jsx'
import Reviews from './components/reviews/reviews.jsx'
import CreateCourse from './components/courses/create.jsx'
import CourseAnalysis from './components/courses/analysis.jsx'
import ManageCourse from './components/courses/manage.jsx'
import EditCourse from './components/courses/edit.jsx'
import Tas from './components/tas/tas.jsx'
import AddTas from './components/tas/addtas.jsx'
import StuDashboardLayout from './stu/layouts/dashboardLayout.jsx'
import StuCourses from './stu/courses/courses.jsx'
import StuViewCourse from './stu/courses/view.jsx'
import StuSettings from './stu/settings/settings.jsx'
import Enrolled from './stu/enrolled/enrolled.jsx'
import ViewEnrolled from './stu/enrolled/viewEnrolled.jsx'
import IndDashboardLayout from './ind/layouts/dashboardLayout.jsx'
import IndCourses from './ind/courses/courses.jsx'
import IndViewCourse from './ind/courses/view.jsx'
import IndSettings from './ind/settings/settings.jsx'
import Auth from './auth.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard/edu" element={<DashboardLayout />}>
        <Route index element={<Navigate to="courses" replace />} />
        {/* <Route path="home" element={<Home />} /> */}
         <Route path="courses" element={<Courses />} />
         <Route path="courses/:courseId/analytics" element={<CourseAnalysis />} />
         <Route path="courses/:courseId/manage" element={<ManageCourse />} />
         <Route path="courses/:courseId/edit" element={<EditCourse />} />
         <Route path="courses/create" element={<CreateCourse />} />
         <Route path="tas" element={<Tas />} />
         <Route path="settings" element={<Settings />} />
         <Route path="new" element={<Settings />} />
         <Route path="reviews" element={<Reviews />} />
         <Route path="addtas" element={<AddTas />} />
      </Route>

      <Route path="/dashboard/stu" element={<StuDashboardLayout />}>
        <Route index element={<Navigate to="courses" replace />} />
         <Route path="courses" element={<StuCourses />} />
         <Route path="courses/view/:courseId" element={<StuViewCourse />} />
         <Route path="enrolled" element={<Enrolled />} />
         <Route path="enrolled/:courseId" element={<ViewEnrolled />} />
         <Route path="settings" element={<StuSettings />} />
         <Route path="new" element={<StuSettings />} />
      </Route>

      <Route path="/dashboard/ind" element={<IndDashboardLayout />}>
        <Route index element={<Navigate to="courses" replace />} />
         <Route path="courses" element={<IndCourses />} />
         <Route path="courses/view/:courseId" element={<IndViewCourse />} />
         <Route path="settings" element={<IndSettings />} />
      </Route>

      <Route path="/" element={<Navigate to="/auth" replace />} />
    </Routes>
  </BrowserRouter>
)

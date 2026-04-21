import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute, AdminRoute, AdminOnlyRoute, GuestRoute, CustomerRoute } from './components/Auth/ProtectedRoutes'
import './index.css'
import Home from './pages/Home/Home'
import About from './pages/Home/About'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import Dashboard from './pages/Admin/Dashboard'
import ManageWorks from './pages/Admin/ManageWorks'
import EditWork from './pages/Admin/EditWork'
import CreateWorkshops from './pages/Admin/CreateWorkshops'
import CreateCourses from './pages/Admin/CreateCourses'
import CourseChallengeReviews from './pages/Admin/CourseChallengeReviews'
import AdminUsers from './pages/Admin/AdminUsers'
import InstructorMessages from './pages/Admin/InstructorMessages'
import SalesArtwork from './pages/Admin/SalesArtwork'
import AdminProfile from './pages/Admin/Profile'
import CustomerDashboard from './pages/Customers/Dashoboard'
import CustomerProfile from './pages/Customers/Profile'
import CustomerMessages from './pages/Customers/Messages'
import CustomerNotifications from './pages/Customers/Notifications'
import Courses from './pages/Courses/Courses'
import CourseDetails from './pages/Courses/CourseDetails'
import ModulePlayer from './pages/Courses/ModulePlayer'
import CourseQuiz from './pages/Courses/CourseQuiz'
import Workshops from './pages/Workshops/Workshops'
import WorkshopSession from './pages/Workshops/WorkshopSession'
import Works from './pages/Works/Works'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<PrivateRoute><CourseDetails /></PrivateRoute>} />
        <Route path="/course/:courseId/module/:moduleId" element={<PrivateRoute><ModulePlayer /></PrivateRoute>} />
        <Route path="/course/:courseId/module/:moduleId/quiz" element={<PrivateRoute><CourseQuiz /></PrivateRoute>} />
        <Route path="/workshops" element={<Workshops />} />
        <Route path="/workshop/:workshopId/session" element={<PrivateRoute><WorkshopSession /></PrivateRoute>} />
        <Route path="/works" element={<Works />} />

        {/* Rutas de invitado (redirige si ya está logueado) */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rutas de admin (requiere rol admin o docente) */}
        <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/obras" element={<AdminRoute><ManageWorks /></AdminRoute>} />
        <Route path="/admin/obras/:artworkId/editar" element={<AdminRoute><EditWork /></AdminRoute>} />
        <Route path="/admin/talleres" element={<AdminRoute><CreateWorkshops /></AdminRoute>} />
        <Route path="/admin/cursos" element={<AdminRoute><CreateCourses /></AdminRoute>} />
        <Route path="/admin/cursos/retos" element={<AdminRoute><CourseChallengeReviews /></AdminRoute>} />
        <Route path="/admin/messages" element={<AdminRoute><InstructorMessages /></AdminRoute>} />
        <Route path="/admin/usuarios" element={<AdminOnlyRoute><AdminUsers /></AdminOnlyRoute>} />
        <Route path="/admin/ventas" element={<AdminRoute><SalesArtwork /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />

        {/* Rutas de cliente (requiere estar autenticado) */}
        <Route path="/customer/dashboard" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
        <Route path="/customer/profile" element={<CustomerRoute><CustomerProfile /></CustomerRoute>} />
        <Route path="/customer/messages" element={<CustomerRoute><CustomerMessages /></CustomerRoute>} />
        <Route path="/customer/notifications" element={<CustomerRoute><CustomerNotifications /></CustomerRoute>} />
      </Routes>   
      </Router>
    </AuthProvider>
  </StrictMode>,
)

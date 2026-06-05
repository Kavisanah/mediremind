import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login            from './pages/Login'
import Register         from './pages/Register'
import Dashboard        from './pages/Dashboard'
import Medicines        from './pages/Medicines'
import AddMedicine      from './pages/AddMedicine'
import EditMedicine     from './pages/EditMedicine'
import Appointments     from './pages/Appointments'
import AddAppointment   from './pages/AddAppointment'
import MedicineHistory  from './pages/MedicineHistory'
import Profile          from './pages/Profile'
import Observers        from './pages/Observers'
import ObserverAccept  from './pages/ObserverAccept'  // ← public, no login needed
import ForgotPassword   from './pages/ForgotPassword'
import ResetPassword    from './pages/ResetPassword'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/observer/accept" element={<ObserverAccept />} />  {/* ← invite link */}

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"          element={<Dashboard />} />
            <Route path="/medicines"          element={<Medicines />} />
            <Route path="/medicines/add"      element={<AddMedicine />} />
            <Route path="/medicines/edit/:id" element={<EditMedicine />} />
            <Route path="/appointments"       element={<Appointments />} />
            <Route path="/appointments/add"   element={<AddAppointment />} />
            <Route path="/history"            element={<MedicineHistory />} />
            <Route path="/profile"            element={<Profile />} />
            <Route path="/observers"          element={<Observers />} />   {/* ← NEW */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App





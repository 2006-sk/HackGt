import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Reviews from './components/Reviews'
import Footer from './components/Footer'
import Dashboard from './components/Dashboard'
import PatientDetail from './components/PatientDetail'
import PatientDischarge from './components/PatientDischarge'
import AuthModal from './components/AuthModal'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function AppContent() {
  return (
    <div className="min-h-screen page-gradient-bg relative">
      <Navbar />
      <Routes>
        <Route path="/" element={
          <main className="w-full relative">
            <Hero />
            <About />
            <Reviews />
          </main>
        } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/patient/:patientId" element={
              <ProtectedRoute>
                <PatientDetail />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/patient/:patientId/discharge" element={
              <ProtectedRoute>
                <PatientDischarge />
              </ProtectedRoute>
            } />
      </Routes>
      <Footer />
      <AuthModalWrapper />
    </div>
  )
}

function AuthModalWrapper() {
  const { showAuthModal, setShowAuthModal } = useAuth();

  return (
    <AuthModal 
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      onAuthSuccess={() => setShowAuthModal(false)}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App;
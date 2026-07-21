import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { Toast } from './components/Toast'

import LoginPage from './pages/LoginPage'
import TheatresPage from './pages/TheatresPage'
import TheatreDetailsPage from './pages/TheatreDetailsPage'
import ShowSelectionPage from './pages/ShowSelectionPage'
import SalesEntryPage from './pages/SalesEntryPage'
import ReportReviewPage from './pages/ReportReviewPage'
import SuccessPage from './pages/SuccessPage'
import HistoryPage from './pages/HistoryPage'

// Gate authenticated routes behind the mock OTP verification.
function RequireAuth({ children }) {
  const { auth } = useApp()
  const location = useLocation()
  if (!auth.verified) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }
  return children
}

export default function App() {
  const { toast, dismissToast } = useApp()

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/theatres"
          element={
            <RequireAuth>
              <TheatresPage />
            </RequireAuth>
          }
        />
        <Route
          path="/theatres/:theatreId"
          element={
            <RequireAuth>
              <TheatreDetailsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/theatres/:theatreId/select"
          element={
            <RequireAuth>
              <ShowSelectionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/entry"
          element={
            <RequireAuth>
              <SalesEntryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/review"
          element={
            <RequireAuth>
              <ReportReviewPage />
            </RequireAuth>
          }
        />
        <Route
          path="/success"
          element={
            <RequireAuth>
              <SuccessPage />
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <HistoryPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  )
}

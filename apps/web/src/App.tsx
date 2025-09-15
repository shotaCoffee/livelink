import { Route, Router } from '@solidjs/router'
import { Show } from 'solid-js'
import { AuthProvider, useAuth } from './stores/auth'
import { SongsProvider } from './stores/songs'
import { LivesProvider } from './stores/lives'
import { SetlistProvider } from './stores/setlists'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Main app pages
import HomePage from './pages/HomePage'
import SongsPage from './pages/songs/SongsPage'
import LivesPage from './pages/lives/LivesPage'
import SetlistPage from './pages/setlist/SetlistPage'
import SettingsPage from './pages/SettingsPage'
import SharePage from './pages/share/SharePage'

function AppRoutes() {
  const auth = useAuth()

  return (
    <Show
      when={auth.state.initialized}
      fallback={
        <div class="min-h-screen bg-secondary-50 flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-secondary-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      {/* Public routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/share/:slug" component={SharePage} />

      {/* Protected routes */}
      <Route
        path="/"
        component={() => (
          <ProtectedRoute>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/dashboard"
        component={() => (
          <ProtectedRoute>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/songs"
        component={() => (
          <ProtectedRoute>
            <AppLayout>
              <SongsPage />
            </AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/lives"
        component={() => (
          <ProtectedRoute>
            <AppLayout>
              <LivesPage />
            </AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/setlist/:liveId"
        component={() => (
          <ProtectedRoute>
            <AppLayout>
              <SetlistPage />
            </AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/settings"
        component={() => (
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        )}
      />
    </Show>
  )
}

function App() {
  return (
    <AuthProvider>
      <SongsProvider>
        <LivesProvider>
          <SetlistProvider>
            <Router>
              <AppRoutes />
            </Router>
          </SetlistProvider>
        </LivesProvider>
      </SongsProvider>
    </AuthProvider>
  )
}

export default App

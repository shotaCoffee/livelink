import { JSX, Show } from 'solid-js'
import { Navigate } from '@solidjs/router'
import { useAuth } from '../stores/auth'

interface ProtectedRouteProps {
  children: JSX.Element
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const auth = useAuth()

  return (
    <Show when={auth.state.user} fallback={<Navigate href="/login" />}>
      {props.children}
    </Show>
  )
}

import { createSignal, Show, createEffect } from 'solid-js'
import { Navigate, A, useNavigate } from '@solidjs/router'
import { Button, Input, FormGroup, Card, CardContent } from '@band-setlist/ui'
import { useAuth } from '../../stores/auth'

export default function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [confirmPassword, setConfirmPassword] = createSignal('')
  const [error, setError] = createSignal('')
  const [justRegistered, setJustRegistered] = createSignal(false)

  // Redirect if already authenticated (but not if just registered)
  if (auth.state.user && !justRegistered()) {
    return <Navigate href="/" />
  }

  // Redirect to dashboard after successful registration
  createEffect(() => {
    if (auth.state.user && justRegistered()) {
      navigate('/dashboard')
    }
  })

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')

    if (!email() || !password() || !confirmPassword()) {
      setError('すべてのフィールドを入力してください')
      return
    }

    if (password() !== confirmPassword()) {
      setError('パスワードが一致しません')
      return
    }

    if (password().length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    const result = await auth.signUp(email(), password())
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      // Mark as just registered to trigger dashboard redirect
      setJustRegistered(true)
    }
  }

  return (
    <div class="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center">
          <div class="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg
              class="w-7 h-7 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        </div>
        <h2 class="mt-6 text-center text-3xl font-bold text-secondary-900">
          LiveLink に新規登録
        </h2>
        <p class="mt-2 text-center text-sm text-secondary-600">
          すでにアカウントをお持ちの方は{' '}
          <A
            href="/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            ログイン
          </A>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent class="py-8">
            <form onSubmit={handleSubmit} class="space-y-6">
              <Show when={error()}>
                <div class="bg-accent-50 border border-accent-200 rounded-md p-4">
                  <p class="text-sm text-accent-600">{error()}</p>
                </div>
              </Show>

              <FormGroup label="メールアドレス" required>
                <Input
                  type="email"
                  value={email()}
                  onInput={e => setEmail(e.currentTarget.value)}
                  placeholder="example@example.com"
                  required
                />
              </FormGroup>

              <FormGroup label="パスワード" required>
                <Input
                  type="password"
                  value={password()}
                  onInput={e => setPassword(e.currentTarget.value)}
                  placeholder="6文字以上のパスワード"
                  required
                />
              </FormGroup>

              <FormGroup label="パスワード確認" required>
                <Input
                  type="password"
                  value={confirmPassword()}
                  onInput={e => setConfirmPassword(e.currentTarget.value)}
                  placeholder="パスワードを再入力"
                  required
                />
              </FormGroup>

              <Button type="submit" class="w-full" loading={auth.state.loading}>
                新規登録
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

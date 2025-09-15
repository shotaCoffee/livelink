import { createSignal, Show } from 'solid-js'
import { Navigate, A } from '@solidjs/router'
import { Button, Input, FormGroup, Card, CardContent } from '@band-setlist/ui'
import { useAuth } from '../../stores/auth'

export default function LoginPage() {
  const auth = useAuth()
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [error, setError] = createSignal('')

  // Redirect if already authenticated
  if (auth.state.user) {
    return <Navigate href="/" />
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')

    if (!email() || !password()) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    const result = await auth.signIn(email(), password())
    if (result.error) {
      setError(result.error)
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
          LiveLink にログイン
        </h2>
        <p class="mt-2 text-center text-sm text-secondary-600">
          アカウントをお持ちでない方は{' '}
          <A
            href="/register"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            新規登録
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
                  placeholder="パスワードを入力"
                  required
                />
              </FormGroup>

              <Button type="submit" class="w-full" loading={auth.state.loading}>
                ログイン
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

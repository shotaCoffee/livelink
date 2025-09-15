import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  Button,
  FormGroup,
  Input,
} from '@band-setlist/ui'
import { useAuth } from '../stores/auth'

export default function SettingsPage() {
  const auth = useAuth()

  return (
    <div>
      <PageHeader
        title="設定"
        subtitle="アカウント設定と環境設定を管理します"
      />

      <div class="space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <h3 class="text-lg font-semibold text-secondary-900">
              アカウント設定
            </h3>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <FormGroup label="メールアドレス">
                <Input
                  type="email"
                  value={auth.state.user?.email || ''}
                  disabled
                />
              </FormGroup>

              <FormGroup label="登録日">
                <Input
                  type="text"
                  value={
                    auth.state.user?.created_at
                      ? new Date(auth.state.user.created_at).toLocaleDateString(
                          'ja-JP'
                        )
                      : ''
                  }
                  disabled
                />
              </FormGroup>

              <div class="pt-4">
                <Button variant="danger" size="sm">
                  アカウントを削除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <h3 class="text-lg font-semibold text-secondary-900">
              パスワード設定
            </h3>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <FormGroup label="現在のパスワード">
                <Input type="password" placeholder="現在のパスワードを入力" />
              </FormGroup>

              <FormGroup label="新しいパスワード">
                <Input type="password" placeholder="新しいパスワードを入力" />
              </FormGroup>

              <FormGroup label="新しいパスワード（確認）">
                <Input type="password" placeholder="新しいパスワードを再入力" />
              </FormGroup>

              <div class="pt-4">
                <Button variant="primary" size="sm">
                  パスワードを更新
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <h3 class="text-lg font-semibold text-secondary-900">
              アプリケーション設定
            </h3>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-secondary-900">
                    メール通知
                  </h4>
                  <p class="text-sm text-secondary-600">
                    新しいライブの作成時に通知を受け取る
                  </p>
                </div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-secondary-900">
                    セットリスト公開
                  </h4>
                  <p class="text-sm text-secondary-600">
                    セットリストをデフォルトで公開する
                  </p>
                </div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

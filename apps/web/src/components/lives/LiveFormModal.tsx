import { createSignal, createEffect, Show } from 'solid-js'
import type { Live, LiveFormData } from '@band-setlist/shared'
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  FormGroup,
  Input,
  Textarea,
} from '@band-setlist/ui'

interface LiveFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: LiveFormData) => Promise<boolean>
  live?: Live
  loading?: boolean
}

export function LiveFormModal(props: LiveFormModalProps) {
  const [formData, setFormData] = createSignal<LiveFormData>({
    title: '',
    venue: '',
    date: '',
    description: '',
    is_upcoming: true,
    share_slug: '',
  })

  const [errors, setErrors] = createSignal<Record<string, string>>({})

  // Update form data when props.live changes
  createEffect(() => {
    const live = props.live
    if (live) {
      setFormData({
        title: live.title || '',
        venue: live.venue || '',
        date: live.date ? live.date.split('T')[0] : '',
        description: live.description || '',
        is_upcoming: live.is_upcoming ?? true,
        share_slug: live.share_slug || '',
      })
    } else {
      // Reset form when no live is provided (create mode)
      setFormData({
        title: '',
        venue: '',
        date: '',
        description: '',
        is_upcoming: true,
        share_slug: '',
      })
    }
    // Clear any existing errors
    setErrors({})
  })

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    const data = formData()
    const newErrors: Record<string, string> = {}

    // Validation
    if (!data.title.trim()) {
      newErrors.title = 'ライブタイトルは必須です'
    }
    if (!data.venue.trim()) {
      newErrors.venue = '会場名は必須です'
    }
    if (!data.date) {
      newErrors.date = '開催日は必須です'
    }

    // Share slug validation (optional field, but must be valid if provided)
    if (data.share_slug && data.share_slug.trim()) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      if (!slugRegex.test(data.share_slug.trim())) {
        newErrors.share_slug =
          '公開URLは英数字とハイフンのみ使用可能です（例: my-live-2024）'
      }
      if (data.share_slug.trim().length < 3) {
        newErrors.share_slug = '公開URLは3文字以上である必要があります'
      }
      if (data.share_slug.trim().length > 50) {
        newErrors.share_slug = '公開URLは50文字以下である必要があります'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    // Convert date to ISO string for submission
    const submissionData: LiveFormData = {
      ...data,
      date: new Date(data.date).toISOString(),
    }

    const success = await props.onSubmit(submissionData)
    if (success) {
      props.onClose()
      // Form will be reset automatically when props.live changes or becomes undefined
    }
  }

  const updateField = (field: keyof LiveFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors()[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          {props.live ? 'ライブを編集' : '新しいライブを作成'}
        </ModalHeader>

        <ModalContent class="space-y-4">
          <FormGroup label="ライブタイトル" error={errors().title} required>
            <Input
              value={formData().title}
              onInput={e => updateField('title', e.currentTarget.value)}
              placeholder="例: Spring Live 2024"
              disabled={props.loading}
            />
          </FormGroup>

          <FormGroup label="会場名" error={errors().venue} required>
            <Input
              value={formData().venue}
              onInput={e => updateField('venue', e.currentTarget.value)}
              placeholder="例: 渋谷クラブクアトロ"
              disabled={props.loading}
            />
          </FormGroup>

          <FormGroup label="開催日" error={errors().date} required>
            <Input
              type="date"
              value={formData().date}
              onInput={e => updateField('date', e.currentTarget.value)}
              disabled={props.loading}
            />
          </FormGroup>

          <FormGroup label="説明・詳細">
            <Textarea
              value={formData().description}
              onInput={e => updateField('description', e.currentTarget.value)}
              placeholder="ライブの詳細情報、チケット情報など..."
              rows={4}
              disabled={props.loading}
            />
          </FormGroup>

          <FormGroup label="ステータス">
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input
                  type="radio"
                  name="status"
                  checked={formData().is_upcoming}
                  onChange={() => updateField('is_upcoming', true)}
                  disabled={props.loading}
                  class="mr-2"
                />
                開催予定
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  name="status"
                  checked={!formData().is_upcoming}
                  onChange={() => updateField('is_upcoming', false)}
                  disabled={props.loading}
                  class="mr-2"
                />
                開催済み
              </label>
            </div>
          </FormGroup>

          <FormGroup label="公開用URL" error={errors().share_slug}>
            <Input
              value={formData().share_slug}
              onInput={e => updateField('share_slug', e.currentTarget.value)}
              placeholder="例: my-live-2024"
              disabled={props.loading}
            />
            <p class="text-sm text-secondary-500 mt-1">
              空欄の場合は公開されません。英数字とハイフンのみ使用可能です。
            </p>
            <Show when={formData().share_slug && !errors().share_slug}>
              <p class="text-sm text-secondary-600 mt-1">
                公開URL: {window.location.origin}/share/{formData().share_slug}
              </p>
            </Show>
          </FormGroup>
        </ModalContent>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={props.onClose}
            disabled={props.loading}
          >
            キャンセル
          </Button>
          <Button type="submit" variant="primary" loading={props.loading}>
            {props.live ? '更新' : '作成'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

import { createSignal, Show } from 'solid-js'
import type { LiveFormData } from '@band-setlist/shared'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { FormGroup } from './FormGroup'

export interface LiveFormProps {
  initialData?: Partial<LiveFormData>
  onSubmit: (data: LiveFormData) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function LiveForm(props: LiveFormProps) {
  const [formData, setFormData] = createSignal<LiveFormData>({
    title: props.initialData?.title || '',
    date: props.initialData?.date || '',
    venue: props.initialData?.venue || '',
    ticket_url: props.initialData?.ticket_url || '',
    is_upcoming: props.initialData?.is_upcoming ?? true,
  })

  const [errors, setErrors] = createSignal<
    Partial<Record<keyof LiveFormData, string>>
  >({})

  const validateForm = (): boolean => {
    const data = formData()
    const newErrors: Partial<Record<keyof LiveFormData, string>> = {}

    if (!data.title.trim()) {
      newErrors.title = 'ライブタイトルは必須です'
    }

    if (!data.date.trim()) {
      newErrors.date = '開催日は必須です'
    } else {
      const selectedDate = new Date(data.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.date = '開催日は今日以降の日付を選択してください'
      }
    }

    if (!data.venue.trim()) {
      newErrors.venue = '会場名は必須です'
    }

    if (data.ticket_url && !isValidUrl(data.ticket_url)) {
      newErrors.ticket_url = '有効なURLを入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    if (validateForm()) {
      await props.onSubmit(formData())
    }
  }

  const updateField = <K extends keyof LiveFormData>(
    field: K,
    value: LiveFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors()[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: string): string => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <FormGroup label="ライブタイトル" required error={errors().title}>
        <Input
          type="text"
          value={formData().title}
          onInput={e => updateField('title', e.currentTarget.value)}
          placeholder="ライブタイトルを入力してください"
          error={!!errors().title}
        />
      </FormGroup>

      <FormGroup label="開催日" required error={errors().date}>
        <Input
          type="date"
          value={formatDateForInput(formData().date)}
          onInput={e => updateField('date', e.currentTarget.value)}
          error={!!errors().date}
        />
      </FormGroup>

      <FormGroup label="会場名" required error={errors().venue}>
        <Input
          type="text"
          value={formData().venue}
          onInput={e => updateField('venue', e.currentTarget.value)}
          placeholder="会場名を入力してください"
          error={!!errors().venue}
        />
      </FormGroup>

      <FormGroup label="チケットURL" error={errors().ticket_url}>
        <Input
          type="url"
          value={formData().ticket_url}
          onInput={e => updateField('ticket_url', e.currentTarget.value)}
          placeholder="https://tickets.example.com/..."
          error={!!errors().ticket_url}
        />
      </FormGroup>

      <FormGroup label="開催予定">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData().is_upcoming}
            onChange={e => updateField('is_upcoming', e.currentTarget.checked)}
            class="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm text-secondary-700">今後開催予定のライブ</span>
        </label>
      </FormGroup>

      <div class="flex justify-end gap-3 pt-4">
        <Show when={props.onCancel}>
          <Button
            type="button"
            variant="secondary"
            onClick={props.onCancel}
            disabled={props.loading}
          >
            キャンセル
          </Button>
        </Show>
        <Button type="submit" loading={props.loading}>
          {props.initialData ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  )
}

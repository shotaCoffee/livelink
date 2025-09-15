import { createSignal, Show } from 'solid-js'
import type { SongFormData } from '@band-setlist/shared'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { FormGroup } from './FormGroup'

export interface SongFormProps {
  initialData?: Partial<SongFormData>
  onSubmit: (data: SongFormData) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function SongForm(props: SongFormProps) {
  const [formData, setFormData] = createSignal<SongFormData>({
    title: props.initialData?.title || '',
    artist: props.initialData?.artist || '',
    youtube_url: props.initialData?.youtube_url || '',
    spotify_url: props.initialData?.spotify_url || '',
  })

  const [errors, setErrors] = createSignal<
    Partial<Record<keyof SongFormData, string>>
  >({})

  const validateForm = (): boolean => {
    const data = formData()
    const newErrors: Partial<Record<keyof SongFormData, string>> = {}

    if (!data.title.trim()) {
      newErrors.title = '楽曲名は必須です'
    }

    if (!data.artist.trim()) {
      newErrors.artist = 'アーティスト名は必須です'
    }

    if (data.youtube_url && !isValidUrl(data.youtube_url)) {
      newErrors.youtube_url = '有効なURLを入力してください'
    }

    if (data.spotify_url && !isValidUrl(data.spotify_url)) {
      newErrors.spotify_url = '有効なURLを入力してください'
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

  const updateField = <K extends keyof SongFormData>(
    field: K,
    value: SongFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors()[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <FormGroup label="楽曲名" required error={errors().title}>
        <Input
          type="text"
          value={formData().title}
          onInput={e => updateField('title', e.currentTarget.value)}
          placeholder="楽曲名を入力してください"
          error={!!errors().title}
        />
      </FormGroup>

      <FormGroup label="アーティスト名" required error={errors().artist}>
        <Input
          type="text"
          value={formData().artist}
          onInput={e => updateField('artist', e.currentTarget.value)}
          placeholder="アーティスト名を入力してください"
          error={!!errors().artist}
        />
      </FormGroup>

      <FormGroup label="YouTube URL" error={errors().youtube_url}>
        <Input
          type="url"
          value={formData().youtube_url}
          onInput={e => updateField('youtube_url', e.currentTarget.value)}
          placeholder="https://youtube.com/watch?v=..."
          error={!!errors().youtube_url}
        />
      </FormGroup>

      <FormGroup label="Spotify URL" error={errors().spotify_url}>
        <Input
          type="url"
          value={formData().spotify_url}
          onInput={e => updateField('spotify_url', e.currentTarget.value)}
          placeholder="https://open.spotify.com/track/..."
          error={!!errors().spotify_url}
        />
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
          {props.initialData ? '更新' : '追加'}
        </Button>
      </div>
    </form>
  )
}

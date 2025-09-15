import { createSignal, Show } from 'solid-js'
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  FormGroup,
} from '@band-setlist/ui'
import type { Song, SongFormData } from '@band-setlist/shared'

interface SongFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SongFormData) => Promise<boolean>
  song?: Song
  isLoading?: boolean
}

export default function SongFormModal(props: SongFormModalProps) {
  const [formData, setFormData] = createSignal<SongFormData>({
    title: props.song?.title || '',
    artist: props.song?.artist || '',
    youtube_url: props.song?.youtube_url || '',
    spotify_url: props.song?.spotify_url || '',
  })

  const [errors, setErrors] = createSignal<Record<string, string>>({})

  const validateForm = (): boolean => {
    const data = formData()
    const newErrors: Record<string, string> = {}

    if (!data.title.trim()) {
      newErrors.title = '楽曲名は必須です'
    }

    if (!data.artist.trim()) {
      newErrors.artist = 'アーティスト名は必須です'
    }

    if (data.youtube_url && !isValidUrl(data.youtube_url)) {
      newErrors.youtube_url = '有効なYouTube URLを入力してください'
    }

    if (data.spotify_url && !isValidUrl(data.spotify_url)) {
      newErrors.spotify_url = '有効なSpotify URLを入力してください'
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

    if (!validateForm()) {
      return
    }

    const success = await props.onSubmit(formData())
    if (success) {
      props.onClose()
      // Reset form
      setFormData({
        title: '',
        artist: '',
        youtube_url: '',
        spotify_url: '',
      })
      setErrors({})
    }
  }

  const updateFormData = (field: keyof SongFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field
    if (errors()[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <Modal open={props.isOpen} onClose={props.onClose}>
      <ModalHeader onClose={props.onClose}>
        <h2 class="text-lg font-semibold text-secondary-900">
          {props.song ? '楽曲を編集' : '楽曲を追加'}
        </h2>
      </ModalHeader>

      <ModalContent>
        <form onSubmit={handleSubmit} class="space-y-6">
          <FormGroup label="楽曲名" required error={errors().title}>
            <Input
              type="text"
              value={formData().title}
              onInput={e => updateFormData('title', e.currentTarget.value)}
              placeholder="楽曲名を入力"
              required
            />
          </FormGroup>

          <FormGroup label="アーティスト名" required error={errors().artist}>
            <Input
              type="text"
              value={formData().artist}
              onInput={e => updateFormData('artist', e.currentTarget.value)}
              placeholder="アーティスト名を入力"
              required
            />
          </FormGroup>

          <FormGroup label="YouTube URL" error={errors().youtube_url}>
            <Input
              type="url"
              value={formData().youtube_url}
              onInput={e =>
                updateFormData('youtube_url', e.currentTarget.value)
              }
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </FormGroup>

          <FormGroup label="Spotify URL" error={errors().spotify_url}>
            <Input
              type="url"
              value={formData().spotify_url}
              onInput={e =>
                updateFormData('spotify_url', e.currentTarget.value)
              }
              placeholder="https://open.spotify.com/track/..."
            />
          </FormGroup>
        </form>
      </ModalContent>

      <ModalFooter>
        <div class="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={props.onClose}
            disabled={props.isLoading}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={props.isLoading}
            onClick={handleSubmit}
          >
            <Show when={props.song} fallback="追加する">
              更新する
            </Show>
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}

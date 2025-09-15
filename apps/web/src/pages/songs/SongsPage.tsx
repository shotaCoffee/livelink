import { createSignal, Show } from 'solid-js'
import {
  PageHeader,
  Button,
  LoadingSpinner,
  ErrorBanner,
} from '@band-setlist/ui'
import { SongsProvider, useSongs } from '../../stores/songs'
import SongList from '../../components/songs/SongList'
import SongFormModal from '../../components/songs/SongFormModal'

function SongsPageContent() {
  const songs = useSongs()
  const [showAddModal, setShowAddModal] = createSignal(false)

  // createResourceが自動的にデータを読み込むため、手動リフレッシュは不要

  const handleAddSong = async (songData: any) => {
    const success = await songs.createSong(songData)
    if (success) {
      setShowAddModal(false)
    }
    return success
  }

  return (
    <div>
      <PageHeader
        title="楽曲管理"
        subtitle="楽曲の追加・編集・削除を行います"
        actions={
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            disabled={songs.songsResource.loading}
          >
            楽曲を追加
          </Button>
        }
      />

      {/* エラー表示 */}
      <Show when={songs.songsResource.error}>
        <ErrorBanner message={songs.songsResource.error!.message} />
      </Show>

      {/* ローディング表示またはSongList */}
      <Show when={songs.songsResource.loading} fallback={<SongList />}>
        <div class="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Show>

      <SongFormModal
        isOpen={showAddModal()}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSong}
        isLoading={songs.songsResource.loading}
      />
    </div>
  )
}

export default function SongsPage() {
  return (
    <SongsProvider>
      <SongsPageContent />
    </SongsProvider>
  )
}

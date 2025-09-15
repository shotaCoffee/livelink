import { createSignal, Show } from 'solid-js'
import {
  PageHeader,
  Button,
  LoadingSpinner,
  ErrorBanner,
} from '@band-setlist/ui'
import { useLives } from '../../stores/lives'
import { LiveFormModal } from '../../components/lives/LiveFormModal'
import { LiveList } from '../../components/lives/LiveList'
import type { Live } from '@band-setlist/shared'

export default function LivesPage() {
  const livesContext = useLives()

  const {
    livesResource, // Resourceオブジェクト
    refreshLives,
    createLive,
    updateLive,
    deleteLive,
  } = livesContext

  // createResourceが自動的にデータを読み込むため、手動リフレッシュは不要

  const [showModal, setShowModal] = createSignal(false)
  const [editingLive, setEditingLive] = createSignal<Live | undefined>()

  const handleCreate = () => {
    setEditingLive(undefined)
    setShowModal(true)
  }

  const handleEdit = (live: Live) => {
    setEditingLive(live)
    setShowModal(true)
  }

  const handleSubmit = async (data: any) => {
    const live = editingLive()
    let result

    if (live) {
      result = await updateLive(live.id, data)
    } else {
      result = await createLive(data)
    }

    // 操作が成功したらデータを再取得
    if (result) {
      refreshLives()
    }

    return result
  }

  const handleDelete = async (id: string) => {
    const result = await deleteLive(id)
    if (result) {
      refreshLives()
    }
    return result
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingLive(undefined)
  }

  return (
    <div>
      <PageHeader
        title="ライブ管理"
        subtitle="ライブイベントの作成・管理を行います"
        actions={
          <Button variant="primary" onClick={handleCreate}>
            ライブを作成
          </Button>
        }
      />

      <Show when={livesResource.error}>
        <ErrorBanner message={livesResource.error!.message} />
      </Show>

      {/* resourceのloading状態を利用 */}
      <Show
        when={livesResource.loading}
        fallback={
          <div>
            <LiveList
              lives={livesResource() || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={livesResource.loading}
            />
          </div>
        }
      >
        <div class="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Show>

      <LiveFormModal
        open={showModal()}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        live={editingLive()}
        loading={livesResource.loading}
      />
    </div>
  )
}

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'
import { Link, useSearchParams } from 'react-router-dom'
import { apiBlob, client, errorText, unwrap } from '../lib/api-client'
import { MediaArticle, MediaCard, fallbackImages, mediaDate } from '../public/media-parts'
import { categoriesQuery, contentQuery } from './queries'
import '../public/site.css'

type ContentItem = InferResponseType<typeof client.admin.content.$get, 200>['content'][number]
type ContentType = 'post' | 'article'
type Status = 'draft' | 'published'

// Covers sit behind the admin API, so they are fetched with the session and shown as blob URLs.
function useCover(item: Pick<ContentItem, 'id' | 'coverUrl' | 'updatedAt'> | null) {
  const cover = useQuery({
    queryKey: ['admin', 'cover', item?.id, item?.updatedAt],
    queryFn: () => apiBlob(item!.coverUrl!),
    enabled: Boolean(item?.coverUrl),
    staleTime: Infinity,
  })
  return item?.coverUrl ? cover.data ?? null : null
}

// A preview URL for a file picked but not yet uploaded.
function useFileUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url)
  }, [url])
  return url
}

export function ContentPage() {
  const [params, setParams] = useSearchParams()
  const editing = params.get('edit')
  const { data, error, isPending } = useQuery(contentQuery)
  const categories = useQuery(categoriesQuery)
  const items = data?.content ?? []
  const categoryName = new Map((categories.data ?? []).map((category) => [category.id, category.name]))

  if (editing) {
    const item = editing === 'new' ? null : items.find((entry) => entry.id === editing)
    if (editing !== 'new' && !item) {
      return (
        <section>
          <Link to="?" className="back-link">← All content</Link>
          <p className={error ? 'error' : 'muted'} style={{ marginTop: 16 }}>
            {isPending ? 'Loading…' : error ? errorText(error, 'Content could not be loaded') : 'This post no longer exists.'}
          </p>
        </section>
      )
    }
    return (
      <ContentEditor
        key={editing}
        item={item ?? null}
        categories={categories.data ?? []}
        onClose={() => setParams({})}
        onCreated={(id) => setParams({ edit: id })}
      />
    )
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Public site</p>
          <h1>News &amp; content</h1>
        </div>
        <Link to="?edit=new" className="button">New post</Link>
      </div>
      <p className="muted page-intro">Published posts appear on the News page of the public site, newest edit first. Drafts stay here until you publish them.</p>
      {error ? <p className="error">{errorText(error, 'Content could not be loaded')}</p> : null}
      {isPending ? <p className="muted">Loading…</p> : null}
      {!isPending && !error && items.length === 0 ? (
        <div className="card empty">
          <h2>Nothing posted yet</h2>
          <p className="muted">Write the first post for the News page.</p>
        </div>
      ) : null}
      <ul className="content-list">
        {items.map((item) => (
          <li key={item.id}>
            <ContentRow item={item} category={item.categoryId ? categoryName.get(item.categoryId) : undefined} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ContentRow({ item, category }: { item: ContentItem; category?: string }) {
  const cover = useCover(item)
  return (
    <Link to={`?edit=${item.id}`} className="content-row">
      {cover ? <img src={cover} alt="" className="thumb" /> : <span className="thumb">{item.coverUrl ? '' : 'No cover'}</span>}
      <span>
        <span className="content-row-title">{item.title}</span>
        <span className="muted">
          {[category, item.type === 'article' ? 'Article' : 'Post', `Edited ${mediaDate(item.updatedAt)}`].filter(Boolean).join(' · ')}
        </span>
      </span>
      <span className={`status status-${item.status}`}>{item.status === 'published' ? 'Published' : 'Draft'}</span>
    </Link>
  )
}

type EditorProps = {
  item: ContentItem | null
  categories: { id: string; name: string }[]
  onClose: () => void
  onCreated: (id: string) => void
}

function ContentEditor({ item, categories, onClose, onCreated }: EditorProps) {
  const queryClient = useQueryClient()
  const saved = { title: item?.title ?? '', body: item?.body ?? '', type: (item?.type ?? 'post') as ContentType, categoryId: item?.categoryId ?? '' }
  const [form, setForm] = useState(saved)
  const [file, setFile] = useState<File | null>(null)
  const [dropCover, setDropCover] = useState(false)
  const [view, setView] = useState<'card' | 'article'>('card')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const savedCover = useCover(item)
  const fileUrl = useFileUrl(file)
  const cover = fileUrl ?? (dropCover ? null : savedCover)
  const hasCover = Boolean(file) || (Boolean(item?.coverUrl) && !dropCover)
  const dirty = item
    ? file !== null || dropCover || (Object.keys(saved) as (keyof typeof saved)[]).some((key) => form[key] !== saved[key])
    : Boolean(form.title || form.body || file)
  const status: Status = item?.status ?? 'draft'

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Both the desk list and the public News page read this content.
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: contentQuery.queryKey }),
    queryClient.invalidateQueries({ queryKey: ['public'] }),
  ])

  const save = useMutation({
    mutationFn: async (nextStatus: Status) => {
      const fields = { title: form.title, body: form.body, type: form.type }
      let result = item
        ? (await unwrap(client.admin.content[':id'].$patch({
            param: { id: item.id },
            json: { ...fields, categoryId: form.categoryId || null, ...(nextStatus !== status ? { status: nextStatus } : {}) },
          }))).content
        : (await unwrap(client.admin.content.$post({
            json: { ...fields, status: nextStatus, ...(form.categoryId ? { categoryId: form.categoryId } : {}) },
          }))).content
      if (file) {
        result = (await unwrap(client.admin.content[':id'].cover.$post({ param: { id: result.id }, form: { cover: file } }))).content
      } else if (dropCover && item?.coverUrl) {
        await unwrap(client.admin.content[':id'].cover.$delete({ param: { id: result.id } }))
      }
      return result
    },
    onSuccess: async (result) => {
      setFile(null)
      setDropCover(false)
      await refresh()
      if (!item) onCreated(result.id)
    },
  })
  const remove = useMutation({
    mutationFn: () => unwrap(client.admin.content[':id'].$delete({ param: { id: item!.id } })),
    onSuccess: async () => {
      await refresh()
      onClose()
    },
  })
  const error = save.error ?? remove.error
  const busy = save.isPending || remove.isPending

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    save.mutate(status)
  }

  function leave() {
    if (!dirty || window.confirm('Discard your unsaved changes?')) onClose()
  }

  const previewDate = item && !dirty ? item.updatedAt : new Date()
  const previewTitle = form.title.trim() || 'Your title'
  const category = categories.find((entry) => entry.id === form.categoryId)?.name

  return (
    <section>
      <button type="button" className="ghost" onClick={leave} style={{ minHeight: 36, padding: '6px 12px' }}>← All content</button>
      <div className="editor">
        <form className="card editor-form" onSubmit={onSubmit}>
          <div className="editor-title-row">
            <p className="eyebrow">{item ? 'Edit post' : 'New post'}</p>
            <span className={`status status-${status}`}>{status === 'published' ? 'Published' : 'Draft'}</span>
          </div>

          <label>
            Title
            <input className="field-title" value={form.title} onChange={(event) => update('title', event.target.value)} required maxLength={200} />
          </label>

          <div className="field-row">
            <label>
              Category
              <select value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)}>
                <option value="">No category</option>
                {categories.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              </select>
              <span className="hint">Categories become the filter tabs on the News page.</span>
            </label>
            <fieldset>
              <legend>Type</legend>
              <div className="segmented">
                {(['post', 'article'] as const).map((type) => (
                  <label key={type}>
                    <input type="radio" name="type" value={type} checked={form.type === type} onChange={() => update('type', type)} />
                    <span>{type === 'post' ? 'Post' : 'Article'}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <label className="body-field">
            Text
            <textarea value={form.body} onChange={(event) => update('body', event.target.value)} />
            <span className="hint">Leave an empty line between paragraphs. The first 160 characters show on the News card.</span>
          </label>

          <div className="cover-field">
            {cover ? <img src={cover} alt="Cover preview" className="thumb" /> : <span className="thumb">No cover</span>}
            <div className="cover-actions">
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>Cover image</span>
              <div>
                <label className="file-button">
                  {hasCover ? 'Replace image' : 'Choose image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      setFile(event.target.files?.[0] ?? null)
                      setDropCover(false)
                      event.target.value = ''
                    }}
                  />
                </label>
                {hasCover ? (
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      setFile(null)
                      setDropCover(true)
                    }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <span className="hint">JPG, PNG or WebP. Without one, the News page uses a photo of the centre.</span>
            </div>
          </div>

          {error ? <p className="error" role="alert" style={{ marginTop: 20 }}>{errorText(error, 'Could not save')}</p> : null}

          <div className="editor-actions">
            {status === 'published' ? (
              <>
                <button type="submit" disabled={busy || !dirty || !form.title.trim()}>Save changes</button>
                <button type="button" className="ghost" disabled={busy} onClick={() => save.mutate('draft')}>Unpublish</button>
              </>
            ) : (
              <>
                <button type="button" disabled={busy || !form.title.trim()} onClick={() => save.mutate('published')}>Publish</button>
                <button type="submit" className="ghost" disabled={busy || !dirty || !form.title.trim()}>Save draft</button>
              </>
            )}
            {dirty && item ? <span className="unsaved">Unsaved changes</span> : null}
            {save.isSuccess && !dirty ? <span className="muted" role="status">Saved</span> : null}
            {item ? (
              <span className="spacer">
                {confirmDelete ? (
                  <span className="row">
                    <button type="button" className="danger" disabled={busy} onClick={() => remove.mutate()}>Delete for good</button>
                    <button type="button" className="ghost" onClick={() => setConfirmDelete(false)}>Keep</button>
                  </span>
                ) : (
                  <button type="button" className="danger" onClick={() => setConfirmDelete(true)}>Delete</button>
                )}
              </span>
            ) : null}
          </div>
        </form>

        <aside className="preview" aria-label="Preview">
          <div className="preview-head">
            <p className="eyebrow">Preview on the public site</p>
            <div className="preview-tabs">
              <button type="button" className={view === 'card' ? undefined : 'ghost'} aria-pressed={view === 'card'} onClick={() => setView('card')}>News card</button>
              <button type="button" className={view === 'article' ? undefined : 'ghost'} aria-pressed={view === 'article'} onClick={() => setView('article')}>Full post</button>
            </div>
          </div>
          <div className="site site-embed preview-frame">
            {view === 'card' ? (
              <div className="preview-card">
                <MediaCard title={previewTitle} body={form.body} category={category} date={previewDate} image={cover ?? fallbackImages[0]} />
              </div>
            ) : (
              <div className="article preview-article">
                <MediaArticle title={previewTitle} body={form.body} date={previewDate} image={cover} />
              </div>
            )}
          </div>
          <p className="muted">
            {status === 'published'
              ? 'This post is live. Saved changes show on the News page straight away.'
              : 'Drafts are only visible here. Publish to put it on the News page.'}
          </p>
        </aside>
      </div>
    </section>
  )
}

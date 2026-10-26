import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'
import { Link, useSearchParams } from 'react-router-dom'
import { apiBlob, client, errorText, unwrap } from '../lib/api-client'
import { MediaArticle, MediaCard, fallbackImages, mediaDate } from '../public/media-parts'
import { categoriesQuery, contentQuery } from './queries'
import '../public/site.css'

type ContentItem = InferResponseType<typeof client.admin.content.$get, 200>['content'][number]
type Status = 'draft' | 'published'
type Placement = 'news' | 'home'

// The homepage's "From the centre" section shows this many posts.
const homeSlots = 3

function whereLabel(placement: Placement) {
  return placement === 'home' ? 'News + Homepage' : 'News'
}

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
          <Link to="?" className="back-link">← All news posts</Link>
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
        homeItems={items.filter((entry) => entry.status === 'published' && entry.placement === 'home' && entry.id !== editing)}
        onClose={() => setParams({})}
        onCreated={(id) => setParams({ edit: id })}
      />
    )
  }

  return <ContentList items={items} categoryName={categoryName} error={error} isPending={isPending} />
}

const filters = {
  all: { label: 'All', keep: () => true },
  published: { label: 'Published', keep: (item: ContentItem) => item.status === 'published' },
  draft: { label: 'Drafts', keep: (item: ContentItem) => item.status === 'draft' },
  home: { label: 'On homepage', keep: (item: ContentItem) => item.status === 'published' && item.placement === 'home' },
}
type Filter = keyof typeof filters

type ListProps = {
  items: ContentItem[]
  categoryName: Map<string, string>
  error: Error | null
  isPending: boolean
}

function ContentList({ items, categoryName, error, isPending }: ListProps) {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<Filter>('all')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [confirming, setConfirming] = useState(false)
  const shown = items.filter(filters[filter].keep)
  // Only drafts can be removed in bulk, so a slip cannot take live posts off the site.
  const drafts = shown.filter((item) => item.status === 'draft')
  const chosen = items.filter((item) => picked.has(item.id) && item.status === 'draft')

  const removeDrafts = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) await unwrap(client.admin.content[':id'].$delete({ param: { id } }))
    },
    onSettled: async () => {
      setPicked(new Set())
      setConfirming(false)
      await queryClient.invalidateQueries({ queryKey: contentQuery.queryKey })
    },
  })

  function toggle(id: string) {
    setConfirming(false)
    setPicked((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Public site</p>
          <h1>News posts</h1>
        </div>
        <Link to="?edit=new" className="button">New post</Link>
      </div>
      <p className="muted page-intro">
        Every published post appears on the News page. Choose “News + Homepage” in a post to also feature it on the
        homepage, which shows the latest {homeSlots}. Drafts stay here until you publish them.
      </p>
      {error ? <p className="error">{errorText(error, 'Content could not be loaded')}</p> : null}
      {removeDrafts.error ? <p className="error">{errorText(removeDrafts.error, 'Some drafts could not be deleted')}</p> : null}
      {isPending ? <p className="muted">Loading…</p> : null}
      {items.length ? (
        <div className="toolbar">
          <div className="filters" role="group" aria-label="Show">
            {(Object.keys(filters) as Filter[]).map((key) => (
              <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
                {filters[key].label} {items.filter(filters[key].keep).length}
              </button>
            ))}
          </div>
          {chosen.length ? (
            <div className="bulk" role="status">
              <span>{chosen.length === 1 ? '1 draft selected' : `${chosen.length} drafts selected`}</span>
              {confirming ? (
                <>
                  <button type="button" className="danger" style={{ color: 'var(--lime)', borderColor: 'var(--lime)' }} disabled={removeDrafts.isPending} onClick={() => removeDrafts.mutate(chosen.map((item) => item.id))}>
                    Delete for good
                  </button>
                  <button type="button" className="ghost" style={{ color: 'var(--lime)', borderColor: 'var(--lime)' }} onClick={() => setConfirming(false)}>Keep</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setConfirming(true)}>Delete drafts…</button>
                  <button type="button" className="ghost" style={{ color: 'var(--lime)', borderColor: 'var(--lime)' }} onClick={() => setPicked(new Set())}>Clear</button>
                </>
              )}
            </div>
          ) : drafts.length > 1 ? (
            <button type="button" className="ghost" onClick={() => setPicked(new Set(drafts.map((item) => item.id)))}>Select all drafts</button>
          ) : null}
        </div>
      ) : null}
      {!isPending && !error && items.length === 0 ? (
        <div className="card empty">
          <h2>Nothing posted yet</h2>
          <p className="muted">Write the first post for the News page.</p>
        </div>
      ) : null}
      <ul className="content-list">
        {shown.map((item) => (
          <li key={item.id}>
            {item.status === 'draft' ? (
              <input type="checkbox" checked={picked.has(item.id)} onChange={() => toggle(item.id)} aria-label={`Select draft “${item.title}”`} />
            ) : (
              <span style={{ width: 22, flex: 'none' }} />
            )}
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
          {[category, `Edited ${mediaDate(item.updatedAt)}`].filter(Boolean).join(' · ')}
        </span>
      </span>
      <span className="placement-tag" data-placement={item.placement}>{whereLabel(item.placement)}</span>
      <span className={`status status-${item.status}`}>{item.status === 'published' ? 'Published' : 'Draft'}</span>
    </Link>
  )
}

type EditorProps = {
  item: ContentItem | null
  categories: { id: string; name: string }[]
  // Other published homepage posts, so the preview shows the section as it will look.
  homeItems: ContentItem[]
  onClose: () => void
  onCreated: (id: string) => void
}

function ContentEditor({ item, categories, homeItems, onClose, onCreated }: EditorProps) {
  const queryClient = useQueryClient()
  const saved = {
    title: item?.title ?? '',
    body: item?.body ?? '',
    categoryId: item?.categoryId ?? '',
    placement: (item?.placement ?? 'news') as Placement,
  }
  const [form, setForm] = useState(saved)
  const [file, setFile] = useState<File | null>(null)
  const [dropCover, setDropCover] = useState(false)
  const [view, setView] = useState<'home' | 'card' | 'article'>(saved.placement === 'home' ? 'home' : 'card')
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

  // A post can still point at a category removed before deletes cleaned up after themselves.
  // The select shows "No category" for it, so save it that way too.
  const categoryId = categories.some((entry) => entry.id === form.categoryId) ? form.categoryId : ''

  function choosePlacement(next: Placement) {
    update('placement', next)
    if (next === 'home') setView('home')
    else if (view === 'home') setView('card')
  }

  // Both the desk list and the public News page read this content.
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: contentQuery.queryKey }),
    queryClient.invalidateQueries({ queryKey: ['public'] }),
  ])

  const save = useMutation({
    mutationFn: async (nextStatus: Status) => {
      const fields = { title: form.title, body: form.body, placement: form.placement }
      let result = item
        ? (await unwrap(client.admin.content[':id'].$patch({
            param: { id: item.id },
            json: { ...fields, categoryId: categoryId || null, ...(nextStatus !== status ? { status: nextStatus } : {}) },
          }))).content
        : (await unwrap(client.admin.content.$post({
            json: { ...fields, status: nextStatus, ...(categoryId ? { categoryId } : {}) },
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
      // A removed category was saved as none; match the form so it doesn't read as unsaved.
      update('categoryId', categoryId)
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
  const categoryName = new Map(categories.map((entry) => [entry.id, entry.name]))
  const where = form.placement === 'home'
    ? 'the News page and the homepage’s “From the centre” section'
    : 'the News page only'

  return (
    <section>
      <button type="button" className="ghost" onClick={leave} style={{ minHeight: 36, padding: '6px 12px' }}>← All news posts</button>
      <div className="editor">
        <form className="card editor-form" onSubmit={onSubmit}>
          <div className="editor-title-row">
            <p className="eyebrow">{item ? 'Edit post' : 'New post'}</p>
            <span className={`status status-${status}`}>{status === 'published' ? 'Published' : 'Draft'}</span>
          </div>

          <fieldset className="placement">
            <legend>Where will this appear?</legend>
            <label>
              <input type="radio" name="placement" checked={form.placement === 'news'} onChange={() => choosePlacement('news')} />
              <span>
                <strong>News page only</strong>
                <span className="hint">Listed on the News page, newest first.</span>
              </span>
            </label>
            <label>
              <input type="radio" name="placement" checked={form.placement === 'home'} onChange={() => choosePlacement('home')} />
              <span>
                <strong>News page + Homepage</strong>
                <span className="hint">
                  Also featured in “From the centre” on the homepage. It shows the latest {homeSlots}; older ones drop
                  off the homepage but stay on News.
                </span>
              </span>
            </label>
          </fieldset>

          <label>
            Title
            <input className="field-title" value={form.title} onChange={(event) => update('title', event.target.value)} required maxLength={200} />
          </label>

          <label>
            Category
            <select value={categoryId} onChange={(event) => update('categoryId', event.target.value)}>
              <option value="">No category</option>
              {categories.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
            </select>
            <span className="hint">
              Categories become the filter tabs on the News page. <Link to="/desk/library">Manage categories</Link>
            </span>
          </label>

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
                <button type="button" disabled={busy || !form.title.trim()} onClick={() => save.mutate('published')}>
                  Publish to {whereLabel(form.placement)}
                </button>
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
              <button type="button" className={view === 'home' ? undefined : 'ghost'} aria-pressed={view === 'home'} onClick={() => setView('home')}>Homepage</button>
              <button type="button" className={view === 'card' ? undefined : 'ghost'} aria-pressed={view === 'card'} onClick={() => setView('card')}>News page</button>
              <button type="button" className={view === 'article' ? undefined : 'ghost'} aria-pressed={view === 'article'} onClick={() => setView('article')}>Full post</button>
            </div>
          </div>
          <div className="site site-embed preview-frame">
            {view === 'home' ? (
              form.placement === 'home' ? (
                <div className="preview-home">
                  <h2 className="section-title" style={{ marginBottom: 40 }}>From the centre</h2>
                  <div className="media-grid">
                    <MediaCard title={previewTitle} body={form.body} category={category} date={previewDate} image={cover ?? fallbackImages[0]} className="preview-mine" />
                    {homeItems.slice(0, homeSlots - 1).map((entry, index) => (
                      <HomePreviewCard key={entry.id} item={entry} category={entry.categoryId ? categoryName.get(entry.categoryId) : undefined} index={index + 1} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="preview-empty">
                  <h2>Not on the homepage</h2>
                  <p>You chose “News page only”. Pick “News page + Homepage” to feature this post in “From the centre”.</p>
                  <button type="button" className="ghost" onClick={() => choosePlacement('home')}>Feature on the homepage</button>
                </div>
              )
            ) : view === 'card' ? (
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
              ? `This post is live on ${where}. Saved changes show there straight away.`
              : `Drafts are only visible here. Publishing puts it on ${where}.`}
          </p>
        </aside>
      </div>
    </section>
  )
}

function HomePreviewCard({ item, category, index }: { item: ContentItem; category?: string; index: number }) {
  const cover = useCover(item)
  return (
    <MediaCard
      title={item.title}
      body={item.body}
      category={category}
      date={item.updatedAt}
      image={cover ?? fallbackImages[index % fallbackImages.length]}
    />
  )
}

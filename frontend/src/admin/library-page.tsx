import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { categoriesQuery, contentQuery } from './queries'

// Categories group news posts; each one with a published post becomes a filter tab on the News page.
// Tags were managed here too, but nothing could attach or show them, so they are no longer offered.
export function LibraryPage() {
  const queryClient = useQueryClient()
  const { data: categories = [], error: loadError } = useQuery(categoriesQuery)
  const content = useQuery(contentQuery)
  const [name, setName] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)

  const posts = content.data?.content ?? []
  const usage = (id: string) => {
    const used = posts.filter((item) => item.categoryId === id)
    return { total: used.length, published: used.filter((item) => item.status === 'published').length }
  }

  // Removing a category also clears it from posts, so the content list and News page need refreshing.
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: categoriesQuery.queryKey }),
    queryClient.invalidateQueries({ queryKey: contentQuery.queryKey }),
    queryClient.invalidateQueries({ queryKey: ['public'] }),
  ])
  const add = useMutation({
    mutationFn: (value: string) => unwrap(client.admin.categories.$post({ json: { name: value } })),
    onSuccess: async () => {
      setName('')
      await refresh()
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) => unwrap(client.admin.categories[':id'].$delete({ param: { id } })),
    onSuccess: () => setConfirming(null),
    onSettled: refresh,
  })
  const error = loadError ?? add.error ?? remove.error

  function onAdd(event: FormEvent) {
    event.preventDefault()
    add.mutate(name)
  }

  return (
    <section>
      <p className="eyebrow">Public site</p>
      <h1>Categories</h1>
      <p className="muted page-intro">
        Categories group your news posts. Each one with a published post becomes a filter tab on the News page. They
        don't decide where a post appears; that is set in each post.
      </p>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      <form className="row" onSubmit={onAdd}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="New category, e.g. Events" aria-label="New category" required />
        <button type="submit" disabled={add.isPending}>Add</button>
      </form>
      {categories.length === 0 && !loadError ? <p className="muted">No categories yet. The News page shows one list until you add some.</p> : null}
      <div className="list">
        {categories.map((category) => {
          const { total, published } = usage(category.id)
          return (
            <div className="card" key={category.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>
                  <strong>{category.name}</strong>
                  <span className="muted">
                    {' · '}
                    {total === 1 ? '1 post' : `${total} posts`}
                    {published ? ' · tab is showing on News' : ' · no tab until a post is published'}
                  </span>
                </span>
                {confirming === category.id ? null : (
                  <button className="ghost" type="button" onClick={() => setConfirming(category.id)}>Remove</button>
                )}
              </div>
              {confirming === category.id ? (
                <div className="row" role="alert" style={{ marginTop: 12 }}>
                  <span>
                    Remove “{category.name}”?{' '}
                    {total === 0
                      ? 'No posts use it.'
                      : total === 1
                        ? 'Its post stays as it is, filed under No category.'
                        : `Its ${total} posts stay as they are, filed under No category.`}
                  </span>
                  <button type="button" className="ghost" onClick={() => setConfirming(null)}>Keep it</button>
                  <button type="button" className="danger" disabled={remove.isPending} onClick={() => remove.mutate(category.id)}>
                    Remove category
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

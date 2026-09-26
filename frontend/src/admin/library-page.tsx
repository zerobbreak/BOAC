import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { client, errorText, unwrap } from '../lib/api-client'
import { categoriesQuery, tagsQuery } from './queries'

const lists = {
  categories: {
    query: categoriesQuery,
    add: (name: string): Promise<unknown> => unwrap(client.admin.categories.$post({ json: { name } })),
    remove: (id: string): Promise<unknown> => unwrap(client.admin.categories[':id'].$delete({ param: { id } })),
  },
  tags: {
    query: tagsQuery,
    add: (name: string): Promise<unknown> => unwrap(client.admin.tags.$post({ json: { name } })),
    remove: (id: string): Promise<unknown> => unwrap(client.admin.tags[':id'].$delete({ param: { id } })),
  },
}

function NameList({ path, label }: { path: keyof typeof lists; label: string }) {
  const list = lists[path]
  const queryClient = useQueryClient()
  const { data: items = [], error: loadError } = useQuery(list.query)
  const [name, setName] = useState('')

  const refresh = () => queryClient.invalidateQueries({ queryKey: list.query.queryKey })
  const add = useMutation({
    mutationFn: list.add,
    onSuccess: async () => {
      setName('')
      await refresh()
    },
  })
  const remove = useMutation({ mutationFn: list.remove, onSettled: refresh })
  const error = loadError ?? add.error ?? remove.error

  function onAdd(event: FormEvent) {
    event.preventDefault()
    add.mutate(name)
  }

  return (
    <section>
      <h2>{label}</h2>
      {error ? <p className="error">{errorText(error, 'Load failed')}</p> : null}
      <form className="row" onSubmit={onAdd}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder={`New ${label.toLowerCase()}`} required />
        <button type="submit" disabled={add.isPending}>Add</button>
      </form>
      <div className="list">
        {items.map((item) => (
          <div className="card row" key={item.id}>
            <span>{item.name}</span>
            <button className="ghost" type="button" onClick={() => remove.mutate(item.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export function LibraryPage() {
  return (
    <div className="split">
      <div>
        <p className="eyebrow">Labels</p>
        <h1>Library</h1>
        <NameList path="categories" label="Categories" />
      </div>
      <NameList path="tags" label="Tags" />
    </div>
  )
}

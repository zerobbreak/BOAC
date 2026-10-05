import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { errorText } from '../lib/api-client'
import { MediaCard, mediaCover } from './media-parts'
import { mediaCategoriesQuery, mediaQuery } from './queries'
import { LitemaBand } from './sections'

const pageSize = 6

export function MediaPage() {
  const media = useQuery(mediaQuery)
  const categories = useQuery(mediaCategoriesQuery)
  const [filter, setFilter] = useState('all')
  const [shown, setShown] = useState(pageSize)

  const items = media.data ?? []
  // Only categories that have published items get a tab.
  const usedCategories = (categories.data ?? []).filter((category) => items.some((item) => item.categoryId === category.id))
  const categoryName = new Map(usedCategories.map((category) => [category.id, category.name]))
  const visible = filter === 'all' ? items : items.filter((item) => item.categoryId === filter)

  function choose(next: string) {
    setFilter(next)
    setShown(pageSize)
  }

  return (
    <>
      <div className="wrap">
        <div className="intro">
          <p className="kicker">News</p>
          <h1 className="page-title">From the centre.</h1>
          <p className="lede">Radio interviews, community days and news from Bokwidi, posted by our team.</p>
        </div>
      </div>

      <LitemaBand />

      <section className="section">
        <div className="wrap">
          {usedCategories.length ? (
            <div className="tabs" role="group" aria-label="Filter by category">
              <button type="button" className="tab" aria-pressed={filter === 'all'} onClick={() => choose('all')}>Everything</button>
              {usedCategories.map((category) => (
                <button key={category.id} type="button" className="tab" aria-pressed={filter === category.id} onClick={() => choose(category.id)}>
                  {category.name}
                </button>
              ))}
            </div>
          ) : null}

          {media.isPending ? (
            <p className="media-state">Loading…</p>
          ) : media.error ? (
            <p className="media-state">{errorText(media.error, 'News could not be loaded')}</p>
          ) : !visible.length ? (
            <p className="media-state">Nothing has been posted yet. Check back soon.</p>
          ) : (
            <div className="media-grid">
              {visible.slice(0, shown).map((item, index) => (
                <MediaCard
                  key={item.id}
                  className="reveal"
                  title={item.title}
                  body={item.body}
                  category={item.categoryId ? categoryName.get(item.categoryId) : null}
                  date={item.updatedAt}
                  image={mediaCover(item, index)}
                  to={`/media/${item.id}`}
                />
              ))}
            </div>
          )}

          {visible.length > shown ? (
            <div className="more">
              <button type="button" className="btn btn-line" onClick={() => setShown((count) => count + pageSize)}>Show more</button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}

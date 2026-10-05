import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { errorText } from '../lib/api-client'
import { MediaArticle, mediaCover } from './media-parts'
import { mediaItemQuery } from './queries'

export function MediaArticlePage() {
  const { id = '' } = useParams()
  const item = useQuery(mediaItemQuery(id))

  return (
    <section className="section">
      <div className="wrap">
        <div className="article">
          <Link to="/media" className="text-link">Back to news</Link>
          {item.isPending ? (
            <p className="media-state">Loading…</p>
          ) : item.error ? (
            <p className="media-state">{errorText(item.error, 'This post could not be loaded')}</p>
          ) : (
            <div style={{ marginTop: 32 }}>
              <MediaArticle
                title={item.data.title}
                body={item.data.body}
                date={item.data.updatedAt}
                image={item.data.coverUrl ? mediaCover(item.data, 0) : null}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

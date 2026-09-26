import { Link } from 'react-router-dom'
import { apiUrl } from '../lib/auth'
import aboutHero from './images/about-hero.webp'
import heroElder from './images/hero-elder.webp'
import programmeLearning from './images/programme-learning.webp'
import programmeYouth from './images/programme-youth.webp'

// How a post looks on the public site. The News page, the article page and the desk's
// content preview all render these, so the preview is the real thing.

// Items without a cover get one of the site's own photos.
export const fallbackImages = [aboutHero, programmeYouth, programmeLearning, heroElder]

export function mediaDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function mediaCover(item: { coverUrl: string | null }, index: number) {
  return item.coverUrl ? `${apiUrl}${item.coverUrl}` : fallbackImages[index % fallbackImages.length]
}

export function excerpt(body: string) {
  const text = body.replace(/\s+/g, ' ').trim()
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text
}

function paragraphs(body: string) {
  return body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
}

type CardProps = {
  title: string
  body: string
  category?: string | null
  date: string | Date
  image: string
  // Without `to` the title is plain text (the desk preview).
  to?: string
  className?: string
}

export function MediaCard({ title, body, category, date, image, to, className }: CardProps) {
  return (
    <article className={className ? `media-item ${className}` : 'media-item'}>
      <img src={image} alt="" />
      <div className="media-meta">
        {category ? <span className="media-category">{category}</span> : null}
        <time dateTime={new Date(date).toISOString()}>{mediaDate(date)}</time>
      </div>
      <h2>{to ? <Link to={to}>{title}</Link> : title}</h2>
      {body ? <p>{excerpt(body)}</p> : null}
    </article>
  )
}

type ArticleProps = {
  title: string
  body: string
  date: string | Date
  // The article page shows a cover only when the post has its own.
  image?: string | null
}

export function MediaArticle({ title, body, date, image }: ArticleProps) {
  return (
    <article>
      <div className="media-meta">
        <time dateTime={new Date(date).toISOString()}>{mediaDate(date)}</time>
      </div>
      <h1 className="page-title" style={{ marginTop: 12 }}>{title}</h1>
      {image ? <img src={image} alt="" className="article-cover" /> : null}
      <div className="article-body" style={{ marginTop: image ? 0 : 28 }}>
        {paragraphs(body).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    </article>
  )
}

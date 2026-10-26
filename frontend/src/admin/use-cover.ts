import { useQuery } from '@tanstack/react-query'
import { apiBlob } from '../lib/api-client'

type Covered = { id: string; coverUrl: string | null; updatedAt: string }

// Covers sit behind the admin API, so they are fetched with the session and shown as blob URLs.
export function useCover(item: Covered | null) {
  const cover = useQuery({
    queryKey: ['admin', 'cover', item?.id, item?.updatedAt],
    queryFn: () => apiBlob(item!.coverUrl!),
    enabled: Boolean(item?.coverUrl),
    staleTime: Infinity,
  })
  return item?.coverUrl ? cover.data ?? null : null
}

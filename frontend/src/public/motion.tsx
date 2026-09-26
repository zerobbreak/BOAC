import { useEffect, type RefObject } from 'react'

// Adds .is-visible to every .reveal under root as it scrolls into view. It also watches for
// nodes added later (route changes, cards that arrive from the API) so pages need no wiring.
export function useScrollReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element) return
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          reveal.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )
    const watch = () => element.querySelectorAll('.reveal:not(.is-visible)').forEach((node) => reveal.observe(node))
    watch()
    // A re-render that rewrites className drops .is-visible, so class changes are watched too.
    const changes = new MutationObserver(watch)
    changes.observe(element, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    return () => {
      reveal.disconnect()
      changes.disconnect()
    }
  }, [root])
}

import { Aggregation, Facets } from "@mitodl/course-search-utils"

import { FACET_ALIASES } from "./constants"

/**
 * Returns a copy of `activeFacets` in which, for every configured facet group,
 * any selected canonical value also includes its alias value(s).
 *
 * This lets a search filter by both the canonical value and the alias term(s)
 * that the search API still returns for it. For example, selecting the "Music"
 * department also filters by "Music and Theater Arts".
 *
 * The returned object is a shallow copy; the input is not mutated.
 */
export function expandFacetAliases(activeFacets: Facets): Facets {
  const expanded: Facets = { ...activeFacets }

  for (const [group, aliases] of Object.entries(FACET_ALIASES)) {
    if (!aliases) {
      continue
    }
    const key = group as keyof Facets
    const selected = expanded[key]
    if (!selected || selected.length === 0) {
      continue
    }

    const values = new Set(selected)
    for (const [alias, canonical] of Object.entries(aliases)) {
      if (values.has(canonical)) {
        values.add(alias)
      }
    }
    expanded[key] = Array.from(values)
  }

  return expanded
}

/**
 * Returns a copy of the raw search API `aggregations` object in which, for every
 * configured facet group, each alias bucket is merged into its canonical bucket:
 * the doc counts are summed, the alias bucket is dropped, and the group's buckets
 * are re-sorted by count.
 *
 * This shows a single canonical facet with a combined count. For example, the
 * "Music and Theater Arts" bucket is folded into the "Music" department. If
 * a canonical bucket is not present but its alias is, the canonical bucket is
 * created from the alias so the canonical value is still shown.
 *
 * The returned object is a copy; neither the input object nor its buckets are
 * mutated.
 */
export function mergeAliasedAggregations(
  aggregations: Record<string, Aggregation> | null | undefined
): Record<string, Aggregation> {
  if (!aggregations) {
    return {}
  }

  const merged: Record<string, Aggregation> = { ...aggregations }

  for (const [group, aliases] of Object.entries(FACET_ALIASES)) {
    if (!aliases) {
      continue
    }
    const aggregation = merged[group]
    if (!aggregation || !aggregation.buckets) {
      continue
    }

    // clone buckets so we never mutate the API response objects
    const bucketsByKey = new Map(
      aggregation.buckets.map(bucket => [bucket.key, { ...bucket }])
    )

    let changed = false
    for (const [alias, canonical] of Object.entries(aliases)) {
      const aliasBucket = bucketsByKey.get(alias)
      if (!aliasBucket) {
        continue
      }
      const canonicalBucket = bucketsByKey.get(canonical)
      if (canonicalBucket) {
        canonicalBucket.doc_count += aliasBucket.doc_count
      } else {
        bucketsByKey.set(canonical, {
          key:       canonical,
          doc_count: aliasBucket.doc_count
        })
      }
      bucketsByKey.delete(alias)
      changed = true
    }

    if (changed) {
      merged[group] = {
        ...aggregation,
        buckets: Array.from(bucketsByKey.values()).sort(
          (a, b) => b.doc_count - a.doc_count
        )
      }
    }
  }

  return merged
}

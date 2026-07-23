import { Aggregation, Facets } from "@mitodl/course-search-utils"

import { expandFacetAliases, mergeAliasedAggregations } from "./facets"

describe("expandFacetAliases", () => {
  it("adds the alias value when the canonical value is selected", () => {
    const activeFacets: Facets = {
      department_name: ["Music"]
    }

    const result = expandFacetAliases(activeFacets)

    expect(result.department_name).toEqual(["Music", "Music and Theater Arts"])
  })

  it("preserves other selected values and other facet groups", () => {
    const activeFacets: Facets = {
      department_name: ["Mathematics", "Music"],
      topics:          ["Calculus"]
    }

    const result = expandFacetAliases(activeFacets)

    expect(result.department_name).toEqual([
      "Mathematics",
      "Music",
      "Music and Theater Arts"
    ])
    expect(result.topics).toEqual(["Calculus"])
  })

  it("does not add the alias when the canonical value is not selected", () => {
    const activeFacets: Facets = {
      department_name: ["Mathematics"]
    }

    const result = expandFacetAliases(activeFacets)

    expect(result.department_name).toEqual(["Mathematics"])
  })

  it("does not duplicate the alias if it is already present", () => {
    const activeFacets: Facets = {
      department_name: ["Music", "Music and Theater Arts"]
    }

    const result = expandFacetAliases(activeFacets)

    expect(result.department_name).toEqual(["Music", "Music and Theater Arts"])
  })

  it("does not mutate the input", () => {
    const activeFacets: Facets = {
      department_name: ["Music"]
    }

    expandFacetAliases(activeFacets)

    expect(activeFacets.department_name).toEqual(["Music"])
  })
})

describe("mergeAliasedAggregations", () => {
  it("merges the alias bucket count into the canonical bucket and drops the alias", () => {
    const aggregations: Record<string, Aggregation> = {
      department_name: {
        buckets: [
          { key: "Mathematics", doc_count: 10 },
          { key: "Music", doc_count: 5 },
          { key: "Music and Theater Arts", doc_count: 3 }
        ]
      }
    }

    const result = mergeAliasedAggregations(aggregations)

    expect(result.department_name.buckets).toEqual([
      { key: "Mathematics", doc_count: 10 },
      { key: "Music", doc_count: 8 }
    ])
  })

  it("creates the canonical bucket from the alias when only the alias is present", () => {
    const aggregations: Record<string, Aggregation> = {
      department_name: {
        buckets: [
          { key: "Mathematics", doc_count: 10 },
          { key: "Music and Theater Arts", doc_count: 3 }
        ]
      }
    }

    const result = mergeAliasedAggregations(aggregations)

    expect(result.department_name.buckets).toEqual([
      { key: "Mathematics", doc_count: 10 },
      { key: "Music", doc_count: 3 }
    ])
  })

  it("re-sorts buckets by descending count after merging", () => {
    const aggregations: Record<string, Aggregation> = {
      department_name: {
        buckets: [
          { key: "Music", doc_count: 5 },
          { key: "Mathematics", doc_count: 10 },
          { key: "Music and Theater Arts", doc_count: 8 }
        ]
      }
    }

    const result = mergeAliasedAggregations(aggregations)

    expect(result.department_name.buckets).toEqual([
      { key: "Music", doc_count: 13 },
      { key: "Mathematics", doc_count: 10 }
    ])
  })

  it("leaves the group untouched when no alias bucket is present", () => {
    const aggregations: Record<string, Aggregation> = {
      department_name: {
        buckets: [{ key: "Mathematics", doc_count: 10 }]
      }
    }

    const result = mergeAliasedAggregations(aggregations)

    expect(result.department_name.buckets).toEqual([
      { key: "Mathematics", doc_count: 10 }
    ])
  })

  it("does not mutate the input aggregations or buckets", () => {
    const aggregations: Record<string, Aggregation> = {
      department_name: {
        buckets: [
          { key: "Music", doc_count: 5 },
          { key: "Music and Theater Arts", doc_count: 3 }
        ]
      }
    }

    mergeAliasedAggregations(aggregations)

    expect(aggregations.department_name.buckets).toEqual([
      { key: "Music", doc_count: 5 },
      { key: "Music and Theater Arts", doc_count: 3 }
    ])
  })

  it("returns an empty object for null/undefined input", () => {
    expect(mergeAliasedAggregations(null)).toEqual({})
    expect(mergeAliasedAggregations(undefined)).toEqual({})
  })
})

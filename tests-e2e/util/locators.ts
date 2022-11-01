import { Locator } from "@playwright/test"

/**
 * Get the first of a list of candidates that occurs in the DOM after a
 * specified predecessor.
 *
 * @param candidates Locator object of the candidates.
 * @param predecessor Locator object of the predecessor.
 * @returns Locator object of the match.
 *
 * @example Get a list of instructors that occur after text "Instructors":
 * ```ts
 * const list = getFirstAfter(
 *     page.getByRole("list"),
 *     page.getByText("Instructors")
 * )
 * ```
 */
const getFirstAfter = async (candidates: Locator, predecessor: Locator) => {
  const predCount = await predecessor.count()
  if (predCount !== 1) {
    throw new Error(
      `Expected a locator resolving to a single 'after' element. Found ${predCount} instead.`
    )
  }
  const predId = await predecessor.evaluate(element => {
    /**
     * We need `element` below. But playwright can't serialize it.
     * Let's temporarily store it on the window object. Gross.
     */
    const tempId = `playwright_temp_id_${Math.random()}`
    window[tempId] = element
    return tempId
  })
  const matchIndex = await candidates.evaluateAll(
    (els, { predId }) => {
      const predecessorEl = window[predId]
      delete window[predId]
      return els.findIndex(
        el =>
          predecessorEl.compareDocumentPosition(el) ===
          Node.DOCUMENT_POSITION_FOLLOWING
      )
    },
    { predId }
  )

  if (matchIndex === -1) {
    if ((await candidates.count()) === 0) {
      throw new Error("No candidates found.")
    }
    throw new Error("No element found after the given predecessor")
  }

  return candidates.nth(matchIndex)
}

/**
 * Returns a locator that finds the closest ancestor of the current context
 * that satisfies the given xpath selector.
 *
 * @example Get the `section` element enclosing a particular heading:
 * ```ts
 * const section = page
 *  .getByRole("heading", { name: "Some Title"})
 *  .locator(closest("section"))
 * ```
 *
 * @note This is essentially a workaround for the fact that Playwright has no
 * locator-based analog to [`Element.closest()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest).
 */
const closest = (xpath: string) => {
  return `xpath=./ancestor-or-self::${xpath}[position() = 1]`
}

export { getFirstAfter, closest }

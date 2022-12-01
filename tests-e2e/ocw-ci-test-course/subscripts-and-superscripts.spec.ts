import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

/**
 * Simplify the whitespace of an innerHTML string. The replacements made are
 * conservative. In some cases (e.g., block formatting contexts) it may be
 * safe to remove more whitespace than is removed here.
 */
const simplifyInnerHtmlWhitespace = (innherHTML: string) => {
  return innherHTML
    .replace(/[\t\n\r]+/g, " ") // collapse interior whitespace
    .replace(/^[\t\n\r]/, "") // remove leading whitespace
    .replace(/[\t\n\r]$/, "") // remove trailing whitespace
}

/**
 * In general, we should not be testing the exact HTML output of Hugo because
 * it makes for brittle, overly-sensitive tests.
 *
 * However, in this case we really do want to test that "sub/sup tags in the
 * input become sub/sup tags in the output", and we want to check this in a
 * variety of contexts (bold, links, etc).
 *
 * The resulting tests should not be particularly brittle since the HTML in
 * question is fairly simple: just a paragraph with links and some sub/sup
 * tags.
 */
test("Subscripts and superscripts in markdown should render in HTML.", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("pages/subscripts-and-superscripts")
  const paragraphs = await course
    .withinContent()
    .locator("p")
    .evaluateAll(els => els.map(el => el.innerHTML))
  const actuals = paragraphs
    .map(simplifyInnerHtmlWhitespace)
    .filter(p => p.startsWith("Example"))
  const expected = [
    "Example, Normal: Lorem ipsum dolor sit<sub>abc 123</sub> amet consectetur. Lorem ipsum dolor sit<sup>abc 123</sup> amet consectetur.",
    "Example, Bold: <strong>Lorem ipsum dolor sit<sub>abc 123</sub> amet consectetur. Lorem ipsum dolor sit<sup>abc 123</sup> amet consectetur.</strong>",
    "Example, Italic: <em>Lorem ipsum dolor sit<sub>abc 123</sub> amet consectetur. Lorem ipsum dolor sit<sup>abc 123</sup> amet consectetur.</em>",
    "Example, Interior Bold: Lorem ipsum dolor sit<sub>abc <strong>123</strong></sub> amet consectetur. Lorem ipsum dolor sit<sup>abc <strong>123</strong></sup> amet consectetur.",
    "Example, Interior italic: Lorem ipsum dolor sit<sub>abc <em>123</em></sub> amet consectetur. Lorem ipsum dolor sit<sup>abc <em>123</em></sup> amet consectetur.",
    'Example, Links in scripts: Lorem ipsum dolor sit<sub><a href="https://mit.edu" target="_blank" rel="noopener">abc 123</a></sub> amet consectetur. Lorem ipsum dolor sit<sup><a href="https://mit.edu" target="_blank" rel="noopener">abc 123</a></sup> amet consectetur.',
    'Example, Scripts in Links: Lorem ipsum dolor <a href="https://mit.edu" target="_blank" rel="noopener">sit<sub>abc 123</sub> amet</a> consectetur. Lorem ipsum dolor <a href="https://mit.edu" target="_blank" rel="noopener">sit<sup>abc 123</sup> amet</a> amet consectetur.',
    'Example, Resource Links in scripts: Lorem ipsum dolor sit<sub><a href="/courses/ocw-ci-test-course/pages/subscripts-and-superscripts/">abc 123</a></sub> amet consectetur. Lorem ipsum dolor sit<sup><a href="/courses/ocw-ci-test-course/pages/subscripts-and-superscripts/">abc 123</a></sup> amet consectetur.',
    'Example, Scripts in Resource Links: Lorem ipsum dolor <a href="/courses/ocw-ci-test-course/pages/subscripts-and-superscripts/">sit<sub>abc 123</sub> amet</a> consectetur. Lorem ipsum dolor <a href="/courses/ocw-ci-test-course/pages/subscripts-and-superscripts/">sit<sup>abc 123</sup> amet</a> consectetur.'
  ]

  expect(actuals).toEqual(expected)
})

test("Subscripts and superscripts render in tables", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("pages/subscripts-and-superscripts")
  const actuals = await course
    .withinContent()
    .locator("td")
    .evaluateAll(els => els.map(el => el.innerHTML))

  /**
   * Let's not simplify the whitespace this time. The leading whitespace in
   * table cells is actually important, not as part of html, but as part of
   * markdown. (Newlines break out of HTML blocks in Markdown syntax. See
   * [HTML Blocks](https://spec.commonmark.org/0.30/#html-blocks))
   */
  expect(actuals[0]).toBe("\n\nlorem<sub>abc 123</sub> ipsum\n")
  expect(actuals[1]).toBe(
    '\n\nlorem<a href="https://mit.edu" target="_blank" rel="noopener"><sup>†</sup></a> ipsum\n'
  )
})

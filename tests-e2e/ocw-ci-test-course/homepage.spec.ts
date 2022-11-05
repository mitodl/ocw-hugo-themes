import { test, expect } from "@playwright/test"
import { getFirstAfter, CoursePage } from "../util"

test("Course page has title in <head>", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto()
  await expect(page).toHaveTitle(/OCW CI Test Course/)
})

test.describe("Course info", () => {
  const listData = [
    {
      label:    "Instructors",
      expected: {
        texts: [
          "Prof. Deepto Chakrabarty",
          "Dr. Peter Dourmashkin",
          "Dr. Michelle Tomasik",
          "Prof. Anna Frebel",
          "Prof. Vladan Vuletic"
        ],
        searchParams: [
          "?q=Prof.+Deepto+Chakrabarty",
          "?q=Dr.+Peter+Dourmashkin",
          "?q=Dr.+Michelle+Tomasik",
          "?q=Prof.+Anna+Frebel",
          "?q=Prof.+Vladan+Vuletic"
        ]
      }
    },
    {
      label:    "Departments",
      expected: {
        texts: [
          "Physics",
          "Electrical Engineering and Computer Science",
          "Mathematics"
        ],
        searchParams: [
          "?d=Physics",
          "?d=Electrical+Engineering+and+Computer+Science",
          "?d=Mathematics"
        ]
      }
    }
  ]

  listData.forEach(({ label, expected }) => {
    test(`Lists ${label} with links to search page`, async ({ page }) => {
      const course = new CoursePage(page, "course")
      await course.goto()
      const courseInfo = course.getCourseInfo()

      const list = await getFirstAfter(
        courseInfo.getByRole("list"),
        courseInfo.getByText(label)
      )
      const items = list.getByRole("listitem")
      const links = list.getByRole("link")

      const texts = (await items.allInnerTexts()).map(s => s.trim())
      expect(texts).toEqual(expected.texts)

      const hrefs = await links.evaluateAll(links => {
        return links.map(link => (link as HTMLAnchorElement).href)
      })
      const urls = hrefs.map(href => new URL(href))
      expect(urls.map(url => url.search)).toEqual(expected.searchParams)
      expect(urls.every(url => url.pathname === "/search")).toBe(true)
    })
  })
})

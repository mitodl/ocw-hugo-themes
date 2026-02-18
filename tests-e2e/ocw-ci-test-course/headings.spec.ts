import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test(`Verify accesibility and semantic structure of headings`, async ({
  page
}) => {
  const headingsData = [
    {
      label:                "Section 2",
      expectedHeadingLevel: "H2"
    },
    {
      label:                "H3 heading",
      expectedHeadingLevel: "H3"
    },
    {
      label:                "Course Info",
      expectedHeadingLevel: "H5"
    },
    {
      label:                "Instructors",
      expectedHeadingLevel: "H6"
    },
    {
      label:                "Departments",
      expectedHeadingLevel: "H6"
    },
    {
      label:                "As Taught In",
      expectedHeadingLevel: "H6"
    },
    {
      label:                "Level",
      expectedHeadingLevel: "H6"
    },
    {
      label:                "Topics",
      expectedHeadingLevel: "H6"
    },
    {
      label:                "Learning Resource Types",
      expectedHeadingLevel: "H6"
    }
  ]
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto("pages/assignments")

  for (const { label, expectedHeadingLevel } of headingsData) {
    const heading = page.getByRole("heading", { name: label })
    await heading.waitFor()
    const accessibleHeadingLevel = await heading.evaluate(node => node.tagName)
    expect(accessibleHeadingLevel).toBe(expectedHeadingLevel)
  }
})

import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test(`Verify accesibility and semantic structure of headings`, async ({
  page
}) => {
  const headingsData = [
    {
      label:                "OCW CI Test Course",
      expectedHeadingLevel: "H1"
    },
    {
      label:                "Course Info",
      expectedHeadingLevel: "H2"
    },
    {
      label:                "Section 2",
      expectedHeadingLevel: "H2"
    },
    {
      label:                "H3 heading",
      expectedHeadingLevel: "H3"
    },
    {
      label:                "INSTRUCTORS",
      expectedHeadingLevel: "H5"
    },
    {
      label:                "DEPARTMENTS",
      expectedHeadingLevel: "H5"
    },
    {
      label:                "AS TAUGHT IN",
      expectedHeadingLevel: "H5"
    },
    {
      label:                "LEVEL",
      expectedHeadingLevel: "H5"
    },
    {
      label:                "TOPICS",
      expectedHeadingLevel: "H5"
    },
    {
      label:                "LEARNING RESOURCE TYPES",
      expectedHeadingLevel: "H5"
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

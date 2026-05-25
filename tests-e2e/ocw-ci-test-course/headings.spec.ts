import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

test(`Verify accessibility and semantic structure of headings`, async ({
  page,
  siteAlias
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
      expectedHeadingLevel: "H2"
    },
    {
      label:                "Instructors",
      expectedHeadingLevel: "H3"
    },
    {
      label:                "Departments",
      expectedHeadingLevel: "H3"
    },
    {
      label:                "As Taught In",
      expectedHeadingLevel: "H3"
    },
    {
      label:                "Level",
      expectedHeadingLevel: "H3"
    },
    {
      label:                "Topics",
      expectedHeadingLevel: "H3"
    },
    {
      label:                "Learning Resource Types",
      expectedHeadingLevel: "H3"
    }
  ]
  const coursePage = new CoursePage(page, siteAlias)
  await coursePage.goto("pages/assignments")

  for (const { label, expectedHeadingLevel } of headingsData) {
    const heading = page.getByRole("heading", { name: label })
    await heading.waitFor()
    const accessibleHeadingLevel = await heading.evaluate(node => node.tagName)
    expect(accessibleHeadingLevel).toBe(expectedHeadingLevel)
  }
})

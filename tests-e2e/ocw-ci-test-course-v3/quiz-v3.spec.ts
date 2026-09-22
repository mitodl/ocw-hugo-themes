import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

test.describe("Course v3 quiz", () => {
  test("quiz page loads with quiz content", async ({ page, siteAlias }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/quiz-demo")

    await expect(page.locator("body")).toContainText("Multiple Choice Quiz")
  })

  test("checking the correct answer reveals its checkmark, not the wrong answer's cross", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/quiz-demo")

    const correctChoice = page.locator(".multiple-choice-div", {
      hasText: "4"
    })
    const wrongChoice = page.locator(".multiple-choice-div", { hasText: "3" })

    await correctChoice.locator("input.multiple-choice-radio").click()
    await page.getByRole("button", { name: "Check" }).click()

    await expect(
      correctChoice.locator(".correctness-icon-correct")
    ).toBeVisible()
    await expect(wrongChoice.locator(".correctness-icon-wrong")).toBeHidden()
  })

  test("checking a wrong answer reveals its cross, not the correct answer's checkmark", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/quiz-demo")

    const correctChoice = page.locator(".multiple-choice-div", {
      hasText: "4"
    })
    const wrongChoice = page.locator(".multiple-choice-div", { hasText: "3" })

    await wrongChoice.locator("input.multiple-choice-radio").click()
    await page.getByRole("button", { name: "Check" }).click()

    await expect(wrongChoice.locator(".correctness-icon-wrong")).toBeVisible()
    await expect(
      correctChoice.locator(".correctness-icon-correct")
    ).toBeHidden()
  })

  test("Show Solution reveals the solution text and the correct answer's checkmark", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/quiz-demo")

    // A role+name locator would stop matching once the click flips the
    // button's accessible name to "Hide Solution", so target it by its
    // stable class instead.
    const showSolutionBtn = page.locator(".multiple-choice-show-button")
    const solution = page.locator(".multiple-choice-solution")
    await expect(solution).toBeHidden()

    await showSolutionBtn.click()

    await expect(solution).toBeVisible()
    await expect(solution).toContainText("4 is even.")
    await expect(
      page
        .locator(".multiple-choice-div", { hasText: "4" })
        .locator(".correctness-icon-correct")
    ).toBeVisible()
    await expect(showSolutionBtn).toHaveText("Hide Solution")

    await showSolutionBtn.click()
    await expect(solution).toBeHidden()
    await expect(showSolutionBtn).toHaveText("Show Solution")
  })

  test("selecting a new answer clears a previously-checked result", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/quiz-demo")

    const correctChoice = page.locator(".multiple-choice-div", {
      hasText: "4"
    })
    const wrongChoice = page.locator(".multiple-choice-div", { hasText: "3" })

    await wrongChoice.locator("input.multiple-choice-radio").click()
    await page.getByRole("button", { name: "Check" }).click()
    await expect(wrongChoice.locator(".correctness-icon-wrong")).toBeVisible()

    await correctChoice.locator("input.multiple-choice-radio").click()
    await expect(wrongChoice.locator(".correctness-icon-wrong")).toBeHidden()
  })
})

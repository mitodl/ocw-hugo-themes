import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"


test('test', async ({ page }) => {
  await page.goto('https://ocw.mit.edu/courses/24-912-black-matters-introduction-to-black-studies-spring-2017/');
  await expect(page.getByRole('button', { name: 'Subsections for Instructor' })).toBeVisible();
  await page.getByRole('button', { name: 'Subsections for Instructor' }).click();
  await expect(page.getByRole('button', { name: 'Subsections for Instructor' })).toBeVisible();
  await page.getByRole('button', { name: 'Subsections for Instructor' }).click();
});


test('Navigation Item with Dropdown', async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto()
 
  const navItems = await page.$$('li.course-nav-list-item');


  for (const navItem of navItems) {

    const href = await navItem.$eval('a.nav-link', a => a.getAttribute('href'));
    expect(href, 'Nav item should have href').not.toBe(null);

    const expandButton = await navItem.$('.course-nav-section-toggle');

    if (expandButton) {
      expect(await expandButton.isVisible(), 'Expand button should be visible').toBeTruthy();
      // expandButton.click();
    }

  }
});
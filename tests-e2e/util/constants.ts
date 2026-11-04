export const SOCIAL_LINKS = [
  ["facebook", /^https:\/\/www.facebook.com\/MITOCW\/?$/],
  ["instagram", /^https:\/\/www.instagram.com\/mitocw\/?$/],
  ["x (formerly twitter)", /^https:\/\/twitter.com\/MITOCW\/?$/],
  ["youtube", /^https:\/\/www.youtube.com\/mitocw\/?$/],
  ["linkedin", /^https:\/\/www.linkedin.com\/company\/mit-opencourseware\/?$/]
]

/**
 * Accessible name of course-v3's leaving-the-site <dialog> (its heading). v2
 * keeps base-theme's "You are leaving MIT OpenCourseWare".
 *
 * Shared, not repeated, because several specs assert this dialog is *hidden*,
 * and Playwright's toBeHidden() also passes when nothing matches. With a stale
 * copy of the title those checks pass while testing nothing. Keeping it here
 * means the specs that assert it is visible fail first.
 */
export const V3_EXTERNAL_LINK_DIALOG_TITLE = "You are leaving MIT Learn"

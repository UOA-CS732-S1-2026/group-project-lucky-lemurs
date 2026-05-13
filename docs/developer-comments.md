# Developer Comments

These comments capture small implementation notes for future maintenance.

1. Comment: Keep API endpoint paths stable so frontend routes do not need per-page URL fixes.
2. Comment: Keep authentication token handling centralized in the shared API client.
3. Comment: Prefer backend validation errors that name the affected request field.
4. Comment: Keep seed data readable because quiz content is reviewed by non-backend teammates.
5. Comment: Avoid committing real database credentials into tracked example files.
6. Comment: Keep local environment files out of Git history.
7. Comment: Use `server/.env.example` only for placeholder configuration.
8. Comment: Keep `server/.env` as the runtime source for local backend configuration.
9. Comment: Keep CORS configuration explicit when deploying outside local development.
10. Comment: Keep Vite API URL configuration in `client/.env.example` aligned with backend ports.
11. Comment: Normalize API base URLs before joining paths.
12. Comment: Avoid duplicating auth header logic across individual pages.
13. Comment: Keep protected route behavior consistent for quiz and achievement pages.
14. Comment: Guest routes should redirect logged-in users away from login and register pages.
15. Comment: Quiz pages should treat backend session IDs as opaque values.
16. Comment: Building IDs should match seed data exactly.
17. Comment: Image paths in seed data should stay relative to the backend static root.
18. Comment: Static building images are served by the Nest backend public folder.
19. Comment: Avatar file names should match the exact case expected by the frontend.
20. Comment: Keep leaderboard scoring logic on the backend.
21. Comment: Frontend score displays should format backend values without recalculating rankings.
22. Comment: Keep quiz progress writes in backend services so user state remains consistent.
23. Comment: Review endpoints should return enough context for answer explanations.
24. Comment: Test mode should reuse quiz session concepts where possible.
25. Comment: Eliminate-options logic should remain server-authoritative.
26. Comment: Coin deduction should be performed by backend code only.
27. Comment: The frontend should display remaining coins from the backend response.
28. Comment: Keep DTO files small and focused on request validation.
29. Comment: Keep schema defaults close to the field definitions they affect.
30. Comment: Prefer descriptive enum values for quiz modes and building states.
31. Comment: Keep seed scripts idempotent where possible.
32. Comment: Seed scripts should be safe to rerun during local testing.
33. Comment: Avoid mixing generated debug data with reusable seed content.
34. Comment: Keep API contract docs aligned with controller routes.
35. Comment: Update README setup steps when ports or env variable names change.
36. Comment: Keep frontend page imports explicit so route ownership stays visible.
37. Comment: Error boundaries should catch rendering failures without hiding API errors.
38. Comment: Use shared helpers for API URL resolution instead of page-level string joins.
39. Comment: Keep CSS page files scoped by page name.
40. Comment: Avoid large unrelated style rewrites when fixing one page.
41. Comment: Mobile layout rules should be checked on quiz, review, and leaderboard pages.
42. Comment: Buttons should stay large enough for touch input on small screens.
43. Comment: Navigation labels should remain short enough for mobile headers.
44. Comment: Long question text should wrap cleanly inside the question card.
45. Comment: Answer options should not depend on fixed text lengths.
46. Comment: Explanation text should remain readable after answer submission.
47. Comment: Modal content should scroll inside the viewport on mobile.
48. Comment: Review grids should reduce columns on narrow screens.
49. Comment: Leaderboard podium layout should stack on very narrow screens.
50. Comment: Auth forms should keep input labels close to their fields.
51. Comment: Keep form validation feedback visible without page jumps.
52. Comment: Use backend error messages when they are specific and user-safe.
53. Comment: Avoid exposing raw exception traces to frontend users.
54. Comment: Keep global exception formatting stable for API consumers.
55. Comment: Tests should cover service behavior before controller formatting details.
56. Comment: Service tests should avoid real network and database dependencies.
57. Comment: Controller tests should verify auth guards only where route protection matters.
58. Comment: Keep e2e tests focused on critical user flows.
59. Comment: Avoid adding test data that conflicts with seed IDs.
60. Comment: Keep test names close to the user behavior being verified.
61. Comment: Build output should not be committed.
62. Comment: Node dependency changes should include the matching lockfile updates.
63. Comment: Avoid running audit fixes without checking their package impact.
64. Comment: Keep package scripts consistent between README and package files.
65. Comment: Use plain commit messages that describe the actual change.
66. Comment: Do not include tool or assistant branding in commit messages.
67. Comment: Keep branches current with `main` before adding small maintenance commits.
68. Comment: Stash local env edits before pulling remote changes.
69. Comment: Confirm staged files before committing when sensitive config files are modified.
70. Comment: Use `git diff --cached --name-status` to verify commit scope.
71. Comment: Check the commit author email before pushing contributor-related commits.
72. Comment: Prefer GitHub noreply email when privacy is enabled.
73. Comment: Do not rewrite shared branch history just to adjust old contribution attribution.
74. Comment: Let GitHub refresh contributor data after pushing new commits.
75. Comment: Keep frontend assets in predictable folders.
76. Comment: Keep backend public assets in predictable folders.
77. Comment: Use lowercase asset names when new code expects lowercase paths.
78. Comment: Keep image references synchronized between seed data and filesystem names.
79. Comment: Avoid loading large images from the client bundle when backend static serving is available.
80. Comment: Keep API response shapes stable once frontend pages depend on them.
81. Comment: Add optional fields carefully so older pages can tolerate missing values.
82. Comment: Prefer null-safe reads in frontend pages for backend data loaded asynchronously.
83. Comment: Loading states should be visible before protected data is available.
84. Comment: Empty states should guide users back to available quiz flows.
85. Comment: Achievement displays should not assume every user has progress records.
86. Comment: Leaderboard displays should handle fewer than three users.
87. Comment: Quiz start flows should handle missing or locked buildings.
88. Comment: Result pages should handle direct navigation without full session context.
89. Comment: Review pages should handle missing explanations gracefully.
90. Comment: Keep user profile updates limited to allowed DTO fields.
91. Comment: Avoid trusting client-submitted score or progress values.
92. Comment: Store derived leaderboard entries from trusted backend session results.
93. Comment: Keep password handling inside the auth service.
94. Comment: JWT payload fields should stay minimal.
95. Comment: Current-user decorators should hide request object details from controllers.
96. Comment: Route guards should stay reusable across protected modules.
97. Comment: Keep helper utilities small and easy to unit test.
98. Comment: Prefer explicit imports over deep relative shortcuts until aliases are configured.
99. Comment: Keep lint configuration aligned with the TypeScript version in use.
100. Comment: Keep generated coverage and cache folders ignored by Git.
101. Comment: Avoid adding comments that restate obvious code.
102. Comment: Add comments when they explain cross-file behavior or deployment assumptions.
103. Comment: Keep documentation notes close to the feature they describe when practical.
104. Comment: Use docs files for broad maintenance notes instead of crowding runtime code.
105. Comment: Keep all placeholder secrets clearly marked as placeholders.
106. Comment: Confirm backend startup after changing env variable names.
107. Comment: Confirm frontend startup after changing Vite env variables.
108. Comment: Keep smoke checks small enough to run during handoff.
109. Comment: Record ports and local URLs in handoff notes when teammates need to test quickly.
110. Comment: Revisit these comments when the project structure changes significantly.

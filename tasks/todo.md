# Task: Resolve SQL Autocomplete Casing and Global Visibility

## Completed Tasks
- [x] Analyze autocomplete mechanism in CodeMirror SQL language extension and PGlite database setup.
- [x] Parse original table and column name casing from the `schema` metadata field of the current question.
- [x] Populate `schemaForAutocomplete` with original-casing, lowercase, and uppercase versions of the table names and original casing of the columns.
- [x] Implement a custom global autocomplete provider `schemaAutocomplete` in `SqlEditor.tsx` that triggers on global table and column completion.
- [x] Prevent custom global completion from overriding default qualified (e.g. `table.column`) completion by returning `null` if a dot (`.`) is present immediately before the word.
- [x] Verify autocomplete dropdown displays `DepartmentId` when typing `SELECT d` on Question 5 in the browser.
- [x] Fix database schema sample rows rendering in `QuestionPanel.tsx` by implementing case-insensitive lookup on the raw rows returned by PGlite (resolving the issue where preserving column casing in the schema model resulted in `NULL` values in the UI due to PostgreSQL's lowercase key folding).
- [x] Remove the database schema and individual table collapsible states (as requested, keeping the schema static).
- [x] Implement a collapsible left column (Question & Schema panel) that folds to the left.
- [x] Add a header toolbar toggle button with visual states (PanelLeftClose/PanelLeftOpen) and smooth hover triggers to collapse/expand the left panel.
- [x] Add a solid vertical divider line (`lg:border-r lg:border-solid lg:border-gray-700/60`) to the right of the collapsible panel for clear visual separation.
- [x] Refactor workspace container to a split-pane layout with a vertical border touching the header (going all the way to the top of the content container) and independent scrolling columns.

## Review & Validation
- Verified via browser automation that:
  - Autocomplete shows correctly cased `DepartmentId` at the top of suggestions when typing `d`.
  - The query compiles and runs successfully.
  - The results comparator correctly evaluates raw integers/decimals against expected formatted values.
  - Database schema sample data table renders the actual values (e.g. `10`, `5000` for employee columns) instead of `NULL`s.
  - Clicking the toolbar collapse button folds the entire left panel (Question, Database Schema, Expected Output) off-screen.
  - When collapsed, the right SQL editor panel and results output expand dynamically to utilize the full screen width (`lg:col-span-12`).
  - Clicking the button again expands the left panel back to its default layout width smoothly.
  - The vertical divider line now touches the header border directly and goes all the way to the bottom of the viewport with no padding gaps.
  - The header is split vertically, allowing the divider line to cut straight through the header to the very top edge of the window, perfectly aligning with the column separator below.
  - The left and right panels scroll independently, preserving editor focus.
  - All scrollbar tracks throughout the application (editor, schema panel, problem list) are dark/transparent with a low-profile gray thumb instead of a white background.

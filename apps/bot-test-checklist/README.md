# Bot Test Checklist

A small, responsive task checklist built with standalone HTML, CSS, and plain JavaScript. No dependencies, build tools, accounts, or network requests.

## Run

Open `index.html` directly in a modern browser. Keep `styles.css` and `script.js` in the same folder.

## Features

- Add a task with the **Add task** button or Enter.
- Mark tasks complete or incomplete using their checkbox or text.
- Delete individual tasks using their trash button.
- See the remaining and completed counts update immediately.
- Retain tasks through browser reloads with localStorage when available.
- Use keyboard navigation and labeled controls.

The checklist starts empty. Blank or whitespace-only tasks are rejected, and task text is limited to 200 characters. Text is displayed literally, not interpreted as HTML.

Storage is local to the browser and page origin; it does not sync between devices. Local file storage behavior varies by browser. If storage is unavailable, the checklist still works for the current session.

## Manual end-to-end test

1. Open `index.html` with no previously saved tasks. Confirm the empty state and **0 remaining**.
2. Submit a blank task. Confirm the validation message and that no task is added.
3. Add `First task` using the button. Confirm **1 remaining**.
4. Add `Second task` using Enter. Confirm **2 remaining**.
5. Check `First task`. Confirm strikethrough styling, **1 remaining**, and **1 of 2 completed**.
6. Uncheck it. Confirm **2 remaining**.
7. Reload. If browser storage is available, confirm both tasks remain.
8. Delete both tasks. Confirm the empty state and **0 remaining**.
9. Use Tab, Enter, and Space to verify keyboard operation.

## Files

- `index.html` — Semantic page structure.
- `styles.css` — Responsive layout, task states, and focus styling.
- `script.js` — Task operations, counts, validation, and persistence.

# BJ Technologies CRM

The CRM runs entirely in the browser; it does not require a backend or database.
Sign in with any email address and password to open a local session. Contacts,
companies, deals, employees, tasks, and profile details are saved in this browser's
`localStorage`, scoped to the signed-in email address.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run build` to create the production site in `dist/`. Deploy the
contents of `dist/` to any static hosting provider. All application routes
should be rewritten to `index.html` for direct navigation and page refreshes.

Local CRM data stays on this device and is not synchronized or backed up. Clear
this browser's site data to remove it.

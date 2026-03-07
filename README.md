# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Project-specific Notes

Create a `.env` file in the project root with the usual Supabase settings plus an admin password for the built‑in login:

```ini
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_ADMIN_PASSWORD=your_secure_admin_password
```

The development server must be restarted when env variables change. Share the value of `VITE_ADMIN_PASSWORD` only with authorized personnel.

## Authentication & Security

- **Admin Authentication**: All admin features (Admin Panel, Department Management, Excel Import) now require authentication
- **Environment-based Credentials**: Admin password is stored securely in environment variables
- **Protected Routes**: Users cannot access admin features without proper authentication
- **Session Management**: Authentication state is maintained across browser sessions
- **Automatic Logout**: Logout functionality available in admin areas

## Admin Features

- **User Management**: View, approve, reject, and edit user registrations
- **Department Management**: Manage departments and assignments (requires authentication)
- **Excel Import**: Bulk import user data (requires authentication)
- **Data Export**: Export all system data to CSV files (requires authentication)
- **Event Management**: Create and manage events

Registration logic now prevents multiple signups using the same phone number; the page will alert if a duplicate is detected before attempting to write to the database.

> **Tip:** For true security add a unique index/constraint on the `phone_number` column in your Supabase `users` table so the database rejects duplicates server-side as well.

# Frontend architecture

The project currently contains infrastructure only. No backend feature is
consumed until its UI flow is selected.

- `app/`: global providers and application wiring.
- `components/`: reusable presentational components.
- `features/`: domain modules added one at a time (auth, patients, etc.).
- `layouts/`: public, patient and staff shells.
- `lib/`: framework-agnostic API, auth, query and utility code.
- `pages/`: route-level composition only.
- `types/`: shared and OpenAPI-generated contracts.
- `test/`: global test configuration.

Each future feature should keep its API calls, schemas, hooks and components in
one folder under `features/` instead of putting business logic in pages.

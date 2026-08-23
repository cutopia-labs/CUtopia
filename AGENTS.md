# Repository Guidelines

## Project Structure & Module Organization

CUtopia is a Yarn 1/Lerna monorepo. `frontend/` contains the Next.js app: routes live in `src/pages`, UI in `src/components`, MobX stores in `src/store`, and assets in `public`. `backend/mongodb/` owns Mongoose models, controllers, and tests; `backend/lambda/` contains GraphQL and supporting AWS functions. Shared contracts and validation rules belong in `types/src`. Utilities and the Python scraper are under `tools/`; course data comes from the `data` submodule.

## Build, Test, and Development Commands

- `yarn bootstrap` installs dependencies, builds shared types, initializes data, and prepares all packages.
- `yarn fe dev` starts the Next.js development server.
- `yarn be watch`, followed by `yarn be dev` in another terminal, rebuilds backend files and runs the local GraphQL server.
- `yarn build:fe` creates the exported production frontend in `frontend/build`.
- `yarn test` runs all Jest suites; `yarn test backend/ --runInBand` runs MongoDB tests serially.
- `yarn fe lint` and `yarn be lint` check frontend and backend source respectively.

Run commands from the root. Local backend work requires MongoDB; bootstrap creates placeholder environment files.

## Coding Style & Naming Conventions

Follow ESLint and Prettier: two-space indentation, single quotes, semicolons, ES5 trailing commas, and alphabetized import groups. React components and stores use PascalCase filenames (`PlannerStore.ts`, `ReviewCard.tsx`); helpers, resolvers, and models use camelCase. Keep GraphQL schemas grouped by domain in `backend/lambda/graphql/src/schemas`. Run lint before committing; Husky/lint-staged auto-fixes staged JS/TS files.

## Testing Guidelines

Jest with `ts-jest` is the primary test framework. Name tests `*.test.ts`; shared-type tests sit beside source, while database integration tests live in `backend/mongodb/src/jest`. Add focused coverage for changed validation rules or controllers. Database suites use `ATLAS_JEST_URI` and may clear test collections, so never point it at production data. No numeric coverage threshold is enforced.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit-style subjects such as `feat(web): ...`, `fix(server): ...`, `docs: ...`, and `chore: data update`. Keep commits imperative and narrowly scoped. Open an issue first for substantial work, limit each PR to one feature or fix, and target the `dev` branch. Include a clear description, linked issue, verification commands, and screenshots for visible UI changes.

## Security & Configuration

Never commit `.env` files, Atlas URIs, AWS credentials, email tokens, or generated JWT keys. Use the placeholders created by `yarn be bootstrap`, and keep production deployment changes explicit and reviewed.

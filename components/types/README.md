# components/types/

Shared TypeScript types for copy-ready components: `agent-composer`, `agent-run`, `model-router`, and cross-cutting shapes in `shared.ts` / `index.ts`.

If a component imports from `@/components/types/*`, that file is part of its copy surface. Keep types here only when more than one component shares the shape; single-component types belong in the component file.

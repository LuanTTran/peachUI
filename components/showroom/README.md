# components/showroom/

Doc-site chrome: the machinery that renders catalog pages (doc entry layout, source panel, previews, theme toggle plumbing).

None of this ships to consumers, and nothing under `components/atoms|primitives|blocks` may import from here. If you're changing how doc pages look, this is the place. If you're changing a component, it isn't.

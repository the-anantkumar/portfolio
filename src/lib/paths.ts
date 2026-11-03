// Astro prefixes bundled assets; authored links and public assets need the same base.
export const withBase = (path = "") =>
  `${import.meta.env.BASE_URL.replace(/\/?$/, "/")}${path.replace(/^\/+/, "")}`;

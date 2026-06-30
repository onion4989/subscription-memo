/** When true, pages emit noindex and robots.txt disallows all crawlers. */
export function shouldBlockSearchIndexing(): boolean {
  return process.env.BLOCK_SEARCH_INDEXING === "true";
}

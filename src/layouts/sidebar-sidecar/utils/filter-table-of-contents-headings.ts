import { TableOfContentsHeading } from '../components/table-of-contents'

/**
 * Filter headings for display in table of contents.
 *
 * - Retain headings that are <h1> or <h2>
 * 	- Headings <h3> through <h6> are filtered out.
 * - Retain headings that are not nested in <Tabs />
 * 	- Headings with `tabbedSectionDepth !== 0` are filtered out.
 */
export function filterTableOfContentsHeadings(
	headings: TableOfContentsHeading[]
): TableOfContentsHeading[] {
	return headings.filter((heading: TableOfContentsHeading) => {
		const { level, tabbedSectionDepth } = heading
		/**
		 * Only include <h2> in the table of contents.
		 *
		 * Note that <h1> are also included, this is as a stopgap
		 * while we implement content conformance that ensures there is
		 * exactly one <h1> per page (which we would likely not include here).
		 */
		if (level > 2) {
			return false
		}
		/**
		 * Only include headings that are *outside* of <Tabs />.
		 *
		 * In other words, the `tabbedSectionDepth` must be 0 for a heading
		 * to be included in the table of contents.
		 */
		if (typeof tabbedSectionDepth === 'number' && tabbedSectionDepth !== 0) {
			return false
		}
		/**
		 * Return true for headings that have not been filtered out
		 * by previous criteria.
		 */
		return true
	})
}
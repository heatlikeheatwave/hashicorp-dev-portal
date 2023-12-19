/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { isProductSlug } from 'lib/products'
// @TODO create an alias for root dir
import { HVD_CONTENT_DIR } from '../../../scripts/extract-hvd-content'
import { HvdCategoryGroup } from './types'
import { ValidatedDesignsGuideProps } from './guide'
import { ValidatedDesignsLandingProps } from '.'

import { serialize } from 'next-mdx-remote/serialize'

const basePath = '/validated-designs'

function loadMetadata(path: string): { title: string; description: string } {
	try {
		const data = yaml.load(
			fs.readFileSync(path, {
				encoding: 'utf-8',
			})
		) as { title: string; description: string }
		return data
	} catch (e) {
		console.error(
			'[Error: HVD template] Unable to parse yaml metadata file ',
			e
		)
	}
}

export function getHvdCategoryGroups(): HvdCategoryGroup[] | null {
	let hvdRepoContents

	try {
		console.info('[HVD]: reading from content directory ', HVD_CONTENT_DIR)
		hvdRepoContents = fs.readdirSync(HVD_CONTENT_DIR, {
			recursive: true,
			encoding: 'utf-8',
		})
	} catch (e) {
		/**
		 * When authors are running locally from content repos,
		 * we want to ignore errors.
		 *
		 * In all other scenarios, we want errors related to HVD content to
		 * surface. This does mean that anyone running `hashicorp/dev-portal`
		 * locally will need to have a valid `GITHUB_TOKEN`.
		 */
		if (process.env.IS_CONTENT_PREVIEW) {
			console.error(
				`[Error]: HVD content was not found, and will not be built. If you need to work on HVD content, please ensure a valid GITHUB_TOKEN is present in your environment variables. Error: ${e}`
			)
		} else {
			// TODO uncomment this to throw once the content migration is done in
			// https://github.com/hashicorp/hvd-docs/pull/2/
			// throw e
			console.error(e)
		}

		return null
	}

	if (!hvdRepoContents) {
		return null
	}

	const configFiles = hvdRepoContents.filter((item: string) =>
		item.endsWith('.yaml')
	)

	/**
	 * We need to find the category and hvd guides within a category
	 * We'll target the index.yaml files in the root of both category and hvd guide directories
	 *
	 * Then we build the category groups based on the contents of the metadata files.
	 * Each category should have an array of guides associated with it.
	 * There should be one category metadata file, but many guide metadata files.
	 *
	 * Note, is a spike and the code could be cleaned up / reformatted as per the needs of the view!
	 */
	const hvdCategoryGroups: HvdCategoryGroup[] = []
	configFiles.forEach((item: string) => {
		// Expected fs structure /<product>/<category>/<hvdGuide>
		// e.g. terraform/operation-guides/adoption
		const pathParts = item.split('/')
		const [product, category] = pathParts

		if (!isProductSlug(product)) {
			return
		}

		// We assume category config files have 3 path parts, and hvd guide configs have 4 parts
		const isCategoryMetadata = pathParts.length === 3
		const isHvdMetadata = pathParts.length === 4

		const slug = `${product}-${category}`
		if (isCategoryMetadata) {
			const { title, description } = loadMetadata(
				path.join(HVD_CONTENT_DIR, item)
			)

			hvdCategoryGroups.push({
				slug,
				title,
				description,
				product,
				guides: [],
			})
		} else if (isHvdMetadata) {
			const { title, description } = loadMetadata(
				path.join(HVD_CONTENT_DIR, item)
			)

			// find the existing HvdCategoryGroup, because we traverse the files in order the HvdCategoryGroup YAML will always come before the HvdGuide YAML
			const categoryGroup = hvdCategoryGroups.find(
				(categoryGroup: HvdCategoryGroup) => {
					return categoryGroup.slug === slug
				}
			)

			const guideSlug = pathParts[2]
			const categorySlug = `${slug}-${guideSlug}`

			// build the category group
			const pagesPath = path.join(product, category, guideSlug)
			const pagesFiles = hvdRepoContents.filter((path: string) => {
				return path.includes(pagesPath) && path.endsWith('.mdx')
			})
			const pages = pagesFiles.map((pagePath: string) => {
				const pagePathParts = pagePath.split('/')
				const pageFile = pagePathParts[pagePathParts.length - 1]

				const slug = pageFile
					.replace('.mdx', '')
					.substring(pageFile.indexOf('-') + 1)

				return {
					slug,
					title: slug.replaceAll('-', ' '),
					filePath: path.join(HVD_CONTENT_DIR, pagePath),
					href: `${basePath}/${categorySlug}/${slug}`,
				}
			})

			categoryGroup.guides.push({
				slug: categorySlug,
				title,
				description,
				href: `${basePath}/${categorySlug}`,
				pages,
			})
		}
	})

	return hvdCategoryGroups
}

export function getHvdCategoryGroupsPaths(): string[][] | null {
	const categoryGroups = getHvdCategoryGroups()

	if (!categoryGroups) {
		return null
	}
	// [[guide-slug], [guide-slug, page-slug]]
	// e.g. [[terraform-operation-guide-adoption], [terraform-operation-guide-adoption, page-slug]]
	const paths = []
	for (const categoryGroup of categoryGroups) {
		for (const guide of categoryGroup.guides) {
			paths.push([guide.slug])
			for (const page of guide.pages) {
				paths.push([guide.slug, page.slug])
			}
		}
	}

	return paths
}

// @TODO: calculate the actual url from the headers
function getMarkdownHeaders(markdown: string) {
	const headerRegex = /^(#{1,6})\s*(.+)/gm
	let match
	const headers = []

	while ((match = headerRegex.exec(markdown)) !== null) {
		headers.push({
			title: match[2].trim(),
			url: '#test',
		})
	}

	return headers
}

export async function getHvdGuidePropsFromSlugs(
	slugs: string[] | null
): Promise<ValidatedDesignsGuideProps> {
	const categoryGroups = getHvdCategoryGroups()

	if (!categoryGroups) {
		return null
	}

	const [guideSlug, pageSlug] = slugs

	const validatedDesignsGuideProps = {
		title: '',
		mdxSource: null,
		categorySlug: '',
		headers: [],
		currentPageIndex: 0,
		basePath,
		pages: [],
	}

	let foundGuide = false
	for (const categoryGroup of categoryGroups) {
		for (const guide of categoryGroup.guides) {
			if (guide.slug === guideSlug) {
				validatedDesignsGuideProps.categorySlug = categoryGroup.slug

				for (let index = 0; index < guide.pages.length; index++) {
					const page = guide.pages[index]

					// If no pageSlug is provided, default to the first page
					if (page.slug === pageSlug || (!pageSlug && index === 0)) {
						validatedDesignsGuideProps.title = page.title
						const content = fs.readFileSync(page.filePath, 'utf8')

						const headers = getMarkdownHeaders(content)
						// @TODO: this does not add IDs to the headers, figure out why
						const mdxSource = await serialize(content)

						validatedDesignsGuideProps.headers = headers
						validatedDesignsGuideProps.mdxSource = mdxSource
						validatedDesignsGuideProps.currentPageIndex = index
					}

					validatedDesignsGuideProps.pages.push(page)
				}

				foundGuide = true
				break
			}
			if (foundGuide) {
				break
			}
		}
	}

	return validatedDesignsGuideProps
}

export function getHvdLandingProps(): ValidatedDesignsLandingProps | null {
	// @TODO — the title and description should be sourced from the content repo
	const categoryGroups = getHvdCategoryGroups()

	if (!categoryGroups) {
		return null
	}

	return {
		title: 'HashiCorp Validated Designs',
		description:
			'@TODO lorem ipsum the rain in Spain stays mainly in the plains.',
		categoryGroups: getHvdCategoryGroups(),
	}
}
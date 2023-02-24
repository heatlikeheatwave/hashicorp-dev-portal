/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import fs from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import { StatusCodes } from 'http-status-codes'

import { validateToken } from 'lib/api-validate-token'
import { getAllCollections } from 'lib/learn-client/api/collection'
import {
	Collection as ClientCollection,
	TutorialLite as ClientTutorialLite,
} from 'lib/learn-client/types'
import { activeProductSlugs } from 'lib/products'
import { SectionOption } from 'lib/learn-client/types'
import { getTutorialSlug } from 'views/collection-view/helpers'
import { getCollectionSlug } from 'views/collection-view/helpers'
import { ProductSlug } from 'types/products'

const BATCH_SIZE = 10

/**
 * Accepts a POST request, triggers revalidation for all tutorial paths for all products
 * landing pages, collection pages, and tutorial pages associated
 */
async function handler(request: NextApiRequest, response: NextApiResponse) {
	if (request.method !== 'POST') {
		response.status(StatusCodes.NOT_FOUND)
		return
	}

	try {
		const tutorialLandingPaths = getTutorialLandingPaths()
		const collectionAndTutorialPaths = await getCollectionAndTutorialPaths()
		const paths = [...tutorialLandingPaths, ...collectionAndTutorialPaths]

		if (!paths || paths.length === 0) {
			response.status(200).end()
		}

		// Loop over all paths to revalidate
		// We have to use a for loop here and cannot use a map, as map
		// runs all map functions in parallel
		let batchRevalidatePromises = []
		for (let i = 0; i < paths.length; i++) {
			// The current file's path
			const path = paths[i].path

			// batch our promises
			console.log('[Revalidate]', path)
			batchRevalidatePromises.push(response.revalidate(path))

			// flush the batch every N paths, or at the end of the loop
			if (
				batchRevalidatePromises.length >= BATCH_SIZE ||
				i >= paths.length - 1
			) {
				await Promise.allSettled(batchRevalidatePromises)
				batchRevalidatePromises = []
			}
		}

		response.status(200).end()
	} catch (e) {
		// If there was an error, Next.js will continue
		// to show the last successfully generated page
		console.error('Error revalidating ', e)
		return response.status(500).send('Error revalidating')
	}
}

function getTutorialLandingPaths(): string[] {
	const paths = []

	// build all product tutorial landing paths
	activeProductSlugs.forEach((productSlug: ProductSlug) => {
		paths.push(`/${productSlug}/tutorials`)
	})

	// for waf and onboarding routes that are top level
	Object.values(SectionOption).forEach((slug: SectionOption) => {
		paths.push(`/${slug}`)
	})

	return paths
}

async function getCollectionAndTutorialPaths() {
	const collectionPaths = []
	const tutorialPaths = []
	const allCollections = await getAllCollections()

	allCollections.forEach((collection: ClientCollection) => {
		// build collection path
		collectionPaths.push(getCollectionSlug(collection.slug))

		// build tutorial path
		collection.tutorials.forEach((tutorial: ClientTutorialLite) => {
			tutorialPaths.push(getTutorialSlug(tutorial.slug, collection.slug))
		})
	})

	return [...collectionPaths, ...tutorialPaths]
}

export default validateToken(handler, {
	token: process.env.REVALIDATE_TOKEN,
	onlyMethods: ['POST'],
})

/**
 * Testing Playground --------------------------------------
 * write as out file to test the output
 *
 *  TODO check on the cloud / theme handling
 */
;(async function main() {
	const tutorialLandingPaths = getTutorialLandingPaths()
	const collectionAndTutorialPaths = await getCollectionAndTutorialPaths()
	const paths = [
		...tutorialLandingPaths,
		'BREAK FOR COLLECTION AND TUTORIAL PATHS *****',
		...collectionAndTutorialPaths,
	]

	fs.writeFileSync('all-tutorial-paths.json', JSON.stringify(paths), {
		encoding: 'utf-8',
	})
})()

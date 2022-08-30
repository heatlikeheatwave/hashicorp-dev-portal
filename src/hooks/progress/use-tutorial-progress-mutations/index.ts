import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthentication from 'hooks/use-authentication'
import {
	createTutorialProgress as createTutorialProgressApi,
	updateTutorialProgress as updateTutorialProgressApi,
} from 'lib/learn-client/api/progress'
import { progressPercentToLabel } from 'lib/learn-client/api/progress/formatting'
import {
	TutorialProgressMutationVariables,
	TutorialProgressArgs,
	UseTutorialProgressMutationsResult,
} from './types'
import { ApiCollectionTutorialProgress } from 'lib/learn-client/api/api-types'

/**
 * Mutate tutorial progress.
 *
 * Returns `createTutorialProgress` and `updateTutorialProgress`
 * mutation functions.
 *
 * Each of these functions accepts a single object argument:
 * `{ tutorialId, collectionId, completePercent }` (and, optionally, `options`)
 * and creates or updates the tutorial with the provided completePercent.
 */
const useTutorialProgressMutations = (): UseTutorialProgressMutationsResult => {
	const queryClient = useQueryClient()
	const { session } = useAuthentication()
	const accessToken = session?.accessToken

	/**
	 * When a mutation is successful, we set the associated query data.
	 * TODO: once there are other queries, we'll need to invalidate those as well.
	 */
	const makeOnMutationSuccess = () => {
		return (
			_result: ApiCollectionTutorialProgress,
			mutationVariables: TutorialProgressMutationVariables
		) => {
			// Pull variables we need to update related queries
			const { tutorialId, collectionId, completePercent } = mutationVariables
			// Update query data for this specific tutorial-in-collection progress
			const progressLabel = progressPercentToLabel(completePercent)
			queryClient.setQueryData(
				['tutorialProgressSpecificCollection', tutorialId, collectionId],
				progressLabel
			)
		}
	}

	/**
	 * Mutation to create tutorial progress.
	 */
	const createTutorialProgressMutation = useMutation(
		createTutorialProgressApi,
		{ onSuccess: makeOnMutationSuccess() }
	)
	/**
	 * Function to create tutorial progress.
	 *
	 * Note: The createTutorialProgress function needs to update when the
	 * accessToken or onSuccess option of createTutorialProgressMutation changes.
	 * We wrap this in useCallback to prevent more updates than necessary.
	 */
	const createTutorialProgress = useCallback(
		(args: TutorialProgressArgs) => {
			const { tutorialId, collectionId, completePercent, options } = args
			createTutorialProgressMutation.mutate(
				{ accessToken, tutorialId, collectionId, completePercent },
				options
			)
		},
		[createTutorialProgressMutation, accessToken]
	)

	/**
	 * updateTutorialProgressMutation
	 * TODO: add description here
	 */
	const updateTutorialProgressMutation = useMutation(
		updateTutorialProgressApi,
		{
			onSuccess: makeOnMutationSuccess(),
		}
	)
	/**
	 * TODO: object arg here is TutorialProgressArgs.
	 * But adding it causes a type error. Ditto when doing similar thing
	 * in use-bookmark-mutations. Need to investigate.
	 */
	const updateTutorialProgress = useCallback(
		(args: TutorialProgressArgs) => {
			const { tutorialId, collectionId, completePercent, options } = args
			updateTutorialProgressMutation.mutate(
				{ accessToken, tutorialId, collectionId, completePercent },
				options
			)
		},
		[updateTutorialProgressMutation, accessToken]
	)

	return { createTutorialProgress, updateTutorialProgress }
}

export type { UseTutorialProgressMutationsResult }
export { useTutorialProgressMutations }

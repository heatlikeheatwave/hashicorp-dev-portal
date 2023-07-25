import {
	OperationDetails,
	OperationExamples,
	OperationHeader,
	OperationSections,
} from '../'
import type {
	OperationGroup,
	OperationProps,
} from 'views/open-api-docs-view/types'
import s from './open-api-operations.module.css'
import { ReactNode } from 'react'

/**
 * Split a string on capital letters.
 *
 * Works like `string.split('')`, but splits on capital letters.
 *
 * TODO: split this out, put it somewhere else.
 */
function splitOnCapitalLetters(str: string): string[] {
	const lowerCased = str.toLowerCase()
	const result: string[] = []
	let buffer = ''
	for (let i = 0; i < str.length; i++) {
		/**
		 * If we have a lowercase character, add it to the buffer.
		 * If we have an uppercase character, add the buffer to the result,
		 * and reset the buffer.
		 */
		const isLowerCase = str[i] === lowerCased[i]
		if (isLowerCase) {
			buffer += str[i]
		} else {
			result.push(buffer)
			buffer = str[i]
		}
	}
	// Append any stray buffer, if it's non-empty
	if (buffer !== '') {
		result.push(buffer)
	}
	// Return the array of strings
	return result
}

/**
 * Given an array of strings,
 * Return the array with `<wbr />` elements inserted between each string.
 *
 * TODO: split this out, put it somewhere else.
 */
function addWordBreaks(stringArray: string[]): ReactNode[] {
	return stringArray
		.map((v: string, idx: number) => {
			// eslint-disable-next-line react/no-array-index-key
			return idx === 0 ? [v] : [<wbr key={idx} />, v]
		})
		.flat()
}

/**
 * Render operation items for an OpenApiView.
 *
 * TODO: implement this presentation component.
 */
export function OpenApiOperations({
	operationGroups,
}: {
	operationGroups: OperationGroup[]
}) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '24px',
				border: '1px solid magenta',
			}}
		>
			{operationGroups
				.map((group) => group.items)
				.flat()
				.map((operation: OperationProps) => {
					return (
						<div
							key={operation.operationId}
							style={{ border: '1px solid magenta', padding: '2px' }}
						>
							<OperationHeader
								className={s.header}
								slug={operation.slug}
								headerText={addWordBreaks(
									splitOnCapitalLetters(operation.operationId)
								)}
								method={operation.type}
								path={addWordBreaks(
									operation.path.truncated
										.split('/')
										.map((v, idx) => (idx === 0 ? [v] : ['/', v]))
										.flat()
								)}
							/>
							<OperationSections
								examplesSlot={<OperationExamples operation={operation} />}
								detailsSlot={<OperationDetails operation={operation} />}
							/>
						</div>
					)
				})}
		</div>
	)
}

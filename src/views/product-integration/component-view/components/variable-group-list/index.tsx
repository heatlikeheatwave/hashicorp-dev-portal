import { IconCornerDownRight16 } from '@hashicorp/flight-icons/svg-react/corner-down-right-16'
import classNames from 'classnames'
import Badge from 'components/badge'
import ReactMarkdown from 'react-markdown'
import s from './style.module.css'

export interface Variable {
	key: string
	type: string
	description?: string
	required: boolean | null
	variables?: Array<Variable> // User doesn't need to specify this
	highlight?: boolean // Default false
}

export interface VariableGroup {
	name: string
	variables: Array<Variable>
}

export interface VariableGroupListProps {
	variables: Array<Variable>
	unflatten?: boolean // Users should never set this to false, needed for recursive nesting
	isNested?: boolean
}

export function VariableGroupList({
	variables,
	unflatten = true,
	isNested = false,
}: VariableGroupListProps) {
	const vars: Array<Variable> = unflatten
		? unflattenVariables(variables)
		: variables

	return (
		<ul className={s.variableGroupList}>
			{vars.map((variable: Variable) => {
				return (
					<li
						key={variable.key}
						className={classNames(s.variableGroupListItem, {
							[s.highlight]: variable.highlight,
						})}
					>
						{isNested ? (
							<div className={s.arrowIcon}>
								<IconCornerDownRight16 />
							</div>
						) : (
							<></>
						)}
						<div className={s.indentedContent}>
							<div className={s.topRow}>
								<span className={s.left}>
									<code className={s.key}>{variable.key}</code>
									{variable.required != null && (
										<span
											className={classNames(s.required, {
												[s.isRequired]: variable.required,
											})}
										>
											{variable.required ? 'Required' : 'Optional'}
										</span>
									)}
								</span>
								{variable.type ? (
									<Badge color="highlight" text={variable.type} />
								) : (
									<></>
								)}
							</div>

							<div className={s.description}>
								<ReactMarkdown>{`${
									variable.description !== null ? variable.description : ''
								}`}</ReactMarkdown>
							</div>

							{variable.variables?.length > 0 && (
								<VariableGroupList
									unflatten={false}
									variables={variable.variables}
									isNested={true}
								/>
							)}
						</div>
					</li>
				)
			})}
		</ul>
	)
}

function unflattenVariables(variables: Array<Variable>): Array<Variable> {
	// Pull all of the root nodes out
	const rootNodes: Array<Variable> = []

	let maxDepth = 0
	variables
		.map((v: Variable) => v.key)
		.forEach((key: string) => {
			const keyDepth = key.split('.').length
			if (keyDepth > maxDepth) {
				maxDepth = keyDepth
			}
		})

	for (let depth = 1; depth - 1 < maxDepth; depth++) {
		// Fill out the Variables with 0 depth moving out
		for (let i = 0; i < variables.length; i++) {
			const cVar = variables[i]
			const segments = cVar.key.split('.')
			// Ensure that we're looking at only variables at our depth
			if (segments.length == depth) {
				// If it's a root node, push straight to the rootNodes
				if (segments.length == 1) {
					rootNodes.push(Object.assign({}, cVar))
				} else {
					// Figure out what variable has it
					let pointer: Variable
					for (let j = 0; j < segments.length - 1; j++) {
						const segment = segments[j]
						if (j == 0) {
							pointer = rootNodes.find((e: Variable) => e.key === segment)
							// A nested variable was defined without specifying the parent root variable
							// we need to create the parent object for appropriate nesting
							if (!pointer) {
								pointer = {
									type: 'category',
									required: null,
									key: segments.slice(0, j + 1).join('.'),
									variables: [],
								}
								rootNodes.push(pointer)
							}
						} else {
							const oldPointer = pointer
							pointer = pointer.variables.find((e: Variable) =>
								e.key.endsWith(`.${segment}`)
							)
							// A nested variable was defined without specifying the parent
							// we need to create the parent object for appropriate nesting
							if (!pointer) {
								pointer = {
									type: 'category',
									required: null,
									key: segments.slice(0, j + 1).join('.'),
									variables: [],
								}
								oldPointer.variables.push(pointer)
							}
						}
					}
					if (!pointer.variables) {
						pointer.variables = []
					}
					pointer.variables.push(Object.assign({}, cVar))
				}
			}
		}
	}
	return rootNodes
}

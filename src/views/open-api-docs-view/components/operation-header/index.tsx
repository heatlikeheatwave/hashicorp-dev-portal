import type { OperationProps } from 'views/open-api-docs-view/types'
import Badge from 'components/badge'
import s from './operation-header.module.css'
import classNames from 'classnames'

/**
 * Renders a header for an operation item,
 * showing the name of the operation in a linkable heading,
 * and showing other metadata such as the request type.
 */

interface OperationHeaderProps {
	slug: OperationProps['slug']
	headerText: OperationProps['operationId']
	method: string
	path: string
	className?: string
}

export function OperationHeader({
	slug,
	headerText,
	method,
	path,
	className,
}: OperationHeaderProps) {
	return (
		<div className={classNames(className, s.wrapper)}>
			<h3 id={slug} className={s.heading}>
				{headerText}
			</h3>
			<div className={s.methodAndPath}>
				<Badge type="outlined" text={method.toUpperCase()} />
				<p className={s.path}>{path}</p>
			</div>
		</div>
	)
}

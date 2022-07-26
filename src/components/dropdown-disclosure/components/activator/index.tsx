import classNames from 'classnames'
import { IconChevronDown16 } from '@hashicorp/flight-icons/svg-react/chevron-down-16'
import Button from 'components/button'
import { useDisclosureState } from 'components/disclosure'
import disclosureStyles from 'components/disclosure/disclosure.module.css'
import s from './activator.module.css'

const DropdownDisclosureActivator = ({
	'aria-label': ariaLabel,
	children,
	className,
	hideChevron = false,
}: $TSFixMe) => {
	const { contentContainerId, isOpen, toggleDisclosure } = useDisclosureState()

	const hasIcon = typeof children !== 'string'
	const isIconOnly = hasIcon && hideChevron
	const classes = classNames(disclosureStyles.activator, s.root, className, {
		[s.hasIcon]: hasIcon,
	})
	const buttonProps = {
		'aria-controls': contentContainerId,
		'aria-expanded': isOpen,
		'aria-label': ariaLabel,
		className: classes,
		onClick: toggleDisclosure,
	}

	if (typeof children === 'string') {
		return (
			<Button
				{...buttonProps}
				icon={hideChevron ? null : <IconChevronDown16 />}
				iconPosition={hideChevron ? undefined : 'trailing'}
				text={children}
			/>
		)
	} else {
		return (
			<button {...buttonProps}>
				<span className={s.childrenWrapper}>{children}</span>
				{!isIconOnly && (
					<span className={s.chevronWrapper}>
						<IconChevronDown16 />
					</span>
				)}
			</button>
		)
	}
}

export default DropdownDisclosureActivator

/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

// Third-party imports
import { ReactElement } from 'react'

// HashiCorp imports
import { IconExternalLink16 } from '@hashicorp/flight-icons/svg-react/external-link-16'
import { IconExternalLink24 } from '@hashicorp/flight-icons/svg-react/external-link-24'
import { IconInfo16 } from '@hashicorp/flight-icons/svg-react/info-16'
import CodeBlock from '@hashicorp/react-design-system-components/src/components/code-block'

// Global imports
import Heading from 'components/heading'
import InlineLink from 'components/inline-link'
import Text from 'components/text'
import { useCurrentProduct } from 'contexts'
import InlineAlert from 'components/inline-alert'
import MobileStandaloneLink from 'components/mobile-standalone-link'
import { ReleaseVersion } from 'lib/fetch-release-data'
import CardWithLink from '../card-with-link'
import s from './release-information.module.css'
import { ContentWithPermalink } from 'views/open-api-docs-view/components/content-with-permalink'
import classNames from 'classnames'
import viewStyles from 'views/product-downloads-view/product-downloads-view.module.css'
import capitalize from '@hashicorp/platform-util/text/capitalize'

const NoteCard = ({ selectedRelease }) => {
	const currentProduct = useCurrentProduct()
	const { name, shasums, shasums_signature, version } = selectedRelease
	return (
		<InlineAlert
			color="neutral"
			title="Note"
			description={
				<>
					You can find the{' '}
					<InlineLink
						href={`https://releases.hashicorp.com/${name}/${version}/${shasums}`}
						textSize={200}
					>
						SHA256 checksums for {currentProduct.name} {version}
					</InlineLink>{' '}
					online and you can{' '}
					<InlineLink
						href={`https://releases.hashicorp.com/${name}/${version}/${shasums_signature}`}
						textSize={200}
					>
						verify the checksums signature file
					</InlineLink>{' '}
					which has been signed using{' '}
					<InlineLink href="https://www.hashicorp.com/security" textSize={200}>
						{"HashiCorp's GPG key"}
					</InlineLink>
					. Complete this{' '}
					<InlineLink
						href="/well-architected-framework/operational-excellence/verify-hashicorp-binary"
						textSize={200}
					>
						tutorial
					</InlineLink>{' '}
					to learn how to install and verify HashiCorp tools on any Linux
					distribution.
				</>
			}
			icon={<IconInfo16 className={s.cardIcon} />}
		/>
	)
}

const ConsulNoteCard = (): ReactElement => {
	return (
		<InlineAlert
			className={s.armUserNote}
			color="neutral"
			title="Note for ARM users"
			description={
				<>
					<ul className={s.notesList}>
						<Text asElement="li" size={200} weight="regular">
							Use Arm for all 32-bit systems
						</Text>
						<Text asElement="li" size={200} weight="regular">
							Use Arm64 for all 64-bit architectures
						</Text>
					</ul>
					<Text
						className={s.codePrompt}
						asElement="p"
						size={100}
						weight="regular"
					>
						The following commands can help determine the right version for your
						system:
					</Text>
					<CodeBlock
						value="$ uname -m"
						language="shell-session"
						hasCopyButton
						hasLineNumbers={false}
					/>
					<CodeBlock
						className={s.codeBlock}
						value={`$ readelf -a /proc/self/exe | grep -q -c Tag_ABI_VFP_args && echo "armhf" || echo "armel"`}
						language="shell-session"
						hasCopyButton
						hasLineNumbers={false}
					/>
				</>
			}
			icon={<IconInfo16 className={s.cardIcon} />}
		/>
	)
}

const ChangelogNote = ({ selectedRelease }) => {
	const { name, version } = selectedRelease
	const capitalizedName = capitalize(name)

	return (
		<>
			<CardWithLink
				heading="Changelog"
				subheading={`${capitalizedName} Version: ${version}`}
				link={
					<MobileStandaloneLink
						ariaLabel={`${name} version ${version} changelog`}
						href={`https://github.com/hashicorp/${name}/releases/tag/v${version}`}
						size16Icon={<IconExternalLink16 />}
						size24Icon={<IconExternalLink24 />}
						iconPosition="trailing"
						opensInNewTab
						text="GitHub"
					/>
				}
			/>
		</>
	)
}

const EnterpriseLegalNote = () => {
	return (
		<InlineAlert
			title="Terms of use"
			description={
				<Text className={s.contentSubheading} size={200} weight="regular">
					The following shall apply unless your organization has a separately
					signed Enterprise License Agreement or Evaluation Agreement governing
					your use of the package: Enterprise packages in this repository are
					subject to the license terms located in the package. Please read the
					license terms prior to using the package. Your installation and use of
					the package constitutes your acceptance of these terms. If you do not
					accept the terms, do not use the package.
				</Text>
			}
			color="highlight"
			icon={<IconInfo16 className={s.cardIcon} />}
		/>
	)
}

const OfficialReleasesCard = () => {
	return (
		<CardWithLink
			heading="Official releases"
			subheading="All officially supported HashiCorp release channels and their security guarantees."
			link={
				<MobileStandaloneLink
					ariaLabel="View all official releases"
					href="https://www.hashicorp.com/official-release-channels"
					size16Icon={<IconExternalLink16 />}
					size24Icon={<IconExternalLink24 />}
					iconPosition="trailing"
					opensInNewTab
					text="View all"
				/>
			}
		/>
	)
}

interface ReleaseInformationSectionProps {
	selectedRelease: ReleaseVersion
	isEnterpriseMode: boolean
	/** We link to this heading from the side nav, so we've lifted up its data */
	releaseHeading: {
		id: string
		text: string
	}
}

const ReleaseInformationSection = ({
	selectedRelease,
	releaseHeading,
	isEnterpriseMode,
}: ReleaseInformationSectionProps): ReactElement => {
	const currentProduct = useCurrentProduct()
	return (
		<div className={s.root}>
			<ContentWithPermalink
				className={s.headingContainer}
				id={releaseHeading.id}
				ariaLabel={releaseHeading.text}
			>
				<Heading
					id={releaseHeading.id}
					className={classNames(s.heading, viewStyles.scrollHeading)}
					level={2}
					size={400}
					weight="bold"
				>
					{releaseHeading.text}
				</Heading>
			</ContentWithPermalink>

			<div className={s.notesContainer}>
				<ChangelogNote selectedRelease={selectedRelease} />
				<OfficialReleasesCard />
				<NoteCard selectedRelease={selectedRelease} />
				{currentProduct.name === 'Consul' && <ConsulNoteCard />}
				{isEnterpriseMode ? <EnterpriseLegalNote /> : null}
			</div>
		</div>
	)
}

export default ReleaseInformationSection

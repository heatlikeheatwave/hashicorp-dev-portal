import Link from 'next/link'
import VagrantIoLayout from 'layouts/_proxied-dot-io/vagrant'
import ProductDownloadsPage from '@hashicorp/react-product-downloads-page'
import { generateStaticProps } from 'lib/fetch-release-data'
import s from './style.module.css'

function DownloadsPage({ product, releases, latestVersion }) {
	return (
		<ProductDownloadsPage
			product={product}
			releases={releases}
			latestVersion={latestVersion}
			getStartedDescription="Follow step-by-step tutorials on the essentials of Vagrant."
			getStartedLinks={[
				{
					label: 'Quick Start',
					href: 'https://learn.hashicorp.com/tutorials/vagrant/getting-started-index',
				},
				{
					label: 'Install and Specify a Box',
					href: 'https://learn.hashicorp.com/tutorials/vagrant/getting-started-boxes',
				},
				{
					label: 'Configure the Network',
					href: 'https://learn.hashicorp.com/tutorials/vagrant/getting-started-networking',
				},
				{
					label: 'View all Vagrant tutorials',
					href: 'https://learn.hashicorp.com/vagrant',
				},
			]}
			logo={
				<img
					className={s.logo}
					alt="Vagrant"
					src={require('@hashicorp/mktg-logos/product/vagrant/primary/color.svg')}
				/>
			}
			tutorialLink={{
				href: 'https://learn.hashicorp.com/vagrant',
				label: 'View Tutorials at HashiCorp Learn',
			}}
			merchandisingSlot={
				<Link href="/vmware/downloads">
					<a>&raquo; Download VMware Utility</a>
				</Link>
			}
			packageManagerOverrides={[
				{
					label: 'Homebrew',
					commands: [`brew install vagrant`],
					os: 'darwin',
				},
				{
					label: 'Homebrew',
					commands: [`brew install vagrant`],
					os: 'linux',
				},
			]}
		/>
	)
}

export const getStaticProps = async () => {
	const result = await generateStaticProps('vagrant')

	if (result?.props?.releases?.versions) {
		result.props.releases.versions = Object.fromEntries(
			Object.entries(result.props.releases.versions).map(([key, version]) => {
				version.builds = version.builds.filter((build) => {
					if (build.os === 'linux' && !build.filename.endsWith('.zip')) {
						return false
					}
					return true
				})

				return [key, version]
			})
		)
	}

	return result
}

DownloadsPage.layout = VagrantIoLayout
export default DownloadsPage

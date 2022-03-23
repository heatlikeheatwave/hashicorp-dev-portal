import waypointData from 'data/waypoint.json'
import { Product } from 'types/products'
import { getStaticGenerationFunctions } from 'layouts/sidebar-sidecar/server'
import DocsView from 'views/docs-view'

const basePath = 'commands'
const baseName = 'Commands'
const product = waypointData as Product

const { getStaticPaths, getStaticProps } = getStaticGenerationFunctions({
  product,
  basePath,
  baseName,
})

export { getStaticPaths, getStaticProps }
export default DocsView

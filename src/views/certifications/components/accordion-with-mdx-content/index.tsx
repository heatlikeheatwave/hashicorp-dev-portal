import { MDXRemote } from 'next-mdx-remote'
import Accordion from 'components/accordion'
import Image from 'components/image'
import { ImageProps } from 'components/image/types'
import {
	MdxA,
	MdxP,
	MdxTable,
	MdxInlineCode,
	MdxOrderedList,
	MdxUnorderedList,
	MdxListItem,
	MdxBlockquote,
} from 'components/dev-dot-content/mdx-components'
import { AccordionWithMdxContentProps, AccordionMdxItem } from './types'
import s from './accordion-with-mdx-content.module.css'

function MdxImage({
	alt,
	src,
	title,
}: Pick<ImageProps, 'alt' | 'src' | 'title'>) {
	return <Image alt={alt} src={src} title={title} noBorder={true} />
}

const MDX_COMPONENTS = {
	a: MdxA,
	blockquote: MdxBlockquote,
	/* Note: we intentionally don't accept className from MDX content here */
	p: (props) => <MdxP {...props} className={s.lighterTextColor} />,
	table: MdxTable,
	img: MdxImage,
	inlineCode: MdxInlineCode,
	ul: MdxUnorderedList,
	ol: MdxOrderedList,
	li: MdxListItem,
}

export function AccordionWithMdxContent({
	items,
}: AccordionWithMdxContentProps) {
	return (
		<Accordion
			items={items.map((item: AccordionMdxItem) => {
				return {
					title: item.title,
					content: (
						<MDXRemote {...item.mdxSource} components={MDX_COMPONENTS} />
					),
				}
			})}
		/>
	)
}
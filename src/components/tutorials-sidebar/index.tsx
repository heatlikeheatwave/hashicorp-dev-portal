import { CollectionCategorySidebarSection } from 'views/collection-view/helpers'
import {
  SidebarHorizontalRule,
  SidebarSectionHeading,
  SidebarNavMenuItem,
} from 'components/sidebar/components'
import Sidebar from 'components/sidebar'
import {
  ListItemProps,
  SectionListProps,
  SectionTitleProps,
  TutorialSidebarProps,
} from './types'
import s from './tutorials-sidebar.module.css'

function TutorialsSidebar({
  backToLinkProps,
  children,
  levelButtonProps,
  overviewItemHref,
  setCurrentSidebarLevel,
  shouldRenderMobileControls,
  title,
  visuallyHideTitle,
}: TutorialSidebarProps) {
  return (
    <Sidebar
      backToLinkProps={backToLinkProps}
      levelButtonProps={levelButtonProps}
      overviewItemHref={overviewItemHref}
      setCurrentSidebarLevel={setCurrentSidebarLevel}
      shouldRenderMobileControls={shouldRenderMobileControls}
      showFilterInput={false}
      title={title}
      visuallyHideTitle={visuallyHideTitle}
    >
      {children}
    </Sidebar>
  )
}

function CollectionViewSidebarContent({
  sections,
}: {
  sections: CollectionCategorySidebarSection[]
}) {
  return (
    <>
      {sections?.map((section: CollectionCategorySidebarSection) => {
        return (
          <>
            <HorizontalRule />
            <SectionTitle text={section.title} />
            <SectionList items={section.items} />
          </>
        )
      })}
    </>
  )
}

function TutorialViewSidebarContent({ items }: SectionListProps) {
  return <SectionList items={items} />
}

function SectionList({ items }: SectionListProps) {
  return (
    <ul className={s.listRoot}>
      {items.map(({ text, href, isActive }: ListItemProps) => {
        return (
          <ListItem
            key={`${text}${href}`}
            text={text}
            href={href}
            isActive={isActive}
          />
        )
      })}
    </ul>
  )
}

function ListItem({ href, isActive, text }: ListItemProps) {
  return <SidebarNavMenuItem item={{ isActive, title: text, href }} />
}

function SectionTitle({ text }: SectionTitleProps) {
  return <SidebarSectionHeading text={text} />
}

function HorizontalRule() {
  return <SidebarHorizontalRule />
}

export {
  CollectionViewSidebarContent,
  HorizontalRule,
  ListItem,
  SectionList,
  SectionTitle,
  TutorialViewSidebarContent,
}
export default TutorialsSidebar

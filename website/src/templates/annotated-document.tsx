import React, { useState, useEffect } from "react"
import { graphql, Link } from "gatsby"
import { useDialogState, Dialog, DialogBackdrop } from "reakit/Dialog"
import { Tab, TabPanel, TabList } from "reakit/Tab"
import Sticky from "react-stickynode"
import Layout from "../layout"
import { Segment, AnnotatedForm } from "../segment"
import theme, { fullWidth, largeDialog, withBg } from "../theme"
import { collectionRoute, documentDetailsRoute, documentRoute } from "../routes"
import { useScrollableTabState } from "../scrollable-tabs"
import { css } from "linaria"
import { DeepPartial } from "tsdef"
import {
  ExperienceLevel,
  TagSet,
  BasicMorphemeSegment,
  tagSetForMode,
} from "../types"
import { MorphemeDetails } from "../morpheme"
import PageImages from "../page-image"
import { Breadcrumbs } from "../breadcrumbs"
import { isMobile } from "react-device-detect"
import { ExperiencePicker } from "../mode"

enum Tabs {
  ANNOTATION = "annotation-tab",
  IMAGES = "source-image-tab",
}

/** A full annotated document, including all metadata and the translation(s) */
const AnnotatedDocumentPage = (p: {
  data: GatsbyTypes.AnnotatedDocumentQuery
}) => {
  const doc = p.data.dailp.document!
  const tabs = useScrollableTabState({ selectedId: Tabs.ANNOTATION })
  const dialog = useDialogState()
  const [selectedMorpheme, setMorpheme] = useState<BasicMorphemeSegment | null>(
    null
  )

  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(null)

  const tagSet = tagSetForMode(experienceLevel)

  return (
    <Layout title={doc.title}>
      <main className={annotatedDocument}>
        <DialogBackdrop className={morphemeDialogBackdrop} {...dialog}>
          <Dialog
            {...dialog}
            className={morphemeDialog}
            aria-label="Segment Details"
          >
            {selectedMorpheme ? (
              <MorphemeDetails
                documentId={doc.id}
                segment={selectedMorpheme}
                dialog={dialog}
                tagSet={tagSet}
              />
            ) : null}
          </Dialog>
        </DialogBackdrop>

        <DocumentTitleHeader doc={doc as any} showDetails={true} />
        <Sticky
          top={isMobile ? "#header" : undefined}
          className={wideAndTop}
          innerClass={wideSticky}
        >
          <TabList {...tabs} className={docTabs} aria-label="Manuscript Tabs">
            <Tab {...tabs} id={Tabs.ANNOTATION} className={docTab}>
              Text
            </Tab>
            <Tab {...tabs} id={Tabs.IMAGES} className={docTab}>
              Source Image
            </Tab>
          </TabList>
        </Sticky>

        <TabPanel
          {...tabs}
          className={docTabPanel}
          id="id-1-3"
          tabId={Tabs.ANNOTATION}
        >
          <ExperiencePicker onSelect={setExperienceLevel} />

          <article className={annotationContents}>
            {doc.translatedSegments?.map((seg, i) => (
              <Segment
                key={i}
                segment={seg.source as GatsbyTypes.Dailp_AnnotatedSeg}
                dialog={dialog}
                onOpenDetails={setMorpheme}
                level={experienceLevel}
                tagSet={tagSet}
                translations={
                  seg.translation as GatsbyTypes.Dailp_TranslationBlock
                }
                pageImages={doc.pageImages}
              />
            ))}
            {doc.forms?.map((form, i) => (
              <AnnotatedForm
                key={i}
                segment={form}
                dialog={dialog}
                onOpenDetails={setMorpheme}
                level={experienceLevel}
                tagSet={tagSet}
                translations={null}
                pageImages={doc.pageImages}
              />
            ))}
          </article>
        </TabPanel>

        <TabPanel
          {...tabs}
          className={imageTabPanel}
          id="id-1-4"
          tabId={Tabs.IMAGES}
        >
          <PageImages pageImages={doc.pageImages} document={doc as any} />
        </TabPanel>
      </main>
    </Layout>
  )
}
export default AnnotatedDocumentPage

const annotationContents = css`
  width: 100%;
`

export const DocumentTitleHeader = (p: {
  doc: DeepPartial<GatsbyTypes.Dailp_AnnotatedDoc>
  showDetails?: boolean
}) => (
  <header className={docHeader}>
    <Breadcrumbs aria-label="Breadcrumbs">
      <li>
        <Link to="/">Collections</Link>
      </li>
      {p.doc.collection && (
        <li>
          <Link to={collectionRoute(p.doc.collection.slug!)}>
            {p.doc.collection.name}
          </Link>
        </li>
      )}
    </Breadcrumbs>

    <h1>
      {p.showDetails ? (
        p.doc.title
      ) : (
        <Link to={documentRoute(p.doc.slug!)}>{p.doc.title}</Link>
      )}{" "}
      {p.doc.date && `(${p.doc.date.year})`}{" "}
      {p.showDetails ? (
        <span className={notInPrint}>
          [<Link to={documentDetailsRoute(p.doc.slug!)}>Details</Link>]
        </span>
      ) : null}
    </h1>
  </header>
)

const notInPrint = css`
  ${theme.mediaQueries.print} {
    display: none;
  }
`

const wideAndTop = css`
  width: 100%;
  z-index: 1;
  ${theme.mediaQueries.print} {
    display: none;
    height: 0;
  }
`

const wideSticky = css`
  left: 0;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  width: 100% !important;
`

const docTab = css`
  border-radius: 0;
  border: none;
  flex-grow: 1;
  cursor: pointer;
  font-family: ${theme.fonts.headerArr.join(",")};
  font-size: 1.25rem;
  background-color: ${theme.colors.header};
  color: ${theme.colors.headings};
  outline-color: ${theme.colors.headings};
  &[aria-selected="true"] {
    border-bottom: 2px solid ${theme.colors.headings};
  }
`

const docTabs = css`
  display: flex;
  flex-flow: row nowrap;
  height: ${theme.rhythm * 2}rem;
  ${fullWidth}
`

const docTabPanel = css`
  ${fullWidth}
  padding: 0 0.5rem;
  outline: none;
  ${theme.mediaQueries.medium} {
    padding: 0;
  }
`

const imageTabPanel = css`
  ${fullWidth}
`

const docHeader = css`
  ${fullWidth}
  padding: 0 ${theme.edgeSpacing};
  ${theme.mediaQueries.medium} {
    padding: 0;
  }
`

export const query = graphql`
  query AnnotatedDocument($id: String!, $isReference: Boolean!) {
    dailp {
      document(id: $id) {
        id
        title
        slug
        collection {
          name
          slug
        }
        date {
          year
        }
        sources {
          name
          link
        }
        pageImages
        translatedSegments @skip(if: $isReference) {
          source {
            ... on Dailp_AnnotatedForm {
              ...FormFields
            }
            ... on Dailp_AnnotatedPhrase {
              ...BlockFields
            }
            ... on Dailp_PageBreak {
              index
            }
          }
          translation {
            text
          }
        }
        forms @include(if: $isReference) {
          ...FormFields
        }
      }
    }
  }
  fragment BlockFields on Dailp_AnnotatedPhrase {
    ty
    index
    parts {
      ... on Dailp_AnnotatedForm {
        ...FormFields
      }
    }
  }
  fragment FormFields on Dailp_AnnotatedForm {
    index
    source
    simplePhonetics
    phonemic
    segments {
      shapeTth: morpheme(system: TAOC)
      shapeDt: morpheme(system: CRG)
      shapeDtSimple: morpheme(system: LEARNER)
      gloss
      matchingTag {
        id
        taoc {
          tag
          title
        }
        learner {
          tag
          title
        }
        crg {
          tag
          title
        }
      }
      nextSeparator
    }
    englishGloss
    commentary
  }
`

const morphemeDialog = css`
  ${largeDialog}
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid ${theme.colors.borders};
  border-radius: 2px;
  max-width: 100vw;
  z-index: 999;
`

const morphemeDialogBackdrop = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 998;
`

const annotatedDocument = css`
  align-items: center;
  ${theme.mediaQueries.medium} {
    padding-left: ${theme.edgeSpacing};
    padding-right: ${theme.edgeSpacing};
  }
`

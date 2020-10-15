import React from "react"
import { styled } from "linaria/react"
import { DialogDisclosure } from "reakit/Dialog"
import { Group } from "reakit/Group"
import _ from "lodash"
import {
  ExperienceLevel,
  AnnotationSection,
  TagSet,
} from "./templates/annotated-document"

interface Props {
  segment: GatsbyTypes.Dailp_AnnotatedSeg
  dialog: any
  onOpenDetails: (morpheme: GatsbyTypes.Dailp_MorphemeSegment) => void
  level: ExperienceLevel
  translations: GatsbyTypes.Dailp_TranslationBlock
  tagSet: TagSet
  pageImages: readonly string[]
}

/** Displays one segment of the document, which may be a word, block, or phrase. */
export const Segment = (p: Props) => {
  if (isForm(p.segment)) {
    return <AnnotatedForm {...p} segment={p.segment} />
  } else if (isPhrase(p.segment)) {
    const children =
      p.segment.parts?.map((seg, i) => (
        <Segment
          key={i}
          segment={seg}
          dialog={p.dialog}
          onOpenDetails={p.onOpenDetails}
          level={p.level}
          translations={p.translations}
          tagSet={p.tagSet}
          pageImages={p.pageImages}
        />
      )) ?? null

    if (p.segment.ty === "BLOCK") {
      return (
        <DocumentBlock>
          <TranslationPara>
            {p.translations?.segments.join(". ") ?? null}.
          </TranslationPara>
          <AnnotationSection>
            {children}
            <div style={{ flexGrow: 1 }} aria-hidden={true} />
          </AnnotationSection>
        </DocumentBlock>
      )
    } else {
      return <>{children}</>
    }
  } else if (isPageBreak(p.segment)) {
    return <PageImage src={p.pageImages[p.segment.index]} />
  } else {
    return null
  }
}

const PageImage = styled.img`
  margin-top: 2rem;
  width: 100%;
  height: auto;
`

function isForm(
  seg: GatsbyTypes.Dailp_AnnotatedSeg
): seg is GatsbyTypes.Dailp_AnnotatedForm {
  return "source" in seg
}
function isPhrase(
  seg: GatsbyTypes.Dailp_AnnotatedSeg
): seg is GatsbyTypes.Dailp_AnnotatedPhrase {
  return "parts" in seg
}
function isPageBreak(
  seg: GatsbyTypes.Dailp_AnnotatedSeg
): seg is GatsbyTypes.Dailp_PageBreak {
  return (
    "__typename" in seg &&
    (seg["__typename"] as string).endsWith("PageBreak") &&
    "index" in seg
  )
}

/**
 * Displays the break-down of a word into its units of meaning and the English
 * glosses for each morpheme.
 */
const MorphemicSegmentation = (p: {
  segments: readonly GatsbyTypes.Dailp_MorphemeSegment[]
  tagSet: TagSet
  dialog: any
  onOpenDetails: any
  showPhonemicLayer: boolean
}) => {
  // If there is no segmentation, return two line breaks for the
  // morphemic segmentation and morpheme gloss layers.
  if (!p.segments || !p.segments.length) {
    return (
      <>
        <br />
        {p.showPhonemicLayer ? <br /> : null}
      </>
    )
  }

  const segmentDivs = intersperse(
    p.segments.map((segment, i) => (
      <WordSegment key={i}>
        {p.showPhonemicLayer ? segment.morpheme : null}
        <MorphemeSegment
          segment={segment}
          tagSet={p.tagSet}
          dialog={p.dialog}
          onOpenDetails={p.onOpenDetails}
        />
      </WordSegment>
    )),
    // Add dashes between all morphemes for more visible separation.
    i => (
      <MorphemeDivider
        key={100 * (i + 1)}
        showPhonemicLayer={p.showPhonemicLayer}
      />
    )
  )
  return <GlossLine>{segmentDivs}</GlossLine>
}

export function intersperse<T>(arr: T[], separator: (n: number) => T): T[] {
  return _.flatMap(arr, (a, i) => (i > 0 ? [separator(i - 1), a] : [a]))
}

const MorphemeDivider = (p: { showPhonemicLayer: boolean }) => (
  <WordSegment>
    <span>-</span>
    {p.showPhonemicLayer ? <span>-</span> : null}
  </WordSegment>
)

/** One morpheme that can be clicked to see further details. */
const MorphemeSegment = (p: {
  segment: GatsbyTypes.Dailp_MorphemeSegment
  tagSet: TagSet
  dialog: any
  onOpenDetails: (segment: GatsbyTypes.Dailp_MorphemeSegment) => void
}) => {
  let gloss = p.segment.gloss
  if (p.tagSet === TagSet.Crg) {
    gloss = p.segment.matchingTag?.crg ?? p.segment.gloss
  }
  return (
    <MorphemeButton {...p.dialog} onClick={() => p.onOpenDetails(p.segment)}>
      {gloss}
    </MorphemeButton>
  )
}

const WordSegment = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  margin-right: 2px;
`

const MorphemeButton = styled(DialogDisclosure)`
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  border: none;
  padding: 0px 0.2rem;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  &:hover {
    border-bottom: 1px solid darkblue;
  }
`

const GlossLine = styled.span`
  display: flex;
  flex-flow: row nowrap;
`

const AnnotatedForm = (
  p: Props & { segment: GatsbyTypes.Dailp_AnnotatedForm }
) => {
  return (
    <WordGroup id={`w${p.segment.index}`}>
      <div>{p.segment.source}</div>
      <div>{p.segment.simplePhonetics ?? <br />}</div>
      {p.level > ExperienceLevel.Beginner ? (
        <MorphemicSegmentation
          segments={p.segment.segments}
          dialog={p.dialog}
          onOpenDetails={p.onOpenDetails}
          showPhonemicLayer={p.level > ExperienceLevel.Intermediate}
          tagSet={p.tagSet}
        />
      ) : null}
      <div>{p.segment.englishGloss.join(", ")}</div>
    </WordGroup>
  )
}

const WordGroup = styled(Group)`
  margin: 1rem 1.5rem;
  margin-bottom: 2rem;
`

const TranslationPara = styled.p`
  margin: 0 1rem;
`

const DocumentBlock = styled.div`
  margin: 3rem 0;
`

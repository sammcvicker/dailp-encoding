import { style } from "@vanilla-extract/css"
import { withSSRContext } from "aws-amplify"
import { borderWidth, margin } from "polished"
import {
  colors,
  fonts,
  hspace,
  mediaQueries,
  radii,
  tagColors,
  thickness,
  vspace,
} from "src/style/constants"
import { marginX, marginY, paddingX, paddingY } from "src/style/utils"

const wordShared = style([
  paddingY(vspace.quarter),
  paddingX(hspace.halfEdge),
  {
    borderWidth: thickness.thick,
    borderStyle: "solid",
    "@media": {
      [mediaQueries.print]: {
        ...margin(0, "3.5rem", vspace[1.5], hspace.small),
      },
      [mediaQueries.medium]: margin(0, "2.5rem", vspace.one, hspace.small),
    },
  },
])

export const commentWrapper = style([
  wordShared,
  marginY(vspace.half),
  {
    borderColor: colors.borders,
    borderRadius: radii.large,
    lineHeight: vspace.one,
    pageBreakInside: "avoid",
    breakInside: "avoid",
    "@media": {
      [mediaQueries.medium]: {},
    },
  },
])

export const headerStyle = style([
  marginX(hspace.medium),
  {
    fontSize: "0.7rem",
  },
])

export const tagPadding = style([paddingY(vspace.medium)])

export const tagColorStory = style([
  paddingX(hspace.medium),
  {
    display: "inline-block",
    borderRadius: radii.round,
    backgroundColor: tagColors.story,
    fontSize: "0.7rem",
  },
])

export const tagColorSuggestion = style([
  paddingX(hspace.medium),
  {
    display: "inline-block",
    borderRadius: radii.round,
    backgroundColor: tagColors.suggestion,
    fontSize: "0.7rem",
  },
])

export const tagColorQuestion = style([
  paddingX(hspace.medium),
  {
    display: "inline-block",
    borderRadius: radii.round,
    backgroundColor: tagColors.question,
    fontSize: "0.7rem",
  },
])

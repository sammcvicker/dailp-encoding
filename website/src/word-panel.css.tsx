import { style, styleVariants } from "@vanilla-extract/css"
import { closeButton } from "./morpheme.css"
import sprinkles, {
  colors,
  hspace,
  mediaQueries,
  radii,
  theme,
  thickness,
  vspace,
} from "./sprinkles.css"

const wordPanelPadding = "8px"

export const cherHeader = style({
  color: colors.headings,
  fontFamily: theme.fonts.cherokee,
})

export const wordPanelButton = styleVariants({
  basic: [closeButton],
  colpright: [
    closeButton,
    {
      position: "relative",
      float: "right",
      top: "0px",
    },
  ],
  colpleft: [
    closeButton,
    {
      position: "relative",
      float: "left",
      top: "0px",
      marginRight: wordPanelPadding,
      left: "0px",
    },
  ],
})

export const collPanelContent = style({
  padding: wordPanelPadding,
  marginBottom: "0px",
})

export const collPanelButton = style({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0)",
  border: "none",
  textAlign: "left",
  padding: wordPanelPadding,
})

export const collPanel = style({
  width: "inherit",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #ddd",
})

export const wordPanelContent = style({
  position: "sticky",
  top: 100,

  border: "none",
  borderRadius: "4px",
  padding: wordPanelPadding,
  fontFamily: theme.fonts.body,
  "@media": {
    [mediaQueries.medium]: {
      border: "1px solid #ddd",
      height: "calc(100vh - 125px)",
    },
  },
  overflowY: "auto",
})

export const audioContainer = style({ paddingLeft: "40%" })

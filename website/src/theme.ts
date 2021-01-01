import { css } from "linaria"
import Color from "color"

const theme = {
  fonts: {
    // 4 fonts total: header, serif body, sans body, Cherokee.
    // Noto Serif supports glottal stops and more accents than other fonts.
    body: `"Noto Serif", "Noto Sans Cherokee", serif, Arial`,
    bodyArr: ["Noto Serif", "Noto Sans Cherokee", "serif", "Arial"],
    header: `"Quattrocento Sans", "Segoe UI", Arial, sans-serif`,
    headerArr: ["Quattrocento Sans", "Segoe UI", "Arial", "sans-serif"],
    cherokee: `"Noto Sans Cherokee", "Noto Sans", Arial, sans-serif`,
  },
  fontSizes: {
    root: "18px",
  },
  colors: {
    header: "#f7eeed",
    button: "#f7eeed",
    footer: "#405372",
    altFooter: "#4f5970",
    body: "white",
    text: "black",
    link: "#405372",
    headings: "#9f4c43",
    borders: "darkgray",
  },
  mediaQueries: {
    small: "@media screen and (min-width: 40em)",
    medium: "@media screen and (min-width: 52em)",
    large: "@media screen and (min-width: 64em)",
    print: "@media print",
  },
  edgeSpacing: "1rem",
  rhythm: 1.53,
}

export const fullWidth = {
  width: "100%",
  [theme.mediaQueries.medium]: {
    width: "45rem",
  },
  [theme.mediaQueries.large]: {
    width: "56rem",
  },
}

export const largeDialog = {
  width: "95%",
  [theme.mediaQueries.medium]: {
    width: "35rem",
  },
  [theme.mediaQueries.large]: {
    width: "45rem",
  },
}

export const withBg = css`
  z-index: 999;
  background-color: ${theme.colors.body};
  padding: ${theme.rhythm / 4}em;
  border: 1px solid ${theme.colors.text};
  ${theme.mediaQueries.medium} {
    max-width: 70vw;
  }
  ${theme.mediaQueries.print} {
    display: none;
  }
`

export const hideOnPrint = css`
  ${theme.mediaQueries.print} {
    display: none;
  }
`

const button = css`
  font-family: ${theme.fonts.headerArr.join(",")};
  font-size: 1rem;
  color: ${theme.colors.link};
  background-color: ${theme.colors.button};
  padding: ${theme.rhythm / 3}rem 1rem;
  margin: 0 1rem;
  cursor: pointer;
  border: 2px solid ${theme.colors.headings};
  &:hover {
    color: ${theme.colors.headings};
    background-color: ${Color(theme.colors.button).lighten(0.2).hsl().string()};
  }
  &:focus,
  &:active {
    outline: none;
    border-style: dashed;
  }
`

export const std = {
  button,
}

export default theme

import React from "react"
import { css, cx } from "linaria"
import { Link } from "gatsby"
import Footer from "./footer"
import theme, { fullWidth, hideOnPrint } from "./theme"
import { NavMenu, MobileNav } from "./menu"
import { Helmet } from "react-helmet"
import Sticky from "react-stickynode"
import { isMobile } from "react-device-detect"
import Typography from "typography"

import "fontsource-noto-serif"
import "fontsource-quattrocento-sans"
import "./fonts.css"

/** Wrapper for most site pages, providing them with a navigation header and footer. */
const Layout = (p: { title?: string; children: any }) => (
  <>
    <Helmet title={p.title ? `${p.title} - DAILP` : "DAILP"} />
    <Sticky enabled={isMobile} innerZ={2} className={hideOnPrint}>
      <header aria-label="Site Header" id="header" className={header}>
        <nav className={headerContents}>
          <MobileNav />
          <h1 className={siteTitle}>
            <Link to="/">DAILP</Link>
          </h1>
          <span className={subHeader}>
            Digital Archive of American Indian Languages Preservation and
            Perseverance
          </span>
          <NavMenu />
        </nav>
      </header>
    </Sticky>
    {p.children}
    <Footer />
  </>
)

export default Layout

const header = css`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  background-color: ${theme.colors.header};
  padding: 0 ${theme.edgeSpacing};
  font-family: ${theme.fonts.headerArr.join(",")};
`

const headerContents = css`
  ${fullWidth}
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  ${theme.mediaQueries.medium} {
    align-items: baseline;
  }
`

const subHeader = css`
  color: ${theme.colors.headings};
  padding-left: 1rem;
  display: none;
  ${theme.mediaQueries.medium} {
    display: initial;
  }
`

const siteTitle = css`
  margin: ${theme.rhythm / 4}rem 0;
  ${theme.mediaQueries.medium} {
    margin: ${theme.rhythm}rem 0;
  }
  & > a {
    color: ${theme.colors.headings};
    text-decoration: none;
  }
`

const typography = new Typography({
  baseFontSize: theme.fontSizes.root,
  baseLineHeight: theme.rhythm,
  headerFontFamily: theme.fonts.headerArr,
  bodyFontFamily: theme.fonts.bodyArr,
  bodyGray: 5,
  headerGray: 10,
  // blockMarginBottom: 0.5,
})

// These styles affect all pages.
css`
  :global() {
    ${typography.toString()}

    * {
      box-sizing: border-box;
      float: none;
    }

    html {
      font-size: ${theme.fontSizes.root} !important;
      ${theme.mediaQueries.print} {
        font-size: 12pt !important;
      }
    }

    body {
      margin: 0;
      background-color: ${theme.colors.footer} !important;
      ${theme.mediaQueries.print} {
        background-color: none !important;
      }
    }

    ${theme.mediaQueries.print} {
      abbr[title] {
        border-bottom: none;
        text-decoration: none;
      }
    }

    p,
    h1,
    h2 {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    @page {
      margin: 0.75in;
    }

    a {
      color: ${theme.colors.footer};
      text-decoration-thickness: 0.09em;
      border-radius: 0;

      &:hover,
      &:active,
      &:focus {
        color: ${theme.colors.altFooter};
      }

      ${theme.mediaQueries.print} {
        color: ${theme.colors.text};
        text-decoration: none;
      }
    }

    *:focus {
      outline-color: ${theme.colors.link};
      outline-style: solid;
      outline-width: thin;
      outline-offset: 0;

      ${theme.mediaQueries.print} {
        outline: none;
      }
    }

    main {
      background-color: ${theme.colors.body};
      display: flex;
      flex-flow: column wrap;
      align-items: center;
      padding: ${theme.rhythm}rem 0;
      ${theme.mediaQueries.print} {
        display: block;
        padding-bottom: 0;
      }
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    header {
      color: ${theme.colors.headings};
      font-family: ${theme.fonts.headerArr.join(",")};
      ${theme.mediaQueries.print} {
        color: ${theme.colors.text};
      }
    }

    button,
    input[type="radio"] {
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
    }

    figure {
      margin-inline-start: 0;
      max-width: 100%;
      ${theme.mediaQueries.medium} {
        margin-inline-start: 2rem;
      }
    }

    dd {
      margin-left: ${theme.rhythm}rem;
    }
  }
`

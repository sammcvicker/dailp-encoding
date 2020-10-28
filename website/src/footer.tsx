import React from "react"
import { styled } from "linaria/react"
import theme, { fullWidth } from "./theme"

/** University affiliation, related navigation links, and contact info.  */
const Footer = () => (
  <FooterContainer>
    <FooterContent>Northeastern University</FooterContent>
  </FooterContainer>
)
export default Footer

const FooterContainer = styled.footer`
  background-color: rgb(63, 82, 113);
  padding: 15px 0;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  color: white;
`

const FooterContent = styled.div`
  ${fullWidth}
  padding: 0 ${theme.edgeSpacing};
`

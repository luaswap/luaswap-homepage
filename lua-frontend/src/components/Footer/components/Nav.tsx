import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink
        target="_blank"
        href="https://etherscan.io/address/0xb67d7a6644d9e191cac4da2b88d6817351c7ff62"
      >
        Contract
      </StyledLink>
      <StyledLink target="_blank" href="https://github.com/tomochain/luaswap">
        Github
      </StyledLink>
      <StyledLink target="_blank" href="https://twitter.com/LuaSwap">
        Twitter
      </StyledLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`

const StyledLink = styled.a`
  color: ${(props) => props.theme.color.grey[100]};
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.primary.main};
  }
`

export default Nav

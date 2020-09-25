import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Lua from '../../assets/img/luaswap.png'

const Logo: React.FC = () => {
  return (
    <StyledLogo to="/">
      <img src={Lua} height="50" style={{ marginTop: -4 }} />
    </StyledLogo>
  )
}

const StyledLogo = styled(Link)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: 0;
  min-height: 44px;
  min-width: 44px;
  padding: 0;
  text-decoration: none;
`

export default Logo

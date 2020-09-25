import React from 'react'
import styled, { keyframes } from 'styled-components'

import CardIcon from '../CardIcon'
import Lua from '../../assets/img/lua-icon.svg'
interface LoaderProps {
  text?: string
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <StyledLoader>
      <CardIcon>
        <StyledLua><img src={Lua} alt="LuaSwap"/></StyledLua>
      </CardIcon>
      {!!text && <StyledText>{text}</StyledText>}
    </StyledLoader>
  )
}

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`
const scale = keyframes `
  0%   {transform: scale(.8);}
  100% {transform: scale(1);}
`

const StyledLoader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledLua = styled.div`
  font-size: 32px;
  position: relative;
  animation: 0.8s ${scale} infinite;
`

const StyledText = styled.div`
  color: ${(props) => props.theme.color.grey[100]};
`

export default Loader

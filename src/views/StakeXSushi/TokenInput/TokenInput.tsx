import React from 'react'
import styled from 'styled-components'

import Button from '../../../components/Button'
import Input, { InputProps } from '../Input'

interface TokenInputProps extends InputProps {
  max: number | string,
  symbol: string,
  onSelectMax?: () => void,
}

const TokenInput: React.FC<TokenInputProps> = ({
  max,
  symbol,
  onChange,
  onSelectMax,
  value,
}) => {
  return (
    <StyledTokenInput>
        <Box>
            <StyleBox>
                <StyleLabel>Amount</StyleLabel>
                <StyledMaxText>{max.toLocaleString('en-US')} {symbol}</StyledMaxText>
            </StyleBox>
            <BoxInput>
                <Input
                    endAdornment={(
                    <StyledTokenAdornmentWrapper>
                      <StyledTokenSymbol>{symbol}</StyledTokenSymbol>
                      <StyledSpacer />
                      <div>
                      <Button size="sm" text="Max" onClick={onSelectMax} />
                      </div>
                    </StyledTokenAdornmentWrapper>
                    )}
                    onChange={onChange}
                    placeholder="0"
                    value={value}
                />
            </BoxInput>
        </Box>
    </StyledTokenInput>
  )
}

/*
            <div>
              <Button size="sm" text="Max" />
            </div>
*/
const StyleBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
  padding-left: 20px;
`
const StyleLabel = styled.div`
  color: ${props => props.theme.color.grey[100]};
  font-weight: bold;
  width: 40%;
`
const StyledTokenInput = styled.div`
  padding: 24px;
`
const Box = styled.div`
    background-color: ${props => props.theme.color.grey[500]};
    border-radius: 12px;
    padding: 10px 0;
`
const StyledSpacer = styled.div`
  width: ${props => props.theme.spacing[3]}px;
`

const Styledplaceholder = styled.div`
  width: 72%;
`

const StyledTokenAdornmentWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  width: 30%;
`

const StyledMaxText = styled.div`
  align-items: center;
  color: ${props => props.theme.color.grey[100]};
  display: flex;
  font-size: 14px;
  font-weight: 700;
  height: 44px;
  width: 60%;
  justify-content: flex-end;
`

const StyledTokenSymbol = styled.span`
  color: ${props => props.theme.color.grey[100]};
  font-weight: 700;
`

const BoxInput = styled.div`
  input {
      width: 60%;
  }
`



export default TokenInput
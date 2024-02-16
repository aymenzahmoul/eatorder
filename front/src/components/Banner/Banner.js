import React from 'react'
import { Background, Logo } from '../../assets/images/exports'
import styled from 'styled-components';

export default function Banner() {
    return (
        <SelectCompanyContainer >
            <EatOrderImage src={Logo} >
            </EatOrderImage>
        </SelectCompanyContainer>
    )
}

export const SelectCompanyContainer = styled.div`
  background-image: url(${Background});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 30vh;
  width: 100%;

`;

export const EatOrderImage = styled.img`
width: 36vh;
`;

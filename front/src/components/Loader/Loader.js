import React from 'react';
import styled from 'styled-components';
import { ThreeDots } from 'react-loader-spinner';

export default function Loader({ isLoading }) {
    return (
        isLoading &&
        <LoaderDiv>
            <ThreeDots color="rgb(223, 143, 23)" />
        </LoaderDiv>
    );
}

export const LoaderDiv = styled.div`
    background-color: rgba(0, 0, 0, 0.3); /* Adjust the alpha value (0.1 for 10% opacity) */
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh; /* Adjusted to full viewport height */
    position: fixed; /* Ensures it stays centered even when scrolling */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
`;

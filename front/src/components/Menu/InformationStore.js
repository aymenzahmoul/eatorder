import React, { useState } from "react";
import { useSelector } from "react-redux";
import Container from "react-bootstrap/Container";
import "leaflet/dist/leaflet.css";
import styled from "styled-components";
import DateModel from "./productModal/DateModel";

export default function InformationStore() {
    const [showInformation, setShowInformation] = useState(false);
    const handleToggleInformation = () => {
        setShowInformation(!showInformation);
    };

    const restaurantSelected = useSelector((state) => state.restaurant.restaurantSelected);

    return (
        <ContainerInfo>
            <Container>
                <ImgContainer>
                    <ImgCont
                    //    src={restaurantSelected.banner}
                       src="https://media.istockphoto.com/id/1457889029/photo/group-of-food-with-high-content-of-dietary-fiber-arranged-side-by-side.jpg?b=1&s=612x612&w=0&k=20&c=BON5S0uDJeCe66N9klUEw5xKSGVnFhcL8stPLczQd_8="
                        alt="Dough Bros"
                        loading="eager"
                    />

                    <LogoCont src={restaurantSelected.logo} loading="eager" alt="Dough Bros" />
                </ImgContainer>

                <InformationContainer>
                    <NameContainer>
                        <NameCont>{restaurantSelected.name}</NameCont>
                        <SpanCont>
                         {restaurantSelected.description}
                        </SpanCont>
                        <InfoButton onClick={handleToggleInformation}>
                            {showInformation ? "Close" : "More Information .."}
                        </InfoButton>
                    </NameContainer>
                    <InformationCont show={showInformation}>
                        <DateModel />
                    </InformationCont>
                </InformationContainer>
            </Container>
        </ContainerInfo>
    );
}

const ContainerInfo = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    padding: 15px;
`;

const ImgCont = styled.img`
    height: 300px;
    width: 100%;
    border-radius: 10px;
    @media screen and (max-width: 768px) {
        height: 125px;
        border-radius: 10px;
    }
`;

const ImgContainer = styled.div`
    max-width: 100%;
`;

const LogoCont = styled.img`
    height: 100px;
    width: 150px;
    object-fit: contain;
    border-radius: 50px;
    margin-top: -5%;
`;

const NameContainer = styled.div`
    width: 55%;

    @media screen and (max-width: 768px) {
        width: 100%;
    }
`;

const NameCont = styled.h1`
    font-size: 32px;
    font-family: DD-TTNorms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
    font-weight: 700;
    line-height: 40px;
    letter-spacing: -0.04ch;
    text-transform: none;
    color: rgb(25, 25, 25);
    margin: 0px;
    padding: 0px;
    display: block;
    font-variant-ligatures: no-common-ligatures;
`;

const InformationCont = styled.div`
    width: 30%;
    padding: 2px;
    border-radius: 7px;
    margin-bottom: 10px;
    height: 360px;
    @media screen and (min-width:769px) and (max-width:1023px){
        width: 45%;
    }
    @media screen and (max-width: 768px) {
        display: ${(props) => (props.show ? "flex" : "none")};
        width: 100%;
        justify-content: center;
    }
`;

const InformationContainer = styled.div`
    display: flex;
    justify-content: space-around;

    @media screen and (max-width: 768px) {
        flex-direction: column;
    }
`;

const SpanCont = styled.p`
    font-size: 16px;
    font-family: DD-TTNorms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
    font-weight: 500;
    line-height: 22px;
    letter-spacing: 0ch;
    text-transform: none;
    color: rgb(25, 25, 25);
    text-align: justify;

    @media screen and (max-width: 768px) {
        text-align: start;
    }
`;

const InfoButton = styled.button`
    display: none;
    @media screen and (max-width: 768px) {
        display: flex;
        padding-left: 10px;
        color: #ff6347;
        font-size: 16px;
        border-radius: 8px;
        transition: background-color 0.3s ease, transform 0.2s ease,
        box-shadow 0.2s ease;
    }
`;

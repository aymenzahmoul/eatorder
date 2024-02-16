import React, { useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { setModalPrincipal } from "../../shared/slice/ModalLogin/ModalLoginSlice";
import { useSelector } from "react-redux";
import ModalPrincipal from "../Modals/ModalPrincipal";
import { store } from "../../shared";
import ModalLogin from "../Modals/ModalLogin";
import ModalSignup from "../Modals/ModalSignup";
import ModalResetPassword from "../Modals/ModalResetPassword";
import ModalEmailSend from "../Modals/ModalEmailSend";
import { eatorder } from "../../assets/images/exports";
import { disconnect } from "../../shared/slice/auth/AuthSlice";
import styled from "styled-components";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Cart from "../Cart/Cart";
import i18n from "../../i18n";
import LanguageIcon from "@mui/icons-material/Language";

export default function MyNavBar() {
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language.split('-')[0]);
  const principalModal = useSelector(
    (state) => state.modalLogin.modalPrincipal
  );
  const isLoggedIn = useSelector((state) => state.authentification.isLoggedIn);
  const orders = useSelector((state) => state.order.order);
  const selectedPromos = useSelector((state) => state.promos.selectedPromos);
  const openmodal = () => {
    store.dispatch(setModalPrincipal({ modalPrincipal: true }));
  };
  const logout = () => {
    // window.location.reload();
    store.dispatch(disconnect());
  };
  const handleChange = (e) => {
    const selectedLanguage = e.target.value;
    console.log(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
    setSelectedLanguage(selectedLanguage);
  };
  return (
    <>
      <StyledNavbar
        className="bg-body-tertiary "
        style={
          {
            // background:`${color}`
          }
        }
      >
        <Container>
          <Navbar.Brand href="/">
            <Logo src={eatorder} className="logo"></Logo>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav.Item className="text-white ">
              <LanguageButton>
                <LanguageIcon style={{ color: "var(--primaryColor)" }} />
                <SelectorStyled onChange={handleChange} defaultValue={selectedLanguage} >
                  <option value="en">EN</option>
                  <option value="es">ES</option>
                  <option value="fr">FR</option>
                  <option value="it">IT</option>
                </SelectorStyled>
              </LanguageButton>
            </Nav.Item>
            {isLoggedIn ? (
              <Nav.Item className="text-white ">
                <button className="btn" onClick={() => logout()}>
                  <LogoutIcon style={{ color: "var(--primaryColor)" }} />
                </button>
              </Nav.Item>
            ) : (
              <Nav.Item className="text-white">
                <button
                  className="btn"
                  onClick={openmodal}
                  style={{ marginRight: "10px", padding: "0" }}
                >
                  <PersonIcon style={{ color: "var(--primaryColor)" }} />
                  <span className="login-button"></span>
                </button>
                <ModalPrincipal />
                <ModalLogin />
                <ModalSignup />
                <ModalResetPassword />
                <ModalEmailSend />
              </Nav.Item>
            )}
            <Nav.Item>
              <CardBadgeContainer>
                <Cart />
                {(orders.length > 0 || selectedPromos.length > 0) && (
                  <CardBadge>
                    <h6>{orders.length + selectedPromos.length}</h6>
                  </CardBadge>
                )}
              </CardBadgeContainer>
            </Nav.Item>
          </Navbar.Collapse>
        </Container>
      </StyledNavbar>
    </>
  );
}

export const StyledNavbar = styled(Navbar)`
  position: sticky !important;
  top: 0px !important;
  z-index: 1001;
`;
const Logo = styled.img`
  height: 25px;
`;

const CardBadgeContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardBadge = styled.h6`
  width: 20px;
  height: 20px;
  background-color: #000;
  border-radius: 50%;
  text-align: center;
  margin-left: -10px;
  color: #fff;
`;
const SelectorStyled = styled.select`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-left: 3px;
  // border: 2px solid var(--primaryColor);
  outline: none;
  border-radius: 15px;
  color: var(--primaryColor);
  font-size: 13px;
  cursor: pointer;
  background-color: rgba(
    var(--bs-tertiary-bg-rgb),
    var(--bs-bg-opacity)
  ) !important;
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;
const LanguageButton = styled.button`
margin-right:15px;
`
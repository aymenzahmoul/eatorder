import React, { useEffect, useState } from 'react'
import Modal from "react-modal";
import Form from "react-bootstrap/Form";
import { useSelector } from 'react-redux';
import { store } from '../../shared';
import { setEmail, setModalSendEmail, setModalSignup } from '../../shared/slice/ModalLogin/ModalLoginSlice';
import { sendEmail, signup } from '../../shared/slice/auth/AuthService';
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styled from 'styled-components';
import { eatorder } from '../../assets/images/exports';
import { setScroll } from '../../shared/slice/scroll/ScrollSlice';
import { useTranslation } from 'react-i18next';
export default function ModalSignup() {
  const { t } = useTranslation();

  const modalSignup = useSelector((state) => state.modalLogin.modalSignup);
  const email = useSelector((state) => state.modalLogin.email);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sexe, setSexe] = useState("homme");

  const scroll = useSelector((state) => state.scroll.scroll)

  useEffect(() => {
    if (modalSignup) {
      store.dispatch(setScroll({ scroll: scroll + 1 }));

    }
  }, [modalSignup]);

  const handleCloseSignup = () => {

    store.dispatch(setModalSignup({ modalSignup: false }));
    store.dispatch(setScroll({ scroll: scroll-1 }));

  }

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleEmailChange = (e) => {
    store.dispatch(setEmail({ email: e.target.value }));
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  
  const handlePConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handlePhoneNumberChange = (value, event) => {
    setPhoneNumber(value);
  };

  const handleSexeChange = (e) => {
    setSexe(e.target.value);
  };


  const handleSignup = async () => {
    if (!password || password.length < 8) {
      console.log("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    const newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      phoneNumber: phoneNumber,
      sexe: sexe,
    };

    try {
      const response = await signup(newUser);
      if (response) {
        // Assuming sendEmail is an asynchronous function that returns a response
        const emailResponse = await sendEmail(response.user._id);
        if (emailResponse) {
          setFirstName("");
          setLastName("");
          setPassword("");
          setConfirmPassword("");
          setPhoneNumber("");
          setSexe("");
          console.log("Account created successfully! Login to continue");
          store.dispatch(setModalSignup({ modalSignup: false }));
          store.dispatch(setModalSendEmail({ modalSendEmail: true }));
          store.dispatch(setScroll({ scroll: scroll - 1 }));

          // setShowSignup(false);
          // setShowSendEmail(true);
        } else {
          console.error("Error sending verification email");
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <StyledModalSignup
      isOpen={modalSignup}
      onRequestClose={handleCloseSignup}
    >
      <img
        src={eatorder}
        style={{
          width: "150px",
          height: "50px",
          objectFit: "contain",
          marginLeft: "29%"
        }}
      ></img>

      <h3 className="mb-5 mt-3">{t("Sign up")}</h3>
      <div style={{ display: "flex", width: '90%', marginLeft: '5%' }}>
        <Form.Control
          type="text"
          style={{ marginTop: '10px', marginBottom: '10px', width: '100%', borderRadius: '25px' }}
          placeholder={t("First Name")}           id="firstName"
          value={firstName}
          onChange={handleFirstNameChange}
          onKeyDown={e => e.stopPropagation()}
        />
        <Form.Control
          type="text"
          style={{ marginTop: '10px', marginBottom: '10px', marginLeft: '5%', width: '100%', borderRadius: '25px' }}
          placeholder={t("Last Name")} 
          id="lastName"
          value={lastName}
          onChange={handleLastNameChange}
          onKeyDown={e => e.stopPropagation()}
        />
      </div>
      <Form.Control
        type="email"
        style={{ marginTop: '10px', marginBottom: '10px', marginLeft: '5%', width: '90%', borderRadius: '25px' }}
        placeholder={t('Email Address')} 
        id="email"
        value={email}
        onChange={handleEmailChange}
        onKeyDown={e => e.stopPropagation()}
      />
      <PhoneInputNumber
        defaultCountry="FR"
        className="phone-input"
        placeholder={t("Enter Phone Number")} 
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
      />
      <div
        style={{ display: "flex", width: '90%', marginLeft: '5%' }}>

        <Form.Control
          type="password"
          style={{ marginTop: '10px', marginBottom: '10px', width: '100%', borderRadius: '25px', fontSize: '14px' }}
          placeholder={t("Password")}
          id="password"
          value={password}
          onChange={handlePasswordChange}
          onKeyDown={e => e.stopPropagation()}
        />
        <Form.Control
          type="password"
          className={`form-field ${password !== confirmPassword ? "error" : ""
            }`}
          style={{ marginTop: '10px', marginBottom: '10px', marginLeft: '5%', width: '100%', borderRadius: '25px', fontSize: '14px' }}
          placeholder={t("Confirm Password")}
          id="confirmpassword"
          value={confirmPassword}
          onChange={handlePConfirmPasswordChange}
          onKeyDown={e => e.stopPropagation()}
        />
        {password !== confirmPassword && (
          <div className="error-message">
            {t("Passwords do not match")}
          </div>
        )}
      </div>

      <Form.Control
        as="select"
        style={{ marginTop: '10px', marginBottom: '10px', marginLeft: '5%', width: '90%', borderRadius: '25px' }}
        id="sexe"
        value={sexe}
        onChange={handleSexeChange}
        onKeyDown={e => e.stopPropagation()}
      >
         <option value="homme">    {t("Male")}</option>
        <option value="femme">    {t("Female")}</option>
      </Form.Control>
      <SignupButton onClick={handleSignup} >
      {t("Signup")}
      </SignupButton>
    </StyledModalSignup>
  )
}

function ReactModalAdapter({ className, modalClassName, ...props }) {
  return (
    <Modal
      className={modalClassName}
      portalClassName={className}
      {...props}
    />
  )
}

const StyledModalSignup = styled(ReactModalAdapter).attrs({
  modalClassName: 'ModalSignup',
  overlayClassName: 'OverlaySignup'
})`
  .ModalSignup {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      padding: 20px;
      border-radius: 15px;
      min-height: 300px;
      width: 400px;
      text-align: center;
    }
      @media (max-width: 768px) {
        .Modal{
            width: 90%;
            min-width:90%;
        }
    }
  
  .OverlaySignup {
      background: rgba(0, 0, 0, 0.2);
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
  }
`
const SignupButton = styled.button`
color:#fff;
background:var(--primaryColor);
border:none;
border-radius: 25px;
width: 90%;
height: 40px;
font-size: 19px;
margin-bottom:20px;
margin-top:20px;

&:hover{
background: #fff;
border:1px solid var(--primaryColor);
color: var(--primaryColor);
}
`

const PhoneInputNumber = styled(PhoneInput)`
border-radius: 4px;
padding: 6px 12px;
font-size: 14px;
height: 10%;
margin-top: 10px;
margin-bottom: 10px;
margin-left: 15px;
width: 90%;
border-radius: 25px;
display: block;
padding: 0.375rem 0.75rem;
font-size: 1rem;
font-weight: 400;
line-height: 1.5;
color: #495057;
background-color: #fff;
background-clip: padding-box;
border: 1px solid #ced4da;
transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
`
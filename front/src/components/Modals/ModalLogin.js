import React, { useEffect, useState } from 'react'
import Form from "react-bootstrap/Form";
import Modal from "react-modal";
import { useSelector } from 'react-redux';
import { setModalLogin, setModalPrincipal, setModalResetPassword, setModalSendEmail } from '../../shared/slice/ModalLogin/ModalLoginSlice';
import { store } from '../../shared';
import { forgetPassword, login, sendEmail } from '../../shared/slice/auth/AuthService';
import { setLoggedInUser, setToken } from '../../shared/slice/auth/AuthSlice';
import { eatorder } from '../../assets/images/exports';
import styled from 'styled-components';
import { setScroll } from '../../shared/slice/scroll/ScrollSlice';
import { useTranslation } from 'react-i18next';
export default function ModalLogin() {
    const { t } = useTranslation();

    const loginModal = useSelector((state) => state.modalLogin.modalLogin);
    const emailExist = useSelector((state) => state.modalLogin.emailExist)
    const [passwordError, setPasswordError] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const scroll = useSelector((state) => state.scroll.scroll)

    useEffect(() => {
        if (loginModal) {
            store.dispatch(setScroll({ scroll: scroll + 1 }));

        }
    }, [loginModal]);

    const handleClose = () => {
        store.dispatch(setModalPrincipal({ modalPrincipal: false }));
        store.dispatch(setModalLogin({ modalLogin: false }));
        store.dispatch(setScroll({ scroll: scroll - 1 }));
        setEmail("");
        setPassword("");

    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleCloseLogin = () => {
        store.dispatch(setModalLogin({ modalLogin: false }));
        setEmail("");
        setPassword("");
        store.dispatch(setScroll({ scroll: scroll - 1 }));

    };
    const handleLogin = async () => {
        if (emailExist) {
            try {
                const user = {
                    email: email,
                    password: password,
                };
                const response = await login(user);
                if (response.user.verifid) {
                    store.dispatch(setToken({ token: response.token }))
                    store.dispatch(setLoggedInUser({ user: response.user }))
                    handleClose();
                    // window.location.reload();

                    // console.log(response);
                } else if (!user.verifid) {
                    const emailResponse = await sendEmail(response.data.user._id);
                    if (emailResponse) {
                        setPassword("");
                        store.dispatch(setModalLogin({ modalLogin: false }));
                        store.dispatch(setModalSendEmail({ modalSendEmail: true }));
                    } else {
                        console.error("Error sending verification email");
                    }
                } else {
                    console.error("Login failed");
                }


            } catch (error) {
                console.error("Error during login:", error);
                setPasswordError(true);
            }
        } else {
            store.dispatch(setModalLogin({ modalLogin: true }));
            store.dispatch(setModalPrincipal({ modalPrincipal: true }));
        }
    };
    const handleForgetPassword = async () => {
        try {
            const response = await forgetPassword({ email });
            if (response) {
                store.dispatch(setModalResetPassword({ modalResetPassword: true }));
                store.dispatch(setModalLogin({ modalLogin: false }));
                store.dispatch(setScroll({ scroll: scroll - 1 }));
            }
        } catch (err) {
            console.error(err);
        }


    };
    return (

        <StyledModalLogin
            isOpen={loginModal}
            onRequestClose={handleCloseLogin}

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

            <h3 className="mb-5 mt-3">{t("Sign in")}</h3>
            <Form.Control
                type="email"
                style={{ marginTop: '10px', marginBottom: '10px', marginLeft: '5%', width: '90%', borderRadius: '25px' }}
                placeholder={t('Email Address')}
                id="email"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={e => e.stopPropagation()}
            />

            <Form.Control
                type="password"
                className={`form-field ${passwordError ? "error" : ""}`}
                style={{ marginTop: '10px', marginBottom: '10px', marginLeft: '5%', width: '90%', borderRadius: '25px' }}
                placeholder={t("Password")}
                id="password"
                value={password}
                onChange={handlePasswordChange}
            />
            {passwordError && (
                <div className="error-message">{t("Passwords do not match")}</div>
            )}
            <LoginButton onClick={handleLogin}>
            {t("Login")}   
            </LoginButton>
            <a
                href=""
                style={{ color: "var(--primaryColor)", }}
                onClick={handleForgetPassword}
            >
         {t("Forget password")}    
            </a>
        </StyledModalLogin>
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

const StyledModalLogin = styled(ReactModalAdapter).attrs({
    modalClassName: 'Modal',
    overlayClassName: 'Overlay'
})`
    .Modal {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        padding: 20px;
        border-radius: 15px;
        height:400px;
        width: 400px;
        text-align: center;
    }
        @media (max-width: 768px) {
            .Modal{
                width: 90%;
                min-width:90%;
            }
        }
    
    .Overlay {
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
const LoginButton = styled.button`
    color:#fff;
    background:var(--primaryColor);
    border:none;
    border-radius: 25px;
    width: 100%;
    height: 40px;
    font-size: 19px;
    margin-bottom:10px;

  &:hover{
    background: #fff;
    border:1px solid var(--primaryColor);
    color: var(--primaryColor);
  }
  `
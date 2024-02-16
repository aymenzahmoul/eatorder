import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";
import {
    setEmail,
    setEmailExist,
    setModalLogin,
    setModalPrincipal,
    setModalSignup,
} from "../../shared/slice/ModalLogin/ModalLoginSlice";
import { BaseURI, store } from "../../shared";
import { checkEmail, login } from "../../shared/slice/auth/AuthService";
import { eatorder } from "../../assets/images/exports";
import styled from "styled-components";
import { setScroll } from "../../shared/slice/scroll/ScrollSlice";
import { useTranslation } from "react-i18next";

export default function ModalPrincipal() {
    const { t } = useTranslation();

    const principalModal = useSelector(
        (state) => state.modalLogin.modalPrincipal
    );
    const auth = useSelector((state) => state.authentification);
    const email = useSelector((state) => state.modalLogin.email);
    const [password, setPassword] = useState("");
    const scroll = useSelector((state) => state.scroll.scroll);

    useEffect(() => {
        if (principalModal) {
            store.dispatch(setScroll({ scroll: scroll + 1 }));
        }
    }, [principalModal]);

    const handleClose = () => {
        store.dispatch(setModalPrincipal({ modalPrincipal: false }));
        store.dispatch(setEmail({ email: "" }));
        setPassword("");
        store.dispatch(setScroll({ scroll: scroll - 1 }));
    };

    const handleEmailChange = (e) => {
        store.dispatch(setEmail({ email: e.target.value }));
    };

    const checkEmailValid = async () => {
        await checkEmail({ email })
            .then((res) => {
                if (res.exists === true) {
                    store.dispatch(setEmailExist({ emailExist: true }));
                    store.dispatch(setModalPrincipal({ modalPrincipal: false }));
                    store.dispatch(setModalLogin({ modalLogin: true }));
                    store.dispatch(setScroll({ scroll: scroll - 1 }));
                } else {
                    store.dispatch(setEmailExist({ emailExist: false }));
                    store.dispatch(setModalPrincipal({ modalPrincipal: false }));
                    store.dispatch(setModalSignup({ modalSignup: true }));
                    store.dispatch(setScroll({ scroll: scroll - 1 }));
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const googleAuth = async () => {
        try {
            const loginWindow = window.open(
                `${BaseURI}/client/google/callback`,
                "Google Login",
                "width=600, height=400"
            );

            if (
                !loginWindow ||
                loginWindow.closed ||
                typeof loginWindow.closed === "undefined"
            ) {
                throw new Error("The pop-up window was blocked.");
            }

            loginWindow.addEventListener("load", () => {
                if (
                    loginWindow.location.href === "http://localhost:3000/select-store"
                ) {
                    loginWindow.close();
                    window.location.reload();
                }
            });
        } catch (error) {
            console.error("Verification Error:", error);
        }
    };

    return (
        <>
            <StyledModalPrincipal
                isOpen={principalModal}
                onRequestClose={handleClose}
            >
                <img
                    src={eatorder}
                    style={{
                        width: "150px",
                        height: "50px",
                        objectFit: "contain",
                        marginBottom: "15%",
                        marginLeft: "29%",
                    }}
                ></img>
                <Form.Control
                    style={{
                        marginTop: "10px",
                        marginBottom: "10px",
                        marginLeft: "5%",
                        width: "90%",
                        borderRadius: "25px",
                    }}
                    type="email"
                    placeholder={t('Email Address')}
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    onKeyDown={(e) => e.stopPropagation()}
                />
                <LoginButton onClick={checkEmailValid}>
                    {t('Continue')}
                </LoginButton>
                <p> {t('Or')}</p>
                <hr></hr>
                <GoogleLoginButton onClick={googleAuth}>
                    <svg
                        width="25"
                        height="24"
                        viewBox="0 0 25 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12.75 24C19.3774 24 24.75 18.6274 24.75 12C24.75 5.37258 19.3774 0 12.75 0C6.12258 0 0.75 5.37258 0.75 12C0.75 18.6274 6.12258 24 12.75 24Z"
                            fill="white"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M19.95 12.1708C19.95 11.639 19.9023 11.1276 19.8136 10.6367H12.75V13.5379H16.7864C16.6125 14.4754 16.0841 15.2697 15.2898 15.8015V17.6833H17.7136C19.1318 16.3776 19.95 14.4549 19.95 12.1708Z"
                            fill="#4285F4"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.7501 19.4998C14.7751 19.4998 16.4729 18.8282 17.7138 17.6828L15.2899 15.8009C14.6183 16.2509 13.7592 16.5168 12.7501 16.5168C10.7967 16.5168 9.1433 15.1975 8.55353 13.4248H6.04785V15.368C7.28194 17.8191 9.8183 19.4998 12.7501 19.4998Z"
                            fill="#34A853"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.55341 13.425C8.40341 12.975 8.31818 12.4943 8.31818 12C8.31818 11.5057 8.40341 11.025 8.55341 10.575V8.63184H6.04773C5.53977 9.64434 5.25 10.7898 5.25 12C5.25 13.2102 5.53977 14.3557 6.04773 15.3682L8.55341 13.425Z"
                            fill="#FBBC05"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.7501 7.48295C13.8513 7.48295 14.8399 7.86136 15.6172 8.60455L17.7684 6.45341C16.4695 5.24318 14.7717 4.5 12.7501 4.5C9.8183 4.5 7.28194 6.18068 6.04785 8.63182L8.55353 10.575C9.1433 8.80227 10.7967 7.48295 12.7501 7.48295Z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span>                        {t('Continue with Google')}
</span>
                </GoogleLoginButton>
            </StyledModalPrincipal>
        </>
    );
}

function ReactModalAdapter({ className, modalClassName, ...props }) {
    return (
        <Modal className={modalClassName} portalClassName={className} {...props} />
    );
}

const StyledModalPrincipal = styled(ReactModalAdapter).attrs({
    modalClassName: "Modal",
    overlayClassName: "Overlay",
})`
  .Modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    padding: 20px;
    border-radius: 15px;
    height: 400px;
    width: 400px;
    text-align: center;
  }
  @media (max-width: 768px) {
    .Modal {
      width: 90%;
      min-width: 90%;
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
`;
const LoginButton = styled.button`
  color: #fff;
  background: var(--primaryColor);
  border: none;
  border-radius: 25px;
  width: 90%;
  height: 40px;
  font-size: 19px;

  &:hover {
    background: #fff;
    border: 1px solid var(--primaryColor);
    color: var(--primaryColor);
  }
`;
const GoogleLoginButton = styled.button`
  display: flex;
  padding: 2%;
  width: 90%;
  background: #4285f4;
  color: white;
  border-radius: 25px;
  font-size: 17px;
  margin-left: 5%;
  justify-content: center;
  height: 40px;
`;

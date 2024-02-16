import React, { useEffect, useState } from 'react'
import Modal from "react-modal";
import { setModalLogin, setModalResetPassword } from '../../shared/slice/ModalLogin/ModalLoginSlice';
import { store } from '../../shared';
import { forgetPassword } from '../../shared/slice/auth/AuthService';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { setScroll } from '../../shared/slice/scroll/ScrollSlice';
import { useTranslation } from 'react-i18next';
export default function ModalResetPassword() {
  const { t } = useTranslation();
  const email = useSelector((state) => state.modalLogin.email);
  const modalResetPassword = useSelector((state) => state.modalLogin.modalResetPassword)

  const scroll = useSelector((state) => state.scroll.scroll)

  useEffect(() => {
    if (modalResetPassword) {
      store.dispatch(setScroll({ scroll: scroll + 1 }));
    }
  }, [modalResetPassword]);

  const handleCloseResetPassword = () => {
    // setShowResetPassword(false);
    store.dispatch(setModalResetPassword({ modalResetPassword: false }));
    store.dispatch(setScroll({ scroll: scroll - 1 }));

  }
  const handleForgetPassword = async () => {
    try {
      const response = await forgetPassword({ email });
      if (response) {
        store.dispatch(setModalLogin({ modalLogin: false }));
        // setShowResetPassword(true);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <StyledModalLogin
      isOpen={modalResetPassword}
      onRequestClose={handleCloseResetPassword}

    >
      <h3>{t('Email has been send, check your email!')}</h3>

      <a href="" onClick={handleForgetPassword}>
       {t('Resend Email')}
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


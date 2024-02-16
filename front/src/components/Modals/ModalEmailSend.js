import React, { useEffect, useState } from 'react'
import Modal from "react-modal";
import { setModalSendEmail } from '../../shared/slice/ModalLogin/ModalLoginSlice';
import { store } from '../../shared';
import { useSelector } from 'react-redux';
import { setScroll } from '../../shared/slice/scroll/ScrollSlice';
import styled from 'styled-components';
export default function ModalEmailSend() {

  const modalSendEmail = useSelector((state) => state.modalLogin.modalSendEmail);
  const scroll = useSelector((state) => state.scroll.scroll)

  useEffect(() => {
    if (modalSendEmail) {
      store.dispatch(setScroll({ scroll: scroll + 1 }));

    }
  }, [modalSendEmail]);
  
  const handleCloseSendEmail = () => {
    store.dispatch(setModalSendEmail({ modalSendEmail: false }));
    store.dispatch(setScroll({ scroll: scroll - 1 }));


    // setShowSendEmail(false);
  }
  return (
    <StyledModalSignup
      isOpen={modalSendEmail}
      onRequestClose={handleCloseSendEmail}
     
    >
      <h3>Email has been send, check your email!</h3>

      <a href="">Resend Email</a>
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
  modalClassName: 'ModalEmailSend',
  overlayClassName: 'OverlaylEmailSend'
})`
  .ModalEmailSend {
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
  
  .OverlaylEmailSend {
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
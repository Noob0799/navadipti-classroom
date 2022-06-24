import { useState } from "react";
import Toast from "react-bootstrap/Toast";

const ToastBox = ({ closeToast, variant, toastHeading, toastBody }) => {
  return (
    <>
      <Toast
        className="d-inline-block m-1"
        bg={variant}
        autohide
        delay={2000}
        onClose={closeToast}
      >
        <Toast.Header closeButton={false}>
          <strong className="me-auto">{toastHeading}</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{toastBody}</Toast.Body>
      </Toast>
    </>
  );
};

export default ToastBox;

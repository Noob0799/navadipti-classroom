import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const ConfirmDeletionModal = ({ show, close, handleDelete }) => {
  return (
    <>
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="delete-modal-body">
          <div className="delete-modal-content">Are you sure you want to progress with deletion ?</div>
          <div className="delete-modal-btn-container">
          <Button
            variant="danger"
            className="delete-modal-btn"
            onClick={handleDelete}
          >
            Delete
          </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ConfirmDeletionModal;

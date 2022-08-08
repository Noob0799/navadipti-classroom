import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import ImageViewerModal from "../imageViewerModal/ImageViewerModal";

const TeacherSubmissionViewerModal = ({ show, close, files }) => {
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState([]);

  const handleShow = (images) => {
    setImages(images);
    setShowModal(true);
  };
  const handleClose = () => setShowModal(false);
  return (
    <>
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title>Students' Submissions</Modal.Title>
        </Modal.Header>
        <Modal.Body className="teacher-submission-modal-body">
          <Table striped bordered hover variant="dark" className="teacher-submission-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Name</th>
                <th>Roll</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                return (
                  <tr key={file.studentId}>
                    <td>{file.studentClass}</td>
                    <td>{file.studentName}</td>
                    <td>{file.studentRoll}</td>
                    <td>
                      <Button
                        variant="warning"
                        className="list-item-body-btn"
                        onClick={() => handleShow(file.images)}
                      >
                        Images
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
      <ImageViewerModal
        show={showModal}
        close={handleClose}
        files={images}
      />
    </>
  );
};

export default TeacherSubmissionViewerModal;

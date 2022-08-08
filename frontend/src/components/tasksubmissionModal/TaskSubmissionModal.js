import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ImageViewerModal from "../imageViewerModal/ImageViewerModal";
import { useState } from "react";
import Axios from "axios";
import { storage } from "../../firebase/index";
import { useNavigate } from "react-router-dom";

const TaskSubmissionModal = ({ show, close, id }) => {
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const navigate = useNavigate();

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget,
      params = {};
    let url = "",
      response;
    if (!form.checkValidity()) {
      e.stopPropagation();
    } else {
      params.taskId = id;
      params.images = [];
      selectedImageFiles.forEach((file) => {
        const nameArr = file.name.split(".");
        const timeStamp = new Date();
        const fileName = `${nameArr[0].slice(0, 10)}_${timeStamp}.${
          nameArr[1]
        }`;
        const uploadTask = storage
          .ref(`images/${process.env.NODE_ENV === "production" ? "production/" : ""}completedTask/${fileName}`)
          .put(file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {},
          (error) => {
            console.log("Firebase image upload error!!", error);
          },
          async () => {
            url = await storage
              .ref(`images/${process.env.NODE_ENV === "production" ? "production/" : ""}completedTask/`)
              .child(fileName)
              .getDownloadURL();
            params.images.push({
              name: fileName,
              url: url,
            });
            if (selectedImageFiles.length === params.images.length) {
              try {
                response = await Axios.post(
                  `/task/submitTask`,
                  params,
                  {
                    headers: {
                      Authorization: `Bearer ${sessionStorage.getItem(
                        "token"
                      )}`,
                    },
                  }
                );
                if (response.data.status === "Success") {
                  console.log("Task submitted successfully!!");
                  close();
                }
              } catch (error) {
                console.log("Task submission failed!!", error);
                try {
                  const deleteTask = storage.ref(
                    `images/${process.env.NODE_ENV === "production" ? "production/" : ""}completedTask/${fileName}`
                  );
                  await deleteTask.delete();
                  if (error.response.data.type === "TokenExpiredError") {
                    setTimeout(() => {
                      navigate("/");
                    }, 2000);
                  }
                } catch (err) {
                  console.log(
                    "Failed to delete uploaded image. Please contact admin!!"
                  );
                  if (error.response.data.type === "TokenExpiredError") {
                    setTimeout(() => {
                      navigate("/");
                    }, 2000);
                  }
                }
              }
            }
          }
        );
      });
    }

    setValidated(true);
  };
  const fileSelectedHandler = (e) => {
    const fileList = e.target.files,
      oFiles = [];
    setSelectedImageFiles([...fileList]);
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        oFiles.push({ name: file.name, src: String(reader.result) });
      };
      reader.onloadend = () => {
        setImageFiles([...oFiles]);
      };
      reader.readAsDataURL(file);
    });
  };
  return (
    <>
      <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Task</Modal.Title>
        </Modal.Header>
        <Modal.Body className="submission-modal-body">
          <Form
            noValidate
            validated={validated}
            onSubmit={handleSubmit}
            className="form-container"
          >
            <Form.Group className="mb-3" controlId="formFileMultiple">
              <Form.Label className="form-label">
                * Upload files/images:
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={fileSelectedHandler}
                required
              />
            </Form.Group>
            <div className="form-btn-container">
              {imageFiles.length ? (
                <Button
                  variant="warning"
                  className="form-btn-container-btn"
                  onClick={handleShow}
                >
                  Preview
                </Button>
              ) : null}
              <Button
                variant="success"
                className="form-btn-container-btn"
                type="submit"
              >
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <ImageViewerModal
        show={showModal}
        close={handleClose}
        files={imageFiles}
      />
    </>
  );
};

export default TaskSubmissionModal;

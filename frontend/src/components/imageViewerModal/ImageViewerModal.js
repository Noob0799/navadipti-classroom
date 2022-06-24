import Modal from "react-bootstrap/Modal";
import Carousel from "react-bootstrap/Carousel";

const ImageViewerModal = ({ show, close, files }) => {
  return (
    <>
      <Modal show={show} onHide={close} className="">
        <Modal.Header closeButton>
          <Modal.Title>Uploaded Images</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Carousel>
            {files.map((file, id) => (
              <Carousel.Item key={id}>
                <img
                  className="d-block w-100"
                  src={file.src}
                  alt={file.name}
                />
                <Carousel.Caption>
                  <h3>{file.name}</h3>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ImageViewerModal;

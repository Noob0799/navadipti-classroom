import { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import ImageViewerModal from "../../components/imageViewerModal/ImageViewerModal";

const AccordionItem = (props) => {
  console.log(props);
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  return (
    <>
      <Accordion.Item eventKey={props.id} className="list-item">
        <Accordion.Header>
          <div className="list-item-header">
            {props.class && (
              <div>
                <span className="list-item-label">Class:</span>{" "}
                <span className="list-item-value">{props.class}</span>
              </div>
            )}
            {props.dueDate && (
              <div>
                <span className="list-item-label">Due Date:</span>{" "}
                <span className="list-item-value">
                  {props.dueDate.split("T")[0]}
                </span>
              </div>
            )}
            {props.term && (
              <div>
                <span className="list-item-label">Term:</span>{" "}
                <span className="list-item-value">{props.term}</span>
              </div>
            )}
            {props.subject && (
              <div>
                <span className="list-item-label">Subject:</span>{" "}
                <span className="list-item-value">{props.subject}</span>
              </div>
            )}
            {props.taskType && (
              <div>
                <span className="list-item-label">Task Type:</span>{" "}
                <span className="list-item-value">{props.taskType}</span>
              </div>
            )}
          </div>
        </Accordion.Header>
        <Accordion.Body>
          <div className="list-item-body">
            <div>{props.instructions}</div>
            {props.images.length && (
              <div>
                <Button variant="warning" onClick={handleShow}>
                  Images
                </Button>
              </div>
            )}
          </div>
        </Accordion.Body>
      </Accordion.Item>
      <ImageViewerModal
        show={showModal}
        close={handleClose}
        files={props.images}
      />
    </>
  );
};

export default AccordionItem;

import { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import ImageViewerModal from "../imageViewerModal/ImageViewerModal";
import TaskSubmissionModal from "../tasksubmissionModal/TaskSubmissionModal";

const AccordionItem = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [option, setOption] = useState("task");

  const handleShow = (option) => {
    setOption(option);
    setShowModal(true);
  };
  const handleClose = () => setShowModal(false);
  const handleSubmissionShow = () => setShowSubmissionModal(true);
  const handleSubmissionClose = () => setShowSubmissionModal(false);
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
            {props.date && (
              <div>
                <span className="list-item-label">Date:</span>{" "}
                <span className="list-item-value red-alert">
                  {props.date.split("T")[0]}
                </span>
              </div>
            )}
            {props.time && (
              <div>
                <span className="list-item-label">Time:</span>{" "}
                <span className="list-item-value red-alert">
                  {props.time.split(":")[0]}:{props.time.split(":")[1]}
                </span>
              </div>
            )}
            {props.dueDate && (
              <div>
                <span className="list-item-label">Due Date:</span>{" "}
                <span className="list-item-value red-alert">
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
            <div>
              {props.role === "student" &&
              !(props.submittedImages && props.submittedImages.length) ? (
                <Button
                  variant="success"
                  className="list-item-body-btn"
                  onClick={handleSubmissionShow}
                >
                  Submit
                </Button>
              ) : null}
              {props.submittedImages && props.submittedImages.length ? (
                <Button
                  variant="warning"
                  className="list-item-body-btn"
                  onClick={() => handleShow("submitted")}
                >
                  Submitted
                </Button>
              ) : null}
              {props.images && props.images.length ? (
                <Button
                  variant="warning"
                  className="list-item-body-btn"
                  onClick={() => handleShow("task")}
                >
                  Task
                </Button>
              ) : null}
            </div>
          </div>
        </Accordion.Body>
      </Accordion.Item>
      <ImageViewerModal
        show={showModal}
        close={handleClose}
        files={option === "task" ? props.images : props.submittedImages}
      />
      <TaskSubmissionModal
        show={showSubmissionModal}
        close={handleSubmissionClose}
        id={props.id}
      />
    </>
  );
};

export default AccordionItem;

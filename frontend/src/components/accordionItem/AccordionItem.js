import { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import ImageViewerModal from "../imageViewerModal/ImageViewerModal";
import TeacherSubmissionViewerModal from "../teacherSubmissionModal/TeacherSubmissionModal";
import TaskSubmissionModal from "../tasksubmissionModal/TaskSubmissionModal";
import ConfirmDeletionModal from "../confirmDeletionModal/ConfirmDeletionModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const AccordionItem = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showTeacherSubmissionModal, setShowTeacherSubmissionModal] = useState(false);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [option, setOption] = useState("set");

  const handleShow = (option) => {
    setOption(option);
    if(option === "set") {
      setShowModal(true);
    } else {
      setShowTeacherSubmissionModal(true);
    }
  };
  const handleClose = () => {
    if(option === "set") {
      setShowModal(false);
    } else {
      setShowTeacherSubmissionModal(false);
    }
  }
  const handleSubmissionShow = () => setShowSubmissionModal(true);
  const handleSubmissionClose = () => {
    setShowSubmissionModal(false);
    props.getTasks();
  }
  const handleDeletionClose = () => setShowDeletionModal(false);
  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeletionModal(true);
  };
  const deleteItem = () => {
    setShowDeletionModal(false);
    props.deleteItem();
  };
  return (
    <>
      {props.mode === "user" ? (
        <Accordion.Item eventKey={props.id} className="list-item">
          <Accordion.Header>
            <div className="list-item-header">
              {props.identity && (
                <div>
                  <span className="list-item-label">Identity:</span>{" "}
                  <span className="list-item-value">{props.identity}</span>
                </div>
              )}
              {props.name && (
                <div>
                  <span className="list-item-label">Name:</span>{" "}
                  <span className="list-item-value">{props.name}</span>
                </div>
              )}
            </div>
            {props.identity !== "principal" && (
              <div className="list-item-delete">
                <FontAwesomeIcon
                  icon={faTrash}
                  className="item-delete"
                  onClick={handleDelete}
                />
              </div>
            )}
          </Accordion.Header>
          <Accordion.Body>
            <div className="list-item-body">
              {props.class && (
                <div>
                  <div className="list-item-label">Class:</div>{" "}
                  <div className="list-item-value">{props.class}</div>
                </div>
              )}
              <div>
                <div className="list-item-label">Phone:</div>{" "}
                <div className="list-item-value">{props.phone}</div>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      ) : (
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
              {props.role !== "student" && (
                <div className="list-item-delete">
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="item-delete"
                    onClick={handleDelete}
                  />
                </div>
              )}
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
                      onClick={() => handleShow("set")}
                    >
                      Images
                    </Button>
                  ) : null}
                </div>
              </div>
            </Accordion.Body>
          </Accordion.Item>
          <ImageViewerModal
            show={showModal}
            close={handleClose}
            files={option === "set" ? props.images : props.submittedImages[0].images}
          />
          <TeacherSubmissionViewerModal
            show={showTeacherSubmissionModal}
            close={handleClose}
            files={props.submittedImages ? props.submittedImages : []}
          />
          <TaskSubmissionModal
            show={showSubmissionModal}
            close={handleSubmissionClose}
            id={props.id}
          />
        </>
      )}
      <ConfirmDeletionModal
        show={showDeletionModal}
        close={handleDeletionClose}
        handleDelete={() => deleteItem()}
      />
    </>
  );
};

export default AccordionItem;

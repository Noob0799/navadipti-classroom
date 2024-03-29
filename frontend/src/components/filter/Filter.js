import { useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const Filter = ({ page, filter }) => {
  const [identity, setIdentity] = useState("teacher");
  const studentClass = useRef("Any");
  const subject = useRef("Any");
  const taskType = useRef("Any");
  const term = useRef("Any");
  const handleIdentityChange = (e) => {
    setIdentity(e.target.value);
  };
  const handleFilter = () => {
    let filterObj = {};
    if (page === "User") {
      filterObj = {
        identity,
        studentClass: identity === "student" ? studentClass.current.value : null,
      };
    } else {
      filterObj = {
        studentClass: studentClass.current.value,
        subject: subject.current.value,
        taskType: taskType.current.value,
        term: term.current.value,
      };
    }
    document.querySelector(".accordion-button").click();
    filter(filterObj);
  };
  return (
    <Accordion>
      <Accordion.Item eventKey="0" className="filter-item" id="filterBtn">
        <Accordion.Header className="filter-header">
          Apply {page} Filters{" "}
          <FontAwesomeIcon icon={faFilter} className="filter-icon" />
        </Accordion.Header>
        <Accordion.Body className="filter-body">
          {page === "User" && (
            <Form.Group className="mb-3" controlId="validationCustomIdentity">
              <Form.Label className="form-label">Identity:</Form.Label>
              <Form.Select
                aria-label="Identity"
                className="form-select"
                onChange={handleIdentityChange}
                required
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </Form.Select>
            </Form.Group>
          )}
          {(page === "Task" ||
            page === "Syllabus" ||
            page === "Announcement" ||
            (page === "User" && identity === "student")) && (
            <Form.Group className="mb-3" controlId="validationCustomClass">
              <Form.Label className="form-label">Class:</Form.Label>
              <Form.Select
                aria-label="Class"
                className="form-select"
                ref={studentClass}
                required
              >
                <option value="Any">Any</option>
                <option value="Nursery">Nursery</option>
                <option value="KG">KG</option>
                <option value="Transition">Transition</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </Form.Select>
            </Form.Group>
          )}
          {(page === "Task" || page === "Syllabus") && (
            <Form.Group className="mb-3" controlId="validationCustomSubject">
              <Form.Label className="form-label">Subject:</Form.Label>
              <Form.Select
                aria-label="Subject"
                className="form-select"
                ref={subject}
                required
              >
                <option value="Any">Any</option>
                <option value="English">English</option>
                <option value="Bengali">Bengali</option>
                <option value="Mathematics">Mathematics</option>
                <option value="GK">GK</option>
                <option value="EVS">EVS</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Science">Science</option>
                <option value="Computer">Computer</option>
              </Form.Select>
            </Form.Group>
          )}
          {page === "Task" && (
            <Form.Group className="mb-3" controlId="validationCustomTaskType">
              <Form.Label className="form-label">Task Type:</Form.Label>
              <Form.Select
                aria-label="Task Type"
                className="form-select"
                ref={taskType}
                required
              >
                <option value="Any">Any</option>
                <option value="CW">Classwork</option>
                <option value="HW">Homework</option>
              </Form.Select>
            </Form.Group>
          )}
          {(page === "Task" || page === "Syllabus") && (
            <Form.Group className="mb-3" controlId="validationCustomTerm">
              <Form.Label className="form-label">Term:</Form.Label>
              <Form.Select
                aria-label="Term"
                className="form-select"
                ref={term}
                required
              >
                <option value="Any">Any</option>
                <option value="None">None</option>
                <option value="CT1">Class Test 1</option>
                <option value="HY">Half-yearly</option>
                <option value="CT2">Class Test 2</option>
                <option value="Annual">Annual</option>
              </Form.Select>
            </Form.Group>
          )}
          <div className="form-btn-container">
            <Button
              variant="warning"
              className="apply-filter-btn"
              onClick={handleFilter}
            >
              Filter
            </Button>
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default Filter;

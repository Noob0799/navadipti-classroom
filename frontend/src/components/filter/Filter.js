import { useRef } from "react";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const Filter = ({ page }) => {
  const studentClass = useRef("Any");
  const subject = useRef("Any");
  const taskType = useRef("Any");
  const term = useRef("Any");
  return (
    <Accordion>
      <Accordion.Item eventKey="0" className="filter-item">
        <Accordion.Header className="filter-header">
          Apply Filters <FontAwesomeIcon icon={faFilter} className="filter-icon"/>
        </Accordion.Header>
        <Accordion.Body className="filter-body">
          {page === "TaskView" && (
            <Form.Group className="mb-3" controlId="validationCustomClass">
              <Form.Label className="form-label">Class:</Form.Label>
              <Form.Select aria-label="Class" ref={studentClass} required>
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
          {page === "TaskView" && (
            <Form.Group className="mb-3" controlId="validationCustomSubject">
              <Form.Label className="form-label">Subject:</Form.Label>
              <Form.Select aria-label="Subject" ref={subject} required>
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
          {page === "TaskView" && (
            <Form.Group className="mb-3" controlId="validationCustomTaskType">
              <Form.Label className="form-label">Task Type:</Form.Label>
              <Form.Select aria-label="Task Type" ref={taskType} required>
                <option value="Any">Any</option>
                <option value="CW">Classwork</option>
                <option value="HW">Homework</option>
              </Form.Select>
            </Form.Group>
          )}
          {page === "TaskView" && (
            <Form.Group className="mb-3" controlId="validationCustomTerm">
              <Form.Label className="form-label">Term:</Form.Label>
              <Form.Select aria-label="Term" ref={term} required>
                <option value="Any">Any</option>
                <option value="None">None</option>
                <option value="CT1">Class Test 1</option>
                <option value="HY">Half-yearly</option>
                <option value="CT2">Class Test 2</option>
                <option value="Annual">Annual</option>
              </Form.Select>
            </Form.Group>
          )}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default Filter;

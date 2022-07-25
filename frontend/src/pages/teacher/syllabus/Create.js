import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import ImageViewerModal from "../../../components/imageViewerModal/ImageViewerModal";
import Axios from "axios";
import jwt_decode from "jwt-decode";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "../../../firebase/index";
import { toast } from "react-toastify";

const Create = ({ viewSyllabus }) => {
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [studentClass, setStudentClass] = useState("Nursery");
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isCreatingSyllabus, setIsCreatingSyllabus] = useState(false);
  const navigate = useNavigate();
  const subject = useRef("English");
  const term = useRef("CT1");
  const instructions = useRef("");

  useEffect(() => {
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    const index = window.location.pathname.split("/").findIndex((val) => {
      return val === role || (val === "teacher" && role === "principal");
    });
    if (index < 0) {
      navigate("/");
    }
  }, []);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget,
      params = {};
    let url = "",
      response;
    if (!form.checkValidity()) {
      e.stopPropagation();
    } else {
      setIsCreatingSyllabus(true);
      params.class = studentClass;
      params.subject = subject.current.value;
      params.term = term.current.value;
      params.instructions = instructions.current.value;
      params.images = [];
      selectedImageFiles.forEach((file) => {
        const nameArr = file.name.split(".");
        const timeStamp = new Date();
        const fileName = `${nameArr[0].slice(0, 10)}_${timeStamp}.${
          nameArr[1]
        }`;
        const uploadSyllabus = storage
          .ref(`images/syllabus/${fileName}`)
          .put(file);
        uploadSyllabus.on(
          "state_changed",
          (snapshot) => {},
          (error) => {
            console.log("Firebase image upload error!!", error);
            toast.error("Firebase image upload error!!");
          },
          async () => {
            url = await storage
              .ref("images/syllabus/")
              .child(fileName)
              .getDownloadURL();
            params.images.push({
              name: fileName,
              url: url,
            });
            if (selectedImageFiles.length === params.images.length) {
              try {
                response = await Axios.post(
                  "http://localhost:5000/syllabus/createSyllabus",
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
                  console.log("Syllabus created successfully!!");
                  toast.success("Syllabus created successfully!!");
                  setTimeout(() => {
                    setIsCreatingSyllabus(false);
                    viewSyllabus();
                  }, 2000);
                }
              } catch (error) {
                setIsCreatingSyllabus(false);
                console.log("Syllabus creation failed!!", error);
                toast.error("Syllabus creation failed!!");
                try {
                  const deleteSyllabus = storage.ref(
                    `images/syllabus/${fileName}`
                  );
                  await deleteSyllabus.delete();
                  if (error.response.data.type === "TokenExpiredError") {
                    toast.error("Session timeout. Please login again!!");
                    setTimeout(() => {
                      navigate("/");
                    }, 2000);
                  }
                } catch (err) {
                  console.log(
                    "Failed to delete uploaded image. Please contact admin!!"
                  );
                  toast.error(
                    "Failed to delete uploaded image. Please contact admin!!"
                  );
                  if (error.response.data.type === "TokenExpiredError") {
                    toast.error("Session timeout. Please login again!!");
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

  const handleStudentClass = (e) => {
    setStudentClass(e.target.value);
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
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className="form-container"
      >
        <Form.Group className="mb-3" controlId="validationCustomClass">
          <Form.Label className="form-label">* Class:</Form.Label>
          <Form.Select
            aria-label="Class"
            onChange={handleStudentClass}
            required
          >
            <option value="Nursery">Nursery</option>
            <option value="KG">KG</option>
            <option value="Transition">Transition</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="validationCustomSubject">
          <Form.Label className="form-label">* Subject:</Form.Label>
          <Form.Select aria-label="Subject" ref={subject} required>
            <option value="English">English</option>
            <option value="Bengali">Bengali</option>
            <option value="Mathematics">Mathematics</option>
            <option value="GK">GK</option>
            {studentClass !== "Nursery" &&
            studentClass !== "KG" &&
            studentClass !== "Transition" &&
            studentClass !== "1" ? (
              <>
                <option value="EVS">EVS</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Science">Science</option>
                <option value="Computer">Computer</option>
              </>
            ) : null}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="validationCustomTerm">
          <Form.Label className="form-label">* Term:</Form.Label>
          <Form.Select aria-label="Term" ref={term} required>
            <option value="CT1">Class Test 1</option>
            <option value="HY">Half-yearly</option>
            <option value="CT2">Class Test 2</option>
            <option value="Annual">Annual</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formFileMultiple">
          <Form.Label className="form-label">* Upload files/images:</Form.Label>
          <Form.Control
            type="file"
            multiple
            onChange={fileSelectedHandler}
            required
          />
        </Form.Group>
        {imageFiles.length ? (
          <div className="form-btn-container">
            <Button variant="warning" onClick={handleShow}>
              Preview
            </Button>
          </div>
        ) : null}
        <Form.Group className="mb-3" controlId="validationCustomInstructions">
          <Form.Label className="form-label">
            * General Instructions:
          </Form.Label>
          <Form.Control as="textarea" rows={3} ref={instructions} required />
        </Form.Group>
        <div className="form-btn-container">
          <Button type="submit" variant="success" disabled={isCreatingSyllabus}>
            {isCreatingSyllabus ? (
              <>
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              </>
            ) : (
              "Create Syllabus"
            )}
          </Button>
        </div>
      </Form>
      <ImageViewerModal
        show={showModal}
        close={handleClose}
        files={imageFiles}
      />
    </>
  );
};

export default Create;

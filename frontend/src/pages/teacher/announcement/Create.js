import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Axios from "axios";
import jwt_decode from "jwt-decode";
import ImageViewerModal from "../../../components/imageViewerModal/ImageViewerModal";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "../../../firebase/index";
import { toast } from "react-toastify";

const Create = ({ viewAnnouncement }) => {
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const navigate = useNavigate();
  const studentClass = useRef("All");
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget,
      params = {};
    let url = "",
      response;
    if (!form.checkValidity()) {
      e.stopPropagation();
    } else {
      setIsCreatingAnnouncement(true);
      params.class = studentClass.current.value;
      params.date = date;
      params.time = time;
      params.instructions = instructions.current.value;
      params.images = [];
      if (selectedImageFiles.length) {
        selectedImageFiles.forEach((file) => {
          const nameArr = file.name.split(".");
          const timeStamp = new Date();
          const fileName = `${nameArr[0].slice(0, 10)}_${timeStamp}.${
            nameArr[1]
          }`;
          const uploadAnnouncement = storage
            .ref(`images/announcement/${fileName}`)
            .put(file);
          uploadAnnouncement.on(
            "state_changed",
            (snapshot) => {},
            (error) => {
              console.log("Firebase image upload error!!", error);
              toast.error("Firebase image upload error!!");
            },
            async () => {
              url = await storage
                .ref("images/announcement/")
                .child(fileName)
                .getDownloadURL();
              params.images.push({
                name: fileName,
                url: url,
              });
              if (selectedImageFiles.length === params.images.length) {
                try {
                  response = await Axios.post(
                    `${process.env.REACT_APP_BASE_URL}/announcement/createAnnouncement`,
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
                    console.log("Announcement created successfully!!");
                    toast.success("Announcement created successfully!!");
                    setTimeout(() => {
                      setIsCreatingAnnouncement(false);
                      viewAnnouncement();
                    }, 2000);
                  }
                } catch (error) {
                  setIsCreatingAnnouncement(false);
                  console.log("Announcement creation failed!!", error);
                  toast.error("Announcement creation failed!!");
                  try {
                    const deleteAnnouncement = storage.ref(
                      `images/announcement/${fileName}`
                    );
                    await deleteAnnouncement.delete();
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
                    toast.error("Failed to delete uploaded image. Please contact admin!!");
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
      } else {
        try {
          response = await Axios.post(
            `${process.env.REACT_APP_BASE_URL}/announcement/createAnnouncement`,
            params,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            }
          );
          if (response.data.status === "Success") {
            console.log("Announcement created successfully!!");
            toast.success("Announcement created successfully!!");
            setTimeout(() => {
              setIsCreatingAnnouncement(false);
              viewAnnouncement();
            }, 2000);
          }
        } catch (error) {
          setIsCreatingAnnouncement(false);
          console.log("Announcement creation failed!!", error);
          toast.error("Announcement creation failed!!");
          if (error.response.data.type === "TokenExpiredError") {
            toast.error("Session timeout. Please login again!!");
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        }
      }
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
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className="form-container"
      >
        <Form.Group className="mb-3" controlId="validationCustomClass">
          <Form.Label className="form-label">* Class:</Form.Label>
          <Form.Select aria-label="Class" ref={studentClass} required>
            <option value="All">All</option>
            <option value="Nursery">Nursery</option>
            <option value="KG">KG</option>
            <option value="Transition">Transition</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="validationCustomDate">
          <Form.Label className="form-label">* Event Date:</Form.Label>
          <Form.Control
            type="date"
            placeholder="Date of Event"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toJSON().slice(0, 10)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="validationCustomTime">
          <Form.Label className="form-label">* Event Time:</Form.Label>
          <Form.Control
            type="time"
            placeholder="Time of Event"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formFileMultiple">
          <Form.Label className="form-label">Upload files/images:</Form.Label>
          <Form.Control type="file" multiple onChange={fileSelectedHandler} />
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
          <Button
            type="submit"
            variant="success"
            disabled={isCreatingAnnouncement}
          >
            {isCreatingAnnouncement ? (
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
              "Create Announcement"
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "../../../components/toast/Toast";
import AccordionItem from "../../../components/accordionItem/AccordionItem";
import Filter from "../../../components/filter/Filter";
import Accordion from "react-bootstrap/Accordion";
import Axios from "axios";
import jwt_decode from "jwt-decode";

const Announcement = () => {
  const [toastComponents, setToastComponents] = useState([]);
  const [isFetchingAnnouncement, setIsFetchingAnnouncement] = useState(false);
  const [announcementList, setAnnouncementList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    const index = window.location.pathname.split("/").findIndex((val) => {
      return val === role;
    });
    if (index < 0) {
      navigate("/");
    } else {
      setIsFetchingAnnouncement(true);
      getAnnouncements();
    }
  }, []);
  const getAnnouncements = async () => {
    try {
      const response = await Axios.get("http://localhost:5000/announcement/getAnnouncements", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.data.status === "Success") {
        setIsFetchingAnnouncement(false);
        console.log("Announcements fetched successfully!!");
        displayToast("success", "Success", "Announcements fetched successfully.");
        setAnnouncementList(response.data.announcementList);
      }
    } catch (error) {
      setIsFetchingAnnouncement(false);
      console.log("Announcements fetch failed!!", error);
      displayToast("danger", "Error", "Announcements fetch failed.");
      if (error.response.data.type === "TokenExpiredError") {
        displayToast("danger", "Error", "Session expired. Please login again.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    }
  };
  const displayToast = (variant, heading, body) => {
    if (variant === "danger") {
      setToastComponents((prevState) => {
        return [
          ...prevState,
          {
            variant,
            heading,
            body,
          },
        ];
      });
    } else {
      setToastComponents([
        {
          variant,
          heading,
          body,
        },
      ]);
    }
  };
  const filter = async (obj) => {
    const params = {};
    for (let key in obj) {
      if (obj[key] !== "Any") {
        params[key] = obj[key];
      }
    }
    setIsFetchingAnnouncement(true);
    try {
      const response = await Axios.get("http://localhost:5000/announcement/getAnnouncements", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params,
      });
      if (response.data.status === "Success") {
        setIsFetchingAnnouncement(false);
        console.log("Announcements fetched successfully!!");
        displayToast("success", "Success", "Announcements fetched successfully.");
        setAnnouncementList(response.data.announcementList);
      }
    } catch (error) {
      setIsFetchingAnnouncement(false);
      console.log("Announcements fetch failed!!", error);
      displayToast("danger", "Error", "Announcements fetch failed.");
      if (error.response.data.type === "TokenExpiredError") {
        displayToast("danger", "Error", "Session expired. Please login again.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    }
  };
  return (
    <>
      {isFetchingAnnouncement ? (
        <div className="page-container">
          <Spinner animation="border" variant="dark" className="view-spinner" />
        </div>
      ) : (
        <>
          <Filter page="Announcement" filter={filter} />
          <Accordion defaultActiveKey="0" className="list-container">
            {announcementList.map((announcement) => {
              return <AccordionItem {...announcement} key={announcement.id} />;
            })}
          </Accordion>
          <ToastContainer
            className="p-3 toast-stack-vertical"
            position="top-center"
          >
            {toastComponents.map((toastComponent, idx) => (
              <Toast
                key={idx}
                closeToast={() => setToastComponents([])}
                variant={toastComponent.variant}
                toastHeading={toastComponent.heading}
                toastBody={toastComponent.body}
              />
            ))}
          </ToastContainer>
        </>
      )}
    </>
  );
};

export default Announcement;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import AccordionItem from "../../../components/accordionItem/AccordionItem";
import Filter from "../../../components/filter/Filter";
import Accordion from "react-bootstrap/Accordion";
import Axios from "axios";
import jwt_decode from "jwt-decode";
import { storage } from "../../../firebase/index";

const View = () => {
  const [isFetchingAnnouncement, setIsFetchingAnnouncement] = useState(false);
  const [announcementList, setAnnouncementList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    const index = window.location.pathname.split("/").findIndex((val) => {
      return val === role || (val === "teacher" && role === "principal");
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
      const response = await Axios.get(
        `/announcement/getAnnouncements`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.status === "Success") {
        setIsFetchingAnnouncement(false);
        console.log("Announcements fetched successfully!!");
        toast.success("Announcements fetched successfully!!");
        setAnnouncementList(response.data.announcementList);
      }
    } catch (error) {
      setIsFetchingAnnouncement(false);
      console.log("Announcements fetch failed!!", error);
      toast.error("Announcements fetch failed!!");
      if (error.response.data.type === "TokenExpiredError") {
        toast.error("Session timeout. Please login again!!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
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
      const response = await Axios.get(
        `/announcement/getAnnouncements`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          params,
        }
      );
      if (response.data.status === "Success") {
        setIsFetchingAnnouncement(false);
        console.log("Announcements fetched successfully!!");
        toast.success("Announcements fetched successfully!!");
        setAnnouncementList(response.data.announcementList);
      }
    } catch (error) {
      setIsFetchingAnnouncement(false);
      console.log("Announcements fetch failed!!", error);
      toast.error("Announcements fetch failed!!");
      if (error.response.data.type === "TokenExpiredError") {
        toast.error("Session timeout. Please login again!!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    }
  };
  const handleDelete = async (announcementObj) => {
    try {
      const response = await Axios.delete(
        `/announcement/deleteAnnouncement`,
        {
          params: {
            announcementId: announcementObj.id,
          },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.status === "Success") {
        console.log("Announcement deleted successfully!!");
        try {
          if (announcementObj.images && announcementObj.images.length) {
            for (let file of announcementObj.images) {
              const deleteAnnouncement = storage.ref(
                `images/${process.env.NODE_ENV === "production" ? "production/" : ""}announcement/${file.name}`
              );
              await deleteAnnouncement.delete();
            }
          }
          toast.success("Announcement deleted successfully!!");
          getAnnouncements();
        } catch (err) {
          console.log("Failed to delete image. Please contact admin!!");
          toast.error("Failed to delete image. Please contact admin!!");
          getAnnouncements();
          if (err.response.data.type === "TokenExpiredError") {
            toast.error("Session timeout. Please login again!!");
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.log("Announcement deletion failed!!", error);
      toast.error("Announcement deletion failed!!");
      getAnnouncements();
      if (error.response.data.type === "TokenExpiredError") {
        toast.error("Session timeout. Please login again!!");
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
              return (
                <AccordionItem
                  {...announcement}
                  key={announcement.id}
                  deleteItem={() => handleDelete(announcement)}
                />
              );
            })}
          </Accordion>
        </>
      )}
    </>
  );
};

export default View;

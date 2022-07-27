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
  const [isFetchingSyllabus, setIsFetchingSyllabus] = useState(false);
  const [syllabusList, setSyllabusList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    const index = window.location.pathname.split("/").findIndex((val) => {
      return val === role || (val === "teacher" && role === "principal");
    });
    if (index < 0) {
      navigate("/");
    } else {
      setIsFetchingSyllabus(true);
      getSyllabus();
    }
  }, []);
  const getSyllabus = async () => {
    try {
      const response = await Axios.get(
        `${process.env.REACT_APP_BASE_URL}/syllabus/getSyllabus`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.status === "Success") {
        setIsFetchingSyllabus(false);
        console.log("Syllabus fetched successfully!!");
        toast.success("Syllabus fetched successfully!!");
        setSyllabusList(response.data.syllabusList);
      }
    } catch (error) {
      setIsFetchingSyllabus(false);
      console.log("Syllabus fetch failed!!", error);
      toast.error("Syllabus fetch failed!!");
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
    setIsFetchingSyllabus(true);
    try {
      const response = await Axios.get(
        `${process.env.REACT_APP_BASE_URL}/syllabus/getSyllabus`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          params,
        }
      );
      if (response.data.status === "Success") {
        setIsFetchingSyllabus(false);
        console.log("Syllabus fetched successfully!!");
        toast.success("Syllabus fetched successfully!!");
        setSyllabusList(response.data.syllabusList);
      }
    } catch (error) {
      setIsFetchingSyllabus(false);
      console.log("Syllabus fetch failed!!", error);
      toast.error("Syllabus fetch failed!!");
      if (error.response.data.type === "TokenExpiredError") {
        toast.error("Session timeout. Please login again!!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    }
  };
  const handleDelete = async (syllabusObj) => {
    try {
      const response = await Axios.delete(
        `${process.env.REACT_APP_BASE_URL}/syllabus/deleteSyllabus`,
        {
          params: {
            syllabusId: syllabusObj.id,
          },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.status === "Success") {
        console.log("Syllabus deleted successfully!!");
        toast.success("Syllabus deleted successfully!!");
        try {
          if (syllabusObj.images && syllabusObj.images.length) {
            for (let file of syllabusObj.images) {
              const deleteSyllabus = storage.ref(
                `images/syllabus/${file.name}`
              );
              await deleteSyllabus.delete();
            }
          }

          getSyllabus();
        } catch (err) {
          console.log("Failed to delete image. Please contact admin!!");
          toast.error("Failed to delete image. Please contact admin!!");
          getSyllabus();
          if (err.response.data.type === "TokenExpiredError") {
            toast.error("Session timeout. Please login again!!");
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.log("Syllabus deletion failed!!", error);
      toast.error("Syllabus deletion failed!!");
      getSyllabus();
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
      {isFetchingSyllabus ? (
        <div className="page-container">
          <Spinner animation="border" variant="dark" className="view-spinner" />
        </div>
      ) : (
        <>
          <Filter page="Syllabus" filter={filter} />
          <Accordion defaultActiveKey="0" className="list-container">
            {syllabusList.map((syllabus) => {
              return (
                <AccordionItem
                  {...syllabus}
                  key={syllabus.id}
                  deleteItem={() => handleDelete(syllabus)}
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

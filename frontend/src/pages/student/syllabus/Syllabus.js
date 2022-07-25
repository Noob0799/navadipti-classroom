import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import AccordionItem from "../../../components/accordionItem/AccordionItem";
import Filter from "../../../components/filter/Filter";
import Accordion from "react-bootstrap/Accordion";
import Axios from "axios";
import jwt_decode from "jwt-decode";

const Syllabus = () => {
  const [isFetchingSyllabus, setIsFetchingSyllabus] = useState(false);
  const [syllabusList, setSyllabusList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    const index = window.location.pathname.split("/").findIndex((val) => {
      return val === role;
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
        "http://localhost:5000/syllabus/getSyllabus",
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
        "http://localhost:5000/syllabus/getSyllabus",
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
              return <AccordionItem {...syllabus} key={syllabus.id} />;
            })}
          </Accordion>
        </>
      )}
    </>
  );
};

export default Syllabus;

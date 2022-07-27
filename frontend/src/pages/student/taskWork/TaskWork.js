import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import AccordionItem from "../../../components/accordionItem/AccordionItem";
import Filter from "../../../components/filter/Filter";
import Accordion from "react-bootstrap/Accordion";
import Axios from "axios";
import jwt_decode from "jwt-decode";

const TaskWork = () => {
  const [isFetchingTask, setIsFetchingTask] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [role, setRole] = useState("teacher");
  const navigate = useNavigate();

  useEffect(() => {
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    const index = window.location.pathname.split("/").findIndex((val) => {
      return val === role;
    });
    if (index < 0) {
      navigate("/");
    } else {
      setRole(role);
      setIsFetchingTask(true);
      getTasks();
    }
  }, []);
  const getTasks = async () => {
    try {
      const response = await Axios.get(`${process.env.REACT_APP_BASE_URL}/task/getTasks`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.data.status === "Success") {
        setIsFetchingTask(false);
        console.log("Tasks fetched successfully!!");
        toast.success("Tasks fetched successfully!!");
        setTaskList(response.data.taskList);
      }
    } catch (error) {
      setIsFetchingTask(false);
      console.log("Tasks fetch failed!!", error);
      toast.error("Tasks fetch failed!!");
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
    setIsFetchingTask(true);
    try {
      const response = await Axios.get(`${process.env.REACT_APP_BASE_URL}/task/getTasks`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params,
      });
      if (response.data.status === "Success") {
        setIsFetchingTask(false);
        console.log("Tasks fetched successfully!!");
        toast.success("Tasks fetched successfully!!");
        setTaskList(response.data.taskList);
      }
    } catch (error) {
      setIsFetchingTask(false);
      console.log("Tasks fetch failed!!", error);
      toast.error("Tasks fetch failed!!");
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
      {isFetchingTask ? (
        <div className="page-container">
          <Spinner animation="border" variant="dark" className="view-spinner" />
        </div>
      ) : (
        <>
          <Filter page="Task" filter={filter} />
          <Accordion defaultActiveKey="0" className="list-container">
            {taskList.map((task) => {
              return <AccordionItem {...task} key={task.id} role={role} />;
            })}
          </Accordion>
        </>
      )}
    </>
  );
};

export default TaskWork;

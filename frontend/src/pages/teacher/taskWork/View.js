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
  const [isFetchingTask, setIsFetchingTask] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [role, setRole] = useState("teacher");
  const navigate = useNavigate();

  useEffect(() => {
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    const index = window.location.pathname.split("/").findIndex((val) => {
      return val === role || (val === "teacher" && role === "principal");
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
      const response = await Axios.get("http://localhost:5000/task/getTasks", {
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
      const response = await Axios.get("http://localhost:5000/task/getTasks", {
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
  const handleDelete = async (taskObj) => {
    try {
      const response = await Axios.delete(
        "http://localhost:5000/task/deleteTask",
        {
          params: {
            taskId: taskObj.id,
          },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.status === "Success") {
        console.log("Task deleted successfully!!");
        toast.success("Task deleted successfully!!");
        try {
          if (taskObj.images && taskObj.images.length) {
            for (let file of taskObj.images) {
              const deleteTask = storage.ref(`images/task/${file.name}`);
              await deleteTask.delete();
            }
          }
          if (taskObj.submittedImages && taskObj.submittedImages.length) {
            for (let file of taskObj.submittedImages) {
              const deleteTask = storage.ref(
                `images/completedTask/${file.name}`
              );
              await deleteTask.delete();
            }
          }

          getTasks();
        } catch (err) {
          console.log("Failed to delete image. Please contact admin!!");
          toast.error("Failed to delete image. Please contact admin!!");
          getTasks();
          if (err.response.data.type === "TokenExpiredError") {
            toast.error("Session timeout. Please login again!!");
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.log("Task deletion failed!!", error);
      toast.error("Task deletion failed!!");
      getTasks();
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
              return (
                <AccordionItem
                  {...task}
                  key={task.id}
                  role={role}
                  deleteItem={() => handleDelete(task)}
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

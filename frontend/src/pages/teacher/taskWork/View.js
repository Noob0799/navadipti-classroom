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

const View = () => {
  const [toastComponents, setToastComponents] = useState([]);
  const [isFetchingTask, setIsFetchingTask] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    const index = window.location.pathname.split("/").findIndex((val) => {
      return val === role || (val === "teacher" && role === "principal");
    });
    if (index < 0) {
      navigate("/");
    } else {
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
        displayToast("success", "Success", "Tasks fetched successfully.");
        setTaskList(response.data.taskList);
      }
    } catch (error) {
      setIsFetchingTask(false);
      console.log("Tasks fetch failed!!", error);
      displayToast("danger", "Error", "Tasks fetch failed.");
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
  return (
    <>
      {isFetchingTask ? (
        <div className="page-container">
          <Spinner animation="border" variant="dark" className="view-spinner" />
        </div>
      ) : (
        <>
          <Filter page="TaskView" />
          <Accordion defaultActiveKey="0" className="list-container">
            {taskList.map((task) => {
              return <AccordionItem {...task} key={task.id} />;
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

export default View;

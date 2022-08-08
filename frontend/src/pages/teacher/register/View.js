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
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { role } = jwt_decode(sessionStorage.getItem("token"));
    const index = window.location.pathname.split("/").findIndex((val) => {
      return val === "teacher" && role === "principal";
    });
    if (index < 0) {
      navigate("/");
    } else {
      setIsFetchingUsers(true);
      getUsers();
    }
  }, []);
  const getUsers = async () => {
    try {
      const response = await Axios.get(`/auth/getUsers`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.data.status === "Success") {
        setIsFetchingUsers(false);
        console.log("Users fetched successfully!!");
        toast.success("Users fetched successfully!!");
        setUserList(response.data.userList);
      }
    } catch (error) {
      setIsFetchingUsers(false);
      console.log("Users fetch failed!!", error);
      toast.error("Users fetch failed!!");
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
    setIsFetchingUsers(true);
    try {
      const response = await Axios.get(`/auth/getUsers`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        params,
      });
      if (response.data.status === "Success") {
        setIsFetchingUsers(false);
        console.log("Users fetched successfully!!");
        toast.success("Users fetched successfully!!");
        setUserList(response.data.userList);
      }
    } catch (error) {
      setIsFetchingUsers(false);
      console.log("Users fetch failed!!", error);
      toast.error("Users fetch failed!!");
      if (error.response.data.type === "TokenExpiredError") {
        toast.error("Session timeout. Please login again!!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    }
  };
  const handleDelete = async (userObj) => {
    try {
      const response = await Axios.delete(`/auth/deleteUser`, {
        params: {
          userId: userObj.id,
          identity: userObj.identity,
        },
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.data.status === "Success") {
        console.log("User deleted successfully!!");
        toast.success("User deleted successfully!!");
        try {
          if (userObj.uploadedImages) {
            for (let file of userObj.uploadedImages) {
              const deleteTask = storage.ref(`images/completedTask/${file.name}`);
              await deleteTask.delete();
            }
          }

          getUsers();
        } catch (err) {
          console.log("Failed to delete image. Please contact admin!!");
          toast.error("Failed to delete image. Please contact admin!!");
          getUsers();
          if (err.response.data.type === "TokenExpiredError") {
            toast.error("Session timeout. Please login again!!");
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.log("User deletion failed!!", error);
      toast.error("User deletion failed!!");
      getUsers();
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
      {isFetchingUsers ? (
        <div className="page-container">
          <Spinner animation="border" variant="dark" className="view-spinner" />
        </div>
      ) : (
        <>
          <Filter page="User" filter={filter} />
          <Accordion defaultActiveKey="0" className="list-container">
            {userList.map((user) => {
              return (
                <AccordionItem
                  {...user}
                  mode="user"
                  key={user.id}
                  deleteItem={() => handleDelete(user)}
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

import { useEffect, useState,useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/Tasks.css";

export default function Tasks() {
  const [tasks,setTasks] = useState([]);
  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState("");

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const taskList = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data.data);
  };

  useEffect( () => { 
    taskList(); 
  },[]);

  const add = async () => {
    setError("");

    try {
      if (editingId) {
        // update
        var res = await api.put(`/tasks/${editingId}`, {
          title,
          description,
        });
      } else {
        // create
        var res = await api.post("/tasks", {
          title,
          description,
        });
      }

      if (res?.status === 201 || res?.status === 200) {
        setSuccess(res.data.message);
      }

      setTitle("");
      setDescription("");
      setEditingId(null);
      taskList();
    } catch (err) {
      if (err.response?.status === 422) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  const edit = (task) => {
    setTitle(task.title);
    setDescription(task.description || "");
    setEditingId(task.id);
  };

  const toggle = async (task) => {
    try {
      var res = await api.patch(`/tasks/${task.id}/status`, {
        status: task.status === "pending" ? "completed" : "pending",
      });


      if (res?.status === 201 || res?.status === 200) {
        setSuccess(res.data.message);
      }

      taskList();
    } catch {
      alert("Failed to update status");
    }
  };

  const del = async (id) => {
    if(confirm("Are you sure want to delete task?")){
      var res = await api.delete(`/tasks/${id}`);
      if (res?.status === 201 || res?.status === 200) {
        setSuccess(res.data.message);
      }
      taskList();
    }
  };

  const handleLogout = async () => {
    await api.post("/logout");
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);


  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h2>Tasks</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}

      <div className="task-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter Title"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter Description"
        />
        <button onClick={add}>{editingId ? "Update" : "Add"}</button>
      </div>


      <div className="tasks-table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className={t.status === "completed" ? "completed" : ""}>
                <td>{t.title}</td>
                <td>
                  <span
                    className={`task-status ${t.status}`}
                    onClick={() => toggle(t)}
                  >
                    {t.status}
                  </span>
                </td>
                <td>{t.description || "-"}</td>
                <td>
                  <button className="edit-btn" onClick={() => edit(t)}>Edit</button>
                  <button className="delete-btn" onClick={() => del(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>  

    );
}

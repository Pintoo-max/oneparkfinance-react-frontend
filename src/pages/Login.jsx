import { useContext, useState, useEffect } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Login() {
  const { login, token } = useContext(AuthContext);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [success, setSuccess] = useState("");

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();


  const submit = async () => {
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/login", { email, password });
      setSuccess(res.data.message); 
      login(res.data.token);
      navigate("/tasks");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid login");
    }
  };


  useEffect(() => {
    if (token) {
      navigate("/tasks");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (

      <div className="login-container">
        <h2 className="login-title">Login</h2>

        {success && <p className="success">{success}</p>}
        {error && <p className="error">{error}</p>}

        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={submit}>Login</button>
      </div>

  );
}

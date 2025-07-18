import axios from "axios";
import "./login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext.jsx"; 


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { isLoggedIn, setIsLoggedIn } = useUserContext();

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
  
    let valid = true;
  
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }
  
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      valid = false;
    }
  
    if (!valid) return;
  
    try {
      console.log("Sending login request:", { email, password });
  
      const response = await axios.post(
        "http://localhost:8000/login/", 
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
  
      console.log("Server response:", response.data);
  
      if (response.data.success) {
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userName', response.data.name);     
        localStorage.setItem('profileImage', response.data.profileImage || ""); 
        setIsLoggedIn(true); 
        navigate("/");
      }
      
       else {
        alert(response.data.message || "Invalid credentials. Try again.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("Login failed. Please check your credentials.");
    }
  };
  
  return (
    <div className="login">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back!</h1>
          <p>Please log in to your account.</p>
        </div>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && <span className="error-message">{emailError}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordError && <span className="error-message">{passwordError}</span>}
          </div>
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

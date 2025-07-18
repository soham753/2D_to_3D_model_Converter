import "./login.css";
import { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext.jsx";
import axios from "axios";

function Register() {
  const {  setIsLoading } = useUserContext();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate(); 

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let errors = [];

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedName) errors.push("Name is required.");
    if (!validateEmail(trimmedEmail)) errors.push("Please enter a valid email address.");
    if (trimmedPassword.length < 6) errors.push("Password must be at least 6 characters long.");
    if (trimmedPassword !== trimmedConfirmPassword) errors.push("Passwords do not match.");

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    axios
      .post("http://localhost:8000/register/", { name, email, password }) 
      .then((result) => {
        console.log(result);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Registration error:", error);
        alert("Registration failed. Please try again.");
      });
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-header">
          <h1>Create an Account</h1>
          <p>Sign up to get started.</p>
        </div>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password:</label>
            <input type="password" id="confirm_password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <button type="submit" className="login-button">
            Register
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

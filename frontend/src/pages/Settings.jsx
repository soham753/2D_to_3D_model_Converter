import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../components/menu.css";
import "./settings.css";
import { useUserContext } from "../context/UserContext.jsx";

function Settings() {
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(localStorage.getItem("profileImage") || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useUserContext();
  const { isSetting, setIsSetting } = useUserContext();
  const { setIsLoading } = useUserContext();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 70);
  }, []);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmitProfilePhoto = async () => {
    if (!profilePhoto) {
      setErrorMessage("Please select a file.");
      return;
    }

    setIsUploadingPhoto(true);

    const formData = new FormData();
    formData.append("profilePhoto", profilePhoto);
    formData.append("userId", userId);

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:8000/settings/profile_photo_update/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Profile image updated successfully!");
        setErrorMessage("");
        localStorage.setItem("profileImage", response.data.image_url);
        setIsSetting(true);
      } else {
        setErrorMessage(response.data.message || "Failed to upload photo.");
      }
    } catch (error) {
      setErrorMessage("Error uploading photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
      setIsLoading(false);
    }
  };

  const handleSubmitName = async () => {
    if (!userName) {
      setErrorMessage("Please enter a valid name.");
      return;
    }

    setIsUpdatingName(true);

    try {
      setIsLoading(true);
      const response = await axios.put(
        `http://localhost:8000/settings/username_update/`,
        {
          userId,
          newName: userName,
        }
      );

      if (response.data.success) {
        setSuccessMessage("Name updated successfully!");
        setErrorMessage("");
        localStorage.setItem("userName", userName);
        setIsSetting(true);
      } else {
        setErrorMessage(response.data.message || "Failed to update name.");
      }
    } catch (error) {
      setErrorMessage("Error updating name. Please try again.");
    } finally {
      setIsUpdatingName(false);
      setIsLoading(false);
    }
  };

  const handleSubmitPassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords don't match.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      setIsLoading(true);
      const response = await axios.post(
        `http://localhost:8000/settings/password_update/`,
        {
          userId,
          oldPassword,
          newPassword,
        }
      );

      if (response.data.success) {
        setSuccessMessage("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrorMessage("");
        setIsSetting(true);
      } else {
        setErrorMessage(response.data.message || "Incorrect current password.");
      }
    } catch (error) {
      setErrorMessage("Error updating password. Please try again.");
    } finally {
      setIsUpdatingPassword(false);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("profileImage");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <motion.div
      className="settings-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h1 
        className="settings-title"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        Account Settings
      </motion.h1>

      {/* Profile Photo Section */}
      <motion.div 
        className="settings-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="section-title">Profile Picture</h2>
        <div className="photo-upload-container">
          <div className="photo-preview">
            {previewPhoto ? (
              <motion.img
                src={previewPhoto}
                alt="Profile"
                className="settings-profile-photo"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            ) : (
              <div className="photo-placeholder">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="photo-upload-controls">
            <label className="file-upload-button">
              Choose Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                style={{ display: "none" }}
              />
            </label>
            <motion.button
              className="s-upload-button"
              onClick={handleSubmitProfilePhoto}
              disabled={isUploadingPhoto || !profilePhoto}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {isUploadingPhoto ? (
                <span className="button-loading">
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                </span>
              ) : (
                "Save Photo"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Change Name Section */}
      <motion.div 
        className="settings-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="section-title">Personal Information</h2>
        <div className="form-group">
          <label htmlFor="username">Display Name</label>
          <input
            type="text"
            id="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
          />
          <motion.button
            className="save-button"
            onClick={handleSubmitName}
            disabled={isUpdatingName || !userName}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {isUpdatingName ? (
              <span className="button-loading">
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
              </span>
            ) : (
              "Save Name"
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Change Password Section */}
      <motion.div 
        className="settings-section"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="section-title">Change Password</h2>
        <div className="form-group">
          <label htmlFor="old-password">Current Password</label>
          <input
            type="password"
            id="old-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>
        <motion.button
          className="save-button"
          onClick={handleSubmitPassword}
          disabled={isUpdatingPassword || !oldPassword || !newPassword || !confirmPassword}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {isUpdatingPassword ? (
            <span className="button-loading">
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
            </span>
          ) : (
            "Change Password"
          )}
        </motion.button>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {errorMessage}
            <button 
              className="close-message"
              onClick={() => setErrorMessage("")}
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {successMessage}
            <button 
              className="close-message"
              onClick={() => setSuccessMessage("")}
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Button */}
      <motion.div
        className="logout-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          className="logout-button"
          onClick={handleLogout}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Logout
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default Settings;
import "./Home.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext.jsx";
import axios from "axios";

function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(""); 
  const fileInputRef = useRef(null);
  const { isLoggedIn } = useUserContext();
  const { modelUrl , setModelUrl } = useUserContext();
  const navigate = useNavigate();

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const handleDragOver = (event) => event.preventDefault();
  const { setIsLoading } = useUserContext();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 100); 
  }, []);

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains("popup")) {
      closePopup();
    }
  };

  const handleGetStartedClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      openPopup();
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      return;
    }

    const formData = new FormData();
    const file = selectedFiles[0];
    formData.append("design", file);
    formData.append("user_id", userId);

    let uploadedImageUrl = ""; 
    try {
      setIsLoading(true); 
      const response = await axios.post(
        "http://localhost:8000/home/upload_design/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      uploadedImageUrl = response.data.uploaded_image; 
      setUploadedImage(uploadedImageUrl);
      setIsUploadSuccess(true);
      console.log("Uploaded Image URL:", uploadedImageUrl); 

    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsLoading(false); 
    }
  };
  const handleProcess = async () => {
    if (!uploadedImage) {
      alert("No images to process.");
      return;
    }
  
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User is not logged in.");
      return;
    }
  
    try {
      setIsLoading(true); 
  
      const response = await axios.post(
        "http://localhost:8000/home/process/", 
        {
          user_id: userId,
          image_urls: uploadedImage, 
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.success) {
        setModelUrl(response.data.model_url); 
  
        console.log("3D Model URL:", modelUrl);
        navigate('/model-viewer');
  
      } else {
        alert("Processing failed. Please try again.");
      }
    } catch (error) {
      console.error("Processing error:", error);
      alert("An error occurred during processing. Please try again.");
    } finally {
      setIsLoading(false); 
    }
  };
  


  
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Transform Your Civil Blueprints</h1>
          <p>Convert 2D plans into immersive 3D models effortlessly.</p>
          <button className="cta-button" onClick={handleGetStartedClick}>
            Get Started
          </button>
        </div>
      </section>

      <div
        className={`popup ${isPopupOpen ? "open" : ""}`}
        onClick={handleOverlayClick}
      >
        <div className="popup-content">
          <span className="close-button" onClick={closePopup}>
            &times;
          </span>
          <h2>Upload Your 2D Files</h2>

          {isUploadSuccess ? (
            <div className="uploaded-images">
              <h3>Uploaded Image:</h3>
              <div className="uploaded-image-container">
                <img
                  src={uploadedImage}
                  alt="Uploaded Image"
                  className="uploaded-image"
                />
              </div>
              <button className="process-button" onClick={handleProcess}>
                Process
              </button>
            </div>
          ) : (
            <>
              <div
                className="upload-area"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <p>
                  Drag and drop your file here or{" "}
                  <label htmlFor="file-upload" className="file-upload-label">
                    browse
                  </label>
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".jpg,.png"
                  hidden
                  onChange={handleFileSelect}
                />
              </div>

              {selectedFiles.length > 0 && (
                <>
                  <div className="file-list">
                    <h3>Selected File:</h3>
                    <ul>
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                  <button className="upload-button" onClick={handleUpload}>
                    Upload
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;

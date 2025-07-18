import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext.jsx";
import "./menu.css";

function Menu() {
  const [userName, setUserName] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const { isLoggedIn } = useUserContext();
  const { isSetting, setIsSetting } = useUserContext(); 

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      const storedName = localStorage.getItem("userName");
      const storedImage = localStorage.getItem("profileImage");
  
      setUserName(storedName);
      setProfileImage(storedImage);
    } else {
     
      setUserName(null);
      setProfileImage(null);
    }
  }, [isLoggedIn]); 
  
  useEffect(() => {
    if (isSetting) {
      const storedName = localStorage.getItem("userName");
      const storedImage = localStorage.getItem("profileImage");  
      setUserName(storedName);
      setProfileImage(storedImage);
  
      setIsSetting(false);
    }
  }, [isSetting]); 
  return (
    <header>
      <div className="menu_container">
      <Link to="/" className="menu_link"><h1 className="menu_company-name">Design Lift</h1></Link>
        <nav>
          <ul className="menu_navbar">
            <li>
              <Link to="/" className="menu_link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/features" className="menu_link">
                Features
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="menu_link">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/contact" className="menu_link">
                Contact
              </Link>
            </li>
            <li className="menu_user-area">
              {isLoggedIn ? (
                <div className="menu_user-wrapper">
                  <Link to="/settings" className="menu_user-circle">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="menu_user-image"
                      />
                    ) : (
                      userName?.charAt(0).toUpperCase() || "U"
                    )}
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="menu_login-button">
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Menu;

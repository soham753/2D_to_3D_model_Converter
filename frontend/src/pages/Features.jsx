import "./features.css";
import { useEffect } from "react";
import { useUserContext } from "../context/UserContext";
import Loader from "../components/Loader";

function Features() {
  const { isLoading, setIsLoading } = useUserContext();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // simulate 1s loading

    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      <section class="features">
        <h2>Our Key Features</h2>
        <div class="feature-list">
          <div class="feature">
            <div class="icon-container">
              <i class="fas fa-sync-alt feature-icon"></i>
            </div>
            <h3>Fast Conversion</h3>
            <p>
              Convert your 2D blueprints to 3D models in seconds with our
              efficient technology.
            </p>
          </div>
          <div class="feature">
            <div class="icon-container">
              <i class="fas fa-bullseye feature-icon"></i>
            </div>
            <h3>High Accuracy</h3>
            <p>
              Ensure precise transformations with our state-of-the-art
              algorithms.
            </p>
          </div>
          <div class="feature">
            <div class="icon-container">
              <i class="fas fa-cogs feature-icon"></i>
            </div>
            <h3>User-Friendly Interface</h3>
            <p>
              Our platform is designed for ease of use, ensuring anyone can
              navigate effortlessly.
            </p>
          </div>
          <div class="feature">
            <div class="icon-container">
              <i class="fas fa-desktop feature-icon"></i>
            </div>
            <h3>Cross-Platform Support</h3>
            <p>Access your 3D models anywhere, anytime, on any device.</p>
          </div>
          <div class="feature">
            <div class="icon-container">
              <i class="fas fa-lock feature-icon"></i>
            </div>
            <h3>Secure and Private</h3>
            <p>
              Your files are safe with us, thanks to our robust security
              measures.
            </p>
          </div>
          <div class="feature">
            <div class="icon-container">
              <i class="fas fa-users-cog feature-icon"></i>
            </div>
            <h3>Real-Time Collaboration</h3>
            <p>
              Work with your team in real-time and streamline your project
              workflows.
            </p>
          </div>
          <div class="feature">
            <div class="icon-container">
              <i class="fas fa-paint-brush feature-icon"></i>
            </div>
            <h3>Customizable Templates</h3>
            <p>
              Create and modify designs using our library of templates to suit
              your needs.
            </p>
          </div>
          <div class="feature">
            <div class="icon-container">
              <i class="fas fa-print feature-icon"></i>
            </div>
            <h3>3D Printing Compatibility</h3>
            <p>Export your designs for 3D printing with ease.</p>
          </div>
          <div class="feature">
            <div class="icon-container">
              <i class="fas fa-headset feature-icon"></i>
            </div>
            <h3>24/7 Support</h3>
            <p>Get assistance anytime with our dedicated support team.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Features;

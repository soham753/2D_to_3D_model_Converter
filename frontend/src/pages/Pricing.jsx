import "./pricing.css";
import { useEffect } from "react";
import { useUserContext } from "../context/UserContext";
import Loader from "../components/Loader";

function Pricing() {
  const { isLoading, setIsLoading } = useUserContext();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); 

    return () => clearTimeout(timer);
  }, []);

    return(
        <>
        <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      rel="stylesheet"
    />
     <div class="pricing-section">
      <h1 class="pricing-title">Choose Your Perfect Plan</h1>
      <p class="pricing-subtitle">
        Our flexible plans are designed to meet your needs
      </p>

      <div class="pricing-plans">
        <div class="pricing-plan">
          <div class="plan-header">
            <h2 class="plan-title">Basic</h2>
            <i class="fas fa-cogs plan-icon"></i>
          </div>
          <p class="plan-price">₹500/month</p>
          <p class="plan-description">
            Perfect for small teams or individuals just getting started.
          </p>
          <ul class="plan-features">
            <li><i class="fas fa-check-circle"></i>70 3D model generations / month</li>
            <li><i class="fas fa-check-circle"></i> Export 30 3D Model / Month</li>
            <li><i class="fas fa-check-circle"></i> Cloud Sync 3GB</li>
          </ul>
          <button class="plan-button">Get Started</button>
        </div>

        <div class="pricing-plan featured">
          <div class="plan-header">
            <h2 class="plan-title">Pro</h2>
            <i class="fas fa-rocket plan-icon"></i>
            <div class="best-value">Best Value</div>
          </div>
          <p class="plan-price">₹1000/month</p>
          <p class="plan-description">
            Designed for growing businesses needing more features and support.
          </p>
          <ul class="plan-features">
            <li><i class="fas fa-check-circle"></i> 150 3D model generations / month</li>
            <li><i class="fas fa-check-circle"></i> Export 100 3D Model / Month</li>
            <li><i class="fas fa-check-circle"></i> Cloud Sync 8GB</li>
            <li><i class="fas fa-check-circle"></i> Multi-storey support (Coming soon)</li>
            
          </ul>
          <button class="plan-button">Get Started</button>
        </div>

        <div class="pricing-plan enterprise">
          <div class="plan-header">
            <h2 class="plan-title">Enterprise</h2>
            <i class="fas fa-building plan-icon"></i>
          </div>
          <p class="plan-price">₹10000/month</p>
          <ul class="plan-features">
            <li><i class="fas fa-check-circle"></i> Unlimited Model Generation</li>
            <li><i class="fas fa-check-circle"></i> Unlimited Model Export</li>
            <li><i class="fas fa-check-circle"></i> AR/VR export  (Coming Soon)</li>
            <li><i class="fas fa-check-circle"></i> Rich texture and material library (coming Soon)</li>
          </ul>
          <button class="plan-button">Get Started</button>
        </div>
      </div>
    </div>
    </>

    )
}
export default Pricing;
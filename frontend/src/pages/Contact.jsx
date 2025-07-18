import "./contact.css";
import { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import Loader from "../components/Loader";

function Contact() {
  const { isLoading, setIsLoading } = useUserContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [submitStatus, setSubmitStatus] = useState(null); 

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <section className="contact-container">
        <h2>Contact Us</h2>
        
        {submitStatus === 'success' && (
          <div className="alert success">
            Thank you! Your message has been sent successfully.
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="alert error">
            Sorry, there was an error sending your message. Please try again later.
          </div>
        )}

        <div className="contact-content">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Write your message here..."
                required
              ></textarea>
            </div>
            <button type="submit" className="cta-button">
              Send Message
            </button>
          </form>

          <div className="contact-details">
            <div className="contact-info">
              <h3>Contact Information</h3>
              <p>
                <strong>Phone:</strong> +1 (234) 567-890
              </p>
              <p>
                <strong>Email:</strong> support@designlift.com
              </p>
            </div>
            <div className="contact-address">
              <h3>Our Address</h3>
              <p>SSASIT ,Varachha Main Rd,</p>
              <p> Kapodra Patiya, Surat,</p>
              <p>Gujarat 395006</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
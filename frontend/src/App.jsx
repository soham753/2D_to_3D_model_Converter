import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu.jsx";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";
import Features from "./pages/Features.jsx";
import Pricing from "./pages/Pricing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Settings from "./pages/Settings.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import Loader from "./components/Loader";
import PLYModelViewer  from "./pages/PLYModelViewer.jsx";
import "./App.css";

function App() {
  return (
    <UserProvider>
       <Loader />
      <Router>
        <Menu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/model-viewer" element={<PLYModelViewer />} />

        </Routes>
        {/* <Footer /> */}
      </Router>
    </UserProvider>
  );
}

export default App;

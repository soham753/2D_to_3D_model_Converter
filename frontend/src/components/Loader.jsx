import { useUserContext } from "../context/UserContext";
import "./Loader.css"; 
import load from "./a1.gif"; 

const Loader = () => {
  const { isLoading } = useUserContext();

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <img src={load} alt="Loading..." className="loading-gif" />
    </div>
  );
};

export default Loader;

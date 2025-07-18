import { createContext, useContext, useState, useEffect } from "react";

// Create Context
const UserContext = createContext();

// Provider Component
export const UserProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSetting, setIsSetting] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 
    const [modelUrl, setModelUrl] = useState(""); 

    useEffect(() => {
        const storedId = localStorage.getItem("userId");
        setIsLoggedIn(!!storedId);
    }, []);

    return (
        <UserContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                isSetting,
                setIsSetting,
                isLoading,        
                setIsLoading,       
                modelUrl,
                setModelUrl,     
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);

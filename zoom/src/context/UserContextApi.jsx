import { createContext, useContext, useEffect, useState } from "react";


const UserContext = createContext();


//wrapper
export const UserProvider = ({ children }) => {
 // Initialize state with localStorage data to prevent flickering issues
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("userData");
        return storedUser ? JSON.parse(storedUser) : null;//convert in to object f data exists → convert string → back into an object using JSON.parse()
// If no data → return null.
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const storedUser = localStorage.getItem("userData");
        console.log("Fetched user from localStorage:", storedUser);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Function to update user data
    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem("userData", JSON.stringify(newUserData));//local storage me string contnt add 
    };

    return (
        <UserContext.Provider value={{ user, updateUser ,loading }}>
            {children}
        </UserContext.Provider>
    );
};

 export const useUser = () => useContext(UserContext);

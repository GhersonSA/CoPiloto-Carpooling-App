export const handleLogin = (role, username) => {
    const authData = { role, username };
    localStorage.setItem("auth", JSON.stringify(authData));
};

export const handleLogout = () => {
    localStorage.removeItem("auth");
};

export const isAuthenticated = () => {
    const auth = localStorage.getItem("auth");
    if (!auth) return false;
    const { role } = JSON.parse(auth);
    return role === "user" || role === "guest" || role === "admin";
};

export const getUserRole = () => {
    const auth = localStorage.getItem("auth");
    if (!auth) return null;
    try {
        return JSON.parse(auth).role;
    } catch {
        return null;
    }
};

export const getUsername = () => {
    const auth = localStorage.getItem("auth");
    if (!auth) return null;
    try {
        return JSON.parse(auth).username;
    } catch {
        return null;
    }
};
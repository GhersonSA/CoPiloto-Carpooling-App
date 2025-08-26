import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { handleLogout } from "../utils/auth";

export function useLogout() {
    const navigate = useNavigate();

    const logout = useCallback(async () => {
        await handleLogout();
        navigate("/");
    }, [navigate]);

    return logout;
}
import "./AdminEntry.css"
import { Outlet, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { LoadingStateContext, UserContext } from "../../../Contexts";
import { useNavigate } from "react-router-dom";
import { LoadingError } from "../../users/landing/UserLanding";

function AdminLanding() {
    const navigate = useNavigate()
    const location = useLocation()
    const { setLoadingState } = useContext(LoadingStateContext)
    const { loggedIn } = useContext(UserContext)

    useEffect(() => {
        setLoadingState("loading")
        if (loggedIn) {
            setLoadingState("loaded")
            if (location.pathname === "/admin/" || location.pathname === "/admin") {
                navigate("/admin/dashboard", { replace: true })
            }
        }
    }, [loggedIn])
    return (
        <div className="admin">
            <Outlet />
            <LoadingError />
        </div >
    )
}

export default AdminLanding


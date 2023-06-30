import "./AdminEntry.css"
import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import { ErrorsContext, LoadingStateContext, UserContext } from "../../../Contexts";
import { useNavigate } from "react-router-dom";
import { LoadingError } from "../../users/landing/UserLanding";

function AdminLanding() {
    const navigate = useNavigate()
    const { setLoadingState } = useContext(LoadingStateContext)
    const { loggedIn } = useContext(UserContext)

    useEffect(() => {
        setLoadingState("loading")
        if (loggedIn) {
            setLoadingState("loaded")
            navigate("/admin/dashboard", { replace: true })
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


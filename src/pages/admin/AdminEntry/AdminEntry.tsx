import "./AdminEntry.css"
import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import { ErrorsContext, LoadingStateContext, UserContext } from "../../../Contexts";
import { useNavigate } from "react-router-dom";

function AdminLanding() {
    const navigate = useNavigate()
    const { loadingState } = useContext(LoadingStateContext)
    const { error } = useContext(ErrorsContext)
    const { loggedIn } = useContext(UserContext)

    useEffect(() => {
        if (!loggedIn) {
            navigate("/admin/login")
        }    
        
      return () => {
        ;
      };
    }, []);
    

    return (
        <div className="admin">
            <Outlet />
            {loadingState === "loading" && <span className="logginIn">Cargando...</span>}
            {error !== undefined && <div className="error"> {error} </div>}
        </div >
    )
}

export default AdminLanding


import "./AdminEntry.css";
import { Outlet, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingError } from "../../users/landing/UserLanding";
import { useLoadingState, useUserAuth } from "../../../Contexts";

function AdminLanding() {
	const navigate = useNavigate();
	const location = useLocation();
	const { setLoadingState } = useLoadingState();
	const { isAuth } = useUserAuth();

	useEffect(() => {
		setLoadingState("loading");
		if (isAuth) {
			setLoadingState("loaded");
			if (location.pathname === "/admin/" || location.pathname === "/admin") {
				navigate("/admin/dashboard", { replace: true });
			}
		}
	}, [isAuth]);
	return (
		<div className="admin">
			<Outlet />
			<LoadingError />
		</div>
	);
}

export default AdminLanding;

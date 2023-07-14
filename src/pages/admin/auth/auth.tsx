import { useState, useEffect, FormEvent } from "react";
import { useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../../Contexts";

export function RequireAuth() {
	const auth = useUserAuth();
	const location = useLocation();

	if (!auth.user) {
		// Redirect them to the /login page, but save the current location they were
		// trying to go to when they were redirected. This allows us to send them
		// along to that page after they login, which is a nicer user experience
		// than dropping them off on the home page.
		return <Navigate to="/login" state={{ from: location }} />;
	}

	return <Outlet />;
}

const LoginForm = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const auth = useUserAuth();
	const state = location.state as { from: Location };
	const from = state.from.pathname ?? "/";
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const navBackCallback = () => navigate(from, { replace: true });

	useEffect(() => {
		if (auth.isAuth) {
			navBackCallback()
		}
	}, [auth.isAuth]);

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		auth.signInWithPassword({ email, password, callback: navBackCallback });
	};

	return (
		<div className="admin-login">
			<form className="login-form" onSubmit={handleSubmit}>
				<label>
					<span className="labelName">Email</span>
					<input
						className="labelInput"
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
				</label>
				<label>
					<span className="labelName">Contraseña</span>
					<input
						className="labelInput"
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
				</label>
				<button type="submit" value="Sign In">
					Enviar
				</button>
			</form>
			OR
			<button onClick={() => auth.signinWithGoogle(navBackCallback)}>
				login with google
			</button>
		</div>
	);
};

export default LoginForm;

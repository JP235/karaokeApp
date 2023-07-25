import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Landing from "./pages/users/landing/Landing";
import AdminLanding from "./pages/admin/AdminEntry/AdminEntry";
import LoginForm, { RequireAuth } from "./pages/admin/LoginForm/LoginForm";
import AdminDashboard from "./pages/admin/AdminDashboard/AdminDashboard";
import AdminRoom from "./pages/admin/AdminRoom/AdminRoom";
import UserRoom from "./pages/users/room/Room";
import NotFound from "./components/NotFound";
import { Navbar } from "./components/NavBar/NavBar";

function App() {
	return (
		<div className="App">
			<Navbar />
			<div className="content">
				<BrowserRouter>
					<Routes>
						<Route path="login" element={<LoginForm />} />
						<Route element={<RequireAuth />}>
							<Route path="/admin" element={<AdminLanding />}>
								<Route path="dashboard" element={<AdminDashboard />} />
								<Route path=":roomId" element={<AdminRoom />} />
							</Route>
						</Route>
						<Route path="/" element={<Landing />} />
						<Route path="/room/:roomId" element={<UserRoom />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</div>
		</div>
	);
}

export default App;

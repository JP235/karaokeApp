import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
	// UserProvider,
	// AuthProvider,
	DndProviderTouchAndMouse,
	ErrorsProvider,
	LanguageProvider,
	LoadignStateProvider,
	NavTitleStateProvider,
	UserAuthProvider,
} from "./Contexts.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<NavTitleStateProvider>
			<LanguageProvider>
				<ErrorsProvider>
					<LoadignStateProvider>
						<UserAuthProvider>
							{/* <UserProvider> */}
							{/* <AuthProvider> */}
							<DndProviderTouchAndMouse>
								<App />
							</DndProviderTouchAndMouse>
							{/* </AuthProvider> */}
							{/* </UserProvider> */}
						</UserAuthProvider>
					</LoadignStateProvider>
				</ErrorsProvider>
			</LanguageProvider>
		</NavTitleStateProvider>
	</React.StrictMode>
);

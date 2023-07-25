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
	LoadignProvider,
	PageNameProvider,
	UserAuthProvider,
} from "./Contexts.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<PageNameProvider>
			<LanguageProvider>
				<ErrorsProvider>
					<LoadignProvider>
						<UserAuthProvider>
							{/* <UserProvider> */}
							{/* <AuthProvider> */}
							<DndProviderTouchAndMouse>
								<App />
							</DndProviderTouchAndMouse>
							{/* </AuthProvider> */}
							{/* </UserProvider> */}
						</UserAuthProvider>
					</LoadignProvider>
				</ErrorsProvider>
			</LanguageProvider>
		</PageNameProvider>
	</React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
	AuthProvider,
	DndProviderTouchAndMouse,
	ErrorsProvider,
	LanguageProvider,
	LoadignStateProvider,
	NavTitleStateProvider,
	UserProvider,
} from "./Contexts.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<NavTitleStateProvider>
			<LanguageProvider>
				<ErrorsProvider>
					<LoadignStateProvider>
						<UserProvider>
							<AuthProvider>
								<DndProviderTouchAndMouse>
									<App />
								</DndProviderTouchAndMouse>
							</AuthProvider>
						</UserProvider>
					</LoadignStateProvider>
				</ErrorsProvider>
			</LanguageProvider>
		</NavTitleStateProvider>
	</React.StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { Data } from "./data";
import "./main.css";

fetch(import.meta.env.BASE_URL + "/data.json").then(async (response) => {
	const data: Data = await response.json();

	document.title = "Groupes Karamove " + data.year;

	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<App data={data} />
		</StrictMode>
	);
});

import { createTheme, fontFace } from "@vanilla-extract/css";

export const actor = fontFace({
	fontDisplay: "swap",
	fontStyle: "normal",
	fontWeight: 400,
	src: "url(https://cdn.jsdelivr.net/fontsource/fonts/actor@latest/latin-400-normal.ttf) format('truetype')",
	unicodeRange:
		"U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
});

export const kidsMagazine = fontFace({
	fontDisplay: "auto",
	fontWeight: 100,
	src: "url('https://ateliers-dam.com/wp-content/uploads/2021/06/Kids-Magazine.ttf') format('truetype')",
});

export const [themeClass, vars] = createTheme({
	content: {
		backgroundColor: "#fff",
		color: "#000",
	},
	font: actor,
	heading: {
		color: "#f4d210",
		font: kidsMagazine,
	},
	menu: {
		activeColor: `#d32f00`,
		backgroundColor: "#691700",
		color: "#fff",
	},
	pill: {
		color: "#fff",
		fontWeight: "bold",
	},
	spacing: ".5rem",
});

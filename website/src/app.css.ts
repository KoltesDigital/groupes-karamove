import { vars } from "./theme.css";
import { style } from "@vanilla-extract/css";

const SMALL_SCREEN = "screen and (max-width: 768px)";

export const container = style({
	"@media": {
		[SMALL_SCREEN]: {
			display: "block",
		},
	},
	color: vars.content.color,
	display: "flex",
	fontFamily: vars.font,
	height: "100vh",
	width: "100vw",
});

export const menu = style({
	"@media": {
		[SMALL_SCREEN]: {
			width: "initial",
		},
	},
	alignItems: "stretch",
	backgroundColor: vars.menu.backgroundColor,
	color: vars.menu.color,
	display: "flex",
	flex: "1 0 auto",
	flexDirection: "column",
	overflowY: "auto",
	width: "400px",
});

export const title = style({
	color: vars.heading.color,
	fontFamily: vars.heading.font,
	textAlign: "center",
	textTransform: "uppercase",
});

export const menuNavLinks = style({
	alignItems: "stretch",
	display: "flex",
	flexDirection: "column",
	padding: "1rem 2rem",
});

export const menuNavLink = style({
	color: vars.menu.color,
	fontSize: "1.2em",
	padding: ".7rem",
	selectors: {
		"&.active": {
			backgroundColor: vars.menu.activeColor,
			borderRadius: "50rem",
			fontWeight: "bold",
		},
	},
	textAlign: "center",
	textDecoration: "none",
});

export const menuSeparator = style({
	height: "2rem",
});

export const flexLegend = style({
	display: "flex",
	flexWrap: "wrap",
	gap: vars.spacing,
	justifyContent: "center",
	padding: "2rem",
});

export const fullWidthFlexLegend = style([
	flexLegend,
	{
		alignItems: "stretch",
		textAlign: "center",
	},
]);

export const content = style({
	backgroundColor: vars.content.backgroundColor,
	color: vars.content.color,
	flexGrow: 1,
	overflowY: "auto",
});

export const link = style({
	borderColor: vars.content.color,
	borderRadius: ".5rem",
	borderStyle: "solid",
	borderWidth: "1px",
	color: vars.content.color,
	display: "block",
	padding: ".8rem",
	textAlign: "center",
	textDecoration: "underline",
});

export const menuLink = style([
	link,
	{
		borderColor: vars.menu.color,
		color: vars.menu.color,
	},
]);

export const groups = style({
	display: "flex",
	flexWrap: "wrap",
	gap: "1rem",
	justifyContent: "center",
	padding: "1rem",
});

export const group = style({
	padding: "1rem",
	width: "300px",
});

export const pill = style({
	borderRadius: "50rem",
	color: vars.pill.color,
	fontWeight: vars.pill.fontWeight,
	padding: ".4rem .6rem",
});

export const position = style({
	fontSize: "2em",
	fontStyle: "italic",
	textAlign: "center",
});

export const groupName = style({
	fontFamily: vars.heading.font,
	margin: "0",
	textAlign: "center",
	textTransform: "uppercase",
});

export const location = style({
	fontStyle: "italic",
	marginBottom: "1rem",
	textAlign: "center",
});

export const memberName = style({
	marginBottom: ".2rem",
	textAlign: "center",
});

export const memberRow = style({
	alignItems: "center",
	display: "flex",
	gap: vars.spacing,
	marginBottom: vars.spacing,
});

export const memberNameColumn = style({
	flex: "2 0 0",
	textAlign: "right",
});

export const memberColumn = style({
	display: "flex",
	flex: "3 0 0",
	flexWrap: "wrap",
});

export const discordPill = style([
	pill,
	{
		backgroundColor: vars.menu.backgroundColor,
		borderWidth: "2px",
		color: vars.menu.color,
		cursor: "pointer",
		fontFamily: vars.font,
		fontSize: "1rem",
	},
]);

export const timeBand = style({
	background:
		"linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.5) 50%, rgba(0,0,0,0) 100%);",
});

export const timeClip = style({
	backgroundColor: vars.menu.backgroundColor,
	color: vars.menu.color,
	display: "block",
	fontWeight: "bold",
	margin: "auto",
	minHeight: "2rem",
	padding: ".5rem",
	position: "relative",
	textAlign: "center",
	textDecoration: "none",
	width: "50%",
});

export const waveform = style({
	width: "50%",
});

export const timeRow = style({
	alignItems: "center",
	display: "flex",
	marginTop: ".5rem",
});

export const timeColumn = style({
	flex: "1 0 0",
	fontSize: "1.2em",
	left: "1rem",
	position: "relative",
	textAlign: "center",
});

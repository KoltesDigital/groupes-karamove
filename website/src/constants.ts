export const LOCATIONS = ["sur place", "en ligne"];

export interface Technique {
	knowable: boolean;
	long: string;
	short: string;
}

export const TECHNIQUES: Technique[] = [
	{
		knowable: true,
		long: "Animation 2D digitale (TVP, After...)",
		short: "2D digi",
	},
	{
		knowable: true,
		long: "Animation 2D traditionnelle (papier, table lumineuse...)",
		short: "2D tradi",
	},
	{
		knowable: true,
		long: "Animation 3D (Maya, Blender...)",
		short: "3D",
	},
	{
		knowable: true,
		long: "Animation banc-titre (sable, papier découpé, peinture animée...)",
		short: "Banc-titre",
	},
	{
		knowable: true,
		long: "Stop-motion (marionnette, décor)",
		short: "Stop-mo",
	},
	{
		knowable: false,
		long: "Libre en fonction du mood de mon groupe",
		short: "Libre",
	},
];

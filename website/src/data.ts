export interface MemberDatum {
	id: number;
	name: string;
	discordName: string;
	profile: number;
	level: number;
	preferredTechniques: number[];
	knownTechniques: number[];
}

export interface TimeInterval {
	position: number;
	start: number;
	end: number;
}

export interface GroupDatum {
	name: string;
	location: number;
	link: string;
	timeInterval: TimeInterval | null;

	members: MemberDatum[];
}

export interface TimeData {
	introDuration: number;
	groupIntervalDuration: number;
	musicDuration: number;
}

export interface Data {
	groups: GroupDatum[];
	profiles: string[];
	time: TimeData | null;
	withMusic: boolean;
	year: number;
}

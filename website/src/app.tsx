import * as d3 from "d3";
import {
	Fragment,
	FunctionComponent,
	PropsWithChildren,
	ReactElement,
	useMemo,
} from "react";
import {
	BrowserRouter,
	NavLink,
	NavLinkProps,
	Route,
	Routes,
} from "react-router";
import * as classNames from "./app.css";
import { LOCATIONS, Technique, TECHNIQUES } from "./constants";
import { Data, GroupDatum, MemberDatum, TimeData } from "./data";
import { exhaustiveCheck } from "./exhaustive-check";
import { themeClass } from "./theme.css";
import waveform from "./waveform.svg";

const getProfileColor = (data: Data, t: number) =>
	d3.color(
		d3
			.scaleLinear()
			.domain([0, data.profiles.length])
			.interpolate(() => d3.interpolateRainbow)(t)
	);

enum TechniqueLabel {
	Long,
	Short,
}

function getTechniqueLabel(technique: Technique, label: TechniqueLabel) {
	switch (label) {
		case TechniqueLabel.Long:
			return technique.long;
		case TechniqueLabel.Short:
			return technique.short;
		default:
			exhaustiveCheck(label);
	}
}

const Pill: FunctionComponent<
	PropsWithChildren<{
		backgroundColor: d3.RGBColor | d3.HSLColor | null;
	}>
> = ({ backgroundColor, children }) => (
	<div
		className={classNames.pill}
		style={{
			backgroundColor: backgroundColor?.darker(0.5).formatHex(),
		}}
	>
		{children}
	</div>
);

const profileAsPill = (data: Data, index: number) => (
	<Pill backgroundColor={getProfileColor(data, index)}>
		{data.profiles[index]}
	</Pill>
);

const techniqueColor = d3.schemeCategory10.map((c) => d3.color(c));

const techniqueAsPill = (index: number, label: TechniqueLabel) => (
	<Pill backgroundColor={techniqueColor[index]}>
		{getTechniqueLabel(TECHNIQUES[index], label)}
	</Pill>
);

const MemberName: FunctionComponent<{
	member: MemberDatum;
}> = ({ member }) => <div className={classNames.memberName}>{member.name}</div>;

const MemberRow: FunctionComponent<
	PropsWithChildren<{
		member: MemberDatum;
	}>
> = ({ children, member }) => (
	<div className={classNames.memberRow}>
		<div className={classNames.memberNameColumn}>{member.name}</div>
		<div className={classNames.memberColumn}>{children}</div>
	</div>
);

const ProfileLegend: FunctionComponent<{
	data: Data;
}> = ({ data }) => (
	<div className={classNames.flexLegend}>
		{data.profiles.map((_, index) => (
			<Fragment key={index}>{profileAsPill(data, index)}</Fragment>
		))}
	</div>
);

const MemberProfile: FunctionComponent<{
	data: Data;
	member: MemberDatum;
}> = ({ data, member }) => (
	<MemberRow member={member}>{profileAsPill(data, member.profile)}</MemberRow>
);

const TechniqueLegend: FunctionComponent<{
	onlyKnowable?: boolean;
}> = ({ onlyKnowable }) => {
	const techniques = useMemo(
		() =>
			onlyKnowable
				? TECHNIQUES.filter((technique) => technique.knowable)
				: TECHNIQUES,
		[onlyKnowable]
	);

	return (
		<div className={classNames.fullWidthFlexLegend}>
			{techniques.map((_, index) => (
				<Fragment key={index}>
					{techniqueAsPill(index, TechniqueLabel.Long)}
				</Fragment>
			))}
		</div>
	);
};

const MemberPreferredTechniques: FunctionComponent<{
	member: MemberDatum;
}> = ({ member }) => (
	<MemberRow member={member}>
		{member.preferredTechniques.sort().map((technique, index) => (
			<Fragment key={index}>
				{techniqueAsPill(technique, TechniqueLabel.Short)}
			</Fragment>
		))}
	</MemberRow>
);

const MemberKnownTechniques: FunctionComponent<{
	member: MemberDatum;
}> = ({ member }) => (
	<MemberRow member={member}>
		{member.knownTechniques.sort().map((technique, index) => (
			<Fragment key={index}>
				{techniqueAsPill(technique, TechniqueLabel.Short)}
			</Fragment>
		))}
	</MemberRow>
);

const DiscordLegend: FunctionComponent = () => (
	<div className={classNames.fullWidthFlexLegend}>
		Cliquez sur le nom pour le copier dans le presse-papier !
	</div>
);

const MemberDiscord: FunctionComponent<{
	member: MemberDatum;
}> = ({ member }) => (
	<MemberRow member={member}>
		{member.discordName && (
			<button
				className={classNames.discordPill}
				onClick={(event) => {
					event.stopPropagation();
					navigator.clipboard
						?.writeText(member.discordName)
						.catch(console.error);
				}}
			>
				{member.discordName}
			</button>
		)}
	</MemberRow>
);

const GroupName: FunctionComponent<{
	group: GroupDatum;
}> = ({ group }) => (
	<>
		{group.timeInterval && (
			<div className={classNames.position}>#{group.timeInterval.position}</div>
		)}
		<h2 className={classNames.groupName}>{group.name}</h2>
		<div className={classNames.location}>{LOCATIONS[group.location]}</div>
	</>
);

const Groups: FunctionComponent<{
	data: Data;
	groupElement: (group: GroupDatum) => ReactElement;
}> = ({ data, groupElement }) => (
	<div className={classNames.groups}>
		{data.groups.map((group) => (
			<div key={group.name} className={classNames.group}>
				<GroupName group={group} />
				{groupElement(group)}
			</div>
		))}
	</div>
);

const GroupWithMembers: FunctionComponent<{
	group: GroupDatum;
	memberElement: (member: MemberDatum) => ReactElement;
}> = ({ group, memberElement }) => (
	<>
		{group.members.map((member) => (
			<Fragment key={member.id}>{memberElement(member)}</Fragment>
		))}
	</>
);

const GroupsWithMembers: FunctionComponent<{
	data: Data;
	memberElement: (member: MemberDatum) => ReactElement;
}> = ({ data, memberElement }) => (
	<Groups
		data={data}
		groupElement={(group) => (
			<GroupWithMembers group={group} memberElement={memberElement} />
		)}
	/>
);

const GoogleDriveLegend: FunctionComponent = () => (
	<div className={classNames.fullWidthFlexLegend}>
		<a
			className={classNames.menuLink}
			target="_blank"
			href="https://drive.google.com/drive/folders/1OOBW6XLta5U27KPlrqay44Zk6sA2fENT?usp=sharing"
		>
			Cliquez ici pour ouvrir le dossier commun avec la musique entière.
		</a>
	</div>
);

const GroupWithGoogleDriveLink: FunctionComponent<{
	group: GroupDatum;
}> = ({ group }) => (
	<a className={classNames.link} target="_blank" href={group.link}>
		Cliquez ici pour ouvrir le dossier du groupe.
	</a>
);

const TimeIntervalLegend: FunctionComponent<{
	data: Data;
	timeData: TimeData;
}> = ({ data, timeData }) => (
	<div className={classNames.fullWidthFlexLegend}>
		<p>
			Le rendu est de <strong>{timeData.groupIntervalDuration} secondes</strong>
			, soit <strong>{timeData.groupIntervalDuration * 24} frames</strong>{" "}
			exportées en <strong>H264 1080p</strong> à <strong>24 FPS</strong>.
		</p>
		{data.withMusic && (
			<>
				<p>Cliquez sur un intervalle pour télécharger l'extrait sonore.</p>
				<a
					className={classNames.menuLink}
					target="_blank"
					href={import.meta.env.BASE_URL + "/music.ogg"}
				>
					Cliquez ici pour télécharger la musique entière.
				</a>
			</>
		)}
	</div>
);

function toTime(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	seconds = seconds % 60;
	return `${minutes}:${seconds.toFixed(0).padStart(2, "0")}`;
}

const GroupsWithTimeIntervals: FunctionComponent<{
	data: Data;
	timeData: TimeData;
}> = ({ data, timeData }) => (
	<div className={classNames.groups}>
		{data.groups.map((group) => (
			<div key={group.name} className={classNames.group}>
				<GroupName group={group} />
				{group.timeInterval && (
					<>
						<div className={classNames.timeBand}>
							{data.withMusic ? (
								<a
									className={classNames.timeClip}
									target="_blank"
									href={
										import.meta.env.BASE_URL +
										"/music-segments/" +
										group.timeInterval.position +
										".ogg"
									}
								>
									<img className={classNames.waveform} src={waveform} />
								</a>
							) : (
								<div className={classNames.timeClip}></div>
							)}
						</div>
						<div className={classNames.timeRow}>
							<div className={classNames.timeColumn}>
								{toTime(group.timeInterval.start)}
							</div>
							<div className={classNames.timeColumn}>
								{toTime(group.timeInterval.end)}
							</div>
						</div>
					</>
				)}
			</div>
		))}
		{data.withMusic && (
			<>
				<div className={classNames.group}>
					<h2 className={classNames.groupName}>Intro</h2>
					<div className={classNames.timeBand}>
						<a
							className={classNames.timeClip}
							target="_blank"
							href={import.meta.env.BASE_URL + "/music-segments/" + 0 + ".ogg"}
						>
							<img className={classNames.waveform} src={waveform} />
						</a>
					</div>
					<div className={classNames.timeRow}>
						<div className={classNames.timeColumn}>{toTime(0)}</div>
						<div className={classNames.timeColumn}>
							{toTime(timeData.introDuration)}
						</div>
					</div>
				</div>
				<div className={classNames.group}>
					<h2 className={classNames.groupName}>Outro</h2>
					<div className={classNames.timeBand}>
						<a
							className={classNames.timeClip}
							target="_blank"
							href={
								import.meta.env.BASE_URL +
								"/music-segments/" +
								(data.groups.length + 1) +
								".ogg"
							}
						>
							<img className={classNames.waveform} src={waveform} />
						</a>
					</div>
					<div className={classNames.timeRow}>
						<div className={classNames.timeColumn}>
							{toTime(
								timeData.introDuration +
									timeData.groupIntervalDuration * data.groups.length
							)}
						</div>
						<div className={classNames.timeColumn}>
							{toTime(timeData.musicDuration)}
						</div>
					</div>
				</div>
			</>
		)}
	</div>
);

const NavItem: FunctionComponent<PropsWithChildren<NavLinkProps>> = ({
	children,
	...props
}) => (
	<NavLink className={classNames.menuNavLink} {...props}>
		{children}
	</NavLink>
);

const Layout: FunctionComponent<{
	data: Data;
	content: ReactElement;
	legend?: ReactElement;
}> = ({ data, content, legend }) => (
	<div className={themeClass + " " + classNames.container}>
		<div className={classNames.menu}>
			<h1 className={classNames.title}>Groupes Karamove {data.year}</h1>
			<div className={classNames.menuNavLinks}>
				<NavItem to="/">Constitution</NavItem>
				<NavItem to="/profiles">Ecoles / Profils</NavItem>
				<NavItem to="/preferred-techniques">Techniques souhaitées</NavItem>
				<NavItem to="/known-techniques">Techniques maîtrisées</NavItem>
				<NavItem to="/discord-names">Noms sur Discord</NavItem>
				<div className={classNames.menuSeparator}></div>
				<NavItem to="/google-drive-links">Liens Google Drive</NavItem>
				{data.time && (
					<NavItem to="/time-intervals">Intervalles de temps</NavItem>
				)}
			</div>
			{legend}
		</div>
		<div className={classNames.content}>{content}</div>
	</div>
);

export const App: FunctionComponent<{
	data: Data;
}> = ({ data }) => (
	<BrowserRouter basename={import.meta.env.BASE_URL}>
		<Routes>
			<Route
				path="/"
				element={
					<Layout
						data={data}
						content={
							<GroupsWithMembers
								data={data}
								memberElement={(member) => <MemberName member={member} />}
							/>
						}
					/>
				}
			/>
			<Route
				path="/profiles"
				element={
					<Layout
						data={data}
						content={
							<GroupsWithMembers
								data={data}
								memberElement={(member) => (
									<MemberProfile data={data} member={member} />
								)}
							/>
						}
						legend={<ProfileLegend data={data} />}
					/>
				}
			/>
			<Route
				path="/preferred-techniques"
				element={
					<Layout
						data={data}
						content={
							<GroupsWithMembers
								data={data}
								memberElement={(member) => (
									<MemberPreferredTechniques member={member} />
								)}
							/>
						}
						legend={<TechniqueLegend />}
					/>
				}
			/>
			<Route
				path="/known-techniques"
				element={
					<Layout
						data={data}
						content={
							<GroupsWithMembers
								data={data}
								memberElement={(member) => (
									<MemberKnownTechniques member={member} />
								)}
							/>
						}
						legend={<TechniqueLegend onlyKnowable />}
					/>
				}
			/>
			<Route
				path="/discord-names"
				element={
					<Layout
						data={data}
						content={
							<GroupsWithMembers
								data={data}
								memberElement={(member) => <MemberDiscord member={member} />}
							/>
						}
						legend={<DiscordLegend />}
					/>
				}
			/>
			<Route
				path="/google-drive-links"
				element={
					<Layout
						data={data}
						content={
							<Groups
								data={data}
								groupElement={(group) => (
									<GroupWithGoogleDriveLink group={group} />
								)}
							/>
						}
						legend={<GoogleDriveLegend />}
					/>
				}
			/>
			{data.time && (
				<Route
					path="/time-intervals"
					element={
						<Layout
							data={data}
							content={
								<GroupsWithTimeIntervals data={data} timeData={data.time} />
							}
							legend={<TimeIntervalLegend data={data} timeData={data.time} />}
						/>
					}
				/>
			)}
		</Routes>
	</BrowserRouter>
);

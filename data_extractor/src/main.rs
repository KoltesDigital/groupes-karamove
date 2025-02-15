use std::{
    collections::{BTreeMap, BTreeSet},
    fmt::Write,
    fs::File,
    path::PathBuf,
    process::Command,
};

use anyhow::{anyhow, bail, Context, Result};
use clap::{Args, Parser, Subcommand};
use itertools::Itertools;
use serde::{de, Deserialize, Deserializer, Serialize};
use serde_repr::Serialize_repr;

#[derive(Debug, Args)]
struct CliOutputJsonArgs {
    json: PathBuf,

    year: usize,

    #[arg(long)]
    with_time: bool,

    #[arg(long)]
    with_music: bool,

    #[arg(long)]
    music_info: Option<PathBuf>,
}

#[derive(Debug, Args)]
struct CliOutputMusicSegmentsArgs {
    segments: PathBuf,

    ffmpeg: PathBuf,

    music: PathBuf,
}

#[derive(Debug, Subcommand)]
enum CliCommand {
    OutputJson(CliOutputJsonArgs),
    OutputMusicSegments(CliOutputMusicSegmentsArgs),
}

#[derive(Debug, Parser)]
struct CliArgs {
    csv: PathBuf,

    intro_duration: usize,
    group_interval_duration: usize,

    #[command(subcommand)]
    command: CliCommand,
}

fn deserialize_trim<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'de>,
{
    let s: &str = Deserialize::deserialize(deserializer)?;
    Ok(s.trim().to_string())
}

fn deserialize_techniques<'de, D>(deserializer: D) -> Result<Vec<Technique>, D::Error>
where
    D: Deserializer<'de>,
{
    let s: &str = Deserialize::deserialize(deserializer)?;

    let mut techniques = vec![];
    if s.contains("2D digitale") {
        techniques.push(Technique::DigitalTwoDimensional)
    }
    if s.contains("2D traditionnel") {
        techniques.push(Technique::TraditionalTwoDimensional)
    }
    if s.contains("3D") {
        techniques.push(Technique::ThreeDimensional)
    }
    if s.contains("banc-titre") {
        techniques.push(Technique::Rostrum)
    }
    if s.contains("Stop-motion") {
        techniques.push(Technique::StopMotion)
    }
    if s.contains("Libre") {
        techniques.push(Technique::Free)
    }

    Ok(techniques)
}

#[derive(Debug, Deserialize)]
struct CsvRecord {
    #[serde(rename(deserialize = "N°"))]
    group_position: usize,
    #[serde(
        deserialize_with = "deserialize_trim",
        rename(deserialize = "Nom groupe")
    )]
    group_name: String,
    #[serde(rename(deserialize = "Modalité"))]
    group_location: Location,
    #[serde(
        deserialize_with = "deserialize_trim",
        rename(deserialize = "Lien drive")
    )]
    group_link: String,

    #[serde(deserialize_with = "deserialize_trim", rename(deserialize = "Prénom"))]
    first_name: String,
    #[serde(deserialize_with = "deserialize_trim", rename(deserialize = "NOM"))]
    last_name: String,
    #[serde(deserialize_with = "deserialize_trim", rename(deserialize = "Discord"))]
    discord_name: String,
    #[serde(
        deserialize_with = "deserialize_trim",
        rename(deserialize = "Ecole ou profil")
    )]
    profile: String,
    #[serde(rename(deserialize = "Niveau"))]
    level: usize,
    #[serde(
        deserialize_with = "deserialize_techniques",
        rename(deserialize = "Quelle méthode d'animation aimerais-tu utiliser au Karamove ?",)
    )]
    preferred_techniques: Vec<Technique>,
    #[serde(
        deserialize_with = "deserialize_techniques",
        rename(deserialize = "Avec quelle(s) méthode(s) d'animation es-tu à l'aise ?")
    )]
    known_techniques: Vec<Technique>,
}

fn deserialize_string_as_f32<'de, D>(deserializer: D) -> Result<usize, D::Error>
where
    D: Deserializer<'de>,
{
    let s: String = Deserialize::deserialize(deserializer)?;
    let f: f32 = s.parse().map_err(de::Error::custom)?;
    Ok(f.round() as usize)
}

#[derive(Debug, Deserialize)]
struct MusicInfoFormat {
    #[serde(deserialize_with = "deserialize_string_as_f32")]
    duration: usize,
}

#[derive(Debug, Deserialize)]
struct MusicInfo {
    format: MusicInfoFormat,
}

#[derive(Debug, Clone, Deserialize, Serialize_repr)]
#[repr(u8)]
enum Location {
    #[serde(rename(deserialize = "Présentiel"))]
    OnSite,
    #[serde(rename(deserialize = "En ligne"))]
    Remote,
}

#[derive(Debug, Clone, Serialize_repr)]
#[repr(u8)]
enum Technique {
    DigitalTwoDimensional,
    TraditionalTwoDimensional,
    ThreeDimensional,
    Rostrum,
    StopMotion,
    Free,
}

#[derive(Debug, Serialize)]
#[serde(rename_all(serialize = "camelCase"))]
struct Member<'a> {
    id: usize,
    name: String,
    discord_name: &'a str,
    profile: usize,
    level: usize,
    preferred_techniques: &'a Vec<Technique>,
    known_techniques: &'a Vec<Technique>,
}

#[derive(Debug)]
struct Group<'a> {
    name: &'a str,
    location: Location,
    link: &'a str,
    members: Vec<Member<'a>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all(serialize = "camelCase"))]
struct OutputGroupTime {
    position: usize,
    start: usize,
    end: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all(serialize = "camelCase"))]
struct OutputGroup<'a> {
    name: &'a str,
    location: Location,
    link: &'a str,
    time_interval: Option<OutputGroupTime>,
    members: Vec<Member<'a>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all(serialize = "camelCase"))]
struct OutputTime {
    intro_duration: usize,
    group_interval_duration: usize,
    music_duration: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all(serialize = "camelCase"))]
struct Output<'a> {
    groups: &'a Vec<OutputGroup<'a>>,
    profiles: &'a Vec<&'a String>,
    time: Option<OutputTime>,
    with_music: bool,
    year: usize,
}

fn main() -> Result<()> {
    let args = CliArgs::try_parse().context("failed to parse CLI arguments")?;

    let records = csv::Reader::from_path(&args.csv)
        .context("failed to construct reader")?
        .into_deserialize()
        .map(|result| result.context("failed to parse record"))
        .collect::<Result<Vec<CsvRecord>>>()?;

    match args.command {
        CliCommand::OutputJson(command_args) => {
            let profiles = records
                .iter()
                .map(|record| &record.profile)
                .unique()
                .sorted()
                .collect_vec();

            let mut groups = BTreeMap::default();
            for (record_index, record) in records.iter().enumerate() {
                let group = groups
                    .entry(record.group_position)
                    .or_insert_with(|| Group {
                        name: &record.group_name,
                        location: record.group_location.clone(),
                        link: &record.group_link,
                        members: Vec::with_capacity(6),
                    });

                group.members.push(Member {
                    id: record_index,
                    name: format!("{} {}", record.first_name, record.last_name),
                    discord_name: &record.discord_name,
                    profile: profiles
                        .iter()
                        .position(|profile| profile == &&record.profile)
                        .expect("profiles has been built from records"),
                    level: record.level,
                    preferred_techniques: &record.preferred_techniques,
                    known_techniques: &record.known_techniques,
                });
            }

            let output_groups = groups
                .into_iter()
                .map(|(group_position, group)| OutputGroup {
                    name: group.name,
                    location: group.location,
                    link: group.link,
                    time_interval: match command_args.with_time {
                        false => None,
                        true => Some(OutputGroupTime {
                            position: group_position,
                            start: (group_position - 1) * args.group_interval_duration
                                + args.intro_duration,
                            end: group_position * args.group_interval_duration
                                + args.intro_duration,
                        }),
                    },
                    members: group.members,
                })
                .sorted_by(match command_args.with_time {
                    false => |a: &OutputGroup, b: &OutputGroup| Ord::cmp(a.name, b.name),
                    true => |a: &OutputGroup, b: &OutputGroup| {
                        Ord::cmp(
                            &a.time_interval.as_ref().unwrap().position,
                            &b.time_interval.as_ref().unwrap().position,
                        )
                    },
                })
                .collect();

            let output_file = File::create(&command_args.json)?;

            serde_json::to_writer(
                output_file,
                &Output {
                    groups: &output_groups,
                    profiles: &profiles,
                    time: match command_args.with_time {
                        false => None,
                        true => {
                            let music_info_file =
                                File::open(command_args.music_info.ok_or_else(|| {
                                    anyhow!("--music-info must be given with --with-time")
                                })?)
                                .context("failed to open music info")?;
                            let music_info: MusicInfo = serde_json::from_reader(music_info_file)
                                .context("failed to read music info")?;

                            Some(OutputTime {
                                intro_duration: args.intro_duration,
                                group_interval_duration: args.group_interval_duration,
                                music_duration: music_info.format.duration,
                            })
                        }
                    },
                    with_music: command_args.with_music,
                    year: command_args.year,
                },
            )
            .context("failed to write output")?;
        }
        CliCommand::OutputMusicSegments(command_args) => {
            let mut groups = BTreeSet::default();
            for record in records.iter() {
                groups.insert(record.group_position);
            }

            let mut filter = String::new();
            write!(&mut filter, "asegment=timestamps={}", args.intro_duration)?;
            for index in 1..(groups.len() + 1) {
                write!(
                    &mut filter,
                    "|{}",
                    args.intro_duration + args.group_interval_duration * index
                )?;
            }
            for index in 0..(groups.len() + 2) {
                write!(&mut filter, "[{}]", index)?;
            }

            let mut command = Command::new(command_args.ffmpeg);

            command.args([
                "-hide_banner",
                "-i",
                &command_args.music.to_string_lossy(),
                "-filter_complex",
                &filter,
            ]);

            for index in 0..(groups.len() + 2) {
                command.args([
                    "-map",
                    &format!("[{}]", index),
                    &format!("{}/{}.ogg", command_args.segments.to_string_lossy(), index),
                ]);
            }

            let output = command
                .output()
                .context("failed to execute ffmpeg process")?;

            if !output.status.success() {
                println!("{:#?}", output);
                bail!("failed to run ffmpeg");
            }
        }
    }

    Ok(())
}

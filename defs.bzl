load(":edition.bzl", "GROUP_INTERVAL_DURATION", "INTRO_DURATION", "WITH_MUSIC", "WITH_TIME", "YEAR")

def _generate_data_impl(ctx):
    json_file = ctx.actions.declare_file(ctx.label.name + ".json")

    inputs = [
        ctx.file.data_file,
    ]

    args = [
        ctx.file.data_file.path,
        str(INTRO_DURATION),
        str(GROUP_INTERVAL_DURATION),
        "output-json",
        json_file.path,
        str(YEAR),
    ]

    if WITH_MUSIC:
        args.append("--with-music")

    if WITH_TIME:
        inputs.append(ctx.file.music_info)
        args.extend([
            "--with-time",
            "--music-info",
            ctx.file.music_info.path,
        ])

    ctx.actions.run(
        inputs = inputs,
        outputs = [json_file],
        executable = ctx.executable.data_extractor,
        arguments = args,
    )

    return [
        DefaultInfo(
            files = depset(direct = [json_file]),
        ),
    ]

generate_data = rule(
    implementation = _generate_data_impl,
    attrs = {
        "data_extractor": attr.label(
            default = "//data_extractor:binary",
            executable = True,
            cfg = "exec",
        ),
        "data_file": attr.label(
            allow_single_file = [".csv"],
            mandatory = True,
        ),
        "music_info": attr.label(
            allow_single_file = True,
            mandatory = True,
        ),
    },
)

def _generate_music_segments_impl(ctx):
    segments_directory = ctx.actions.declare_directory(ctx.label.name + ".dir")

    args = [
        ctx.file.data_file.path,
        str(INTRO_DURATION),
        str(GROUP_INTERVAL_DURATION),
        "output-music-segments",
        segments_directory.path,
        ctx.file.ffmpeg.path,
        ctx.file.music_file.path,
    ]

    ctx.actions.run(
        inputs = [
            ctx.file.data_file,
            ctx.file.music_file,
            ctx.file.ffmpeg,
        ],
        outputs = [segments_directory],
        executable = ctx.executable.data_extractor,
        arguments = args,
    )

    return [
        DefaultInfo(
            files = depset(direct = [segments_directory]),
        ),
    ]

generate_music_segments = rule(
    implementation = _generate_music_segments_impl,
    attrs = {
        "data_extractor": attr.label(
            default = "//data_extractor:binary",
            executable = True,
            cfg = "exec",
        ),
        "data_file": attr.label(
            allow_single_file = [".csv"],
            mandatory = True,
        ),
        "ffmpeg": attr.label(
            default = ":ffmpeg",
            allow_single_file = True,
        ),
        "music_file": attr.label(
            allow_single_file = [".wav"],
            mandatory = True,
        ),
    },
)

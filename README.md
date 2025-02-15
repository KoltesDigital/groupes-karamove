# Groupes Karamove

This project generates a website for [Karamove](https://ateliers-dam.com/karamove/) with information for attendees.

## So, how does it work?

Congrats, I guess you've been tasked to generate the website for the new edition of Karamove!

First, you need some software:

- [`bazel`](https://github.com/bazelbuild/bazel) (developed with version _8.1.1_, may work with later versions).
- [`ibazel`](https://github.com/bazelbuild/bazel-watcher) for development hot-reload, which is useful for editing CSS.
- a code editor, e.g. [VS Code](https://code.visualstudio.com/).

Download this project by clicking on _<> Code_ > _Download ZIP_ and extract it somewhere. Open the directory within the code editor.

You can change some info in _edition.bzl_. For example, it's written there that you have to put a CSV file named _data.csv_ and the music file named _music.wav_ in the root directory. Do it.

Great. Now let's build everything to test that the tools work. Go to the Terminal tab and execute:

```sh
bazel build //...
```

which should complete after a couple of minutes. If it failed, well, you're doomed.

Now execute this command to download some files and make the code editor happy.

```sh
bazel run '@pnpm' -- --dir $PWD install
```

And run the development server:

- Linux:

  ```sh
  nohup ibazel build //website:dev > /dev/null 2>&1 & ; bazel run //website:dev ; kill $!
  ```

- Windows:

  ```powershell
  $p = Start-Process -WindowStyle Hidden ibazel 'build //website:dev' -PassThru ; try { bazel run //website:dev } finally { $p.Kill() }
  ```

Wait a couple of seconds. When Vite says it's ready, open the said page in your browser. Every change you'll make in the code will appear here, after a few seconds.

To change the visual style, you'll have to change _website/src/theme.css.ts_ and _website/src/app.css.ts_, which is CSS encoded in JS.

Once you're done, execute:

```sh
bazel build //website:build
```

The generated files are located in _bazel-bin/website/dist_. Upload them to your website storage.

## License

Public domain / CC0

# Running Openverse locally on macOS (Apple Silicon)

These notes capture the toolchain quirks needed to build and run Openverse
on a modern macOS (tested on macOS 26 / Apple Silicon M-series). The upstream
Biomes setup targets Ubuntu; the steps below cover the macOS-specific gaps.

## Prerequisites

- Node 20 (via nvm): `nvm install 20 && nvm use 20`
- Python 3.10 (via pyenv): `pyenv install 3.10`
- Yarn, git-lfs, bazelisk, redis: `brew install yarn git-lfs bazelisk redis`
- Xcode Command Line Tools

## One-time setup

```bash
git lfs pull
python3.10 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Native node modules: install without postinstall (puppeteer's Chromium
# download and v8-profiler-next's gyp build hang/fail on Apple Silicon and
# are not needed to run the game), then rebuild the bindings we DO need.
PUPPETEER_SKIP_DOWNLOAD=true yarn install --ignore-scripts
npm rebuild segfault-handler bufferutil utf-8-validate msgpackr-extract sharp
```

## The macOS 26 LC_UUID toolchain issue

macOS 26's dyld refuses to execute Mach-O binaries that lack an `LC_UUID`
load command. Bazel 6.x's C++ autoconfig compiles
`external/local_config_cc/wrapped_clang` without one, so every Bazel action
that invokes it aborts with `exit 134` / `dyld: missing LC_UUID load command`.

We pin **Bazel 6.5.0** (see `.bazelversion`) and recompile `wrapped_clang`
with `-Wl,-random_uuid` via `scripts/fix-wrapped-clang.sh`. Run that helper
whenever Bazel regenerates its C++ toolchain (i.e. after changing
`WORKSPACE.bazel` / `.bazelversion`, or after `bazel clean --expunge`):

```bash
# Trigger one build so Bazel generates the toolchain, then patch it:
bazel build //voxeloo/py_ext:py_ext.so || true
bash scripts/fix-wrapped-clang.sh
```

## Run

```bash
source .venv/bin/activate
nvm use 20
yes y | ./b data-snapshot run
```

Then open http://localhost:3000 and choose "Login with Dev".

If the build fails with an LC_UUID error, re-run
`scripts/fix-wrapped-clang.sh` and start again — the patched toolchain
persists until Bazel regenerates it.

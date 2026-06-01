#!/usr/bin/env bash
# macOS 26 (Tahoe) ships a dyld that refuses to exec Mach-O binaries lacking
# an LC_UUID load command. Bazel 6.x's C++ autoconfig compiles
# external/local_config_cc/wrapped_clang without one, so every Bazel action
# that runs it aborts (exit 134). We recompile wrapped_clang from Bazel's
# bundled source with -Wl,-random_uuid to force an LC_UUID. Re-run this any
# time Bazel regenerates the cc toolchain (after WORKSPACE/.bazelversion
# changes or `bazel clean --expunge`).
set -euo pipefail
OB="$(bazel info output_base 2>/dev/null)"
WC="$OB/external/local_config_cc/wrapped_clang"
if [[ ! -e "$WC" ]]; then
  echo "wrapped_clang not found at $WC — run a build once so Bazel generates it."
  exit 0
fi
if otool -l "$WC" 2>/dev/null | grep -q LC_UUID; then
  echo "wrapped_clang already has LC_UUID — nothing to do."
  exit 0
fi
SRC="$(find "$(dirname "$OB")"/install -name wrapped_clang.cc -path '*osx/crosstool*' 2>/dev/null | head -1)"
if [[ -z "$SRC" ]]; then
  echo "Could not locate wrapped_clang.cc source."
  exit 1
fi
echo "Recompiling wrapped_clang with LC_UUID from $SRC"
chmod +w "$WC"
clang++ -std=c++17 -O2 -arch arm64 -arch x86_64 -Wl,-random_uuid -o "$WC" "$SRC"
chmod 755 "$WC"
echo "Done. LC_UUID present: $(otool -l "$WC" | grep -c LC_UUID) (expect 2)"

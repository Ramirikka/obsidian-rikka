#!/bin/bash
# Update Rikka — double-click to install the latest Rikka release into every
# Obsidian vault on this Mac that already has Rikka installed.
# Only the plugin's 3 files are replaced (a backup is kept); notes are never touched.

set -u
REPO="Ramirikka/obsidian-rikka"
PLUGIN_ID="rikka"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "== Update Rikka =="
echo

# 1) Find the latest release that has all three files.
echo "Checking the latest release…"
API="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest")" || { echo "Couldn't reach GitHub. Check your internet and try again."; { read -n1 -r -p "Press any key to close." </dev/tty; } 2>/dev/null || true; exit 1; }
TAG="$(printf '%s' "$API" | grep -o '"tag_name": *"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')"
[ -n "$TAG" ] || { echo "Couldn't read the release info."; { read -n1 -r -p "Press any key to close." </dev/tty; } 2>/dev/null || true; exit 1; }
echo "Latest version: $TAG"

for f in main.js manifest.json styles.css; do
  curl -fsSL -o "$TMP/$f" "https://github.com/$REPO/releases/download/$TAG/$f" || { echo "Download of $f failed — the release may still be finishing. Try again in a minute."; { read -n1 -r -p "Press any key to close." </dev/tty; } 2>/dev/null || true; exit 1; }
  [ -s "$TMP/$f" ] || { echo "$f downloaded empty. Stopping."; { read -n1 -r -p "Press any key to close." </dev/tty; } 2>/dev/null || true; exit 1; }
done
grep -q "\"id\": *\"$PLUGIN_ID\"" "$TMP/manifest.json" || { echo "Downloaded files don't look like Rikka. Stopping."; { read -n1 -r -p "Press any key to close." </dev/tty; } 2>/dev/null || true; exit 1; }

# 2) Find vaults Obsidian knows about that already have Rikka.
CONF="$HOME/Library/Application Support/obsidian/obsidian.json"
VAULTS=()
if [ -f "$CONF" ]; then
  # Vault paths from Obsidian's own list (no Python needed).
  while IFS= read -r p; do VAULTS+=("$p"); done < <(grep -o '"path":"[^"]*"' "$CONF" | sed 's/^"path":"//; s/"$//; s#\\/#/#g')
fi

updated=0
for v in "${VAULTS[@]:-}"; do
  [ -n "$v" ] || continue
  dir="$v/.obsidian/plugins/$PLUGIN_ID"
  [ -d "$dir" ] || continue
  old="$(grep -o '"version": *"[^"]*"' "$dir/manifest.json" 2>/dev/null | head -1 | sed 's/.*"\([^"]*\)"$/\1/')"; [ -n "$old" ] || old="?"
  backup="$dir/.backup-$old"
  mkdir -p "$backup" && cp -f "$dir"/main.js "$dir"/manifest.json "$dir"/styles.css "$backup"/ 2>/dev/null
  cp -f "$TMP/main.js" "$TMP/manifest.json" "$TMP/styles.css" "$dir"/ && {
    echo "✓ $(basename "$v"): $old → $TAG"
    updated=$((updated+1))
  }
done

echo
if [ "$updated" -eq 0 ]; then
  echo "No vault with Rikka installed was found."
  echo "Install Rikka once (BRAT or copy the plugin folder), then run this again."
else
  echo "Done. Quit and reopen Obsidian (Cmd+Q) to load Rikka $TAG."
fi
echo
{ read -n1 -r -p "Press any key to close." </dev/tty; } 2>/dev/null || true

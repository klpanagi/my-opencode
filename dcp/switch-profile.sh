#!/bin/bash
# switch-profile.sh — switch DCP profile
# Usage: ./switch-profile.sh <profile>
# Profiles: economy, balanced, performance, ultimate

set -euo pipefail

DCP_DIR="$HOME/.myopencode/dcp"
PROFILE="${1:-}"

if [ -z "$PROFILE" ]; then
  echo "Usage: $0 <profile>"
  echo "Profiles: economy balanced performance ultimate"
  exit 1
fi

VALID_PROFILES="economy balanced performance ultimate"
case " $VALID_PROFILES " in
  *" $PROFILE "*) ;;
  *) echo "Invalid profile: $PROFILE. Valid: $VALID_PROFILES"; exit 1 ;;
esac

# Generate the merged config
node "$DCP_DIR/generate-dcp-config.mjs" "$PROFILE"

# Update symlink
ln -sf "dcp/dcp-generated-$PROFILE.jsonc" "$HOME/.myopencode/dcp.jsonc"

echo "✓ Switched to DCP profile: $PROFILE"
echo "✓ Symlink: ~/.myopencode/dcp.jsonc → dcp/dcp-generated-$PROFILE.jsonc"
echo ""
echo "Restart OpenCode session for changes to take effect."

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${HOME}/.config/opencode"

# Files and directories to symlink from this repo into ~/.config/opencode/
SYMLINK_ITEMS=(
	opencode.jsonc
	matrixx.jsonc
	dcp.jsonc
	tui.json
	agents
	skills
	tools
	plugins
)

info() { printf "  %-6s %s\n" "$1" "$2"; }

install_opencode() {
	if command -v opencode &>/dev/null; then
		info "OK" "opencode ($(opencode --version 2>/dev/null || echo 'installed'))"
		return
	fi

	echo "Installing opencode..."
	curl -fsSL https://opencode.ai/install | bash
	echo ""
}

create_symlinks() {
	echo "Symlinks:"
	for item in "${SYMLINK_ITEMS[@]}"; do
		local src="${SCRIPT_DIR}/${item}"
		local dst="${CONFIG_DIR}/${item}"

		if [[ ! -e "${src}" ]]; then
			info "SKIP" "${item} (not in repo)"
			continue
		fi

		if [[ -L "${dst}" ]]; then
			if [[ "$(readlink -f "${dst}")" == "$(readlink -f "${src}")" ]]; then
				info "OK" "${item}"
				continue
			fi
			rm -f "${dst}"
		elif [[ -e "${dst}" ]]; then
			info "BACKUP" "${item} -> ${dst}.bak"
			mv "${dst}" "${dst}.bak"
		fi

		ln -s "${src}" "${dst}"
		info "LINK" "${item} -> ${src}"
	done
}

main() {
	echo "opencode config installer"
	echo "  repo:   ${SCRIPT_DIR}"
	echo "  target: ${CONFIG_DIR}"
	echo ""

	install_opencode

	mkdir -p "${CONFIG_DIR}"
	create_symlinks

	echo ""
	echo "Done."
}

cd "${CONFIG_DIR}"
main

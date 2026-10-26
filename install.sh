#!/usr/bin/env bash
# install.sh — version-aware dispatcher for the versioned opencode setup.
#
#   ./install.sh [--v1 | --v2]
#
# Selects the config tree matching the installed opencode binary and symlinks
# it into ~/.config/opencode/:
#   v1/  → opencode 1.x  (opencode.jsonc + tui.json)
#   v2/  → opencode 2.x  (opencode.jsonc + cli.json)
#
# Without a flag, the major version of `opencode --version` decides. When no
# binary is present, ask interactively (default: v2).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${HOME}/.config/opencode"

V1_URL="https://opencode.ai/install"
V2_URL="https://opencode.ai/v2/install"

VERSION="" # resolved to "v1" or "v2" below

info() { printf "  %-6s %s\n" "$1" "$2"; }

usage() {
	echo "Usage: $0 [--v1 | --v2]"
	echo "  --v1   install the opencode 1.x tree (v1/)"
	echo "  --v2   install the opencode 2.x tree (v2/)"
	echo "  (no flag: auto-detect from 'opencode --version')"
}

detect_version() {
	if ! command -v opencode &>/dev/null; then
		return 1
	fi
	local ver
	ver="$(opencode --version 2>/dev/null || true)"
	# Match first run of digits: "1.19.3" -> 1, "2.0.0" -> 2, "v2.1.0" -> 2
	if [[ "${ver}" =~ ([0-9]+) ]]; then
		if [[ "${BASH_REMATCH[1]}" == "1" ]]; then
			VERSION="v1"
		else
			VERSION="v2"
		fi
		return 0
	fi
	return 1
}

ask_version() {
	# Interactive prompt; non-interactive shells fall through to the v2 default.
	if [[ -t 0 ]] && [[ -r /dev/tty ]]; then
		local answer
		read -r -p "No opencode binary found. Install [v1]/v2/none? (default: v2) " answer </dev/tty || answer=""
		case "${answer}" in
			1|v1|V1) VERSION="v1" ;;
			none|n|N|no) echo "Aborted."; exit 0 ;;
			*) VERSION="v2" ;;
		esac
	else
		info "INFO" "no opencode binary and no tty — defaulting to v2"
		VERSION="v2"
	fi
}

install_opencode() {
	local url
	if [[ "${VERSION}" == "v1" ]]; then
		url="${V1_URL}"
	else
		url="${V2_URL}"
	fi

	if command -v opencode &>/dev/null; then
		info "OK" "opencode ($(opencode --version 2>/dev/null || echo 'installed'))"
		return
	fi

	echo "Installing opencode (${VERSION})..."
	curl -fsSL "${url}" | bash
	echo ""
}

create_symlinks() {
	local src_dir="${SCRIPT_DIR}/${VERSION}"
	local -a items
	if [[ "${VERSION}" == "v1" ]]; then
		items=(
			opencode.jsonc
			matrixx.jsonc
			opencode-mem.jsonc
			scholia.jsonc
			tui.json
			AGENTS.md
			agents
			skills
			tools
			plugins
			dcp
		)
	else
		items=(
			opencode.jsonc
			matrixx.jsonc
			opencode-mem.jsonc
			scholia.jsonc
			cli.json
			AGENTS.md
			agents
			skills
			tools
			plugins
			dcp
		)
	fi

	echo "Symlinks (${VERSION}):"
	for item in "${items[@]}"; do
		local src="${src_dir}/${item}"
		local dst="${CONFIG_DIR}/${item}"

		if [[ ! -e "${src}" ]]; then
			info "SKIP" "${item} (not in ${VERSION}/)"
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

install_plugin_deps() {
	local src_dir="${SCRIPT_DIR}/${VERSION}"
	echo "Plugin dependencies:"
	local found=0
	for pkg in "${src_dir}"/plugins/*/package.json; do
		[[ -e "${pkg}" ]] || continue
		found=1
		local dir
		dir="$(dirname "${pkg}")"
		info "NPM" "${dir#${SCRIPT_DIR}/}"
		(cd "${dir}" && npm install)
	done
	if [[ "${found}" -eq 0 ]]; then
		info "SKIP" "no plugin package.json found"
	fi
}

main() {
	while [[ $# -gt 0 ]]; do
		case "$1" in
			--v1) VERSION="v1"; shift ;;
			--v2) VERSION="v2"; shift ;;
			-h|--help) usage; exit 0 ;;
			*) echo "Unknown argument: $1"; usage; exit 1 ;;
		esac
	done

	if [[ -z "${VERSION}" ]]; then
		if ! detect_version; then
			ask_version
		fi
	fi

	echo "opencode config installer"
	echo "  repo:    ${SCRIPT_DIR}"
	echo "  target:  ${CONFIG_DIR}"
	echo "  version: ${VERSION}"
	echo ""

	install_opencode

	mkdir -p "${CONFIG_DIR}"
	create_symlinks
	install_plugin_deps

	echo ""
	echo "Done."
}

main "$@"

#!/bin/sh
set -e

# BujiCoderPlus (BCP) — Install Script
# Usage: curl -fsSL https://ent.bujicoder.com/download/install-bcp.sh | sh
#   With server URL:
#     curl -fsSL https://ent.bujicoder.com/download/install-bcp.sh | sh -s -- --server https://ent.bujicoder.com

BINARY_NAME="bcp"
INSTALL_DIR="/usr/local/bin"
SERVER_URL="https://ent.bujicoder.com"

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --server|-s)
            SERVER_URL="$2"
            shift 2
            ;;
        --server=*)
            SERVER_URL="${1#--server=}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

main() {
    need_cmd uname

    os=$(detect_os)
    arch=$(detect_arch)

    if [ "$os" = "windows" ]; then
        err "Windows is not supported by this script. Use the PowerShell installer:"
        err "  irm https://ent.bujicoder.com/download/install-bcp.ps1 | iex"
        err "Or download bcp_windows_amd64.exe from:"
        err "  https://ent.bujicoder.com/download/"
        exit 1
    fi

    binary="${BINARY_NAME}_${os}_${arch}"
    url="https://ent.bujicoder.com/download/${binary}"
    checksums_url="https://ent.bujicoder.com/download/bcp_checksums.txt"

    printf '\n  \033[1m%s\033[0m\n\n' "BujiCoderPlus (BCP) — Installer"
    info "Detected" "${os}/${arch}"
    info "Downloading" "${url}"

    tmpdir=$(mktemp -d)
    trap "rm -rf \"$tmpdir\"" EXIT

    download "$url" "${tmpdir}/${BINARY_NAME}"

    # Verify SHA256 checksum
    info "Verifying" "SHA256 checksum"
    download "$checksums_url" "${tmpdir}/checksums.txt"
    verify_checksum "${tmpdir}/${BINARY_NAME}" "${tmpdir}/checksums.txt" "$binary"

    chmod +x "${tmpdir}/${BINARY_NAME}"

    # Try /usr/local/bin first, fall back to ~/.local/bin
    if [ -w "$INSTALL_DIR" ]; then
        mv "${tmpdir}/${BINARY_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
        info "Installed" "${INSTALL_DIR}/${BINARY_NAME}"
    elif command -v sudo >/dev/null 2>&1; then
        info "Permissions" "Using sudo to install to ${INSTALL_DIR}"
        sudo mv "${tmpdir}/${BINARY_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
        info "Installed" "${INSTALL_DIR}/${BINARY_NAME}"
    else
        INSTALL_DIR="${HOME}/.local/bin"
        mkdir -p "$INSTALL_DIR"
        mv "${tmpdir}/${BINARY_NAME}" "${INSTALL_DIR}/${BINARY_NAME}"
        info "Installed" "${INSTALL_DIR}/${BINARY_NAME}"
        warn_path "$INSTALL_DIR"
    fi

    # Remove stale copies from other locations to avoid PATH shadowing
    for other_dir in /usr/local/bin "${HOME}/.local/bin"; do
        if [ "$other_dir" != "$INSTALL_DIR" ] && [ -f "${other_dir}/${BINARY_NAME}" ]; then
            if [ -w "$other_dir" ]; then
                rm -f "${other_dir}/${BINARY_NAME}"
            elif command -v sudo >/dev/null 2>&1; then
                sudo rm -f "${other_dir}/${BINARY_NAME}"
            fi
            info "Cleaned up" "removed old copy from ${other_dir}"
        fi
    done

    # Configure server URL if provided
    if [ -n "$SERVER_URL" ]; then
        config_dir="${HOME}/.bcp"
        mkdir -p "$config_dir"
        config_file="${config_dir}/config.json"
        printf '{\n  "api_url": "%s"\n}\n' "$SERVER_URL" > "$config_file"
        chmod 600 "$config_file"
        info "Configured" "server → ${SERVER_URL}"
    fi

    # Download tree-sitter WASM files (required for code parsing)
    download_wasm_files "$INSTALL_DIR"

    # Verify
    if command -v "$BINARY_NAME" >/dev/null 2>&1; then
        installed_version=$($BINARY_NAME --version 2>/dev/null || echo "unknown")
        info "Version" "$installed_version"
    fi

    printf '\n  \033[1;32m%s\033[0m %s\n\n' "✓" "BujiCoderPlus installed successfully. Run 'bcp' to get started."
    printf '  \033[2m%s\033[0m\n\n' "Tip: Run 'bcp update' in the future to get the latest version."
}

download_wasm_files() {
    install_dir="$1"
    wasm_dir="${install_dir}/wasm"
    wasm_base_url="https://ent.bujicoder.com/download/wasm"

    if [ -w "$install_dir" ]; then
        mkdir -p "$wasm_dir"
    elif command -v sudo >/dev/null 2>&1; then
        sudo mkdir -p "$wasm_dir"
    else
        wasm_dir="${HOME}/.local/bin/wasm"
        mkdir -p "$wasm_dir"
    fi

    info "WASM files" "downloading tree-sitter parsers..."
    downloaded=0
    for file in \
        tree-sitter.wasm \
        tree-sitter-c-sharp.wasm \
        tree-sitter-cpp.wasm \
        tree-sitter-go.wasm \
        tree-sitter-java.wasm \
        tree-sitter-javascript.wasm \
        tree-sitter-python.wasm \
        tree-sitter-ruby.wasm \
        tree-sitter-rust.wasm \
        tree-sitter-tsx.wasm \
        tree-sitter-typescript.wasm
    do
        dest="${wasm_dir}/${file}"
        if [ -w "$wasm_dir" ]; then
            download "${wasm_base_url}/${file}" "$dest" 2>/dev/null && downloaded=$((downloaded + 1)) || true
        elif command -v sudo >/dev/null 2>&1; then
            tmpwasm=$(mktemp)
            download "${wasm_base_url}/${file}" "$tmpwasm" 2>/dev/null && \
                sudo mv "$tmpwasm" "$dest" && downloaded=$((downloaded + 1)) || rm -f "$tmpwasm"
        fi
    done
    info "WASM files" "${downloaded}/11 downloaded to ${wasm_dir}"
}

detect_os() {
    case $(uname -s) in
        Linux*)  echo "linux" ;;
        Darwin*) echo "darwin" ;;
        MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
        *) err "Unsupported operating system: $(uname -s)"; exit 1 ;;
    esac
}

detect_arch() {
    case $(uname -m) in
        x86_64|amd64)  echo "amd64" ;;
        aarch64|arm64) echo "arm64" ;;
        *) err "Unsupported architecture: $(uname -m)"; exit 1 ;;
    esac
}

download() {
    url="$1"
    output="$2"
    if command -v curl >/dev/null 2>&1; then
        curl -fSL --progress-bar -o "$output" "$url"
    elif command -v wget >/dev/null 2>&1; then
        wget -qO "$output" "$url"
    else
        err "Neither curl nor wget found. Please install one and try again."
        exit 1
    fi
}

verify_checksum() {
    file="$1"
    checksums_file="$2"
    expected_name="$3"

    # Extract expected hash from checksums.txt
    expected_hash=$(grep "  ${expected_name}$" "$checksums_file" | awk '{print $1}')
    if [ -z "$expected_hash" ]; then
        err "Could not find checksum for ${expected_name} in checksums.txt"
        exit 1
    fi

    # Compute actual hash
    if command -v sha256sum >/dev/null 2>&1; then
        actual_hash=$(sha256sum "$file" | awk '{print $1}')
    elif command -v shasum >/dev/null 2>&1; then
        actual_hash=$(shasum -a 256 "$file" | awk '{print $1}')
    else
        err "Neither sha256sum nor shasum found. Cannot verify checksum."
        exit 1
    fi

    if [ "$actual_hash" != "$expected_hash" ]; then
        err "Checksum verification failed!"
        err "  Expected: ${expected_hash}"
        err "  Got:      ${actual_hash}"
        exit 1
    fi

    info "Verified" "checksum OK"
}

need_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        err "Required command '$1' not found."
        exit 1
    fi
}

info() {
    printf '  \033[1;34m%12s\033[0m %s\n' "$1" "$2"
}

err() {
    printf '  \033[1;31merror\033[0m: %s\n' "$1" >&2
}

warn_path() {
    case ":$PATH:" in
        *":$1:"*) ;;
        *)
            printf '\n  \033[1;33m%s\033[0m\n' "Warning: ${1} is not in your PATH."
            printf '  Add it by running:\n\n'
            printf '    export PATH="%s:$PATH"\n\n' "$1"
            ;;
    esac
}

main

.PHONY: install dev build build-cli build-sdk test typecheck format clean \
       dist-cli install-cli help

# ─── Variables ───────────────────────────────────────────────────────────────

VERSION     ?= 0.5.6
BIN_DIR     := cli/bin
INSTALL_DIR := $(HOME)/.local/bin

# ─── Development ─────────────────────────────────────────────────────────────

## Install all dependencies
install:
	pnpm install

## Start CLI in development mode
dev: install
	pnpm run dev

## Build SDK (ESM + CJS + types)
build-sdk:
	pnpm --dir sdk run build

## Build CLI binary for current platform
build-cli:
	cd cli && BCP_CLI_VERSION=$(VERSION) pnpm run build:binary -- bcp $(VERSION)

## Build everything (SDK + CLI)
build: build-sdk build-cli

# ─── Cross-Platform Distribution ────────────────────────────────────────────

## Build CLI binaries for all platforms
dist-cli: build-sdk
	@echo "Building BCP CLI v$(VERSION) for all platforms..."
	@mkdir -p $(BIN_DIR)/dist
	@cd cli && OVERRIDE_PLATFORM=linux  OVERRIDE_ARCH=x64   BCP_CLI_VERSION=$(VERSION) pnpm run build:binary -- bcp $(VERSION) && mv bin/bcp    bin/dist/bcp_linux_amd64
	@cd cli && OVERRIDE_PLATFORM=linux  OVERRIDE_ARCH=arm64 BCP_CLI_VERSION=$(VERSION) pnpm run build:binary -- bcp $(VERSION) && mv bin/bcp    bin/dist/bcp_linux_arm64
	@cd cli && OVERRIDE_PLATFORM=darwin OVERRIDE_ARCH=x64   BCP_CLI_VERSION=$(VERSION) pnpm run build:binary -- bcp $(VERSION) && mv bin/bcp    bin/dist/bcp_darwin_amd64
	@cd cli && OVERRIDE_PLATFORM=darwin OVERRIDE_ARCH=arm64 BCP_CLI_VERSION=$(VERSION) pnpm run build:binary -- bcp $(VERSION) && mv bin/bcp    bin/dist/bcp_darwin_arm64
	@cd cli && OVERRIDE_PLATFORM=win32  OVERRIDE_ARCH=x64   BCP_CLI_VERSION=$(VERSION) pnpm run build:binary -- bcp $(VERSION) && mv bin/bcp.exe bin/dist/bcp_windows_amd64.exe
	@echo "Generating checksums..."
	@cd $(BIN_DIR)/dist && shasum -a 256 bcp_* > checksums.txt
	@echo "Binaries + checksums written to $(BIN_DIR)/dist/"
	@ls -lh $(BIN_DIR)/dist/

## Install CLI binary to ~/.local/bin/bcp (wrapper using bun for ESM compat)
install-cli: build-cli
	@mkdir -p $(INSTALL_DIR)
	@rm -f $(INSTALL_DIR)/bcp $(INSTALL_DIR)/bcp-bin
	@printf '#!/bin/sh\nexec bun "$(CURDIR)/$(BIN_DIR)/bcp" "$$@"\n' > $(INSTALL_DIR)/bcp
	@chmod +x $(INSTALL_DIR)/bcp
	@echo "Installed bcp to $(INSTALL_DIR)/bcp (bun wrapper)"

# ─── Quality ─────────────────────────────────────────────────────────────────

## Run all tests
test:
	pnpm test

## Type-check all packages
typecheck:
	pnpm run typecheck

## Format code with Prettier
format:
	pnpm run format

# ─── Cleanup ─────────────────────────────────────────────────────────────────

## Remove build artifacts
clean:
	rm -rf $(BIN_DIR) sdk/dist
	pnpm run clean-ts

# ─── Help ────────────────────────────────────────────────────────────────────

## Show available commands
help:
	@echo "BujiCoderPlus (BCP) — Build Commands"
	@echo ""
	@echo "  make install       Install dependencies (pnpm install)"
	@echo "  make dev           Start CLI in development mode"
	@echo "  make build         Build SDK + CLI binary"
	@echo "  make build-sdk     Build SDK only (ESM + CJS)"
	@echo "  make build-cli     Build CLI for current platform"
	@echo "  make dist-cli      Cross-compile CLI for all platforms"
	@echo "  make install-cli   Install CLI to ~/.local/bin/bcp"
	@echo "  make test          Run all tests"
	@echo "  make typecheck     Type-check all packages"
	@echo "  make format        Format code with Prettier"
	@echo "  make clean         Remove build artifacts"
	@echo ""
	@echo "Variables:"
	@echo "  VERSION=x.y.z     Set version (default: 0.1.0)"
	@echo ""
	@echo "Examples:"
	@echo "  make dist-cli VERSION=1.0.1"
	@echo "  make install-cli VERSION=1.0.1"

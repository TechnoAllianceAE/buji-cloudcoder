# BujiCoderPlus (BCP) — Windows PowerShell Installer
# Usage: irm https://ent.bujicoder.com/download/install-bcp.ps1 | iex
#   With server URL:
#     $env:BCP_SERVER="https://ent.bujicoder.com"; irm https://ent.bujicoder.com/download/install-bcp.ps1 | iex

$ErrorActionPreference = "Stop"

$BinaryName = "bcp"
$InstallDir = "$env:LOCALAPPDATA\BujiCoderPlus"
$ServerURL = if ($env:BCP_SERVER) { $env:BCP_SERVER } else { "https://ent.bujicoder.com" }

function Main {
    Write-Host ""
    Write-Host "  BujiCoderPlus (BCP) - Installer" -ForegroundColor White
    Write-Host ""

    $arch = Detect-Arch
    $asset = "${BinaryName}_windows_${arch}.exe"
    $url = "https://ent.bujicoder.com/download/${asset}"
    $checksumsUrl = "https://ent.bujicoder.com/download/bcp_checksums.txt"

    Write-Host "  Detected:     windows/${arch}" -ForegroundColor Cyan
    Write-Host "  Downloading:  ${url}" -ForegroundColor Cyan

    # Create temp directory
    $tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) "bcp-install-$([System.Guid]::NewGuid().ToString('N').Substring(0,8))"
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

    try {
        $tmpBinary = Join-Path $tmpDir "${BinaryName}.exe"
        $tmpChecksums = Join-Path $tmpDir "checksums.txt"

        # Download binary
        Invoke-WebRequest -Uri $url -OutFile $tmpBinary -UseBasicParsing

        # Download and verify checksum
        Write-Host "  Verifying:    SHA256 checksum" -ForegroundColor Cyan
        Invoke-WebRequest -Uri $checksumsUrl -OutFile $tmpChecksums -UseBasicParsing
        Verify-Checksum -FilePath $tmpBinary -ChecksumsFile $tmpChecksums -AssetName $asset

        # Create install directory
        if (-not (Test-Path $InstallDir)) {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }

        # Copy binary
        $destPath = Join-Path $InstallDir "${BinaryName}.exe"
        Copy-Item -Path $tmpBinary -Destination $destPath -Force
        Write-Host "  Installed:    ${destPath}" -ForegroundColor Cyan

        # Download tree-sitter WASM files (required for code parsing)
        Download-WasmFiles

        # Add to user PATH if not already there
        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($userPath -notlike "*${InstallDir}*") {
            [Environment]::SetEnvironmentVariable("Path", "${userPath};${InstallDir}", "User")
            Write-Host "  PATH:         Added ${InstallDir} to user PATH" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  NOTE: Restart your terminal for PATH changes to take effect." -ForegroundColor Yellow
        }

        # Show version
        Write-Host ""
        try {
            $version = & $destPath --version 2>&1
            Write-Host "  Version:      ${version}" -ForegroundColor Cyan
        } catch {
            # Ignore version check errors
        }

        # Configure server URL if provided
        if ($ServerURL) {
            $configDir = Join-Path $env:USERPROFILE ".bcp"
            if (-not (Test-Path $configDir)) {
                New-Item -ItemType Directory -Path $configDir -Force | Out-Null
            }
            $configFile = Join-Path $configDir "config.json"
            $configJson = @{ api_url = $ServerURL } | ConvertTo-Json
            Set-Content -Path $configFile -Value $configJson -Encoding UTF8
            Write-Host "  Configured:   server -> ${ServerURL}" -ForegroundColor Cyan
        }

        Write-Host ""
        Write-Host "  BujiCoderPlus installed successfully. Run 'bcp' to get started." -ForegroundColor Green
        Write-Host "    Tip: Run 'bcp update' in the future to get the latest version." -ForegroundColor DarkGray
        Write-Host ""
    }
    finally {
        # Clean up temp directory
        Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Download-WasmFiles {
    $wasmDir = Join-Path $InstallDir "wasm"
    if (-not (Test-Path $wasmDir)) {
        New-Item -ItemType Directory -Path $wasmDir -Force | Out-Null
    }

    $wasmBaseUrl = "https://ent.bujicoder.com/download/wasm"
    $wasmFiles = @(
        "tree-sitter.wasm",
        "tree-sitter-c-sharp.wasm",
        "tree-sitter-cpp.wasm",
        "tree-sitter-go.wasm",
        "tree-sitter-java.wasm",
        "tree-sitter-javascript.wasm",
        "tree-sitter-python.wasm",
        "tree-sitter-ruby.wasm",
        "tree-sitter-rust.wasm",
        "tree-sitter-tsx.wasm",
        "tree-sitter-typescript.wasm"
    )

    Write-Host "  WASM files:   downloading tree-sitter parsers..." -ForegroundColor Cyan
    $downloaded = 0
    foreach ($file in $wasmFiles) {
        $dest = Join-Path $wasmDir $file
        try {
            Invoke-WebRequest -Uri "${wasmBaseUrl}/${file}" -OutFile $dest -UseBasicParsing
            $downloaded++
        } catch {
            Write-Host "    warning: could not download ${file}" -ForegroundColor Yellow
        }
    }
    Write-Host "  WASM files:   ${downloaded}/$($wasmFiles.Count) downloaded to ${wasmDir}" -ForegroundColor Cyan
}

function Detect-Arch {
    $arch = $env:PROCESSOR_ARCHITECTURE
    switch ($arch) {
        "AMD64"  { return "amd64" }
        "x86"    { return "amd64" }  # 32-bit OS on 64-bit hardware
        "ARM64"  { return "arm64" }
        default  {
            Write-Host "  error: Unsupported architecture: ${arch}" -ForegroundColor Red
            exit 1
        }
    }
}

function Verify-Checksum {
    param(
        [string]$FilePath,
        [string]$ChecksumsFile,
        [string]$AssetName
    )

    # Read checksums file and find the expected hash
    $checksumLines = Get-Content $ChecksumsFile
    $expectedLine = $checksumLines | Where-Object { $_ -match "\s+${AssetName}$" }

    if (-not $expectedLine) {
        Write-Host "  error: Could not find checksum for ${AssetName}" -ForegroundColor Red
        exit 1
    }

    $expectedHash = ($expectedLine -split '\s+')[0]

    # Compute actual hash
    $actualHash = (Get-FileHash -Path $FilePath -Algorithm SHA256).Hash.ToLower()

    if ($actualHash -ne $expectedHash) {
        Write-Host "  error: Checksum verification failed!" -ForegroundColor Red
        Write-Host "    Expected: ${expectedHash}" -ForegroundColor Red
        Write-Host "    Got:      ${actualHash}" -ForegroundColor Red
        exit 1
    }

    Write-Host "  Verified:     checksum OK" -ForegroundColor Cyan
}

Main

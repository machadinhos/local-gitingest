# local-gitingest

A simple CLI tool to turn a project into a text-based snapshot, ideal for feeding into LLMs for summaries, documentation, or code analysis while fully respecting your `.gitignore` rules.

This local variant improves upon [gitingest.com](https://gitingest.com/) by supporting your repositoryΓÇÖs `.gitignore`, making it perfect for local development.

## Features

- **Respects .gitignore**: automatically excludes files based on your project's `.gitignore` out of the box (no more noise from unwanted files).
- **Customizable output**: include hidden files, disable tree view, or add extra exclude patterns.

## Installation

### Prerequisites

- **bun** (recommended): [https://bun.sh/](https://bun.sh/)
- Alternatively, **Node.js** and **npm**: [https://nodejs.org/](https://nodejs.org/)
- **Git** (or just download the source code directly from the [GitHub repository](https://github.com/machadinhos/local-gitingest)): [https://git-scm.com/](https://git-scm.com/)

### Install via Bun

```bash
git clone https://github.com/machadinhos/local-gitingest.git
cd local-gitingest
bun install
```

### Install via npm

```bash
git clone https://github.com/yourusername/local-gitingest.git
cd local-gitingest
npm install
```

## Usage

Generate a text snapshot of your project directory (default: current folder) and copy it to the clipboard:

```bash
bun path/to/local-gitingest path/to/your/project
```

## Options

| Flag                        | Description                                                              | Default |
|-----------------------------|--------------------------------------------------------------------------|---------|
| `-i`, `--include-hidden`    | Include hidden files (those starting with `.`)                           | `false` |
| `-g`, `--ignore-gitignore`  | DonΓÇÖt respect `.gitignore`; list all files                             | `false` |
| `-t`, `--no-tree`           | Output file list without tree structure                                  | `false` |
| `-e`, `--exclude <pattern>` | Additional glob or path pattern to ignore (can be passed multiple times) | ΓÇö     |
| `-h`, `--help`              | Show help text                                                           | ΓÇö     |

## Shell Aliases & Shortcuts

### PowerShell

Add this snippet to your PowerShell profile (`$PROFILE`):

```powershell
function gitingest {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $firstArg = $args[0]

    if ($firstArg -eq '-h' -or $firstArg -eq '--help') {
        bun /path/to/local-gitingest $args
    } else {
        bun /path/to/local-gitingest $args | Set-Clipboard
    }
}
```

Replace `/path/to/local-gitingest` with the path to your local-gitingest installation.

### Bash / Zsh

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
gitingest() {
  local out
  out=$(bun /path/to/local-gitingest "$@")
  printf '%s' "$out" | xclip -selection clipboard
}
```

Ensure `xclip` (or `xsel`) is installed on Linux:

```bash
sudo apt install xclip
```

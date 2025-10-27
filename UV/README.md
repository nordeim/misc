# A Comprehensive Guide to Using the `uv` Command

`uv` is a modern, fast, and reliable Python package manager and virtual environment creator. This guide covers the essential commands for setting up and managing your Python environments with `uv`.

## 1. Create a virtual environment

Use `uv venv` to create a virtual environment for your project. By default, this will create a folder named `.venv` in your current directory.

```sh
# Create a virtual environment with the default name `.venv`
uv venv

# Create a virtual environment with a custom name
uv venv my_env

# Specify a custom Python version.
# `uv` will download it if it's not already installed.
uv venv --python 3.13
```

## 2. Activate the virtual environment

To use your virtual environment, you must activate it. The command depends on your operating system and shell.

**On macOS and Linux**
```sh
source .venv/bin/activate
```

**On Windows (PowerShell)**
```sh
. .venv\Scripts\activate.ps1
```

**On Windows (Git Bash)**
```sh
source .venv/Scripts/activate
```

Once activated, your terminal prompt will change to include the environment's name (e.g., `(my_env)`).

## 3. Install packages

With your virtual environment active, you can use `uv pip install` to install packages.

**Install a single package**
```sh
uv pip install flask
```

**Install multiple packages at once**
```sh
uv pip install requests pandas
```

**Install from a requirements.txt file**
```sh
uv pip install -r requirements.txt
```

**Install pip itself**  
By default, `uv` environments don't include pip. If you need it for compatibility with other tools (like Jupyter), you can install it.
```sh
uv pip install pip
```

## 4. Work with an environment without activating it

`uv` can automatically detect and use the `.venv` in your project directory without manual activation.

**Install packages without activation**  
`uv` will automatically use the `.venv` in your current project when installing packages.
```sh
# Run this from your project's root directory
uv pip install new-package
```

**Run a script within an environment**  
Use `uv run` to execute a script inside the virtual environment without explicitly activating it.
```sh
uv run python my_script.py
```

## 5. Deactivate the virtual environment

When you are finished working, use the `deactivate` command to exit the virtual environment and return to your system's default shell.

```sh
deactivate
```

---

https://github.com/astral-sh/uv/releases/  
https://docs.astral.sh/uv/getting-started/installation/  
https://copilot.microsoft.com/shares/qr619zu9KP5H4AfLrbwiQ  

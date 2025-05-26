# 🚀 CodeNavigator: AI-Powered Code Understanding & Transformation

<div align="center">

![CodeNavigator Logo](https://i.imgur.com/5XeIY9H.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**Transform how you interact with complex codebases using the power of Claude AI**

[Key Features](#key-features) • [Installation](#installation) • [Quick Start](#quick-start) • [How It Works](#how-it-works) • [Workflows](#workflows) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

## 🌟 Overview

CodeNavigator is an intelligent CLI tool that revolutionizes how developers navigate, understand, and transform complex codebases. Powered by Claude AI, it serves as your expert pair programmer, enabling you to quickly understand unfamiliar code, diagnose bugs, implement features, and improve code quality with surgical precision.

**Frustrated with:**
- Spending hours trying to understand complex codebases?
- Getting lost in sprawling repositories with multiple interconnected components?
- Making changes that inadvertently break existing functionality?
- Tracking down elusive bugs across multiple files?

**CodeNavigator is your solution.**

<div align="center">
<img src="https://i.imgur.com/UEnwPte.gif" alt="CodeNavigator Demo" width="800"/>
</div>

## ✨ Key Features

### 🧠 Deep Code Understanding

- **Comprehensive Indexing**: Automatically scans and indexes your entire codebase, building a semantic understanding of your project structure
- **Dependency Analysis**: Visualizes how different files and components are interconnected
- **Architectural Insights**: Generates high-level architectural overviews to help you see the big picture
- **Natural Language Queries**: Ask questions about your code in plain English and get insightful answers

### 🔧 Intelligent Code Transformation

- **Surgical Bug Fixes**: Precisely diagnoses and fixes bugs with minimal code changes
- **Feature Implementation**: Plans and implements new features while respecting existing architecture
- **Code Refactoring**: Improves code quality without changing functionality
- **Change Impact Analysis**: Predicts how changes will affect other parts of your codebase

### 🛠️ Developer Workflow Integration

- **Git Integration**: Creates feature branches, commits changes, and helps manage your workflow
- **Interactive CLI**: User-friendly interface with rich formatting and visualizations
- **Task Management**: Tracks ongoing tasks and their progress
- **Continuous Learning**: Improves its understanding of your codebase over time

## 📦 Installation

### Prerequisites

- Python 3.10+
- Claude API key
- Git (optional, for version control integration)

### Install via pip

```bash
pip install code-navigator
```

### Install from source

```bash
git clone https://github.com/yourusername/code-navigator.git
cd code-navigator
poetry install  # or pip install -e .
```

### Set up your API key

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

Or add it to your configuration file:

```bash
codenav config set ai.api_key your_api_key_here
```

## 🚀 Quick Start

### Initialize your project

```bash
# Navigate to your project directory
cd /path/to/your/project

# Initialize CodeNavigator
codenav init
```

### Interactive Mode

The easiest way to get started is with interactive mode:

```bash
codenav interactive
```

This launches a user-friendly CLI interface where you can explore all of CodeNavigator's capabilities.

### Command-Line Workflows

For direct access to specific workflows:

```bash
# Analyze code to understand how it works
codenav analyze "How does the authentication system work?"

# Fix a bug
codenav fix "Users can't reset their password when using special characters"

# Add a new feature
codenav add "Implement dark mode toggle in the user settings page"

# Search the codebase
codenav search "authentication"

# Visualize dependencies
codenav visualize auth_controller.py
```

## 🔄 How It Works

CodeNavigator follows a systematic approach to understanding and transforming your code:

<div align="center">
<img src="https://i.imgur.com/ZuDCr4t.png" alt="CodeNavigator Workflow" width="800"/>
</div>

### 1. Project Onboarding & Indexing 📋

When first encountering your codebase, CodeNavigator:

- Parses your directory structure and understands file relationships
- Identifies key modules, classes, interfaces, and functions
- Maps imports, dependencies, and inheritance hierarchies
- Recognizes architectural patterns and design principles in use

### 2. Task Intake & Diagnostic Process 🔍

When you assign a task, CodeNavigator:

- Ensures complete understanding of the requirements
- Asks targeted questions about unclear aspects
- For bugs: traces execution paths to identify failure points
- For features: identifies affected components and integration points
- Generates specific hypotheses explaining issues or guiding implementation

### 3. Solution Architecture & Analysis 📐

Before making changes, CodeNavigator:

- Develops multiple implementation approaches
- Evaluates each approach against criteria like:
  - Alignment with existing architecture
  - Minimal surface area of changes
  - Performance characteristics
  - Backward compatibility
  - Long-term maintainability
- Presents the preferred approach with clear rationale

### 4. Implementation Planning & Execution 🛠️

When implementing changes, CodeNavigator:

- Breaks down the solution into sequential, atomic steps
- Creates a file-specific change plan with exact modifications
- Follows a comprehensive checklist to ensure quality
- Makes precise changes with minimal disruption to existing code

### 5. Testing & Validation 🧪

After implementation, CodeNavigator:

- Designs tests for all modified functionality
- Includes both positive and negative test cases
- Verifies that changes don't break existing functionality
- Provides specific validation steps for manual testing

## 🌊 Workflows

### Code Analysis

Get deep insights into how your code works:

```bash
codenav analyze "How does the payment processing pipeline work?"
```

CodeNavigator will:
1. Identify relevant files in your codebase
2. Analyze how they work together
3. Generate a comprehensive explanation with diagrams
4. Allow you to ask follow-up questions

### Bug Fixing

Fix bugs with surgical precision:

```bash
codenav fix "Payment processing fails for international transactions"
```

CodeNavigator will:
1. Diagnose the root cause of the bug
2. Generate multiple fix approaches
3. Implement the optimal solution
4. Verify the fix works correctly

### Feature Addition

Add new features that integrate seamlessly:

```bash
codenav add "Add support for cryptocurrency payments"
```

CodeNavigator will:
1. Plan the feature implementation
2. Identify all affected components
3. Make the necessary changes
4. Add tests to verify functionality

## 📚 Documentation

### Configuration

Configure CodeNavigator to match your workflow:

```bash
# View current configuration
codenav config show

# Set a configuration value
codenav config set project.max_files_per_request 10

# Reset to defaults
codenav config reset
```

Key configuration options:

| Category | Option | Description |
|----------|--------|-------------|
| AI | model | Claude model to use (default: claude-3-opus-20240229) |
| AI | temperature | Temperature for generation (0.0-1.0) |
| AI | max_tokens | Maximum tokens for responses |
| Project | ignore_patterns | Patterns to ignore when indexing |
| Project | max_files_per_request | Maximum files to include in AI requests |
| Git | auto_branch | Automatically create branches for tasks |
| Git | auto_commit | Automatically commit changes |

### Language Support

CodeNavigator supports a wide range of programming languages:

- Python
- JavaScript/TypeScript
- Java
- Go
- Ruby
- PHP
- C/C++
- And more!

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how you can help:

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/code-navigator.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run tests: `pytest`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Areas for Contribution

- **Language Support**: Add support for additional programming languages
- **IDE Integration**: Build integrations with popular IDEs
- **Workflows**: Create new specialized workflows
- **Documentation**: Improve docs and add examples
- **Testing**: Expand test coverage
- **UI/UX**: Enhance the CLI interface

## 🌐 Community

- **Discord**: Join our [Discord server](https://discord.gg/codenav) for discussions
- **Twitter**: Follow [@CodeNavigator](https://twitter.com/codenavigator) for updates
- **Blog**: Read our [development blog](https://codenav.dev/blog) for insights

## 📈 Roadmap

- **Q2 2025**: VSCode extension
- **Q3 2025**: Multi-repo support
- **Q4 2025**: Collaborative mode for team development
- **Q1 2026**: Enterprise features (access control, audit logs)

## 🙏 Acknowledgements

- [Anthropic](https://www.anthropic.com/) for the Claude AI API
- [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) for code parsing
- The [Aider](https://github.com/Aider-AI/aider) project for inspiration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
<p>Built with ❤️ by developers, for developers</p>
<p>⭐ Star us on GitHub to show your support! ⭐</p>
</div>
```

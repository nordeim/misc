# Comprehensive Guide to Building a CLI AI Coding Assistant

I'll create a detailed execution plan for building a CLI AI coding agent similar to Claude Code or Aider that effectively uses your system prompt. This tool will help developers navigate, debug, and improve complex codebases with AI assistance.

## Project Overview

We're creating **CodeNavigator**, a powerful CLI tool that:
- Scans and indexes codebases up to 30 files (~1000 LOC each)
- Provides deep understanding of code architecture and relationships
- Diagnoses bugs and suggests targeted fixes
- Recommends improvements with minimal impact
- Leverages AI to systematically approach code challenges

## Technical Architecture

![Architecture Diagram](https://via.placeholder.com/800x400?text=CodeNavigator+Architecture)

### Core Components:
1. **CLI Interface** - User interaction layer
2. **Codebase Scanner** - Analyzes and indexes code files
3. **AI Integration** - Communicates with AI models
4. **Change Manager** - Handles code modifications
5. **Project Context** - Maintains codebase understanding

## Implementation Plan

### Phase 1: Project Setup & Foundation (Days 1-5)

```python
# Create basic project structure
mkdir -p code_navigator/{cli,core,ai,utils,changes}
touch code_navigator/{__init__.py,cli/__init__.py,core/__init__.py,ai/__init__.py,utils/__init__.py,changes/__init__.py}
```

#### 1.1 Project Configuration
- Set up Python virtual environment
- Initialize git repository
- Create `pyproject.toml` for dependencies
- Implement configuration management

#### 1.2 Basic CLI Framework

```python
# cli/main.py
import typer
from pathlib import Path
from typing import Optional

app = typer.Typer(help="CodeNavigator: AI-powered code assistant")

@app.command()
def init(
    path: Path = typer.Argument(
        Path("."), help="Path to the codebase to analyze"
    ),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable verbose output")
):
    """Initialize and index a codebase."""
    typer.echo(f"Indexing codebase at: {path}")
    # Implementation will come later

@app.command()
def diagnose(
    issue: str = typer.Argument(..., help="Description of the issue to diagnose"),
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="Focus on a specific file")
):
    """Diagnose an issue in the codebase."""
    typer.echo(f"Analyzing issue: {issue}")
    # Implementation will come later

if __name__ == "__main__":
    app()
```

#### 1.3 AI Provider Integration

```python
# ai/provider.py
import os
from abc import ABC, abstractmethod
from typing import Dict, Any

class AIProvider(ABC):
    @abstractmethod
    def generate_response(self, prompt: str, system_message: str, options: Dict[str, Any] = None) -> str:
        """Generate a response from the AI model."""
        pass

class AnthropicProvider(AIProvider):
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key is required")
            
    def generate_response(self, prompt: str, system_message: str, options: Dict[str, Any] = None) -> str:
        """Generate a response using Anthropic's Claude."""
        # Implementation using Anthropic's API
        # Will be expanded in Phase 2
```

### Phase 2: Codebase Analysis & Indexing (Days 6-12)

#### 2.1 File System Scanner

```python
# core/scanner.py
import os
from pathlib import Path
from typing import List, Set

class CodebaseScanner:
    def __init__(self, root_path: Path):
        self.root_path = root_path
        self.ignored_patterns = ['.git', '__pycache__', 'node_modules']
        
    def scan(self) -> List[Path]:
        """Scan the codebase and return all relevant code files."""
        code_files = []
        
        for root, dirs, files in os.walk(self.root_path):
            # Skip ignored directories
            dirs[:] = [d for d in dirs if not any(pattern in d for pattern in self.ignored_patterns)]
            
            for file in files:
                if self._is_code_file(file):
                    file_path = Path(root) / file
                    code_files.append(file_path)
                    
        return code_files
    
    def _is_code_file(self, filename: str) -> bool:
        """Determine if a file is a code file based on extension."""
        code_extensions = ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.h', '.go', '.rb', '.php']
        return any(filename.endswith(ext) for ext in code_extensions)
```

#### 2.2 Code Structure Analyzer

```python
# core/analyzer.py
import ast
from pathlib import Path
from typing import Dict, List, Set, Optional
from dataclasses import dataclass

@dataclass
class CodeEntity:
    """Represents a code entity like a function, class, or module."""
    name: str
    type: str  # 'function', 'class', 'module', etc.
    start_line: int
    end_line: int
    parent: Optional[str] = None
    
@dataclass
class CodeFile:
    """Represents a single code file with its structure."""
    path: Path
    language: str
    content: str
    imports: List[str]
    entities: List[CodeEntity]
    dependencies: Set[str]

class PythonAnalyzer:
    """Analyzer for Python code files."""
    
    def analyze(self, file_path: Path, content: str) -> CodeFile:
        """Analyze a Python file and return its structure."""
        try:
            tree = ast.parse(content)
            
            # Extract imports
            imports = self._extract_imports(tree)
            
            # Extract entities (functions, classes)
            entities = self._extract_entities(tree)
            
            # Extract dependencies
            dependencies = self._extract_dependencies(imports)
            
            return CodeFile(
                path=file_path,
                language="python",
                content=content,
                imports=imports,
                entities=entities,
                dependencies=dependencies
            )
        except SyntaxError:
            # Handle syntax errors gracefully
            return CodeFile(
                path=file_path,
                language="python",
                content=content,
                imports=[],
                entities=[],
                dependencies=set()
            )
    
    def _extract_imports(self, tree) -> List[str]:
        """Extract import statements from the AST."""
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    imports.append(name.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    for name in node.names:
                        imports.append(f"{node.module}.{name.name}")
        return imports
    
    # Additional methods for entity and dependency extraction
```

#### 2.3 Codebase Indexer

```python
# core/indexer.py
from pathlib import Path
from typing import Dict, List, Optional, Set
import json
import os

from .scanner import CodebaseScanner
from .analyzer import CodeFile, PythonAnalyzer

class CodebaseIndex:
    """Maintains an index of the codebase structure."""
    
    def __init__(self, root_path: Path):
        self.root_path = root_path
        self.files: Dict[str, CodeFile] = {}
        self.dependencies: Dict[str, Set[str]] = {}
        self.reverse_dependencies: Dict[str, Set[str]] = {}
        self.analyzers = {
            ".py": PythonAnalyzer(),
            # Add more language analyzers
        }
        
    def build_index(self, verbose: bool = False) -> None:
        """Build the codebase index."""
        scanner = CodebaseScanner(self.root_path)
        files = scanner.scan()
        
        if verbose:
            print(f"Found {len(files)} code files to analyze")
            
        for file_path in files:
            self._index_file(file_path)
            
        self._build_dependency_graph()
        
    def _index_file(self, file_path: Path) -> None:
        """Analyze and index a single file."""
        extension = file_path.suffix
        relative_path = str(file_path.relative_to(self.root_path))
        
        if extension in self.analyzers:
            analyzer = self.analyzers[extension]
            
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            code_file = analyzer.analyze(file_path, content)
            self.files[relative_path] = code_file
            
    def _build_dependency_graph(self) -> None:
        """Build the dependency graph between files."""
        # Implementation details will vary by language
```

### Phase 3: AI Integration & Prompting (Days 13-18)

#### 3.1 System Prompt Management

```python
# ai/prompts.py
from pathlib import Path

class PromptManager:
    """Manages system and user prompts for AI interactions."""
    
    def __init__(self):
        # Load the system prompt
        with open(Path(__file__).parent / "system_prompt.md", "r") as f:
            self.system_prompt = f.read()
    
    def get_diagnosis_prompt(self, issue_description: str, code_context: str) -> str:
        """Generate a prompt for diagnosing an issue."""
        return f"""
I need help diagnosing and fixing an issue in my codebase.

Issue description:
{issue_description}

Relevant code:
{code_context}

Please analyze this issue following your diagnostic process. First understand the code structure, 
then identify potential causes, and finally suggest a solution with specific code changes.
"""
    
    # Add more specialized prompts for different tasks
```

#### 3.2 Context Builder

```python
# ai/context.py
from typing import List, Dict, Set
from pathlib import Path

from ..core.indexer import CodebaseIndex

class ContextBuilder:
    """Builds context for AI prompts based on the codebase and query."""
    
    def __init__(self, index: CodebaseIndex):
        self.index = index
        self.max_context_tokens = 50000  # Approximate token limit
        
    def build_context_for_issue(self, issue_description: str, focus_file: Path = None) -> str:
        """Build relevant context for an issue diagnosis."""
        relevant_files = self._find_relevant_files(issue_description, focus_file)
        
        context = []
        token_count = 0
        
        for file_path in relevant_files:
            if file_path in self.index.files:
                code_file = self.index.files[file_path]
                file_content = f"\n\n--- {file_path} ---\n\n{code_file.content}"
                estimated_tokens = len(file_content) // 4  # Rough approximation
                
                if token_count + estimated_tokens <= self.max_context_tokens:
                    context.append(file_content)
                    token_count += estimated_tokens
                else:
                    # Add a truncated version or summary if we're reaching token limits
                    break
        
        return "\n".join(context)
        
    def _find_relevant_files(self, issue_description: str, focus_file: Path = None) -> List[str]:
        """Find files relevant to the issue."""
        if focus_file:
            # Start with the focus file and its direct dependencies
            relative_path = str(focus_file.relative_to(self.index.root_path))
            if relative_path in self.index.files:
                # Get direct dependencies and reverse dependencies
                dependencies = self.index.dependencies.get(relative_path, set())
                reverse_deps = self.index.reverse_dependencies.get(relative_path, set())
                return [relative_path] + list(dependencies.union(reverse_deps))
        
        # For now, a simple heuristic approach
        # In a real implementation, this could use more sophisticated relevance scoring
        # or even AI assistance to select relevant files
        return list(self.index.files.keys())[:10]  # Limit to 10 files
```

#### 3.3 AI Manager

```python
# ai/manager.py
from typing import Dict, Any
from pathlib import Path

from .provider import AIProvider, AnthropicProvider
from .prompts import PromptManager
from .context import ContextBuilder
from ..core.indexer import CodebaseIndex

class AIManager:
    """Manages AI interactions for code tasks."""
    
    def __init__(self, index: CodebaseIndex, provider_type: str = "anthropic"):
        self.index = index
        
        # Initialize the AI provider
        if provider_type == "anthropic":
            self.provider = AnthropicProvider()
        else:
            raise ValueError(f"Unsupported AI provider: {provider_type}")
            
        self.prompt_manager = PromptManager()
        self.context_builder = ContextBuilder(index)
        
    def diagnose_issue(self, issue_description: str, focus_file: Path = None) -> str:
        """Use AI to diagnose an issue in the codebase."""
        # Build context for the AI
        code_context = self.context_builder.build_context_for_issue(issue_description, focus_file)
        
        # Create the prompt
        prompt = self.prompt_manager.get_diagnosis_prompt(issue_description, code_context)
        
        # Generate AI response
        response = self.provider.generate_response(
            prompt=prompt,
            system_message=self.prompt_manager.system_prompt,
            options={"temperature": 0.2, "max_tokens": 4000}
        )
        
        return response
        
    # Add more methods for different types of tasks
```

### Phase 4: Change Management & Application (Days 19-25)

#### 4.1 Diff Parser

```python
# changes/parser.py
import re
from typing import Dict, List, Tuple

class DiffParser:
    """Parses code changes from AI responses."""
    
    def extract_file_changes(self, ai_response: str) -> Dict[str, str]:
        """Extract file changes from an AI response."""
        changes = {}
        
        # Look for markdown code blocks with file paths
        file_blocks = re.finditer(r'```(?:diff)?\s*\n(?:.*?)\n(.*?)```', ai_response, re.DOTALL)
        
        for block in file_blocks:
            code_block = block.group(1)
            
            # Try to find file path
            file_path_match = re.search(r'--- ([\w\./\\-]+)', code_block)
            if file_path_match:
                file_path = file_path_match.group(1)
                # Extract the changes (this is simplified and would need refinement)
                changes[file_path] = self._extract_new_content(code_block)
        
        return changes
    
    def _extract_new_content(self, diff_block: str) -> str:
        """Extract new content from a diff block."""
        # This is a simplified implementation
        # A real implementation would need to properly parse the diff format
        # and apply it to the original file content
        
        # For now, just returning the diff block
        return diff_block
```

#### 4.2 Change Manager

```python
# changes/manager.py
import difflib
from pathlib import Path
from typing import Dict, List, Optional

from .parser import DiffParser

class ChangeManager:
    """Manages code changes suggested by the AI."""
    
    def __init__(self, codebase_root: Path):
        self.codebase_root = codebase_root
        self.diff_parser = DiffParser()
        self.pending_changes: Dict[str, str] = {}
        
    def extract_changes_from_response(self, ai_response: str) -> Dict[str, str]:
        """Extract code changes from an AI response."""
        return self.diff_parser.extract_file_changes(ai_response)
        
    def preview_changes(self, changes: Dict[str, str]) -> List[str]:
        """Generate a preview of the changes."""
        preview_lines = []
        
        for file_path, new_content in changes.items():
            full_path = self.codebase_root / file_path
            
            if not full_path.exists():
                preview_lines.append(f"New file: {file_path}")
                preview_lines.append("```")
                preview_lines.append(new_content[:200] + "..." if len(new_content) > 200 else new_content)
                preview_lines.append("```")
            else:
                with open(full_path, 'r', encoding='utf-8') as f:
                    original_content = f.read()
                
                diff = difflib.unified_diff(
                    original_content.splitlines(),
                    new_content.splitlines(),
                    fromfile=f"a/{file_path}",
                    tofile=f"b/{file_path}",
                    lineterm=""
                )
                
                preview_lines.append(f"Changes to: {file_path}")
                preview_lines.append("```diff")
                preview_lines.extend(diff)
                preview_lines.append("```")
        
        return preview_lines
        
    def apply_changes(self, changes: Dict[str, str]) -> List[str]:
        """Apply the changes to the codebase."""
        applied_files = []
        
        for file_path, new_content in changes.items():
            full_path = self.codebase_root / file_path
            
            # Create parent directories if needed
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            applied_files.append(file_path)
        
        return applied_files
```

### Phase 5: Core Navigator Implementation (Days 26-32)

#### 5.1 Main Navigator Class

```python
# core/navigator.py
from pathlib import Path
from typing import Dict, Optional, List
import json
import os
import typer

from .indexer import CodebaseIndex
from ..ai.manager import AIManager
from ..changes.manager import ChangeManager

class CodeNavigator:
    """Main class that orchestrates the code navigation and AI assistance."""
    
    def __init__(self, codebase_path: Path):
        self.codebase_path = codebase_path.absolute()
        self.index = CodebaseIndex(self.codebase_path)
        self.ai_manager = AIManager(self.index)
        self.change_manager = ChangeManager(self.codebase_path)
        
        # Check if index exists
        self.index_path = self.codebase_path / ".code_navigator" / "index.json"
        if self.index_path.exists():
            self._load_index()
        
    def initialize(self, verbose: bool = False) -> None:
        """Initialize and index the codebase."""
        typer.echo(f"Indexing codebase at: {self.codebase_path}")
        
        # Build the index
        self.index.build_index(verbose)
        
        # Save the index
        self._save_index()
        
        typer.echo(f"Indexed {len(self.index.files)} files")
        
    def diagnose_issue(self, issue_description: str, focus_file: Optional[Path] = None) -> str:
        """Diagnose an issue in the codebase."""
        if not hasattr(self.index, 'files') or not self.index.files:
            typer.echo("Codebase not indexed. Running initialization first...")
            self.initialize()
            
        typer.echo("Analyzing issue...")
        
        # Generate AI response
        response = self.ai_manager.diagnose_issue(issue_description, focus_file)
        
        # Extract changes if any
        changes = self.change_manager.extract_changes_from_response(response)
        
        if changes:
            typer.echo("\nProposed changes:")
            for line in self.change_manager.preview_changes(changes):
                typer.echo(line)
            
            if typer.confirm("Apply these changes?"):
                applied_files = self.change_manager.apply_changes(changes)
                typer.echo(f"Applied changes to {len(applied_files)} files")
        
        return response
        
    def _save_index(self) -> None:
        """Save the codebase index to disk."""
        # Create directory if it doesn't exist
        os.makedirs(self.index_path.parent, exist_ok=True)
        
        # For now, just save a placeholder
        # In a real implementation, we'd serialize the index
        with open(self.index_path, 'w') as f:
            json.dump({"files": list(self.index.files.keys())}, f)
            
    def _load_index(self) -> None:
        """Load the codebase index from disk."""
        # In a real implementation, we'd deserialize the index
        pass
```

#### 5.2 Enhanced CLI Interface

```python
# cli/main.py
import typer
from pathlib import Path
from typing import Optional
import rich
from rich.console import Console
from rich.markdown import Markdown

from ..core.navigator import CodeNavigator

app = typer.Typer(help="CodeNavigator: AI-powered code assistant")
console = Console()

# State to store the navigator instance
state = {"navigator": None}

def get_navigator(path: Path = Path(".")) -> CodeNavigator:
    """Get or create a CodeNavigator instance."""
    if state["navigator"] is None:
        state["navigator"] = CodeNavigator(path)
    return state["navigator"]

@app.command()
def init(
    path: Path = typer.Argument(
        Path("."), help="Path to the codebase to analyze"
    ),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable verbose output")
):
    """Initialize and index a codebase."""
    navigator = get_navigator(path)
    navigator.initialize(verbose)
    console.print("[bold green]Codebase successfully indexed![/bold green]")

@app.command()
def diagnose(
    issue: str = typer.Argument(..., help="Description of the issue to diagnose"),
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="Focus on a specific file"),
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    )
):
    """Diagnose an issue in the codebase."""
    navigator = get_navigator(path)
    
    with console.status("[bold blue]Analyzing issue...[/bold blue]"):
        response = navigator.diagnose_issue(issue, file)
    
    console.print("\n[bold]AI Analysis:[/bold]")
    console.print(Markdown(response))

@app.command()
def improve(
    description: str = typer.Argument(..., help="Description of the improvement to make"),
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="Focus on a specific file"),
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    )
):
    """Suggest improvements to the codebase."""
    # Similar to diagnose but with a different prompt
    console.print("[yellow]This feature is coming soon![/yellow]")

if __name__ == "__main__":
    app()
```

### Phase 6: Testing, Documentation & Polish (Days 33-40)

#### 6.1 Testing Framework

```python
# tests/test_indexer.py
import unittest
from pathlib import Path
import tempfile
import os

from code_navigator.core.indexer import CodebaseIndex

class TestCodebaseIndex(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory with some test files
        self.temp_dir = tempfile.TemporaryDirectory()
        self.codebase_path = Path(self.temp_dir.name)
        
        # Create a simple Python file
        with open(self.codebase_path / "main.py", "w") as f:
            f.write("""
import os
import sys

def main():
    print("Hello, world!")
    
if __name__ == "__main__":
    main()
""")
        
    def tearDown(self):
        self.temp_dir.cleanup()
        
    def test_index_build(self):
        # Test that the indexer properly builds an index
        index = CodebaseIndex(self.codebase_path)
        index.build_index()
        
        # Check that the file was indexed
        self.assertIn("main.py", index.files)
        
        # Check that imports were detected
        self.assertIn("os", index.files["main.py"].imports)
        self.assertIn("sys", index.files["main.py"].imports)
```

#### 6.2 Project Setup

```python
# pyproject.toml
[tool.poetry]
name = "code-navigator"
version = "0.1.0"
description = "AI-powered code assistant for navigating and improving codebases"
authors = ["Your Name <your.email@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.8"
typer = "^0.9.0"
rich = "^13.5.0"
anthropic = "^0.5.0"

[tool.poetry.dev-dependencies]
pytest = "^7.4.0"
black = "^23.7.0"
isort = "^5.12.0"

[tool.poetry.scripts]
code-navigator = "code_navigator.cli.main:app"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

#### 6.3 README & Documentation

```markdown
# CodeNavigator

An AI-powered CLI tool for navigating, debugging, and improving complex codebases.

## Features

- **Codebase Indexing**: Automatically analyze and understand your code
- **Issue Diagnosis**: Get AI help with debugging problems
- **Code Improvements**: Receive suggestions for code enhancements
- **Change Management**: Preview and apply code changes with confidence

## Installation

```bash
pip install code-navigator
```

## Usage

### Initialize a codebase

```bash
code-navigator init [PATH]
```

### Diagnose an issue

```bash
code-navigator diagnose "Description of the issue" --file path/to/relevant/file.py
```

### Suggest improvements

```bash
code-navigator improve "Area to improve" --file path/to/file.py
```

## Configuration

Create a `.code-navigator.json` file in your project root:

```json
{
  "ai_provider": "anthropic",
  "ignore_patterns": [".git", "node_modules", "__pycache__"],
  "max_context_files": 20
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
```

## Final Integration & Project Structure

The complete project structure will look like this:

```
code_navigator/
├── __init__.py
├── cli/
│   ├── __init__.py
│   └── main.py
├── core/
│   ├── __init__.py
│   ├── analyzer.py
│   ├── indexer.py
│   ├── navigator.py
│   └── scanner.py
├── ai/
│   ├── __init__.py
│   ├── context.py
│   ├── manager.py
│   ├── prompts.py
│   ├── provider.py
│   └── system_prompt.md
├── changes/
│   ├── __init__.py
│   ├── manager.py
│   └── parser.py
├── utils/
│   ├── __init__.py
│   └── config.py
└── tests/
    ├── __init__.py
    ├── test_analyzer.py
    ├── test_indexer.py
    └── test_navigator.py
```

## Additional Enhancement Suggestions

Once the basic implementation is complete, consider these enhancements:

1. **Git Integration**: Automatically create commits for changes
2. **Language Support Expansion**: Add parsers for more languages
3. **Visualization**: Add code relationship visualization
4. **Multi-turn Conversations**: Support ongoing dialogues about code issues
5. **Test Generation**: Automatically generate tests for changed code
6. **Cache Management**: Optimize token usage with smart caching
7. **Web UI**: Add an optional browser interface

## Conclusion

This implementation plan provides a comprehensive roadmap for a junior developer to build a powerful AI coding assistant. The modular design allows for gradual implementation and testing, while the final product will effectively leverage the provided system prompt to deliver intelligent code assistance.

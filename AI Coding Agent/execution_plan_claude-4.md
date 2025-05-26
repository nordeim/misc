<think>
This is a fascinating and complex request. The user wants me to help them build a CLI AI coding agent similar to Claude Code, Cursor, or Aider that can work with large codebases. They've provided a very detailed system prompt for "CodeNavigator" that outlines the capabilities they want.

Let me break down what they're asking for:

1. A CLI tool that can analyze codebases (up to 30 files, ~1000 LOC each)
2. The tool should understand code relationships, architecture, and dependencies
3. It should be able to diagnose bugs, identify improvements, and plan implementations
4. It should use the provided CodeNavigator system prompt
5. They want a detailed execution plan that a junior developer could follow

This is a substantial project that involves several key components:
- File system operations and code parsing
- AI integration (likely with an LLM API)
- Code analysis and indexing
- Interactive CLI interface
- Project management and state tracking

Let me think through the architecture and create a comprehensive plan:

Key Components Needed:
1. CLI Framework (argument parsing, commands)
2. File System Scanner & Parser
3. Code Analysis Engine (AST parsing, dependency mapping)
4. AI Integration Layer (API calls to LLM)
5. Project State Management
6. Interactive Session Management
7. Code Generation & Diff Management
8. Configuration Management

Technology Stack Considerations:
- Language: Python (good for CLI tools, rich ecosystem for code analysis)
- CLI Framework: Click or Typer
- Code Parsing: Tree-sitter or language-specific parsers
- AI Integration: OpenAI API, Anthropic API, or similar
- File Management: Standard library + gitignore parsing
- Configuration: YAML/JSON + environment variables

I should structure this as a comprehensive development plan with phases, detailed implementation steps, and code examples.
</think>

# CodeNavigator CLI Agent - Comprehensive Development Plan

## Project Overview

We'll build a sophisticated CLI AI coding assistant that can analyze, understand, and modify complex codebases using the CodeNavigator system prompt. This tool will combine static code analysis, AI-powered reasoning, and interactive development workflows.

## Architecture & Technology Stack

**Core Technologies:**
- **Language**: Python 3.9+ (rich ecosystem, excellent for CLI tools)
- **CLI Framework**: Typer (modern, type-safe CLI framework)
- **Code Analysis**: Tree-sitter (universal parsing) + language-specific analyzers
- **AI Integration**: Anthropic Claude API (primary) with OpenAI fallback
- **Database**: SQLite (for codebase indexing and session state)
- **Configuration**: Pydantic + YAML
- **Testing**: Pytest + coverage

## Phase 1: Foundation & Core Infrastructure

### 1.1 Project Structure Setup

```
codenavigator/
├── src/
│   └── codenavigator/
│       ├── __init__.py
│       ├── cli/
│       │   ├── __init__.py
│       │   ├── main.py
│       │   ├── commands/
│       │   │   ├── __init__.py
│       │   │   ├── init.py
│       │   │   ├── analyze.py
│       │   │   ├── chat.py
│       │   │   └── status.py
│       │   └── utils.py
│       ├── core/
│       │   ├── __init__.py
│       │   ├── config.py
│       │   ├── project.py
│       │   └── session.py
│       ├── analysis/
│       │   ├── __init__.py
│       │   ├── scanner.py
│       │   ├── parser.py
│       │   ├── indexer.py
│       │   └── dependency_mapper.py
│       ├── ai/
│       │   ├── __init__.py
│       │   ├── client.py
│       │   ├── prompts.py
│       │   └── response_parser.py
│       └── utils/
│           ├── __init__.py
│           ├── file_utils.py
│           ├── git_utils.py
│           └── logging.py
├── tests/
├── docs/
├── pyproject.toml
├── README.md
└── .env.example
```

### 1.2 Core Configuration System

**File: `src/codenavigator/core/config.py`**

```python
from pydantic import BaseSettings, Field
from typing import Optional, List, Dict
from pathlib import Path
import yaml

class AIConfig(BaseSettings):
    provider: str = "anthropic"
    api_key: Optional[str] = None
    model: str = "claude-sonnet-4-20250514"
    max_tokens: int = 4000
    temperature: float = 0.1
    
    class Config:
        env_prefix = "CODENAVIGATOR_AI_"

class AnalysisConfig(BaseSettings):
    max_files: int = 30
    max_file_size: int = 1000000  # 1MB
    supported_extensions: List[str] = [
        ".py", ".js", ".ts", ".java", ".cpp", ".c", ".h", 
        ".cs", ".go", ".rs", ".rb", ".php", ".swift", ".kt"
    ]
    ignore_patterns: List[str] = [
        "node_modules", ".git", "__pycache__", ".venv", 
        "venv", "dist", "build", ".next", "target"
    ]

class CodeNavigatorConfig(BaseSettings):
    project_root: Optional[Path] = None
    ai: AIConfig = Field(default_factory=AIConfig)
    analysis: AnalysisConfig = Field(default_factory=AnalysisConfig)
    debug: bool = False
    
    @classmethod
    def load_from_file(cls, config_path: Path) -> "CodeNavigatorConfig":
        if config_path.exists():
            with open(config_path) as f:
                data = yaml.safe_load(f)
            return cls(**data)
        return cls()
    
    def save_to_file(self, config_path: Path):
        with open(config_path, 'w') as f:
            yaml.dump(self.dict(), f, default_flow_style=False)
```

### 1.3 CLI Framework Setup

**File: `src/codenavigator/cli/main.py`**

```python
import typer
from pathlib import Path
from typing import Optional
from rich.console import Console
from rich.table import Table

from ..core.config import CodeNavigatorConfig
from ..core.project import Project
from .commands import init, analyze, chat, status

app = typer.Typer(
    name="codenavigator",
    help="AI-powered codebase analysis and modification assistant",
    rich_markup_mode="rich"
)

console = Console()

# Global state
_config: Optional[CodeNavigatorConfig] = None
_project: Optional[Project] = None

def get_config() -> CodeNavigatorConfig:
    global _config
    if _config is None:
        config_path = Path.cwd() / ".codenavigator" / "config.yaml"
        _config = CodeNavigatorConfig.load_from_file(config_path)
    return _config

def get_project() -> Project:
    global _project
    if _project is None:
        config = get_config()
        _project = Project(config)
    return _project

# Register commands
app.add_typer(init.app, name="init")
app.add_typer(analyze.app, name="analyze") 
app.add_typer(chat.app, name="chat")
app.add_typer(status.app, name="status")

@app.command()
def version():
    """Show version information"""
    console.print("CodeNavigator v0.1.0", style="bold green")

if __name__ == "__main__":
    app()
```

## Phase 2: Code Analysis Engine

### 2.1 File System Scanner

**File: `src/codenavigator/analysis/scanner.py`**

```python
from pathlib import Path
from typing import List, Set, Generator
import fnmatch
from dataclasses import dataclass
from ..core.config import AnalysisConfig

@dataclass
class FileInfo:
    path: Path
    relative_path: Path
    size: int
    language: str
    last_modified: float

class CodebaseScanner:
    def __init__(self, config: AnalysisConfig):
        self.config = config
        self.language_map = {
            '.py': 'python',
            '.js': 'javascript', 
            '.ts': 'typescript',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.h': 'c',
            '.cs': 'csharp',
            '.go': 'go',
            '.rs': 'rust',
            '.rb': 'ruby',
            '.php': 'php',
            '.swift': 'swift',
            '.kt': 'kotlin'
        }
    
    def scan_directory(self, root_path: Path) -> List[FileInfo]:
        """Scan directory and return list of relevant code files"""
        files = []
        
        for file_path in self._walk_directory(root_path):
            if self._should_include_file(file_path, root_path):
                relative_path = file_path.relative_to(root_path)
                size = file_path.stat().st_size
                language = self._detect_language(file_path)
                last_modified = file_path.stat().st_mtime
                
                files.append(FileInfo(
                    path=file_path,
                    relative_path=relative_path,
                    size=size,
                    language=language,
                    last_modified=last_modified
                ))
        
        return sorted(files, key=lambda f: f.relative_path)
    
    def _walk_directory(self, root_path: Path) -> Generator[Path, None, None]:
        """Walk directory tree, respecting ignore patterns"""
        for path in root_path.rglob("*"):
            if path.is_file() and not self._is_ignored(path, root_path):
                yield path
    
    def _should_include_file(self, file_path: Path, root_path: Path) -> bool:
        """Check if file should be included in analysis"""
        # Check file extension
        if file_path.suffix not in self.config.supported_extensions:
            return False
        
        # Check file size
        if file_path.stat().st_size > self.config.max_file_size:
            return False
        
        return True
    
    def _is_ignored(self, file_path: Path, root_path: Path) -> bool:
        """Check if file/directory should be ignored"""
        relative_path = file_path.relative_to(root_path)
        path_str = str(relative_path)
        
        for pattern in self.config.ignore_patterns:
            if fnmatch.fnmatch(path_str, pattern) or pattern in path_str:
                return True
        
        return False
    
    def _detect_language(self, file_path: Path) -> str:
        """Detect programming language from file extension"""
        return self.language_map.get(file_path.suffix, 'unknown')
```

### 2.2 Code Parser & AST Analysis

**File: `src/codenavigator/analysis/parser.py`**

```python
import ast
from pathlib import Path
from typing import Dict, List, Set, Optional, Any
from dataclasses import dataclass, field
import tree_sitter
from tree_sitter import Language, Parser

@dataclass
class CodeElement:
    name: str
    type: str  # function, class, variable, import, etc.
    line_start: int
    line_end: int
    file_path: Path
    parent: Optional[str] = None
    children: List[str] = field(default_factory=list)
    dependencies: Set[str] = field(default_factory=set)
    docstring: Optional[str] = None

@dataclass
class FileAnalysis:
    file_path: Path
    language: str
    elements: List[CodeElement]
    imports: List[str]
    exports: List[str]
    complexity_score: int
    lines_of_code: int

class CodeParser:
    def __init__(self):
        self.parsers = {}
        self._setup_parsers()
    
    def _setup_parsers(self):
        """Initialize tree-sitter parsers for supported languages"""
        try:
            # This would require tree-sitter language bindings
            # For now, we'll focus on Python with AST
            pass
        except ImportError:
            # Fallback to language-specific parsers
            pass
    
    def parse_file(self, file_path: Path, language: str) -> FileAnalysis:
        """Parse a single file and extract code elements"""
        if language == 'python':
            return self._parse_python_file(file_path)
        else:
            return self._parse_generic_file(file_path, language)
    
    def _parse_python_file(self, file_path: Path) -> FileAnalysis:
        """Parse Python file using AST"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        try:
            tree = ast.parse(content)
        except SyntaxError:
            # Return minimal analysis for files with syntax errors
            return FileAnalysis(
                file_path=file_path,
                language='python',
                elements=[],
                imports=[],
                exports=[],
                complexity_score=0,
                lines_of_code=len(content.splitlines())
            )
        
        visitor = PythonASTVisitor(file_path)
        visitor.visit(tree)
        
        return FileAnalysis(
            file_path=file_path,
            language='python',
            elements=visitor.elements,
            imports=visitor.imports,
            exports=visitor.exports,
            complexity_score=visitor.complexity_score,
            lines_of_code=len(content.splitlines())
        )
    
    def _parse_generic_file(self, file_path: Path, language: str) -> FileAnalysis:
        """Basic parsing for non-Python files"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Basic analysis - count lines, look for common patterns
        lines = content.splitlines()
        
        return FileAnalysis(
            file_path=file_path,
            language=language,
            elements=[],
            imports=[],
            exports=[],
            complexity_score=len(lines) // 10,  # Simple heuristic
            lines_of_code=len(lines)
        )

class PythonASTVisitor(ast.NodeVisitor):
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.elements: List[CodeElement] = []
        self.imports: List[str] = []
        self.exports: List[str] = []
        self.complexity_score = 0
        self.current_class = None
    
    def visit_ClassDef(self, node: ast.ClassDef):
        element = CodeElement(
            name=node.name,
            type='class',
            line_start=node.lineno,
            line_end=node.end_lineno or node.lineno,
            file_path=self.file_path,
            docstring=ast.get_docstring(node)
        )
        
        self.elements.append(element)
        self.exports.append(node.name)
        
        old_class = self.current_class
        self.current_class = node.name
        self.generic_visit(node)
        self.current_class = old_class
    
    def visit_FunctionDef(self, node: ast.FunctionDef):
        element = CodeElement(
            name=node.name,
            type='function',
            line_start=node.lineno,
            line_end=node.end_lineno or node.lineno,
            file_path=self.file_path,
            parent=self.current_class,
            docstring=ast.get_

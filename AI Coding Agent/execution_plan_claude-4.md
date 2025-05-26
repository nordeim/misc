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
            docstring=ast.get_docstring(node)
        )
        
        self.elements.append(element)
        if not self.current_class:  # Only export top-level functions
            self.exports.append(node.name)
        
        # Calculate complexity (simplified McCabe)
        self.complexity_score += self._calculate_complexity(node)
        self.generic_visit(node)
    
    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            self.imports.append(alias.name)
    
    def visit_ImportFrom(self, node: ast.ImportFrom):
        if node.module:
            for alias in node.names:
                import_name = f"{node.module}.{alias.name}"
                self.imports.append(import_name)
    
    def _calculate_complexity(self, node: ast.FunctionDef) -> int:
        """Calculate cyclomatic complexity"""
        complexity = 1  # Base complexity
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.Try, ast.With)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
        return complexity
```

### 2.3 Dependency Mapper

**File: `src/codenavigator/analysis/dependency_mapper.py`**

```python
from typing import Dict, List, Set, Tuple
from pathlib import Path
from dataclasses import dataclass
from .parser import FileAnalysis, CodeElement

@dataclass
class DependencyGraph:
    files: Dict[Path, FileAnalysis]
    internal_dependencies: Dict[Path, Set[Path]]
    external_dependencies: Dict[Path, Set[str]]
    circular_dependencies: List[Tuple[Path, Path]]

class DependencyMapper:
    def __init__(self, project_root: Path):
        self.project_root = project_root
    
    def build_dependency_graph(self, file_analyses: List[FileAnalysis]) -> DependencyGraph:
        """Build comprehensive dependency graph"""
        files = {analysis.file_path: analysis for analysis in file_analyses}
        internal_deps = {}
        external_deps = {}
        
        for analysis in file_analyses:
            internal, external = self._analyze_file_dependencies(analysis, files)
            internal_deps[analysis.file_path] = internal
            external_deps[analysis.file_path] = external
        
        circular_deps = self._detect_circular_dependencies(internal_deps)
        
        return DependencyGraph(
            files=files,
            internal_dependencies=internal_deps,
            external_dependencies=external_deps,
            circular_dependencies=circular_deps
        )
    
    def _analyze_file_dependencies(self, analysis: FileAnalysis, all_files: Dict[Path, FileAnalysis]) -> Tuple[Set[Path], Set[str]]:
        """Analyze dependencies for a single file"""
        internal_deps = set()
        external_deps = set()
        
        for import_name in analysis.imports:
            # Try to resolve to internal file
            resolved_path = self._resolve_import_to_file(import_name, analysis.file_path, all_files)
            if resolved_path:
                internal_deps.add(resolved_path)
            else:
                external_deps.add(import_name)
        
        return internal_deps, external_deps
    
    def _resolve_import_to_file(self, import_name: str, current_file: Path, all_files: Dict[Path, FileAnalysis]) -> Path:
        """Resolve import to actual file path"""
        # Simplified resolution logic - would need to be more sophisticated
        parts = import_name.split('.')
        
        # Try relative imports
        current_dir = current_file.parent
        for file_path in all_files.keys():
            if file_path.stem == parts[-1] and file_path.parent == current_dir:
                return file_path
        
        # Try absolute imports from project root
        potential_path = self.project_root
        for part in parts:
            potential_path = potential_path / part
        
        potential_file = potential_path.with_suffix('.py')
        if potential_file in all_files:
            return potential_file
        
        return None
    
    def _detect_circular_dependencies(self, dependencies: Dict[Path, Set[Path]]) -> List[Tuple[Path, Path]]:
        """Detect circular dependencies using DFS"""
        circular = []
        visited = set()
        rec_stack = set()
        
        def dfs(node: Path, path: List[Path]):
            if node in rec_stack:
                # Found cycle
                cycle_start = path.index(node)
                cycle = path[cycle_start:] + [node]
                for i in range(len(cycle) - 1):
                    circular.append((cycle[i], cycle[i + 1]))
                return
            
            if node in visited:
                return
            
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for dep in dependencies.get(node, set()):
                dfs(dep, path.copy())
            
            rec_stack.remove(node)
        
        for file_path in dependencies:
            if file_path not in visited:
                dfs(file_path, [])
        
        return circular
```

## Phase 3: AI Integration Layer

### 3.1 AI Client

**File: `src/codenavigator/ai/client.py`**

```python
import asyncio
from typing import Optional, Dict, Any, List
import anthropic
import openai
from ..core.config import AIConfig
from .prompts import CodeNavigatorPrompts
from .response_parser import ResponseParser

class AIClient:
    def __init__(self, config: AIConfig):
        self.config = config
        self.prompts = CodeNavigatorPrompts()
        self.parser = ResponseParser()
        
        if config.provider == "anthropic":
            self.client = anthropic.Anthropic(api_key=config.api_key)
        elif config.provider == "openai":
            self.client = openai.OpenAI(api_key=config.api_key)
        else:
            raise ValueError(f"Unsupported AI provider: {config.provider}")
    
    async def analyze_codebase(self, codebase_context: Dict[str, Any]) -> Dict[str, Any]:
        """Perform initial codebase analysis"""
        prompt = self.prompts.build_analysis_prompt(codebase_context)
        response = await self._make_request(prompt)
        return self.parser.parse_analysis_response(response)
    
    async def diagnose_issue(self, issue_description: str, relevant_code: Dict[str, str], context: Dict[str, Any]) -> Dict[str, Any]:
        """Diagnose a reported issue"""
        prompt = self.prompts.build_diagnosis_prompt(issue_description, relevant_code, context)
        response = await self._make_request(prompt)
        return self.parser.parse_diagnosis_response(response)
    
    async def generate_solution(self, diagnosis: Dict[str, Any], constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Generate solution based on diagnosis"""
        prompt = self.prompts.build_solution_prompt(diagnosis, constraints)
        response = await self._make_request(prompt)
        return self.parser.parse_solution_response(response)
    
    async def chat_interaction(self, message: str, conversation_history: List[Dict[str, str]], context: Dict[str, Any]) -> str:
        """Handle interactive chat"""
        prompt = self.prompts.build_chat_prompt(message, conversation_history, context)
        response = await self._make_request(prompt)
        return response
    
    async def _make_request(self, prompt: str) -> str:
        """Make API request to AI provider"""
        if self.config.provider == "anthropic":
            return await self._anthropic_request(prompt)
        elif self.config.provider == "openai":
            return await self._openai_request(prompt)
    
    async def _anthropic_request(self, prompt: str) -> str:
        """Make request to Anthropic Claude"""
        try:
            response = await asyncio.to_thread(
                self.client.messages.create,
                model=self.config.model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        except Exception as e:
            raise AIClientError(f"Anthropic API error: {e}")
    
    async def _openai_request(self, prompt: str) -> str:
        """Make request to OpenAI"""
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.config.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            raise AIClientError(f"OpenAI API error: {e}")

class AIClientError(Exception):
    pass
```

## Phase 4: Interactive CLI Commands

### 4.1 Chat Command

**File: `src/codenavigator/cli/commands/chat.py`**

```python
import typer
import asyncio
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from typing import List, Dict
from ...core.project import Project
from ...ai.client import AIClient

app = typer.Typer(help="Interactive chat with CodeNavigator")
console = Console()

@app.command()
def start(
    context: bool = typer.Option(True, "--context/--no-context", help="Include codebase context"),
    file: str = typer.Option(None, "--file", help="Focus on specific file")
):
    """Start interactive chat session"""
    asyncio.run(_chat_session(context, file))

async def _chat_session(include_context: bool, focus_file: str):
    """Main chat session loop"""
    project = Project.load_current()
    if not project:
        console.print("❌ No CodeNavigator project found. Run 'codenavigator init' first.", style="red")
        return
    
    ai_client = AIClient(project.config.ai)
    conversation_history: List[Dict[str, str]] = []
    
    # Build context
    context = {}
    if include_context:
        context = await _build_chat_context(project, focus_file)
    
    console.print(Panel.fit(
        "🤖 CodeNavigator Chat Session Started\n"
        "Type 'exit' to quit, 'help' for commands, 'context' to toggle context",
        title="Chat Session",
        style="blue"
    ))
    
    while True:
        try:
            user_input = console.input("\n[bold blue]You:[/bold blue] ")
            
            if user_input.lower() in ['exit', 'quit']:
                break
            elif user_input.lower() == 'help':
                _show_chat_help()
                continue
            elif user_input.lower() == 'context':
                include_context = not include_context
                if include_context:
                    context = await _build_chat_context(project, focus_file)
                else:
                    context = {}
                console.print(f"Context {'enabled' if include_context else 'disabled'}")
                continue
            
            # Add user message to history
            conversation_history.append({"role": "user", "content": user_input})
            
            # Get AI response
            with console.status("🤔 Thinking..."):
                response = await ai_client.chat_interaction(user_input, conversation_history, context)
            
            # Display response
            console.print("\n[bold green]CodeNavigator:[/bold green]")
            console.print(Markdown(response))
            
            # Add AI response to history
            conversation_history.append({"role": "assistant", "content": response})
            
            # Keep conversation history manageable
            if len(conversation_history) > 20:
                conversation_history = conversation_history[-20:]
                
        except KeyboardInterrupt:
            break
        except Exception as e:
            console.print(f"❌ Error: {e}", style="red")
    
    console.print("\n👋 Chat session ended.")

async def _build_chat_context(project: Project, focus_file: str) -> Dict:
    """Build context for chat session"""
    context = {
        "project_summary": project.get_summary(),
        "recent_changes": project.get_recent_changes(),
        "architecture_overview": project.get_architecture_overview()
    }
    
    if focus_file:
        file_analysis = project.get_file_analysis(focus_file)
        if file_analysis:
            context["focus_file"] = {
                "path": focus_file,
                "analysis": file_analysis,
                "content": project.get_file_content(focus_file)
            }
    
    return context

def _show_chat_help():
    """Show chat help"""
    help_text = """
**Available Commands:**
- `exit` or `quit` - End chat session
- `help` - Show this help
- `context` - Toggle codebase context inclusion
- `analyze <file>` - Analyze specific file
- `diff <file>` - Show recent changes to file
- `deps <file>` - Show file dependencies
    """
    console.print(Markdown(help_text))
```

---

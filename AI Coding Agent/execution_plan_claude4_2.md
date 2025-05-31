<think>
This is a fascinating request! The user wants to build a CLI AI coding agent similar to Claude Code, Cursor, or Aider that can handle large codebases. They've provided a comprehensive system prompt for the agent and want me to create a detailed implementation plan for a junior developer.

Let me think through this systematically:

1. **Core Requirements Analysis**:
   - CLI tool (command-line interface)
   - Can handle codebases with up to 30 files (~1000 LOC each)
   - Search and understand entire codebase
   - Understand file relationships and interactions
   - Identify bugs, issues, gaps, and improvements
   - Generate detailed step-by-step plans with checklists
   - Avoid regression errors

2. **Key Technical Components Needed**:
   - File system traversal and indexing
   - Code parsing and AST analysis
   - LLM integration (likely OpenAI, Anthropic, or local models)
   - Context management (fitting large codebases into LLM context)
   - Interactive CLI interface
   - State management for conversations
   - Diff generation and code modification
   - Version control integration

3. **Architecture Considerations**:
   - Modular design for extensibility
   - Efficient context management strategies
   - Caching mechanisms for parsed code
   - Plugin system for different languages
   - Configuration management
   - Error handling and recovery

4. **Implementation Approach**:
   - Start with MVP focusing on core functionality
   - Build incrementally with testable components
   - Use existing libraries where possible
   - Focus on developer experience

Let me create a comprehensive implementation plan that a junior developer can follow step by step.
</think>

# 🚀 Building CodeNavigator: A Comprehensive Implementation Plan

## Executive Overview

You're about to build an AI-powered CLI coding assistant that can understand, analyze, and modify large codebases intelligently. This tool will be your pair programmer, helping you debug issues, implement features, and maintain code quality across complex projects.

## 🎯 Project Goals & Success Criteria

### Primary Objectives
- Build a CLI tool that can analyze codebases up to 30 files (~30,000 LOC total)
- Integrate with LLMs to provide intelligent code analysis and suggestions
- Generate precise, minimal-impact code modifications
- Maintain conversation context across multiple interactions
- Provide clear, actionable implementation plans

### Success Metrics
- ✅ Can index and understand a full codebase in <30 seconds
- ✅ Generates working code modifications 90%+ of the time
- ✅ Maintains context across multi-turn conversations
- ✅ Provides clear explanations for all suggestions
- ✅ Handles multiple programming languages

---

## 🏗️ Technical Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLI Interface                           │
│  (Commands, Interactive Mode, Output Formatting)             │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                  Core Engine                                 │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐    │
│  │   Context   │ │   Analysis   │ │   Code           │    │
│  │   Manager   │ │   Engine     │ │   Modifier       │    │
│  └─────────────┘ └──────────────┘ └──────────────────┘    │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Foundation Layer                          │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐    │
│  │  Codebase   │ │     LLM      │ │   File System    │    │
│  │  Indexer    │ │  Integration │ │   Operations     │    │
│  └─────────────┘ └──────────────┘ └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

1. **CLI Interface Layer**
   - Command parsing and validation
   - Interactive REPL mode
   - Progress indicators and formatted output
   - Configuration management

2. **Core Engine**
   - Context Manager: Handles conversation state and codebase context
   - Analysis Engine: Processes code understanding requests
   - Code Modifier: Generates and applies code changes

3. **Foundation Layer**
   - Codebase Indexer: Parses and indexes project files
   - LLM Integration: Manages API calls and responses
   - File System Operations: Safe file reading/writing

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

#### 1.1 Project Setup & Structure

```bash
codenavigator/
├── src/
│   ├── cli/
│   │   ├── __init__.py
│   │   ├── commands.py      # Command definitions
│   │   ├── interface.py     # CLI interaction logic
│   │   └── formatters.py    # Output formatting
│   ├── core/
│   │   ├── __init__.py
│   │   ├── context.py       # Context management
│   │   ├── analyzer.py      # Code analysis engine
│   │   └── modifier.py      # Code modification logic
│   ├── indexer/
│   │   ├── __init__.py
│   │   ├── parser.py        # Code parsing utilities
│   │   ├── graph.py         # Dependency graph builder
│   │   └── cache.py         # Caching layer
│   ├── llm/
│   │   ├── __init__.py
│   │   ├── client.py        # LLM API client
│   │   ├── prompts.py       # Prompt templates
│   │   └── context_window.py # Context window management
│   └── utils/
│       ├── __init__.py
│       ├── file_ops.py      # File operations
│       ├── git_ops.py       # Git integration
│       └── config.py        # Configuration management
├── tests/
├── docs/
├── examples/
├── requirements.txt
├── setup.py
└── README.md
```

#### 1.2 Core Dependencies

```python
# requirements.txt
click>=8.0.0              # CLI framework
rich>=13.0.0              # Beautiful terminal output
tree-sitter>=0.20.0       # Code parsing
networkx>=3.0             # Dependency graphs
anthropic>=0.25.0         # Claude API (or openai>=1.0.0)
pydantic>=2.0.0          # Data validation
pygments>=2.15.0         # Syntax highlighting
gitpython>=3.1.0         # Git operations
pytest>=7.0.0            # Testing
black>=23.0.0            # Code formatting
```

#### 1.3 Initial CLI Structure

```python
# src/cli/commands.py
import click
from rich.console import Console
from rich.progress import Progress

console = Console()

@click.group()
@click.version_option()
def cli():
    """CodeNavigator - Your AI Coding Assistant"""
    pass

@cli.command()
@click.argument('path', type=click.Path(exists=True))
@click.option('--language', '-l', help='Primary language')
def index(path, language):
    """Index a codebase for analysis"""
    with Progress() as progress:
        task = progress.add_task("[cyan]Indexing codebase...", total=100)
        # Implementation here
        
@cli.command()
@click.option('--interactive', '-i', is_flag=True)
def chat(interactive):
    """Start a coding session"""
    if interactive:
        # Start REPL mode
        pass
    else:
        # Single query mode
        pass

@cli.command()
@click.argument('task', type=str)
def analyze(task):
    """Analyze code for specific issues"""
    # Implementation here

@cli.command()
@click.argument('description', type=str)
@click.option('--dry-run', is_flag=True)
def fix(description, dry_run):
    """Fix an issue or implement a feature"""
    # Implementation here
```

### Phase 2: Codebase Indexing (Week 2-3)

#### 2.1 File System Scanner

```python
# src/indexer/parser.py
import os
from pathlib import Path
from typing import List, Dict, Any
import tree_sitter
from dataclasses import dataclass

@dataclass
class CodeFile:
    path: Path
    content: str
    language: str
    size: int
    imports: List[str]
    exports: List[str]
    classes: List[str]
    functions: List[str]
    
class CodebaseIndexer:
    def __init__(self, root_path: Path):
        self.root_path = root_path
        self.files: Dict[str, CodeFile] = {}
        self.dependency_graph = {}
        
    def index(self) -> Dict[str, Any]:
        """Index entire codebase"""
        # 1. Scan all files
        # 2. Parse each file with tree-sitter
        # 3. Extract imports, exports, classes, functions
        # 4. Build dependency graph
        # 5. Cache results
        pass
        
    def search(self, query: str) -> List[CodeFile]:
        """Search indexed codebase"""
        pass
        
    def get_dependencies(self, file_path: str) -> List[str]:
        """Get file dependencies"""
        pass
```

#### 2.2 Language Support

```python
# src/indexer/languages.py
from abc import ABC, abstractmethod
import tree_sitter

class LanguageParser(ABC):
    @abstractmethod
    def parse_imports(self, tree) -> List[str]:
        pass
        
    @abstractmethod
    def parse_exports(self, tree) -> List[str]:
        pass
        
class PythonParser(LanguageParser):
    def __init__(self):
        # Initialize tree-sitter Python parser
        pass
        
class JavaScriptParser(LanguageParser):
    def __init__(self):
        # Initialize tree-sitter JS parser
        pass
        
# Add more language parsers as needed
```

### Phase 3: LLM Integration (Week 3-4)

#### 3.1 Context Window Management

```python
# src/llm/context_window.py
from typing import List, Tuple
import tiktoken

class ContextWindowManager:
    def __init__(self, max_tokens: int = 100000):
        self.max_tokens = max_tokens
        self.encoder = tiktoken.get_encoding("cl100k_base")
        
    def build_context(self, 
                     task: str,
                     relevant_files: List[CodeFile],
                     conversation_history: List[dict]) -> str:
        """Build optimal context for LLM"""
        # 1. Include system prompt
        # 2. Add task description
        # 3. Include relevant code files (prioritized)
        # 4. Add conversation history
        # 5. Ensure within token limits
        pass
        
    def prioritize_files(self, files: List[CodeFile], task: str) -> List[CodeFile]:
        """Prioritize files based on relevance"""
        # Use embeddings or keyword matching
        pass
```

#### 3.2 LLM Client

```python
# src/llm/client.py
from anthropic import Anthropic
from typing import Optional
import asyncio

class LLMClient:
    def __init__(self, api_key: str, model: str = "claude-3-opus-20240229"):
        self.client = Anthropic(api_key=api_key)
        self.model = model
        
    async def analyze_code(self, context: str, task: str) -> dict:
        """Send analysis request to LLM"""
        response = await self.client.messages.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"{context}\n\nTask: {task}"}
            ],
            max_tokens=4000
        )
        return self.parse_response(response)
        
    def parse_response(self, response) -> dict:
        """Parse LLM response into structured format"""
        # Extract code changes, explanations, etc.
        pass
```

### Phase 4: Code Analysis & Modification (Week 4-5)

#### 4.1 Analysis Engine

```python
# src/core/analyzer.py
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class AnalysisResult:
    issue_type: str  # bug, feature, improvement
    affected_files: List[str]
    root_cause: str
    suggested_approach: str
    implementation_plan: List[str]
    risks: List[str]
    
class CodeAnalyzer:
    def __init__(self, indexer, llm_client):
        self.indexer = indexer
        self.llm = llm_client
        
    async def analyze_issue(self, description: str) -> AnalysisResult:
        """Analyze a reported issue"""
        # 1. Search codebase for relevant files
        # 2. Build context with relevant code
        # 3. Query LLM for analysis
        # 4. Parse and structure response
        pass
        
    async def suggest_improvements(self, file_path: str) -> List[Dict]:
        """Suggest improvements for a file"""
        pass
```

#### 4.2 Code Modifier

```python
# src/core/modifier.py
import difflib
from typing import List, Tuple

class CodeModifier:
    def __init__(self, analyzer):
        self.analyzer = analyzer
        
    async def generate_changes(self, task: str) -> List[FileChange]:
        """Generate code changes for a task"""
        # 1. Analyze the task
        # 2. Get implementation plan from LLM
        # 3. Generate diffs for each file
        # 4. Validate changes
        pass
        
    def apply_changes(self, changes: List[FileChange], dry_run: bool = False):
        """Apply changes to files"""
        if dry_run:
            self.preview_changes(changes)
        else:
            self.write_changes(changes)
            
    def preview_changes(self, changes: List[FileChange]):
        """Show diff preview"""
        for change in changes:
            diff = difflib.unified_diff(
                change.original.splitlines(),
                change.modified.splitlines(),
                fromfile=change.file_path,
                tofile=change.file_path
            )
            print('\n'.join(diff))
```

### Phase 5: Interactive Mode & Polish (Week 5-6)

#### 5.1 REPL Interface

```python
# src/cli/interface.py
from prompt_toolkit import prompt
from prompt_toolkit.history import FileHistory
from rich.console import Console
from rich.markdown import Markdown

class InteractiveSession:
    def __init__(self, codebase_path: str):
        self.console = Console()
        self.history = FileHistory('.codenavigator_history')
        self.context_manager = ContextManager(codebase_path)
        
    def start(self):
        """Start interactive session"""
        self.console.print("[bold green]CodeNavigator Interactive Mode[/bold green]")
        self.console.print("Type 'help' for commands, 'exit' to quit\n")
        
        while True:
            try:
                user_input = prompt(
                    "CodeNavigator> ",
                    history=self.history
                )
                
                if user_input.lower() in ['exit', 'quit']:
                    break
                    
                response = self.process_command(user_input)
                self.display_response(response)
                
            except KeyboardInterrupt:
                continue
            except EOFError:
                break
                
    def process

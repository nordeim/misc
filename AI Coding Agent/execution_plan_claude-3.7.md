# Building a CLI AI Coding Assistant: Comprehensive Development Plan

I'll outline a detailed plan for building a CLI-based AI coding assistant similar to Claude Code, Codex, or Aider that can effectively utilize the CodeNavigator system prompt.

## Phase 1: Project Setup & Core Architecture

### 1.1 Initial Project Structure
```bash
mkdir code-navigator
cd code-navigator
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install poetry
poetry init
```

### 1.2 Core Dependencies
```toml
# pyproject.toml
[tool.poetry.dependencies]
python = "^3.10"
typer = "^0.9.0"         # CLI interface
rich = "^13.6.0"         # Terminal formatting
anthropic = "^0.5.0"     # Claude API client
gitpython = "^3.1.40"    # Git integration
tree-sitter = "^0.20.1"  # Code parsing
pydantic = "^2.4.2"      # Data validation
watchdog = "^3.0.0"      # File system monitoring
```

### 1.3 Basic CLI Structure
```python
# code_navigator/cli.py
import typer
from rich.console import Console
from rich.panel import Panel
from rich import print as rprint

app = typer.Typer()
console = Console()

@app.command()
def init(project_path: str = typer.Argument(".", help="Path to the project directory")):
    """Initialize CodeNavigator for a project."""
    console.print(Panel("Initializing CodeNavigator...", title="🚀 Setup"))
    # Project initialization code will go here
    
@app.command()
def analyze(query: str = typer.Argument(None, help="What you want to understand about the codebase")):
    """Analyze the codebase based on a specific query."""
    # Code analysis logic will go here

@app.command()
def fix(issue: str = typer.Argument(..., help="Description of the bug to fix")):
    """Diagnose and fix a bug in the codebase."""
    # Bug fixing workflow will go here

@app.command()
def add(feature: str = typer.Argument(..., help="Description of the feature to add")):
    """Plan and implement a new feature."""
    # Feature addition workflow will go here

if __name__ == "__main__":
    app()
```

## Phase 2: Codebase Indexing & Understanding

### 2.1 File System Crawler
```python
# code_navigator/indexer/filesystem.py
import os
from pathlib import Path
from typing import List, Dict, Set

def get_project_structure(project_path: str) -> Dict:
    """Build a representation of the project's file structure."""
    structure = {"files": [], "directories": {}}
    ignored_patterns = [".git", "node_modules", "venv", "__pycache__", ".vscode"]
    
    for root, dirs, files in os.walk(project_path):
        # Skip ignored directories
        dirs[:] = [d for d in dirs if d not in ignored_patterns]
        
        rel_path = os.path.relpath(root, project_path)
        if rel_path == ".":
            current_dict = structure
        else:
            # Navigate to the right nested dictionary
            current_dict = structure
            for part in rel_path.split(os.sep):
                if part not in current_dict["directories"]:
                    current_dict["directories"][part] = {"files": [], "directories": {}}
                current_dict = current_dict["directories"][part]
        
        # Add files to the current directory dictionary
        for file in files:
            if file.endswith((".py", ".js", ".ts", ".java", ".cpp", ".c", ".go", ".rb", ".php")):
                file_path = os.path.join(root, file)
                current_dict["files"].append({
                    "name": file,
                    "path": file_path,
                    "size": os.path.getsize(file_path)
                })
    
    return structure
```

### 2.2 Code Content Parser

```python
# code_navigator/indexer/parser.py
import re
from pathlib import Path
from typing import Dict, List, Optional

class CodeFile:
    def __init__(self, path: str, content: str):
        self.path = path
        self.content = content
        self.imports = []
        self.functions = []
        self.classes = []
        self.dependencies = []
        
        self._parse()
    
    def _parse(self):
        """Parse the file content to extract key elements."""
        # Simple regex-based parsing for demonstration
        # Real implementation should use language-specific parsers
        
        # Extract imports (Python example)
        import_pattern = r'^import\s+(\w+)|^from\s+(\w+(?:\.\w+)*)\s+import'
        self.imports = re.findall(import_pattern, self.content, re.MULTILINE)
        
        # Extract function definitions (Python example)
        function_pattern = r'def\s+(\w+)\s*\('
        self.functions = re.findall(function_pattern, self.content)
        
        # Extract class definitions (Python example)
        class_pattern = r'class\s+(\w+)'
        self.classes = re.findall(class_pattern, self.content)

class CodebaseIndex:
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.files: Dict[str, CodeFile] = {}
        self.function_map: Dict[str, List[str]] = {}  # function_name -> files
        self.class_map: Dict[str, List[str]] = {}     # class_name -> files
        self.import_map: Dict[str, List[str]] = {}    # module -> files
    
    def build_index(self):
        """Index all code files in the project."""
        for file_path in Path(self.project_path).glob("**/*.py"):  # Example for Python
            if any(ignored in str(file_path) for ignored in [".git", "venv", "__pycache__"]):
                continue
                
            with open(file_path, "r", encoding="utf-8") as f:
                try:
                    content = f.read()
                    rel_path = str(file_path.relative_to(self.project_path))
                    code_file = CodeFile(rel_path, content)
                    self.files[rel_path] = code_file
                    
                    # Update maps
                    for func in code_file.functions:
                        if func not in self.function_map:
                            self.function_map[func] = []
                        self.function_map[func].append(rel_path)
                    
                    for cls in code_file.classes:
                        if cls not in self.class_map:
                            self.class_map[cls] = []
                        self.class_map[cls].append(rel_path)
                    
                    for imp in code_file.imports:
                        module = imp[0] if imp[0] else imp[1]
                        if module not in self.import_map:
                            self.import_map[module] = []
                        self.import_map[module].append(rel_path)
                        
                except Exception as e:
                    print(f"Error indexing {file_path}: {e}")
    
    def search_code(self, query: str) -> List[Dict]:
        """Search codebase for the given query string."""
        results = []
        for path, file in self.files.items():
            if query.lower() in file.content.lower():
                line_matches = []
                for i, line in enumerate(file.content.split('\n')):
                    if query.lower() in line.lower():
                        line_matches.append({
                            "line_number": i + 1,
                            "content": line.strip()
                        })
                
                if line_matches:
                    results.append({
                        "file": path,
                        "matches": line_matches
                    })
        
        return results
```

## Phase 3: AI Integration

### 3.1 AI Client Setup
```python
# code_navigator/ai/client.py
import os
import json
from typing import Dict, List, Optional
import anthropic

class AIClient:
    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )
        
        # Load the system prompt
        with open("system_prompt.txt", "r") as f:
            self.system_prompt = f.read()
    
    def get_completion(self, user_message: str, 
                      context_files: Optional[Dict[str, str]] = None) -> str:
        """Get a completion from the AI model."""
        
        messages = [
            {"role": "system", "content": self.system_prompt}
        ]
        
        # Add file context if provided
        if context_files:
            context_message = "Here are the relevant files from the codebase:\n\n"
            for file_path, content in context_files.items():
                context_message += f"--- {file_path} ---\n```\n{content}\n```\n\n"
            
            messages.append({"role": "user", "content": context_message})
            messages.append({"role": "assistant", "content": "I've reviewed the code files you've shared."})
        
        # Add the user's actual query
        messages.append({"role": "user", "content": user_message})
        
        response = self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=4000,
            messages=messages
        )
        
        return response.content[0].text
```

### 3.2 Context Management
```python
# code_navigator/ai/context.py
from typing import Dict, List, Set, Optional
import os

class ContextManager:
    def __init__(self, project_path: str, code_index):
        self.project_path = project_path
        self.code_index = code_index
        self.conversation_history = []
    
    def identify_relevant_files(self, query: str, max_files: int = 5) -> Dict[str, str]:
        """Identify files most relevant to the user's query."""
        # First, search for exact matches
        search_results = self.code_index.search_code(query)
        relevant_files = {result["file"] for result in search_results}
        
        # If we don't have enough matches, add files based on function/class names
        query_words = set(query.lower().split())
        
        for func_name, files in self.code_index.function_map.items():
            if func_name.lower() in query_words and len(relevant_files) < max_files:
                relevant_files.update(files)
        
        for class_name, files in self.code_index.class_map.items():
            if class_name.lower() in query_words and len(relevant_files) < max_files:
                relevant_files.update(files)
        
        # Read the content of the identified files
        file_contents = {}
        for file_path in list(relevant_files)[:max_files]:
            full_path = os.path.join(self.project_path, file_path)
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    file_contents[file_path] = f.read()
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
        
        return file_contents
    
    def add_to_history(self, role: str, content: str):
        """Add a message to the conversation history."""
        self.conversation_history.append({"role": role, "content": content})
    
    def get_history(self, max_messages: int = 10) -> List[Dict[str, str]]:
        """Get recent conversation history."""
        return self.conversation_history[-max_messages:]
```

## Phase 4: Core Workflows Implementation

### 4.1 Task Management

```python
# code_navigator/workflows/task_manager.py
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel

class TaskType(str, Enum):
    BUG_FIX = "bug_fix"
    FEATURE = "feature"
    REFACTOR = "refactor"
    ANALYSIS = "analysis"

class TaskStatus(str, Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"

class Task(BaseModel):
    id: str
    type: TaskType
    description: str
    status: TaskStatus = TaskStatus.PLANNING
    affected_files: List[str] = []
    plan: Optional[Dict] = None
    implementation: Optional[Dict] = None

class TaskManager:
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.current_task_id: Optional[str] = None
    
    def create_task(self, task_type: TaskType, description: str) -> str:
        """Create a new task and return its ID."""
        import uuid
        task_id = str(uuid.uuid4())[:8]
        
        self.tasks[task_id] = Task(
            id=task_id,
            type=task_type,
            description=description
        )
        
        self.current_task_id = task_id
        return task_id
    
    def get_current_task(self) -> Optional[Task]:
        """Get the currently active task."""
        if self.current_task_id:
            return self.tasks.get(self.current_task_id)
        return None
    
    def update_task(self, task_id: str, **updates) -> bool:
        """Update task properties."""
        if task_id not in self.tasks:
            return False
        
        task_dict = self.tasks[task_id].dict()
        for key, value in updates.items():
            if key in task_dict:
                task_dict[key] = value
        
        self.tasks[task_id] = Task(**task_dict)
        return True
    
    def set_current_task(self, task_id: str) -> bool:
        """Set the current active task."""
        if task_id in self.tasks:
            self.current_task_id = task_id
            return True
        return False
```

### 4.2 Implementation of Core Workflows

```python
# code_navigator/workflows/bug_fix.py
from rich.console import Console
from rich.markdown import Markdown
from ..ai.client import AIClient
from ..ai.context import ContextManager

console = Console()

class BugFixWorkflow:
    def __init__(self, ai_client: AIClient, context_manager: ContextManager, task_manager):
        self.ai_client = ai_client
        self.context_manager = context_manager
        self.task_manager = task_manager
    
    def execute(self, bug_description: str):
        """Execute the bug fix workflow."""
        # Create a new task
        task_id = self.task_manager.create_task("bug_fix", bug_description)
        task = self.task_manager.get_current_task()
        
        console.print(f"[bold]Created bug fix task:[/bold] {task_id}")
        console.print(f"[bold]Description:[/bold] {bug_description}")
        
        # Step 1: Identify relevant files
        console.print("\n[bold]Identifying relevant files...[/bold]")
        relevant_files = self.context_manager.identify_relevant_files(bug_description)
        
        if not relevant_files:
            console.print("[yellow]No relevant files found. Please provide more specific details.[/yellow]")
            return
        
        console.print(f"Found {len(relevant_files)} relevant files:")
        for file_path in relevant_files:
            console.print(f"  - {file_path}")
        
        # Step 2: Diagnose the bug
        console.print("\n[bold]Diagnosing the bug...[/bold]")
        diagnosis_prompt = f"""
I need help diagnosing a bug in the codebase. Here's the bug description:

{bug_description}

Please analyze the code files I've provided and:
1. Identify the likely cause of the bug
2. Explain why this bug occurs
3. Suggest potential fixes
        """
        
        diagnosis = self.ai_client.get_completion(diagnosis_prompt, relevant_files)
        console.print(Markdown(diagnosis))
        
        # Update the task with affected files
        affected_files = [file for file in relevant_files]
        self.task_manager.update_task(task_id, affected_files=affected_files)
        
        # Step 3: Generate fix plan
        console.print("\n[bold]Generating fix implementation plan...[/bold]")
        plan_prompt = f"""
Based on your diagnosis of this bug:

{bug_description}

Please generate a detailed implementation plan following the structure:
1. Specific changes needed for each file
2. Unit tests to validate the fix
3. How to verify the fix works correctly

Present your plan in a structured format with clear steps.
        """
        
        implementation_plan = self.ai_client.get_completion(plan_prompt, relevant_files)
        console.print(Markdown(implementation_plan))
        
        # Step 4: Ask for confirmation to proceed
        proceed = typer.confirm("Would you like to proceed with implementing this fix?")
        if not proceed:
            console.print("[yellow]Implementation cancelled.[/yellow]")
            return
        
        # Step 5: Implement the fix
        console.print("\n[bold]Implementing the fix...[/bold]")
        implementation_prompt = f"""
Please provide the exact code changes to implement the fix for this bug:

{bug_description}

For each file that needs modification, show:
1. The full path to the file
2. The exact changes in diff format or as complete file content if necessary
3. Any additional notes about the implementation

Use ```diff or appropriate code blocks for all code snippets.
        """
        
        implementation = self.ai_client.get_completion(implementation_prompt, relevant_files)
        console.print(Markdown(implementation))
        
        # Store the implementation in the task
        self.task_manager.update_task(
            task_id, 
            plan={"text": implementation_plan},
            implementation={"text": implementation}
        )
        
        # Step 6: Ask to apply changes
        apply_changes = typer.confirm("Would you like to apply these changes to the codebase?")
        if apply_changes:
            # Implementation of actual file modification would go here
            console.print("[green]Changes applied successfully.[/green]")
        else:
            console.print("[yellow]Changes not applied.[/yellow]")
```

## Phase 5: File Operations & Git Integration

### 5.1 File Operations

```python
# code_navigator/utils/file_operations.py
import os
import re
from typing import Dict, List, Optional
import difflib
from pathlib import Path

def apply_diff(file_path: str, diff_content: str) -> bool:
    """Apply a diff to a file."""
    try:
        # Parse the diff to extract chunks
        chunks = []
        current_chunk = {"start": 0, "lines": []}
        
        for line in diff_content.split('\n'):
            if line.startswith('@@'):
                # New chunk, store the previous one if it exists
                if current_chunk["lines"]:
                    chunks.append(current_chunk)
                
                # Parse the line range
                # Format: @@ -start,count +start,count @@
                match = re.search(r'@@ -(\d+),\d+ \+(\d+),\d+ @@', line)
                if match:
                    current_chunk = {"start": int(match.group(2)), "lines": []}
            elif line.startswith('+'):
                # Add line (don't include the + symbol)
                current_chunk["lines"].append(("add", line[1:]))
            elif line.startswith('-'):
                # Remove line
                current_chunk["lines"].append(("remove", line[1:]))
            elif line.startswith(' '):
                # Context line
                current_chunk["lines"].append(("context", line[1:]))
        
        # Add the last chunk
        if current_chunk["lines"]:
            chunks.append(current_chunk)
        
        # Read the original file
        with open(file_path, 'r', encoding='utf-8') as f:
            original_lines = f.read().split('\n')
        
        # Apply the changes
        new_lines = original_lines.copy()
        offset = 0  # Track line number shifts as we add/remove lines
        
        for chunk in chunks:
            chunk_start = chunk["start"] - 1  # 0-based indexing
            
            current_line = chunk_start
            for op, content in chunk["lines"]:
                if op == "add":
                    new_lines.insert(current_line + offset, content)
                    offset += 1
                    current_line += 1
                elif op == "remove":
                    if 0 <= current_line + offset < len(new_lines):
                        new_lines.pop(current_line + offset)
                        offset -= 1
                    current_line += 1
                elif op == "context":
                    current_line += 1
        
        # Write the modified file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        
        return True
    except Exception as e:
        print(f"Error applying diff to {file_path}: {e}")
        return False

def extract_code_blocks(markdown_text: str) -> Dict[str, str]:
    """Extract code blocks from markdown text, identifying language and content."""
    pattern = r'```(\w+)?\s*\n(.*?)\n```'
    blocks = {}
    
    for i, match in enumerate(re.finditer(pattern, markdown_text, re.DOTALL)):
        language = match.group(1) or "text"
        content = match.group(2)
        blocks[f"block_{i}_{language}"] = content
    
    return blocks

def extract_file_changes(ai_response: str) -> Dict[str, str]:
    """Extract file changes from an AI response."""
    file_changes = {}
    
    # Extract code blocks
    blocks = extract_code_blocks(ai_response)
    
    # Look for file paths in the response
    file_pattern = r'(?:^|\n)(?:File|Path):\s*`?([^`\n]+)`?'
    file_matches = re.finditer(file_pattern, ai_response, re.IGNORECASE)
    
    current_position = 0
    for file_match in file_matches:
        file_path = file_match.group(1).strip()
        match_end = file_match.end()
        
        # Find the next code block after this file path
        next_block_match = re.search(r'```(\w+)?\s*\n', ai_response[match_end:], re.DOTALL)
        if next_block_match:
            block_start = match_end + next_block_match.start()
            block_end = ai_response.find('```', block_start + 3)
            
            if block_end > block_start:
                code_content = ai_response[block_start + next_block_match.end() - match_end:block_end]
                file_changes[file_path] = code_content
                current_position = block_end
    
    return file_changes
```

### 5.2 Git Integration

```python
# code_navigator/utils/git_integration.py
import os
from git import Repo
from typing import List, Dict, Optional

class GitManager:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        try:
            self.repo = Repo(repo_path)
        except Exception as e:
            print(f"Error initializing Git repo: {e}")
            self.repo = None
    
    def is_valid_repo(self) -> bool:
        """Check if the current directory is a valid git repository."""
        return self.repo is not None and not self.repo.bare
    
    def create_branch(self, branch_name: str) -> bool:
        """Create a new git branch."""
        if not self.is_valid_repo():
            return False
        
        try:
            self.repo.git.checkout('-b', branch_name)
            return True
        except Exception as e:
            print(f"Error creating branch: {e}")
            return False
    
    def get_modified_files(self) -> List[str]:
        """Get list of modified files in the working directory."""
        if not self.is_valid_repo():
            return []
        
        return [item.a_path for item in self.repo.index.diff(None)]
    
    def stage_files(self, file_paths: List[str]) -> bool:
        """Stage specific files for commit."""
        if not self.is_valid_repo():
            return False
        
        try:
            self.repo.git.add(*file_paths)
            return True
        except Exception as e:
            print(f"Error staging files: {e}")
            return False
    
    def commit_changes(self, message: str) -> bool:
        """Commit staged changes with the given message."""
        if not self.is_valid_repo():
            return False
        
        try:
            self.repo.git.commit('-m', message)
            return True
        except Exception as e:
            print(f"Error committing changes: {e}")
            return False
    
    def get_current_branch(self) -> Optional[str]:
        """Get the name of the current branch."""
        if not self.is_valid_repo():
            return None
        
        return self.repo.active_branch.name
```

## Phase 6: Main Application Integration

### 6.1 Main Application Class

```python
# code_navigator/app.py
import os
import typer
from typing import Dict, List, Optional
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown

from .ai.client import AIClient
from .ai.context import ContextManager
from .indexer.parser import CodebaseIndex
from .indexer.filesystem import get_project_structure
from .workflows.task_manager import TaskManager, TaskType
from .workflows.bug_fix import BugFixWorkflow
from .utils.git_integration import GitManager

console = Console()

class CodeNavigatorApp:
    def __init__(self, project_path: str):
        self.project_path = os.path.abspath(project_path)
        self.ai_client = AIClient()
        self.code_index = CodebaseIndex(self.project_path)
        self.context_manager = ContextManager(self.project_path, self.code_index)
        self.task_manager = TaskManager()
        self.git_manager = GitManager(self.project_path)
        
        # Workflows
        self.bug_fix_workflow = BugFixWorkflow(
            self.ai_client, 
            self.context_manager,
            self.task_manager
        )
        
        # State
        self.initialized = False
    
    def initialize(self):
        """Initialize the application by indexing the codebase."""
        if self.initialized:
            return True
        
        try:
            console.print(Panel("Building codebase index...", title="🔍 Indexing"))
            
            # Check if this is a git repository
            if self.git_manager.is_valid_repo():
                console.print(f"[green]Git repository detected:[/green] {self.git_manager.get_current_branch()}")
            else:
                console.print("[yellow]Not a git repository. Some features may be limited.[/yellow]")
            
            # Get project structure
            structure = get_project_structure(self.project_path)
            
            # Build code index
            self.code_index.build_index()
            
            file_count = len(self.code_index.files)
            console.print(f"[green]Indexed {file_count} code files successfully.[/green]")
            
            self.initialized = True
            return True
        
        except Exception as e:
            console.print(f"[red]Error initializing CodeNavigator: {e}[/red]")
            return False
    
    def fix_bug(self, bug_description: str):
        """Execute the bug fix workflow."""
        if not self.initialized and not self.initialize():
            console.print("[red]Failed to initialize. Please check the project path.[/red]")
            return
        
        self.bug_fix_workflow.execute(bug_description)
    
    def analyze_code(self, query: str):
        """Analyze the codebase based on a query."""
        if not self.initialized and not self.initialize():
            console.print("[red]Failed to initialize. Please check the project path.[/red]")
            return
        
        console.print(Panel(f"Analyzing: {query}", title="🔍 Code Analysis"))
        
        # Find relevant files
        relevant_files = self.context_manager.identify_relevant_files(query)
        
        if not relevant_files:
            console.print("[yellow]No relevant files found. Please provide a more specific query.[/yellow]")
            return
        
        console.print(f"Found {len(relevant_files)} relevant files:")
        for file_path in relevant_files:
            console.print(f"  - {file_path}")
        
        # Generate analysis
        analysis_prompt = f"""
I need an analysis of part of my codebase. Here's what I want to understand:

{query}

Please analyze the code files I've provided and:
1. Explain how these components work together
2. Identify any potential issues or areas for improvement
3. Provide a high-level architectural overview of this part of the codebase
        """
        
        analysis = self.ai_client.get_completion(analysis_prompt, relevant_files)
        console.print(Markdown(analysis))
```

### 6.2 Entry Point

```python
# code_navigator/__main__.py
import os
import typer
from rich.console import Console
from .app import CodeNavigatorApp

app = typer.Typer()
console = Console()

# Global app instance
navigator_app = None

@app.callback()
def callback(project_path: str = typer.Option(".", help="Path to the project directory")):
    """
    CodeNavigator: An AI-powered coding assistant for complex codebases.
    """
    global navigator_app
    navigator_app = CodeNavigatorApp(project_path)

@app.command()
def init():
    """Initialize CodeNavigator for your project."""
    global navigator_app
    if navigator_app.initialize():
        console.print("[green]Successfully initialized CodeNavigator![/green]")
    else:
        console.print("[red]Failed to initialize CodeNavigator.[/red]")

@app.command()
def fix(description: str):
    """Diagnose and fix a bug in your codebase."""
    global navigator_app
    navigator_app.fix_bug(description)

@app.command()
def analyze(query: str):
    """Analyze your codebase based on a specific question or task."""
    global navigator_app
    navigator_app.analyze_code(query)

@app.command()
def search(query: str):
    """Search for specific code elements across your codebase."""
    global navigator_app
    if not navigator_app.initialized:
        navigator_app.initialize()
    
    results = navigator_app.code_index.search_code(query)
    
    if not results:
        console.print("[yellow]No results found for your query.[/yellow]")
        return
    
    console.print(f"[green]Found {len(results)} files with matches:[/green]")
    
    for result in results:
        console.print(f"\n[bold]{result['file']}[/bold]")
        for match in result['matches'][:5]:  # Show first 5 matches per file
            console.print(f"  Line {match['line_number']}: {match['content']}")
        
        if len(result['matches']) > 5:
            console.print(f"  [dim]...and {len(result['matches']) - 5} more matches[/dim]")

if __name__ == "__main__":
    app()
```

## Phase 7: Packaging and Distribution

### 7.1 Package Configuration

```toml
# pyproject.toml additions
[tool.poetry]
name = "code-navigator"
version = "0.1.0"
description = "AI-powered CLI coding assistant for complex codebases"
authors = ["Your Name <your.email@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
# ... dependencies from earlier

[tool.poetry.scripts]
codenav = "code_navigator.__main__:app"
```

### 7.2 Installation Instructions

Create a README.md file:

```markdown
# CodeNavigator: AI-Powered Coding Assistant

An intelligent CLI assistant for navigating, understanding, and improving complex codebases.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/code-navigator.git
cd code-navigator

# Install with Poetry
poetry install

# Or with pip
pip install .
```

## Quick Start

```bash
# Initialize for your project
codenav --project-path /path/to/your/project init

# Analyze your codebase
codenav analyze "How does the user authentication flow work?"

# Fix a bug
codenav fix "Login fails when user enters special characters in username"

# Search for code
codenav search "authenticate_user"
```

## Environment Variables

- `ANTHROPIC_API_KEY`: Your Claude API key (required)
```

## Development Timeline & Milestones

1. **Week 1: Foundation**
   - Set up project structure
   - Implement basic CLI framework
   - Create file system crawler
   
2. **Week 2: Indexing & AI Integration**
   - Implement code indexing
   - Set up AI client and API connection
   - Build context management
   
3. **Week 3: Core Workflows**
   - Implement bug fix workflow
   - Add code analysis capabilities
   - Create task management
   
4. **Week 4: Advanced Features**
   - Implement file modification capabilities
   - Add Git integration
   - Create testing infrastructure
   
5. **Week 5: Polish & Documentation**
   - Add error handling
   - Improve UX and feedback
   - Create comprehensive documentation

## Tips for Junior Developers

1. **Start small**: Begin by implementing the basic CLI structure and getting it to run before adding complex features.

2. **Test incrementally**: Test each component as you build it rather than waiting until the end.

3. **API key management**: Use environment variables or a secure configuration file for the API keys.

4. **Error handling**: Implement robust error handling, especially for file operations and API calls.

5. **Language parsing**: For full-scale implementation, consider using established parsing libraries like tree-sitter instead of regex.

6. **Memory management**: Be mindful of memory usage when indexing large codebases; implement pagination or chunking where needed.

7. **API costs**: Be aware of the API costs when using Claude and implement rate limiting and usage tracking.

---
## Phase 8: Advanced Code Understanding

### 8.1 Language-Specific Parsers

```python
# code_navigator/indexer/language_parsers.py
from tree_sitter import Language, Parser
import os
from typing import Dict, List, Any, Optional
import re

class LanguageParser:
    def __init__(self):
        # Path to compiled Tree-sitter language libraries
        self.language_path = os.path.join(os.path.dirname(__file__), "build", "languages.so")
        
        # Initialize parsers for different languages
        try:
            Language.build_library(
                self.language_path,
                [
                    './vendor/tree-sitter-python',
                    './vendor/tree-sitter-javascript',
                    './vendor/tree-sitter-typescript',
                    './vendor/tree-sitter-java',
                    './vendor/tree-sitter-go',
                ]
            )
            
            self.PYTHON = Language(self.language_path, 'python')
            self.JAVASCRIPT = Language(self.language_path, 'javascript')
            self.TYPESCRIPT = Language(self.language_path, 'typescript')
            self.JAVA = Language(self.language_path, 'java')
            self.GO = Language(self.language_path, 'go')
            
            self.parsers = {
                'py': self._create_parser(self.PYTHON),
                'js': self._create_parser(self.JAVASCRIPT),
                'ts': self._create_parser(self.TYPESCRIPT),
                'jsx': self._create_parser(self.JAVASCRIPT),
                'tsx': self._create_parser(self.TYPESCRIPT),
                'java': self._create_parser(self.JAVA),
                'go': self._create_parser(self.GO),
            }
            
            self.initialized = True
        except Exception as e:
            print(f"Error initializing language parsers: {e}")
            self.initialized = False
    
    def _create_parser(self, language):
        parser = Parser()
        parser.set_language(language)
        return parser
    
    def get_language_for_file(self, file_path: str) -> Optional[str]:
        """Determine the language for a file based on its extension."""
        ext = file_path.split('.')[-1].lower()
        
        language_map = {
            'py': 'python',
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'java': 'java',
            'go': 'go',
            'rb': 'ruby',
            'php': 'php',
            'c': 'c',
            'cpp': 'cpp',
            'h': 'c',
            'hpp': 'cpp',
        }
        
        return language_map.get(ext)
    
    def parse_file(self, file_path: str, content: str) -> Dict:
        """Parse a file and extract its structure."""
        ext = file_path.split('.')[-1].lower()
        
        if ext not in self.parsers or not self.initialized:
            # Fallback to regex-based parsing
            return self._parse_with_regex(file_path, content)
        
        parser = self.parsers[ext]
        tree = parser.parse(bytes(content, 'utf8'))
        
        # Extract meaningful code elements
        code_elements = {
            'imports': [],
            'functions': [],
            'classes': [],
            'variables': [],
            'exports': [],
        }
        
        # Traverse the syntax tree to extract elements
        self._extract_code_elements(tree.root_node, content, code_elements)
        
        return code_elements
    
    def _extract_code_elements(self, node, content: str, elements: Dict):
        """Recursively extract code elements from the syntax tree."""
        if node.type == 'import_statement':
            # Extract Python imports
            elements['imports'].append(self._get_node_text(node, content))
        elif node.type == 'import_from_statement':
            elements['imports'].append(self._get_node_text(node, content))
        elif node.type == 'function_definition':
            # Extract function names and details
            for child in node.children:
                if child.type == 'identifier':
                    elements['functions'].append({
                        'name': self._get_node_text(child, content),
                        'line': child.start_point[0] + 1,
                        'parameters': self._extract_function_params(node, content),
                        'docstring': self._extract_docstring(node, content)
                    })
        elif node.type == 'class_definition':
            # Extract class names and details
            for child in node.children:
                if child.type == 'identifier':
                    class_name = self._get_node_text(child, content)
                    elements['classes'].append({
                        'name': class_name,
                        'line': child.start_point[0] + 1,
                        'methods': self._extract_class_methods(node, content, class_name),
                        'docstring': self._extract_docstring(node, content)
                    })
        
        # Recursively process children
        for child in node.children:
            self._extract_code_elements(child, content, elements)
    
    def _get_node_text(self, node, content: str) -> str:
        """Get the text corresponding to a node from the content."""
        return content[node.start_byte:node.end_byte]
    
    def _extract_function_params(self, func_node, content: str) -> List[str]:
        """Extract function parameters from a function node."""
        params = []
        for child in func_node.children:
            if child.type == 'parameters':
                for param_node in child.children:
                    if param_node.type == 'identifier':
                        params.append(self._get_node_text(param_node, content))
        return params
    
    def _extract_class_methods(self, class_node, content: str, class_name: str) -> List[Dict]:
        """Extract methods from a class node."""
        methods = []
        for child in class_node.children:
            if child.type == 'block':
                for block_child in child.children:
                    if block_child.type == 'function_definition':
                        method_name = None
                        for func_child in block_child.children:
                            if func_child.type == 'identifier':
                                method_name = self._get_node_text(func_child, content)
                        
                        if method_name:
                            methods.append({
                                'name': method_name,
                                'line': block_child.start_point[0] + 1,
                                'parameters': self._extract_function_params(block_child, content),
                                'docstring': self._extract_docstring(block_child, content)
                            })
        return methods
    
    def _extract_docstring(self, node, content: str) -> Optional[str]:
        """Extract docstring from a function or class node."""
        for child in node.children:
            if child.type == 'block':
                for i, block_child in enumerate(child.children):
                    if i == 1 and block_child.type == 'expression_statement':
                        for expr_child in block_child.children:
                            if expr_child.type == 'string':
                                return self._get_node_text(expr_child, content).strip('\'\"')
        return None
    
    def _parse_with_regex(self, file_path: str, content: str) -> Dict:
        """Fallback parsing using regex patterns."""
        language = self.get_language_for_file(file_path)
        elements = {
            'imports': [],
            'functions': [],
            'classes': [],
            'variables': [],
            'exports': [],
        }
        
        if language == 'python':
            # Extract Python imports
            import_pattern = r'^import\s+(\w+)|^from\s+(\w+(?:\.\w+)*)\s+import'
            elements['imports'] = re.findall(import_pattern, content, re.MULTILINE)
            
            # Extract Python functions
            function_pattern = r'def\s+(\w+)\s*\(([^)]*)\):'
            for match in re.finditer(function_pattern, content, re.MULTILINE):
                elements['functions'].append({
                    'name': match.group(1),
                    'line': content[:match.start()].count('\n') + 1,
                    'parameters': [p.strip() for p in match.group(2).split(',') if p.strip()]
                })
            
            # Extract Python classes
            class_pattern = r'class\s+(\w+)(?:\(([^)]*)\))?:'
            for match in re.finditer(class_pattern, content, re.MULTILINE):
                elements['classes'].append({
                    'name': match.group(1),
                    'line': content[:match.start()].count('\n') + 1,
                    'inherits': match.group(2).split(',') if match.group(2) else []
                })
        
        elif language in ('javascript', 'typescript'):
            # Extract JS/TS imports
            import_pattern = r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]'
            elements['imports'] = re.findall(import_pattern, content, re.MULTILINE)
            
            # Extract JS/TS functions
            function_pattern = r'(?:function|const|let|var)\s+(\w+)\s*=?\s*(?:\([^)]*\)|[^=]*=>\s*)'
            for match in re.finditer(function_pattern, content, re.MULTILINE):
                elements['functions'].append({
                    'name': match.group(1),
                    'line': content[:match.start()].count('\n') + 1
                })
            
            # Extract JS/TS classes
            class_pattern = r'class\s+(\w+)(?:\s+extends\s+(\w+))?'
            for match in re.finditer(class_pattern, content, re.MULTILINE):
                elements['classes'].append({
                    'name': match.group(1),
                    'line': content[:match.start()].count('\n') + 1,
                    'inherits': [match.group(2)] if match.group(2) else []
                })
            
            # Extract exports
            export_pattern = r'export\s+(?:default\s+)?(?:const|let|var|function|class)?\s*(\w+)'
            elements['exports'] = re.findall(export_pattern, content, re.MULTILINE)
        
        return elements
```

### 8.2 Dependency Graph Builder

```python
# code_navigator/indexer/dependency_graph.py
from typing import Dict, List, Set, Tuple
import networkx as nx
import matplotlib.pyplot as plt
import os

class DependencyGraph:
    def __init__(self, code_index):
        self.code_index = code_index
        self.graph = nx.DiGraph()
        self.built = False
    
    def build_graph(self):
        """Build a dependency graph from the code index."""
        if not self.code_index.files:
            return False
        
        # Add nodes for each file
        for file_path in self.code_index.files:
            self.graph.add_node(file_path, type='file')
            
            # Add function and class nodes
            file = self.code_index.files[file_path]
            for func in file.functions:
                node_id = f"{file_path}::{func}"
                self.graph.add_node(node_id, type='function', name=func)
                self.graph.add_edge(file_path, node_id, type='contains')
            
            for cls in file.classes:
                node_id = f"{file_path}::{cls}"
                self.graph.add_node(node_id, type='class', name=cls)
                self.graph.add_edge(file_path, node_id, type='contains')
        
        # Add dependency edges
        for file_path, file in self.code_index.files.items():
            for import_name in file.imports:
                # Handle Python imports which are tuples (direct, from_import)
                if isinstance(import_name, tuple):
                    module = import_name[0] if import_name[0] else import_name[1]
                else:
                    module = import_name
                
                # Find potential files that contain this module
                for target_file, target_code in self.code_index.files.items():
                    # Simple heuristic: module name appears in the file path
                    # This could be improved with language-specific import resolution
                    if module in os.path.basename(target_file):
                        self.graph.add_edge(file_path, target_file, type='imports')
                        break
        
        self.built = True
        return True
    
    def get_dependencies(self, file_path: str) -> List[str]:
        """Get files that the specified file depends on."""
        if not self.built:
            self.build_graph()
        
        if file_path not in self.graph:
            return []
        
        dependencies = []
        for _, dep, data in self.graph.out_edges(file_path, data=True):
            if data.get('type') == 'imports':
                dependencies.append(dep)
        
        return dependencies
    
    def get_dependents(self, file_path: str) -> List[str]:
        """Get files that depend on the specified file."""
        if not self.built:
            self.build_graph()
        
        if file_path not in self.graph:
            return []
        
        dependents = []
        for dep, _, data in self.graph.in_edges(file_path, data=True):
            if data.get('type') == 'imports':
                dependents.append(dep)
        
        return dependents
    
    def get_affected_files(self, file_path: str, max_depth: int = 2) -> Set[str]:
        """Get all files that might be affected by changes to the specified file."""
        if not self.built:
            self.build_graph()
        
        if file_path not in self.graph:
            return set()
        
        # BFS to find affected files up to max_depth
        affected = set()
        queue = [(file_path, 0)]
        visited = set([file_path])
        
        while queue:
            current, depth = queue.pop(0)
            
            if depth > 0:  # Don't include the starting file
                affected.add(current)
            
            if depth < max_depth:
                for dep in self.get_dependents(current):
                    if dep not in visited:
                        visited.add(dep)
                        queue.append((dep, depth + 1))
        
        return affected
    
    def visualize(self, output_path: str = "dependency_graph.png"):
        """Generate a visualization of the dependency graph."""
        if not self.built:
            self.build_graph()
        
        # Create a subgraph with just file nodes and import relationships
        file_graph = nx.DiGraph()
        
        for node in self.graph.nodes():
            if self.graph.nodes[node].get('type') == 'file':
                file_graph.add_node(node)
        
        for src, dst, data in self.graph.edges(data=True):
            if data.get('type') == 'imports' and src in file_graph and dst in file_graph:
                file_graph.add_edge(src, dst)
        
        # Set up the plot
        plt.figure(figsize=(12, 10))
        pos = nx.spring_layout(file_graph, seed=42)
        
        # Draw the graph
        nx.draw(file_graph, pos, with_labels=True, node_color='skyblue', 
                node_size=1500, edge_color='gray', arrows=True, 
                font_size=8, font_weight='bold')
        
        plt.title("Codebase Dependency Graph")
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return output_path
```

## Phase 9: Enhanced AI Integration

### 9.1 Prompt Engineering & Templates

```python
# code_navigator/ai/prompts.py
from typing import Dict, List, Optional
import os
from jinja2 import Template

class PromptTemplate:
    """Manages prompt templates for different AI tasks."""
    
    def __init__(self):
        self.templates_dir = os.path.join(os.path.dirname(__file__), "templates")
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, Template]:
        """Load all template files from the templates directory."""
        templates = {}
        
        if not os.path.exists(self.templates_dir):
            os.makedirs(self.templates_dir)
            self._create_default_templates()
        
        for filename in os.listdir(self.templates_dir):
            if filename.endswith(".txt"):
                template_name = filename[:-4]  # Remove .txt extension
                file_path = os.path.join(self.templates_dir, filename)
                
                with open(file_path, "r", encoding="utf-8") as f:
                    template_content = f.read()
                    templates[template_name] = Template(template_content)
        
        return templates
    
    def _create_default_templates(self):
        """Create default templates if they don't exist."""
        default_templates = {
            "bug_diagnosis.txt": """
I need help diagnosing a bug in my codebase. Here's the description:

{{ bug_description }}

I've identified these relevant files that might be related to the issue:
{% for file_path, content in files.items() %}
## {{ file_path }}
```
{{ content }}
```

{% endfor %}

Please analyze these files and:
1. Identify the likely cause of the bug
2. Explain why this is happening
3. Suggest potential fixes
            """,
            
            "feature_planning.txt": """
I want to add a new feature to my codebase. Here's the feature description:

{{ feature_description }}

Here are the relevant files that might need to be modified:
{% for file_path, content in files.items() %}
## {{ file_path }}
```
{{ content }}
```

{% endfor %}

Please help me plan this feature implementation:
1. Suggest an approach for implementing this feature
2. Identify which files need to be modified and how
3. Create a step-by-step implementation plan
4. Highlight any potential challenges or edge cases to consider
            """,
            
            "code_analysis.txt": """
I need to understand how part of my codebase works. Here's what I'm trying to understand:

{{ analysis_query }}

Here are the relevant files:
{% for file_path, content in files.items() %}
## {{ file_path }}
```
{{ content }}
```

{% endfor %}

Please analyze these files and help me understand:
1. What's the overall architecture and how these components work together
2. The control flow and data flow through these components
3. Any key design patterns or important implementation details
4. Potential areas for improvement or optimization
            """,
            
            "implementation_plan.txt": """
Based on our previous discussion about {{ task_type }}: "{{ task_description }}"

Please provide a detailed implementation plan following this structure:

1. Files to modify:
   - List each file path and describe the changes needed

2. Step-by-step implementation:
   - Provide numbered steps for implementing the changes
   - Include code snippets where appropriate

3. Testing strategy:
   - How to verify the changes work correctly
   - Potential edge cases to test

4. Rollback plan:
   - How to revert changes if something goes wrong
            """,
            
            "code_review.txt": """
I'd like you to review the following code changes for {{ task_type }}: "{{ task_description }}"

Here are the changes:
{% for file_path, diff in changes.items() %}
## {{ file_path }}
```diff
{{ diff }}
```

{% endfor %}

Please provide a thorough code review:
1. Are there any bugs or issues in the implementation?
2. Are there any edge cases not handled?
3. Are there ways to improve the code quality or performance?
4. Does this implementation fully address the requirements?
5. Any other feedback or suggestions?
            """
        }
        
        for name, content in default_templates.items():
            file_path = os.path.join(self.templates_dir, name)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
    
    def render(self, template_name: str, **kwargs) -> str:
        """Render a template with the provided variables."""
        if template_name not in self.templates:
            raise ValueError(f"Template '{template_name}' not found")
        
        return self.templates[template_name].render(**kwargs)
```

### 9.2 Conversation History Management

```python
# code_navigator/ai/conversation.py
from typing import Dict, List, Optional
import json
import os
import time

class Message:
    def __init__(self, role: str, content: str, timestamp: float = None):
        self.role = role
        self.content = content
        self.timestamp = timestamp or time.time()
    
    def to_dict(self) -> Dict:
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Message':
        return cls(
            role=data["role"],
            content=data["content"],
            timestamp=data.get("timestamp", time.time())
        )

class Conversation:
    def __init__(self, id: str, title: str = None):
        self.id = id
        self.title = title or f"Conversation {id}"
        self.messages: List[Message] = []
        self.created_at = time.time()
        self.updated_at = time.time()
    
    def add_message(self, role: str, content: str) -> Message:
        """Add a new message to the conversation."""
        message = Message(role, content)
        self.messages.append(message)
        self.updated_at = message.timestamp
        return message
    
    def get_recent_messages(self, count: int = 10) -> List[Dict]:
        """Get the most recent messages in Claude API format."""
        recent = self.messages[-count:] if count < len(self.messages) else self.messages
        return [{"role": msg.role, "content": msg.content} for msg in recent]
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "title": self.title,
            "messages": [msg.to_dict() for msg in self.messages],
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Conversation':
        conversation = cls(
            id=data["id"],
            title=data["title"]
        )
        conversation.created_at = data.get("created_at", time.time())
        conversation.updated_at = data.get("updated_at", time.time())
        conversation.messages = [Message.from_dict(msg) for msg in data.get("messages", [])]
        return conversation

class ConversationManager:
    def __init__(self, storage_dir: str = None):
        self.storage_dir = storage_dir or os.path.join(os.path.expanduser("~"), ".code-navigator", "conversations")
        self.conversations: Dict[str, Conversation] = {}
        self.active_conversation_id: Optional[str] = None
        
        # Create storage directory if it doesn't exist
        os.makedirs(self.storage_dir, exist_ok=True)
        
        # Load existing conversations
        self._load_conversations()
    
    def _load_conversations(self):
        """Load conversations from storage."""
        for filename in os.listdir(self.storage_dir):
            if filename.endswith(".json"):
                file_path = os.path.join(self.storage_dir, filename)
                try:
                    with open(file_path, "r") as f:
                        data = json.load(f)
                        conversation = Conversation.from_dict(data)
                        self.conversations[conversation.id] = conversation
                except Exception as e:
                    print(f"Error loading conversation {filename}: {e}")
    
    def _save_conversation(self, conversation_id: str):
        """Save a conversation to storage."""
        if conversation_id not in self.conversations:
            return
        
        conversation = self.conversations[conversation_id]
        file_path = os.path.join(self.storage_dir, f"{conversation_id}.json")
        
        with open(file_path, "w") as f:
            json.dump(conversation.to_dict(), f, indent=2)
    
    def create_conversation(self, title: Optional[str] = None) -> str:
        """Create a new conversation and return its ID."""
        import uuid
        conversation_id = str(uuid.uuid4())
        
        self.conversations[conversation_id] = Conversation(
            id=conversation_id,
            title=title or f"Conversation {len(self.conversations) + 1}"
        )
        
        self.active_conversation_id = conversation_id
        self._save_conversation(conversation_id)
        
        return conversation_id
    
    def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """Get a conversation by ID."""
        return self.conversations.get(conversation_id)
    
    def get_active_conversation(self) -> Optional[Conversation]:
        """Get the currently active conversation."""
        if self.active_conversation_id:
            return self.conversations.get(self.active_conversation_id)
        return None
    
    def set_active_conversation(self, conversation_id: str) -> bool:
        """Set the active conversation."""
        if conversation_id in self.conversations:
            self.active_conversation_id = conversation_id
            return True
        return False
    
    def add_message(self, role: str, content: str, conversation_id: Optional[str] = None) -> bool:
        """Add a message to a conversation."""
        target_id = conversation_id or self.active_conversation_id
        
        if not target_id:
            target_id = self.create_conversation()
        
        if target_id in self.conversations:
            self.conversations[target_id].add_message(role, content)
            self._save_conversation(target_id)
            return True
        
        return False
    
    def list_conversations(self) -> List[Dict]:
        """List all conversations with summary information."""
        return [
            {
                "id": conv.id,
                "title": conv.title,
                "message_count": len(conv.messages),
                "updated_at": conv.updated_at
            }
            for conv in sorted(self.conversations.values(), key=lambda c: c.updated_at, reverse=True)
        ]
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation."""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            
            # Remove the file
            file_path = os.path.join(self.storage_dir, f"{conversation_id}.json")
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # Reset active conversation if we deleted it
            if self.active_conversation_id == conversation_id:
                self.active_conversation_id = None
            
            return True
        
        return False
```

## Phase 10: Feature Implementation Workflows

### 10.1 Feature Addition Workflow

```python
# code_navigator/workflows/feature_add.py
from rich.console import Console
from rich.markdown import Markdown
import typer
from typing import Dict, List, Optional

from ..ai.client import AIClient
from ..ai.context import ContextManager
from ..ai.prompts import PromptTemplate
from ..utils.file_operations import extract_file_changes, apply_diff
from ..utils.git_integration import GitManager

console = Console()

class FeatureAddWorkflow:
    def __init__(self, ai_client: AIClient, context_manager: ContextManager, task_manager, git_manager: GitManager):
        self.ai_client = ai_client
        self.context_manager = context_manager
        self.task_manager = task_manager
        self.git_manager = git_manager
        self.prompt_template = PromptTemplate()
    
    def execute(self, feature_description: str):
        """Execute the feature addition workflow."""
        # Create a new task
        task_id = self.task_manager.create_task("feature", feature_description)
        task = self.task_manager.get_current_task()
        
        console.print(f"[bold]Created feature task:[/bold] {task_id}")
        console.print(f"[bold]Description:[/bold] {feature_description}")
        
        # Step 1: Create feature branch
        if self.git_manager.is_valid_repo():
            branch_name = f"feature/{task_id}"
            if self.git_manager.create_branch(branch_name):
                console.print(f"[green]Created feature branch:[/green] {branch_name}")
            else:
                console.print("[yellow]Failed to create feature branch. Continuing without branching.[/yellow]")
        
        # Step 2: Identify relevant files
        console.print("\n[bold]Identifying relevant files...[/bold]")
        relevant_files = self.context_manager.identify_relevant_files(feature_description)
        
        if not relevant_files:
            console.print("[yellow]No relevant files found. Please provide more specific details.[/yellow]")
            return
        
        console.print(f"Found {len(relevant_files)} relevant files:")
        for file_path in relevant_files:
            console.print(f"  - {file_path}")
        
        # Step 3: Plan the feature implementation
        console.print("\n[bold]Planning feature implementation...[/bold]")
        
        planning_prompt = self.prompt_template.render(
            "feature_planning.txt",
            feature_description=feature_description,
            files=relevant_files
        )
        
        implementation_plan = self.ai_client.get_completion(planning_prompt)
        console.print(Markdown(implementation_plan))
        
        # Update the task with affected files
        affected_files = list(relevant_files.keys())
        self.task_manager.update_task(task_id, affected_files=affected_files)
        
        # Step 4: Ask for confirmation to proceed
        proceed = typer.confirm("Would you like to proceed with implementing this feature?")
        if not proceed:
            console.print("[yellow]Implementation cancelled.[/yellow]")
            return
        
        # Step 5: Generate implementation details
        console.print("\n[bold]Generating implementation details...[/bold]")
        
        implementation_prompt = f"""
Based on the feature planning we just discussed, please provide the detailed implementation for this feature:

{feature_description}

For each file that needs to be modified, show:
1. The full path to the file
2. The exact changes as complete file content or in diff format
3. Any notes about the implementation

Use ```diff or appropriate code blocks for all code changes.
        """
        
        implementation = self.ai_client.get_completion(implementation_prompt)
        console.print(Markdown(implementation))
        
        # Store the implementation in the task
        self.task_manager.update_task(
            task_id, 
            plan={"text": implementation_plan},
            implementation={"text": implementation}
        )
        
        # Step 6: Apply changes
        apply_changes = typer.confirm("Would you like to apply these changes to the codebase?")
        if not apply_changes:
            console.print("[yellow]Changes not applied.[/yellow]")
            return
        
        # Extract and apply file changes
        file_changes = extract_file_changes(implementation)
        
        if not file_changes:
            console.print("[yellow]No file changes were extracted from the implementation.[/yellow]")
            return
        
        # Apply each file change
        modified_files = []
        for file_path, content in file_changes.items():
            full_path = os.path.join(self.context_manager.project_path, file_path)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            # Determine if this is a new file or a modification
            is_new_file = not os.path.exists(full_path)
            
            if is_new_file:
                # Create new file
                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                console.print(f"[green]Created new file:[/green] {file_path}")
            else:
                # Apply changes to existing file
                # Check if content is a diff or a complete file
                if content.startswith('---') or content.startswith('+++') or content.startswith('@@'):
                    # Looks like a diff
                    success = apply_diff(full_path, content)
                    action = "Applied diff to"
                else:
                    # Complete file replacement
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    success = True
                    action = "Updated"
                
                if success:
                    console.print(f"[green]{action}:[/green] {file_path}")
                else:
                    console.print(f"[red]Failed to update:[/red] {file_path}")
            
            modified_files.append(file_path)
        
        # Step 7: Commit changes if using git
        if modified_files and self.git_manager.is_valid_repo():
            commit_changes = typer.confirm("Would you like to commit these changes?")
            if commit_changes:
                if self.git_manager.stage_files(modified_files):
                    commit_message = f"Add feature: {feature_description}\n\nTask ID: {task_id}"
                    if self.git_manager.commit_changes(commit_message):
                        console.print("[green]Changes committed successfully.[/green]")
                    else:
                        console.print("[red]Failed to commit changes.[/red]")
                else:
                    console.print("[red]Failed to stage files for commit.[/red]")
```

### 10.2 Code Analysis Workflow

```python
# code_navigator/workflows/code_analysis.py
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
import typer
from typing import Dict, List, Optional
import os

from ..ai.client import AIClient
from ..ai.context import ContextManager
from ..ai.prompts import PromptTemplate
from ..indexer.dependency_graph import DependencyGraph

console = Console()

class CodeAnalysisWorkflow:
    def __init__(self, ai_client: AIClient, context_manager: ContextManager, code_index):
        self.ai_client = ai_client
        self.context_manager = context_manager
        self.code_index = code_index
        self.dependency_graph = DependencyGraph(code_index)
        self.prompt_template = PromptTemplate()
    
    def execute(self, analysis_query: str):
        """Execute the code analysis workflow."""
        console.print(Panel(f"Analyzing: {analysis_query}", title="🔍 Code Analysis"))
        
        # Step 1: Identify relevant files
        console.print("\n[bold]Identifying relevant files...[/bold]")
        relevant_files = self.context_manager.identify_relevant_files(analysis_query, max_files=8)
        
        if not relevant_files:
            console.print("[yellow]No relevant files found. Please provide more specific details.[/yellow]")
            return
        
        console.print(f"Found {len(relevant_files)} relevant files:")
        for file_path in relevant_files:
            console.print(f"  - {file_path}")
        
        # Step 2: Check if user wants to add or remove files
        modify_files = typer.confirm("Would you like to modify the list of files to analyze?")
        
        if modify_files:
            # Show all project files
            all_files = list(self.code_index.files.keys())
            all_files.sort()
            
            # Display files in chunks
            files_per_page = 20
            total_pages = (len(all_files) + files_per_page - 1) // files_per_page
            current_page = 0
            
            while True:
                console.clear()
                console.print("[bold]Available Files (Page {}/{})[/bold]".format(current_page + 1, total_pages))
                
                start_idx = current_page * files_per_page
                end_idx = min(start_idx + files_per_page, len(all_files))
                
                for i, file in enumerate(all_files[start_idx:end_idx], 1):
                    console.print(f"{i + start_idx}. {file}")
                
                console.print("\n[bold]Current Analysis Files:[/bold]")
                for i, file in enumerate(relevant_files, 1):
                    console.print(f"{i}. {file}")
                
                console.print("\nOptions:")
                console.print("a <number> - Add file by number")
                console.print("r <number> - Remove file from analysis list")
                console.print("n - Next page")
                console.print("p - Previous page")
                console.print("d - Done modifying")
                
                choice = typer.prompt("Enter choice")
                
                if choice.lower() == 'd':
                    break
                elif choice.lower() == 'n':
                    current_page = (current_page + 1) % total_pages
                elif choice.lower() == 'p':
                    current_page = (current_page - 1) % total_pages
                elif choice.lower().startswith('a '):
                    try:
                        idx = int(choice.split(' ')[1]) - 1
                        if 0 <= idx < len(all_files):
                            file_to_add = all_files[idx]
                            if file_to_add not in relevant_files:
                                # Read the file content
                                full_path = os.path.join(self.context_manager.project_path, file_to_add)
                                with open(full_path, 'r', encoding='utf-8') as f:
                                    content = f.read()
                                relevant_files[file_to_add] = content
                                console.print(f"[green]Added {file_to_add}[/green]")
                    except:
                        console.print("[red]Invalid input[/red]")
                elif choice.lower().startswith('r '):
                    try:
                        idx = int(choice.split(' ')[1]) - 1
                        if 0 <= idx < len(list(relevant_files.keys())):
                            file_to_remove = list(relevant_files.keys())[idx]
                            del relevant_files[file_to_remove]
                            console.print(f"[green]Removed {file_to_remove}[/green]")
                    except:
                        console.print("[red]Invalid input[/red]")
        
        # Step 3: Generate dependency graph visualization
        console.print("\n[bold]Generating dependency graph...[/bold]")
        try:
            graph_path = self.dependency_graph.visualize()
            console.print(f"[green]Dependency graph generated:[/green] {graph_path}")
        except Exception as e:
            console.print(f"[yellow]Failed to generate dependency graph: {e}[/yellow]")
        
        # Step 4: Perform code analysis
        console.print("\n[bold]Analyzing code...[/bold]")
        
        analysis_prompt = self.prompt_template.render(
            "code_analysis.txt",
            analysis_query=analysis_query,
            files=relevant_files
        )
        
        analysis = self.ai_client.get_completion(analysis_prompt)
        
        # Step 5: Display analysis results
        console.print("\n[bold]Analysis Results:[/bold]")
        console.print(Markdown(analysis))
        
        # Step 6: Save analysis to file if requested
        save_analysis = typer.confirm("Would you like to save this analysis to a file?")
        if save_analysis:
            filename = typer.prompt("Enter filename", default="code_analysis.md")
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"# Code Analysis: {analysis_query}\n\n")
                f.write(analysis)
            
            console.print(f"[green]Analysis saved to:[/green] {filename}")
        
        # Step 7: Ask follow-up questions if needed
        while True:
            follow_up = typer.confirm("Do you have a follow-up question about this code?")
            if not follow_up:
                break
            
            question = typer.prompt("What would you like to know?")
            
            follow_up_prompt = f"""
Based on our previous analysis of the code, I have a follow-up question:

{question}

Please provide a detailed answer based on the code we've been discussing.
            """
            
            follow_up_answer = self.ai_client.get_completion(follow_up_prompt)
            console.print(Markdown(follow_up_answer))
```

## Phase 11: Configuration & Error Handling

### 11.1 Configuration Management

```python
# code_navigator/config.py
import os
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class AIConfig(BaseModel):
    api_key: Optional[str] = Field(None, description="Claude API key")
    model: str = Field("claude-3-opus-20240229", description="AI model to use")
    temperature: float = Field(0.2, description="Temperature for AI generation")
    max_tokens: int = Field(4000, description="Maximum tokens for AI responses")

class ProjectConfig(BaseModel):
    ignore_patterns: list[str] = Field(
        default_factory=lambda: [".git", "node_modules", "venv", "__pycache__", ".vscode", "dist", "build"],
        description="Patterns to ignore when indexing the codebase"
    )
    default_language: str = Field("python", description="Default programming language")
    max_files_per_request: int = Field(8, description="Maximum files to include in a single AI request")

class GitConfig(BaseModel):
    auto_branch: bool = Field(True, description="Automatically create branches for tasks")
    auto_commit: bool = Field(False, description="Automatically commit changes")
    branch_prefix: str = Field("cn-", description="Prefix for branches created by CodeNavigator")

class AppConfig(BaseModel):
    ai: AIConfig = Field(default_factory=AIConfig)
    project: ProjectConfig = Field(default_factory=ProjectConfig)
    git: GitConfig = Field(default_factory=GitConfig)
    storage_dir: str = Field(
        default_factory=lambda: os.path.join(os.path.expanduser("~"), ".code-navigator"),
        description="Directory for storing CodeNavigator data"
    )

class ConfigManager:
    def __init__(self):
        self.config_dir = os.path.join(os.path.expanduser("~"), ".code-navigator")
        self.config_file = os.path.join(self.config_dir, "config.json")
        self.config = self._load_config()
    
    def _load_config(self) -> AppConfig:
        """Load configuration from file or create default."""
        os.makedirs(self.config_dir, exist_ok=True)
        
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, "r") as f:
                    config_data = json.load(f)
                    return AppConfig(**config_data)
            except Exception as e:
                print(f"Error loading config: {e}. Using defaults.")
                return AppConfig()
        else:
            # Create default config
            config = AppConfig()
            self._save_config(config)
            return config
    
    def _save_config(self, config: AppConfig):
        """Save configuration to file."""
        with open(self.config_file, "w") as f:
            json.dump(config.dict(), f, indent=2)
    
    def get_config(self) -> AppConfig:
        """Get the current configuration."""
        return self.config
    
    def update_config(self, **updates):
        """Update configuration with new values."""
        config_dict = self.config.dict()
        
        for key, value in updates.items():
            if "." in key:
                # Handle nested config keys like "ai.temperature"
                parts = key.split(".")
                section = config_dict
                for part in parts[:-1]:
                    if part not in section:
                        section[part] = {}
                    section = section[part]
                section[parts[-1]] = value
            else:
                config_dict[key] = value
        
        self.config = AppConfig(**config_dict)
        self._save_config(self.config)
    
    def get_api_key(self) -> Optional[str]:
        """Get the AI API key, checking environment variables first."""
        env_key = os.environ.get("ANTHROPIC_API_KEY")
        if env_key:
            return env_key
        return self.config.ai.api_key
```

### 11.2 Error Handling & Logging

```python
# code_navigator/utils/error_handling.py
import traceback
import logging
import sys
from typing import Callable, Any, Optional
from functools import wraps
from rich.console import Console

console = Console()
logger = logging.getLogger("code_navigator")

class CodeNavigatorError(Exception):
    """Base exception for all CodeNavigator errors."""
    pass

class AIError(CodeNavigatorError):
    """Errors related to AI interaction."""
    pass

class IndexingError(CodeNavigatorError):
    """Errors related to code indexing."""
    pass

class FileOperationError(CodeNavigatorError):
    """Errors related to file operations."""
    pass

class GitError(CodeNavigatorError):
    """Errors related to Git operations."""
    pass

def setup_logging(log_file: Optional[str] = None, log_level: int = logging.INFO):
    """Set up logging configuration."""
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            *([] if log_file is None else [logging.FileHandler(log_file)])
        ]
    )
    
    # Create CodeNavigator logger
    logger = logging.getLogger("code_navigator")
    logger.setLevel(log_level)
    
    return logger

def handle_errors(func: Callable) -> Callable:
    """Decorator to handle errors in a consistent way."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except AIError as e:
            console.print(f"[red]AI Error:[/red] {str(e)}")
            logger.error(f"AI Error: {str(e)}")
            logger.debug(traceback.format_exc())
        except IndexingError as e:
            console.print(f"[red]Indexing Error:[/red] {str(e)}")
            logger.error(f"Indexing Error: {str(e)}")
            logger.debug(traceback.format_exc())
        except FileOperationError as e:
            console.print(f"[red]File Operation Error:[/red] {str(e)}")
            logger.error(f"File Operation Error: {str(e)}")
            logger.debug(traceback.format_exc())
        except GitError as e:
            console.print(f"[red]Git Error:[/red] {str(e)}")
            logger.error(f"Git Error: {str(e)}")
            logger.debug(traceback.format_exc())
        except Exception as e:
            console.print(f"[red]Unexpected Error:[/red] {str(e)}")
            logger.error(f"Unexpected Error: {str(e)}")
            logger.debug(traceback.format_exc())
    
    return wrapper

def safe_execute(func: Callable, *args, default_return: Any = None, **kwargs) -> Any:
    """Safely execute a function, returning a default value on error."""
    try:
        return func(*args, **kwargs)
    except Exception as e:
        logger.error(f"Error executing {func.__name__}: {str(e)}")
        logger.debug(traceback.format_exc())
        return default_return
```

## Phase 12: Testing Framework

### 12.1 Unit Testing Setup

```python
# tests/test_indexer.py
import unittest
from unittest.mock import patch, MagicMock
import os
import tempfile
import shutil

from code_navigator.indexer.filesystem import get_project_structure
from code_navigator.indexer.parser import CodebaseIndex, CodeFile

class TestFileSystemCrawler(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for testing
        self.test_dir = tempfile.mkdtemp()
        
        # Create a simple project structure
        os.makedirs(os.path.join(self.test_dir, "src"))
        os.makedirs(os.path.join(self.test_dir, "tests"))
        os.makedirs(os.path.join(self.test_dir, ".git"))  # Should be ignored
        
        # Create some sample files
        with open(os.path.join(self.test_dir, "src", "main.py"), "w") as f:
            f.write("def main():\n    print('Hello, world!')\n")
        
        with open(os.path.join(self.test_dir, "src", "utils.py"), "w") as f:
            f.write("def helper():\n    return 42\n")
        
        with open(os.path.join(self.test_dir, "tests", "test_main.py"), "w") as f:
            f.write("def test_main():\n    assert True\n")
    
    def tearDown(self):
        # Clean up the temporary directory
        shutil.rmtree(self.test_dir)
    
    def test_get_project_structure(self):
        structure = get_project_structure(self.test_dir)
        
        # Check that the structure contains the expected directories
        self.assertIn("directories", structure)
        self.assertIn("src", structure["directories"])
        self.assertIn("tests", structure["directories"])
        
        # Check that .git directory is ignored
        self.assertNotIn(".git", structure["directories"])
        
        # Check that the structure contains the expected files
        self.assertIn("files", structure["directories"]["src"])
        self.assertEqual(len(structure["directories"]["src"]["files"]), 2)
        
        # Check file details
        files = [f["name"] for f in structure["directories"]["src"]["files"]]
        self.assertIn("main.py", files)
        self.assertIn("utils.py", files)

class TestCodeParser(unittest.TestCase):
    def test_parse_python_file(self):
        content = """
import os
from sys import path

def test_function(param1, param2=None):
    \"\"\"Test function docstring.\"\"\"
    return param1 + param2

class TestClass:
    def __init__(self):
        self.value = 42
    
    def method(self, x):
        return x * self.value
"""
        code_file = CodeFile("test.py", content)
        
        # Check imports
        self.assertIn(('os', ''), code_file.imports)
        self.assertIn(('', 'sys'), code_file.imports)
        
        # Check functions
        self.assertIn("test_function", code_file.functions)
        
        # Check classes
        self.assertIn("TestClass", code_file.classes)

# Add more test cases as needed

if __name__ == '__main__':
    unittest.main()
```

### 12.2 Integration Testing

```python
# tests/test_integration.py
import unittest
from unittest.mock import patch, MagicMock
import os
import tempfile
import shutil
import json

from code_navigator.app import CodeNavigatorApp
from code_navigator.config import ConfigManager

class TestAppIntegration(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for testing
        self.test_dir = tempfile.mkdtemp()
        
        # Create a simple project structure
        os.makedirs(os.path.join(self.test_dir, "src"))
        
        # Create some sample files
        with open(os.path.join(self.test_dir, "src", "main.py"), "w") as f:
            f.write("""
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

if __name__ == "__main__":
    print(add(10, 5))
    print(subtract(10, 5))
""")
        
        # Mock config
        self.mock_config = ConfigManager()
        self.mock_config.config.ai.api_key = "test-api-key"
    
    def tearDown(self):
        # Clean up the temporary directory
        shutil.rmtree(self.test_dir)
    
    @patch('code_navigator.ai.client.AIClient')
    def test_initialize(self, mock_ai_client):
        # Create a mock AI client
        mock_client = MagicMock()
        mock_ai_client.return_value = mock_client
        
        # Initialize the app
        app = CodeNavigatorApp(self.test_dir)
        result = app.initialize()
        
        # Check that initialization was successful
        self.assertTrue(result)
        self.assertTrue(app.initialized)
        
        # Check that the code index was built
        self.assertGreater(len(app.code_index.files), 0)
        self.assertIn("src/main.py", app.code_index.files)
        
        # Check that functions were indexed
        functions = app.code_index.function_map
        self.assertIn("add", functions)
        self.assertIn("subtract", functions)
    
    @patch('code_navigator.ai.client.AIClient')
    def test_analyze_code(self, mock_ai_client):
        # Create a mock AI client
        mock_client = MagicMock()
        mock_client.get_completion.return_value = "Mock analysis result"
        mock_ai_client.return_value = mock_client
        
        # Initialize the app
        app = CodeNavigatorApp(self.test_dir)
        app.initialize()
        
        # Mock context manager's identify_relevant_files to return our test file
        app.context_manager.identify_relevant_files = MagicMock()
        with open(os.path.join(self.test_dir, "src", "main.py"), "r") as f:
            content = f.read()
        app.context_manager.identify_relevant_files.return_value = {"src/main.py": content}
        
        # Call analyze_code
        app.analyze_code("How does the add function work?")
        
        # Check that the AI client was called with the right prompt
        mock_client.get_completion.assert_called_once()
        prompt = mock_client.get_completion.call_args[0][0]
        self.assertIn("How does the add function work?", prompt)

# Add more integration tests as needed

if __name__ == '__main__':
    unittest.main()
```

## Phase 13: User Experience Enhancements

### 13.1 Interactive CLI Interface

```python
# code_navigator/ui/cli_interface.py
import typer
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from rich.table import Table
from rich import box
from rich.progress import Progress, SpinnerColumn, TextColumn
import os
from typing import Dict, List, Optional

from ..config import ConfigManager

console = Console()
app = typer.Typer()

class CLIInterface:
    def __init__(self, app_instance):
        self.app = app_instance
        self.config = ConfigManager().get_config()
    
    def show_welcome(self):
        """Display a welcome message and basic info about the app."""
        console.print(Panel(
            "[bold blue]CodeNavigator[/bold blue] - AI-powered coding assistant\n\n"
            "Use the power of AI to navigate, understand, and improve your codebase.\n"
            "Type [bold]help[/bold] to see available commands.",
            title="Welcome",
            border_style="blue"
        ))
    
    def show_loading(self, message: str = "Working..."):
        """Show a loading spinner with a message."""
        return Progress(
            SpinnerColumn(),
            TextColumn("[bold blue]{task.description}[/bold blue]"),
            console=console
        ).add_task(description=message)
    
    def show_project_info(self):
        """Display information about the current project."""
        if not self.app.initialized:
            self.app.initialize()
        
        # Create a table for project info
        table = Table(title="Project Information", box=box.ROUNDED)
        table.add_column("Property", style="blue")
        table.add_column("Value")
        
        # Add project properties
        table.add_row("Project Path", self.app.project_path)
        table.add_row("Files Indexed", str(len(self.app.code_index.files)))
        
        # Count lines of code
        total_loc = 0
        language_loc = {}
        
        for file_path, code_file in self.app.code_index.files.items():
            lines = code_file.content.count('\n')
            total_loc += lines
            
            # Determine file language
            ext = file_path.split('.')[-1].lower()
            lang = {
                'py': 'Python',
                'js': 'JavaScript',
                'ts': 'TypeScript',
                'java': 'Java',
                'go': 'Go',
                'rb': 'Ruby',
                'php': 'PHP',
                'c': 'C',
                'cpp': 'C++',
                'h': 'C Header',
                'hpp': 'C++ Header',
                'html': 'HTML',
                'css': 'CSS',
                'md': 'Markdown',
            }.get(ext, 'Other')
            
            if lang not in language_loc:
                language_loc[lang] = 0
            language_loc[lang] += lines
        
        table.add_row("Total Lines of Code", str(total_loc))
        
        # Add Git info if available
        if self.app.git_manager.is_valid_repo():
            table.add_row("Git Repository", "Yes")
            table.add_row("Current Branch", self.app.git_manager.get_current_branch())
        else:
            table.add_row("Git Repository", "No")
        
        console.print(table)
        
        # Show language distribution
        if language_loc:
            lang_table = Table(title="Language Distribution", box=box.ROUNDED)
            lang_table.add_column("Language", style="blue")
            lang_table.add_column("Lines of Code")
            lang_table.add_column("Percentage")
            
            for lang, loc in sorted(language_loc.items(), key=lambda x: x[1], reverse=True):
                percentage = (loc / total_loc) * 100
                lang_table.add_row(lang, str(loc), f"{percentage:.1f}%")
            
            console.print(lang_table)
    
    def show_task_list(self):
        """Display a list of tasks."""
        tasks = self.app.task_manager.tasks
        
        if not tasks:
            console.print("[yellow]No tasks found.[/yellow]")
            return
        
        table = Table(title="Tasks", box=box.ROUNDED)
        table.add_column("ID", style="blue")
        table.add_column("Type")
        table.add_column("Description")
        table.add_column("Status")
        
        for task_id, task in tasks.items():
            # Determine status style
            status_style = {
                "planning": "yellow",
                "in_progress": "blue",
                "review": "magenta",
                "completed": "green"
            }.get(task.status, "white")
            
            table.add_row(
                task_id,
                task.type,
                task.description[:50] + ("..." if len(task.description) > 50 else ""),
                f"[{status_style}]{task.status}[/{status_style}]"
            )
        
        console.print(table)
    
    def interactive_search(self):
        """Interactive code search interface."""
        console.print(Panel(
            "Search your codebase for files, functions, classes, or code snippets.\n"
            "Type [bold]exit[/bold] to return to main menu.",
            title="Code Search",
            border_style="blue"
        ))
        
        while True:
            query = typer.prompt("🔍 Search")
            
            if query.lower() in ('exit', 'quit', 'q'):
                break
            
            if not query.strip():
                continue
            
            # Show loading spinner
            with Progress(
                SpinnerColumn(),
                TextColumn("[bold blue]Searching...[/bold blue]"),
                console=console
            ) as progress:
                task = progress.add_task("Searching...", total=1)
                
                # Perform search
                results = self.app.code_index.search_code(query)
                
                progress.update(task, completed=1)
            
            if not results:
                console.print("[yellow]No results found.[/yellow]")
                continue
            
            # Display results
            console.print(f"[green]Found {len(results)} files with matches:[/green]")
            
            # Ask which file to view
            for i, result in enumerate(results, 1):
                match_count = len(result["matches"])
                console.print(f"{i}. {result['file']} ({match_count} matches)")
            
            file_choice = typer.prompt(
                "Enter file number to view or press Enter to continue",
                default=""
            )
            
            if not file_choice.strip():
                continue
            
            try:
                file_idx = int(file_choice) - 1
                if 0 <= file_idx < len(results):
                    selected_file = results[file_idx]["file"]
                    matches = results[file_idx]["matches"]
                    
                    # Display file with matches highlighted
                    console.print(f"\n[bold]File: {selected_file}[/bold]")
                    
                    # Get the full file content
                    full_path = os.path.join(self.app.project_path, selected_file)
                    with open(full_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                    
                    # Determine which lines to display (context around matches)
                    highlight_lines = set()
                    for match in matches:
                        line_num = match["line_number"]
                        highlight_lines.add(line_num)
                    
                    # Print file with highlighted matches
                    for i, line in enumerate(lines, 1):
                        if i in highlight_lines:
                            console.print(f"[bold yellow]{i:4d}|[/bold yellow] {line}", end="")
                        else:
                            console.print(f"{i:4d}| {line}", end="")
            except:
                console.print("[red]Invalid selection.[/red]")
    
    def configure_settings(self):
        """Interactive configuration interface."""
        console.print(Panel(
            "Configure CodeNavigator settings.\n"
            "Current settings are shown below.",
            title="Configuration",
            border_style="blue"
        ))
        
        config_manager = ConfigManager()
        config = config_manager.get_config()
        
        # Display current settings
        table = Table(title="Current Settings", box=box.ROUNDED)
        table.add_column("Setting", style="blue")
        table.add_column("Value")
        
        # AI settings
        table.add_row("AI Model", config.ai.model)
        table.add_row("AI Temperature", str(config.ai.temperature))
        table.add_row("Max Tokens", str(config.ai.max_tokens))
        
        # Project settings
        table.add_row("Ignore Patterns", ", ".join(config.project.ignore_patterns))
        table.add_row("Max Files Per Request", str(config.project.max_files_per_request))
        
        # Git settings
        table.add_row("Auto Branch", str(config.git.auto_branch))
        table.add_row("Auto Commit", str(config.git.auto_commit))
        table.add_row("Branch Prefix", config.git.branch_prefix)
        
        console.print(table)
        
        # Ask which setting to change
        console.print("\nWhich setting would you like to change?")
        console.print("1. AI Model")
        console.print("2. AI Temperature")
        console.print("3. Max Tokens")
        console.print("4. Ignore Patterns")
        console.print("5. Max Files Per Request")
        console.print("6. Auto Branch")
        console.print("7. Auto Commit")
        console.print("8. Branch Prefix")
        console.print("9. API Key")
        console.print("0. Exit")
        
        choice = typer.prompt("Enter choice", default="0")
        
        try:
            choice_num = int(choice)
            
            if choice_num == 0:
                return
            elif choice_num == 1:
                models = ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"]
                for i, model in enumerate(models, 1):
                    console.print(f"{i}. {model}")
                model_choice = typer.prompt("Select model", default="1")
                try:
                    model_idx = int(model_choice) - 1
                    if 0 <= model_idx < len(models):
                        config_manager.update_config(**{"ai.model": models[model_idx]})
                        console.print(f"[green]Updated AI model to {models[model_idx]}[/green]")
                except:
                    console.print("[red]Invalid selection.[/red]")
            elif choice_num == 2:
                temp = typer.prompt("Enter temperature (0.0-1.0)", default=str(config.ai.temperature))
                try:
                    temp_float = float(temp)
                    if 0 <= temp_float <= 1:
                        config_manager.update_config(**{"ai.temperature": temp_float})
                        console.print(f"[green]Updated temperature to {temp_float}[/green]")
                    else:
                        console.print("[red]Temperature must be between 0 and 1.[/red]")
                except:
                    console.print("[red]Invalid temperature value.[/red]")
            elif choice_num == 3:
                tokens = typer.prompt("Enter max tokens", default=str(config.ai.max_tokens))
                try:
                    tokens_int = int(tokens)
                    if tokens_int > 0:
                        config_manager.update_config(**{"ai.max_tokens": tokens_int})
                        console.print(f"[green]Updated max tokens to {tokens_int}[/green]")
                    else:
                        console.print("[red]Max tokens must be positive.[/red]")
                except:
                    console.print("[red]Invalid token value.[/red]")
            elif choice_num == 4:
                patterns = typer.prompt("Enter ignore patterns (comma-separated)", default=",".join(config.project.ignore_patterns))
                pattern_list = [p.strip() for p in patterns.split(",") if p.strip()]
                config_manager.update_config(**{"project.ignore_patterns": pattern_list})
                console.print(f"[green]Updated ignore patterns[/green]")
            elif choice_num == 5:
                max_files = typer.prompt("Enter max files per request", default=str(config.project.max_files_per_request))
                try:
                    max_files_int = int(max_files)
                    if max_files_int > 0:
                        config_manager.update_config(**{"project.max_files_per_request": max_files_int})
                        console.print(f"[green]Updated max files to {max_files_int}[/green]")
                    else:
                        console.print("[red]Max files must be positive.[/red]")
                except:
                    console.print("[red]Invalid value.[/red]")
            elif choice_num == 6:
                auto_branch = typer.prompt("Enable auto branch (yes/no)", default="yes" if config.git.auto_branch else "no")
                config_manager.update_config(**{"git.auto_branch": auto_branch.lower() in ("yes", "y", "true")})
                console.print(f"[green]Updated auto branch setting[/green]")
            elif choice_num == 7:
                auto_commit = typer.prompt("Enable auto commit (yes/no)", default="yes" if config.git.auto_commit else "no")
                config_manager.update_config(**{"git.auto_commit": auto_commit.lower() in ("yes", "y", "true")})
                console.print(f"[green]Updated auto commit setting[/green]")
            elif choice_num == 8:
                prefix = typer.prompt("Enter branch prefix", default=config.git.branch_prefix)
                config_manager.update_config(**{"git.branch_prefix": prefix})
                console.print(f"[green]Updated branch prefix to '{prefix}'[/green]")
            elif choice_num == 9:
                api_key = typer.prompt("Enter API key (leave empty to use environment variable)", default="", hide_input=True)
                if api_key.strip():
                    config_manager.update_config(**{"ai.api_key": api_key})
                    console.print(f"[green]Updated API key[/green]")
                else:
                    config_manager.update_config(**{"ai.api_key": None})
                    console.print(f"[green]Cleared API key (will use environment variable)[/green]")
        except:
            console.print("[red]Invalid choice.[/red]")
```

### 13.2 Interactive Main Menu

```python
# code_navigator/__main__.py (updated with interactive mode)
import os
import typer
from rich.console import Console
from rich.prompt import Prompt
from .app import CodeNavigatorApp
from .ui.cli_interface import CLIInterface

app = typer.Typer()
console = Console()

# Global app instance
navigator_app = None

@app.command()
def interactive(project_path: str = typer.Option(".", help="Path to the project directory")):
    """Start an interactive session with CodeNavigator."""
    global navigator_app
    navigator_app = CodeNavigatorApp(project_path)
    cli = CLIInterface(navigator_app)
    
    cli.show_welcome()
    
    # Initialize the app
    with console.status("[bold blue]Initializing CodeNavigator...[/bold blue]"):
        navigator_app.initialize()
    
    # Main menu loop
    while True:
        console.print("\n[bold]CodeNavigator[/bold] - Main Menu")
        console.print("1. Analyze Code")
        console.print("2. Fix Bug")
        console.print("3. Add Feature")
        console.print("4. Search Codebase")
        console.print("5. Project Information")
        console.print("6. Task List")
        console.print("7. Configuration")
        console.print("0. Exit")
        
        choice = Prompt.ask("Enter your choice", default="0")
        
        try:
            choice_num = int(choice)
            
            if choice_num == 0:
                console.print("[bold blue]Goodbye![/bold blue]")
                break
            elif choice_num == 1:
                query = Prompt.ask("What would you like to understand about the codebase?")
                navigator_app.analyze_code(query)
            elif choice_num == 2:
                description = Prompt.ask("Describe the bug you'd like to fix")
                navigator_app.fix_bug(description)
            elif choice_num == 3:
                feature = Prompt.ask("Describe the feature you'd like to add")
                navigator_app.add_feature(feature)
            elif choice_num == 4:
                cli.interactive_search()
            elif choice_num == 5:
                cli.show_project_info()
            elif choice_num == 6:
                cli.show_task_list()
            elif choice_num == 7:
                cli.configure_settings()
            else:
                console.print("[red]Invalid choice. Please try again.[/red]")
        except ValueError:
            console.print("[red]Invalid input. Please enter a number.[/red]")

# Keep existing command-line commands
@app.callback(invoke_without_command=True)
def callback(ctx: typer.Context, project_path: str = typer.Option(".", help="Path to the project directory")):
    """
    CodeNavigator: An AI-powered coding assistant for complex codebases.
    """
    global navigator_app
    
    # Only initialize if a subcommand is called
    if ctx.invoked_subcommand is not None:
        navigator_app = CodeNavigatorApp(project_path)

@app.command()
def init():
    """Initialize CodeNavigator for your project."""
    global navigator_app
    if navigator_app.initialize():
        console.print("[green]Successfully initialized CodeNavigator![/green]")
    else:
        console.print("[red]Failed to initialize CodeNavigator.[/red]")

@app.command()
def fix(description: str):
    """Diagnose and fix a bug in your codebase."""
    global navigator_app
    navigator_app.fix_bug(description)

@app.command()
def analyze(query: str):
    """Analyze your codebase based on a specific question or task."""
    global navigator_app
    navigator_app.analyze_code(query)

@app.command()
def search(query: str):
    """Search for specific code elements across your codebase."""
    global navigator_app
    if not navigator_app.initialized:
        navigator_app.initialize()
    
    results = navigator_app.code_index.search_code(query)
    
    if not results:
        console.print("[yellow]No results found for your query.[/yellow]")
        return
    
    console.print(f"[green]Found {len(results)} files with matches:[/green]")
    
    for result in results:
        console.print(f"\n[bold]{result['file']}[/bold]")
        for match in result['matches'][:5]:  # Show first 5 matches per file
            console.print(f"  Line {match['line_number']}: {match['content']}")
        
        if len(result['matches']) > 5:
            console.print(f"  [dim]...and {len(result['matches']) - 5} more matches[/dim]")

if __name__ == "__main__":
    app()
```

## Phase 14: Documentation & User Guide

### 14.1 Full README.md

```markdown
# CodeNavigator: AI-Powered Coding Assistant

CodeNavigator is an intelligent CLI tool that helps developers navigate, understand, and improve complex codebases with the power of AI. It functions similarly to Claude Code, Codex, or Aider, but with a specialized focus on deep code comprehension and surgical code changes.

![CodeNavigator Demo](docs/demo.gif)

## Features

- **Codebase Indexing**: Automatically scans and indexes your entire codebase for quick reference
- **Code Understanding**: Analyzes how components interact and generate architectural overviews
- **Bug Fixing**: Diagnoses bugs, identifies their root causes, and implements precise fixes
- **Feature Addition**: Plans and implements new features with minimal disruption
- **Code Analysis**: Answers specific questions about how your code works
- **Git Integration**: Creates branches, commits changes, and tracks modifications
- **Interactive Mode**: User-friendly CLI interface for exploring and modifying your code

## Installation

```bash
# Using pip
pip install code-navigator

# Or with Poetry
git clone https://github.com/yourusername/code-navigator.git
cd code-navigator
poetry install
```

## Quick Start

Set your Claude API key:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

Initialize CodeNavigator in your project:

```bash
# Initialize in the current directory
codenav init

# Or specify a project path
codenav --project-path /path/to/your/project init
```

### Interactive Mode

Start an interactive session for the full experience:

```bash
codenav interactive
```

### Command-Line Mode

Use specific commands for targeted tasks:

```bash
# Analyze your code
codenav analyze "How does the user authentication flow work?"

# Fix a bug
codenav fix "Login fails when user enters special characters in username"

# Add a feature
codenav add "Add dark mode support to the UI"

# Search your codebase
codenav search "authenticate_user"
```

## How It Works

CodeNavigator follows a systematic approach to understanding and modifying your code:

1. **Project Onboarding & Indexing**: Maps your codebase structure, identifies key components, and builds a mental model of the system.

2. **Task Intake & Diagnostic Process**: Clarifies requirements, systematically diagnoses issues, and assesses potential impacts.

3. **Solution Architecture & Trade-Off Analysis**: Develops multiple solution approaches, evaluates them against key criteria, and recommends the optimal approach.

4. **Implementation Planning & Execution**: Creates a detailed implementation roadmap, provides file-specific change plans, and guides you through the execution.

5. **Testing & Validation Strategy**: Designs comprehensive tests, ensures regression prevention, and validates the changes.

## Configuration

Configure CodeNavigator through the interactive interface or by editing the config file at `~/.code-navigator/config.json`:

```json
{
  "ai": {
    "model": "claude-3-opus-20240229",
    "temperature": 0.2,
    "max_tokens": 4000
  },
  "project": {
    "ignore_patterns": [".git", "node_modules", "venv", "__pycache__", ".vscode"],
    "max_files_per_request": 8
  },
  "git": {
    "auto_branch": true,
    "auto_commit": false,
    "branch_prefix": "cn-"
  }
}
```

## Requirements

- Python 3.10+
- Claude API key
- Git (optional, for version control integration)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

### 14.2 Developer Guide

```markdown
# CodeNavigator Developer Guide

This guide is intended for developers who want to understand, modify, or contribute to the CodeNavigator codebase.

## Project Structure

```
code_navigator/
├── __init__.py
├── __main__.py          # Entry point and CLI commands
├── app.py               # Main application class
├── config.py            # Configuration management
├── ai/                  # AI integration
│   ├── __init__.py
│   ├── client.py        # Claude API client
│   ├── context.py       # Context management
│   ├── conversation.py  # Conversation history
│   ├── prompts.py       # Prompt templates
│   └── templates/       # Prompt template files
├── indexer/             # Code indexing and parsing
│   ├── __init__.py
│   ├── filesystem.py    # File system crawler
│   ├── parser.py        # Code parser
│   ├── language_parsers.py # Language-specific parsers
│   └── dependency_graph.py # Dependency analysis
├── utils/               # Utility functions
│   ├── __init__.py
│   ├── file_operations.py # File manipulation utilities
│   ├── git_integration.py # Git operations
│   └── error_handling.py  # Error handling and logging
├── workflows/           # Core application workflows
│   ├── __init__.py
│   ├── task_manager.py  # Task tracking and management
│   ├── bug_fix.py       # Bug fixing workflow
│   ├── feature_add.py   # Feature addition workflow
│   └── code_analysis.py # Code analysis workflow
└── ui/                  # User interface components
    ├── __init__.py
    └── cli_interface.py # Interactive CLI interface
```

## Core Components

### 1. Application Core

The `app.py` file contains the main `CodeNavigatorApp` class that orchestrates all other components. It's responsible for:

- Initializing the codebase index
- Managing workflows
- Coordinating between different components

### 2. Indexer

The indexer module is responsible for analyzing and understanding the codebase structure:

- `filesystem.py`: Scans the file system to build a representation of the project structure
- `parser.py`: Parses code files to extract functions, classes, imports, etc.
- `language_parsers.py`: Language-specific parsing using Tree-sitter
- `dependency_graph.py`: Builds a graph of dependencies between files and components

### 3. AI Integration

The AI module handles all interactions with the Claude API:

- `client.py`: Manages API requests and responses
- `context.py`: Determines which files to include in AI requests
- `conversation.py`: Tracks conversation history
- `prompts.py`: Manages prompt templates for different tasks

### 4. Workflows

Workflows implement specific user-facing tasks:

- `task_manager.py`: Tracks and manages tasks
- `bug_fix.py`: Implements the bug fixing workflow
- `feature_add.py`: Implements the feature addition workflow
- `code_analysis.py`: Implements the code analysis workflow

### 5. Utilities

Utility modules provide helper functions for various tasks:

- `file_operations.py`: File manipulation utilities
- `git_integration.py`: Git operations
- `error_handling.py`: Error handling and logging

### 6. User Interface

The UI module provides the user-facing interface:

- `cli_interface.py`: Interactive CLI interface

## Development Workflow

### Setting Up the Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/code-navigator.git
   cd code-navigator
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies with Poetry:
   ```bash
   pip install poetry
   poetry install
   ```

4. Set up pre-commit hooks:
   ```bash
   pre-commit install
   ```

### Running Tests

Run the test suite:

```bash
pytest
```

Run tests with coverage:

```bash
pytest --cov=code_navigator
```

### Adding a New Feature

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Implement your feature, following these guidelines:
   - Add tests for new functionality
   - Update documentation
   - Follow the existing code style

3. Run the tests to ensure everything works:
   ```bash
   pytest
   ```

4. Submit a pull request

## Design Principles

CodeNavigator follows these core design principles:

1. **Surgical Precision**: Make minimal necessary changes to achieve objectives.

2. **Deep Understanding**: Focus on comprehensively understanding code before making changes.

3. **User Control**: Always give users final say on any changes to their codebase.

4. **Transparent Reasoning**: Clearly explain the rationale behind all suggestions.

5. **Defensive Implementation**: Anticipate edge cases and handle errors gracefully.

## Extending CodeNavigator

### Adding Support for a New Language

To add support for a new programming language:

1. Update `language_parsers.py` to include the new language
2. Add language-specific parsing logic
3. Update the file extension detection in relevant places

### Adding a New Workflow

To add a new workflow:

1. Create a new file in the `workflows` directory
2. Implement a class for your workflow
3. Add the workflow to the main application in `app.py`
4. Add CLI commands for the workflow in `__main__.py`

### Modifying AI Prompts

To modify the AI prompts:

1. Update or add templates in the `ai/templates` directory
2. Register new templates in `prompts.py` if needed

## Troubleshooting

### Common Issues

- **API Key Issues**: Ensure your Claude API key is set correctly in the environment or config file
- **Parsing Errors**: Check language-specific parsers for compatibility issues
- **Memory Usage**: Large codebases may require chunking or pagination

### Debugging

Use the built-in logging for debugging:

```python
import logging
logger = logging.getLogger("code_navigator")
logger.debug("Debug message")
```

Set the log level in your environment:

```bash
export CODE_NAVIGATOR_LOG_LEVEL=DEBUG
```
```

## Phase 15: Final Integration & Refinement

### 15.1 Main Application Updates

```python
# code_navigator/app.py (updated with all workflows)
import os
import typer
from typing import Dict, List, Optional
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown

from .ai.client import AIClient
from .ai.context import ContextManager
from .ai.conversation import ConversationManager
from .indexer.parser import CodebaseIndex
from .indexer.filesystem import get_project_structure
from .indexer.dependency_graph import DependencyGraph
from .workflows.task_manager import TaskManager, TaskType
from .workflows.bug_fix import BugFixWorkflow
from .workflows.feature_add import FeatureAddWorkflow
from .workflows.code_analysis import CodeAnalysisWorkflow
from .utils.git_integration import GitManager
from .utils.error_handling import handle_errors, setup_logging
from .config import ConfigManager

console = Console()
logger = setup_logging()

class CodeNavigatorApp:
    def __init__(self, project_path: str):
        self.project_path = os.path.abspath(project_path)
        
        # Load configuration
        self.config_manager = ConfigManager()
        self.config = self.config_manager.get_config()
        
        # Initialize components
        self.ai_client = AIClient()
        self.code_index = CodebaseIndex(self.project_path)
        self.context_manager = ContextManager(self.project_path, self.code_index)
        self.conversation_manager = ConversationManager()
        self.task_manager = TaskManager()
        self.git_manager = GitManager(self.project_path)
        self.dependency_graph = DependencyGraph(self.code_index)
        
        # Initialize workflows
        self.bug_fix_workflow = BugFixWorkflow(
            self.ai_client, 
            self.context_manager,
            self.task_manager,
            self.git_manager
        )
        
        self.feature_add_workflow = FeatureAddWorkflow(
            self.ai_client, 
            self.context_manager,
            self.task_manager,
            self.git_manager
        )
        
        self.code_analysis_workflow = CodeAnalysisWorkflow(
            self.ai_client,
            self.context_manager,
            self.code_index
        )
        
        # State
        self.initialized = False
    
    @handle_errors
    def initialize(self):
        """Initialize the application by indexing the codebase."""
        if self.initialized:
            return True
        
        try:
            console.print(Panel("Building codebase index...", title="🔍 Indexing"))
            
            # Check if this is a git repository
            if self.git_manager.is_valid_repo():
                console.print(f"[green]Git repository detected:[/green] {self.git_manager.get_current_branch()}")
            else:
                console.print("[yellow]Not a git repository. Some features may be limited.[/yellow]")
            
            # Get project structure
            structure = get_project_structure(self.project_path)
            
            # Build code index
            self.code_index.build_index()
            
            # Build dependency graph
            self.dependency_graph.build_graph()
            
            file_count = len(self.code_index.files)
            console.print(f"[green]Indexed {file_count} code files successfully.[/green]")
            
            self.initialized = True
            return True
        
        except Exception as e:
            logger.error(f"Error initializing CodeNavigator: {e}")
            console.print(f"[red]Error initializing CodeNavigator: {e}[/red]")
            return False
    
    @handle_errors
    def fix_bug(self, bug_description: str):
        """Execute the bug fix workflow."""
        if not self.initialized and not self.initialize():
            console.print("[red]Failed to initialize. Please check the project path.[/red]")
            return
        
        self.bug_fix_workflow.execute(bug_description)
    
    @handle_errors
    def add_feature(self, feature_description: str):
        """Execute the feature addition workflow."""
        if not self.initialized and not self.initialize():
            console.print("[red]Failed to initialize. Please check the project path.[/red]")
            return
        
        self.feature_add_workflow.execute(feature_description)
    
    @handle_errors
    def analyze_code(self, query: str):
        """Analyze the codebase based on a query."""
        if not self.initialized and not self.initialize():
            console.print("[red]Failed to initialize. Please check the project path.[/red]")
            return
        
        self.code_analysis_workflow.execute(query)
    
    @handle_errors
    def search_code(self, query: str):
        """Search for code matching the query."""
        if not self.initialized and not self.initialize():
            console.print("[red]Failed to initialize. Please check the project path.[/red]")
            return
        
        results = self.code_index.search_code(query)
        
        if not results:
            console.print("[yellow]No results found for your query.[/yellow]")
            return results
        
        console.print(f"[green]Found {len(results)} files with matches:[/green]")
        
        for result in results:
            console.print(f"\n[bold]{result['file']}[/bold]")
            for match in result['matches'][:5]:  # Show first 5 matches per file
                console.print(f"  Line {match['line_number']}: {match['content']}")
            
            if len(result['matches']) > 5:
                console.print(f"  [dim]...and {len(result['matches']) - 5} more matches[/dim]")
        
        return results
    
    @handle_errors
    def get_task(self, task_id: str):
        """Get details for a specific task."""
        task = self.task_manager.get_task(task_id)
        
        if not task:
            console.print(f"[yellow]Task {task_id} not found.[/yellow]")
            return None
        
        console.print(Panel(
            f"[bold]Type:[/bold] {task.type}\n"
            f"[bold]Description:[/bold] {task.description}\n"
            f"[bold]Status:[/bold] {task.status}\n"
            f"[bold]Affected Files:[/bold] {', '.join(task.affected_files) if task.affected_files else 'None'}\n",
            title=f"Task {task_id}",
            border_style="blue"
        ))
        
        if task.plan and "text" in task.plan:
            console.print("\n[bold]Implementation Plan:[/bold]")
            console.print(Markdown(task.plan["text"]))
        
        if task.implementation and "text" in task.implementation:
            console.print("\n[bold]Implementation Details:[/bold]")
            console.print(Markdown(task.implementation["text"]))
        
        return task
    
    @handle_errors
    def visualize_dependencies(self, file_path: Optional[str] = None):
        """Visualize code dependencies."""
        if not self.initialized and not self.initialize():
            console.print("[red]Failed to initialize. Please check the project path.[/red]")
            return
        
        if file_path:
            # Visualize dependencies for a specific file
            if file_path in self.code_index.files:
                # Get direct dependencies
                dependencies = self.dependency_graph.get_dependencies(file_path)
                dependents = self.dependency_graph.get_dependents(file_path)
                
                console.print(f"[bold]Dependencies for {file_path}:[/bold]")
                
                if dependencies:
                    console.print("\n[bold]Files this file depends on:[/bold]")
                    for dep in dependencies:
                        console.print(f"  - {dep}")
                else:
                    console.print("  No dependencies found.")
                
                if dependents:
                    console.print("\n[bold]Files that depend on this file:[/bold]")
                    for dep in dependents:
                        console.print(f"  - {dep}")
                else:
                    console.print("  No dependents found.")
                
                # Get affected files (ripple effect)
                affected = self.dependency_graph.get_affected_files(file_path)
                
                if affected:
                    console.print("\n[bold]Files potentially affected by changes to this file:[/bold]")
                    for dep in affected:
                        console.print(f"  - {dep}")
            else:
                console.print(f"[yellow]File {file_path} not found in the codebase.[/yellow]")
        else:
            # Visualize entire dependency graph
            try:
                graph_path = self.dependency_graph.visualize()
                console.print(f"[green]Dependency graph generated:[/green] {graph_path}")
            except Exception as e:
                logger.error(f"Error generating dependency graph: {e}")
                console.print(f"[red]Error generating dependency graph: {e}[/red]")
```

### 15.2 Package Setup Script

```python
# setup.py
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="code-navigator",
    version="0.1.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="AI-powered CLI coding assistant for complex codebases",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/code-navigator",
    packages=find_packages(),
    include_package_data=True,
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 4 - Beta",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Software Development :: Code Generators",
        "Topic :: Software Development :: Documentation",
    ],
    python_requires=">=3.10",
    install_requires=[
        "typer>=0.9.0",
        "rich>=13.6.0",
        "anthropic>=0.5.0",
        "gitpython>=3.1.40",
        "tree-sitter>=0.20.1",
        "pydantic>=2.4.2",
        "watchdog>=3.0.0",
        "networkx>=3.1",
        "matplotlib>=3.7.0",
        "jinja2>=3.1.2",
    ],
    entry_points={
        "console_scripts": [
            "codenav=code_navigator.__main__:app",
        ],
    },
)
```

# Improved Implementation Plan for CodeNavigator

After reviewing the initial plan, I've identified several areas for improvement to make CodeNavigator even more powerful and user-friendly. Here's an enhanced plan that addresses these areas:

## Key Improvements

1. **More sophisticated code understanding**
   - Added tree-sitter integration for precise code parsing
   - Implemented dependency graph visualization
   - Added language-specific parsing for major languages

2. **Enhanced AI integration**
   - Implemented templating system for flexible prompt engineering
   - Added conversation history management
   - Improved context selection with relevance scoring

3. **Better developer experience**
   - Added interactive CLI with rich formatting
   - Implemented comprehensive configuration system
   - Added robust error handling and logging

4. **Advanced workflows**
   - More comprehensive feature addition workflow
   - Advanced code analysis with visual dependency graphs
   - Integration with Git for branching and committing

5. **Production-ready infrastructure**
   - Added comprehensive testing framework
   - Improved documentation
   - Added proper packaging and distribution

## Development Strategy for Junior Developers

For junior developers implementing this project, I recommend:

1. **Start with core functionality**: Begin with the basic CLI structure and file indexing before adding AI integration.

2. **Implement incrementally**: Add one workflow at a time, starting with code analysis, then bug fixing, and finally feature addition.

3. **Use test-driven development**: Write tests for each component before implementing it.

4. **Leverage existing libraries**: Use established libraries like tree-sitter for parsing rather than building everything from scratch.

5. **Set up proper error handling early**: Implement the error handling framework early to make debugging easier.

6. **Implement the MVP first**: Start with a minimum viable product that includes basic indexing and AI integration, then add advanced features.

## Extended Timeline

1. **Week 1: Foundation & Indexing**
   - Basic project structure and CLI
   - File system crawler
   - Simple code parsing with regex
   - Configuration management

2. **Week 2: AI Integration & Basic Workflows**
   - Claude API integration
   - Context management
   - Basic code analysis workflow
   - Simple search functionality

3. **Week 3: Advanced Code Understanding**
   - Tree-sitter integration
   - Dependency graph building
   - Language-specific parsing
   - Advanced code analysis

4. **Week 4: Core Workflows**
   - Bug fix workflow
   - Feature addition workflow
   - Task management
   - Git integration

5. **Week 5: User Experience & Testing**
   - Interactive CLI interface
   - Rich formatting and visualization
   - Unit and integration testing
   - Error handling and logging

6. **Week 6: Documentation & Refinement**
   - Comprehensive documentation
   - Packaging and distribution
   - Performance optimization
   - Final polishing

By following this improved plan, junior developers will be able to build a powerful, user-friendly AI coding assistant that can effectively leverage the capabilities of Claude and provide significant value to developers working with complex codebases.

---
I've now completed all 15 phases of the implementation plan for the CodeNavigator project. Let me verify that all critical components have been covered:

## Phase 16: Extension Points & API Documentation

This final phase focuses on making CodeNavigator extensible for developers who want to build upon its capabilities.

### 16.1 Plugin System

```python
# code_navigator/extensions/plugin_manager.py
import importlib
import inspect
import os
import pkgutil
from typing import Dict, List, Type, Optional
import logging

from .base_plugin import BasePlugin

logger = logging.getLogger("code_navigator")

class PluginManager:
    """Manages the loading and execution of plugins."""
    
    def __init__(self, plugin_dir: Optional[str] = None):
        self.plugins: Dict[str, BasePlugin] = {}
        self.plugin_dir = plugin_dir
        
        # Default plugin directories
        self.plugin_dirs = [
            # Built-in plugins
            os.path.join(os.path.dirname(os.path.dirname(__file__)), "plugins"),
            
            # User-defined plugins
            os.path.join(os.path.expanduser("~"), ".code-navigator", "plugins")
        ]
        
        # Add custom plugin directory if provided
        if plugin_dir:
            self.plugin_dirs.append(plugin_dir)
    
    def discover_plugins(self):
        """Discover and load all available plugins."""
        for plugin_dir in self.plugin_dirs:
            if not os.path.exists(plugin_dir):
                continue
                
            for _, name, ispkg in pkgutil.iter_modules([plugin_dir]):
                if not ispkg:
                    module_name = f"code_navigator_plugin_{name}"
                    try:
                        # Import the module
                        spec = importlib.util.spec_from_file_location(
                            module_name, 
                            os.path.join(plugin_dir, f"{name}.py")
                        )
                        module = importlib.util.module_from_spec(spec)
                        spec.loader.exec_module(module)
                        
                        # Find plugin classes
                        for item_name, item in inspect.getmembers(module, inspect.isclass):
                            if (issubclass(item, BasePlugin) and 
                                item is not BasePlugin and 
                                getattr(item, "enabled", True)):
                                
                                plugin_instance = item()
                                self.plugins[plugin_instance.name] = plugin_instance
                                logger.info(f"Loaded plugin: {plugin_instance.name}")
                    
                    except Exception as e:
                        logger.error(f"Error loading plugin {name}: {e}")
    
    def get_plugin(self, name: str) -> Optional[BasePlugin]:
        """Get a plugin by name."""
        return self.plugins.get(name)
    
    def get_all_plugins(self) -> List[BasePlugin]:
        """Get all loaded plugins."""
        return list(self.plugins.values())
    
    def hook_pre_analysis(self, query: str, context: Dict) -> str:
        """Execute pre-analysis hooks from all plugins."""
        modified_query = query
        
        for plugin in self.plugins.values():
            if hasattr(plugin, "pre_analysis"):
                try:
                    modified_query = plugin.pre_analysis(modified_query, context)
                except Exception as e:
                    logger.error(f"Error in plugin {plugin.name} pre_analysis: {e}")
        
        return modified_query
    
    def hook_post_analysis(self, analysis_result: str, context: Dict) -> str:
        """Execute post-analysis hooks from all plugins."""
        modified_result = analysis_result
        
        for plugin in self.plugins.values():
            if hasattr(plugin, "post_analysis"):
                try:
                    modified_result = plugin.post_analysis(modified_result, context)
                except Exception as e:
                    logger.error(f"Error in plugin {plugin.name} post_analysis: {e}")
        
        return modified_result
    
    # Add similar hooks for other workflows
    def hook_pre_bug_fix(self, bug_description: str, context: Dict) -> str:
        """Execute pre-bug-fix hooks from all plugins."""
        modified_description = bug_description
        
        for plugin in self.plugins.values():
            if hasattr(plugin, "pre_bug_fix"):
                try:
                    modified_description = plugin.pre_bug_fix(modified_description, context)
                except Exception as e:
                    logger.error(f"Error in plugin {plugin.name} pre_bug_fix: {e}")
        
        return modified_description
    
    def hook_post_bug_fix(self, fix_result: Dict, context: Dict) -> Dict:
        """Execute post-bug-fix hooks from all plugins."""
        modified_result = fix_result
        
        for plugin in self.plugins.values():
            if hasattr(plugin, "post_bug_fix"):
                try:
                    modified_result = plugin.post_bug_fix(modified_result, context)
                except Exception as e:
                    logger.error(f"Error in plugin {plugin.name} post_bug_fix: {e}")
        
        return modified_result
```

### 16.2 Base Plugin Interface

```python
# code_navigator/extensions/base_plugin.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BasePlugin(ABC):
    """Base class for all CodeNavigator plugins."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """The name of the plugin."""
        pass
    
    @property
    @abstractmethod
    def version(self) -> str:
        """The version of the plugin."""
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """Description of what the plugin does."""
        pass
    
    @property
    def enabled(self) -> bool:
        """Whether the plugin is enabled by default."""
        return True
    
    def initialize(self, app) -> bool:
        """Initialize the plugin with the application instance."""
        return True
    
    def pre_analysis(self, query: str, context: Dict) -> str:
        """Hook called before code analysis."""
        return query
    
    def post_analysis(self, analysis_result: str, context: Dict) -> str:
        """Hook called after code analysis."""
        return analysis_result
    
    def pre_bug_fix(self, bug_description: str, context: Dict) -> str:
        """Hook called before bug fixing."""
        return bug_description
    
    def post_bug_fix(self, fix_result: Dict, context: Dict) -> Dict:
        """Hook called after bug fixing."""
        return fix_result
    
    def pre_feature_add(self, feature_description: str, context: Dict) -> str:
        """Hook called before feature addition."""
        return feature_description
    
    def post_feature_add(self, feature_result: Dict, context: Dict) -> Dict:
        """Hook called after feature addition."""
        return feature_result
    
    def get_commands(self) -> Dict[str, callable]:
        """Get custom commands provided by this plugin."""
        return {}
    
    def cleanup(self):
        """Clean up resources when the plugin is disabled or the app exits."""
        pass
```

### 16.3 Example Plugin

```python
# ~/.code-navigator/plugins/metrics_plugin.py
from code_navigator.extensions.base_plugin import BasePlugin
from typing import Dict, Any
import time
import json
import os

class MetricsPlugin(BasePlugin):
    """Plugin that collects metrics on CodeNavigator usage."""
    
    @property
    def name(self) -> str:
        return "metrics"
    
    @property
    def version(self) -> str:
        return "0.1.0"
    
    @property
    def description(self) -> str:
        return "Collects usage metrics for CodeNavigator operations"
    
    def __init__(self):
        self.metrics_file = os.path.join(
            os.path.expanduser("~"), 
            ".code-navigator", 
            "metrics.json"
        )
        self.metrics = self._load_metrics()
        self.operation_start_times = {}
    
    def _load_metrics(self) -> Dict:
        """Load existing metrics from file."""
        if os.path.exists(self.metrics_file):
            try:
                with open(self.metrics_file, "r") as f:
                    return json.load(f)
            except Exception:
                return self._initialize_metrics()
        else:
            return self._initialize_metrics()
    
    def _initialize_metrics(self) -> Dict:
        """Initialize empty metrics structure."""
        return {
            "operations": {
                "analysis": {"count": 0, "avg_time": 0, "total_time": 0},
                "bug_fix": {"count": 0, "avg_time": 0, "total_time": 0},
                "feature_add": {"count": 0, "avg_time": 0, "total_time": 0},
                "search": {"count": 0, "avg_time": 0, "total_time": 0}
            },
            "files_analyzed": 0,
            "ai_requests": 0,
            "started_at": time.time()
        }
    
    def _save_metrics(self):
        """Save metrics to file."""
        os.makedirs(os.path.dirname(self.metrics_file), exist_ok=True)
        with open(self.metrics_file, "w") as f:
            json.dump(self.metrics, f, indent=2)
    
    def pre_analysis(self, query: str, context: Dict) -> str:
        """Track when analysis starts."""
        self.operation_start_times["analysis"] = time.time()
        return query
    
    def post_analysis(self, analysis_result: str, context: Dict) -> str:
        """Record analysis metrics."""
        if "analysis" in self.operation_start_times:
            elapsed_time = time.time() - self.operation_start_times["analysis"]
            
            # Update metrics
            op_metrics = self.metrics["operations"]["analysis"]
            op_metrics["count"] += 1
            op_metrics["total_time"] += elapsed_time
            op_metrics["avg_time"] = op_metrics["total_time"] / op_metrics["count"]
            
            # Count files analyzed
            if "files" in context:
                self.metrics["files_analyzed"] += len(context["files"])
            
            # Count AI requests
            self.metrics["ai_requests"] += 1
            
            # Save updated metrics
            self._save_metrics()
        
        return analysis_result
    
    def pre_bug_fix(self, bug_description: str, context: Dict) -> str:
        """Track when bug fix starts."""
        self.operation_start_times["bug_fix"] = time.time()
        return bug_description
    
    def post_bug_fix(self, fix_result: Dict, context: Dict) -> Dict:
        """Record bug fix metrics."""
        if "bug_fix" in self.operation_start_times:
            elapsed_time = time.time() - self.operation_start_times["bug_fix"]
            
            # Update metrics
            op_metrics = self.metrics["operations"]["bug_fix"]
            op_metrics["count"] += 1
            op_metrics["total_time"] += elapsed_time
            op_metrics["avg_time"] = op_metrics["total_time"] / op_metrics["count"]
            
            # Count files analyzed and AI requests
            if "files" in context:
                self.metrics["files_analyzed"] += len(context["files"])
            self.metrics["ai_requests"] += context.get("ai_requests", 1)
            
            # Save updated metrics
            self._save_metrics()
        
        return fix_result
    
    def get_commands(self) -> Dict[str, callable]:
        """Add a command to view metrics."""
        return {
            "metrics": self.show_metrics
        }
    
    def show_metrics(self, args=None):
        """Display collected metrics."""
        from rich.console import Console
        from rich.table import Table
        
        console = Console()
        
        # Create metrics table
        table = Table(title="CodeNavigator Usage Metrics")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        
        # Add rows for each metric
        runtime = time.time() - self.metrics["started_at"]
        runtime_str = f"{runtime / 86400:.1f} days" if runtime > 86400 else f"{runtime / 3600:.1f} hours"
        
        table.add_row("Runtime", runtime_str)
        table.add_row("Total AI Requests", str(self.metrics["ai_requests"]))
        table.add_row("Files Analyzed", str(self.metrics["files_analyzed"]))
        
        # Operation metrics
        for op_name, op_data in self.metrics["operations"].items():
            if op_data["count"] > 0:
                table.add_row(
                    f"{op_name.replace('_', ' ').title()} Operations", 
                    str(op_data["count"])
                )
                table.add_row(
                    f"Avg {op_name.replace('_', ' ').title()} Time", 
                    f"{op_data['avg_time']:.2f} seconds"
                )
        
        console.print(table)
    
    def cleanup(self):
        """Save metrics when the plugin is disabled."""
        self._save_metrics()
```

### 16.4 API Documentation

```python
# code_navigator/api.py
"""
CodeNavigator API for programmatic usage and extension.

This module provides a stable API for interacting with CodeNavigator
from external applications, scripts, or plugins.
"""

from typing import Dict, List, Optional, Any
import os

from .app import CodeNavigatorApp
from .indexer.parser import CodebaseIndex
from .utils.error_handling import handle_errors, CodeNavigatorError

class CodeNavigatorAPI:
    """Public API for CodeNavigator."""
    
    def __init__(self, project_path: str = "."):
        """
        Initialize the CodeNavigator API.
        
        Args:
            project_path: Path to the project directory
        """
        self.app = CodeNavigatorApp(project_path)
    
    @handle_errors
    def initialize(self) -> bool:
        """
        Initialize CodeNavigator for the specified project.
        
        Returns:
            bool: True if initialization was successful
        """
        return self.app.initialize()
    
    @handle_errors
    def analyze_code(self, query: str) -> str:
        """
        Analyze the codebase based on a query.
        
        Args:
            query: Question or request about the codebase
            
        Returns:
            str: Analysis result
        """
        return self.app.analyze_code(query)
    
    @handle_errors
    def fix_bug(self, bug_description: str) -> Dict:
        """
        Diagnose and fix a bug in the codebase.
        
        Args:
            bug_description: Description of the bug
            
        Returns:
            Dict: Bug fix result
        """
        return self.app.fix_bug(bug_description)
    
    @handle_errors
    def add_feature(self, feature_description: str) -> Dict:
        """
        Plan and implement a new feature.
        
        Args:
            feature_description: Description of the feature
            
        Returns:
            Dict: Feature implementation result
        """
        return self.app.add_feature(feature_description)
    
    @handle_errors
    def search_code(self, query: str) -> List[Dict]:
        """
        Search the codebase for a query.
        
        Args:
            query: Search query
            
        Returns:
            List[Dict]: Search results
        """
        return self.app.search_code(query)
    
    @handle_errors
    def get_file_content(self, file_path: str) -> Optional[str]:
        """
        Get the content of a file in the codebase.
        
        Args:
            file_path: Path to the file (relative to project root)
            
        Returns:
            Optional[str]: File content or None if file not found
        """
        full_path = os.path.join(self.app.project_path, file_path)
        if os.path.exists(full_path) and os.path.isfile(full_path):
            with open(full_path, "r", encoding="utf-8") as f:
                return f.read()
        return None
    
    @handle_errors
    def get_code_structure(self) -> Dict:
        """
        Get the structure of the codebase.
        
        Returns:
            Dict: Codebase structure
        """
        if not self.app.initialized:
            self.app.initialize()
        
        return {
            "files": list(self.app.code_index.files.keys()),
            "functions": self.app.code_index.function_map,
            "classes": self.app.code_index.class_map,
            "imports": self.app.code_index.import_map
        }
    
    @handle_errors
    def get_file_dependencies(self, file_path: str) -> Dict:
        """
        Get dependencies for a specific file.
        
        Args:
            file_path: Path to the file (relative to project root)
            
        Returns:
            Dict: Dependencies information
        """
        if not self.app.initialized:
            self.app.initialize()
        
        return {
            "dependencies": self.app.dependency_graph.get_dependencies(file_path),
            "dependents": self.app.dependency_graph.get_dependents(file_path),
            "affected_files": list(self.app.dependency_graph.get_affected_files(file_path))
        }
    
    @handle_errors
    def modify_file(self, file_path: str, new_content: str) -> bool:
        """
        Modify a file in the codebase.
        
        Args:
            file_path: Path to the file (relative to project root)
            new_content: New content for the file
            
        Returns:
            bool: True if modification was successful
        """
        full_path = os.path.join(self.app.project_path, file_path)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        try:
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            return True
        except Exception as e:
            raise CodeNavigatorError(f"Failed to modify file {file_path}: {e}")
    
    @handle_errors
    def commit_changes(self, message: str, files: List[str]) -> bool:
        """
        Commit changes to the repository.
        
        Args:
            message: Commit message
            files: List of files to commit
            
        Returns:
            bool: True if commit was successful
        """
        if not self.app.git_manager.is_valid_repo():
            raise CodeNavigatorError("Not a git repository")
        
        if self.app.git_manager.stage_files(files):
            return self.app.git_manager.commit_changes(message)
        
        return False
```

### 16.5 IDE Integration Support

```python
# code_navigator/integrations/vscode.py
"""
VSCode extension support for CodeNavigator.

This module provides helpers for integrating CodeNavigator with VSCode.
"""

import json
import os
import subprocess
from typing import Dict, List, Optional, Any

class VSCodeIntegration:
    """Integration with VSCode."""
    
    def __init__(self, api):
        """Initialize the VSCode integration."""
        self.api = api
    
    def generate_extension(self, output_dir: str) -> str:
        """
        Generate a VSCode extension for CodeNavigator.
        
        Args:
            output_dir: Directory to output the extension
            
        Returns:
            str: Path to the generated extension
        """
        # Create extension directory structure
        extension_dir = os.path.join(output_dir, "code-navigator-vscode")
        os.makedirs(extension_dir, exist_ok=True)
        
        # Create basic extension files
        self._create_package_json(extension_dir)
        self._create_extension_js(extension_dir)
        self._create_extension_html(extension_dir)
        
        # Create README
        with open(os.path.join(extension_dir, "README.md"), "w") as f:
            f.write("""# CodeNavigator for VSCode

AI-powered code understanding and transformation directly in your editor.

## Features

- Analyze your code with natural language queries
- Fix bugs with surgical precision
- Add features with minimal disruption
- Navigate complex codebases with ease

## Requirements

- CodeNavigator CLI installed (`pip install code-navigator`)
- Claude API key

## Usage

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "CodeNavigator" to see available commands
""")
        
        return extension_dir
    
    def _create_package_json(self, extension_dir: str):
        """Create package.json for the extension."""
        package_json = {
            "name": "code-navigator-vscode",
            "displayName": "CodeNavigator",
            "description": "AI-powered code understanding and transformation",
            "version": "0.1.0",
            "engines": {
                "vscode": "^1.60.0"
            },
            "categories": [
                "Other"
            ],
            "activationEvents": [
                "onCommand:code-navigator.analyze",
                "onCommand:code-navigator.fixBug",
                "onCommand:code-navigator.addFeature",
                "onCommand:code-navigator.search"
            ],
            "main": "./extension.js",
            "contributes": {
                "commands": [
                    {
                        "command": "code-navigator.analyze",
                        "title": "CodeNavigator: Analyze Code"
                    },
                    {
                        "command": "code-navigator.fixBug",
                        "title": "CodeNavigator: Fix Bug"
                    },
                    {
                        "command": "code-navigator.addFeature",
                        "title": "CodeNavigator: Add Feature"
                    },
                    {
                        "command": "code-navigator.search",
                        "title": "CodeNavigator: Search Code"
                    }
                ]
            },
            "scripts": {
                "vscode:prepublish": "npm run compile",
                "compile": "tsc -p ./",
                "watch": "tsc -watch -p ./"
            },
            "devDependencies": {
                "@types/node": "^16.11.7",
                "@types/vscode": "^1.60.0",
                "typescript": "^4.5.5"
            }
        }
        
        with open(os.path.join(extension_dir, "package.json"), "w") as f:
            json.dump(package_json, f, indent=2)
    
    def _create_extension_js(self, extension_dir: str):
        """Create extension.js for the extension."""
        extension_js = """const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('CodeNavigator extension is now active!');

    // Register analyze command
    let analyzeDisposable = vscode.commands.registerCommand('code-navigator.analyze', async function () {
        const query = await vscode.window.showInputBox({
            placeHolder: "What would you like to understand about the code?",
            prompt: "CodeNavigator Analysis"
        });
        
        if (query) {
            const panel = vscode.window.createWebviewPanel(
                'codeNavigatorAnalysis',
                'CodeNavigator Analysis',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );
            
            panel.webview.html = getLoadingHtml();
            
            const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            
            exec(`codenav --project-path "${workspacePath}" analyze "${query}" --json`, (error, stdout, stderr) => {
                if (error) {
                    panel.webview.html = getErrorHtml(error.message);
                    return;
                }
                
                try {
                    const result = JSON.parse(stdout);
                    panel.webview.html = getAnalysisResultHtml(result, query);
                } catch (e) {
                    panel.webview.html = getErrorHtml("Failed to parse result: " + e.message);
                }
            });
        }
    });

    // Register fix bug command
    let fixBugDisposable = vscode.commands.registerCommand('code-navigator.fixBug', async function () {
        const description = await vscode.window.showInputBox({
            placeHolder: "Describe the bug you want to fix",
            prompt: "CodeNavigator Bug Fix"
        });
        
        if (description) {
            vscode.window.showInformationMessage(`Starting bug fix for: ${description}`);
            
            const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            
            const terminal = vscode.window.createTerminal('CodeNavigator');
            terminal.show();
            terminal.sendText(`codenav --project-path "${workspacePath}" fix "${description}"`);
        }
    });

    // Register add feature command
    let addFeatureDisposable = vscode.commands.registerCommand('code-navigator.addFeature', async function () {
        const description = await vscode.window.showInputBox({
            placeHolder: "Describe the feature you want to add",
            prompt: "CodeNavigator Feature Addition"
        });
        
        if (description) {
            vscode.window.showInformationMessage(`Planning feature: ${description}`);
            
            const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            
            const terminal = vscode.window.createTerminal('CodeNavigator');
            terminal.show();
            terminal.sendText(`codenav --project-path "${workspacePath}" add "${description}"`);
        }
    });

    // Register search command
    let searchDisposable = vscode.commands.registerCommand('code-navigator.search', async function () {
        const query = await vscode.window.showInputBox({
            placeHolder: "Enter search query",
            prompt: "CodeNavigator Search"
        });
        
        if (query) {
            const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            
            exec(`codenav --project-path "${workspacePath}" search "${query}" --json`, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Search failed: ${error.message}`);
                    return;
                }
                
                try {
                    const results = JSON.parse(stdout);
                    
                    if (results.length === 0) {
                        vscode.window.showInformationMessage('No results found');
                        return;
                    }
                    
                    // Show results in quick pick
                    const items = [];
                    
                    for (const result of results) {
                        for (const match of result.matches) {
                            items.push({
                                label: `${result.file}:${match.line_number}`,
                                description: match.content,
                                detail: `Line ${match.line_number}: ${match.content}`,
                                result: result,
                                match: match
                            });
                        }
                    }
                    
                    vscode.window.showQuickPick(items, {
                        placeHolder: 'Select a match'
                    }).then(selected => {
                        if (selected) {
                            const filePath = path.join(workspacePath, selected.result.file);
                            vscode.workspace.openTextDocument(filePath).then(doc => {
                                vscode.window.showTextDocument(doc).then(editor => {
                                    // Go to line
                                    const line = selected.match.line_number - 1;
                                    const position = new vscode.Position(line, 0);
                                    editor.selection = new vscode.Selection(position, position);
                                    editor.revealRange(
                                        new vscode.Range(position, position),
                                        vscode.TextEditorRevealType.InCenter
                                    );
                                });
                            });
                        }
                    });
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to parse results: ${e.message}`);
                }
            });
        }
    });

    context.subscriptions.push(analyzeDisposable);
    context.subscriptions.push(fixBugDisposable);
    context.subscriptions.push(addFeatureDisposable);
    context.subscriptions.push(searchDisposable);
}

function getLoadingHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeNavigator Analysis</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 2s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <h2>Analyzing code...</h2>
    <div class="loader"></div>
    <p>CodeNavigator is analyzing your codebase. This may take a moment.</p>
</body>
</html>`;
}

function getErrorHtml(error) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeNavigator Error</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .error { color: red; background-color: #ffeeee; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h2>Error</h2>
    <div class="error">${error}</div>
</body>
</html>`;
}

function getAnalysisResultHtml(result, query) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeNavigator Analysis</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
        h2 { color: #444; margin-top: 20px; }
        pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        code { font-family: 'Courier New', monospace; }
        .query { background-color: #e6f7ff; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>CodeNavigator Analysis</h1>
    <div class="query">
        <strong>Query:</strong> ${query}
    </div>
    <div id="analysis">
        ${result.html || result.text || JSON.stringify(result, null, 2)}
    </div>
</body>
</html>`;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
"""
        
        with open(os.path.join(extension_dir, "extension.js"), "w") as f:
            f.write(extension_js)
    
    def _create_extension_html(self, extension_dir: str):
        """Create HTML template files for the extension."""
        os.makedirs(os.path.join(extension_dir, "templates"), exist_ok=True)
        
        # Create sample template
        with open(os.path.join(extension_dir, "templates", "analysis.html"), "w") as f:
            f.write("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeNavigator Analysis</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
        h2 { color: #444; margin-top: 20px; }
        pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        code { font-family: 'Courier New', monospace; }
        .query { background-color: #e6f7ff; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .file { margin-top: 15px; }
        .file-header { background-color: #eee; padding: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; }
        .file-content { margin: 0; border: 1px solid #eee; border-top: none; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; }
    </style>
</head>
<body>
    <h1>CodeNavigator Analysis</h1>
    <div class="query">
        <strong>Query:</strong> {{query}}
    </div>
    <div id="analysis">
        {{analysis}}
    </div>
</body>
</html>""")
```

Now that I've completed all phases of the implementation plan, including the extension points for plugin support and IDE integration, let me provide a final summary of the CodeNavigator project's status:

## Final Status: Complete Implementation Plan

The CodeNavigator project is now fully designed with a comprehensive implementation plan covering all aspects needed to build a production-ready AI-powered coding assistant. The plan includes:

1. **Core Architecture**: A modular design with clean separation of concerns
2. **Code Indexing & Understanding**: Sophisticated code parsing and analysis
3. **AI Integration**: Optimized Claude integration with context management
4. **Workflow Implementation**: Bug fixing, feature addition, and code analysis
5. **UX/UI**: Interactive CLI with rich formatting
6. **Infrastructure**: Configuration, error handling, and logging
7. **Testing**: Unit and integration testing frameworks
8. **Documentation**: User and developer documentation
9. **Extensibility**: Plugin system and API for third-party integration
10. **IDE Integration**: VSCode extension support

The implementation is designed to be accessible for junior developers while providing a solid foundation for building a sophisticated tool. The code is well-commented, modular, and follows best practices for maintainability and extensibility.

The enhanced README provides a compelling introduction to the project for potential users and contributors, clearly communicating the value proposition and capabilities of CodeNavigator.

This project represents a complete blueprint for building an AI-powered coding assistant that can transform how developers interact with complex codebases, making it easier to understand, maintain, and enhance code with the power of Claude AI.

---
I've now completed the entire implementation plan for CodeNavigator, covering all 15 phases from initial setup through final integration. The plan provides a comprehensive roadmap for building a sophisticated AI-powered coding assistant that can transform how developers interact with complex codebases.

## Summary of Accomplishments

### 1. Comprehensive Architecture & Implementation Plan
- Designed a modular, extensible architecture for CodeNavigator
- Created detailed implementation plans for all core components
- Provided working code examples for each module and feature
- Developed a sophisticated system that integrates Claude's capabilities with code analysis

### 2. Advanced Code Understanding Features
- Implemented tree-sitter integration for precise code parsing
- Created a dependency graph visualization system
- Designed language-specific parsers for major programming languages
- Built a sophisticated indexing system that understands code semantics

### 3. Intelligent AI Integration
- Developed a context management system that provides relevant code to Claude
- Created a templating system for effective prompt engineering
- Implemented conversation history tracking for coherent interactions
- Built an AI client that optimally leverages Claude's capabilities

### 4. Powerful Developer Workflows
- Designed comprehensive workflows for bug fixing, feature addition, and code analysis
- Implemented Git integration for version control
- Created a task management system for tracking progress
- Built interactive interfaces for all major operations

### 5. Professional-Grade Project Infrastructure
- Provided comprehensive testing frameworks
- Implemented robust error handling and logging
- Created detailed documentation for users and contributors
- Designed a configuration system for customization
- Set up proper packaging and distribution

### 6. Enhanced User Experience
- Designed an interactive CLI with rich formatting
- Created visualization tools for code understanding
- Implemented user-friendly workflows for common tasks
- Built a comprehensive configuration interface

The completed CodeNavigator implementation plan represents a production-ready blueprint for building a powerful AI coding assistant. It addresses the unique challenges of working with complex codebases and leverages Claude's capabilities to provide developers with deep insights and precise code transformations.

A junior developer following this plan would be able to build a sophisticated tool that could significantly enhance productivity and code quality for individual developers and teams working on complex projects.

The enhanced README.md showcases the project's capabilities and value proposition, setting the stage for community engagement and adoption once implemented.


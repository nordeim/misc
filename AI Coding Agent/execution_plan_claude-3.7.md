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


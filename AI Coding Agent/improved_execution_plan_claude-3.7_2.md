Ultra-Advanced CodeNavigator: A Next-Generation AI Coding Assistant
After deeper consideration, I'll present a significantly more advanced architecture for CodeNavigator that transforms it from a simple assistant to an intelligent coding partner with deep code understanding and sophisticated reasoning capabilities.

Revolutionary Architecture Overview

Core Components (Enhanced Version)
┌──────────────────────────────────────────────────────────────────┐
│                       KNOWLEDGE ENGINE                           │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌───────────────┐ ┌────────────────────────┐ │
│ │  Semantic Code │ │ Code Evolution│ │   Architectural        │ │
│ │  Understanding │ │   Tracker     │ │   Pattern Recognition  │ │
│ └────────────────┘ └───────────────┘ └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                    AI ORCHESTRATION LAYER                        │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌───────────────┐ ┌────────────────────────┐ │
│ │  Agent Router  │ │ Specialist    │ │ Chain-of-Thought       │ │
│ │                │ │ Agent Pool    │ │ Reasoning Engine       │ │
│ └────────────────┘ └───────────────┘ └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                  ADAPTIVE CONTEXT MANAGEMENT                     │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌───────────────┐ ┌────────────────────────┐ │
│ │ Semantic       │ │ Conversation  │ │ Multi-Level            │ │
│ │ Chunking       │ │ Memory        │ │ Summarization          │ │
│ └────────────────┘ └───────────────┘ └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                   CODE CHANGE MANAGEMENT                         │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌───────────────┐ ┌────────────────────────┐ │
│ │ Smart Diff     │ │ Test          │ │ Refactoring            │ │
│ │ Engine         │ │ Generator     │ │ Safety Analyzer        │ │
│ └────────────────┘ └───────────────┘ └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────────┐
│                     INTERFACE LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌───────────────┐ ┌────────────────────────┐ │
│ │ CLI Interface  │ │ Editor        │ │ Interactive Web        │ │
│ │                │ │ Integration   │ │ Dashboard              │ │
│ └────────────────┘ └───────────────┘ └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
Breakthrough Features
1. Semantic Knowledge Engine
The heart of our enhanced system is a sophisticated Knowledge Engine that builds a deep semantic understanding of codebases.

# core/knowledge/semantic_graph.py
from dataclasses import dataclass, field
from typing import Dict, List, Set, Optional, Any, Tuple
from pathlib import Path
import networkx as nx
import ast
import re

@dataclass
class SemanticNode:
    """Represents a semantic entity in the code."""
    id: str
    type: str  # 'function', 'class', 'variable', 'module', etc.
    name: str
    file_path: str
    start_line: int
    end_line: int
    properties: Dict[str, Any] = field(default_factory=dict)
    
@dataclass
class SemanticEdge:
    """Represents a relationship between semantic entities."""
    source_id: str
    target_id: str
    type: str  # 'calls', 'imports', 'inherits', 'references', etc.
    properties: Dict[str, Any] = field(default_factory=dict)

class SemanticCodeGraph:
    """A semantic graph representation of the codebase."""
    
    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.nodes: Dict[str, SemanticNode] = {}
        self.file_nodes: Dict[str, str] = {}  # Maps file paths to node IDs
        
    def add_node(self, node: SemanticNode) -> None:
        """Add a node to the semantic graph."""
        self.nodes[node.id] = node
        self.graph.add_node(
            node.id, 
            type=node.type, 
            name=node.name,
            file=node.file_path,
            **node.properties
        )
        
        # If this is a file node, store the mapping
        if node.type == 'file':
            self.file_nodes[node.file_path] = node.id
            
    def add_edge(self, edge: SemanticEdge) -> None:
        """Add an edge to the semantic graph."""
        self.graph.add_edge(
            edge.source_id,
            edge.target_id,
            type=edge.type,
            **edge.properties
        )
        
    def get_related_nodes(self, node_id: str, relationship_types: Optional[List[str]] = None) -> List[str]:
        """Get nodes related to the given node with optional relationship filtering."""
        if node_id not in self.graph:
            return []
            
        related_nodes = []
        
        # Check outgoing edges
        for _, target, data in self.graph.out_edges(node_id, data=True):
            if relationship_types is None or data['type'] in relationship_types:
                related_nodes.append(target)
                
        # Check incoming edges
        for source, _, data in self.graph.in_edges(node_id, data=True):
            if relationship_types is None or data['type'] in relationship_types:
                related_nodes.append(source)
                
        return related_nodes
        
    def find_nodes_by_name(self, name_pattern: str, node_types: Optional[List[str]] = None) -> List[str]:
        """Find nodes matching the given name pattern and optional types."""
        matching_nodes = []
        
        for node_id, data in self.graph.nodes(data=True):
            if re.search(name_pattern, data['name']):
                if node_types is None or data['type'] in node_types:
                    matching_nodes.append(node_id)
                    
        return matching_nodes
        
    def get_subgraph_for_context(self, central_nodes: List[str], max_distance: int = 2) -> nx.MultiDiGraph:
        """Get a subgraph centered around the given nodes up to max_distance away."""
        # Start with the central nodes
        nodes_to_include = set(central_nodes)
        
        # For each distance level
        for _ in range(max_distance):
            # Get all neighboring nodes
            neighbors = set()
            for node in nodes_to_include:
                neighbors.update(self.get_related_nodes(node))
                
            # Add to our set
            nodes_to_include.update(neighbors)
            
        # Extract the subgraph
        return self.graph.subgraph(nodes_to_include)
        
    def compute_centrality(self) -> Dict[str, float]:
        """Compute centrality scores for nodes to identify important code entities."""
        return nx.betweenness_centrality(self.graph)

# core/knowledge/code_analyzer.py
import ast
import os
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple, Any
import networkx as nx
import re

from .semantic_graph import SemanticCodeGraph, SemanticNode, SemanticEdge

class AdvancedCodeAnalyzer:
    """Performs deep code analysis to build the semantic graph."""
    
    def __init__(self):
        self.semantic_graph = SemanticCodeGraph()
        self.current_file = None
        self.current_scope = []
        self.node_counter = 0
        
    def analyze_codebase(self, root_path: Path) -> SemanticCodeGraph:
        """Analyze the entire codebase and build a semantic graph."""
        # First pass: Create file nodes and basic structure
        for root, dirs, files in os.walk(root_path):
            for file in files:
                if self._is_analyzable_file(file):
                    file_path = Path(root) / file
                    self._analyze_file(file_path, root_path)
                    
        # Second pass: Resolve cross-file references
        self._resolve_references()
        
        return self.semantic_graph
        
    def _is_analyzable_file(self, filename: str) -> bool:
        """Determine if a file should be analyzed based on extension."""
        analyzable_extensions = ['.py', '.js', '.ts', '.java', '.c', '.cpp', '.go', '.rb']
        return any(filename.endswith(ext) for ext in analyzable_extensions)
        
    def _analyze_file(self, file_path: Path, root_path: Path) -> None:
        """Analyze a single file and add its nodes to the semantic graph."""
        relative_path = str(file_path.relative_to(root_path))
        self.current_file = relative_path
        
        # Create a node for the file itself
        file_node_id = self._create_node_id()
        file_node = SemanticNode(
            id=file_node_id,
            type='file',
            name=relative_path,
            file_path=relative_path,
            start_line=0,
            end_line=0,
            properties={
                'language': self._detect_language(file_path),
                'size': file_path.stat().st_size
            }
        )
        self.semantic_graph.add_node(file_node)
        
        # Parse and analyze the file content
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            if file_path.suffix == '.py':
                self._analyze_python_file(content, file_node_id)
            # Add handlers for other languages here
        except Exception as e:
            print(f"Error analyzing {file_path}: {str(e)}")
            
    def _analyze_python_file(self, content: str, file_node_id: str) -> None:
        """Analyze Python file and build semantic nodes and edges."""
        try:
            tree = ast.parse(content)
            
            # Push file node as the current scope
            self.current_scope.append(file_node_id)
            
            # Visit all nodes
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    self._process_class_def(node)
                elif isinstance(node, ast.FunctionDef):
                    self._process_function_def(node)
                elif isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                    self._process_import(node)
                # Add more node types as needed
                
            # Pop the file scope
            self.current_scope.pop()
        except SyntaxError:
            # Handle syntax errors gracefully
            pass
            
    def _process_class_def(self, node: ast.ClassDef) -> str:
        """Process a class definition and add it to the semantic graph."""
        class_node_id = self._create_node_id()
        
        # Create class node
        class_node = SemanticNode(
            id=class_node_id,
            type='class',
            name=node.name,
            file_path=self.current_file,
            start_line=node.lineno,
            end_line=node.end_lineno if hasattr(node, 'end_lineno') else node.lineno,
            properties={
                'docstring': ast.get_docstring(node),
                'bases': [base.id if isinstance(base, ast.Name) else 'unknown' for base in node.bases]
            }
        )
        self.semantic_graph.add_node(class_node)
        
        # Create edge from current scope to class
        parent_id = self.current_scope[-1]
        self.semantic_graph.add_edge(SemanticEdge(
            source_id=parent_id,
            target_id=class_node_id,
            type='contains'
        ))
        
        # Add inheritance edges
        for base in node.bases:
            if isinstance(base, ast.Name):
                # We'll store the base name and resolve the reference in the second pass
                self.semantic_graph.add_edge(SemanticEdge(
                    source_id=class_node_id,
                    target_id=base.id,  # This is just a placeholder
                    type='inherits',
                    properties={'base_name': base.id}
                ))
                
        # Process class contents
        self.current_scope.append(class_node_id)
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                self._process_function_def(item, is_method=True)
            # Process other class body items
            
        self.current_scope.pop()
        
        return class_node_id
        
    def _process_function_def(self, node: ast.FunctionDef, is_method: bool = False) -> str:
        """Process a function definition and add it to the semantic graph."""
        func_node_id = self._create_node_id()
        
        # Extract parameters
        params = []
        for arg in node.args.args:
            params.append(arg.arg)
            
        # Create function node
        func_node = SemanticNode(
            id=func_node_id,
            type='method' if is_method else 'function',
            name=node.name,
            file_path=self.current_file,
            start_line=node.lineno,
            end_line=node.end_lineno if hasattr(node, 'end_lineno') else node.lineno,
            properties={
                'docstring': ast.get_docstring(node),
                'parameters': params,
                'returns': self._extract_return_annotation(node)
            }
        )
        self.semantic_graph.add_node(func_node)
        
        # Create edge from current scope to function
        parent_id = self.current_scope[-1]
        self.semantic_graph.add_edge(SemanticEdge(
            source_id=parent_id,
            target_id=func_node_id,
            type='contains'
        ))
        
        # Process function body to find calls, etc.
        self.current_scope.append(func_node_id)
        # TODO: Extract function calls, variable references, etc.
        self.current_scope.pop()
        
        return func_node_id
        
    def _process_import(self, node: ast.AST) -> None:
        """Process import statements and add them to the semantic graph."""
        parent_id = self.current_scope[-1]
        
        if isinstance(node, ast.Import):
            for name in node.names:
                import_node_id = self._create_node_id()
                import_node = SemanticNode(
                    id=import_node_id,
                    type='import',
                    name=name.name,
                    file_path=self.current_file,
                    start_line=node.lineno,
                    end_line=node.lineno,
                    properties={
                        'alias': name.asname
                    }
                )
                self.semantic_graph.add_node(import_node)
                
                self.semantic_graph.add_edge(SemanticEdge(
                    source_id=parent_id,
                    target_id=import_node_id,
                    type='imports'
                ))
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ''
            for name in node.names:
                import_node_id = self._create_node_id()
                import_node = SemanticNode(
                    id=import_node_id,
                    type='import',
                    name=f"{module}.{name.name}",
                    file_path=self.current_file,
                    start_line=node.lineno,
                    end_line=node.lineno,
                    properties={
                        'alias': name.asname,
                        'module': module
                    }
                )
                self.semantic_graph.add_node(import_node)
                
                self.semantic_graph.add_edge(SemanticEdge(
                    source_id=parent_id,
                    target_id=import_node_id,
                    type='imports'
                ))
                
    def _resolve_references(self) -> None:
        """Resolve cross-file references in a second pass."""
        # This would resolve inheritance, function calls, etc.
        # Placeholder for now
        pass
        
    def _create_node_id(self) -> str:
        """Generate a unique node ID."""
        self.node_counter += 1
        return f"node_{self.node_counter}"
        
    def _detect_language(self, file_path: Path) -> str:
        """Detect the programming language of a file."""
        extensions = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.java': 'java',
            '.c': 'c',
            '.cpp': 'cpp',
            '.go': 'go',
            '.rb': 'ruby'
        }
        return extensions.get(file_path.suffix, 'unknown')
        
    def _extract_return_annotation(self, node: ast.FunctionDef) -> Optional[str]:
        """Extract return type annotation if available."""
        if node.returns:
            if isinstance(node.returns, ast.Name):
                return node.returns.id
            elif isinstance(node.returns, ast.Subscript):
                # Handle generic types like List[str]
                return ast.unparse(node.returns) if hasattr(ast, 'unparse') else str(node.returns)
        return None

2. Multi-Agent Orchestration
Our enhanced system uses a sophisticated multi-agent architecture to handle complex coding tasks.

# ai/orchestration/agent_manager.py
from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
from dataclasses import dataclass
import json

from ..provider import AIProvider
from ...core.knowledge.semantic_graph import SemanticCodeGraph

class AgentRole(Enum):
    """Different specialized roles for AI agents."""
    ARCHITECT = "architect"
    BUG_FIXER = "bug_fixer"
    REFACTORER = "refactorer"
    TEST_WRITER = "test_writer"
    SECURITY_AUDITOR = "security_auditor"
    PERFORMANCE_OPTIMIZER = "performance_optimizer"
    DOCUMENTER = "documenter"
    COORDINATOR = "coordinator"

@dataclass
class AgentResult:
    """Result from an agent's processing."""
    content: str
    confidence: float
    metadata: Dict[str, Any]

class AgentManager:
    """Manages a team of specialized AI agents."""
    
    def __init__(self, ai_provider: AIProvider):
        self.ai_provider = ai_provider
        self.system_prompts: Dict[AgentRole, str] = self._load_agent_prompts()
        self.conversation_history: Dict[str, List[Dict[str, Any]]] = {}
        
    def _load_agent_prompts(self) -> Dict[AgentRole, str]:
        """Load specialized system prompts for each agent role."""
        prompts = {}
        for role in AgentRole:
            prompt_path = f"ai/prompts/{role.value}_prompt.md"
            try:
                with open(prompt_path, "r") as f:
                    prompts[role] = f.read()
            except FileNotFoundError:
                # Fall back to base prompt with role-specific additions
                with open("ai/prompts/base_prompt.md", "r") as f:
                    base_prompt = f.read()
                prompts[role] = base_prompt + f"\nYou are specialized as a {role.value} AI agent."
                
        return prompts
        
    def create_agent_session(self, session_id: str) -> None:
        """Create a new agent session with empty conversation history."""
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
            
    def route_task(self, task_description: str, code_context: str, session_id: str) -> Tuple[AgentRole, float]:
        """Determine which specialist agent should handle this task."""
        routing_prompt = f"""
        Given the following task and code context, determine which specialist agent would be best suited to handle it.
        Choose from: {', '.join([role.value for role in AgentRole])}
        
        Task description:
        {task_description}
        
        Code context snippet:
        {code_context[:1000]}  # Just a snippet for routing
        
        Respond with a JSON object with two fields:
        1. "role": The name of the best agent role
        2. "confidence": A number from 0 to 1 indicating how confident you are in this routing
        """
        
        response = self.ai_provider.generate_response(
            prompt=routing_prompt,
            system_message="You are a task routing AI that determines which specialist should handle a coding task.",
            options={"temperature": 0.3}
        )
        
        try:
            routing_result = json.loads(response)
            return AgentRole(routing_result["role"]), routing_result["confidence"]
        except (json.JSONDecodeError, KeyError, ValueError):
            # Default to coordinator if parsing fails
            return AgentRole.COORDINATOR, 0.5
            
    def execute_agent_task(
        self,
        role: AgentRole,
        task_description: str,
        code_context: str,
        session_id: str,
        additional_context: Optional[Dict[str, Any]] = None
    ) -> AgentResult:
        """Execute a task using a specialist agent."""
        # Get the appropriate system prompt
        system_prompt = self.system_prompts[role]
        
        # Build the user prompt with task and context
        user_prompt = f"""
        Task:
        {task_description}
        
        Code context:
        {code_context}
        """
        
        if additional_context:
            user_prompt += f"\n\nAdditional context:\n{json.dumps(additional_context, indent=2)}"
            
        # Add conversation history if available
        if session_id in self.conversation_history and self.conversation_history[session_id]:
            user_prompt += "\n\nConversation history:\n"
            for entry in self.conversation_history[session_id][-5:]:  # Last 5 exchanges
                user_prompt += f"User: {entry['user']}\nAssistant: {entry['assistant']}\n\n"
                
        # Generate response
        response = self.ai_provider.generate_response(
            prompt=user_prompt,
            system_message=system_prompt,
            options={"temperature": 0.7 if role == AgentRole.COORDINATOR else 0.3}
        )
        
        # Update conversation history
        if session_id in self.conversation_history:
            self.conversation_history[session_id].append({
                "user": task_description,
                "assistant": response
            })
            
        # Return structured result
        return AgentResult(
            content=response,
            confidence=0.8,  # Could be more sophisticated
            metadata={"role": role.value}
        )
        
    def collaborative_task(
        self,
        task_description: str,
        code_context: str,
        session_id: str,
        max_iterations: int = 3
    ) -> str:
        """Solve a complex task through collaboration between multiple agents."""
        # Start with the coordinator to break down the task
        coordinator_prompt = f"""
        You are the coordinator agent responsible for breaking down complex coding tasks into subtasks.
        
        Task:
        {task_description}
        
        Code context:
        {code_context[:2000]}  # First part of context for planning
        
        Please break this task down into 2-5 subtasks. For each subtask, specify:
        1. The subtask description
        2. Which specialist agent should handle it ({', '.join([role.value for role in AgentRole if role != AgentRole.COORDINATOR])})
        3. What order the subtasks should be completed in
        
        Return your response as a JSON array of subtask objects.
        """
        
        coordinator_response = self.ai_provider.generate_response(
            prompt=coordinator_prompt,
            system_message=self.system_prompts[AgentRole.COORDINATOR],
            options={"temperature": 0.4}
        )
        
        try:
            subtasks = json.loads(coordinator_response)
        except json.JSONDecodeError:
            # Fallback if response isn't valid JSON
            return self.execute_agent_task(
                AgentRole.COORDINATOR,
                task_description,
                code_context,
                session_id
            ).content
            
        # Execute each subtask
        subtask_results = []
        for subtask in subtasks:
            try:
                role = AgentRole(subtask["agent"])
                result = self.execute_agent_task(
                    role,
                    subtask["description"],
                    code_context,
                    session_id,
                    {"previous_results": subtask_results}
                )
                subtask_results.append({
                    "subtask": subtask["description"],
                    "agent": role.value,
                    "result": result.content
                })
            except (KeyError, ValueError):
                # Skip malformed subtasks
                continue
                
        # Final integration by coordinator
        integration_prompt = f"""
        You now need to integrate the results of all subtasks to provide a complete solution.
        
        Original task:
        {task_description}
        
        Subtask results:
        {json.dumps(subtask_results, indent=2)}
        
        Please provide a comprehensive, integrated solution based on all the specialist work.
        """
        
        final_response = self.ai_provider.generate_response(
            prompt=integration_prompt,
            system_message=self.system_prompts[AgentRole.COORDINATOR],
            options={"temperature": 0.4}
        )
        
        return final_response

3. Adaptive Context Management
Our enhanced system uses sophisticated context management to handle large codebases efficiently.

# ai/context/context_manager.py
from typing import Dict, List, Set, Optional, Tuple, Any
import numpy as np
from pathlib import Path
import re

from ...core.knowledge.semantic_graph import SemanticCodeGraph

class AdaptiveContextManager:
    """Manages code context adaptively for efficient AI processing."""
    
    def __init__(self, semantic_graph: SemanticCodeGraph, codebase_root: Path):
        self.semantic_graph = semantic_graph
        self.codebase_root = codebase_root
        self.token_limit = 50000
        self.file_cache: Dict[str, str] = {}
        self.summary_cache: Dict[str, Dict[str, str]] = {}  # Node ID -> summaries at different levels
        
    def _load_file_content(self, file_path: str) -> str:
        """Load and cache file content."""
        if file_path in self.file_cache:
            return self.file_cache[file_path]
            
        try:
            full_path = self.codebase_root / file_path
            with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            self.file_cache[file_path] = content
            return content
        except (FileNotFoundError, PermissionError):
            return f"[Error: Could not read file {file_path}]"
            
    def _estimate_tokens(self, text: str) -> int:
        """Estimate the number of tokens in text."""
        # Simple heuristic: ~4 characters per token for code
        return len(text) // 4
        
    def _generate_file_summary(self, file_path: str, level: str = 'medium') -> str:
        """Generate or retrieve a summary of a file at the specified detail level."""
        content = self._load_file_content(file_path)
        
        # Check cache first
        file_node_id = self.semantic_graph.file_nodes.get(file_path)
        if file_node_id and file_node_id in self.summary_cache and level in self.summary_cache[file_node_id]:
            return self.summary_cache[file_node_id][level]
            
        # Create summary based on level
        if level == 'minimal':
            # Just extract imports and class/function signatures
            lines = content.split('\n')
            summary_lines = []
            
            for line in lines:
                if re.match(r'^\s*(import|from)\s+', line):
                    summary_lines.append(line)
                elif re.match(r'^\s*(def|class)\s+', line):
                    summary_lines.append(line)
                    
            summary = '\n'.join(summary_lines)
            
        elif level == 'medium':
            # Extract imports, class/function signatures with docstrings
            # This is a simplified implementation
            lines = content.split('\n')
            summary_lines = []
            in_docstring = False
            
            for line in lines:
                if re.match(r'^\s*(import|from)\s+', line):
                    summary_lines.append(line)
                elif re.match(r'^\s*(def|class)\s+', line):
                    summary_lines.append(line)
                    in_docstring = True
                elif in_docstring and re.match(r'^\s*[\'\"]{3}', line):
                    summary_lines.append(line)
                    if line.endswith('"""') or line.endswith("'''"):
                        in_docstring = False
                elif in_docstring and (line.endswith('"""') or line.endswith("'''")):
                    summary_lines.append(line)
                    in_docstring = False
                elif in_docstring:
                    summary_lines.append(line)
                    
            summary = '\n'.join(summary_lines)
            
        else:  # 'full'
            summary = content
            
        # Cache the summary
        if file_node_id:
            if file_node_id not in self.summary_cache:
                self.summary_cache[file_node_id] = {}
            self.summary_cache[file_node_id][level] = summary
            
        return summary
        
    def build_context_for_issue(
        self,
        issue_description: str,
        focus_file: Optional[Path] = None,
        relevant_terms: Optional[List[str]] = None
    ) -> str:
        """Build context for an issue, adaptively managing token budget."""
        relevant_files = self._find_relevant_files(issue_description, focus_file, relevant_terms)
        
        # Sort files by relevance score
        relevant_files.sort(key=lambda x: x[1], reverse=True)
        
        context_parts = []
        remaining_tokens = self.token_limit
        
        # Always include the focus file in full if specified
        if focus_file:
            focus_path = str(focus_file.relative_to(self.codebase_root))
            focus_content = self._load_file_content(focus_path)
            focus_tokens = self._estimate_tokens(focus_content)
            
            context_parts.append(f"--- {focus_path} (FOCUS FILE) ---\n\n{focus_content}")
            remaining_tokens -= focus_tokens
            
            # Remove from the list if it's there
            relevant_files = [f for f in relevant_files if f[0] != focus_path]
        
        # Add high-relevance files
        for file_path, relevance in relevant_files:
            if relevance > 0.7:  # High relevance threshold
                content = self._load_file_content(file_path)
                tokens = self._estimate_tokens(content)
                
                if tokens <= remaining_tokens:
                    context_parts.append(f"--- {file_path} ---\n\n{content}")
                    remaining_tokens -= tokens
                else:
                    # Try medium summary
                    summary = self._generate_file_summary(file_path, 'medium')
                    summary_tokens = self._estimate_tokens(summary)
                    
                    if summary_tokens <= remaining_tokens:
                        context_parts.append(f"--- {file_path} (SUMMARY) ---\n\n{summary}")
                        remaining_tokens -= summary_tokens
        
        # Add medium-relevance files as summaries
        for file_path, relevance in relevant_files:
            if 0.3 <= relevance <= 0.7:  # Medium relevance threshold
                summary = self._generate_file_summary(file_path, 'medium')
                summary_tokens = self._estimate_tokens(summary)
                
                if summary_tokens <= remaining_tokens:
                    context_parts.append(f"--- {file_path} (SUMMARY) ---\n\n{summary}")
                    remaining_tokens -= summary_tokens
                else:
                    # Try minimal summary
                    minimal_summary = self._generate_file_summary(file_path, 'minimal')
                    minimal_tokens = self._estimate_tokens(minimal_summary)
                    
                    if minimal_tokens <= remaining_tokens:
                        context_parts.append(f"--- {file_path} (MINIMAL) ---\n\n{minimal_summary}")
                        remaining_tokens -= minimal_tokens
        
        # Add low-relevance files as minimal summaries if space remains
        for file_path, relevance in relevant_files:
            if relevance < 0.3:  # Low relevance threshold
                if remaining_tokens > 0:
                    minimal_summary = self._generate_file_summary(file_path, 'minimal')
                    minimal_tokens = self._estimate_tokens(minimal_summary)
                    
                    if minimal_tokens <= remaining_tokens:
                        context_parts.append(f"--- {file_path} (MINIMAL) ---\n\n{minimal_summary}")
                        remaining_tokens -= minimal_tokens
        
        return "\n\n".join(context_parts)
        
    def _find_relevant_files(
        self,
        issue_description: str,
        focus_file: Optional[Path] = None,
        relevant_terms: Optional[List[str]] = None
    ) -> List[Tuple[str, float]]:
        """Find files relevant to the issue with relevance scores."""
        relevance_scores: Dict[str, float] = {}
        
        # Start with the focus file and its dependencies if specified
        if focus_file:
            focus_path = str(focus_file.relative_to(self.codebase_root))
            relevance_scores[focus_path] = 1.0  # Maximum relevance
            
            # Find directly related files through semantic graph
            if focus_path in self.semantic_graph.file_nodes:
                file_node_id = self.semantic_graph.file_nodes[focus_path]
                related_nodes = self.semantic_graph.get_related_nodes(file_node_id)
                
                for node_id in related_nodes:
                    node = self.semantic_graph.nodes.get(node_id)
                    if node and node.type == 'file':
                        relevance_scores[node.file_path] = 0.8  # High relevance for directly related files
        
        # Use relevant terms to find additional files
        if relevant_terms:
            for term in relevant_terms:
                matching_nodes = self.semantic_graph.find_nodes_by_name(term)
                
                for node_id in matching_nodes:
                    node = self.semantic_graph.nodes.get(node_id)
                    if node:
                        file_path = node.file_path
                        # Increase relevance score for matched files
                        relevance_scores[file_path] = relevance_scores.get(file_path, 0) + 0.5
        
        # If we still have very few files, add central files based on graph centrality
        if len(relevance_scores) < 5:
            centrality = self.semantic_graph.compute_centrality()
            top_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:10]
            
            for node_id, score in top_nodes:
                node = self.semantic_graph.nodes.get(node_id)
                if node and node.type == 'file':
                    if node.file_path not in relevance_scores:
                        relevance_scores[node.file_path] = 0.3  # Medium-low relevance
        
        # Convert to list of tuples
        return [(file_path, score) for file_path, score in relevance_scores.items()]

4. Smart Diff & Test Generation
Our enhanced system incorporates intelligent code modification and testing capabilities.

# changes/smart_diff.py
from typing import Dict, List, Tuple, Optional, Set
from pathlib import Path
import difflib
import re
import ast
import subprocess

class SmartDiffEngine:
    """Intelligently manages code changes with safety checks and test generation."""
    
    def __init__(self, codebase_root: Path):
        self.codebase_root = codebase_root
        
    def extract_changes_from_response(self, ai_response: str) -> Dict[str, str]:
        """Extract code changes from an AI response with enhanced recognition patterns."""
        changes = {}
        
        # Match markdown code blocks with file paths
        file_blocks = re.finditer(r'```(?:diff|[a-z]+)?\s*(?:(?:File|PATH):\s*([^\n]+))?\n(.*?)```', ai_response, re.DOTALL)
        
        for block in file_blocks:
            # Try to extract file path from header or first line
            file_path = block.group(1)
            code_block = block.group(2)
            
            if not file_path:
                # Try to find file path in the text before the code block
                before_block = ai_response[:block.start()]
                path_match = re.search(r'(?:in|to|update|modify|change|create)\s+[\'"`]?([^\s\'"`]+\.[a-zA-Z0-9]+)[\'"`]?', before_block[-200:])
                if path_match:
                    file_path = path_match.group(1)
                else:
                    # Try to find it in the code block itself for diff format
                    diff_path = re.search(r'(?:---|\+\+\+)\s+(?:a/|b/)?([^\s]+)', code_block)
                    if diff_path:
                        file_path = diff_path.group(1)
            
            if file_path:
                # Normalize path
                file_path = file_path.strip()
                
                # If this is a diff, parse it properly
                if block.group(0).startswith('```diff') or '---' in code_block[:50]:
                    new_content = self._apply_diff_to_file(file_path, code_block)
                    if new_content is not None:
                        changes[file_path] = new_content
                else:
                    # Otherwise, treat as complete file content
                    changes[file_path] = code_block
        
        return changes
        
    def _apply_diff_to_file(self, file_path: str, diff_text: str) -> Optional[str]:
        """Apply a diff to the original file content."""
        full_path = self.codebase_root / file_path
        
        try:
            with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                original_content = f.read()
                
            # Parse the diff to extract changes
            lines = original_content.splitlines()
            current_line = 0
            in_hunk = False
            hunk_start = 0
            hunk_lines_to_remove = 0
            hunk_lines_to_add = 0
            
            result_lines = lines.copy()
            
            for line in diff_text.splitlines():
                if line.startswith('@@'):
                    # Parse hunk header
                    in_hunk = True
                    hunk_match = re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@', line)
                    if hunk_match:
                        hunk_start = int(hunk_match.group(1)) - 1  # 0-based indexing
                        hunk_lines_to_remove = int(hunk_match.group(2) or 1)
                        current_line = hunk_start
                elif in_hunk:
                    if line.startswith('-'):
                        # Line to remove
                        if current_line < len(lines) and lines[current_line] == line[1:]:
                            result_lines[current_line] = None  # Mark for removal
                            current_line += 1
                        else:
                            # Mismatch with original content
                            return None
                    elif line.startswith('+'):
                        # Line to add
                        result_lines.insert(current_line, line[1:])
                        current_line += 1
                    elif line.startswith(' '):
                        # Context line
                        if current_line < len(lines) and lines[current_line] == line[1:]:
                            current_line += 1
                        else:
                            # Mismatch with original content
                            return None
                    
            # Remove None entries (deleted lines)
            result_lines = [line for line in result_lines if line is not None]
            
            return '\n'.join(result_lines)
        except FileNotFoundError:
            # If file doesn't exist, treat the diff content as the entire new file
            # First, strip the diff markers
            content_lines = []
            for line in diff_text.splitlines():
                if line.startswith('+') and not line.startswith('+++'):
                    content_lines.append(line[1:])
                elif not line.startswith('-') and not line.startswith('---') and not line.startswith('@@'):
                    content_lines.append(line)
            
            return '\n'.join(content_lines)
            
    def generate_tests_for_changes(self, changed_files: Dict[str, str]) -> Dict[str, str]:
        """Generate test files for changed code files."""
        tests = {}
        
        for file_path, content in changed_files.items():
            # Only generate tests for Python files for now
            if not file_path.endswith('.py'):
                continue
                
            # Determine test file path
            test_path = self._get_test_file_path(file_path)
            
            # Generate test content
            test_content = self._generate_test_content(file_path, content)
            
            if test_content:
                tests[test_path] = test_content
                
        return tests
        
    def _get_test_file_path(self, file_path: str) -> str:
        """Determine the appropriate path for a test file."""
        # Check if there's an existing test directory
        if (self.codebase_root / 'tests').exists():
            # Extract the module name
            parts = Path(file_path).parts
            if len(parts) > 1 and parts[0] in ('src', 'lib', 'app'):
                module_parts = parts[1:]
            else:
                module_parts = parts
                
            # Create test path
            filename = Path(module_parts[-1]).stem
            if len(module_parts) > 1:
                return str(Path('tests') / Path(*module_parts[:-1]) / f"test_{filename}.py")
            else:
                return str(Path('tests') / f"test_{filename}.py")
        else:
            # No tests directory, place alongside original file
            path = Path(file_path)
            return str(path.parent / f"test_{path.name}")
            
    def _generate_test_content(self, file_path: str, content: str) -> Optional[str]:
        """Generate test content for a given file."""
        # This is a placeholder for actual test generation logic
        # In a real implementation, this would analyze the code and generate appropriate tests
        
        # Check if file exists already
        test_path = self._get_test_file_path(file_path)
        full_test_path = self.codebase_root / test_path
        
        if full_test_path.exists():
            # If test file exists, read it and potentially update it
            with open(full_test_path, 'r', encoding='utf-8', errors='ignore') as f:
                existing_test = f.read()
                
            # Here we'd analyze the code changes and update the tests accordingly
            # For this example, we'll just return the existing tests
            return existing_test
            
        else:
            # Generate a new test file
            module_name = Path(file_path).stem
            
            # Simple template for a new test file
            return f"""import unittest
from pathlib import Path
import sys

# Add the parent directory to sys.path if needed
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import the module to test
from {module_name} import *

class Test{module_name.capitalize()}(unittest.TestCase):
    def setUp(self):
        # Setup code here
        pass
        
    def tearDown(self):
        # Cleanup code here
        pass
        
    def test_basic_functionality(self):
        # TODO: Add tests for {module_name}
        pass
        
if __name__ == '__main__':
    unittest.main()
"""
        
    def validate_changes(self, changes: Dict[str, str]) -> Dict[str, List[str]]:
        """Validate changes for potential issues."""
        issues = {}
        
        for file_path, content in changes.items():
            file_issues = []
            
            # Check for syntax errors in Python files
            if file_path.endswith('.py'):
                try:
                    ast.parse(content)
                except SyntaxError as e:
                    file_issues.append(f"Syntax error: {str(e)}")
            
            # Check for regression potential
            regression_risks = self._check_regression_risks(file_path, content)
            file_issues.extend(regression_risks)
            
            if file_issues:
                issues[file_path] = file_issues
                
        return issues
        
    def _check_regression_risks(self, file_path: str, new_content: str) -> List[str]:
        """Check for potential regression risks in the changes."""
        risks = []
        full_path = self.codebase_root / file_path
        
        try:
            # Read original content if file exists
            if full_path.exists():
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    original_content = f.read()
                    
                # Calculate diff
                diff = difflib.unified_diff(
                    original_content.splitlines(),
                    new_content.splitlines(),
                    lineterm=''
                )
                
                # Check for risky patterns in the diff
                removed_lines = [line[1:] for line in diff if line.startswith('-') and not line.startswith('---')]
                
                # Check for removed function definitions
                for line in removed_lines:
                    if re.match(r'\s*def\s+\w+', line):
                        risks.append(f"Removed function definition: {line.strip()}")
                        
                # Check for removed error handling
                if any('except' in line for line in removed_lines):
                    risks.append("Removed exception handling code")
                    
                # Check for removed security checks
                security_patterns = [
                    r'authenticate', r'authorize', r'permission', r'validate',
                    r'sanitize', r'escape', r'csrf', r'xss', r'sql\s*injection'
                ]
                for pattern in security_patterns:
                    if any(re.search(pattern, line, re.IGNORECASE) for line in removed_lines):
                        risks.append(f"Removed potential security check: {pattern}")
                        
        except (FileNotFoundError, PermissionError):
            # New file, so no regression risks from changes
            pass
            
        return risks

5. Multi-Interface Support
Our enhanced system provides multiple interface options for different workflows.

# interface/editor_integration.py
import json
import os
import socket
import threading
import time
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple

class EditorIntegration:
    """Integrates CodeNavigator with code editors through Language Server Protocol."""
    
    def __init__(self, navigator, host: str = '127.0.0.1', port: int = 8123):
        self.navigator = navigator
        self.host = host
        self.port = port
        self.server_socket = None
        self.clients = []
        self.running = False
        self.thread = None
        
    def start(self):
        """Start the LSP server."""
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(5)
        
        self.running = True
        self.thread = threading.Thread(target=self._accept_connections)
        self.thread.daemon = True
        self.thread.start()
        
        print(f"Editor integration server started on {self.host}:{self.port}")
        
    def stop(self):
        """Stop the LSP server."""
        self.running = False
        
        if self.server_socket:
            self.server_socket.close()
            
        for client in self.clients:
            client.close()
            
        if self.thread:
            self.thread.join(timeout=1.0)
            
        print("Editor integration server stopped")
        
    def _accept_connections(self):
        """Accept client connections."""
        while self.running:
            try:
                client_socket, address = self.server_socket.accept()
                print(f"New editor connection from {address}")
                
                client_thread = threading.Thread(
                    target=self._handle_client,
                    args=(client_socket, address)
                )
                client_thread.daemon = True
                client_thread.start()
                
                self.clients.append(client_socket)
            except:
                if self.running:
                    print("Error accepting connection")
                time.sleep(0.1)
                
    def _handle_client(self, client_socket, address):
        """Handle communication with a client."""
        buffer = b''
        
        while self.running:
            try:
                data = client_socket.recv(4096)
                if not data:
                    break
                    
                buffer += data
                
                # Process complete messages
                while True:
                    if len(buffer) < 4:
                        break
                        
                    # Get content length
                    if buffer.startswith(b'Content-Length: '):
                        header_end = buffer.find(b'\r\n\r\n')
                        if header_end == -1:
                            break
                            
                        header = buffer[:header_end].decode('ascii')
                        content_length_match = re.search(r'Content-Length: (\d+)', header)
                        if not content_length_match:
                            buffer = buffer[header_end + 4:]
                            continue
                            
                        content_length = int(content_length_match.group(1))
                        
                        if len(buffer) < header_end + 4 + content_length:
                            break
                            
                        content = buffer[header_end + 4:header_end + 4 + content_length].decode('utf-8')
                        buffer = buffer[header_end + 4 + content_length:]
                        
                        # Process the JSON content
                        try:
                            message = json.loads(content)
                            self._process_message(client_socket, message)
                        except json.JSONDecodeError:
                            print(f"Invalid JSON: {content}")
                    else:
                        # Invalid message format, skip to next potential message
                        next_content = buffer.find(b'Content-Length: ')
                        if next_content == -1:
                            buffer = b''
                        else:
                            buffer = buffer[next_content:]
            except:
                break
                
        # Clean up
        if client_socket in self.clients:
            self.clients.remove(client_socket)
        client_socket.close()
        print(f"Editor connection from {address} closed")
        
    def _process_message(self, client_socket, message):
        """Process a message from the client."""
        if 'method' not in message:
            return
            
        method = message['method']
        
        if method == 'initialize':
            # Send initialize response
            self._send_response(client_socket, message['id'], {
                'capabilities': {
                    'textDocumentSync': 1,  # Full sync
                    'codeActionProvider': True,
                    'hoverProvider': True,
                    'completionProvider': {
                        'triggerCharacters': ['.']
                    }
                }
            })
        elif method == 'textDocument/codeAction':
            # Generate code actions for the current context
            params = message.get('params', {})
            document_uri = params.get('textDocument', {}).get('uri', '')
            
            if document_uri.startswith('file://'):
                file_path = document_uri[7:]
                
                # Get code actions
                actions = self._get_code_actions(file_path, params)
                
                self._send_response(client_socket, message['id'], actions)
        elif method == 'textDocument/hover':
            # Provide hover information
            params = message.get('params', {})
            document_uri = params.get('textDocument', {}).get('uri', '')
            position = params.get('position', {})
            
            if document_uri.startswith('file://'):
                file_path = document_uri[7:]
                
                # Get hover information
                hover_info = self._get_hover_info(file_path, position)
                
                self._send_response(client_socket, message['id'], hover_info)
        
    def _send_response(self, client_socket, id, result):
        """Send a response back to the client."""
        response = {
            'jsonrpc': '2.0',
            'id': id,
            'result': result
        }
        
        content = json.dumps(response)
        header = f'Content-Length: {len(content)}\r\n\r\n'
        
        client_socket.sendall(header.encode('ascii') + content.encode('utf-8'))
        
    def _get_code_actions(self, file_path, params):
        """Generate code actions for the current context."""
        # This would use the navigator to analyze the code and suggest actions
        # Simplified implementation for example purposes
        return [
            {
                'title': 'Fix: Add missing import',
                'kind': 'quickfix',
                'edit': {
                    'changes': {
                        file_path: [
                            {
                                'range': {
                                    'start': {'line': 0, 'character': 0},
                                    'end': {'line': 0, 'character': 0}
                                },
                                'newText': 'import os\n'
                            }
                        ]
                    }
                }
            }
        ]
        
    def _get_hover_info(self, file_path, position):
        """Provide hover information for the current position."""
        # This would use the navigator to analyze the code and provide information
        # Simplified implementation for example purposes
        return {
            'contents': {
                'kind': 'markdown',
                'value': 'This is a function that does something useful.'
            }
        }

# interface/web_dashboard.py
import threading
import time
from pathlib import Path
from typing import Dict, Any, Optional, List
from flask import Flask, render_template, request, jsonify

class WebDashboard:
    """Interactive web dashboard for CodeNavigator."""
    
    def __init__(self, navigator, host: str = '127.0.0.1', port: int = 5000):
        self.navigator = navigator
        self.host = host
        self.port = port
        self.app = Flask(__name__)
        self.thread = None
        self.running = False
        
        # Register routes
        self._register_routes()
        
    def _register_routes(self):
        """Register Flask routes."""
        @self.app.route('/')
        def index():
            return render_template('index.html')
            
        @self.app.route('/api/codebase/stats')
        def codebase_stats():
            stats = self._get_codebase_stats()
            return jsonify(stats)
            
        @self.app.route('/api/diagnose', methods=['POST'])
        def diagnose():
            data = request.json
            issue_description = data.get('issue', '')
            focus_file = data.get('file')
            
            if focus_file:
                focus_path = Path(focus_file)
            else:
                focus_path = None
                
            response = self.navigator.diagnose_issue(issue_description, focus_path)
            
            return jsonify({
                'analysis': response
            })
            
        @self.app.route('/api/codebase/files')
        def list_files():
            files = self._get_codebase_files()
            return jsonify(files)
            
        @self.app.route('/api/file/content')
        def file_content():
            file_path = request.args.get('path', '')
            content = self._get_file_content(file_path)
            
            return jsonify({
                'path': file_path,
                'content': content
            })
            
        @self.app.route('/api/visualize/dependencies')
        def visualize_dependencies():
            dependencies = self._get_dependency_graph()
            return jsonify(dependencies)
            
    def start(self):
        """Start the web dashboard."""
        self.running = True
        self.thread = threading.Thread(target=self._run_server)
        self.thread.daemon = True
        self.thread.start()
        
        print(f"Web dashboard started on http://{self.host}:{self.port}")
        
    def stop(self):
        """Stop the web dashboard."""
        self.running = False
        if self.thread:
            self.thread.join(timeout=1.0)
            
        print("Web dashboard stopped")
        
    def _run_server(self):
        """Run the Flask server."""
        self.app.run(host=self.host, port=self.port, debug=False, use_reloader=False)
        
    def _get_codebase_stats(self) -> Dict[str, Any]:
        """Get statistics about the codebase."""
        stats = {
            'files': len(self.navigator.index.files),
            'languages': {},
            'complexity': {
                'high': 0,
                'medium': 0,
                'low': 0
            }
        }
        
        # Count files by language
        for file_path, code_file in self.navigator.index.files.items():
            language = code_file.language
            stats['languages'][language] = stats['languages'].get(language, 0) + 1
            
        # This would be more sophisticated in a real implementation
        return stats
        
    def _get_codebase_files(self) -> List[Dict[str, Any]]:
        """Get a list of files in the codebase."""
        files = []
        
        for file_path, code_file in self.navigator.index.files.items():
            files.append({
                'path': file_path,
                'language': code_file.language,
                'size': len(code_file.content)
            })
            
        return files
        
    def _get_file_content(self, file_path: str) -> str:
        """Get the content of a file."""
        if file_path in self.navigator.index.files:
            return self.navigator.index.files[file_path].content
        else:
            return f"File not found: {file_path}"
            
    def _get_dependency_graph(self) -> Dict[str, Any]:
        """Get dependency graph data for visualization."""
        nodes = []
        edges = []
        
        # Add file nodes
        for file_path, code_file in self.navigator.index.files.items():
            nodes.append({
                'id': file_path,
                'label': Path(file_path).name,
                'type': 'file',
                'language': code_file.language
            })
            
            # Add dependency edges
            for dep in code_file.dependencies:
                edges.append({
                    'source': file_path,
                    'target': dep,
                    'type': 'imports'
                })
                
        return {
            'nodes': nodes,
            'edges': edges
        }

6. Core Navigator Class (Enhanced)
# core/navigator.py
from pathlib import Path
from typing import Dict, Optional, List, Any, Tuple
import json
import os
import typer
import threading
import time
from rich.console import Console
from rich.markdown import Markdown
from rich.progress import Progress

from .knowledge.semantic_graph import SemanticCodeGraph
from .knowledge.code_analyzer import AdvancedCodeAnalyzer
from ..ai.orchestration.agent_manager import AgentManager, AgentRole
from ..ai.context.context_manager import AdaptiveContextManager
from ..ai.provider import AIProvider, AnthropicProvider
from ..changes.smart_diff import SmartDiffEngine
from ..interface.editor_integration import EditorIntegration
from ..interface.web_dashboard import WebDashboard

class CodeNavigator:
    """Advanced navigator for code understanding and manipulation."""
    
    def __init__(self, codebase_path: Path):
        self.codebase_path = codebase_path.absolute()
        self.console = Console()
        
        # Initialize core components
        self.semantic_graph = SemanticCodeGraph()
        self.analyzer = AdvancedCodeAnalyzer()
        self.ai_provider = AnthropicProvider()
        self.agent_manager = AgentManager(self.ai_provider)
        self.context_manager = None  # Will be initialized after indexing
        self.change_engine = SmartDiffEngine(self.codebase_path)
        
        # Initialize interface components
        self.editor_integration = EditorIntegration(self)
        self.web_dashboard = WebDashboard(self)
        
        # State variables
        self.indexed = False
        self.indexing_in_progress = False
        self.index_path = self.codebase_path / ".code_navigator" / "index.json"
        
        # Check if index exists
        if self.index_path.exists():
            self._load_index()
            
    def initialize(self, verbose: bool = False, background: bool = False) -> None:
        """Initialize and index the codebase."""
        if self.indexing_in_progress:
            self.console.print("[yellow]Indexing already in progress[/yellow]")
            return
            
        if background:
            # Start indexing in a background thread
            thread = threading.Thread(target=self._initialize_impl, args=(verbose,))
            thread.daemon = True
            thread.start()
            self.console.print("[blue]Indexing started in background[/blue]")
        else:
            # Run indexing in the current thread
            self._initialize_impl(verbose)
            
    def _initialize_impl(self, verbose: bool = False) -> None:
        """Implementation of the initialization process."""
        self.indexing_in_progress = True
        self.console.print(f"[bold blue]Indexing codebase at: {self.codebase_path}[/bold blue]")
        
        try:
            with Progress() as progress:
                task = progress.add_task("[green]Analyzing codebase...", total=100)
                
                # Build the semantic graph
                self.semantic_graph = self.analyzer.analyze_codebase(self.codebase_path)
                progress.update(task, completed=50)
                
                # Initialize the context manager with the semantic graph
                self.context_manager = AdaptiveContextManager(self.semantic_graph, self.codebase_path)
                progress.update(task, completed=75)
                
                # Save the index
                self._save_index()
                progress.update(task, completed=100)
                
            self.indexed = True
            file_count = len([node for node in self.semantic_graph.nodes.values() if node.type == 'file'])
            
            self.console.print(f"[bold green]Indexed {file_count} files[/bold green]")
            if verbose:
                self._print_codebase_summary()
        except Exception as e:
            self.console.print(f"[bold red]Error during indexing: {str(e)}[/bold red]")
        finally:
            self.indexing_in_progress = False
            
    def diagnose_issue(
        self,
        issue_description: str,
        focus_file: Optional[Path] = None,
        use_specialists: bool = True,
        apply_changes: bool = False,
        generate_tests: bool = False
    ) -> str:
        """Diagnose an issue in the codebase."""
        if not self.indexed and not self.indexing_in_progress:
            self.console.print("[yellow]Codebase not indexed. Running initialization first...[/yellow]")
            self.initialize()
            
        if self.indexing_in_progress:
            self.console.print("[yellow]Indexing in progress. Please wait...[/yellow]")
            while self.indexing_in_progress:
                time.sleep(0.5)
                
        self.console.print("[bold blue]Analyzing issue...[/bold blue]")
        
        # Extract relevant terms from the issue description
        relevant_terms = self._extract_relevant_terms(issue_description)
        
        # Build the context for the AI
        code_context = self.context_manager.build_context_for_issue(
            issue_description,
            focus_file,
            relevant_terms
        )
        
        # Generate AI response
        if use_specialists:
            # Use the multi-agent approach
            response = self.agent_manager.collaborative_task(
                issue_description,
                code_context,
                

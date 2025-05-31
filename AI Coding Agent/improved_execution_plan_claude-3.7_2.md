CodeNavigator: Advanced AI Coding Assistant Implementation
Thank you for the feedback! You're right - we can go much deeper. Let's create a truly exceptional implementation that pushes the boundaries of what's possible with an AI coding assistant.

Enhanced Architecture Overview

We'll implement a more sophisticated, modular system with these key improvements:

Plugin-based architecture for extensibility
Advanced code understanding with semantic analysis
Multi-model AI orchestration for specialized tasks
Persistent workspace management with versioning
Interactive TUI with rich visualizations
Memory management for contextual awareness across sessions
Core Architectural Components
1. Plugin System & Service Registry
# core/registry.py
from typing import Dict, Type, TypeVar, Generic, Optional, Any, List, Callable
import inspect
import importlib
import pkgutil
from pathlib import Path

T = TypeVar('T')

class ServiceRegistry(Generic[T]):
    """A generic registry for services or plugins."""
    
    def __init__(self, base_type: Type[T]):
        self.base_type = base_type
        self.services: Dict[str, Type[T]] = {}
        
    def register(self, key: str, service_class: Type[T]) -> None:
        """Register a service class under the given key."""
        if not issubclass(service_class, self.base_type):
            raise TypeError(f"Service class must be a subclass of {self.base_type.__name__}")
        self.services[key] = service_class
        
    def get(self, key: str, *args, **kwargs) -> Optional[T]:
        """Get an instance of the service for the given key."""
        service_class = self.services.get(key)
        if service_class:
            return service_class(*args, **kwargs)
        return None
        
    def get_all(self) -> Dict[str, Type[T]]:
        """Get all registered services."""
        return self.services.copy()
        
    def discover_plugins(self, package_name: str) -> None:
        """Discover and register plugins from the given package."""
        package = importlib.import_module(package_name)
        package_path = getattr(package, '__path__', [])
        
        for _, name, is_pkg in pkgutil.iter_modules(package_path):
            if not is_pkg:
                module = importlib.import_module(f"{package_name}.{name}")
                
                for item_name, item in inspect.getmembers(module, inspect.isclass):
                    if issubclass(item, self.base_type) and item != self.base_type:
                        self.register(name, item)

2. Advanced Code Understanding Engine
# analysis/engine.py
from typing import Dict, List, Set, Optional, Any, Union
from pathlib import Path
import threading
import queue
from dataclasses import dataclass, field
import networkx as nx
from abc import ABC, abstractmethod

@dataclass
class Symbol:
    """Represents a code symbol (function, class, variable, etc.)."""
    name: str
    kind: str  # 'function', 'class', 'variable', etc.
    location: Dict[str, Any]  # file, line, column
    scope: Optional[str] = None
    signature: Optional[str] = None
    documentation: Optional[str] = None
    references: List[Dict[str, Any]] = field(default_factory=list)

@dataclass
class CodeRelation:
    """Represents a relation between code elements."""
    source: str  # Symbol ID
    target: str  # Symbol ID
    kind: str    # 'calls', 'imports', 'inherits', 'uses', etc.
    location: Dict[str, Any]
    
class LanguageAnalyzer(ABC):
    """Base class for language-specific analyzers."""
    
    @abstractmethod
    def analyze_file(self, file_path: Path, content: str) -> Dict[str, Any]:
        """Analyze a single file and return its structure."""
        pass
        
    @abstractmethod
    def extract_symbols(self, file_analysis: Dict[str, Any]) -> List[Symbol]:
        """Extract symbols from a file analysis."""
        pass
        
    @abstractmethod
    def extract_relations(self, file_analysis: Dict[str, Any], symbols: Dict[str, Symbol]) -> List[CodeRelation]:
        """Extract relations between symbols."""
        pass

class CodeGraph:
    """A graph representation of code symbols and their relationships."""
    
    def __init__(self):
        self.symbol_graph = nx.DiGraph()
        self.file_graph = nx.DiGraph()
        self.symbols: Dict[str, Symbol] = {}
        self.files: Dict[str, Dict[str, Any]] = {}
        
    def add_symbol(self, symbol: Symbol) -> str:
        """Add a symbol to the graph."""
        symbol_id = f"{symbol.scope or ''}.{symbol.name}" if symbol.scope else symbol.name
        self.symbols[symbol_id] = symbol
        self.symbol_graph.add_node(symbol_id, **{
            'name': symbol.name,
            'kind': symbol.kind,
            'file': symbol.location['file'],
            'line': symbol.location.get('line', 0)
        })
        return symbol_id
        
    def add_relation(self, relation: CodeRelation) -> None:
        """Add a relation between symbols."""
        self.symbol_graph.add_edge(
            relation.source, 
            relation.target, 
            kind=relation.kind,
            file=relation.location['file'],
            line=relation.location.get('line', 0)
        )
        
    def get_callgraph(self, symbol_id: str, depth: int = 2) -> nx.DiGraph:
        """Get the call graph for a symbol up to a certain depth."""
        if symbol_id not in self.symbol_graph:
            return nx.DiGraph()
            
        callgraph = nx.DiGraph()
        callgraph.add_node(symbol_id, **self.symbol_graph.nodes[symbol_id])
        
        # BFS to find calls within depth
        current_depth = 0
        current_nodes = {symbol_id}
        
        while current_depth < depth and current_nodes:
            next_nodes = set()
            
            for node in current_nodes:
                for successor in self.symbol_graph.successors(node):
                    edge_data = self.symbol_graph.get_edge_data(node, successor)
                    if edge_data.get('kind') == 'calls':
                        callgraph.add_node(successor, **self.symbol_graph.nodes[successor])
                        callgraph.add_edge(node, successor, **edge_data)
                        next_nodes.add(successor)
            
            current_nodes = next_nodes
            current_depth += 1
            
        return callgraph
        
    def find_code_paths(self, source: str, target: str, max_depth: int = 5) -> List[List[str]]:
        """Find paths in the code from source to target symbols."""
        if source not in self.symbol_graph or target not in self.symbol_graph:
            return []
            
        paths = []
        for path in nx.all_simple_paths(self.symbol_graph, source, target, cutoff=max_depth):
            paths.append(path)
            
        return paths

class AnalysisEngine:
    """Main engine for code analysis."""
    
    def __init__(self):
        self.analyzers: Dict[str, LanguageAnalyzer] = {}
        self.code_graph = CodeGraph()
        self._analysis_queue = queue.Queue()
        self._analysis_thread = None
        self._stop_requested = threading.Event()
        
    def register_analyzer(self, extension: str, analyzer: LanguageAnalyzer) -> None:
        """Register a language analyzer for a file extension."""
        self.analyzers[extension] = analyzer
        
    def analyze_file(self, file_path: Path) -> None:
        """Queue a file for analysis."""
        self._analysis_queue.put(file_path)
        
        # Start analysis thread if not running
        if not self._analysis_thread or not self._analysis_thread.is_alive():
            self._stop_requested.clear()
            self._analysis_thread = threading.Thread(target=self._analysis_worker)
            self._analysis_thread.daemon = True
            self._analysis_thread.start()
    
    def analyze_files(self, file_paths: List[Path]) -> None:
        """Queue multiple files for analysis."""
        for file_path in file_paths:
            self.analyze_file(file_path)
    
    def _analysis_worker(self) -> None:
        """Worker thread for file analysis."""
        while not self._stop_requested.is_set():
            try:
                file_path = self._analysis_queue.get(timeout=1.0)
            except queue.Empty:
                continue
                
            try:
                self._analyze_file_now(file_path)
            except Exception as e:
                print(f"Error analyzing {file_path}: {e}")
            finally:
                self._analysis_queue.task_done()
                
    def _analyze_file_now(self, file_path: Path) -> None:
        """Analyze a file immediately."""
        extension = file_path.suffix.lower()
        
        if extension not in self.analyzers:
            return  # No analyzer for this file type
            
        analyzer = self.analyzers[extension]
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            # Analyze the file
            analysis = analyzer.analyze_file(file_path, content)
            
            # Extract symbols and relations
            symbols = analyzer.extract_symbols(analysis)
            
            # Add symbols to the graph
            symbol_ids = {}
            for symbol in symbols:
                symbol_id = self.code_graph.add_symbol(symbol)
                symbol_ids[symbol.name] = symbol_id
                
            # Extract and add relations
            relations = analyzer.extract_relations(analysis, symbol_ids)
            for relation in relations:
                self.code_graph.add_relation(relation)
                
        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
            
    def find_symbol(self, name: str, kind: Optional[str] = None) -> List[Symbol]:
        """Find symbols by name and optionally kind."""
        results = []
        
        for symbol_id, symbol in self.code_graph.symbols.items():
            if symbol.name == name and (kind is None or symbol.kind == kind):
                results.append(symbol)
                
        return results
        
    def find_references(self, symbol_id: str) -> List[Dict[str, Any]]:
        """Find all references to a symbol."""
        if symbol_id not in self.code_graph.symbols:
            return []
            
        return self.code_graph.symbols[symbol_id].references
        
    def get_relevant_files(self, issue_description: str, focus_file: Optional[Path] = None) -> List[Path]:
        """Find files relevant to an issue based on code relationships."""
        # This would use the graph to find related files
        # For now, returning a simple implementation
        relevant_files = []
        
        if focus_file:
            relevant_files.append(focus_file)
            
            # Add files that import or are imported by the focus file
            focus_path_str = str(focus_file)
            for file_path, file_data in self.code_graph.files.items():
                if file_path == focus_path_str:
                    continue
                    
                if focus_path_str in file_data.get('imports', []) or file_path in self.code_graph.files.get(focus_path_str, {}).get('imports', []):
                    relevant_files.append(Path(file_path))
        
        # Add files that might be relevant based on keywords in the issue
        keywords = set(issue_description.lower().split())
        for symbol_id, symbol in self.code_graph.symbols.items():
            if any(keyword in symbol.name.lower() for keyword in keywords):
                file_path = symbol.location['file']
                relevant_files.append(Path(file_path))
                
        return list(set(relevant_files))[:10]  # Limit to 10 unique files

3. Python Language Analyzer Implementation
# analysis/python_analyzer.py
import ast
from typing import Dict, List, Set, Optional, Any, Union
from pathlib import Path
import symtable
import builtins

from .engine import LanguageAnalyzer, Symbol, CodeRelation

class PythonSymbolVisitor(ast.NodeVisitor):
    """AST visitor to extract symbols from Python code."""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.symbols: List[Symbol] = []
        self.current_scope: List[str] = []
        self.imports: Dict[str, str] = {}  # alias -> module
        
    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        """Visit a class definition."""
        # Create a symbol for the class
        scope = ".".join(self.current_scope) if self.current_scope else None
        
        bases = []
        for base in node.bases:
            if isinstance(base, ast.Name):
                bases.append(base.id)
            elif isinstance(base, ast.Attribute):
                bases.append(f"{base.value.id}.{base.attr}" if hasattr(base.value, 'id') else base.attr)
                
        self.symbols.append(Symbol(
            name=node.name,
            kind='class',
            location={
                'file': self.file_path,
                'line': node.lineno,
                'column': node.col_offset
            },
            scope=scope,
            signature=f"class {node.name}({', '.join(bases)})",
            documentation=ast.get_docstring(node)
        ))
        
        # Visit class body with updated scope
        self.current_scope.append(node.name)
        for item in node.body:
            self.visit(item)
        self.current_scope.pop()
        
    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """Visit a function definition."""
        # Create a symbol for the function
        scope = ".".join(self.current_scope) if self.current_scope else None
        
        # Build function signature
        args_parts = []
        for arg in node.args.args:
            args_parts.append(arg.arg)
        
        if node.args.vararg:
            args_parts.append(f"*{node.args.vararg.arg}")
            
        if node.args.kwarg:
            args_parts.append(f"**{node.args.kwarg.arg}")
            
        self.symbols.append(Symbol(
            name=node.name,
            kind='function',
            location={
                'file': self.file_path,
                'line': node.lineno,
                'column': node.col_offset
            },
            scope=scope,
            signature=f"def {node.name}({', '.join(args_parts)})",
            documentation=ast.get_docstring(node)
        ))
        
        # Visit function body with updated scope
        self.current_scope.append(node.name)
        for item in node.body:
            self.visit(item)
        self.current_scope.pop()
        
    def visit_Import(self, node: ast.Import) -> None:
        """Visit an import statement."""
        for name in node.names:
            alias = name.asname or name.name
            self.imports[alias] = name.name
            
    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        """Visit a from-import statement."""
        module = node.module or ""
        for name in node.names:
            alias = name.asname or name.name
            self.imports[alias] = f"{module}.{name.name}" if module else name.name

class PythonRelationVisitor(ast.NodeVisitor):
    """AST visitor to extract relations from Python code."""
    
    def __init__(self, file_path: str, symbols: Dict[str, str], imports: Dict[str, str]):
        self.file_path = file_path
        self.symbols = symbols
        self.imports = imports
        self.relations: List[CodeRelation] = []
        self.current_scope: List[str] = []
        
    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        """Visit a class definition."""
        class_name = node.name
        scope = ".".join(self.current_scope) if self.current_scope else None
        class_id = f"{scope}.{class_name}" if scope else class_name
        
        # Add inheritance relations
        for base in node.bases:
            if isinstance(base, ast.Name):
                base_name = base.id
                if base_name in self.symbols:
                    self.relations.append(CodeRelation(
                        source=class_id,
                        target=self.symbols[base_name],
                        kind='inherits',
                        location={
                            'file': self.file_path,
                            'line': base.lineno,
                            'column': base.col_offset
                        }
                    ))
        
        # Visit class body with updated scope
        self.current_scope.append(class_name)
        for item in node.body:
            self.visit(item)
        self.current_scope.pop()
        
    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """Visit a function definition."""
        self.current_scope.append(node.name)
        for item in node.body:
            self.visit(item)
        self.current_scope.pop()
        
    def visit_Call(self, node: ast.Call) -> None:
        """Visit a function call."""
        scope = ".".join(self.current_scope) if self.current_scope else None
        source_id = scope
        
        # Determine the called function
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
            if func_name in self.symbols:
                self.relations.append(CodeRelation(
                    source=source_id,
                    target=self.symbols[func_name],
                    kind='calls',
                    location={
                        'file': self.file_path,
                        'line': node.lineno,
                        'column': node.col_offset
                    }
                ))
        elif isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name):
            # Handle method calls like obj.method()
            obj_name = node.func.value.id
            method_name = node.func.attr
            
            if obj_name in self.imports:
                # This might be an imported module
                module_path = self.imports[obj_name]
                full_name = f"{module_path}.{method_name}"
                
                if full_name in self.symbols:
                    self.relations.append(CodeRelation(
                        source=source_id,
                        target=self.symbols[full_name],
                        kind='calls',
                        location={
                            'file': self.file_path,
                            'line': node.lineno,
                            'column': node.col_offset
                        }
                    ))
        
        # Visit arguments
        for arg in node.args:
            self.visit(arg)
        for keyword in node.keywords:
            self.visit(keyword.value)

class PythonAnalyzer(LanguageAnalyzer):
    """Analyzer for Python code."""
    
    def analyze_file(self, file_path: Path, content: str) -> Dict[str, Any]:
        """Analyze a Python file."""
        try:
            tree = ast.parse(content)
            
            # Extract symbols
            symbol_visitor = PythonSymbolVisitor(str(file_path))
            symbol_visitor.visit(tree)
            
            return {
                'ast': tree,
                'symbols': symbol_visitor.symbols,
                'imports': symbol_visitor.imports
            }
        except SyntaxError as e:
            print(f"Syntax error in {file_path}: {e}")
            return {
                'ast': None,
                'symbols': [],
                'imports': {}
            }
        
    def extract_symbols(self, file_analysis: Dict[str, Any]) -> List[Symbol]:
        """Extract symbols from a file analysis."""
        return file_analysis.get('symbols', [])
        
    def extract_relations(self, file_analysis: Dict[str, Any], symbols: Dict[str, str]) -> List[CodeRelation]:
        """Extract relations between symbols."""
        if not file_analysis.get('ast'):
            return []
            
        ast_tree = file_analysis['ast']
        imports = file_analysis.get('imports', {})
        file_path = file_analysis.get('symbols', [{}])[0].get('location', {}).get('file', '')
        
        relation_visitor = PythonRelationVisitor(file_path, symbols, imports)
        relation_visitor.visit(ast_tree)
        
        return relation_visitor.relations

4. Multi-Model AI Orchestration
# ai/orchestrator.py
from typing import Dict, List, Any, Optional, Union, Callable
from dataclasses import dataclass
import asyncio
from pathlib import Path
import json
import time
import os
from enum import Enum, auto

@dataclass
class AIRequest:
    """A request to be processed by an AI model."""
    prompt: str
    system_message: str
    model: str
    temperature: float = 0.2
    max_tokens: int = 4000
    context_files: List[str] = None
    
@dataclass
class AIResponse:
    """A response from an AI model."""
    content: str
    model: str
    tokens_used: int
    timing: float
    error: Optional[str] = None

class AITaskType(Enum):
    """Types of AI tasks for specialized handling."""
    CODE_UNDERSTANDING = auto()
    BUG_DIAGNOSIS = auto()
    SOLUTION_GENERATION = auto()
    CODE_EXPLANATION = auto()
    TEST_GENERATION = auto()
    DEPENDENCY_ANALYSIS = auto()

class AIOrchestrator:
    """Orchestrates AI interactions, managing multiple models and request routing."""
    
    def __init__(self):
        self.providers: Dict[str, Any] = {}
        self.model_capabilities: Dict[str, List[AITaskType]] = {}
        self.default_models: Dict[AITaskType, str] = {}
        self.conversations: Dict[str, List[Dict[str, Any]]] = {}
        
    def register_provider(self, name: str, provider: Any) -> None:
        """Register an AI provider."""
        self.providers[name] = provider
        
    def register_model(self, model_name: str, provider: str, capabilities: List[AITaskType]) -> None:
        """Register a model with its capabilities."""
        self.model_capabilities[model_name] = capabilities
        
        # Set as default for capabilities if not already set
        for capability in capabilities:
            if capability not in self.default_models:
                self.default_models[capability] = model_name
                
    def set_default_model(self, task_type: AITaskType, model_name: str) -> None:
        """Set the default model for a task type."""
        if model_name not in self.model_capabilities:
            raise ValueError(f"Unknown model: {model_name}")
            
        if task_type not in self.model_capabilities[model_name]:
            raise ValueError(f"Model {model_name} does not support task type {task_type}")
            
        self.default_models[task_type] = model_name
        
    def get_provider_for_model(self, model_name: str) -> Any:
        """Get the provider for a model."""
        for provider_name, provider in self.providers.items():
            if provider.supports_model(model_name):
                return provider
                
        raise ValueError(f"No provider supports model: {model_name}")
        
    async def execute_request(self, request: AIRequest) -> AIResponse:
        """Execute an AI request."""
        model = request.model
        provider = self.get_provider_for_model(model)
        
        start_time = time.time()
        try:
            response_data = await provider.generate_async(
                prompt=request.prompt,
                system_message=request.system_message,
                model=model,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )
            
            return AIResponse(
                content=response_data.get('content', ''),
                model=model,
                tokens_used=response_data.get('tokens_used', 0),
                timing=time.time() - start_time
            )
        except Exception as e:
            return AIResponse(
                content='',
                model=model,
                tokens_used=0,
                timing=time.time() - start_time,
                error=str(e)
            )
            
    async def execute_task(
        self, 
        task_type: AITaskType, 
        prompt: str, 
        system_message: str,
        context_files: List[str] = None,
        model: Optional[str] = None
    ) -> AIResponse:
        """Execute a task using the appropriate model."""
        if model is None:
            model = self.default_models.get(task_type)
            if not model:
                raise ValueError(f"No default model for task type: {task_type}")
                
        request = AIRequest(
            prompt=prompt,
            system_message=system_message,
            model=model,
            context_files=context_files
        )
        
        return await self.execute_request(request)
        
    def create_conversation(self, id: Optional[str] = None) -> str:
        """Create a new conversation."""
        if id is None:
            id = f"conv_{int(time.time())}"
            
        self.conversations[id] = []
        return id
        
    async def add_to_conversation(
        self, 
        conversation_id: str, 
        user_message: str, 
        system_message: str,
        model: Optional[str] = None,
        task_type: Optional[AITaskType] = None
    ) -> AIResponse:
        """Add a message to a conversation and get a response."""
        if conversation_id not in self.conversations:
            self.create_conversation(conversation_id)
            
        # Determine model to use
        if model is None and task_type is not None:
            model = self.default_models.get(task_type)
            
        if model is None:
            model = next(iter(self.model_capabilities.keys()))  # Use first registered model
            
        # Construct conversation history
        conversation = self.conversations[conversation_id]
        
        # Build prompt with conversation history
        full_prompt = ""
        for message in conversation:
            if message['role'] == 'user':
                full_prompt += f"Human: {message['content']}\n\n"
            else:
                full_prompt += f"Assistant: {message['content']}\n\n"
                
        full_prompt += f"Human: {user_message}\n\nAssistant: "
        
        # Create request
        request = AIRequest(
            prompt=full_prompt,
            system_message=system_message,
            model=model
        )
        
        # Execute request
        response = await self.execute_request(request)
        
        # Add to conversation history
        conversation.append({'role': 'user', 'content': user_message})
        conversation.append({'role': 'assistant', 'content': response.content})
        
        return response

5. Advanced AI Provider Implementations
# ai/providers.py
from typing import Dict, List, Any, Optional, Set
import aiohttp
import os
import json
import time
from abc import ABC, abstractmethod

class AIProvider(ABC):
    """Base class for AI providers."""
    
    @abstractmethod
    async def generate_async(
        self, 
        prompt: str, 
        system_message: str, 
        model: str, 
        temperature: float = 0.2,
        max_tokens: int = 4000
    ) -> Dict[str, Any]:
        """Generate a response asynchronously."""
        pass
        
    @abstractmethod
    def supports_model(self, model: str) -> bool:
        """Check if this provider supports the given model."""
        pass

class AnthropicProvider(AIProvider):
    """Provider for Anthropic's Claude models."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key is required")
            
        self.supported_models = {
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307",
            "claude-2.1",
            "claude-2.0",
            "claude-instant-1.2"
        }
        
    async def generate_async(
        self, 
        prompt: str, 
        system_message: str, 
        model: str, 
        temperature: float = 0.2,
        max_tokens: int = 4000
    ) -> Dict[str, Any]:
        """Generate a response using Anthropic's API asynchronously."""
        if not self.supports_model(model):
            raise ValueError(f"Model {model} not supported by Anthropic")
            
        url = "https://api.anthropic.com/v1/messages"
        
        headers = {
            "Content-Type": "application/json",
            "X-Api-Key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "system": system_message,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise ValueError(f"Anthropic API error ({response.status}): {error_text}")
                    
                result = await response.json()
                
                return {
                    "content": result["content"][0]["text"],
                    "tokens_used": result.get("usage", {}).get("output_tokens", 0),
                    "model": model
                }
                
    def supports_model(self, model: str) -> bool:
        """Check if this provider supports the given model."""
        return model in self.supported_models

class OpenAIProvider(AIProvider):
    """Provider for OpenAI models."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
            
        self.supported_models = {
            "gpt-4o",
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo"
        }
        
    async def generate_async(
        self, 
        prompt: str, 
        system_message: str, 
        model: str, 
        temperature: float = 0.2,
        max_tokens: int = 4000
    ) -> Dict[str, Any]:
        """Generate a response using OpenAI's API asynchronously."""
        if not self.supports_model(model):
            raise ValueError(f"Model {model} not supported by OpenAI")
            
        url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        
        data = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise ValueError(f"OpenAI API error ({response.status}): {error_text}")
                    
                result = await response.json()
                
                return {
                    "content": result["choices"][0]["message"]["content"],
                    "tokens_used": result.get("usage", {}).get("completion_tokens", 0),
                    "model": model
                }
                
    def supports_model(self, model: str) -> bool:
        """Check if this provider supports the given model."""
        return model in self.supported_models

6. Workspace & Project Management
# workspace/manager.py
from typing import Dict, List, Optional, Set, Any
from pathlib import Path
import json
import os
import shutil
import time
import tempfile
import git
from dataclasses import dataclass, field
import subprocess

@dataclass
class CodeSnapshot:
    """A snapshot of code at a point in time."""
    id: str
    timestamp: float
    description: str
    files: Dict[str, str]  # path -> content
    parent_id: Optional[str] = None

@dataclass
class Project:
    """Represents a code project."""
    name: str
    root_path: Path
    git_repo: Optional[git.Repo] = None
    snapshots: Dict[str, CodeSnapshot] = field(default_factory=dict)
    current_snapshot_id: Optional[str] = None
    ignored_patterns: List[str] = field(default_factory=lambda: ['.git', '__pycache__', '*.pyc', 'node_modules'])
    metadata: Dict[str, Any] = field(default_factory=dict)

class WorkspaceManager:
    """Manages code projects and their snapshots."""
    
    def __init__(self, workspace_dir: Path):
        self.workspace_dir = workspace_dir
        self.projects: Dict[str, Project] = {}
        self.workspace_dir.mkdir(parents=True, exist_ok=True)
        self._load_projects()
        
    def _load_projects(self) -> None:
        """Load projects from the workspace directory."""
        for project_dir in self.workspace_dir.iterdir():
            if project_dir.is_dir():
                project_file = project_dir / ".code_navigator" / "project.json"
                if project_file.exists():
                    try:
                        with open(project_file, 'r') as f:
                            project_data = json.load(f)
                            
                        project = Project(
                            name=project_data['name'],
                            root_path=project_dir,
                            ignored_patterns=project_data.get('ignored_patterns', []),
                            metadata=project_data.get('metadata', {})
                        )
                        
                        # Try to load git repo if it exists
                        try:
                            project.git_repo = git.Repo(project_dir)
                        except git.InvalidGitRepositoryError:
                            pass
                            
                        # Load snapshots
                        snapshots_dir = project_dir / ".code_navigator" / "snapshots"
                        if snapshots_dir.exists():
                            for snapshot_file in snapshots_dir.glob("*.json"):
                                with open(snapshot_file, 'r') as f:
                                    snapshot_data = json.load(f)
                                    
                                snapshot = CodeSnapshot(
                                    id=snapshot_data['id'],
                                    timestamp=snapshot_data['timestamp'],
                                    description=snapshot_data['description'],
                                    files=snapshot_data['files'],
                                    parent_id=snapshot_data.get('parent_id')
                                )
                                
                                project.snapshots[snapshot.id] = snapshot
                                
                            # Set current snapshot
                            project.current_snapshot_id = project_data.get('current_snapshot_id')
                            
                        self.projects[project.name] = project
                    except Exception as e:
                        print(f"Error loading project {project_dir}: {e}")
                        
    def create_project(self, name: str, path: Path) -> Project:
        """Create a new project."""
        if name in self.projects:
            raise ValueError(f"Project {name} already exists")
            
        project_dir = self.workspace_dir / name
        project_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize project structure
        code_nav_dir = project_dir / ".code_navigator"
        code_nav_dir.mkdir(exist_ok=True)
        (code_nav_dir / "snapshots").mkdir(exist_ok=True)
        
        # Create project metadata
        project = Project(
            name=name,
            root_path=project_dir
        )
        
        # Copy code from path if provided
        if path and path.exists():
            self._copy_code(path, project_dir, project.ignored_patterns)
            
            # Check if it's a git repo
            try:
                project.git_repo = git.Repo(path)
            except git.InvalidGitRepositoryError:
                pass
        
        # Save project metadata
        self._save_project(project)
        
        self.projects[name] = project
        return project
        
    def _copy_code(self, source: Path, dest: Path, ignored_patterns: List[str]) -> None:
        """Copy code from source to destination, respecting ignored patterns."""
        def should_ignore(path: Path) -> bool:
            """Check if path should be ignored."""
            path_str = str(path)
            return any(pat in path_str for pat in ignored_patterns)
        
        for item in source.iterdir():
            if item.is_dir():
                if not should_ignore(item):
                    dest_dir = dest / item.name
                    dest_dir.mkdir(exist_ok=True)
                    self._copy_code(item, dest_dir, ignored_patterns)
            else:
                if not should_ignore(item):
                    shutil.copy2(item, dest / item.name)
                    
    def _save_project(self, project: Project) -> None:
        """Save project metadata."""
        project_file = project.root_path / ".code_navigator" / "project.json"
        
        project_data = {
            'name': project.name,
            'ignored_patterns': project.ignored_patterns,
            'current_snapshot_id': project.current_snapshot_id,
            'metadata': project.metadata
        }
        
        with open(project_file, 'w') as f:
            json.dump(project_data, f, indent=2)
            
    def create_snapshot(self, project_name: str, description: str) -> CodeSnapshot:
        """Create a snapshot of the current project state."""
        if project_name not in self.projects:
            raise ValueError(f"Project {project_name} does not exist")
            
        project = self.projects[project_name]
        
        # Generate snapshot ID
        snapshot_id = f"snapshot_{int(time.time())}"
        
        # Collect file contents
        files = {}
        for file_path in self._list_code_files(project.root_path, project.ignored_patterns):
            rel_path = str(file_path.relative_to(project.root_path))
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                files[rel_path] = content
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                
        # Create snapshot
        snapshot = CodeSnapshot(
            id=snapshot_id,
            timestamp=time.time(),
            description=description,
            files=files,
            parent_id=project.current_snapshot_id
        )
        
        # Save snapshot
        snapshot_file = project.root_path / ".code_navigator" / "snapshots" / f"{snapshot_id}.json"
        with open(snapshot_file, 'w') as f:
            json.dump({
                'id': snapshot.id,
                'timestamp': snapshot.timestamp,
                'description': snapshot.description,
                'parent_id': snapshot.parent_id,
                'files': snapshot.files
            }, f)
            
        # Update project
        project.snapshots[snapshot_id] = snapshot
        project.current_snapshot_id = snapshot_id
        self._save_project(project)
        
        return snapshot
        
    def restore_snapshot(self, project_name: str, snapshot_id: str) -> None:
        """Restore a project to a previous snapshot."""
        if project_name not in self.projects:
            raise ValueError(f"Project {project_name} does not exist")
            
        project = self.projects[project_name]
        
        if snapshot_id not in project.snapshots:
            raise ValueError(f"Snapshot {snapshot_id} does not exist")
            
        snapshot = project.snapshots[snapshot_id]
        
        # Backup current state first
        backup_snapshot = self.create_snapshot(project_name, f"Backup before restoring {snapshot_id}")
        
        # Restore files
        for rel_path, content in snapshot.files.items():
            file_path = project.root_path / rel_path
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
        # Update project
        project.current_snapshot_id = snapshot_id
        self._save_project(project)
        
    def _list_code_files(self, directory: Path, ignored_patterns: List[str]) -> List[Path]:
        """List all code files in a directory, respecting ignored patterns."""
        code_files = []
        
        for item in directory.iterdir():
            # Check if item should be ignored
            if any(pat in str(item) for pat in ignored_patterns):
                continue
                
            if item.is_dir():
                code_files.extend(self._list_code_files(item, ignored_patterns))
            else:
                # Simple heuristic for code files - could be improved
                if item.suffix.lower() in ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.h', '.go', '.rb', '.php']:
                    code_files.append(item)
                    
        return code_files
        
    def get_git_history(self, project_name: str, max_commits: int = 20) -> List[Dict[str, Any]]:
        """Get git history for a project."""
        if project_name not in self.projects:
            raise ValueError(f"Project {project_name} does not exist")
            
        project = self.projects[project_name]
        
        if not project.git_repo:
            return []
            
        commits = []
        for commit in project.git_repo.iter_commits(max_count=max_commits):
            commits.append({
                'hash': commit.hexsha,
                'message': commit.message,
                'author': commit.author.name,
                'date': commit.committed_datetime.isoformat(),
                'files': [item.a_path for item in commit.diff(commit.parents[0])] if commit.parents else []
            })
            
        return commits
        
    def run_command(self, project_name: str, command: List[str]) -> Dict[str, Any]:
        """Run a command in the project directory."""
        if project_name not in self.projects:
            raise ValueError(f"Project {project_name} does not exist")
            
        project = self.projects[project_name]
        
        try:
            result = subprocess.run(
                command,
                cwd=project.root_path,
                capture_output=True,
                text=True,
                timeout=60  # 1 minute timeout
            )
            
            return {
                'success': result.returncode == 0,
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr
            }
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Command timed out'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

7. Terminal UI with Rich
# ui/terminal.py
from typing import Dict, List, Optional, Any, Callable
import asyncio
from pathlib import Path
import os
from datetime import datetime
import threading
import queue
import signal
import sys
from enum import Enum, auto
import re

from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.widgets import Header, Footer, Button, Static, Input, TextArea, TreeControl, Tree, Label
from textual.reactive import reactive
from textual.message import Message
from textual import events
from textual.binding import Binding

from ..core.navigator import CodeNavigator
from ..workspace.manager import WorkspaceManager, Project
from ..ai.orchestrator import AIOrchestrator, AITaskType

class TabType(Enum):
    CODE = auto()
    CHAT = auto()
    ANALYSIS = auto()

class Tab:
    """Represents a tab in the UI."""
    
    def __init__(self, title: str, type: TabType, content: Any):
        self.title = title
        self.type = type
        self.content = content
        
class CodeTab(Tab):
    """A tab for viewing/editing code."""
    
    def __init__(self, title: str, file_path: Path, content: str):
        super().__init__(title, TabType.CODE, content)
        self.file_path = file_path
        self.unsaved_changes = False
        
class ChatTab(Tab):
    """A tab for AI chat interactions."""
    
    def __init__(self, title: str, conversation_id: str):
        super().__init__(title, TabType.CHAT, [])
        self.conversation_id = conversation_id
        
class AnalysisTab(Tab):
    """A tab for code analysis results."""
    
    def __init__(self, title: str, analysis_type: str, analysis_data: Any):
        super().__init__(title, TabType.ANALYSIS, analysis_data)
        self.analysis_type = analysis_type

class CodeFileTree(TreeControl):
    """A tree view for code files."""
    
    def __init__(self, root_path: Path, navigator: CodeNavigator):
        super().__init__("Project", {})
        self.root_path = root_path
        self.navigator = navigator
        
    async def on_mount(self) -> None:
        """Load the file tree when mounted."""
        await self.load_directory(self.root_path, self.root)
        await self.root.expand()
        
    async def load_directory(self, path: Path, node) -> None:
        """Load a directory into the tree."""
        for item in sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name)):
            # Skip hidden files and directories
            if item.name.startswith('.'):
                continue
                
            if item.is_dir():
                dir_node = await self.add(node, item.name, {"path": item, "is_dir": True})
                await self.load_directory(item, dir_node)
            else:
                await self.add(node, item.name, {"path": item, "is_dir": False})
                
    async def on_tree_node_selected(self, event) -> None:
        """Handle node selection."""
        node = event.node
        data = node.data
        
        if not data.get("is_dir", True):
            # It's a file, open it
            await self.emit(OpenFileRequest(data["path"]))

class OpenFileRequest(Message):
    """Message to request opening a file."""
    
    def __init__(self, file_path: Path):
        super().__init__()
        self.file_path = file_path

class CodeNavigatorApp(App):
    """Main application for the CodeNavigator TUI."""
    
    TITLE = "CodeNavigator"
    CSS_PATH = "styles.css"
    
    BINDINGS = [
        Binding("ctrl+q", "quit", "Quit"),
        Binding("ctrl+o", "open_file", "Open File"),
        Binding("ctrl+s", "save_file", "Save"),
        Binding("ctrl+n", "new_tab", "New Tab"),
        Binding("ctrl+w", "close_tab", "Close Tab"),
        Binding("f5", "analyze", "Analyze"),
        Binding("f1", "help", "Help")
    ]
    
    def __init__(self, navigator: CodeNavigator, workspace: WorkspaceManager, project: Project):
        super().__init__()
        self.navigator = navigator
        self.workspace = workspace
        self.project = project
        self.tabs: List[Tab] = []
        self.current_tab_index = 0
        self.ai_orchestrator = AIOrchestrator()
        
    def compose(self) -> ComposeResult:
        """Compose the app layout."""
        yield Header()
        
        with Horizontal():
            with Container(id="sidebar"):
                yield Static("Project Explorer", id="explorer-header")
                yield CodeFileTree(self.project.root_path, self.navigator)
                
            with Container(id="main-panel"):
                with Container(id="tab-bar"):
                    yield Button("+ New Tab", id="new-tab-btn")
                
                with Container(id="tab-content"):
                    yield TextArea("Welcome to CodeNavigator!", language="markdown")
                    
                with Container(id="status-bar"):
                    yield Label("Ready", id="status")
                    
        yield Footer()
        
    def on_mount(self) -> None:
        """Handle app mount."""
        # Create a welcome tab
        welcome_content = """
# Welcome to CodeNavigator

CodeNavigator is an AI-powered coding assistant that helps you understand, debug, and improve your codebase.

## Getting Started

1. Browse your project files in the sidebar
2. Click on a file to open it
3. Use the AI to analyze issues or suggest improvements

## Keyboard Shortcuts

- Ctrl+O: Open file
- Ctrl+S: Save current file
- Ctrl+N: New tab
- Ctrl+W: Close current tab
- F5: Analyze current file/selection
- F1: Show help
        """
        
        welcome_tab = Tab("Welcome", TabType.ANALYSIS, welcome_content)
        self.tabs.append(welcome_tab)
        self.update_tabs()
        
    def update_tabs(self) -> None:
        """Update the tab display."""
        tab_bar = self.query_one("#tab-bar")
        tab_bar.remove_children()
        
        for i, tab in enumerate(self.tabs):
            btn = Button(
                tab.title + (" *" if getattr(tab, "unsaved_changes", False) else ""),
                classes=("active" if i == self.current_tab_index else "")
            )
            btn.data = i  # Store tab index
            tab_bar.mount(btn)
            
        tab_bar.mount(Button("+ New Tab", id="new-tab-btn"))
        
        # Update content
        self.update_content()
        
    def update_content(self) -> None:
        """Update the content area based on current tab."""
        if not self.tabs:
            return
            
        content_area = self.query_one("#tab-content")
        content_area.remove_children()
        
        current_tab = self.tabs[self.current_tab_index]
        
        if current_tab.type == TabType.CODE:
            editor = TextArea(
                current_tab.content,
                language=self._get_language(current_tab.file_path)
            )
            content_area.mount(editor)
        elif current_tab.type == TabType.CHAT:
            chat_container = Vertical()
            
            # Add messages
            for message in current_tab.content:
                if message['role'] == 'user':
                    label = Label(f"You: {message['content']}", classes=("user-message",))
                else:
                    label = Label(f"AI: {message['content']}", classes=("ai-message",))
                chat_container.mount(label)
                
            # Add input
            input_box = Input(placeholder="Type your message...", id="chat-input")
            chat_container.mount(input_box)
            
            content_area.mount(chat_container)
        elif current_tab.type == TabType.ANALYSIS:
            text_area = TextArea(current_tab.content, language="markdown")
            content_area.mount(text_area)
            
    def _get_language(self, file_path: Path) -> str:
        """Get the language for syntax highlighting based on file extension."""
        ext = file_path.suffix.lower()
        language_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.html': 'html',
            '.css': 'css',
            '.json': 'json',
            '.md': 'markdown',
            '.java': 'java',
            '.c': 'c',
            '.cpp': 'cpp',
            '.go': 'go',
            '.rb': 'ruby',
            '.php': 'php'
        }
        return language_map.get(ext, 'text')
        
    async def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button presses."""
        button = event.button
        
        if button.id == "new-tab-btn":
            await self.action_new_tab()
        elif hasattr(button, "data") and isinstance(button.data, int):
            # Tab button
            self.current_tab_index = button.data
            self.update_tabs()
            
    async def on_open_file_request(self, event: OpenFileRequest) -> None:
        """Handle request to open a file."""
        file_path = event.file_path
        
        # Check if file is already open
        for i, tab in enumerate(self.tabs):
            if isinstance(tab, CodeTab) and tab.file_path == file_path:
                self.current_tab_index = i
                self.update_tabs()
                return
                
        # Open the file
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            tab = CodeTab(file_path.name, file_path, content)
            self.tabs.append(tab)
            self.current_tab_index = len(self.tabs) - 1
            self.update_tabs()
        except Exception as e:
            self.notify(f"Error opening file: {e}", severity="error")
            
    async def action_open_file(self) -> None:
        """Action to open a file."""
        # This would normally show a file picker
        # For now, just print a message
        self.notify("Use the file tree to open files")
        
    async def action_save_file(self) -> None:
        """Action to save the current file."""
        if not self.tabs or self.current_tab_index >= len(self.tabs):
            return
            
        current_tab = self.tabs[self.current_tab_index]
        
        if not isinstance(current_tab, CodeTab):
            return
            
        # Get content from editor
        editor = self.query_one(TextArea)
        content = editor.text
        
        try:
            with open(current_tab.file_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            current_tab.content = content
            current_tab.unsaved_changes = False
            self.update_tabs()
            self.notify(f"Saved {current_tab.file_path.name}")
        except Exception as e:
            self.notify(f"Error saving file: {e}", severity="error")
            
    async def action_new_tab(self) -> None:
        """Action to create a new tab."""
        # Create a chat tab
        conversation_id = f"chat_{int(datetime.now().timestamp())}"
        tab = ChatTab("New Chat", conversation_id)
        self.tabs.append(tab)
        self.current_tab_index = len(self.tabs) - 1
        self.update_tabs()
        
    async def action_close_tab(self) -> None:
        """Action to close the current tab."""
        if not self.tabs:
            return
            
        current_tab = self.tabs[self.current_tab_index]
        
        # Check for unsaved changes
        if isinstance(current_tab, CodeTab) and current_tab.unsaved_changes:
            # Would normally show a confirmation dialog
            # For now, just notify
            self.notify("Tab has unsaved changes", severity="warning")
            return
            
        # Remove tab
        self.tabs.pop(self.current_tab_index)
        
        # Update current tab index
        if self.tabs:
            self.current_tab_index = min(self.current_tab_index, len(self.tabs) - 1)
        else:
            self.current_tab_index = 0
            
        self.update_tabs()
        
    async def action_analyze(self) -> None:
        """Action to analyze the current file or selection."""
        if not self.tabs:
            return
            
        current_tab = self.tabs[self.current_tab_index]
        
        if isinstance(current_tab, CodeTab):
            # Get content from editor
            editor = self.query_one(TextArea)
            content = editor.text
            
            # Create analysis task
            self.notify("Analyzing code...")
            
            # This would normally be done asynchronously
            # For now, just create a simple analysis tab
            analysis = f"""
# Analysis of {current_tab.file_path.name}

## Overview
This file contains approximately {len(content.splitlines())} lines of code.

## Structure
- Functions: {len(re.findall(r'def\s+\w+\s*\(', content))}
- Classes: {len(re.findall(r'class\s+\w+\s*(\(|:)', content))}
- Imports: {len(re.findall(r'import\s+\w+', content))}

## Suggestions
1. Consider adding more documentation
2. Review error handling
3. Add unit tests for key functionality
            """
            
            tab = AnalysisTab(f"Analysis: {current_tab.file_path.name}", "code_analysis", analysis)
            self.tabs.append(tab)
            self.current_tab_index = len(self.tabs) - 1
            self.update_tabs()
        
    async def on_input_submitted(self, event: Input.Submitted) -> None:
        """Handle input submission."""
        if event.input.id == "chat-input":
            message = event.value
            
            if not message.strip():
                return
                
            current_tab = self.tabs[self.current_tab_index]
            
            if isinstance(current_tab, ChatTab):
                # Add user message
                current_tab.content.append({
                    'role': 'user',
                    'content': message
                })
                
                # Clear input
                event.input.value = ""
                
                # Update display
                self.update_content()
                
                # Get AI response (would normally be async)
                self.notify("AI is thinking...")
                
                # Simulate AI response
                response = "I'll analyze this code for you. It looks like there might be an issue with the error handling in the function. Let me suggest a better approach..."
                
                current_tab.content.append({
                    'role': 'assistant',
                    'content': response
                })
                
                # Update display again
                self.update_content()

8. Enhanced CLI Interface with Rich
# cli/enhanced_cli.py
import typer
from rich.console import Console
from rich.markdown import Markdown
from rich.syntax import Syntax
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
from rich import print as rprint
from pathlib import Path
from typing import Optional, List, Dict, Any
import os
import asyncio
import sys
from enum import Enum

from ..core.navigator import CodeNavigator
from ..workspace.manager import WorkspaceManager
from ..ai.orchestrator import AIOrchestrator, AITaskType
from ..ai.providers import AnthropicProvider, OpenAIProvider

console = Console()
app = typer.Typer(help="CodeNavigator: AI-powered code assistant")

# State
state = {
    "navigator": None,
    "workspace": None,
    "project": None,
    "ai_orchestrator": None
}

class ProviderType(str, Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"

def init_navigator(project_path: Path) -> CodeNavigator:
    """Initialize or get the navigator."""
    if state["navigator"] is None or state["project"] is None or str(state["project"].root_path) != str(project_path):
        # Initialize workspace if needed
        if state["workspace"] is None:
            workspace_dir = Path.home() / ".code_navigator" / "workspace"
            state["workspace"] = WorkspaceManager(workspace_dir)
            
        # Get or create project
        project_name = project_path.name
        
        if project_name in state["workspace"].projects:
            state["project"] = state["workspace"].projects[project_name]
        else:
            state["project"] = state["workspace"].create_project(project_name, project_path)
            
        # Create navigator
        state["navigator"] = CodeNavigator(project_path)
        
        # Initialize AI orchestrator if needed
        if state["ai_orchestrator"] is None:
            state["ai_orchestrator"] = AIOrchestrator()
            
            # Register providers
            try:
                state["ai_orchestrator"].register_provider("anthropic", AnthropicProvider())
            except ValueError:
                console.print("[yellow]Anthropic API key not found. Claude models unavailable.[/yellow]")
                
            try:
                state["ai_orchestrator"].register_provider("openai", OpenAIProvider())
            except ValueError:
                console.print("[yellow]OpenAI API key not found. GPT models unavailable.[/yellow]")
                
            # Register models
            try:
                state["ai_orchestrator"].register_model(
                    "claude-3-opus-20240229", 
                    "anthropic", 
                    [AITaskType.CODE_UNDERSTANDING, AITaskType.BUG_DIAGNOSIS, AITaskType.SOLUTION_GENERATION]
                )
                state["ai_orchestrator"].register_model(
                    "gpt-4o", 
                    "openai", 
                    [AITaskType.CODE_UNDERSTANDING, AITaskType.BUG_DIAGNOSIS, AITaskType.SOLUTION_GENERATION]
                )
            except:
                pass
    
    return state["navigator"]

@app.command()
def init(
    path: Path = typer.Argument(
        Path("."), help="Path to the codebase to analyze"
    ),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable verbose output"),
    reindex: bool = typer.Option(False, "--reindex", "-r", help="Force reindexing")
):
    """Initialize and index a codebase."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[bold blue]Indexing codebase...", total=None)
        
        # Initialize or reindex
        navigator.initialize(verbose=verbose, force_reindex=reindex)
        
        progress.update(task, completed=True)
        
    console.print(f"[bold green]✓ Codebase successfully indexed![/bold green]")
    console.print(f"Found {len(navigator.index.files)} files")
    
    # Display basic stats
    languages = {}
    for file_path, file_info in navigator.index.files.items():
        ext = Path(file_path).suffix
        languages[ext] = languages.get(ext, 0) + 1
        
    if languages:
        table = Table(title="Language Distribution")
        table.add_column("Language", style="cyan")
        table.add_column("Files", style="magenta")
        
        for ext, count in sorted(languages.items(), key=lambda x: x[1], reverse=True):
            lang = ext[1:] if ext.startswith('.') else ext
            table.add_row(lang, str(count))
            
        console.print(table)

@app.command()
def diagnose(
    issue: str = typer.Argument(..., help="Description of the issue to diagnose"),
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="Focus on a specific file"),
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    ),
    provider: ProviderType = typer.Option(
        ProviderType.ANTHROPIC, "--provider", help="AI provider to use"
    )
):
    """Diagnose an issue in the codebase."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[bold blue]Analyzing issue...", total=None)
        
        # Handle file path
        if file:
            file = path / file if not file.is_absolute() else file
        
        # Diagnose issue
        response = navigator.diagnose_issue(
            issue_description=issue, 
            focus_file=file,
            provider=provider.value
        )
        
        progress.update(task, completed=True)
    
    # Display response
    console.print("\n[bold]AI Analysis:[/bold]")
    console.print(Markdown(response))
    
    # Extract changes if any
    changes = navigator.change_manager.extract_changes_from_response(response)
    
    if changes:
        console.print("\n[bold]Proposed Changes:[/bold]")
        for line in navigator.change_manager.preview_changes(changes):
            console.print(line)
        
        if typer.confirm("Apply these changes?"):
            applied_files = navigator.change_manager.apply_changes(changes)
            console.print(f"[green]Applied changes to {len(applied_files)} files[/green]")
            
            # Create a snapshot
            if state["workspace"] and state["project"]:
                snapshot = state["workspace"].create_snapshot(
                    state["project"].name,
                    f"Changes from AI diagnosis: {issue[:50]}..."
                )
                console.print(f"[green]Created snapshot: {snapshot.id}[/green]")

@app.command()
def improve(
    description: str = typer.Argument(..., help="Description of the improvement to make"),
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="Focus on a specific file"),
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    ),
    provider: ProviderType = typer.Option(
        ProviderType.ANTHROPIC, "--provider", help="AI provider to use"
    )
):
    """Suggest improvements to the codebase."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[bold blue]Analyzing improvement opportunity...", total=None)
        
        # Handle file path
        if file:
            file = path / file if not file.is_absolute() else file
        
        # Get improvement suggestions
        response = navigator.suggest_improvements(
            description=description, 
            focus_file=file,
            provider=provider.value
        )
        
        progress.update(task, completed=True)
    
    # Display response
    console.print("\n[bold]AI Suggestions:[/bold]")
    console.print(Markdown(response))
    
    # Extract changes if any
    changes = navigator.change_manager.extract_changes_from_response(response)
    
    if changes:
        console.print("\n[bold]Proposed Changes:[/bold]")
        for line in navigator.change_manager.preview_changes(changes):
            console.print(line)
        
        if typer.confirm("Apply these changes?"):
            applied_files = navigator.change_manager.apply_changes(changes)
            console.print(f"[green]Applied changes to {len(applied_files)} files[/green]")
            
            # Create a snapshot
            if state["workspace"] and state["project"]:
                snapshot = state["workspace"].create_snapshot(
                    state["project"].name,
                    f"Improvements: {description[:50]}..."
                )
                console.print(f"[green]Created snapshot: {snapshot.id}[/green]")

@app.command()
def analyze(
    file: Path = typer.Argument(..., help="File to analyze"),
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    ),
    provider: ProviderType = typer.Option(
        ProviderType.ANTHROPIC, "--provider", help="AI provider to use"
    )
):
    """Analyze a specific file for potential issues and improvements."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    file_path = path / file if not file.is_absolute() else file
    
    if not file_path.exists():
        console.print(f"[red]Error: File {file_path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[bold blue]Analyzing file...", total=None)
        
        # Analyze file
        analysis = navigator.analyze_file(
            file_path=file_path,
            provider=provider.value
        )
        
        progress.update(task, completed=True)
    
    # Display analysis
    console.print("\n[bold]File Analysis:[/bold]")
    console.print(Markdown(analysis))

@app.command()
def visualize(
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="Focus on a specific file"),
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    ),
    output: Path = typer.Option(
        Path("codebase_graph.html"), "--output", "-o", help="Output file for visualization"
    )
):
    """Generate a visualization of the codebase structure."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[bold blue]Generating visualization...", total=None)
        
        # Handle file path
        if file:
            file = path / file if not file.is_absolute() else file
        
        # Generate visualization
        visualization_path = navigator.generate_visualization(
            output_path=output,
            focus_file=file
        )
        
        progress.update(task, completed=True)
    
    console.print(f"[green]Visualization generated: {visualization_path}[/green]")
    console.print("Open this file in a web browser to view the interactive visualization.")

@app.command()
def chat(
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    ),
    provider: ProviderType = typer.Option(
        ProviderType.ANTHROPIC, "--provider", help="AI provider to use"
    )
):
    """Start an interactive chat session with the AI assistant."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    console.print("[bold]CodeNavigator Chat[/bold]")
    console.print("Type your questions about the codebase. Type 'exit' to quit.")
    
    conversation_id = f"cli_chat_{int(time.time())}"
    
    while True:
        try:
            user_input = typer.prompt("\nYou")
            
            if user_input.lower() in ('exit', 'quit'):
                break
                
            with Progress(
                SpinnerColumn(),
                TextColumn("[bold blue]{task.description}"),
                console=console
            ) as progress:
                task = progress.add_task("[bold blue]AI is thinking...", total=None)
                
                # Get AI response
                response = navigator.chat(
                    message=user_input,
                    conversation_id=conversation_id,
                    provider=provider.value
                )
                
                progress.update(task, completed=True)
            
            console.print("\n[bold cyan]AI:[/bold cyan]")
            console.print(Markdown(response))
            
        except KeyboardInterrupt:
            console.print("\n[yellow]Chat session ended.[/yellow]")
            break
            
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")

@app.command()
def ui(
    path: Path = typer.Argument(
        Path("."), help="Path to the codebase"
    )
):
    """Launch the terminal UI."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    try:
        from ..ui.terminal import CodeNavigatorApp
        
        # Initialize the UI
        app = CodeNavigatorApp(
            navigator=navigator,
            
---
CodeNavigator: Advanced AI Coding Assistant Implementation
Thank you for the feedback! You're right - we can go much deeper. Let's create a truly exceptional implementation that pushes the boundaries of what's possible with an AI coding assistant.

Enhanced Architecture Overview

We'll implement a more sophisticated, modular system with these key improvements:

Plugin-based architecture for extensibility
Advanced code understanding with semantic analysis
Multi-model AI orchestration for specialized tasks
Persistent workspace management with versioning
Interactive TUI with rich visualizations
Memory management for contextual awareness across sessions
Core Architectural Components
1. Plugin System & Service Registry
# core/registry.py
from typing import Dict, Type, TypeVar, Generic, Optional, Any, List, Callable
import inspect
import importlib
import pkgutil
from pathlib import Path

T = TypeVar('T')

class ServiceRegistry(Generic[T]):
    """A generic registry for services or plugins."""
    
    def __init__(self, base_type: Type[T]):
        self.base_type = base_type
        self.services: Dict[str, Type[T]] = {}
        
    def register(self, key: str, service_class: Type[T]) -> None:
        """Register a service class under the given key."""
        if not issubclass(service_class, self.base_type):
            raise TypeError(f"Service class must be a subclass of {self.base_type.__name__}")
        self.services[key] = service_class
        
    def get(self, key: str, *args, **kwargs) -> Optional[T]:
        """Get an instance of the service for the given key."""
        service_class = self.services.get(key)
        if service_class:
            return service_class(*args, **kwargs)
        return None
        
    def get_all(self) -> Dict[str, Type[T]]:
        """Get all registered services."""
        return self.services.copy()
        
    def discover_plugins(self, package_name: str) -> None:
        """Discover and register plugins from the given package."""
        package = importlib.import_module(package_name)
        package_path = getattr(package, '__path__', [])
        
        for _, name, is_pkg in pkgutil.iter_modules(package_path):
            if not is_pkg:
                module = importlib.import_module(f"{package_name}.{name}")
                
                for item_name, item in inspect.getmembers(module, inspect.isclass):
                    if issubclass(item, self.base_type) and item != self.base_type:
                        self.register(name, item)

2. Advanced Code Understanding Engine
# analysis/engine.py
from typing import Dict, List, Set, Optional, Any, Union
from pathlib import Path
import threading
import queue
from dataclasses import dataclass, field
import networkx as nx
from abc import ABC, abstractmethod

@dataclass
class Symbol:
    """Represents a code symbol (function, class, variable, etc.)."""
    name: str
    kind: str  # 'function', 'class', 'variable', etc.
    location: Dict[str, Any]  # file, line, column
    scope: Optional[str] = None
    signature: Optional[str] = None
    documentation: Optional[str] = None
    references: List[Dict[str, Any]] = field(default_factory=list)

@dataclass
class CodeRelation:
    """Represents a relation between code elements."""
    source: str  # Symbol ID
    target: str  # Symbol ID
    kind: str    # 'calls', 'imports', 'inherits', 'uses', etc.
    location: Dict[str, Any]
    
class LanguageAnalyzer(ABC):
    """Base class for language-specific analyzers."""
    
    @abstractmethod
    def analyze_file(self, file_path: Path, content: str) -> Dict[str, Any]:
        """Analyze a single file and return its structure."""
        pass
        
    @abstractmethod
    def extract_symbols(self, file_analysis: Dict[str, Any]) -> List[Symbol]:
        """Extract symbols from a file analysis."""
        pass
        
    @abstractmethod
    def extract_relations(self, file_analysis: Dict[str, Any], symbols: Dict[str, Symbol]) -> List[CodeRelation]:
        """Extract relations between symbols."""
        pass

class CodeGraph:
    """A graph representation of code symbols and their relationships."""
    
    def __init__(self):
        self.symbol_graph = nx.DiGraph()
        self.file_graph = nx.DiGraph()
        self.symbols: Dict[str, Symbol] = {}
        self.files: Dict[str, Dict[str, Any]] = {}
        
    def add_symbol(self, symbol: Symbol) -> str:
        """Add a symbol to the graph."""
        symbol_id = f"{symbol.scope or ''}.{symbol.name}" if symbol.scope else symbol.name
        self.symbols[symbol_id] = symbol
        self.symbol_graph.add_node(symbol_id, **{
            'name': symbol.name,
            'kind': symbol.kind,
            'file': symbol.location['file'],
            'line': symbol.location.get('line', 0)
        })
        return symbol_id
        
    def add_relation(self, relation: CodeRelation) -> None:
        """Add a relation between symbols."""
        self.symbol_graph.add_edge(
            relation.source, 
            relation.target, 
            kind=relation.kind,
            file=relation.location['file'],
            line=relation.location.get('line', 0)
        )
        
    def get_callgraph(self, symbol_id: str, depth: int = 2) -> nx.DiGraph:
        """Get the call graph for a symbol up to a certain depth."""
        if symbol_id not in self.symbol_graph:
            return nx.DiGraph()
            
        callgraph = nx.DiGraph()
        callgraph.add_node(symbol_id, **self.symbol_graph.nodes[symbol_id])
        
        # BFS to find calls within depth
        current_depth = 0
        current_nodes = {symbol_id}
        
        while current_depth < depth and current_nodes:
            next_nodes = set()
            
            for node in current_nodes:
                for successor in self.symbol_graph.successors(node):
                    edge_data = self.symbol_graph.get_edge_data(node, successor)
                    if edge_data.get('kind') == 'calls':
                        callgraph.add_node(successor, **self.symbol_graph.nodes[successor])
                        callgraph.add_edge(node, successor, **edge_data)
                        next_nodes.add(successor)
            
            current_nodes = next_nodes
            current_depth += 1
            
        return callgraph
        
    def find_code_paths(self, source: str, target: str, max_depth: int = 5) -> List[List[str]]:
        """Find paths in the code from source to target symbols."""
        if source not in self.symbol_graph or target not in self.symbol_graph:
            return []
            
        paths = []
        for path in nx.all_simple_paths(self.symbol_graph, source, target, cutoff=max_depth):
            paths.append(path)
            
        return paths

class AnalysisEngine:
    """Main engine for code analysis."""
    
    def __init__(self):
        self.analyzers: Dict[str, LanguageAnalyzer] = {}
        self.code_graph = CodeGraph()
        self._analysis_queue = queue.Queue()
        self._analysis_thread = None
        self._stop_requested = threading.Event()
        
    def register_analyzer(self, extension: str, analyzer: LanguageAnalyzer) -> None:
        """Register a language analyzer for a file extension."""
        self.analyzers[extension] = analyzer
        
    def analyze_file(self, file_path: Path) -> None:
        """Queue a file for analysis."""
        self._analysis_queue.put(file_path)
        
        # Start analysis thread if not running
        if not self._analysis_thread or not self._analysis_thread.is_alive():
            self._stop_requested.clear()
            self._analysis_thread = threading.Thread(target=self._analysis_worker)
            self._analysis_thread.daemon = True
            self._analysis_thread.start()
    
    def analyze_files(self, file_paths: List[Path]) -> None:
        """Queue multiple files for analysis."""
        for file_path in file_paths:
            self.analyze_file(file_path)
    
    def _analysis_worker(self) -> None:
        """Worker thread for file analysis."""
        while not self._stop_requested.is_set():
            try:
                file_path = self._analysis_queue.get(timeout=1.0)
            except queue.Empty:
                continue
                
            try:
                self._analyze_file_now(file_path)
            except Exception as e:
                print(f"Error analyzing {file_path}: {e}")
            finally:
                self._analysis_queue.task_done()
                
    def _analyze_file_now(self, file_path: Path) -> None:
        """Analyze a file immediately."""
        extension = file_path.suffix.lower()
        
        if extension not in self.analyzers:
            return  # No analyzer for this file type
            
        analyzer = self.analyzers[extension]
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            # Analyze the file
            analysis = analyzer.analyze_file(file_path, content)
            
            # Extract symbols and relations
            symbols = analyzer.extract_symbols(analysis)
            
            # Add symbols to the graph
            symbol_ids = {}
            for symbol in symbols:
                symbol_id = self.code_graph.add_symbol(symbol)
                symbol_ids[symbol.name] = symbol_id
                
            # Extract and add relations
            relations = analyzer.extract_relations(analysis, symbol_ids)
            for relation in relations:
                self.code_graph.add_relation(relation)
                
        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
            
    def find_symbol(self, name: str, kind: Optional[str] = None) -> List[Symbol]:
        """Find symbols by name and optionally kind."""
        results = []
        
        for symbol_id, symbol in self.code_graph.symbols.items():
            if symbol.name == name and (kind is None or symbol.kind == kind):
                results.append(symbol)
                
        return results
        
    def find_references(self, symbol_id: str) -> List[Dict[str, Any]]:
        """Find all references to a symbol."""
        if symbol_id not in self.code_graph.symbols:
            return []
            
        return self.code_graph.symbols[symbol_id].references
        
    def get_relevant_files(self, issue_description: str, focus_file: Optional[Path] = None) -> List[Path]:
        """Find files relevant to an issue based on code relationships."""
        # This would use the graph to find related files
        # For now, returning a simple implementation
        relevant_files = []
        
        if focus_file:
            relevant_files.append(focus_file)
            
            # Add files that import or are imported by the focus file
            focus_path_str = str(focus_file)
            for file_path, file_data in self.code_graph.files.items():
                if file_path == focus_path_str:
                    continue
                    
                if focus_path_str in file_data.get('imports', []) or file_path in self.code_graph.files.get(focus_path_str, {}).get('imports', []):
                    relevant_files.append(Path(file_path))
        
        # Add files that might be relevant based on keywords in the issue
        keywords = set(issue_description.lower().split())
        for symbol_id, symbol in self.code_graph.symbols.items():
            if any(keyword in symbol.name.lower() for keyword in keywords):
                file_path = symbol.location['file']
                relevant_files.append(Path(file_path))
                
        return list(set(relevant_files))[:10]  # Limit to 10 unique files

3. Python Language Analyzer Implementation
# analysis/python_analyzer.py
import ast
from typing import Dict, List, Set, Optional, Any, Union
from pathlib import Path
import symtable
import builtins

from .engine import LanguageAnalyzer, Symbol, CodeRelation

class PythonSymbolVisitor(ast.NodeVisitor):
    """AST visitor to extract symbols from Python code."""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.symbols: List[Symbol] = []
        self.current_scope: List[str] = []
        self.imports: Dict[str, str] = {}  # alias -> module
        
    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        """Visit a class definition."""
        # Create a symbol for the class
        scope = ".".join(self.current_scope) if self.current_scope else None
        
        bases = []
        for base in node.bases:
            if isinstance(base, ast.Name):
                bases.append(base.id)
            elif isinstance(base, ast.Attribute):
                bases.append(f"{base.value.id}.{base.attr}" if hasattr(base.value, 'id') else base.attr)
                
        self.symbols.append(Symbol(
            name=node.name,
            kind='class',
            location={
                'file': self.file_path,
                'line': node.lineno,
                'column': node.col_offset
            },
            scope=scope,
            signature=f"class {node.name}({', '.join(bases)})",
            documentation=ast.get_docstring(node)
        ))
        
        # Visit class body with updated scope
        self.current_scope.append(node.name)
        for item in node.body:
            self.visit(item)
        self.current_scope.pop()
        
    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """Visit a function definition."""
        # Create a symbol for the function
        scope = ".".join(self.current_scope) if self.current_scope else None
        
        # Build function signature
        args_parts = []
        for arg in node.args.args:
            args_parts.append(arg.arg)
        
        if node.args.vararg:
            args_parts.append(f"*{node.args.vararg.arg}")
            
        if node.args.kwarg:
            args_parts.append(f"**{node.args.kwarg.arg}")
            
        self.symbols.append(Symbol(
            name=node.name,
            kind='function',
            location={
                'file': self.file_path,
                'line': node.lineno,
                'column': node.col_offset
            },
            scope=scope,
            signature=f"def {node.name}({', '.join(args_parts)})",
            documentation=ast.get_docstring(node)
        ))
        
        # Visit function body with updated scope
        self.current_scope.append(node.name)
        for item in node.body:
            self.visit(item)
        self.current_scope.pop()
        
    def visit_Import(self, node: ast.Import) -> None:
        """Visit an import statement."""
        for name in node.names:
            alias = name.asname or name.name
            self.imports[alias] = name.name
            
    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        """Visit a from-import statement."""
        module = node.module or ""
        for name in node.names:
            alias = name.asname or name.name
            self.imports[alias] = f"{module}.{name.name}" if module else name.name

class PythonRelationVisitor(ast.NodeVisitor):
    """AST visitor to extract relations from Python code."""
    
    def __init__(self, file_path: str, symbols: Dict[str, str], imports: Dict[str, str]):
        self.file_path = file_path
        self.symbols = symbols
        self.imports = imports
        self.relations: List[CodeRelation] = []
        self.current_scope: List[str] = []
        
    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        """Visit a class definition."""
        class_name = node.name
        scope = ".".join(self.current_scope) if self.current_scope else None
        class_id = f"{scope}.{class_name}" if scope else class_name
        
        # Add inheritance relations
        for base in node.bases:
            if isinstance(base, ast.Name):
                base_name = base.id
                if base_name in self.symbols:
                    self.relations.append(CodeRelation(
                        source=class_id,
                        target=self.symbols[base_name],
                        kind='inherits',
                        location={
                            'file': self.file_path,
                            'line': base.lineno,
                            'column': base.col_offset
                        }
                    ))
        
        # Visit class body with updated scope
        self.current_scope.append(class_name)
        for item in node.body:
            self.visit(item)
        self.current_scope.pop()
        
    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """Visit a function definition."""
        self.current_scope.append(node.name)
        for item in node.body:
            self.visit(item)
        self.current_scope.pop()
        
    def visit_Call(self, node: ast.Call) -> None:
        """Visit a function call."""
        scope = ".".join(self.current_scope) if self.current_scope else None
        source_id = scope
        
        # Determine the called function
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
            if func_name in self.symbols:
                self.relations.append(CodeRelation(
                    source=source_id,
                    target=self.symbols[func_name],
                    kind='calls',
                    location={
                        'file': self.file_path,
                        'line': node.lineno,
                        'column': node.col_offset
                    }
                ))
        elif isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name):
            # Handle method calls like obj.method()
            obj_name = node.func.value.id
            method_name = node.func.attr
            
            if obj_name in self.imports:
                # This might be an imported module
                module_path = self.imports[obj_name]
                full_name = f"{module_path}.{method_name}"
                
                if full_name in self.symbols:
                    self.relations.append(CodeRelation(
                        source=source_id,
                        target=self.symbols[full_name],
                        kind='calls',
                        location={
                            'file': self.file_path,
                            'line': node.lineno,
                            'column': node.col_offset
                        }
                    ))
        
        # Visit arguments
        for arg in node.args:
            self.visit(arg)
        for keyword in node.keywords:
            self.visit(keyword.value)

class PythonAnalyzer(LanguageAnalyzer):
    """Analyzer for Python code."""
    
    def analyze_file(self, file_path: Path, content: str) -> Dict[str, Any]:
        """Analyze a Python file."""
        try:
            tree = ast.parse(content)
            
            # Extract symbols
            symbol_visitor = PythonSymbolVisitor(str(file_path))
            symbol_visitor.visit(tree)
            
            return {
                'ast': tree,
                'symbols': symbol_visitor.symbols,
                'imports': symbol_visitor.imports
            }
        except SyntaxError as e:
            print(f"Syntax error in {file_path}: {e}")
            return {
                'ast': None,
                'symbols': [],
                'imports': {}
            }
        
    def extract_symbols(self, file_analysis: Dict[str, Any]) -> List[Symbol]:
        """Extract symbols from a file analysis."""
        return file_analysis.get('symbols', [])
        
    def extract_relations(self, file_analysis: Dict[str, Any], symbols: Dict[str, str]) -> List[CodeRelation]:
        """Extract relations between symbols."""
        if not file_analysis.get('ast'):
            return []
            
        ast_tree = file_analysis['ast']
        imports = file_analysis.get('imports', {})
        file_path = file_analysis.get('symbols', [{}])[0].get('location', {}).get('file', '')
        
        relation_visitor = PythonRelationVisitor(file_path, symbols, imports)
        relation_visitor.visit(ast_tree)
        
        return relation_visitor.relations

4. Multi-Model AI Orchestration
# ai/orchestrator.py
from typing import Dict, List, Any, Optional, Union, Callable
from dataclasses import dataclass
import asyncio
from pathlib import Path
import json
import time
import os
from enum import Enum, auto

@dataclass
class AIRequest:
    """A request to be processed by an AI model."""
    prompt: str
    system_message: str
    model: str
    temperature: float = 0.2
    max_tokens: int = 4000
    context_files: List[str] = None
    
@dataclass
class AIResponse:
    """A response from an AI model."""
    content: str
    model: str
    tokens_used: int
    timing: float
    error: Optional[str] = None

class AITaskType(Enum):
    """Types of AI tasks for specialized handling."""
    CODE_UNDERSTANDING = auto()
    BUG_DIAGNOSIS = auto()
    SOLUTION_GENERATION = auto()
    CODE_EXPLANATION = auto()
    TEST_GENERATION = auto()
    DEPENDENCY_ANALYSIS = auto()

class AIOrchestrator:
    """Orchestrates AI interactions, managing multiple models and request routing."""
    
    def __init__(self):
        self.providers: Dict[str, Any] = {}
        self.model_capabilities: Dict[str, List[AITaskType]] = {}
        self.default_models: Dict[AITaskType, str] = {}
        self.conversations: Dict[str, List[Dict[str, Any]]] = {}
        
    def register_provider(self, name: str, provider: Any) -> None:
        """Register an AI provider."""
        self.providers[name] = provider
        
    def register_model(self, model_name: str, provider: str, capabilities: List[AITaskType]) -> None:
        """Register a model with its capabilities."""
        self.model_capabilities[model_name] = capabilities
        
        # Set as default for capabilities if not already set
        for capability in capabilities:
            if capability not in self.default_models:
                self.default_models[capability] = model_name
                
    def set_default_model(self, task_type: AITaskType, model_name: str) -> None:
        """Set the default model for a task type."""
        if model_name not in self.model_capabilities:
            raise ValueError(f"Unknown model: {model_name}")
            
        if task_type not in self.model_capabilities[model_name]:
            raise ValueError(f"Model {model_name} does not support task type {task_type}")
            
        self.default_models[task_type] = model_name
        
    def get_provider_for_model(self, model_name: str) -> Any:
        """Get the provider for a model."""
        for provider_name, provider in self.providers.items():
            if provider.supports_model(model_name):
                return provider
                
        raise ValueError(f"No provider supports model: {model_name}")
        
    async def execute_request(self, request: AIRequest) -> AIResponse:
        """Execute an AI request."""
        model = request.model
        provider = self.get_provider_for_model(model)
        
        start_time = time.time()
        try:
            response_data = await provider.generate_async(
                prompt=request.prompt,
                system_message=request.system_message,
                model=model,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )
            
            return AIResponse(
                content=response_data.get('content', ''),
                model=model,
                tokens_used=response_data.get('tokens_used', 0),
                timing=time.time() - start_time
            )
        except Exception as e:
            return AIResponse(
                content='',
                model=model,
                tokens_used=0,
                timing=time.time() - start_time,
                error=str(e)
            )
            
    async def execute_task(
        self, 
        task_type: AITaskType, 
        prompt: str, 
        system_message: str,
        context_files: List[str] = None,
        model: Optional[str] = None
    ) -> AIResponse:
        """Execute a task using the appropriate model."""
        if model is None:
            model = self.default_models.get(task_type)
            if not model:
                raise ValueError(f"No default model for task type: {task_type}")
                
        request = AIRequest(
            prompt=prompt,
            system_message=system_message,
            model=model,
            context_files=context_files
        )
        
        return await self.execute_request(request)
        
    def create_conversation(self, id: Optional[str] = None) -> str:
        """Create a new conversation."""
        if id is None:
            id = f"conv_{int(time.time())}"
            
        self.conversations[id] = []
        return id
        
    async def add_to_conversation(
        self, 
        conversation_id: str, 
        user_message: str, 
        system_message: str,
        model: Optional[str] = None,
        task_type: Optional[AITaskType] = None
    ) -> AIResponse:
        """Add a message to a conversation and get a response."""
        if conversation_id not in self.conversations:
            self.create_conversation(conversation_id)
            
        # Determine model to use
        if model is None and task_type is not None:
            model = self.default_models.get(task_type)
            
        if model is None:
            model = next(iter(self.model_capabilities.keys()))  # Use first registered model
            
        # Construct conversation history
        conversation = self.conversations[conversation_id]
        
        # Build prompt with conversation history
        full_prompt = ""
        for message in conversation:
            if message['role'] == 'user':
                full_prompt += f"Human: {message['content']}\n\n"
            else:
                full_prompt += f"Assistant: {message['content']}\n\n"
                
        full_prompt += f"Human: {user_message}\n\nAssistant: "
        
        # Create request
        request = AIRequest(
            prompt=full_prompt,
            system_message=system_message,
            model=model
        )
        
        # Execute request
        response = await self.execute_request(request)
        
        # Add to conversation history
        conversation.append({'role': 'user', 'content': user_message})
        conversation.append({'role': 'assistant', 'content': response.content})
        
        return response

5. Advanced AI Provider Implementations
# ai/providers.py
from typing import Dict, List, Any, Optional, Set
import aiohttp
import os
import json
import time
from abc import ABC, abstractmethod

class AIProvider(ABC):
    """Base class for AI providers."""
    
    @abstractmethod
    async def generate_async(
        self, 
        prompt: str, 
        system_message: str, 
        model: str, 
        temperature: float = 0.2,
        max_tokens: int = 4000
    ) -> Dict[str, Any]:
        """Generate a response asynchronously."""
        pass
        
    @abstractmethod
    def supports_model(self, model: str) -> bool:
        """Check if this provider supports the given model."""
        pass

class AnthropicProvider(AIProvider):
    """Provider for Anthropic's Claude models."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key is required")
            
        self.supported_models = {
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307",
            "claude-2.1",
            "claude-2.0",
            "claude-instant-1.2"
        }
        
    async def generate_async(
        self, 
        prompt: str, 
        system_message: str, 
        model: str, 
        temperature: float = 0.2,
        max_tokens: int = 4000
    ) -> Dict[str, Any]:
        """Generate a response using Anthropic's API asynchronously."""
        if not self.supports_model(model):
            raise ValueError(f"Model {model} not supported by Anthropic")
            
        url = "https://api.anthropic.com/v1/messages"
        
        headers = {
            "Content-Type": "application/json",
            "X-Api-Key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "system": system_message,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise ValueError(f"Anthropic API error ({response.status}): {error_text}")
                    
                result = await response.json()
                
                return {
                    "content": result["content"][0]["text"],
                    "tokens_used": result.get("usage", {}).get("output_tokens", 0),
                    "model": model
                }
                
    def supports_model(self, model: str) -> bool:
        """Check if this provider supports the given model."""
        return model in self.supported_models

class OpenAIProvider(AIProvider):
    """Provider for OpenAI models."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
            
        self.supported_models = {
            "gpt-4o",
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo"
        }
        
    async def generate_async(
        self, 
        prompt: str, 
        system_message: str, 
        model: str, 
        temperature: float = 0.2,
        max_tokens: int = 4000
    ) -> Dict[str, Any]:
        """Generate a response using OpenAI's API asynchronously."""
        if not self.supports_model(model):
            raise ValueError(f"Model {model} not supported by OpenAI")
            
        url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        
        data = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise ValueError(f"OpenAI API error ({response.status}): {error_text}")
                    
                result = await response.json()
                
                return {
                    "content": result["choices"][0]["message"]["content"],
                    "tokens_used": result.get("usage", {}).get("completion_tokens", 0),
                    "model": model
                }
                
    def supports_model(self, model: str) -> bool:
        """Check if this provider supports the given model."""
        return model in self.supported_models

6. Workspace & Project Management
# workspace/manager.py
from typing import Dict, List, Optional, Set, Any
from pathlib import Path
import json
import os
import shutil
import time
import tempfile
import git
from dataclasses import dataclass, field
import subprocess

@dataclass
class CodeSnapshot:
    """A snapshot of code at a point in time."""
    id: str
    timestamp: float
    description: str
    files: Dict[str, str]  # path -> content
    parent_id: Optional[str] = None

@dataclass
class Project:
    """Represents a code project."""
    name: str
    root_path: Path
    git_repo: Optional[git.Repo] = None
    snapshots: Dict[str, CodeSnapshot] = field(default_factory=dict)
    current_snapshot_id: Optional[str] = None
    ignored_patterns: List[str] = field(default_factory=lambda: ['.git', '__pycache__', '*.pyc', 'node_modules'])
    metadata: Dict[str, Any] = field(default_factory=dict)

class WorkspaceManager:
    """Manages code projects and their snapshots."""
    
    def __init__(self, workspace_dir: Path):
        self.workspace_dir = workspace_dir
        self.projects: Dict[str, Project] = {}
        self.workspace_dir.mkdir(parents=True, exist_ok=True)
        self._load_projects()
        
    def _load_projects(self) -> None:
        """Load projects from the workspace directory."""
        for project_dir in self.workspace_dir.iterdir():
            if project_dir.is_dir():
                project_file = project_dir / ".code_navigator" / "project.json"
                if project_file.exists():
                    try:
                        with open(project_file, 'r') as f:
                            project_data = json.load(f)
                            
                        project = Project(
                            name=project_data['name'],
                            root_path=project_dir,
                            ignored_patterns=project_data.get('ignored_patterns', []),
                            metadata=project_data.get('metadata', {})
                        )
                        
                        # Try to load git repo if it exists
                        try:
                            project.git_repo = git.Repo(project_dir)
                        except git.InvalidGitRepositoryError:
                            pass
                            
                        # Load snapshots
                        snapshots_dir = project_dir / ".code_navigator" / "snapshots"
                        if snapshots_dir.exists():
                            for snapshot_file in snapshots_dir.glob("*.json"):
                                with open(snapshot_file, 'r') as f:
                                    snapshot_data = json.load(f)
                                    
                                snapshot = CodeSnapshot(
                                    id=snapshot_data['id'],
                                    timestamp=snapshot_data['timestamp'],
                                    description=snapshot_data['description'],
                                    files=snapshot_data['files'],
                                    parent_id=snapshot_data.get('parent_id')
                                )
                                
                                project.snapshots[snapshot.id] = snapshot
                                
                            # Set current snapshot
                            project.current_snapshot_id = project_data.get('current_snapshot_id')
                            
                        self.projects[project.name] = project
                    except Exception as e:
                        print(f"Error loading project {project_dir}: {e}")
                        
    def create_project(self, name: str, path: Path) -> Project:
        """Create a new project."""
        if name in self.projects:
            raise ValueError(f"Project {name} already exists")
            
        project_dir = self.workspace_dir / name
        project_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize project structure
        code_nav_dir = project_dir / ".code_navigator"
        code_nav_dir.mkdir(exist_ok=True)
        (code_nav_dir / "snapshots").mkdir(exist_ok=True)
        
        # Create project metadata
        project = Project(
            name=name,
            root_path=project_dir
        )
        
        # Copy code from path if provided
        if path and path.exists():
            self._copy_code(path, project_dir, project.ignored_patterns)
            
            # Check if it's a git repo
            try:
                project.git_repo = git.Repo(path)
            except git.InvalidGitRepositoryError:
                pass
        
        # Save project metadata
        self._save_project(project)
        
        self.projects[name] = project
        return project
        
    def _copy_code(self, source: Path, dest: Path, ignored_patterns: List[str]) -> None:
        """Copy code from source to destination, respecting ignored patterns."""
        def should_ignore(path: Path) -> bool:
            """Check if path should be ignored."""
            path_str = str(path)
            return any(pat in path_str for pat in ignored_patterns)
        
        for item in source.iterdir():
            if item.is_dir():
                if not should_ignore(item):
                    dest_dir = dest / item.name
                    dest_dir.mkdir(exist_ok=True)
                    self._copy_code(item, dest_dir, ignored_patterns)
            else:
                if not should_ignore(item):
                    shutil.copy2(item, dest / item.name)
                    
    def _save_project(self, project: Project) -> None:
        """Save project metadata."""
        project_file = project.root_path / ".code_navigator" / "project.json"
        
        project_data = {
            'name': project.name,
            'ignored_patterns': project.ignored_patterns,
            'current_snapshot_id': project.current_snapshot_id,
            'metadata': project.metadata
        }
        
        with open(project_file, 'w') as f:
            json.dump(project_data, f, indent=2)
            
    def create_snapshot(self, project_name: str, description: str) -> CodeSnapshot:
        """Create a snapshot of the current project state."""
        if project_name not in self.projects:
            raise ValueError(f"Project {project_name} does not exist")
            
        project = self.projects[project_name]
        
        # Generate snapshot ID
        snapshot_id = f"snapshot_{int(time.time())}"
        
        # Collect file contents
        files = {}
        for file_path in self._list_code_files(project.root_path, project.ignored_patterns):
            rel_path = str(file_path.relative_to(project.root_path))
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                files[rel_path] = content
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
                
        # Create snapshot
        snapshot = CodeSnapshot(
            id=snapshot_id,
            timestamp=time.time(),
            description=description,
            files=files,
            parent_id=project.current_snapshot_id
        )
        
        # Save snapshot
        snapshot_file = project.root_path / ".code_navigator" / "snapshots" / f"{snapshot_id}.json"
        with open(snapshot_file, 'w') as f:
            json.dump({
                'id': snapshot.id,
                'timestamp': snapshot.timestamp,
                'description': snapshot.description,
                'parent_id': snapshot.parent_id,
                'files': snapshot.files
            }, f)
            
        # Update project
        project.snapshots[snapshot_id] = snapshot
        project.current_snapshot_id = snapshot_id
        self._save_project(project)
        
        return snapshot
        
    def restore_snapshot(self, project_name: str, snapshot_id: str) -> None:
        """Restore a project to a previous snapshot."""
        if project_name not in self.projects:
            raise ValueError(f"Project {project_name} does not exist")
            
        project = self.projects[project_name]
        
        if snapshot_id not in project.snapshots:
            raise ValueError(f"Snapshot {snapshot_id} does not exist")
            
        snapshot = project.snapshots[snapshot_id]
        
        # Backup current state first
        backup_snapshot = self.create_snapshot(project_name, f"Backup before restoring {snapshot_id}")
        
        # Restore files
        for rel_path, content in snapshot.files.items():
            file_path = project.root_path / rel_path
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
        # Update project
        project.current_snapshot_id = snapshot_id
        self._save_project(project)
        
    def _list_code_files(self, directory: Path, ignored_patterns: List[str]) -> List[Path]:
        """List all code files in a directory, respecting ignored patterns."""
        code_files = []
        
        for item in directory.iterdir():
            # Check if item should be ignored
            if any(pat in str(item) for pat in ignored_patterns):
                continue
                
            if item.is_dir():
                code_files.extend(self._list_code_files(item, ignored_patterns))
            else:
                # Simple heuristic for code files - could be improved
                if item.suffix.lower() in ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.h', '.go', '.rb', '.php']:
                    code_files.append(item)
                    
        return code_files
        
    def get_git_history(self, project_name: str, max_commits: int = 20) -> List[Dict[str, Any]]:
        """Get git history for a project."""
        if project_name not in self.projects:
            raise ValueError(f"Project {project_name} does not exist")
            
        project = self.projects[project_name]
        
        if not project.git_repo:
            return []
            
        commits = []
        for commit in project.git_repo.iter_commits(max_count=max_commits):
            commits.append({
                'hash': commit.hexsha,
                'message': commit.message,
                'author': commit.author.name,
                'date': commit.committed_datetime.isoformat(),
                'files': [item.a_path for item in commit.diff(commit.parents[0])] if commit.parents else []
            })
            
        return commits
        
    def run_command(self, project_name: str, command: List[str]) -> Dict[str, Any]:
        """Run a command in the project directory."""
        if project_name not in self.projects:
            raise ValueError(f"Project {project_name} does not exist")
            
        project = self.projects[project_name]
        
        try:
            result = subprocess.run(
                command,
                cwd=project.root_path,
                capture_output=True,
                text=True,
                timeout=60  # 1 minute timeout
            )
            
            return {
                'success': result.returncode == 0,
                'returncode': result.returncode,
                'stdout': result.stdout,
                'stderr': result.stderr
            }
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Command timed out'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

7. Terminal UI with Rich
# ui/terminal.py
from typing import Dict, List, Optional, Any, Callable
import asyncio
from pathlib import Path
import os
from datetime import datetime
import threading
import queue
import signal
import sys
from enum import Enum, auto
import re

from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.widgets import Header, Footer, Button, Static, Input, TextArea, TreeControl, Tree, Label
from textual.reactive import reactive
from textual.message import Message
from textual import events
from textual.binding import Binding

from ..core.navigator import CodeNavigator
from ..workspace.manager import WorkspaceManager, Project
from ..ai.orchestrator import AIOrchestrator, AITaskType

class TabType(Enum):
    CODE = auto()
    CHAT = auto()
    ANALYSIS = auto()

class Tab:
    """Represents a tab in the UI."""
    
    def __init__(self, title: str, type: TabType, content: Any):
        self.title = title
        self.type = type
        self.content = content
        
class CodeTab(Tab):
    """A tab for viewing/editing code."""
    
    def __init__(self, title: str, file_path: Path, content: str):
        super().__init__(title, TabType.CODE, content)
        self.file_path = file_path
        self.unsaved_changes = False
        
class ChatTab(Tab):
    """A tab for AI chat interactions."""
    
    def __init__(self, title: str, conversation_id: str):
        super().__init__(title, TabType.CHAT, [])
        self.conversation_id = conversation_id
        
class AnalysisTab(Tab):
    """A tab for code analysis results."""
    
    def __init__(self, title: str, analysis_type: str, analysis_data: Any):
        super().__init__(title, TabType.ANALYSIS, analysis_data)
        self.analysis_type = analysis_type

class CodeFileTree(TreeControl):
    """A tree view for code files."""
    
    def __init__(self, root_path: Path, navigator: CodeNavigator):
        super().__init__("Project", {})
        self.root_path = root_path
        self.navigator = navigator
        
    async def on_mount(self) -> None:
        """Load the file tree when mounted."""
        await self.load_directory(self.root_path, self.root)
        await self.root.expand()
        
    async def load_directory(self, path: Path, node) -> None:
        """Load a directory into the tree."""
        for item in sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name)):
            # Skip hidden files and directories
            if item.name.startswith('.'):
                continue
                
            if item.is_dir():
                dir_node = await self.add(node, item.name, {"path": item, "is_dir": True})
                await self.load_directory(item, dir_node)
            else:
                await self.add(node, item.name, {"path": item, "is_dir": False})
                
    async def on_tree_node_selected(self, event) -> None:
        """Handle node selection."""
        node = event.node
        data = node.data
        
        if not data.get("is_dir", True):
            # It's a file, open it
            await self.emit(OpenFileRequest(data["path"]))

class OpenFileRequest(Message):
    """Message to request opening a file."""
    
    def __init__(self, file_path: Path):
        super().__init__()
        self.file_path = file_path

class CodeNavigatorApp(App):
    """Main application for the CodeNavigator TUI."""
    
    TITLE = "CodeNavigator"
    CSS_PATH = "styles.css"
    
    BINDINGS = [
        Binding("ctrl+q", "quit", "Quit"),
        Binding("ctrl+o", "open_file", "Open File"),
        Binding("ctrl+s", "save_file", "Save"),
        Binding("ctrl+n", "new_tab", "New Tab"),
        Binding("ctrl+w", "close_tab", "Close Tab"),
        Binding("f5", "analyze", "Analyze"),
        Binding("f1", "help", "Help")
    ]
    
    def __init__(self, navigator: CodeNavigator, workspace: WorkspaceManager, project: Project):
        super().__init__()
        self.navigator = navigator
        self.workspace = workspace
        self.project = project
        self.tabs: List[Tab] = []
        self.current_tab_index = 0
        self.ai_orchestrator = AIOrchestrator()
        
    def compose(self) -> ComposeResult:
        """Compose the app layout."""
        yield Header()
        
        with Horizontal():
            with Container(id="sidebar"):
                yield Static("Project Explorer", id="explorer-header")
                yield CodeFileTree(self.project.root_path, self.navigator)
                
            with Container(id="main-panel"):
                with Container(id="tab-bar"):
                    yield Button("+ New Tab", id="new-tab-btn")
                
                with Container(id="tab-content"):
                    yield TextArea("Welcome to CodeNavigator!", language="markdown")
                    
                with Container(id="status-bar"):
                    yield Label("Ready", id="status")
                    
        yield Footer()
        
    def on_mount(self) -> None:
        """Handle app mount."""
        # Create a welcome tab
        welcome_content = """
# Welcome to CodeNavigator

CodeNavigator is an AI-powered coding assistant that helps you understand, debug, and improve your codebase.

## Getting Started

1. Browse your project files in the sidebar
2. Click on a file to open it
3. Use the AI to analyze issues or suggest improvements

## Keyboard Shortcuts

- Ctrl+O: Open file
- Ctrl+S: Save current file
- Ctrl+N: New tab
- Ctrl+W: Close current tab
- F5: Analyze current file/selection
- F1: Show help
        """
        
        welcome_tab = Tab("Welcome", TabType.ANALYSIS, welcome_content)
        self.tabs.append(welcome_tab)
        self.update_tabs()
        
    def update_tabs(self) -> None:
        """Update the tab display."""
        tab_bar = self.query_one("#tab-bar")
        tab_bar.remove_children()
        
        for i, tab in enumerate(self.tabs):
            btn = Button(
                tab.title + (" *" if getattr(tab, "unsaved_changes", False) else ""),
                classes=("active" if i == self.current_tab_index else "")
            )
            btn.data = i  # Store tab index
            tab_bar.mount(btn)
            
        tab_bar.mount(Button("+ New Tab", id="new-tab-btn"))
        
        # Update content
        self.update_content()
        
    def update_content(self) -> None:
        """Update the content area based on current tab."""
        if not self.tabs:
            return
            
        content_area = self.query_one("#tab-content")
        content_area.remove_children()
        
        current_tab = self.tabs[self.current_tab_index]
        
        if current_tab.type == TabType.CODE:
            editor = TextArea(
                current_tab.content,
                language=self._get_language(current_tab.file_path)
            )
            content_area.mount(editor)
        elif current_tab.type == TabType.CHAT:
            chat_container = Vertical()
            
            # Add messages
            for message in current_tab.content:
                if message['role'] == 'user':
                    label = Label(f"You: {message['content']}", classes=("user-message",))
                else:
                    label = Label(f"AI: {message['content']}", classes=("ai-message",))
                chat_container.mount(label)
                
            # Add input
            input_box = Input(placeholder="Type your message...", id="chat-input")
            chat_container.mount(input_box)
            
            content_area.mount(chat_container)
        elif current_tab.type == TabType.ANALYSIS:
            text_area = TextArea(current_tab.content, language="markdown")
            content_area.mount(text_area)
            
    def _get_language(self, file_path: Path) -> str:
        """Get the language for syntax highlighting based on file extension."""
        ext = file_path.suffix.lower()
        language_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.html': 'html',
            '.css': 'css',
            '.json': 'json',
            '.md': 'markdown',
            '.java': 'java',
            '.c': 'c',
            '.cpp': 'cpp',
            '.go': 'go',
            '.rb': 'ruby',
            '.php': 'php'
        }
        return language_map.get(ext, 'text')
        
    async def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button presses."""
        button = event.button
        
        if button.id == "new-tab-btn":
            await self.action_new_tab()
        elif hasattr(button, "data") and isinstance(button.data, int):
            # Tab button
            self.current_tab_index = button.data
            self.update_tabs()
            
    async def on_open_file_request(self, event: OpenFileRequest) -> None:
        """Handle request to open a file."""
        file_path = event.file_path
        
        # Check if file is already open
        for i, tab in enumerate(self.tabs):
            if isinstance(tab, CodeTab) and tab.file_path == file_path:
                self.current_tab_index = i
                self.update_tabs()
                return
                
        # Open the file
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            tab = CodeTab(file_path.name, file_path, content)
            self.tabs.append(tab)
            self.current_tab_index = len(self.tabs) - 1
            self.update_tabs()
        except Exception as e:
            self.notify(f"Error opening file: {e}", severity="error")
            
    async def action_open_file(self) -> None:
        """Action to open a file."""
        # This would normally show a file picker
        # For now, just print a message
        self.notify("Use the file tree to open files")
        
    async def action_save_file(self) -> None:
        """Action to save the current file."""
        if not self.tabs or self.current_tab_index >= len(self.tabs):
            return
            
        current_tab = self.tabs[self.current_tab_index]
        
        if not isinstance(current_tab, CodeTab):
            return
            
        # Get content from editor
        editor = self.query_one(TextArea)
        content = editor.text
        
        try:
            with open(current_tab.file_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            current_tab.content = content
            current_tab.unsaved_changes = False
            self.update_tabs()
            self.notify(f"Saved {current_tab.file_path.name}")
        except Exception as e:
            self.notify(f"Error saving file: {e}", severity="error")
            
    async def action_new_tab(self) -> None:
        """Action to create a new tab."""
        # Create a chat tab
        conversation_id = f"chat_{int(datetime.now().timestamp())}"
        tab = ChatTab("New Chat", conversation_id)
        self.tabs.append(tab)
        self.current_tab_index = len(self.tabs) - 1
        self.update_tabs()
        
    async def action_close_tab(self) -> None:
        """Action to close the current tab."""
        if not self.tabs:
            return
            
        current_tab = self.tabs[self.current_tab_index]
        
        # Check for unsaved changes
        if isinstance(current_tab, CodeTab) and current_tab.unsaved_changes:
            # Would normally show a confirmation dialog
            # For now, just notify
            self.notify("Tab has unsaved changes", severity="warning")
            return
            
        # Remove tab
        self.tabs.pop(self.current_tab_index)
        
        # Update current tab index
        if self.tabs:
            self.current_tab_index = min(self.current_tab_index, len(self.tabs) - 1)
        else:
            self.current_tab_index = 0
            
        self.update_tabs()
        
    async def action_analyze(self) -> None:
        """Action to analyze the current file or selection."""
        if not self.tabs:
            return
            
        current_tab = self.tabs[self.current_tab_index]
        
        if isinstance(current_tab, CodeTab):
            # Get content from editor
            editor = self.query_one(TextArea)
            content = editor.text
            
            # Create analysis task
            self.notify("Analyzing code...")
            
            # This would normally be done asynchronously
            # For now, just create a simple analysis tab
            analysis = f"""
# Analysis of {current_tab.file_path.name}

## Overview
This file contains approximately {len(content.splitlines())} lines of code.

## Structure
- Functions: {len(re.findall(r'def\s+\w+\s*\(', content))}
- Classes: {len(re.findall(r'class\s+\w+\s*(\(|:)', content))}
- Imports: {len(re.findall(r'import\s+\w+', content))}

## Suggestions
1. Consider adding more documentation
2. Review error handling
3. Add unit tests for key functionality
            """
            
            tab = AnalysisTab(f"Analysis: {current_tab.file_path.name}", "code_analysis", analysis)
            self.tabs.append(tab)
            self.current_tab_index = len(self.tabs) - 1
            self.update_tabs()
        
    async def on_input_submitted(self, event: Input.Submitted) -> None:
        """Handle input submission."""
        if event.input.id == "chat-input":
            message = event.value
            
            if not message.strip():
                return
                
            current_tab = self.tabs[self.current_tab_index]
            
            if isinstance(current_tab, ChatTab):
                # Add user message
                current_tab.content.append({
                    'role': 'user',
                    'content': message
                })
                
                # Clear input
                event.input.value = ""
                
                # Update display
                self.update_content()
                
                # Get AI response (would normally be async)
                self.notify("AI is thinking...")
                
                # Simulate AI response
                response = "I'll analyze this code for you. It looks like there might be an issue with the error handling in the function. Let me suggest a better approach..."
                
                current_tab.content.append({
                    'role': 'assistant',
                    'content': response
                })
                
                # Update display again
                self.update_content()

8. Enhanced CLI Interface with Rich
# cli/enhanced_cli.py
import typer
from rich.console import Console
from rich.markdown import Markdown
from rich.syntax import Syntax
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
from rich import print as rprint
from pathlib import Path
from typing import Optional, List, Dict, Any
import os
import asyncio
import sys
from enum import Enum

from ..core.navigator import CodeNavigator
from ..workspace.manager import WorkspaceManager
from ..ai.orchestrator import AIOrchestrator, AITaskType
from ..ai.providers import AnthropicProvider, OpenAIProvider

console = Console()
app = typer.Typer(help="CodeNavigator: AI-powered code assistant")

# State
state = {
    "navigator": None,
    "workspace": None,
    "project": None,
    "ai_orchestrator": None
}

class ProviderType(str, Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"

def init_navigator(project_path: Path) -> CodeNavigator:
    """Initialize or get the navigator."""
    if state["navigator"] is None or state["project"] is None or str(state["project"].root_path) != str(project_path):
        # Initialize workspace if needed
        if state["workspace"] is None:
            workspace_dir = Path.home() / ".code_navigator" / "workspace"
            state["workspace"] = WorkspaceManager(workspace_dir)
            
        # Get or create project
        project_name = project_path.name
        
        if project_name in state["workspace"].projects:
            state["project"] = state["workspace"].projects[project_name]
        else:
            state["project"] = state["workspace"].create_project(project_name, project_path)
            
        # Create navigator
        state["navigator"] = CodeNavigator(project_path)
        
        # Initialize AI orchestrator if needed
        if state["ai_orchestrator"] is None:
            state["ai_orchestrator"] = AIOrchestrator()
            
            # Register providers
            try:
                state["ai_orchestrator"].register_provider("anthropic", AnthropicProvider())
            except ValueError:
                console.print("[yellow]Anthropic API key not found. Claude models unavailable.[/yellow]")
                
            try:
                state["ai_orchestrator"].register_provider("openai", OpenAIProvider())
            except ValueError:
                console.print("[yellow]OpenAI API key not found. GPT models unavailable.[/yellow]")
                
            # Register models
            try:
                state["ai_orchestrator"].register_model(
                    "claude-3-opus-20240229", 
                    "anthropic", 
                    [AITaskType.CODE_UNDERSTANDING, AITaskType.BUG_DIAGNOSIS, AITaskType.SOLUTION_GENERATION]
                )
                state["ai_orchestrator"].register_model(
                    "gpt-4o", 
                    "openai", 
                    [AITaskType.CODE_UNDERSTANDING, AITaskType.BUG_DIAGNOSIS, AITaskType.SOLUTION_GENERATION]
                )
            except:
                pass
    
    return state["navigator"]

@app.command()
def init(
    path: Path = typer.Argument(
        Path("."), help="Path to the codebase to analyze"
    ),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable verbose output"),
    reindex: bool = typer.Option(False, "--reindex", "-r", help="Force reindexing")
):
    """Initialize and index a codebase."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[bold blue]Indexing codebase...", total=None)
        
        # Initialize or reindex
        navigator.initialize(verbose=verbose, force_reindex=reindex)
        
        progress.update(task, completed=True)
        
    console.print(f"[bold green]✓ Codebase successfully indexed![/bold green]")
    console.print(f"Found {len(navigator.index.files)} files")
    
    # Display basic stats
    languages = {}
    for file_path, file_info in navigator.index.files.items():
        ext = Path(file_path).suffix
        languages[ext] = languages.get(ext, 0) + 1
        
    if languages:
        table = Table(title="Language Distribution")
        table.add_column("Language", style="cyan")
        table.add_column("Files", style="magenta")
        
        for ext, count in sorted(languages.items(), key=lambda x: x[1], reverse=True):
            lang = ext[1:] if ext.startswith('.') else ext
            table.add_row(lang, str(count))
            
        console.print(table)

@app.command()
def diagnose(
    issue: str = typer.Argument(..., help="Description of the issue to diagnose"),
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="Focus on a specific file"),
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    ),
    provider: ProviderType = typer.Option(
        ProviderType.ANTHROPIC, "--provider", help="AI provider to use"
    )
):
    """Diagnose an issue in the codebase."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[bold blue]Analyzing issue...", total=None)
        
        # Handle file path
        if file:
            file = path / file if not file.is_absolute() else file
        
        # Diagnose issue
        response = navigator.diagnose_issue(
            issue_description=issue, 
            focus_file=file,
            provider=provider.value
        )
        
        progress.update(task, completed=True)
    
    # Display response
    console.print("\n[bold]AI Analysis:[/bold]")
    console.print(Markdown(response))
    
    # Extract changes if any
    changes = navigator.change_manager.extract_changes_from_response(response)
    
    if changes:
        console.print("\n[bold]Proposed Changes:[/bold]")
        for line in navigator.change_manager.preview_changes(changes):
            console.print(line)
        
        if typer.confirm("Apply these changes?"):
            applied_files = navigator.change_manager.apply_changes(changes)
            console.print(f"[green]Applied changes to {len(applied_files)} files[/green]")
            
            # Create a snapshot
            if state["workspace"] and state["project"]:
                snapshot = state["workspace"].create_snapshot(
                    state["project"].name,
                    f"Changes from AI diagnosis: {issue[:50]}..."
                )
                console.print(f"[green]Created snapshot: {snapshot.id}[/green]")

@app.command()
def improve(
    description: str = typer.Argument(..., help="Description of the improvement to make"),
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="Focus on a specific file"),
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    ),
    provider: ProviderType = typer.Option(
        ProviderType.ANTHROPIC, "--provider", help="AI provider to use"
    )
):
    """Suggest improvements to the codebase."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[bold blue]Analyzing improvement opportunity...", total=None)
        
        # Handle file path
        if file:
            file = path / file if not file.is_absolute() else file
        
        # Get improvement suggestions
        response = navigator.suggest_improvements(
            description=description, 
            focus_file=file,
            provider=provider.value
        )
        
        progress.update(task, completed=True)
    
    # Display response
    console.print("\n[bold]AI Suggestions:[/bold]")
    console.print(Markdown(response))
    
    # Extract changes if any
    changes = navigator.change_manager.extract_changes_from_response(response)
    
    if changes:
        console.print("\n[bold]Proposed Changes:[/bold]")
        for line in navigator.change_manager.preview_changes(changes):
            console.print(line)
        
        if typer.confirm("Apply these changes?"):
            applied_files = navigator.change_manager.apply_changes(changes)
            console.print(f"[green]Applied changes to {len(applied_files)} files[/green]")
            
            # Create a snapshot
            if state["workspace"] and state["project"]:
                snapshot = state["workspace"].create_snapshot(
                    state["project"].name,
                    f"Improvements: {description[:50]}..."
                )
                console.print(f"[green]Created snapshot: {snapshot.id}[/green]")

@app.command()
def analyze(
    file: Path = typer.Argument(..., help="File to analyze"),
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    ),
    provider: ProviderType = typer.Option(
        ProviderType.ANTHROPIC, "--provider", help="AI provider to use"
    )
):
    """Analyze a specific file for potential issues and improvements."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    file_path = path / file if not file.is_absolute() else file
    
    if not file_path.exists():
        console.print(f"[red]Error: File {file_path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[bold blue]Analyzing file...", total=None)
        
        # Analyze file
        analysis = navigator.analyze_file(
            file_path=file_path,
            provider=provider.value
        )
        
        progress.update(task, completed=True)
    
    # Display analysis
    console.print("\n[bold]File Analysis:[/bold]")
    console.print(Markdown(analysis))

@app.command()
def visualize(
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="Focus on a specific file"),
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    ),
    output: Path = typer.Option(
        Path("codebase_graph.html"), "--output", "-o", help="Output file for visualization"
    )
):
    """Generate a visualization of the codebase structure."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[bold blue]Generating visualization...", total=None)
        
        # Handle file path
        if file:
            file = path / file if not file.is_absolute() else file
        
        # Generate visualization
        visualization_path = navigator.generate_visualization(
            output_path=output,
            focus_file=file
        )
        
        progress.update(task, completed=True)
    
    console.print(f"[green]Visualization generated: {visualization_path}[/green]")
    console.print("Open this file in a web browser to view the interactive visualization.")

@app.command()
def chat(
    path: Path = typer.Option(
        Path("."), "--path", "-p", help="Path to the codebase"
    ),
    provider: ProviderType = typer.Option(
        ProviderType.ANTHROPIC, "--provider", help="AI provider to use"
    )
):
    """Start an interactive chat session with the AI assistant."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    console.print("[bold]CodeNavigator Chat[/bold]")
    console.print("Type your questions about the codebase. Type 'exit' to quit.")
    
    conversation_id = f"cli_chat_{int(time.time())}"
    
    while True:
        try:
            user_input = typer.prompt("\nYou")
            
            if user_input.lower() in ('exit', 'quit'):
                break
                
            with Progress(
                SpinnerColumn(),
                TextColumn("[bold blue]{task.description}"),
                console=console
            ) as progress:
                task = progress.add_task("[bold blue]AI is thinking...", total=None)
                
                # Get AI response
                response = navigator.chat(
                    message=user_input,
                    conversation_id=conversation_id,
                    provider=provider.value
                )
                
                progress.update(task, completed=True)
            
            console.print("\n[bold cyan]AI:[/bold cyan]")
            console.print(Markdown(response))
            
        except KeyboardInterrupt:
            console.print("\n[yellow]Chat session ended.[/yellow]")
            break
            
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")

@app.command()
def ui(
    path: Path = typer.Argument(
        Path("."), help="Path to the codebase"
    )
):
    """Launch the terminal UI."""
    path = path.absolute()
    
    if not path.exists():
        console.print(f"[red]Error: Path {path} does not exist[/red]")
        return
        
    navigator = init_navigator(path)
    
    try:
        from ..ui.terminal import CodeNavigatorApp
        
        # Initialize the UI
        app = CodeNavigatorApp(
            navigator=navigator,
            
---
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
                

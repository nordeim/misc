CodeNavigator: CLI AI Coding Assistant Implementation Plan
This implementation plan provides a systematic approach to building a powerful CLI-based AI coding assistant that leverages the CodeNavigator system prompt. The plan is structured into progressive phases, allowing for incremental development and testing.

Phase 1: Project Setup & Foundation
1.1 Environment Setup & Core Dependencies
# Create project directory and virtual environment
mkdir codenavigator
cd codenavigator
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install core dependencies
pip install click requests python-dotenv rich typer gitpython anthropic openai
pip install pytest black isort

# Initialize project structure
mkdir -p codenavigator/core codenavigator/utils codenavigator/cli tests
touch codenavigator/__init__.py codenavigator/core/__init__.py
touch codenavigator/utils/__init__.py codenavigator/cli/__init__.py

1.2 Configuration Management
Create codenavigator/config.py:

import os
from pathlib import Path
from typing import Dict, Optional, Any
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    def __init__(self):
        # Base directories
        self.app_dir = Path.home() / ".codenavigator"
        self.cache_dir = self.app_dir / "cache"
        self.config_file = self.app_dir / "config.json"
        
        # Ensure directories exist
        self.app_dir.mkdir(exist_ok=True)
        self.cache_dir.mkdir(exist_ok=True)
        
        # Default configuration
        self.default_config = {
            "llm_provider": os.getenv("LLM_PROVIDER", "anthropic"),
            "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY", ""),
            "openai_api_key": os.getenv("OPENAI_API_KEY", ""),
            "model": os.getenv("LLM_MODEL", "claude-3-opus-20240229"),
            "max_tokens": 4000,
            "temperature": 0.7,
            "system_prompt_path": str(self.app_dir / "system_prompt.md"),
        }
        
        # Load or create config
        self.config = self._load_config()
        
        # Save system prompt if it doesn't exist
        system_prompt_path = Path(self.config["system_prompt_path"])
        if not system_prompt_path.exists():
            self._save_default_system_prompt(system_prompt_path)
    
    def _load_config(self) -> Dict[str, Any]:
        """Load config from file or create default"""
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                user_config = json.load(f)
            # Merge with defaults
            config = self.default_config.copy()
            config.update(user_config)
            return config
        else:
            # Create new config file with defaults
            with open(self.config_file, 'w') as f:
                json.dump(self.default_config, f, indent=2)
            return self.default_config
    
    def _save_default_system_prompt(self, path: Path) -> None:
        """Save the default system prompt to the specified path"""
        system_prompt = """# System Prompt for CodeNavigator: Advanced AI Coding Assistant

You are CodeNavigator, an elite AI coding assistant specializing in comprehensive codebase management...
"""  # Include the full system prompt here
        
        with open(path, 'w') as f:
            f.write(system_prompt)
    
    def update(self, key: str, value: Any) -> None:
        """Update a config value and save to file"""
        self.config[key] = value
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
            
    def get(self, key:

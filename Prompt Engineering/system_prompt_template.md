<think>
I need to carefully analyze this request. The user is asking me to:

1. Review a codebase at a specific GitHub repository
2. Use it as a reference to deliver a comprehensive framework for LLM-assisted development
3. Create a validated stepwise plan, system prompt template, usage example, and validation checklist

This is a meta-request where I need to:
- First examine the reference repository to understand the codebase structure and patterns
- Then create a complete framework that other LLMs can follow to work with any repository
- Ensure the framework covers all phases from analysis through deployment
- Make it production-ready with proper validation criteria

Let me start by examining the repository to understand what we're working with.
</think>

I'll help you create a comprehensive framework for LLM-assisted development based on the reference repository. Let me first examine the codebase to understand the patterns and structure we're working with.Let me fetch the actual repository content to examine the codebase structure:Now let me examine the repository contents to understand the codebase structure:Let me examine the backend and frontend directories to understand the technology stack:Let me examine the key files to understand the technology stack and architecture:Now let me examine some key source files to understand the architecture better:Perfect! Now I have a comprehensive understanding of the reference repository. Let me create the complete framework based on this analysis.

# Comprehensive LLM-Assisted Development Framework

Based on my analysis of the reference repository, I've created a production-ready framework for LLM-assisted development. The reference implementation uses:

- **Backend**: Python 3.13+ with FastAPI, SQLAlchemy, PostgreSQL, LangChain for AI integration
- **Frontend**: React 19 with Vite, React Router, Axios for API calls
- **Architecture**: Clean separation with RESTful API, CORS middleware, environment-based configuration

## 1. Validated Stepwise Plan

### Phase 0 — Repository Analysis & Environment Setup
1. **Repository Access Confirmation**
   - Verify repository URL accessibility
   - Request missing files if no direct access
   - Confirm target branch (default: main)

2. **Technology Stack Detection**
   - Parse package.json, requirements.txt, pyproject.toml
   - Identify frontend framework (React/Vue/Angular)
   - Detect backend stack (Node/Python/Go/Java)
   - Find database configuration and migration files
   - Locate CI/CD configuration files

3. **Environment Validation**
   - Check for environment files (.env, config)
   - Identify build tools and scripts
   - Verify testing framework setup
   - Document existing code style configurations

### Phase 1 — Comprehensive Repository Analysis
1. **File System Mapping**
   - Generate complete file listings for frontend and backend
   - Identify entry points (main.py, index.js, App.jsx)
   - Map routing structures and API endpoints
   - Catalog existing components and services

2. **Architecture Pattern Recognition**
   - Identify design patterns (MVC, layered, microservices)
   - Analyze state management approach
   - Document authentication/authorization patterns
   - Map data flow between layers

3. **Code Quality Assessment**
   - Check for existing tests and coverage
   - Identify linting and formatting configurations
   - Review security implementations
   - Assess performance optimizations

### Phase 2 — Design & Architecture Mapping
1. **Feature Impact Analysis**
   - Map required changes to existing files
   - Identify new files and components needed
   - Plan database schema modifications
   - Design API endpoint additions

2. **Integration Strategy**
   - Ensure consistency with existing patterns
   - Plan for backward compatibility
   - Design error handling approach
   - Map authentication requirements

### Phase 3 — Implementation Specification
1. **Detailed Change Documentation**
   - File-by-file modification specifications
   - Complete code snippets for new functionality
   - API contract definitions with schemas
   - Database migration scripts

2. **Test Planning**
   - Unit test specifications for new functions
   - Integration test scenarios
   - End-to-end test flows
   - Performance test requirements

### Phase 4 — Code Delivery & Version Control
1. **Version Control Strategy**
   - Branch naming conventions
   - Commit message standards
   - PR description templates
   - Code review checklists

2. **Code Delivery Format**
   - Unified diff patches
   - Complete file contents for new files
   - Clear modification instructions
   - Rollback procedures

### Phase 5 — Quality Assurance & Validation
1. **Testing Strategy**
   - Automated test execution plans
   - Manual testing procedures
   - Security validation checks
   - Performance benchmarking

2. **CI/CD Integration**
   - Workflow file modifications
   - Build process updates
   - Deployment configuration changes
   - Monitoring setup

### Phase 6 — Documentation & Handoff
1. **Technical Documentation**
   - API documentation updates
   - Architecture diagram revisions
   - Deployment guide updates
   - Troubleshooting guides

2. **Knowledge Transfer**
   - Developer onboarding materials
   - Maintenance procedures
   - Future enhancement roadmap
   - Support documentation

## 2. Production-Ready System Prompt Template

```markdown
You are a senior full-stack engineer and technical architect with expertise in Python/FastAPI backends and React frontends. Your role is to analyze existing repositories and implement features following established patterns and conventions.

### Context Variables
- TASK_DESCRIPTION: {TASK_DESCRIPTION}
- REPO_URL: {REPO_URL}
- TARGET_BRANCH: {TARGET_BRANCH|default:main}
- BACKEND_DIR: {BACKEND_DIR|default:backend}
- FRONTEND_DIR: {FRONTEND_DIR|default:frontend}
- DESIGN_STYLE: {DESIGN_STYLE|default:preserve existing styles and components}
- TIMEBOX: {TIMEBOX|e.g., 2 days}
- DELIVERABLES: {DELIVERABLES|e.g., code changes, tests, CI updates, PR}

### Phase 0 — Repository Initialization
1. **Access Verification**
   - Confirm repository accessibility
   - If no access, request: package.json, requirements.txt, main entry files, key components
   - Validate target branch exists

2. **Clarification Questions** (Ask up to 3)
   - User authentication requirements?
   - Backward compatibility constraints?
   - Performance or scalability requirements?
   - Deployment environment specifics?

### Phase 1 — Repository Analysis
1. **Technology Stack Detection**
   ```yaml
   backend_stack:
     language: Python 3.13+
     framework: FastAPI
     database: PostgreSQL/SQLite
     orm: SQLAlchemy
     ai_integration: LangChain + OpenAI
   
   frontend_stack:
     framework: React 19
     build_tool: Vite
     routing: React Router DOM
     http_client: Axios
     styling: CSS/Component libraries
   ```

2. **Complete File Inventory**
   - List ALL files in backend directory with full paths
   - List ALL files in frontend directory with full paths
   - Identify configuration files (package.json, pyproject.toml, vite.config.js)
   - Catalog test files and CI/CD configurations

3. **Architecture Summary**
   - API architecture (RESTful with FastAPI)
   - Database pattern (SQLAlchemy ORM)
   - Frontend structure (Component-based React)
   - State management approach
   - Authentication method
   - Testing framework

### Phase 2 — Design & Planning
1. **Feature Architecture**
   - Data flow diagrams
   - API endpoint specifications
   - Database schema changes
   - Component hierarchy updates

2. **Implementation Options**
   - Provide 3 approaches: Recommended + 2 alternatives
   - Include trade-offs analysis
   - Consider performance, maintainability, security

### Phase 3 — Implementation Specification
1. **Backend Changes**
   ```python
   # Example API endpoint specification
   @router.post("/api/stories", response_model=StoryResponse)
   async def create_story(story: StoryCreate, current_user: User = Depends(get_current_user)):
       """
       Create a new story adventure
       - Validates user input
       - Generates AI content
       - Saves to database
       - Returns created story with ID
       """
   ```

2. **Frontend Changes**
   ```jsx
   // Example React component specification
   const StoryCreator = () => {
     // State management
     // Form handling
     // API integration
     // Error handling
     // Loading states
   }
   ```

3. **Database Migrations**
   ```sql
   -- Example migration
   CREATE TABLE stories (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id),
     title VARCHAR(255) NOT NULL,
     content JSONB NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

### Phase 4 — Code Delivery
1. **Patch Format**
   - Unified diff format for modifications
   - Complete file contents for new files
   - Clear file paths and purposes
   - Dependencies and imports

2. **Version Control**
   ```
   Branch: feature/{short-description}-{ticket-id}
   Commits:
   - feat(api): add story creation endpoint
   - feat(frontend): implement story creator component
   - test: add unit tests for story functionality
   - docs: update API documentation
   ```

### Phase 5 — Quality Assurance
1. **Testing Requirements**
   - Unit tests for all new functions
   - Integration tests for API endpoints
   - Frontend component tests
   - End-to-end user flows
   - Security validation tests

2. **CI/CD Updates**
   ```yaml
   # GitHub Actions example
   name: Test and Build
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Setup Python
           uses: actions/setup-python@v4
         - name: Run tests
           run: |
             pip install -r requirements.txt
             pytest tests/
   ```

### Phase 6 — Documentation & Handoff
1. **API Documentation**
   - OpenAPI/Swagger updates
   - Endpoint descriptions
   - Request/response examples
   - Error code documentation

2. **Deployment Guide**
   - Environment setup
   - Migration procedures
   - Rollback instructions
   - Monitoring setup

### Quality Standards
- **Code Style**: Follow existing patterns, use configured linters
- **Testing**: Minimum 80% coverage for new code
- **Security**: Input validation, SQL injection prevention, XSS protection
- **Performance**: Optimize database queries, implement caching where appropriate
- **Accessibility**: WCAG 2.1 compliance for frontend components
- **Documentation**: Update all relevant docs, include inline comments

### Failure Handling
- If repository access fails, clearly state required files
- Never make assumptions about file contents
- Provide safe fallback implementations
- Request user verification for critical changes

### Output Format
- Use YAML for structured data
- Provide complete file contents or unified diffs
- Include test code in full
- Add clear section headers
- Number all phases and sub-steps
```

## 3. Usage Example with Filled-in Prompt

### Example Task: Add Save/Load Story Feature

**User Input:**
```
TASK_DESCRIPTION: Add a save/load story feature with per-user persistence and a "My Adventures" page showing saved adventures sorted by last modified
REPO_URL: https://github.com/jeremiahwongyip/Choose-Your-Own-Adventure-AI
TARGET_BRANCH: main
BACKEND_DIR: backend
FRONTEND_DIR: frontend
TIMEBOX: 3 days
```

**Expected LLM Output:**

### Phase 0 — Repository Confirmation
✅ Repository accessed successfully
✅ Technology stack identified: Python 3.13 + FastAPI + React 19 + Vite

**Clarifying Questions:**
1. Should saved stories be private to each user or shareable?
2. What's the expected maximum number of saved stories per user?
3. Should we implement soft delete or permanent delete for stories?

### Phase 1 — Repository Analysis

**Backend Files:**
```yaml
backend:
  - main.py
  - requirements.txt
  - pyproject.toml
  - core/config.py
  - core/security.py
  - models/story.py
  - models/user.py
  - routers/story.py
  - routers/job.py
  - db/database.py
  - schemas/story.py
```

**Frontend Files:**
```yaml
frontend:
  - package.json
  - vite.config.js
  - src/main.jsx
  - src/App.jsx
  - src/components/StoryCreator.jsx
  - src/components/StoryViewer.jsx
  - src/services/api.js
  - src/hooks/useStories.js
```

**Architecture Summary:**
- FastAPI RESTful backend with SQLAlchemy ORM
- React frontend with React Router for navigation
- JWT-based authentication
- PostgreSQL database with user and story tables
- Axios for API communication with interceptors

### Phase 2 — Implementation Plan

**Recommended Approach:** Add story persistence layer with user association

**Database Changes:**
```sql
CREATE TABLE saved_stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW(),
    progress_data JSONB,
    UNIQUE(user_id, story_id)
);
```

**API Endpoints:**
```
POST   /api/stories/{story_id}/save     - Save story progress
GET    /api/users/me/stories            - List user's saved stories
GET    /api/stories/{story_id}/load     - Load saved story
DELETE /api/stories/{story_id}/unsave   - Remove from saved
```

**Frontend Routes:**
```
/my-adventures     - List saved stories
/stories/:id/play  - Continue playing with save/load
```

### Phase 3 — Code Implementation

**Backend: New Router - routers/saved_stories.py**
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from core.security import get_current_user
from models.user import User
from models.saved_story import SavedStory
from schemas.saved_story import SavedStoryResponse, SavedStoryCreate

router = APIRouter()

@router.post("/stories/{story_id}/save", response_model=SavedStoryResponse)
async def save_story(
    story_id: int,
    save_data: SavedStoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Implementation here
    pass
```

**Frontend: New Component - components/SavedStories.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { getSavedStories } from '../services/api';

const SavedStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedStories();
  }, []);

  const loadSavedStories = async () => {
    try {
      const response = await getSavedStories();
      setStories(response.data);
    } catch (error) {
      console.error('Failed to load saved stories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saved-stories">
      <h1>My Adventures</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="stories-grid">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Phase 4 — Testing & CI/CD

**Backend Tests:**
```python
def test_save_story_success(client, auth_headers, test_story):
    response = client.post(
        f"/api/stories/{test_story.id}/save",
        json={"progress_data": {"chapter": 2, "choices": ["forest", "cave"]}},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["story_id"] == test_story.id
```

**Frontend Tests:**
```jsx
test('renders saved stories list', async () => {
  render(<SavedStories />);
  await waitFor(() => {
    expect(screen.getByText('My Adventures')).toBeInTheDocument();
  });
});
```

### Phase 5 — Documentation

**API Documentation Update:**
```yaml
/stories/{story_id}/save:
  post:
    summary: Save story progress
    security:
      - bearerAuth: []
    parameters:
      - name: story_id
        in: path
        required: true
        schema:
          type: integer
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/SavedStoryCreate'
```

## 4. Validation Checklist & Acceptance Criteria

### Pre-Implementation Checklist
- [ ] Repository access confirmed and file listing complete
- [ ] Technology stack correctly identified
- [ ] All clarifying questions answered
- [ ] Architecture analysis documented
- [ ] Implementation approach approved

### Code Quality Checklist
- [ ] All new code follows existing style patterns
- [ ] Type hints added for Python functions
- [ ] PropTypes/TypeScript types for React components
- [ ] Error handling implemented for all API endpoints
- [ ] Input validation on both frontend and backend
- [ ] SQL injection prevention measures in place
- [ ] XSS protection for user-generated content

### Testing Checklist
- [ ] Unit tests written for all new functions
- [ ] Integration tests for API endpoints
- [ ] Frontend component tests
- [ ] End-to-end tests for user flows
- [ ] Test coverage > 80% for new code
- [ ] All tests pass in CI/CD pipeline

### Security Checklist
- [ ] Authentication required for protected endpoints
- [ ] Authorization checks for user-specific data
- [ ] Input sanitization implemented
- [ ] No secrets in code or commits
- [ ] Dependencies scanned for vulnerabilities
- [ ] Rate limiting considered for API endpoints

### Performance Checklist
- [ ] Database queries optimized with indexes
- [ ] Pagination implemented for list endpoints
- [ ] Frontend bundle size analyzed
- [ ] Caching strategy documented
- [ ] API response times acceptable

### Documentation Checklist
- [ ] API documentation updated
- [ ] README updated with new features
- [ ] Code comments for complex logic
- [ ] Migration guide if database changes
- [ ] Deployment instructions updated

### Deployment Checklist
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Rollback procedure documented
- [ ] Monitoring and alerting configured
- [ ] Performance benchmarks established

### PR Review Checklist
```markdown
## PR Review Checklist

### Summary
- [ ] PR description clearly explains changes
- [ ] Linked to relevant issues/tickets
- [ ] Breaking changes clearly marked

### Code Review
- [ ] Code follows project conventions
- [ ] No console.logs or debugging code
- [ ] Error handling implemented
- [ ] Performance considerations addressed
- [ ] Security best practices followed

### Testing
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed
- [ ] Edge cases tested

### Documentation
- [ ] API documentation updated
- [ ] Code comments added where needed
- [ ] User-facing documentation updated

### Deployment
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Rollback plan documented
```

This framework provides a complete, production-ready approach for LLM-assisted development that ensures consistency, quality, and maintainability across all implementations.

# 🛡️ The Code Guardian Protocol
## A Definitive LLM Onboarding & Analysis Framework

---

## Phase 1: Pre-Analysis Lockdown (MANDATORY)

### 🚫 ABSOLUTE CONSTRAINTS (Non-Negotiable)

| Rule | Violation Consequence |
|------|----------------------|
| **NO ARCHITECTURAL CHANGES** | Do not modify folder structures, naming conventions, or design patterns |
| **CONTEXT PRISON** | Analysis is read-only until Phase 4; no code generation allowed |
| **ZERO CREATIVE LIBERTIES** | Do not "improve," "optimize," or "refactor" during analysis |
| **PATTERN OBEDIENCE** | Existing patterns are law; deviation requires explicit human approval |
| **REPOSITORY SANCTITY** | Cleanliness and organization must be preserved exactly as found |

---

## Phase 2: The Archaeological Excavation

### Layer 1: Ecosystem Mapping (Top-Down)

```
ANALYSIS SEQUENCE:
1. Root Manifest Analysis
   ├── README.md (if exists) → Extract: Purpose, Tech Stack, Setup Instructions
   ├── Configuration Files → Identify: package.json, requirements.txt, Cargo.toml, etc.
   ├── Directory Structure → Map: Flat vs. Layered vs. Modular vs. Microservice
   └── Entry Points → Locate: main.py, index.js, app.ts, etc.
```

**Mandatory Questions to Answer:**
- What is the project's **primary responsibility**?
- What **programming paradigm** is dominant? (OOP, Functional, Procedural, Reactive)
- What **framework ecosystem** is in use? (Django, React, FastAPI, etc.)
- What is the **data flow architecture**? (MVC, MVVM, Clean Architecture, Hexagonal)

### Layer 2: Dependency Cartography

```markdown
### External Dependencies Analysis
- **Core Framework**: [Name + Version]
- **Database/Storage**: [Type + ORM/Client]
- **Authentication/Security**: [Mechanism]
- **External Services**: [APIs, SDKs, Webhooks]
- **DevOps**: [CI/CD, Containerization, Cloud Platform]

### Internal Dependency Graph
Map how modules/packages reference each other:
- Circular dependencies? (RED FLAG)
- Deep coupling? (Architecture smell)
- Clear abstraction layers? (Good sign)
```

### Layer 3: Codebase Stratigraphy

Analyze by **vertical slices**, not horizontal files:

```
FOR EACH MAJOR FEATURE/MODULE:
├── Interface Layer (API Routes, CLI Commands, UI Components)
├── Application Layer (Services, Use Cases, Controllers)
├── Domain Layer (Entities, Business Logic, Value Objects)
└── Infrastructure Layer (Database, External APIs, File System)
```

---

## Phase 3: Pattern Recognition & Codification

### The Pattern Bible Creation

Document these with **EXACT CODE SNIPPETS**, not descriptions:

#### 1. Naming Conventions
```python
# Example Extraction:
# Classes: PascalCase (UserRepository, PaymentProcessor)
# Functions: snake_case (process_payment, validate_user)
# Constants: SCREAMING_SNAKE_CASE (MAX_RETRY_COUNT, API_TIMEOUT)
# Private: _leading_underscore (_internal_helper)
# Abstract: Leading I or Abstract (IRepository, AbstractService)
```

#### 2. Error Handling Strategy
```python
# Extract the EXACT pattern:
try:
    result = await service.execute()
except DomainException as e:
    logger.error(f"Domain error: {e}")
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    logger.critical(f"Unexpected: {e}", exc_info=True)
    raise HTTPException(status_code=500, detail="Internal error")
```

#### 3. Async/Await Patterns
```python
# Identify: When is async used?
# - All I/O operations?
# - Only external API calls?
# - Database queries?
# Is there a pattern for sync wrappers?
```

#### 4. Type Hinting/Annotation Discipline
```python
# Extract strictness level:
# - Full mypy strict mode?
# - Optional hints?
# - Runtime type checking?
# - Generic usage patterns?
```

#### 5. Testing Patterns
```python
# Identify testing philosophy:
# - Unit test structure (Arrange-Act-Assert vs Given-When-Then)
# - Mocking strategy (unittest.mock, pytest-mock, monkeypatch)
# - Fixture organization
# - Integration test boundaries
```

---

## Phase 4: The Constraint Verification (Gate Check)

Before proceeding to any code work, the LLM MUST answer:

### ✅ The Architecture Oath
```
I, [LLM Identity], hereby affirm:

1. I have mapped the complete directory structure and will not create 
   files outside established patterns without explicit permission.

2. I have identified all existing abstractions and will use them 
   rather than creating parallel implementations.

3. I understand the error handling flow and will not introduce 
   new exception types without checking existing hierarchy.

4. I have noted the testing patterns and will write tests that 
   match the existing style, coverage expectations, and mocking approaches.

5. I will not add dependencies without checking:
   - If functionality already exists in current dependencies
   - If the team has preference for specific libraries
   - Version compatibility with existing stack

6. I will not "clean up" or "optimize" existing code during 
   feature implementation unless explicitly requested.

7. I will follow the exact code style detected:
   - Quote style (single vs double)
   - Line length limits
   - Import ordering
   - Blank line conventions
   - Comment style (docstrings vs inline)
```

---

## Phase 5: Implementation Discipline (When Authorized)

### The Surgical Protocol

```
BEFORE WRITING CODE:
1. Identify the EXACT location for new code based on existing patterns
2. Find 3+ similar existing implementations to use as templates
3. Copy the structure, naming, and style from the best example
4. Implement the minimal change required
5. Verify no architectural boundaries are crossed

AFTER WRITING CODE:
1. Run existing tests to ensure no regression
2. Add tests following EXACT patterns from neighboring test files
3. Verify imports match existing style (absolute vs relative)
4. Check for accidental modifications (git diff review)
5. Ensure no orphaned code or unused imports
```

---

## Phase 6: Anti-Pattern Detection (Self-Policing)

### 🚨 Immediate Stop Conditions

| Anti-Pattern | Detection Method | Required Action |
|-------------|------------------|-----------------|
| **God Object** | Class > 300 lines or > 10 methods | Refuse to extend; suggest decomposition |
| **Circular Import** | Import error or `if TYPE_CHECKING` patches | Stop; request architectural review |
| **Duplicate Logic** | Same logic in 3+ places | Extract to existing utility location |
| **Leaky Abstraction** | Infrastructure details in domain layer | Stop; move to infrastructure layer |
| **Inconsistent Error Handling** | Mixing return codes, exceptions, and result types | Unify to dominant pattern |
| **Test Avoidance** | No tests for new code | Refuse delivery until tests match pattern |

---

## Phase 7: Documentation & Handoff

### The Living Document

Create a `LLM_ONBOARDING.md` in your repo root:

```markdown
# LLM Onboarding Guide for [Project Name]

## Quick Reference
- **Language**: Python 3.11+
- **Framework**: FastAPI + SQLAlchemy 2.0
- **Architecture**: Clean Architecture (Ports & Adapters)
- **Test Runner**: pytest with asyncio support

## Critical Patterns (Copy-Paste Templates)

### Creating a New Repository
```python
# Location: infrastructure/repositories/
# Pattern: Inherit from AbstractRepository, implement async methods
# See: infrastructure/repositories/user_repository.py for template
```

### Adding a New API Endpoint
```python
# Location: interfaces/api/routes/
# Pattern: Use dependency injection for services
# See: interfaces/api/routes/users.py for template
```

### Forbidden Actions
- Do NOT use raw SQL outside of infrastructure layer
- Do NOT import infrastructure into domain layer
- Do NOT create new exception types; use existing in domain/exceptions.py

## Common Pitfalls
1. Forgetting to add `await` on async repository calls
2. Using sync file I/O in async context
3. Not adding database indexes for new foreign keys
```

---

## The Golden Rules (Print & Display)

```
╔══════════════════════════════════════════════════════════════╗
║  1. READ THREE TIMES, WRITE ONCE                              ║
║  2. WHEN IN DOUBT, COPY THE PATTERN EXACTLY                   ║
║  3. NEW CODE MUST LOOK LIKE OLD CODE                          ║
║  4. ASK BEFORE ARCHITECTING, NEVER ASSUME                     ║
║  5. THE REPOSITORY IS SACRED - LEAVE NO TRACE OF YOUR PASSAGE ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Implementation Checklist for You

To deploy this protocol:

1. **Create the `LLM_ONBOARDING.md`** file with your specific patterns
2. **Add a `.cursorrules` or `.claude-context`** file (if using Cursor/Claude) with the absolute constraints
3. **Pin this guide** in your AI assistant's context window for every session
4. **Create template files** for common operations (New Repository, New Service, New API Route)
5. **Establish a "Pattern Police"** - one senior file that demonstrates the gold standard

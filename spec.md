# Morpheme Alchemy — System Specification

**Repository:** `morpheme-alchemy-engine`  
**Product:** `morpheme-alchemy`  
**Document:** `spec.md`  
**Status:** **SOURCE OF TRUTH / SSOT**  
**Audience:** Human engineers, AI coding agents, CLI agents, reviewers, autonomous sub-agents  
**Last updated:** 2026-09-20

---

## 0. Mission

**Morpheme Alchemy** is a mobile English-learning game that teaches vocabulary and morphology passively through a merge/crafting loop.

The player combines morpheme blocks such as:

```text
re + act + ion
        ↓
    reaction
```

The product is designed around five principles:

1. **Discovery instead of testing** — the player experiments rather than completes lessons.
2. **Learning through gameplay** — the merge action is itself the learning action.
3. **Low pressure** — no mandatory exams, no forced game-over, no fixed lesson ladder.
4. **Adaptive content** — the system continuously chooses what to expose next.
5. **AI-native architecture** — semantic game behavior is executed by a Multi-Agent LangGraph system backed by Graph RAG.

The product's key technical proposition is:

> **The application contains execution code, not a hardcoded vocabulary universe or hardcoded level tree.**

---

# 1. Non-Negotiable Architecture Vision

The following statements are architectural invariants. AI agents MUST NOT weaken them for convenience.

## 1.1 Multi-Agent is mandatory

Every meaningful game turn MUST pass through a **LangGraph-orchestrated Multi-Agent workflow**.

The system is not permitted to implement the product as a conventional CRUD API with an isolated LLM call appended afterward.

LangGraph is the orchestration layer for:

- routing
- formation interpretation
- knowledge retrieval
- semantic validation
- learning-state reasoning
- challenge generation
- explanation
- playful/humorous response generation
- final response composition

A graph node may call deterministic tools. Not every node must invoke an LLM. However, the semantic behavior of a game turn MUST be represented in the agent graph.

## 1.2 Graph RAG is mandatory

The linguistic knowledge universe MUST be represented and queried through a graph-oriented knowledge layer.

Graph RAG is the canonical source for:

- morphemes
- words
- word senses
- part of speech
- meanings
- etymology
- origins
- word families
- morpheme relationships
- morphology relationships
- example words
- supported formation paths
- evidence / provenance

Agents MUST retrieve knowledge from the graph instead of embedding linguistic facts in Python source code.

## 1.3 Zero-hardcode means zero hardcoded domain content

For this project, **zero-hardcode** means:

> No English vocabulary, morpheme lists, word-family lists, level definitions, morphology facts, etymology facts, challenge inventories, or product content rules may be encoded as scattered literals inside application/business code.

Forbidden:

```python
if word == "reaction":
    ...
```

Forbidden:

```python
LEVEL_1_WORDS = ["act", "react", "reaction"]
```

Forbidden:

```python
if difficulty >= 3:
    use_words = [...]
```

Required pattern:

```text
Agent
  ↓
Graph RAG query
  ↓
Knowledge / policy / player-state context
  ↓
Agent reasoning
  ↓
Typed decision
```

### Technical constants are allowed

Zero-hardcode does **not** mean that Python may contain no literals whatsoever. Technical invariants such as API version prefixes, schema field names, security limits, timeout defaults, or serialization mechanics may be encoded in code.

The restriction is specifically against hardcoding **domain knowledge and domain content**.

## 1.4 No fixed level architecture

There is no canonical:

```text
Level 1 → Level 2 → Level 3 → Level 4
```

The player moves through a dynamic knowledge graph and adaptive state space.

A challenge is generated at runtime from:

```text
Graph RAG
+ Player State
+ Game Policy
+ Recent Interaction Context
```

## 1.5 Backend is authoritative

The mobile client renders results. It does not decide:

- whether a word is valid
- whether a formation is supported
- what the next challenge should be
- how mastery changes
- what knowledge is true
- what explanation is canonical

---

# 2. Product Definition

## 2.1 Product statement

> **A playful sandbox where players discover how English words are built.**

## 2.2 Core loop

```text
        ┌────────────────────┐
        │ Receive next blocks│
        └──────────┬─────────┘
                   ↓
        ┌────────────────────┐
        │ Drag / merge       │
        └──────────┬─────────┘
                   ↓
        ┌────────────────────┐
        │ Multi-Agent turn   │
        │ LangGraph workflow │
        └──────────┬─────────┘
                   ↓
        ┌────────────────────┐
        │ Graph RAG evidence │
        └──────────┬─────────┘
                   ↓
        ┌────────────────────┐
        │ Result + surprise  │
        └──────────┬─────────┘
                   ↓
        ┌────────────────────┐
        │ Learn / remember   │
        └──────────┬─────────┘
                   ↓
        └────── Discover again
```

## 2.3 Player experience

The player should feel:

> “I wonder what word I can make.”

rather than:

> “I need to finish today's lesson.”

The game therefore rewards experimentation and makes unsuccessful combinations interesting whenever possible.

---

# 3. Formation Outcomes

A merge result MUST be classified into one of these protocol states:

| State | Meaning | UX intent |
|---|---|---|
| `valid` | A supported lexical formation backed by Graph RAG evidence | Celebrate + teach |
| `plausible` | Linguistically plausible, but not sufficiently supported as a target lexical item | Encourage curiosity |
| `playful` | A non-standard formation that is useful for playful exploration | Make it funny, never humiliating |
| `invalid` | The proposed combination cannot be meaningfully processed under current game rules | Gentle recovery |

`playful` is a legitimate product state, not an error path.

The player is never called “stupid”, “wrong”, “bad”, or similar.

---

# 4. System Architecture

## 4.1 Canonical runtime topology

```text
┌──────────────────────────────────────┐
│           Mobile Client              │
│ drag/drop · animation · text · audio │
└──────────────────┬───────────────────┘
                   │ HTTPS / JSON
                   ▼
┌──────────────────────────────────────┐
│            FastAPI Gateway            │
│ auth · request validation · transport │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│             LANGGRAPH SUPERVISOR                  │
│                                                    │
│  ┌────────────┐    ┌──────────────────────────┐   │
│  │   Router   │───▶│ Formation Agent          │   │
│  └────────────┘    └─────────────┬────────────┘   │
│                                  ▼                │
│                    ┌──────────────────────────┐   │
│                    │ Knowledge / RAG Agent    │   │
│                    └─────────────┬────────────┘   │
│                                  ▼                │
│                    ┌──────────────────────────┐   │
│                    │ Validation Agent         │   │
│                    └─────────────┬────────────┘   │
│                                  ▼                │
│                    ┌──────────────────────────┐   │
│                    │ Learning State Agent     │   │
│                    └─────────────┬────────────┘   │
│                                  ▼                │
│                    ┌──────────────────────────┐   │
│                    │ Challenge Agent          │   │
│                    └─────────────┬────────────┘   │
│                                  ▼                │
│                ┌────────────────┴────────────┐   │
│                │ Explanation / Humor Agents  │   │
│                └────────────────┬────────────┘   │
│                                 ▼                 │
│                    ┌──────────────────────────┐   │
│                    │ Response Composer Agent  │   │
│                    └──────────────────────────┘   │
└───────────────────────┬────────────────────────────┘
                        │
              ┌─────────┴───────────┐
              ▼                     ▼
┌────────────────────────┐ ┌────────────────────────┐
│ Graph RAG              │ │ Player State Store     │
│ Linguistic Knowledge   │ │ mastery / sessions     │
└────────────────────────┘ └────────────────────────┘
```

## 4.2 Semantic authority hierarchy

For language facts:

```text
Graph RAG evidence
        ↓
Knowledge Agent
        ↓
Validation Agent
        ↓
Final semantic result
```

For player state:

```text
Persistent state
        ↓
Learning State Agent
        ↓
Challenge Agent
```

For generated language:

```text
Graph RAG evidence
        ↓
Prompt context
        ↓
LLM Agent
        ↓
Typed output validation
```

The LLM may synthesize language but MUST NOT manufacture evidence.

---

# 5. Multi-Agent Model

## 5.1 Agent definition

An **agent** is a bounded reasoning component with:

- one explicit responsibility
- typed input/output
- a constrained tool set
- no authority outside its domain
- observable execution

Agents are coordinated by LangGraph.

## 5.2 Canonical agent roster

### A01 — Router Agent

Purpose:

- Identify the type of incoming game action.
- Select the appropriate workflow path.

Responsibilities:

- classify action
- route to the correct graph branch
- reject unsupported actions safely

Must not:

- mutate player mastery
- invent vocabulary facts

---

### A02 — Formation Agent

Purpose:

- Interpret the player's ordered block combination.

Responsibilities:

- normalize morpheme sequence
- generate candidate word forms
- identify transformation operations
- request relevant Graph RAG evidence

Must not:

- declare lexical truth without evidence
- generate final user-facing humor

---

### A03 — Knowledge / Graph RAG Agent

Purpose:

- Retrieve authoritative linguistic context.

Responsibilities:

- retrieve morphemes
- retrieve words
- retrieve word families
- retrieve etymology
- retrieve semantic relationships
- retrieve formation evidence
- attach provenance

This agent is the primary knowledge gateway for all linguistic facts.

---

### A04 — Validation Agent

Purpose:

- Determine whether the proposed formation is supported by retrieved evidence.

Possible outcomes:

```text
valid
plausible
playful
invalid
```

The agent MUST cite/retain the graph evidence identifiers used for the decision in internal state.

It MUST NOT silently treat an LLM guess as a graph fact.

---

### A05 — Learning State Agent

Purpose:

- Update the player's learning state from observed interaction.

Inputs may include:

- formation outcome
- morphemes encountered
- response time
- retry behavior
- historical mastery
- recent challenge difficulty

Outputs:

- updated mastery signals
- exploration/reinforcement preference
- challenge constraints

The agent deals with **observable game behavior**, not inferred medical or psychological states.

---

### A06 — Challenge Agent

Purpose:

- Generate the next morpheme challenge.

The challenge MUST be constructed from:

```text
Graph RAG
+ Player State
+ Game Policy
+ Recent Context
```

There is no fixed level table.

The agent can search the graph for neighboring concepts and assemble a challenge path dynamically.

---

### A07 — Explanation Agent

Purpose:

- Explain the discovered word or morpheme in simple English.

The prompt MUST receive Graph RAG evidence rather than being asked to “know” the etymology from memory.

---

### A08 — Playfulness Agent

Purpose:

- Generate the humorous response for `playful` formations.

Rules:

- joke about the invented formation, not the player
- remain concise
- remain age-appropriate
- never override classification

---

### A09 — Response Composer Agent

Purpose:

- Combine validated semantic result, explanation, humor, animation cue, and next challenge into one typed response.

This agent MUST NOT invent missing fields.

If required evidence is absent, it must return a safe fallback state or route back to retrieval.

---

### A10 — Safety / Policy Guard Agent

Purpose:

- Inspect generated content before delivery.

Checks include:

- prompt injection attempts
- unsafe generated content
- disallowed content
- accidental sensitive information
- invalid structured output

This agent is a guardrail, not a source of linguistic truth.

---

# 6. LangGraph Workflow Contract

## 6.1 Canonical graph

```text
START
  ↓
ROUTER_AGENT
  ↓
FORMATION_AGENT
  ↓
KNOWLEDGE_AGENT
  ↓
VALIDATION_AGENT
  ├───────────────┐
  │ valid         │ plausible / playful / invalid
  ↓               ↓
LEARNING_AGENT   PLAYFUL / EXPLANATION AGENT
  ↓               │
CHALLENGE_AGENT ◀─┘
  ↓
EXPLANATION_AGENT
  ↓
RESPONSE_COMPOSER_AGENT
  ↓
SAFETY_GUARD_AGENT
  ↓
END
```

The exact branch topology may evolve, but the responsibilities above remain stable.

## 6.2 Graph properties

The graph MUST:

- have typed state
- have deterministic routing conditions where appropriate
- support retries for transient tool failures
- support explicit error states
- preserve evidence identifiers
- avoid unbounded agent loops
- produce one canonical response contract

## 6.3 Agent handoff rule

Agents communicate through LangGraph state, not ad-hoc global variables.

No agent may directly modify another agent's private state.

---

# 7. Canonical LangGraph State

`app/agents/state.py` is the only canonical definition of runtime graph state.

Recommended state shape:

```python
from typing import TypedDict

class GameMasterState(TypedDict, total=False):
    session_id: str
    turn_id: str

    current_blocks: list[dict]
    candidate_formations: list[dict]

    graph_evidence_ids: list[str]
    graph_evidence: list[dict]

    formation_result: dict
    learning_update: dict
    challenge_plan: dict

    explanation: dict
    playful_response: dict

    response: dict
    safety_result: dict

    errors: list[dict]
```

The state schema must remain typed and bounded. Do not use the graph state as an unlimited conversation transcript.

---

# 8. Graph RAG Specification

## 8.1 Purpose

The graph is the product's linguistic knowledge layer.

Its purpose is not merely search. It captures relationships required for dynamic discovery.

## 8.2 Canonical node types

At minimum, support:

```text
Morpheme
Word
Sense
Meaning
Origin
Language
PartOfSpeech
Example
Pronunciation
```

Additional node types may be added through a spec revision.

## 8.3 Canonical edge types

Examples:

```text
MORPHEME_COMPOSES_WORD
WORD_HAS_SENSE
WORD_HAS_ORIGIN
MORPHEME_DERIVED_FROM
WORD_RELATED_TO_WORD
MORPHEME_RELATED_TO_MORPHEME
WORD_HAS_PART_OF_SPEECH
WORD_HAS_EXAMPLE
```

Edge names are part of the knowledge contract and should be versioned.

## 8.4 Example

```text
             ┌─────────────┐
             │ Latin agere │
             └──────┬──────┘
                    │ derived_from
                    ▼
              ┌───────────┐
              │    act    │
              └─────┬─────┘
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       action      react      active
          │          │
          ▼          ▼
       reaction   reaction
```

The graph may store richer relationships than shown above.

## 8.5 Provenance

Every authoritative linguistic fact SHOULD carry provenance metadata such as:

```text
source_id
source_type
source_url / citation reference
verification_status
dataset_version
```

The LLM MUST NOT create authoritative graph facts merely by generating a sentence.

## 8.6 Retrieval policy

The Knowledge Agent should retrieve the **smallest useful subgraph** for the current decision.

Do not send the entire graph into an LLM context window.

---

# 9. Zero-Hardcode Content Architecture

## 9.1 What must be externalized

The following MUST live outside business-logic Python files:

- morpheme vocabulary
- word vocabulary
- meanings
- etymology
- word families
- supported formation paths
- challenge content
- example sentences
- fun-fact source material
- difficulty metadata
- content tags
- learning policy parameters that are expected to change experimentally
- animation metadata that is content/configuration rather than transport protocol

## 9.2 Sources of dynamic content

Approved sources include:

```text
Graph RAG
configuration stores
versioned datasets
player-state store
feature-flag/configuration service
```

## 9.3 Business code rule

Business logic should express **mechanisms**, not content.

Good:

```python
knowledge = await graph_rag.search(query)
```

Bad:

```python
known_roots = {"spect", "act", "tract"}
```

---

# 10. Pydantic Contracts

`app/core/schema.py` is the canonical contract for HTTP-facing models and important inter-agent payloads.

Pydantic validates structure. It does **not** prevent prompt injection and does not establish linguistic truth.

## 10.1 Core models

```python
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class FormationStatus(str, Enum):
    VALID = "valid"
    PLAUSIBLE = "plausible"
    PLAYFUL = "playful"
    INVALID = "invalid"


class MorphemeBlock(BaseModel):
    model_config = ConfigDict(strict=True)

    id: str
    text: str
    block_type: str


class MergeRequest(BaseModel):
    model_config = ConfigDict(strict=True)

    session_id: str
    blocks_merged: list[MorphemeBlock] = Field(min_length=2)


class ValidationDetail(BaseModel):
    model_config = ConfigDict(strict=True)

    status: FormationStatus
    word_formed: str | None
    word_type: str | None
    explanation: str
    fun_fact: str | None
    animation_trigger: str
    evidence_ids: list[str]


class MergeResponse(BaseModel):
    model_config = ConfigDict(strict=True)

    validation: ValidationDetail
    next_blocks: list[MorphemeBlock]
    player_flow_state: str
    turn_id: str
```

## 10.2 Why `block_type` remains a string

The definitive type of a block is knowledge-layer data. The API transport should not encode a closed world of linguistic categories unless the product requires it.

Examples can be stored and retrieved dynamically:

```text
prefix
root
suffix
linking_form
stem
unknown
```

The graph remains authoritative.

## 10.3 Why `evidence_ids` is mandatory

Every semantic result based on knowledge MUST be traceable to graph evidence.

A response without sufficient evidence must not be presented as verified factual knowledge.

---

# 11. Player State

Player state is separate from the linguistic knowledge graph.

The graph answers:

> “What do we know about English?”

The player-state store answers:

> “What has this player experienced?”

## 11.1 Example player state

```text
player_id
morpheme_mastery
word_exposure
recent_turns
success_rate
response_time
retry_frequency
streak
exploration_ratio
recent_topics
```

## 11.2 No fake psychology

The system MUST NOT claim to directly measure:

- dopamine
- happiness
- boredom
- motivation
- attention
- mental health

It may use observable behavioral signals as gameplay heuristics.

---

# 12. Adaptive Difficulty

Difficulty is dynamic and graph-driven.

The Challenge Agent should consider:

```text
player state
+ graph neighborhood
+ prior exposure
+ formation complexity
+ recent success/failure
+ content difficulty metadata
```

The system must not use hardcoded level-to-word mappings.

## 12.1 Exploration / reinforcement

The initial product hypothesis may use a configurable balance such as:

```text
reinforcement: 70%
exploration:   30%
```

This is a **configurable policy parameter**, not source-code truth.

Agents should treat it as experimental configuration.

---

# 13. Explanation and Playfulness

## 13.1 Explanation Agent

The Explanation Agent receives:

```text
word
morpheme breakdown
meaning
etymology
relevant graph evidence
player language level
```

It produces concise learner-facing content.

It MUST NOT infer unsupported etymology.

## 13.2 Playfulness Agent

For an invented formation such as:

```text
un + apple
```

the agent may respond with playful language such as:

> “Not a standard English word yet — but you may have just invented the opposite of an apple.”

The exact joke is generated dynamically.

The agent must never ridicule the player.

---

# 14. Prompt Architecture

Prompts are not scattered through Python business logic.

Canonical location:

```text
app/prompts/
```

Recommended:

```text
app/prompts/
├── router.yaml
├── formation.yaml
├── validation.yaml
├── explanation.yaml
├── playful.yaml
├── learning.yaml
├── challenge.yaml
└── response_composer.yaml
```

Prompts may be optimized with DSPy, but the optimized prompt must preserve the same typed contract and safety constraints.

---

# 15. LLM Contract

LLMs are replaceable infrastructure components.

The codebase MUST expose a provider-neutral interface.

Example conceptual interface:

```python
class LLMProvider:
    async def structured_generate(...): ...
```

Agents request structured outputs rather than raw free-form strings where possible.

Provider-specific SDK details must remain inside provider adapters.

---

# 16. Prompt Injection & Trust Boundaries

Prompt injection is handled as a security concern, not as a Pydantic concern.

The system MUST:

- isolate untrusted player text from trusted system instructions
- never allow player text to redefine agent role/policy
- restrict tools by agent
- validate structured model outputs
- prevent generated text from directly executing tools without authorization
- keep graph data read/write permissions explicit
- treat retrieved external text as untrusted unless provenance policy marks it trusted

## 16.1 Tool permission principle

Example:

```text
Knowledge Agent
    → graph read

Learning Agent
    → player-state read/write

Challenge Agent
    → graph read
    → player-state read

Explanation Agent
    → graph read

Playfulness Agent
    → no write access to authoritative state
```

Agents receive the minimum tool permissions required by their role.

---

# 17. FastAPI Boundary

FastAPI is the transport boundary, not the game brain.

Canonical responsibilities:

- HTTP routing
- authentication/dependency injection
- request validation
- response validation
- error mapping
- request metadata
- invocation of the LangGraph workflow

A route handler MUST NOT contain morphology logic such as:

```python
if blocks == ...
```

The route should call the graph runtime.

---

# 18. Canonical Backend Repository

```text
morpheme-alchemy-engine/
├── app/
│   ├── api/
│   │   ├── dependencies.py
│   │   └── routes/
│   │       └── game.py
│   │
│   ├── agents/
│   │   ├── supervisor.py
│   │   ├── router_agent.py
│   │   ├── formation_agent.py
│   │   ├── knowledge_agent.py
│   │   ├── validation_agent.py
│   │   ├── learning_agent.py
│   │   ├── challenge_agent.py
│   │   ├── explanation_agent.py
│   │   ├── playfulness_agent.py
│   │   ├── response_agent.py
│   │   ├── safety_agent.py
│   │   └── state.py
│   │
│   ├── rag/
│   │   ├── graph.py
│   │   ├── schema.py
│   │   ├── retriever.py
│   │   └── provenance.py
│   │
│   ├── domain/
│   │   ├── formation.py
│   │   ├── policies.py
│   │   └── tools.py
│   │
│   ├── llm/
│   │   ├── base.py
│   │   └── providers/
│   │
│   ├── prompts/
│   │   ├── router.yaml
│   │   ├── formation.yaml
│   │   ├── validation.yaml
│   │   ├── learning.yaml
│   │   ├── challenge.yaml
│   │   ├── explanation.yaml
│   │   ├── playful.yaml
│   │   └── response_composer.yaml
│   │
│   ├── player_state/
│   │   ├── repository.py
│   │   └── models.py
│   │
│   ├── observability/
│   │   └── tracing.py
│   │
│   └── core/
│       ├── config.py
│       └── schema.py
│
├── tests/
│   ├── unit/
│   ├── agents/
│   ├── rag/
│   ├── contracts/
│   ├── integration/
│   └── evals/
│
├── config.yaml
├── pyproject.toml
├── .env.example
├── README.md
└── main.py
```

### Important

Directory structure is architectural guidance. Agents may create additional modules when justified, but MUST preserve ownership boundaries.

---

# 19. Module Ownership

| Module | Owns | Must not own |
|---|---|---|
| `api` | HTTP transport | semantic game logic |
| `agents` | semantic orchestration | raw DB implementation details |
| `rag` | graph knowledge and retrieval | player mastery |
| `domain` | reusable execution mechanisms | hardcoded vocabulary |
| `llm` | provider abstraction | product state mutation |
| `prompts` | prompt definitions | HTTP or persistence logic |
| `player_state` | persistence of player state | linguistic truth |
| `observability` | telemetry | gameplay decisions |
| `core` | schemas/config | agent reasoning |

---

# 20. Deterministic Code Policy

Deterministic code is still required, but its role is **mechanical safety and consistency**, not hardcoded linguistic knowledge.

Allowed deterministic mechanisms:

- Pydantic validation
- normalization algorithms
- graph query construction
- tool permissions
- state serialization
- retry policies
- timeout handling
- output schema validation
- rate limiting
- idempotency
- persistence

Not allowed as domain authority:

- Python word dictionaries embedded in code
- Python morpheme catalogs
- fixed level trees
- static etymology facts
- hardcoded “correct” combinations
- hardcoded challenge inventories

---

# 21. Graph RAG Data Ingestion

The system must support an ingestion pipeline that converts external linguistic sources into versioned graph data.

Conceptual flow:

```text
Source
  ↓
Parser / Normalizer
  ↓
Entity extraction
  ↓
Relationship extraction
  ↓
Provenance attachment
  ↓
Validation
  ↓
Graph upsert
  ↓
Dataset version
```

The ingestion pipeline is separate from runtime agents.

Runtime agents must never silently mutate authoritative graph knowledge because a player asked for a fact.

---

# 22. Source of Truth Rules

There are three distinct authorities.

## 22.1 Product behavior authority

`spec.md`

## 22.2 Linguistic knowledge authority

Versioned Graph RAG dataset + provenance.

## 22.3 Player experience authority

Versioned player state + LangGraph state transition policy.

No single LLM prompt is an authority on all three.

---

# 23. API Contract

Initial semantic endpoint:

```text
POST /api/v1/game/turn
```

Request:

```json
{
  "session_id": "string",
  "blocks_merged": [
    {
      "id": "string",
      "text": "string",
      "block_type": "string"
    }
  ]
}
```

Response:

```json
{
  "validation": {
    "status": "valid",
    "word_formed": "reaction",
    "word_type": "noun",
    "explanation": "A reaction is a response to something.",
    "fun_fact": "...",
    "animation_trigger": "...",
    "evidence_ids": ["graph-node-or-edge-id"]
  },
  "next_blocks": [],
  "player_flow_state": "engaged",
  "turn_id": "..."
}
```

The actual animation identifier, next blocks, and explanation are dynamic data returned by the graph runtime.

---

# 24. Error Handling

Every failure MUST resolve into a typed, user-safe state.

Examples:

```text
GRAPH_UNAVAILABLE
LLM_TIMEOUT
INVALID_AGENT_OUTPUT
INSUFFICIENT_EVIDENCE
PLAYER_STATE_UNAVAILABLE
RATE_LIMITED
UNSUPPORTED_ACTION
```

The system should recover gracefully where possible.

No raw stack trace is ever returned to the mobile client.

---

# 25. Observability

Every game turn should produce a trace:

```text
request
  ↓
router agent
  ↓
formation agent
  ↓
knowledge agent
  ↓
validation agent
  ↓
learning agent
  ↓
challenge agent
  ↓
explanation/playfulness
  ↓
response
  ↓
safety
```

Minimum useful fields:

```text
trace_id
session_id
turn_id
agent_name
agent_version
tool_name
graph_evidence_ids
latency_ms
llm_provider
model
input_token_count
output_token_count
result_status
error_code
```

Do not log hidden chain-of-thought or private reasoning.

---

# 26. Testing Philosophy

Because the system is agentic, tests must verify both deterministic contracts and emergent behavior.

## 26.1 Unit tests

Test:

- normalization
- graph query builders
- policy evaluation
- schema validation
- state serialization
- tool permissions

## 26.2 Graph RAG tests

Test:

- entity retrieval
- relationship retrieval
- provenance preservation
- missing-evidence behavior
- graph version compatibility

## 26.3 Agent contract tests

Every agent must have:

```text
input fixture
→ agent
→ typed output
→ invariant assertions
```

## 26.4 Workflow tests

Test complete paths:

```text
valid
plausible
playful
invalid
LLM timeout
Graph RAG unavailable
malicious player text
invalid model output
```

## 26.5 Evaluation tests

The evaluation suite should measure:

- factuality against graph evidence
- explanation usefulness
- structured-output compliance
- humor quality for playful cases
- challenge appropriateness
- repetition rate
- latency
- token cost

---

# 27. Acceptance Criteria — MVP

The MVP is not complete until all statements below are true.

## Product

- [ ] Player can merge morpheme blocks.
- [ ] Player receives immediate typed feedback.
- [ ] Valid formations teach something about the word.
- [ ] Playful formations can produce humor without punishment.
- [ ] There is no fixed level ladder.

## Multi-Agent

- [ ] Every meaningful game turn executes through LangGraph.
- [ ] At least the canonical specialist agents exist as bounded responsibilities.
- [ ] Agent communication uses typed graph state.
- [ ] Agent tool permissions are explicit.
- [ ] The workflow is observable.

## Graph RAG

- [ ] Morphemes and words are stored in the knowledge graph.
- [ ] Word relationships can be traversed.
- [ ] Runtime semantic decisions can retrieve graph evidence.
- [ ] Results retain evidence identifiers.
- [ ] Graph content is versioned.

## Zero-Hardcode

- [ ] No word list is embedded in application code.
- [ ] No morpheme catalog is embedded in application code.
- [ ] No fixed level content exists.
- [ ] No static “correct answer” table exists in business logic.
- [ ] Challenge content is generated/retrieved dynamically.

## LLM

- [ ] LLM providers are abstracted.
- [ ] LLM outputs are structurally validated.
- [ ] LLMs receive retrieved evidence where factual claims are required.
- [ ] LLMs cannot directly mutate authoritative player state.

## Security

- [ ] Prompt injection boundaries are explicit.
- [ ] Tool permissions are least-privilege.
- [ ] Player text cannot redefine agent policy.

---

# 28. AI Agent Task Decomposition

This section exists specifically so CLI agents can divide work without stepping on each other.

## Agent 01 — Core Contract

Owns:

```text
app/core/schema.py
app/core/config.py
```

Deliverables:

- canonical Pydantic models
- configuration contracts
- model validation

Must not:

- implement agent reasoning
- add vocabulary literals

---

## Agent 02 — Graph RAG

Owns:

```text
app/rag/*
```

Deliverables:

- graph schema
- graph adapters
- retriever
- provenance model
- query interfaces

Must not:

- generate user-facing copy
- mutate player mastery
- encode vocabulary in Python

---

## Agent 03 — Formation Agent

Owns:

```text
app/agents/formation_agent.py
app/domain/formation.py
```

Deliverables:

- block-sequence interpretation
- candidate formation generation
- transformation operations

Must retrieve evidence instead of maintaining a private dictionary.

---

## Agent 04 — Validation Agent

Owns:

```text
app/agents/validation_agent.py
```

Deliverables:

- evidence-based classification
- `valid/plausible/playful/invalid`
- evidence propagation

---

## Agent 05 — Learning Agent

Owns:

```text
app/agents/learning_agent.py
app/player_state/*
```

Deliverables:

- mastery persistence
- learning-state update
- observable behavior features

---

## Agent 06 — Challenge Agent

Owns:

```text
app/agents/challenge_agent.py
```

Deliverables:

- dynamic challenge generation
- graph neighborhood exploration
- reinforcement/exploration policy

No level files.

---

## Agent 07 — Explanation / Playfulness

Owns:

```text
app/agents/explanation_agent.py
app/agents/playfulness_agent.py
app/prompts/*
app/llm/*
```

Deliverables:

- structured LLM calls
- evidence-grounded explanations
- playful responses
- provider abstraction

---

## Agent 08 — Supervisor / LangGraph

Owns:

```text
app/agents/supervisor.py
app/agents/router_agent.py
app/agents/state.py
```

Deliverables:

- graph topology
- routing
- state transitions
- retries/timeouts
- bounded loops

---

## Agent 09 — API

Owns:

```text
app/api/*
main.py
```

Deliverables:

- FastAPI endpoints
- dependency injection
- HTTP mapping
- invoking LangGraph runtime

Routes contain no domain decisions.

---

## Agent 10 — Safety / Observability

Owns:

```text
app/agents/safety_agent.py
app/observability/*
```

Deliverables:

- policy checks
- prompt-injection handling
- structured traces
- telemetry

---

## Agent 11 — QA / Evaluations

Owns:

```text
tests/*
```

Deliverables:

- unit tests
- graph tests
- workflow tests
- agent contract tests
- LLM evaluations
- regression suite

---

# 29. Agent Coordination Rules

Every AI coding agent MUST follow these rules:

1. Read `spec.md` before changing architecture.
2. State which files it owns before implementation.
3. Do not edit another agent's owned files unless explicitly coordinated.
4. Do not create competing schemas for the same concept.
5. Do not add hidden domain knowledge to code.
6. Do not invent graph entities when evidence is required.
7. Do not replace an agent with direct route logic.
8. Do not bypass LangGraph for semantic game behavior.
9. Do not bypass Graph RAG for linguistic facts.
10. Add tests for every behavior change.
11. When requirements are ambiguous, prefer the smallest change that preserves the architecture invariants.
12. When a required behavior cannot be implemented without breaking an invariant, update this spec before changing the invariant.

---

# 30. Definition of Done

A task is complete only when:

- code satisfies this spec
- ownership boundaries remain intact
- relevant tests exist
- structured outputs are validated
- Graph RAG evidence is preserved when required
- no hardcoded domain content was introduced
- traces can explain the execution path
- no unrelated infrastructure was added
- the agent clearly reports changed files and verification results

“Code runs” is not sufficient.

---

# 31. Anti-Patterns

The following are architectural failures:

### Anti-pattern 1 — Giant Agent

One giant prompt performs routing, retrieval, validation, learning, humor, and response generation.

**Why forbidden:** destroys bounded ownership and makes evaluation impossible.

### Anti-pattern 2 — CRUD + One LLM Call

FastAPI validates input, code performs business logic, then an LLM writes a fun fact.

**Why forbidden:** violates the Multi-Agent product architecture.

### Anti-pattern 3 — Dictionary Hidden in Code

A Python list of words is used as an implicit knowledge base.

**Why forbidden:** violates zero-hardcode and bypasses Graph RAG.

### Anti-pattern 4 — LLM as Dictionary

The LLM is asked whether a word exists and the answer is accepted without graph evidence.

**Why forbidden:** makes factual behavior nondeterministic and untraceable.

### Anti-pattern 5 — Agent Writes Everything

Every agent has access to every tool/database.

**Why forbidden:** violates least privilege and makes state corruption likely.

### Anti-pattern 6 — Hardcoded Level Tree

The system contains `level_1`, `level_2`, etc. as the primary content source.

**Why forbidden:** contradicts dynamic discovery.

---

# 32. Delivery Phases

The architecture is fixed, but implementation can be incremental.

## Phase 0 — Contracts

Build:

- schemas
- LangGraph state
- graph schema
- agent interfaces
- tool interfaces

No polished UI required.

## Phase 1 — Knowledge + Core Graph

Build:

- Graph RAG
- initial versioned dataset
- provenance
- retrieval tools

## Phase 2 — Multi-Agent Turn

Build:

- Router
- Formation
- Knowledge
- Validation
- Learning
- Challenge
- Response
- Safety

## Phase 3 — Playable Mobile Loop

Build:

- drag/drop
- merge animations
- response rendering
- session persistence

## Phase 4 — Evaluation

Measure:

- factual accuracy
- latency
- token cost
- repetition
- challenge quality
- player retention signals

## Phase 5 — Optimization

Only after evidence exists, consider:

- DSPy optimization
- model routing
- caching
- graph indexing improvements
- parallel agent branches
- richer personalization

---

# 33. Future Extensions

Potential later capabilities:

- pronunciation learning
- listening mode
- sentence construction
- word-family quests
- semantic neighborhoods
- spaced exposure
- voice interaction
- personalized discovery paths

Each new capability must preserve:

```text
Multi-Agent
+ Graph RAG
+ Zero-Hardcode Domain Content
+ Thin Client
```

---

# 34. Decision Log

## D001 — Multi-Agent is core architecture

Decision: LangGraph coordinates specialized agents for every meaningful semantic turn.

Reason: the product is intended to be AI-native rather than merely LLM-augmented.

## D002 — Graph RAG is the linguistic knowledge layer

Decision: English morphology, word relationships, and etymology are retrieved through the knowledge graph.

Reason: the product's gameplay depends on relationship traversal and discovery.

## D003 — Zero-hardcode

Decision: no hardcoded domain content in business logic.

Reason: dynamic generation and future dataset growth must not require code edits.

## D004 — No fixed levels

Decision: challenges are dynamically generated from graph + player state.

Reason: preserve discovery and personalization.

## D005 — LLM is not evidence

Decision: generated language is not authoritative linguistic knowledge without retrieved evidence.

Reason: prevent hallucinated etymology and inconsistent validation.

## D006 — Player state is separate from linguistic knowledge

Decision: Graph RAG answers “what English is”; player state answers “what this player experienced”.

Reason: clean separation of knowledge and personalization.

## D007 — Deterministic code remains

Decision: deterministic mechanisms are allowed for schemas, security, normalization, persistence, permissions, retries, and orchestration mechanics.

Reason: “zero-hardcode” applies to domain content, not basic software correctness.

---

# 35. Final Invariant

Every AI agent working on `morpheme-alchemy-engine` should be able to answer these questions before coding:

### Where does the English knowledge come from?

**Graph RAG.**

### Who decides what happens during a game turn?

**The LangGraph Multi-Agent workflow.**

### Where does player-specific adaptation come from?

**Player State + Learning/Challenge Agents.**

### Where does user-facing language come from?

**Specialized generation agents grounded in Graph RAG evidence.**

### Where is vocabulary hardcoded?

**Nowhere in business code.**

### What does the frontend know?

**How to render the experience — not how English works.**

### What is the product's core loop?

```text
MERGE
  ↓
DISCOVER
  ↓
SURPRISE
  ↓
UNDERSTAND
  ↓
REMEMBER
  ↓
MERGE AGAIN
```

That loop, together with **Multi-Agent LangGraph + Graph RAG + Zero-Hardcode Domain Content**, is the architectural identity of Morpheme Alchemy.

---

# 36. Change Log

## 2026-09-20 — Architecture reset

- Reframed `spec.md` around the new product statement: passive English learning through morpheme merging.
- Made Multi-Agent LangGraph mandatory rather than optional.
- Made Graph RAG mandatory rather than a future phase.
- Replaced the previous “deterministic lexicon as authority” model with Graph RAG as the authoritative linguistic knowledge layer.
- Defined `zero-hardcode` precisely as zero hardcoded domain content/knowledge in business logic.
- Defined a canonical specialist-agent roster.
- Defined LangGraph supervisor workflow and typed agent handoffs.
- Added Graph RAG entity, edge, provenance, and retrieval requirements.
- Removed fixed-level architecture as a product primitive.
- Kept deterministic mechanisms for schema validation, security, persistence, and execution correctness.
- Added explicit prompt-injection and least-privilege requirements.
- Added agent ownership boundaries optimized for parallel CLI implementation.
- Added anti-patterns specifically preventing agents from collapsing the system back into CRUD + one LLM call.

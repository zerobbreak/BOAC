# VEX — Shared Content Model for CMS (Task 1.3)
**Author:** Bokamoso Sebake (BK — UI/UX Design Lead & Content Architect)  
**Project:** VEX AI Prompt Library (PROG7314 / INSY7315 Task 2)  
**Target:** Headless CMS Architecture & Cross-Platform Schema Definition  

---

## 1. Overview & Architecture Strategy

The VEX Shared Content Model defines the unified data contracts and content lifecycle across the **Headless CMS Engine**, the **Node.js/Express REST API**, the **PostgreSQL Cloud Database**, and the **Android Native Client (RoomDB SQLite)**.

### Architectural Principles:
* **Decoupled Omnichannel Delivery**: Content models are consumed uniformly via REST/JSON by web frontends, mobile clients, and automated CLI tools.
* **Granular Revision Tracking**: All prompts and templates support structural versioning (`PromptVersion`) allowing rollback, branching, and longitudinal scoring.
* **Offline Reconciliation**: Every entity maintains `createdAt`, `updatedAt`, and `version` timestamps enabling deterministic Last-Write-Wins (LWW) conflict resolution during mobile sync.

---

## 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ PROMPT : owns
    USER ||--o{ PROMPT_TEMPLATE : authors
    USER ||--o{ SHORTCUT : defines
    USER ||--o{ SETTINGS : configures
    USER ||--o{ COMMUNITY_VOTE : casts

    CATEGORY ||--o{ PROMPT : classifies
    CATEGORY ||--o{ PROMPT_TEMPLATE : organizes

    PROMPT ||--|{ PROMPT_VERSION : contains
    PROMPT ||--o{ MODEL_RUN : executes
    PROMPT ||--o{ SHARE_LINK : shares
    PROMPT ||--o{ COMMUNITY_POST : publishes

    PROMPT_TEMPLATE ||--o{ PROMPT : instantiates

    MODEL_RUN }|--|| MODEL_PROVIDER : targets
    COMMUNITY_POST ||--o{ COMMUNITY_VOTE : receives

    USER {
        uuid id PK
        string email
        string display_name
        string avatar_url
        string firebase_uid
        enum role "admin, editor, user"
        datetime created_at
        datetime updated_at
    }

    CATEGORY {
        uuid id PK
        string slug UK
        string name
        string description
        string color_hex
        string icon_key
        int sort_order
    }

    PROMPT {
        uuid id PK
        uuid owner_id FK
        uuid category_id FK
        string title
        string description
        string current_body
        json dynamic_variables
        json tags
        boolean is_shared
        boolean is_favorite
        datetime created_at
        datetime updated_at
    }

    PROMPT_VERSION {
        uuid id PK
        uuid prompt_id FK
        int version_number
        string commit_message
        string body_snapshot
        json variables_snapshot
        datetime created_at
    }

    PROMPT_TEMPLATE {
        uuid id PK
        uuid category_id FK
        uuid author_id FK "nullable for system templates"
        string title
        string summary
        string template_body
        json default_parameters
        json suggested_models
        boolean is_curated
        int usage_count
        datetime published_at
    }

    MODEL_RUN {
        uuid id PK
        uuid prompt_id FK
        uuid provider_id FK
        json input_variables
        text output_text
        int latency_ms
        int prompt_tokens
        int completion_tokens
        float consistency_score
        enum status "queued, running, complete, failed"
        text error_message
        datetime executed_at
    }

    MODEL_PROVIDER {
        uuid id PK
        string model_id UK "e.g. gpt-4o, gemini-1.5-pro, claude-3-5"
        string display_name
        string company "OpenAI, Google, Anthropic"
        int max_context_tokens
        float default_temperature
        boolean is_active
    }

    COMMUNITY_POST {
        uuid id PK
        uuid prompt_id FK
        uuid author_id FK
        string title
        string showcase_output
        int upvote_count
        int clone_count
        enum status "draft, pending_review, published, archived"
        datetime published_at
    }

    COMMUNITY_VOTE {
        uuid id PK
        uuid post_id FK
        uuid user_id FK
        int vote_direction "+1 or -1"
        datetime created_at
    }

    SHARE_LINK {
        uuid id PK
        uuid prompt_id FK
        string token UK
        enum access_level "view, copy, execute"
        datetime expires_at
        int click_count
    }

    SETTINGS {
        uuid user_id PK, FK
        enum theme "light, dark, system"
        string default_model
        enum language "en, zu, af"
        boolean notifications_enabled
        boolean biometric_enabled
        json custom_shortcuts
    }
```

---

## 3. Detailed Entity & Field Specifications

### 3.1 `Prompt` & `PromptVersion` Content Type
Represents the primary user asset within the workbench.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Prompt",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "ownerId": { "type": "string", "format": "uuid" },
    "categoryId": { "type": "string", "format": "uuid" },
    "title": { "type": "string", "minLength": 1, "maxLength": 120 },
    "description": { "type": "string", "maxLength": 500 },
    "currentBody": { 
      "type": "string", 
      "description": "Raw prompt text with {variable} placeholders"
    },
    "dynamicVariables": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "defaultValue": { "type": "string" },
          "description": { "type": "string" },
          "isRequired": { "type": "boolean" }
        },
        "required": ["name", "isRequired"]
      }
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "isShared": { "type": "boolean", "default": false },
    "isFavorite": { "type": "boolean", "default": false },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "ownerId", "categoryId", "title", "currentBody"]
}
```

---

### 3.2 `PromptTemplate` (Curated / CMS Template)
Editorial content authored by administrators or vetted community contributors.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PromptTemplate",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "categoryId": { "type": "string", "format": "uuid" },
    "authorId": { "type": ["string", "null"], "format": "uuid" },
    "title": { "type": "string", "maxLength": 100 },
    "summary": { "type": "string", "maxLength": 280 },
    "templateBody": { "type": "string" },
    "defaultParameters": {
      "type": "object",
      "additionalProperties": { "type": "string" }
    },
    "suggestedModels": {
      "type": "array",
      "items": { "type": "string" }
    },
    "isCurated": { "type": "boolean", "default": true },
    "usageCount": { "type": "integer", "minimum": 0 },
    "publishedAt": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "categoryId", "title", "templateBody"]
}
```

---

### 3.3 `ModelRun` (Telemetry & Execution Output)
Captures execution logs, performance latency, token metrics, and accuracy scoring.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique run execution identifier |
| `promptId` | `UUID` (FK) | Reference to parent `Prompt` |
| `providerId` | `UUID` (FK) | Reference to `ModelProvider` (e.g., GPT-4o) |
| `inputVariables` | `JSON` | Key-value mapping of injected runtime variables |
| `outputText` | `TEXT` | Raw model completion returned by provider |
| `latencyMs` | `INT` | End-to-end response latency in milliseconds |
| `promptTokens` | `INT` | Token count of assembled input |
| `completionTokens`| `INT` | Token count of model response |
| `consistencyScore`| `FLOAT` | Heuristic evaluation score (0.00 – 1.00) |
| `status` | `ENUM` | `queued`, `running`, `complete`, `failed` |
| `executedAt` | `DATETIME` | UTC timestamp of run initiation |

---

## 4. CMS Editorial Workflow & Content Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft : Creator/Editor drafts template
    Draft --> InReview : Submitted for moderation
    InReview --> ChangesRequested : Quality check fails
    ChangesRequested --> Draft : Author updates content
    InReview --> Approved : Editorial standards met
    Approved --> Published : Broadcasted to Community / API
    Published --> Featured : Promoted by Admin to Spotlight
    Published --> Archived : Deprecated or flagged
    Archived --> [*]
```

---

## 5. Conflict Resolution & Offline Synchronization Rules

1. **Last-Write-Wins (LWW)**:
   * Each record maintains a monotonic `updatedAt` UTC timestamp.
   * When Android `WorkManager` flushes offline mutations, the API compares incoming `updatedAt` against PostgreSQL state. If client timestamp is newer, write succeeds; otherwise, server responds with `409 Conflict` and latest snapshot.
2. **Cascade Deletion Integrity**:
   * Deleting a `Prompt` cascades and hard-deletes associated `PromptVersion` and `ShareLink` records.
   * `ModelRun` records can be optionally preserved with `prompt_id` set to `NULL` to maintain anonymous execution telemetry.

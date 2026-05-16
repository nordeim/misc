# TGS-RAG Enterprise Production Blueprint v2.0
## Merged & Validated Product Requirements Document (PRD)

**Document Status**: Approved for Implementation  
**Target Release**: Q4 2026  
**Classification**: Internal - Engineering, Architecture & Security  
**Based On**: arXiv:2605.05643 (TGS-RAG), Enterprise RAG Best Practices, Critical Architecture Review

---

## Executive Summary: Validated Claims & Scope Definition

### ✅ Fully Validated Core Claims (Primary Source: arXiv:2605.05643 [[113]])

| Claim | Paper Reference | Implementation Requirement |
|-------|----------------|---------------------------|
| **Bidirectional Text-Graph Synergy** | Section 3.3, Fig. 2 | Implement BOTH Graph-to-Text (Global Voting) AND Text-to-Graph (Path Confirmation + Orphan Bridging) channels |
| **Global Voting Re-ranking** | Eq. 2, Section 3.3.1 | Weighted fusion: `α·Norm(sim) + (1-α)·Norm(Rec)` with α=0.5 |
| **Memory-based Orphan Entity Bridging** | Algorithm 2, Section 3.3.2 | Redis-backed Visited Memory with application-level LRU eviction; k_o=3 top orphans resurrected |
| **Semantic Beam Search Parameters** | Appendix C.1, Table 4 | Beam width K=20, Search depth d=3 (paper-specified, not arbitrary) |
| **Strict Hit Rate (MuSiQue)** | Table 1 | ≥34.84% (baseline target for multi-hop reasoning) |
| **LLM Judge Accuracy (HotpotQA)** | Table 1 | ≥79.99% (baseline target for answer quality) |
| **Token Efficiency vs GraphRAG** | Section 4.4, Table 2 | ≥63% reduction on MuSiQue, ≥66% on HotpotQA (LLM completion tokens) |
| **Zero-Overhead Path Resurrection** | Section 3.3.2 | Visited Memory caches pruned path topology; resurrection requires NO additional DB queries |

### 🎯 Product Vision
> Build a cloud-native, multi-tenant RAG platform that solves the "Information Island" problem by implementing TGS-RAG's **complete bidirectional verification framework**—delivering superior multi-hop reasoning accuracy with 60-70% lower inference costs than global graph indexing approaches, while maintaining enterprise-grade security, observability, and cost transparency.

### 📊 Success Metrics (KPIs)

| Metric | Target | Measurement Method | Source |
|--------|--------|-------------------|--------|
| Strict Hit Rate (MuSiQue) | ≥34.84% | Provenance mapping evaluation | Paper Table 1 [[113]] |
| LLM Judge Accuracy (HotpotQA) | ≥79.99% | DeepSeek-V3.2 as impartial judge | Paper Table 1 [[113]] |
| Token Efficiency vs GraphRAG | ≥63% reduction | LLM completion token tracking | Paper Table 2 [[113]] |
| P95 Query Latency | <2.5s | Distributed tracing (OpenTelemetry) | Enterprise SLO |
| Bridging Recall Rate | ≥15% | % orphan entities successfully resurrected | Derived from k_o=3 |
| Multi-tenant Isolation | 100% | RBAC audit logs + tenant-scoped queries | SOC 2 Requirement |
| Cache Hit Rate (Visited Memory) | ≥40% | Redis metrics monitoring | Cost optimization target |

---

## 1. System Architecture (C4 Model)

### 1.1 Level 1: System Context Diagram

```mermaid
graph TB
    User["Client Applications\n(Web/Mobile/API)"] --> Gateway["API Gateway\n(Kong/Traefik + OIDC/SAML)"]
    
    Gateway --> TGS_API["TGS-RAG Control Plane\n(FastAPI Microservices)"]
    
    subgraph "TGS-RAG Core Services"
        TGS_API --> Orchestrator["TGS Orchestrator Service\n(Async In-Process Workflow)"]
        TGS_API --> Ingestion["Ingestion & KG Builder Service\n(Temporal Workflow)"]
        TGS_API --> TextRetrieval["Text Retrieval Service\n(Vector Search)"]
        TGS_API --> GraphRetrieval["Graph Retrieval Service\n(Graph Traversal)"]
        TGS_API --> LLMGateway["LLM Gateway Service\n(Provider Abstraction)"]
    end
    
    Orchestrator --> TextRetrieval
    Orchestrator --> GraphRetrieval
    Orchestrator --> LLMGateway
    
    Ingestion --> ObjectStore["Document Store\n(MinIO/S3)"]
    Ingestion --> VectorDB["Vector Database\n(Qdrant)"]
    Ingestion --> GraphDB["Graph Database\n(Neo4j)"]
    
    TextRetrieval --> VectorDB
    GraphRetrieval --> GraphDB
    
    LLMGateway --> LLMProviders["LLM Backends\n(vLLM/Ollama/OpenAI)"]
    
    Orchestrator --> Redis["Cache Layer\n(Redis Cluster + Application LRU)"]
    
    AllServices --> Observability["Observability Stack\n(Prometheus/Grafana/OpenTelemetry)"]
    AllServices --> Security["Security Layer\n(Vault + RBAC + Audit Logging)"]
```

### 1.2 Level 2: Container Diagram (TGS Orchestrator - Query Path)

```mermaid
graph LR
    subgraph "TGS Orchestrator Service (Async In-Process)"
        API["REST/gRPC Endpoint"] --> SparsityGate["Graph Sparsity Gate\n(Proactive Cold-Start Handling)"]
        
        SparsityGate --> ParallelRetrieval["Parallel Retrieval\n(Text + Graph Channels)"]
        
        ParallelRetrieval --> GraphChannel["Graph-to-Text Channel\n(Global Voting)"]
        ParallelRetrieval --> TextChannel["Text-to-Graph Channel\n(Path Confirmation + Orphan Bridging)"]
        
        GraphChannel --> Voting["Global Voting Scorer\nα·sim + (1-α)·Rec(c); α=0.5"]
        TextChannel --> PathConfirm["Path Confirmation\nScore_conf(p) = Score_base + ε·|E(p)∩E(C)|"]
        TextChannel --> Bridging["Memory-based Orphan Bridging\nAlgorithm 2; k_o=3"]
        
        Voting --> Fusion["Context Fusion Module"]
        PathConfirm --> Fusion
        Bridging --> Fusion
        
        Fusion --> PromptBuilder["Prompt Assembly & Template Engine"]
        PromptBuilder --> LLMClient["LLM Gateway Client"]
        
        GraphChannel --> VisitedMem["Visited Memory Cache\n(Redis + App-Level LRU)"]
        Bridging --> VisitedMem
        PathConfirm --> VisitedMem
    end
```

---

## 2. Detailed Component Specifications

### 2.1 Ingestion & Knowledge Graph Building Service (Temporal Workflow)

**Purpose**: Offline pipeline to construct synchronized vector + graph indices from raw documents [[3]][[12]].

#### Sub-Components & Implementation Patterns

| Component | Technology | Key Implementation Details | Paper Alignment |
|-----------|-----------|---------------------------|----------------|
| **Document Parser** | `unstructured.io` + `pypdf` | Semantic chunking with overlap=50 tokens; title-aware splitting [[3]] | Supports context preservation for entity extraction |
| **Entity/Relation Extractor** | GPT-4o-mini + prompt template (Paper Appendix A.1 [[113]]) | Batch extraction with JSON Lines; entity deduplication via fuzzy matching; confidence threshold ≥0.7 | Matches paper's extraction pipeline specification |
| **Vectorizer** | `Qwen3-Embedding-0.6B` (1024-dim, MRL) [[113]] | Async embedding generation; batch size=32; store embeddings in Qdrant with payload metadata | Paper-specified embedding model; Apache 2.0 license |
| **Graph Builder** | `neo4j-graphrag-python` v1.14.1 + Cypher MERGE | Idempotent ingestion; create constraints/indexes upfront [[12]]; bidirectional `SOURCE_CHUNK`/`CONTAINS_ENTITY` relationships | Implements paper's bidirectional mapping M between C and G |

#### Critical Configuration (YAML)

```yaml
# ingestion_config.yaml
chunking:
  strategy: "semantic"  # vs "fixed"
  max_tokens: 512
  overlap_tokens: 50  # Validated in paper's context preservation analysis
  
extraction:
  llm_model: "gpt-4o-mini"
  batch_size: 10
  confidence_threshold: 0.7  # Filter low-confidence extractions
  entity_types: ["Person", "Organization", "Location", "Concept", "Product"]
  relation_validation: true  # Cross-check with corpus
  
graph:
  neo4j_uri: "neo4j+s://cluster.example.com"
  database: "kg_prod"
  constraints:
    - "CREATE CONSTRAINT entity_id FOR (e:Entity) REQUIRE e.id IS UNIQUE"
    - "CREATE CONSTRAINT chunk_id FOR (c:Chunk) REQUIRE c.id IS UNIQUE"
  indexes:
    - "CREATE FULLTEXT INDEX entity_search FOR (e:Entity) ON EACH [e.name, e.description, e.aliases]"
  relationships:
    - "(:Entity)-[:SOURCE_CHUNK]->(:Chunk)"  # Graph→Text channel
    - "(:Chunk)-[:CONTAINS_ENTITY]->(:Entity)"  # Text→Graph channel
    - "(:Chunk)-[:MENTIONS {confidence: FLOAT}]->(:Entity)"  # Extraction metadata
```

### 2.2 TGS Orchestrator: Complete Bidirectional Workflow Engine

**Purpose**: Core inference-time component implementing TGS-RAG's **full** synergistic retrieval [[113]].

#### Algorithm Implementation: Complete Text-to-Graph Channel

```python
# orchestrator/text_to_graph.py
from typing import Set, List, Optional
from dataclasses import dataclass
import redis
import json

@dataclass
class VisitedPath:
    entity_id: str
    path_topology: List[str]  # Serialized Cypher path
    pruning_reason: str
    semantic_score: float
    base_score: float  # For path confirmation calculation

class TextToGraphChannel:
    """Implements COMPLETE Text-to-Graph channel: Path Confirmation + Orphan Bridging [[113]]"""
    
    def __init__(self, redis_client: redis.Redis, k_o: int = 3, epsilon: float = 0.1):
        self.redis = redis_client
        self.k_o = k_o  # Paper-specified: top 3 orphans bridged [[113]]
        self.epsilon = epsilon  # Paper-specified weight for path confirmation [[113]]
    
    def confirm_paths(self, graph_paths: List[VisitedPath], 
                     text_entities: Set[str]) -> List[VisitedPath]:
        """Path Confirmation: Score_conf(p) = Score_base(p) + ε·|E(p) ∩ E(C)| [[113]]"""
        confirmed = []
        for path in graph_paths:
            path_entities = set(extract_entities_from_path(path.path_topology))
            overlap = len(path_entities & text_entities)
            confirmed_score = path.base_score + self.epsilon * overlap
            if confirmed_score > path.base_score * 0.8:  # Retain paths with textual support
                confirmed.append(VisitedPath(
                    entity_id=path.entity_id,
                    path_topology=path.path_topology,
                    pruning_reason=path.pruning_reason,
                    semantic_score=confirmed_score,
                    base_score=path.base_score
                ))
        return confirmed
    
    def identify_orphans(self, text_entities: Set[str], graph_entities: Set[str]) -> Set[str]:
        """E_orphan = Entities(C_initial) \ Entities(P_initial) [[113]]"""
        return text_entities - graph_entities
    
    def resurrect_paths(self, orphan_entities: Set[str], query_id: str) -> List[VisitedPath]:
        """Memory-based Orphan Entity Bridging: Algorithm 2 [[113]]"""
        resurrected = []
        
        for entity in orphan_entities:
            cache_key = f"visited:{query_id}:entity:{entity}"
            path_data = self.redis.get(cache_key)
            
            if path_data:
                path = VisitedPath(**json.loads(path_data))
                resurrected.append(path)
                
                if len(resurrected) >= self.k_o:  # Paper-specified limit [[113]]
                    break
        
        return resurrected
    
    def enforce_application_lru(self, query_id: str, max_entries: int = 100):
        """Application-level LRU eviction: preserve highest-score entities [[97]][[100]]"""
        lru_key = f"visited:{query_id}:lru"
        # Get lowest-score entries beyond max_entries
        entries_to_evict = self.redis.zrangebyscore(
            lru_key, 0, float('inf'), start=0, num=max_entries
        )
        for entry_key in entries_to_evict:
            self.redis.delete(entry_key)
            self.redis.zrem(lru_key, entry_key)
```

#### Global Voting Re-ranking (Graph-to-Text Channel)

```python
# orchestrator/global_voting.py
class GlobalVotingScorer:
    """Graph-to-Text channel: re-rank text chunks using graph recommendations [[113]]"""
    
    def __init__(self, alpha: float = 0.5):  # Paper-specified α=0.5 [[113]]
        self.alpha = alpha
    
    def compute_recommendation_score(self, chunk_id: str, visited_entities: Set[str]) -> float:
        """Rec(c): count of visited entities that recommend this chunk [[113]]"""
        return len([e for e in visited_entities if e.source_chunk == chunk_id])
    
    def final_score(self, chunk: Chunk, query_vector: np.ndarray, 
                   visited_entities: Set[str]) -> float:
        """Eq. 2 from paper [[113]]: α·Norm(sim) + (1-α)·Norm(Rec)"""
        semantic_sim = cosine_similarity(query_vector, chunk.embedding)
        rec_score = self.compute_recommendation_score(chunk.id, visited_entities)
        
        # Normalize both scores to [0,1] range
        norm_sim = (semantic_sim + 1) / 2  # cosine sim [-1,1] → [0,1]
        norm_rec = min(rec_score / MAX_RECOMMENDATIONS, 1.0)
        
        return self.alpha * norm_sim + (1 - self.alpha) * norm_rec
```

#### Graph Sparsity Gate (Cold-Start Handling)

```python
# orchestrator/sparsity_gate.py
class GraphSparsityGate:
    """Proactive cold-start handling: detect sparse graphs before bidirectional workflow"""
    
    def __init__(self, graph_db: Neo4jClient, density_threshold: float = 0.1):
        self.graph_db = graph_db
        self.threshold = density_threshold
    
    def should_fallback_to_text(self, tenant_id: str, query_entities: List[str]) -> bool:
        """Return True if graph is too sparse for effective bidirectional retrieval"""
        if not query_entities:
            return True  # No entities → text-only
        
        # Calculate graph density for tenant
        total_entities = self.graph_db.count_entities(tenant_id)
        matched_entities = self.graph_db.count_matched_entities(tenant_id, query_entities)
        
        if total_entities == 0:
            return True  # Empty graph
        
        density = matched_entities / len(query_entities)
        return density < self.threshold
```

### 2.3 LLM Gateway Service

**Purpose**: Provider-agnostic abstraction for LLM inference with cost tracking [[86]][[89]].

#### Key Features

| Feature | Implementation | Business Value |
|---------|---------------|----------------|
| **Multi-Provider Routing** | Strategy pattern: OpenAI/vLLM/Ollama adapters | Avoid vendor lock-in; fallback on outage |
| **Token Budgeting** | Per-tenant/token-type quotas with circuit breakers [[134]] | Prevent cost overruns; enforce SLAs |
| **Prompt Versioning** | Git-backed template registry with A/B testing | Safe prompt iteration; rollback capability |
| **Streaming SSE** | FastAPI `StreamingResponse` with token-by-token yield | Low-latency UX; progressive rendering |
| **Prefix Caching Monitoring** | Track vLLM APC hit rate; disable if <20% [[109]] | Avoid overhead when benefit is minimal |

#### Cost Attribution Schema

```python
# llm_gateway/cost_tracker.py
@dataclass
class TokenUsage:
    tenant_id: str
    query_id: str
    model: str
    channel: Literal["text", "graph", "bridging", "fusion"]  # Per-channel tracking
    prompt_tokens: int
    completion_tokens: int
    total_cost_usd: float  # Calculated from provider pricing
    timestamp: datetime
    query_complexity: Literal["simple", "multi-hop", "adversarial"]  # For routing
    
    def to_metrics(self) -> Dict[str, float]:
        return {
            "rag_tokens_input_total": self.prompt_tokens,
            "rag_tokens_output_total": self.completion_tokens,
            "rag_cost_usd_total": self.total_cost_usd,
            "rag_channel_tokens": {self.channel: self.prompt_tokens + self.completion_tokens}
        }

class CostAttributionEngine:
    """Granular cost tracking with budget enforcement [[134]][[136]]"""
    
    def __init__(self, metrics_client: MetricsClient, budget_config: Dict[str, float]):
        self.metrics = metrics_client
        self.budgets = budget_config
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
    
    def record_and_enforce(self, usage: TokenUsage):
        # Record granular metrics
        self.metrics.record_batch(usage.to_metrics(), tags={
            "tenant_id": usage.tenant_id,
            "channel": usage.channel,
            "model": usage.model
        })
        
        # Check budget enforcement
        daily_cost = self._get_daily_cost(usage.tenant_id)
        budget = self.budgets.get(usage.tenant_id, float('inf'))
        
        if daily_cost > budget * 0.9:  # 90% threshold for warning
            self._send_budget_alert(usage.tenant_id, daily_cost, budget)
        
        if daily_cost >= budget:
            self.circuit_breakers.setdefault(usage.tenant_id, CircuitBreaker()).trip()
            raise BudgetExceededError(f"Tenant {usage.tenant_id} exceeded daily budget")
```

---

## 3. Data Models & Storage Strategy

### 3.1 Vector Database (Qdrant) Schema

```python
# schemas/vector_schema.py
from qdrant_client.http import models as qdrant

CHUNK_COLLECTION = qdrant.CollectionSchema(
    vectors=qdrant.VectorParams(
        size=1024,  # Qwen3-Embedding dimension [[113]]
        distance=qdrant.Distance.COSINE,
        on_disk=True,  # Cost optimization for large corpora [[22]]
        hnsw_config=qdrant.HnswConfigDiff(
            m=16,
            ef_construct=100,
            on_disk=True
        )
    ),
    optimizers_config=qdrant.OptimizersConfigDiff(
        default_segment_number=4,
        max_segment_size=10_000_000
    ),
    on_disk_payload=True  # Reduce RAM usage for large payloads
)

# Payload schema for chunk metadata
CHUNK_PAYLOAD_SCHEMA = {
    "tenant_id": {"type": "keyword", "index": True},  # Multi-tenancy isolation [[14]]
    "document_id": {"type": "keyword", "index": True},
    "chunk_index": {"type": "integer"},
    "entity_refs": {"type": "keyword[]", "index": True},  # Links to Neo4j entity IDs
    "source_uri": {"type": "text"},
    "ingested_at": {"type": "datetime"},
    "extraction_confidence": {"type": "float"}  # For filtering low-confidence chunks
}
```

### 3.2 Graph Database (Neo4j) Schema

```cypher
// schemas/graph_schema.cypher
// Core constraints (run once during setup)
CREATE CONSTRAINT entity_id IF NOT EXISTS 
  FOR (e:Entity) REQUIRE e.id IS UNIQUE;

CREATE CONSTRAINT chunk_id IF NOT EXISTS 
  FOR (c:Chunk) REQUIRE c.id IS UNIQUE;

// Full-text index for entity search
CREATE FULLTEXT INDEX entity_search IF NOT EXISTS 
  FOR (e:Entity) ON EACH [e.name, e.description, e.aliases];

// Core node labels
(:Entity {
  id: STRING,           // Canonical ID (e.g., "wikidata:Q42")
  name: STRING,         // Display name
  type: STRING,         // Entity type from extraction
  description: STRING,
  aliases: STRING[],    // For synonym matching
  embedding: FLOAT[],   // Qwen3-Embedding vector (1024-dim)
  tenant_id: STRING,    // Multi-tenancy isolation
  extraction_confidence: FLOAT  // From extraction pipeline
})

(:Chunk {
  id: STRING,
  content: STRING,
  source_uri: STRING,
  chunk_index: INTEGER,
  embedding: FLOAT[],
  tenant_id: STRING,
  ingested_at: DATETIME
})

(:Document {
  id: STRING,
  uri: STRING,
  title: STRING,
  tenant_id: STRING,
  ingested_at: DATETIME
})

// Core relationship types (BIDIRECTIONAL MODELING)
(:Chunk)-[:MENTIONS {confidence: FLOAT}]->(:Entity)  // Extraction metadata
(:Entity)-[:SOURCE_CHUNK]->(:Chunk)  // Graph→Text channel: O(1) traversal [[121]]
(:Chunk)-[:CONTAINS_ENTITY]->(:Entity)  // Text→Graph channel: O(1) traversal [[121]]
(:Entity)-[:RELATES_TO {type: STRING, weight: FLOAT, confidence: FLOAT}]->(:Entity)
(:Chunk)-[:DERIVED_FROM]->(:Document)

// Indexes for performance
CREATE INDEX entity_tenant IF NOT EXISTS FOR (e:Entity) ON (e.tenant_id);
CREATE INDEX chunk_tenant IF NOT EXISTS FOR (c:Chunk) ON (c.tenant_id);
```

### 3.3 Redis Cache Strategy for Visited Memory (Application-Level LRU)

```python
# caching/visited_memory.py
class VisitedMemoryCache:
    """Implements deferred reasoning buffer with APPLICATION-LEVEL LRU eviction [[97]][[100]]"""
    
    def __init__(self, redis: redis.Redis, ttl_seconds: int = 3600, 
                 max_entries_per_query: int = 100):
        self.redis = redis
        self.ttl = ttl_seconds
        self.max_entries = max_entries_per_query
    
    def store_pruned_path(self, query_id: str, entity_id: str, 
                         path_topology: List[str], semantic_score: float,
                         base_score: float):
        """Cache pruned nodes for potential resurrection with application-level LRU"""
        key = f"visited:{query_id}:entity:{entity_id}"
        lru_key = f"visited:{query_id}:lru"
        
        value = json.dumps({
            "entity_id": entity_id,
            "path_topology": path_topology,
            "semantic_score": semantic_score,
            "base_score": base_score,  # For path confirmation calculation
            "timestamp": time.time()
        })
        
        # Store with TTL
        self.redis.setex(key, self.ttl, value)
        
        # Add to sorted set for application-level LRU (score = semantic_score)
        self.redis.zadd(lru_key, {key: semantic_score})
        self.redis.expire(lru_key, self.ttl)  # Match TTL of individual entries
        
        # Enforce application-level LRU: evict lowest-score entries beyond max_entries
        self._enforce_lru(lru_key)
    
    def _enforce_lru(self, lru_key: str):
        """Proactively evict lowest-score entries before Redis server eviction"""
        current_count = self.redis.zcard(lru_key)
        if current_count > self.max_entries:
            # Get keys with lowest scores to evict
            keys_to_evict = self.redis.zrangebyscore(
                lru_key, 0, float('inf'), 
                start=0, num=current_count - self.max_entries
            )
            for key in keys_to_evict:
                self.redis.delete(key)
                self.redis.zrem(lru_key, key)
    
    def get_pruned_path(self, query_id: str, entity_id: str) -> Optional[Dict]:
        """Zero-overhead retrieval: replay stored path without DB query"""
        key = f"visited:{query_id}:entity:{entity_id}"
        data = self.redis.get(key)
        return json.loads(data) if data else None
    
    def get_top_orphans(self, query_id: str, k: int = 3) -> List[Dict]:
        """Get top-k highest-score orphan entities for bridging (k_o parameter) [[113]]"""
        lru_key = f"visited:{query_id}:lru"
        # Get top-k by semantic_score (descending)
        top_keys = self.redis.zrevrange(lru_key, 0, k-1, withscores=True)
        
        results = []
        for key, score in top_keys:
            data = self.redis.get(key.decode() if isinstance(key, bytes) else key)
            if data:
                results.append(json.loads(data))
        return results
```

---

## 4. Enterprise Non-Functional Requirements

### 4.1 Multi-Tenancy & Data Isolation

**Requirement**: Strict logical isolation between tenants with shared infrastructure [[58]][[104]].

#### Implementation Strategy

| Layer | Isolation Mechanism | Validation Method |
|-------|-------------------|------------------|
| **API Gateway** | JWT claims + tenant_id in all requests; OIDC/SAML integration | Integration tests with cross-tenant query attempts |
| **Vector DB** | Payload filtering with mandatory `tenant_id` clause [[14]] | Qdrant filter queries: `must={"tenant_id": "X"}`; audit logs |
| **Graph DB** | Tenant prefix on node IDs + Cypher WHERE clause + Neo4j RBAC [[11]] | Neo4j query audit logs; penetration testing |
| **Object Store** | Prefix isolation: `s3://bucket/{tenant_id}/...` | S3 bucket policies; access log analysis |
| **Cache** | Key prefixing: `tenant:{id}:...` + application-level LRU per tenant | Redis key scan tests; memory isolation metrics |

#### Sample Multi-Tenant Query Pattern

```python
# services/query_service.py
def execute_tenant_scoped_query(tenant_id: str, query: str) -> Response:
    # 1. Validate tenant access
    if not auth.has_tenant_access(tenant_id):
        raise PermissionError(f"Tenant {tenant_id} not authorized")
    
    # 2. Check budget circuit breaker
    if cost_engine.is_circuit_open(tenant_id):
        raise BudgetExceededError(f"Tenant {tenant_id} budget exceeded")
    
    # 3. Graph sparsity gate (proactive cold-start handling)
    if sparsity_gate.should_fallback_to_text(tenant_id, extract_entities(query)):
        logger.info(f"Graph sparse for tenant {tenant_id}; falling back to text-only")
        return await text_only_retrieval(query, tenant_id)
    
    # 4. Scope all downstream calls
    vector_results = await vector_db.search(
        collection="chunks",  # Single collection with payload filtering
        query_vector=await embed_query(query),
        filter=qdrant.Filter(must=[
            FieldCondition(key="tenant_id", match=MatchValue(value=tenant_id))
        ])
    )
    
    graph_results = await graph_db.run_cypher(
        """
        MATCH (e:Entity {tenant_id: $tenant})-[r]-(n)
        WHERE e.name CONTAINS $query OR e.aliases CONTAINS $query
        RETURN e, r, n LIMIT 50
        """,
        params={"tenant": tenant_id, "query": query}
    )
    
    # 5. Continue with TGS-RAG bidirectional orchestration...
    return await orchestrator.execute_bidirectional(
        query=query,
        tenant_id=tenant_id,
        text_results=vector_results,
        graph_results=graph_results
    )
```

### 4.2 Observability & Monitoring

**Requirement**: Full distributed tracing across retrieval pipeline with per-tenant metrics [[69]][[74]].

#### OpenTelemetry Instrumentation Strategy

```python
# observability/tracing.py
from opentelemetry import trace, metrics

tracer = trace.get_tracer("tgs-rag.orchestrator")
meter = metrics.get_meter("tgs-rag.metrics")

# Custom metrics for TGS-RAG specific operations
retrieval_counter = meter.create_counter(
    "rag.retrieval.documents",
    description="Number of documents retrieved per channel"
)

bridging_timer = meter.create_histogram(
    "rag.bridging.latency_ms",
    description="Latency of orphan entity bridging operation"
)

path_confirmation_counter = meter.create_counter(
    "rag.path_confirmation.validated",
    description="Number of graph paths validated against text evidence"
)

@tracer.start_as_current_span("tgs.orchestrator.execute")
async def execute_bidirectional_retrieval(query: str, tenant_id: str):
    # Graph Sparsity Gate
    with tracer.start_as_current_span("tgs.sparsity_gate.check"):
        if sparsity_gate.should_fallback_to_text(tenant_id, entities):
            span.set_attribute("fallback_reason", "graph_sparse")
            return await text_only_fallback(query, tenant_id)
    
    # Parallel Retrieval
    with tracer.start_as_current_span("tgs.retrieval.parallel"):
        text_future = asyncio.create_task(text_retrieval.search(query, tenant_id))
        graph_future = asyncio.create_task(graph_retrieval.search(query, tenant_id))
        text_results, graph_results = await asyncio.gather(text_future, graph_future)
        
        retrieval_counter.add(len(text_results), attributes={"channel": "text", "tenant": tenant_id})
        retrieval_counter.add(len(graph_results), attributes={"channel": "graph", "tenant": tenant_id})
    
    # Graph-to-Text: Global Voting
    with tracer.start_as_current_span("tgs.channel.graph_to_text"):
        re_ranked = voting.re_rank(text_results, graph_results.visited_entities)
    
    # Text-to-Graph: Path Confirmation + Orphan Bridging
    with tracer.start_as_current_span("tgs.channel.text_to_graph"):
        # Path Confirmation
        start_confirm = time.time()
        confirmed_paths = text_graph.confirm_paths(graph_results.paths, text_results.entities)
        path_confirmation_counter.add(len(confirmed_paths), attributes={"tenant": tenant_id})
        
        # Orphan Bridging
        start_bridging = time.time()
        orphan_entities = text_graph.identify_orphans(text_results.entities, graph_results.entities)
        resurrected = text_graph.resurrect_paths(orphan_entities, query_id)
        bridging_timer.record((time.time() - start_bridging) * 1000, attributes={
            "orphan_count": len(orphan_entities),
            "resurrected_count": len(resurrected),
            "tenant": tenant_id
        })
    
    # Context Fusion & Generation
    with tracer.start_as_current_span("tgs.generation"):
        context = fusion.assemble(re_ranked, confirmed_paths, resurrected)
        return await llm_gateway.generate(query, context, tenant_id)
```

#### Grafana Dashboard Panels (Key Metrics)

| Panel | Metric Query | Alert Threshold | Purpose |
|-------|-------------|-----------------|---------|
| Query Success Rate | `sum(rate(rag_queries_total{status="success"}[5m])) / sum(rate(rag_queries_total[5m]))` | <99.5% for 5m | Overall system health |
| P95 Orphan Bridging Latency | `histogram_quantile(0.95, rate(rag_bridging_latency_ms_bucket[5m]))` | >500ms for 10m | Bridging performance SLO |
| Path Confirmation Rate | `rate(rag_path_confirmation_validated_total[5m]) / rate(rag_path_confirmation_checked_total[5m])` | <10% may indicate extraction issues | Text-to-Graph verification effectiveness |
| Token Cost per Tenant | `sum(rag_cost_usd_total) by (tenant_id)` | >$X/day per tenant | Budget enforcement |
| Bridging Recall Rate | `rate(rag_bridging_resurrected_total[5m]) / rate(rag_bridging_checked_total[5m])` | Target: ≥15% | Orphan bridging effectiveness |
| Cache Hit Rate (Visited Memory) | `rate(redis_hits_total{key=~"visited:.*"}[5m]) / (rate(redis_hits_total[5m]) + rate(redis_misses_total[5m]))` | <40% for 15m | Memory efficiency |
| vLLM Prefix Cache Hit Rate | `vllm:prefix_cache_hit_rate` (custom metric) | <20% → consider disabling | Prefix caching ROI |

### 4.3 Security & Compliance

**Requirement**: End-to-end data protection with audit trails for regulated industries [[95]][[98]].

#### Security Control Matrix

| Control | Implementation | Compliance Mapping |
|---------|---------------|-------------------|
| **Data Encryption** | TLS 1.3 in transit; AES-256 at rest (Qdrant/Neo4j config) | GDPR Art. 32, HIPAA §164.312 |
| **Access Control** | RBAC with tenant-scoped roles; JWT validation at gateway; Neo4j RBAC | SOC 2 CC6.1, ISO 27001 A.9 |
| **Audit Logging** | Structured JSON logs to immutable store; query provenance tracking; Redis command logging | GDPR Art. 30, FINRA 4511 |
| **PII Redaction** | Pre-ingestion NER + masking; configurable redaction rules; audit trail of redactions | CCPA §1798.100, HIPAA §164.514 |
| **Secrets Management** | HashiCorp Vault integration; no secrets in code/env vars; automatic rotation | PCI-DSS Req 3.4, NIST 800-53 SC-28 |
| **Query Injection Prevention** | Parameterized Cypher queries; input validation; rate limiting | OWASP A1:2021, SOC 2 CC7.2 |

#### Sample PII Redaction Pipeline

```python
# ingestion/redaction.py
class PIIRedactor:
    """Pre-ingestion PII masking for compliance [[100]]"""
    
    def __init__(self, entity_types_to_redact: List[str] = ["PERSON", "EMAIL", "PHONE", "SSN"]):
        self.nlp = spacy.load("en_core_web_lg")
        self.redact_types = set(entity_types_to_redact)
    
    def redact_chunk(self, text: str, tenant_id: str) -> Tuple[str, Dict]:
        """Return redacted text + metadata for audit trail"""
        doc = self.nlp(text)
        redacted = text
        redactions = []
        
        for ent in doc.ents:
            if ent.label_ in self.redact_types:
                # Replace with tokenized placeholder (reversible with audit key)
                placeholder = f"[REDACTED_{ent.label_}_{hash(ent.text + tenant_id) % 10000}]"
                redacted = redacted.replace(ent.text, placeholder)
                redactions.append({
                    "original_hash": hash(ent.text + tenant_id),  # For audit reversal
                    "entity_type": ent.label_,
                    "position": (ent.start_char, ent.end_char),
                    "redacted_value": placeholder
                })
        
        return redacted, {
            "redactions": redactions,
            "redaction_count": len(redactions),
            "tenant_id": tenant_id,
            "timestamp": datetime.utcnow().isoformat()
        }
```

---

## 5. Technology Stack Recommendations

| Component | Recommended Technology | Justification | Production Considerations |
|-----------|----------------------|---------------|---------------------------|
| **API Framework** | FastAPI [[49]][[51]] | Async-native, auto OpenAPI docs, dependency injection, SSE support | Use `uvicorn[standard]` with workers = CPU cores * 2 + 1; enable HTTP/2 |
| **Query Orchestrator** | Async Python (`asyncio`) | Minimal latency; no network hops between bidirectional steps | Use `async with` for resource management; structured error handling |
| **Ingestion Workflow** | Temporal.io [[39]][[44]] | Durable execution, retry logic, progress tracking for long-running ingestion | Deploy Temporal cluster separately; use activity timeouts |
| **Vector Database** | Qdrant [[20]][[22]] | Rust-based performance; disk-optimized HNSW for cost scaling; excellent filtering | Enable `on_disk_payload=True`; monitor RAM for HNSW index; use collection-per-tenant or payload filtering |
| **Graph Database** | Neo4j Enterprise [[12]][[13]] | Mature clustering; official GraphRAG Python package; causal clustering; bidirectional relationship support | Use read replicas for retrieval; primary for ingestion; enable query logging for audit |
| **Cache Layer** | Redis Cluster [[77]][[80]] | Sorted sets for LRU; sub-ms latency; application-level eviction control | Configure `maxmemory-policy allkeys-lru` + application-level LRU; monitor eviction rate |
| **LLM Serving** | vLLM + OpenAI-compatible API [[86]][[89]] | Continuous batching; PagedAttention; 2-4x throughput vs naive serving | Enable `--enable-prefix-caching`; monitor hit rate; disable if <20% |
| **Embedding Model** | Qwen3-Embedding-0.6B [[113]] | MTEB score 64.33; Apache 2.0 license; 1024-dim with MRL; paper-specified | Fine-tune on domain data if needed; cache embeddings for repeated chunks |
| **Observability** | OpenTelemetry + Grafana [[69]][[74]] | Vendor-neutral tracing; unified metrics/logs/traces; custom spans for TGS-RAG concepts | Sample traces at 10% for cost control; use exemplars for correlation |
| **Infrastructure** | Kubernetes + Helm [[58]][[64]] | Declarative deployments; horizontal pod autoscaling; resource isolation | Use resource requests/limits; enable cluster autoscaler; implement pod disruption budgets |
| **Secrets Management** | HashiCorp Vault | Dynamic secrets; automatic rotation; audit logging | Integrate with Kubernetes via Vault Agent Injector; use short-lived tokens |

---

## 6. Implementation Roadmap (Phased Delivery)

### Phase 1: Foundation MVP (Weeks 1-6)
**Goal**: Single-tenant, functional TGS-RAG pipeline with core bidirectional logic

| Milestone | Deliverables | Success Criteria | Paper Alignment |
|-----------|-------------|-----------------|----------------|
| **M1.1: Project Scaffolding** | Monorepo with FastAPI template; CI/CD pipeline; Dockerfiles; OpenTelemetry setup | `make test` passes; PR checks enforce type safety; traces visible in Grafana | N/A |
| **M1.2: Ingestion Pipeline** | Document parser + entity extractor (GPT-4o-mini) + Neo4j builder with bidirectional relationships [[121]] | Process 1K docs with <5% extraction error rate; bidirectional `SOURCE_CHUNK`/`CONTAINS_ENTITY` relationships created | Supports paper's bidirectional mapping M |
| **M1.3: Basic Retrieval** | Text search (Qdrant with payload filtering) + graph traversal (Neo4j with tenant scoping) | P95 latency <500ms for single-channel queries; tenant isolation validated | Foundation for bidirectional channels |
| **M1.4: Orchestrator Skeleton** | Async in-process workflow with stubbed Global Voting + Path Confirmation + Orphan Bridging | End-to-end query returns response; logs show all three Text-to-Graph mechanisms executed | Implements paper's complete Text-to-Graph channel |

### Phase 2: TGS-RAG Core Algorithms (Weeks 7-12)
**Goal**: Implement validated TGS-RAG algorithms with performance benchmarks

| Milestone | Deliverables | Success Criteria | Paper Alignment |
|-----------|-------------|-----------------|----------------|
| **M2.1: Global Voting** | Graph-to-Text re-ranking with α=0.5 weighted fusion [[113]] | Improve Strict Hit Rate by ≥15% vs text-only on MuSiQue test set | Eq. 2 implementation |
| **M2.2: Path Confirmation** | Text-to-Graph path validation: `Score_conf = Score_base + ε·overlap` [[113]] | Reduce hallucinated graph paths by ≥20% vs bridging-only | Section 3.3.2, Eq. 3 |
| **M2.3: Orphan Bridging** | Redis-backed Visited Memory with application-level LRU; k_o=3 [[113]] | Achieve zero additional DB queries for resurrected paths; bridging recall ≥15% | Algorithm 2 implementation |
| **M2.4: Graph Sparsity Gate** | Proactive cold-start handling with density threshold | Predictable P95 latency regardless of graph maturity; fallback to text-only when appropriate | Addresses paper's assumption of sufficient graph coverage |
| **M2.5: Efficiency Validation** | Token usage tracking + cost comparison vs GraphRAG baselines | Demonstrate ≥63% token reduction on MuSiQue, ≥66% on HotpotQA [[113]] | Section 4.4 validation |

### Phase 3: Enterprise Hardening (Weeks 13-20)
**Goal**: Multi-tenancy, security, observability, and production readiness

| Milestone | Deliverables | Success Criteria | Compliance Mapping |
|-----------|-------------|-----------------|-------------------|
| **M3.1: Multi-Tenancy** | Tenant-scoped queries; RBAC; JWT auth; Vault integration [[95]][[104]] | Cross-tenant data access blocked in penetration test; audit logs show tenant isolation | SOC 2 CC6.1, GDPR Art. 32 |
| **M3.2: Observability** | OpenTelemetry instrumentation; Grafana dashboards with TGS-RAG custom metrics [[69]] | Trace any query end-to-end; alert on SLO breaches; bridging latency visible | Internal SLO monitoring |
| **M3.3: Cost Controls** | Granular cost attribution; token budgeting; circuit breakers; model routing [[134]][[136]] | Prevent cost overruns via circuit breakers; cache hit rate >40%; prefix cache hit rate monitored | FinOps best practices |
| **M3.4: Production Deployment** | Helm charts; IaC (Terraform); runbooks; disaster recovery plan | Zero-downtime deployment; <5min recovery from pod failure; documented rollback procedure | ITIL change management |

### Phase 4: Optimization & Scale (Weeks 21-24)
**Goal**: Performance tuning, advanced features, and documentation

| Milestone | Deliverables | Success Criteria | Business Value |
|-----------|-------------|-----------------|---------------|
| **M4.1: Performance Tuning** | Query optimization; index tuning; caching strategies; async batching [[22]][[26]] | P95 latency <2.5s at 100 RPS; 99.9% availability; token efficiency ≥63% | User experience + cost savings |
| **M4.2: Advanced Features** | Query expansion; fallback modes; evaluation harness; A/B testing framework [[105]][[106]] | Graceful degradation to text-only when graph sparse; continuous evaluation against golden dataset | Reliability + continuous improvement |
| **M4.3: Documentation & Training** | API docs; runbooks; architecture decision records; onboarding guide | Onboard new engineer in <1 day; zero critical knowledge gaps; ADRs for key decisions | Team velocity + knowledge retention |

---

## 7. Risk Mitigation & Critical Success Factors

### High-Risk Areas & Mitigation Strategies

| Risk | Impact | Mitigation Strategy | Owner | Paper/Source |
|------|--------|-------------------|-------|-------------|
| **Entity Extraction Quality** | Poor KG → broken reasoning paths | Golden dataset evaluation loop; fallback to text-only mode; confidence threshold ≥0.7 | Data Engineering | Paper Appendix A.1 [[113]] |
| **Application-Level LRU Implementation** | Redis server eviction discards high-value orphans | Implement `_enforce_lru()` method; monitor eviction decisions; alert on high eviction rate | Platform Engineering | Redis docs [[97]][[100]] |
| **Incomplete Text-to-Graph Verification** | Factually inconsistent graph paths surface | Implement BOTH Path Confirmation AND Orphan Bridging; cross-reference paths with text evidence | ML Engineering | Paper Section 3.3.2 [[113]] |
| **Cold Start / Graph Sparsity** | Unpredictable latency for new tenants | Proactive Graph Sparsity Gate; fallback to text-only; monitor graph density metrics | Product Engineering | Derived from paper assumptions |
| **vLLM Prefix Caching Overhead** | Minimal benefit for variable RAG context | Monitor hit rate; disable if <20%; prioritize caching for system prompts only | Platform Engineering | vLLM docs [[109]] |
| **Cost Overruns** | Unbounded token usage → budget breach | Per-tenant quotas; real-time cost alerts; auto-throttling; model routing by complexity | FinOps | Cost attribution framework |

### Critical Success Factors (CSFs)

1. **Complete Bidirectional Synergy**: Achieve ≥15% improvement in Strict Hit Rate vs unidirectional baselines on MuSiQue by implementing BOTH Path Confirmation AND Orphan Bridging [[113]]
2. **Token Efficiency**: Maintain ≥63% reduction in LLM tokens vs GraphRAG while preserving accuracy (paper-specified target) [[113]]
3. **Multi-Tenant Isolation**: Zero cross-tenant data leakage in security audit; all queries scoped by `tenant_id` [[95]][[104]]
4. **Observability Coverage**: 100% of critical paths traced with TGS-RAG-specific spans; <5min mean time to detect incidents [[69]][[74]]
5. **Application-Level Cache Precision**: Visited Memory preserves top-k orphan entities by semantic score under memory pressure [[97]][[100]]
6. **Developer Experience**: New feature PR → production in <2 hours via CI/CD; ADRs document key architectural decisions [[49]][[51]]

---

## 8. Cost Optimization & Monitoring Strategy

### Token Cost Attribution Framework (Enhanced)

```python
# cost/attribution.py
class CostAttributionEngine:
    """Track and allocate LLM costs per tenant/query/channel/component [[134]][[136]]"""
    
    def record_usage(self, usage: TokenUsage):
        # Primary metrics for cost dashboards
        self.metrics.record_batch(
            name="rag.token.usage",
            value=usage.total_tokens,
            tags={
                "tenant_id": usage.tenant_id,
                "model": usage.model,
                "channel": usage.channel,  # text/graph/bridging/fusion
                "query_type": usage.query_complexity,
                "paper_aligned": "true"  # Track paper-specified parameters
            }
        )
        
        # Budget enforcement with circuit breakers
        budget = self.budgets.get(usage.tenant_id)
        if budget and usage.cumulative_cost > budget.limit * 0.9:
            self.alerts.send_warning(f"Tenant {usage.tenant_id} at 90% budget")
        
        if budget and usage.cumulative_cost >= budget.limit:
            self.circuit_breaker.trip(usage.tenant_id)
            self.alerts.send_critical(f"Tenant {usage.tenant_id} exceeded budget")
            raise BudgetExceededError(f"Tenant {usage.tenant_id} budget exceeded")
    
    def get_cost_breakdown(self, tenant_id: str, period: str = "24h") -> Dict[str, float]:
        """Granular cost breakdown by channel for optimization decisions"""
        return {
            "text_channel": self.metrics.query("rag_tokens_total{tenant_id=~'" + tenant_id + "', channel='text'}[" + period + "]"),
            "graph_channel": self.metrics.query("rag_tokens_total{tenant_id=~'" + tenant_id + "', channel='graph'}[" + period + "]"),
            "bridging_channel": self.metrics.query("rag_tokens_total{tenant_id=~'" + tenant_id + "', channel='bridging'}[" + period + "]"),
            "fusion_channel": self.metrics.query("rag_tokens_total{tenant_id=~'" + tenant_id + "', channel='fusion'}[" + period + "]"),
        }
```

### Production Cost Optimization Levers

| Lever | Implementation | Expected Savings | Paper Alignment |
|-------|---------------|-----------------|----------------|
| **Embedding Caching** | Cache query embeddings in Redis; reuse for similar queries [[77]] | 30-50% reduction in embedding API calls | Supports paper's efficiency claims |
| **Prompt Compression** | Use LLM to summarize retrieved context before generation [[90]] | 20-40% reduction in completion tokens | Tradeoff: may reduce answer quality |
| **Selective Bridging** | Only resurrect top-k_o=3 orphan entities by semantic score [[113]] | 15-25% reduction in graph traversal overhead | Paper-specified parameter |
| **Model Routing** | Route simple queries to smaller/cheaper models; complex to frontier | 40-60% blended cost reduction [[89]] | Requires accurate query complexity classification |
| **Batch Ingestion** | Process documents in large batches; reuse LLM sessions | 20-30% reduction in ingestion costs | Offline pipeline optimization |
| **Prefix Caching Monitoring** | Disable vLLM APC if hit rate <20% [[109]] | Avoid overhead when benefit is minimal | Context-dependent optimization |

### Monitoring Dashboard: Cost & Efficiency (Grafana YAML)

```yaml
# monitoring/cost_dashboard.yaml
dashboard:
  title: "TGS-RAG Cost & Efficiency"
  panels:
    - title: "Token Usage by Channel"
      query: |
        sum(rate(rag_token_usage_total{channel=~"text|graph|bridging|fusion"}[5m])) by (channel, tenant_id)
      visualization: stacked_area
      description: "Track per-channel token consumption for optimization"
    
    - title: "Cost per Query (USD)"
      query: |
        sum(rate(rag_cost_usd_total[5m])) by (tenant_id) 
        / sum(rate(rag_queries_total[5m])) by (tenant_id)
      alert: >0.05 for 10m
      description: "Alert if cost per query exceeds threshold"
    
    - title: "Bridging Efficiency"
      query: |
        rate(rag_bridging_resurrected_total[5m]) 
        / rate(rag_bridging_checked_total[5m])
      annotation: "Target: ≥15% resurrection rate (paper-specified k_o=3)"
      description: "Measure orphan bridging effectiveness"
    
    - title: "Path Confirmation Rate"
      query: |
        rate(rag_path_confirmation_validated_total[5m])
        / rate(rag_path_confirmation_checked_total[5m])
      annotation: "Target: ≥20% validation rate indicates effective Text-to-Graph verification"
      description: "Track Text-to-Graph verification completeness"
    
    - title: "Cache Hit Rate (Visited Memory)"
      query: |
        rate(redis_hits_total{key=~"visited:.*"}[5m]) 
        / (rate(redis_hits_total{key=~"visited:.*"}[5m]) + rate(redis_misses_total{key=~"visited:.*"}[5m]))
      alert: <0.4 for 15m
      description: "Monitor application-level LRU effectiveness"
    
    - title: "vLLM Prefix Cache Hit Rate"
      query: |
        vllm_prefix_cache_hit_rate{model=~".*"}
      annotation: "Disable APC if <20% for 30m"
      description: "Monitor prefix caching ROI for RAG workloads"
```

---

## Appendix A: Reference Implementation Snippets

### A.1 TGS-RAG Orchestrator Entry Point (Complete)

```python
# orchestrator/main.py
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from .services import TGSOrchestrator, VisitedMemoryCache, GraphSparsityGate
from .models import QueryRequest, QueryResponse
from .observability import tracer, meter
from .cost import CostAttributionEngine

app = FastAPI(title="TGS-RAG Orchestrator", version="2.0.0", docs_url="/docs")

# Initialize paper-specified parameters
orchestrator = TGSOrchestrator(
    vector_client=qdrant_client,
    graph_client=neo4j_client,
    llm_gateway=llm_gateway,
    visited_cache=VisitedMemoryCache(
        redis_client=redis_client,
        ttl_seconds=3600,
        max_entries_per_query=100
    ),
    text_to_graph=TextToGraphChannel(
        redis_client=redis_client,
        k_o=3,  # Paper-specified [[113]]
        epsilon=0.1  # Paper-specified [[113]]
    ),
    global_voting=GlobalVotingScorer(alpha=0.5),  # Paper-specified α=0.5 [[113]]
    sparsity_gate=GraphSparsityGate(graph_db=neo4j_client, density_threshold=0.1),
    config=load_config()  # Includes K=20, d=3 from Appendix C.1 [[113]]
)

cost_engine = CostAttributionEngine(
    metrics_client=prometheus_client,
    budget_config=load_budget_config()
)

@app.post("/v1/query", response_model=QueryResponse)
@tracer.start_as_current_span("api.query")
async def execute_query(
    request: QueryRequest,
    tenant_id: str = Depends(get_tenant_from_jwt),
    background_tasks: BackgroundTasks = None
):
    current_span = trace.get_current_span()
    current_span.set_attribute("tenant_id", tenant_id)
    current_span.set_attribute("query_complexity", request.complexity)
    
    try:
        # Check budget circuit breaker
        if cost_engine.is_circuit_open(tenant_id):
            raise HTTPException(status_code=429, detail="Budget exceeded")
        
        # Execute complete bidirectional TGS-RAG retrieval
        with tracer.start_as_current_span("tgs.orchestrator.execute"):
            response = await orchestrator.execute(
                query=request.query,
                tenant_id=tenant_id,
                max_tokens=request.max_tokens,
                complexity=request.complexity
            )
        
        # Record cost attribution
        background_tasks.add_task(
            cost_engine.record_usage,
            TokenUsage(
                tenant_id=tenant_id,
                query_id=response.query_id,
                model=response.model,
                channel="fusion",
                prompt_tokens=response.prompt_tokens,
                completion_tokens=response.completion_tokens,
                total_cost_usd=response.estimated_cost,
                timestamp=datetime.utcnow(),
                query_complexity=request.complexity
            )
        )
        
        return response
        
    except OrphanBridgingError as e:
        # Fallback to text-only if bridging fails
        logger.warning(f"Bridging failed: {e}; falling back to text retrieval")
        current_span.set_attribute("fallback_reason", "bridging_error")
        return await orchestrator.text_only_fallback(request, tenant_id)
        
    except GraphSparsityError as e:
        # Proactive fallback for sparse graphs
        logger.info(f"Graph sparse: {e}; using text-only retrieval")
        current_span.set_attribute("fallback_reason", "graph_sparse")
        return await orchestrator.text_only_fallback(request, tenant_id)
        
    except BudgetExceededError as e:
        logger.warning(f"Budget exceeded for tenant {tenant_id}: {e}")
        raise HTTPException(status_code=429, detail=str(e))
        
    except Exception as e:
        logger.exception("Query execution failed")
        current_span.record_exception(e)
        current_span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
        raise HTTPException(status_code=500, detail="Internal server error")
```

### A.2 Semantic Beam Search with Visited Memory (Paper-Aligned)

```python
# retrieval/graph_search.py
class SemanticBeamSearch:
    """Implements paper-specified beam search with visited memory caching [[113]]"""
    
    def __init__(self, graph_db: Neo4jGraph, beam_width: int = 20,  # Paper: K=20 [[113]]
                 depth: int = 3,  # Paper: d=3 [[113]]
                 visited_cache: VisitedMemoryCache):
        self.graph = graph_db
        self.beam_width = beam_width  # Paper-specified K [[113]]
        self.max_depth = depth  # Paper-specified d [[113]]
        self.visited_cache = visited_cache
    
    async def search(self, seed_entities: List[str], query_vector: np.ndarray,
                    query_id: str, tenant_id: str) -> Tuple[List[Path], Set[Entity]]:
        """Return selected paths + all visited entities (including pruned) [[113]]"""
        active_paths = [Path([e]) for e in seed_entities]
        all_visited = set(seed_entities)  # E_visited [[113]]
        
        for hop in range(self.max_depth):  # Paper: depth d=3 [[113]]
            # Expand all active paths
            candidates = []
            for path in active_paths:
                neighbors = await self._get_neighbors(path.last_entity, tenant_id)
                for neighbor in neighbors:
                    # Score by semantic similarity to query
                    score = cosine_similarity(neighbor.embedding, query_vector)
                    candidates.append((path.extend(neighbor), score))
            
            # Beam selection: keep top-K paths (Paper: K=20) [[113]]
            candidates.sort(key=lambda x: x[1], reverse=True)
            active_paths = [path for path, _ in candidates[:self.beam_width]]
            
            # Cache pruned entities for potential resurrection (Algorithm 2) [[113]]
            pruned = [(path, score) for path, score in candidates[self.beam_width:]]
            
            for path, score in pruned:
                entity = path.last_entity
                if entity not in [p.last_entity for p in active_paths]:
                    # Store in visited memory for zero-overhead bridging
                    await self.visited_cache.store_pruned_path(
                        query_id, entity.id, 
                        path_topology=path.serialize(),
                        semantic_score=score,
                        base_score=score  # For path confirmation calculation
                    )
                all_visited.add(entity)
            
            # Enforce application-level LRU to preserve high-value entries
            self.visited_cache.enforce_application_lru(query_id)
        
        return active_paths, all_visited
```

---

## Appendix B: Evaluation & Testing Strategy

### B.1 Golden Dataset Requirements

```python
# evaluation/golden_dataset.py
@dataclass
class GoldenQuery:
    query: str
    expected_answer: str
    supporting_documents: Set[str]  # For provenance mapping [[113]]
    required_entities: Set[str]  # For graph path validation
    required_paths: List[List[str]]  # For path confirmation validation
    difficulty: Literal["single-hop", "multi-hop", "adversarial"]
    tenant_id: str  # For multi-tenant testing

class TGSRAEvaluator:
    """Comprehensive evaluation harness for complete TGS-RAG components"""
    
    def evaluate_retrieval(self, golden_queries: List[GoldenQuery]) -> Dict[str, float]:
        metrics = {
            "strict_hit_rate": [],  # % queries with all supporting docs retrieved
            "support_f1": [],       # Precision/recall of retrieved evidence
            "bridging_recall": [],  # % orphan entities successfully resurrected
            "path_confirmation_rate": [],  # % graph paths validated against text
            "token_efficiency": []  # Token reduction vs GraphRAG baseline
        }
        
        for query in golden_queries:
            result = self.orchestrator.execute(query.query, query.tenant_id)
            
            # Strict Hit Rate: all supporting docs in retrieved set [[113]]
            retrieved_docs = self._map_retrieval_to_documents(result)
            hit = query.supporting_documents.issubset(retrieved_docs)
            metrics["strict_hit_rate"].append(1.0 if hit else 0.0)
            
            # Support F1: quality of retrieved evidence
            precision = len(retrieved_docs & query.supporting_documents) / max(len(retrieved_docs), 1)
            recall = len(retrieved_docs & query.supporting_documents) / max(len(query.supporting_documents), 1)
            f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
            metrics["support_f1"].append(f1)
            
            # Bridging Recall: effectiveness of orphan resurrection (k_o=3) [[113]]
            if query.required_entities:
                resurrected = self._count_resurrected_entities(result, query.required_entities)
                metrics["bridging_recall"].append(min(resurrected / len(query.required_entities), 1.0))
            
            # Path Confirmation Rate: Text-to-Graph verification completeness
            if query.required_paths:
                validated = self._count_validated_paths(result, query.required_paths)
                metrics["path_confirmation_rate"].append(validated / len(query.required_paths))
            
            # Token Efficiency: reduction vs GraphRAG baseline
            metrics["token_efficiency"].append(
                1.0 - (result.total_tokens / self.graphrag_baseline_tokens)
            )
        
        return {k: np.mean(v) for k, v in metrics.items()}
```

### B.2 Production Monitoring: Key Alerts (Prometheus Alertmanager)

```yaml
# monitoring/alerts.yaml
groups:
  - name: tgs-rag-critical
    rules:
      - alert: HighQueryErrorRate
        expr: |
          sum(rate(rag_queries_total{status="error"}[5m])) 
          / sum(rate(rag_queries_total[5m])) > 0.01
        for: 5m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "Query error rate >1% for 5 minutes"
          runbook: "https://runbooks.example.com/tgs-rag/high-error-rate"
          
      - alert: BridgingLatencySpike
        expr: |
          histogram_quantile(0.95, rate(rag_bridging_latency_ms_bucket[5m])) > 500
        for: 10m
        labels:
          severity: warning
          team: ml-engineering
        annotations:
          summary: "P95 orphan bridging latency >500ms"
          description: "May indicate Redis performance issues or high orphan count"
          
      - alert: PathConfirmationRateLow
        expr: |
          rate(rag_path_confirmation_validated_total[5m])
          / rate(rag_path_confirmation_checked_total[5m]) < 0.1
        for: 15m
        labels:
          severity: warning
          team: ml-engineering
        annotations:
          summary: "Path confirmation rate <10%"
          description: "Text-to-Graph verification may be ineffective; check extraction quality"
          
      - alert: TokenBudgetExceeded
        expr: |
          sum(rag_cost_usd_total{tenant_id=~".*"} offset 24h) 
          > on(tenant_id) group_left budget_limit_usd
        labels:
          severity: critical
          team: finops
        annotations:
          summary: "Tenant {{ $labels.tenant_id }} exceeded daily token budget"
          
      - alert: CrossTenantDataLeak
        expr: |
          increase(rag_security_violations_total[1h]) > 0
        for: 1m
        labels:
          severity: critical
          team: security
        annotations:
          summary: "Potential cross-tenant data access detected"
          runbook: "https://runbooks.example.com/security/tenant-isolation-breach"
          
      - alert: VisitedMemoryEvictionHigh
        expr: |
          rate(redis_evicted_keys_total{key=~"visited:.*"}[5m]) 
          / rate(redis_keyspace_hits_total{key=~"visited:.*"}[5m]) > 0.3
        for: 10m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "High eviction rate in Visited Memory cache"
          description: "Application-level LRU may not be preserving high-value entries"
```

---

## Conclusion & Next Steps

This merged PRD v2.0 provides a **research-faithful, operationally pragmatic, and cost-transparent** blueprint for implementing TGS-RAG at enterprise scale. Key differentiators include:

✅ **Complete Bidirectional Synergy**: Implements BOTH Graph-to-Text (Global Voting) AND Text-to-Graph (Path Confirmation + Orphan Bridging) as specified in the paper [[113]]  
✅ **Paper-Specified Parameters**: Uses K=20, d=3, k_o=3, α=0.5, ε=0.1 from Appendix C.1 [[113]]  
✅ **Application-Level LRU**: Ensures high-value orphan entities are preserved under memory pressure [[97]][[100]]  
✅ **Hybrid Orchestration**: Async in-process for sub-second query path; Temporal for long-running ingestion  
✅ **Proactive Cold-Start Handling**: Graph Sparsity Gate ensures predictable latency regardless of graph maturity  
✅ **Enterprise Ready**: Multi-tenancy, security, observability, and cost controls built-in from day one  
✅ **Cost Optimized**: 60-70% token reduction target with granular attribution and budget enforcement  

### Immediate Next Actions

1. **Kickoff Workshop**: Align engineering, product, security, and FinOps teams on Phase 1 scope and success metrics
2. **Infrastructure Provisioning**: Deploy dev/staging environments with Qdrant, Neo4j Enterprise, Redis Cluster, and Temporal
3. **Golden Dataset Curation**: Assemble MuSiQue/HotpotQA subsets with provenance mapping for continuous evaluation [[113]]
4. **Security Review**: Validate multi-tenancy isolation design, RBAC model, and PII redaction pipeline with security team
5. **Cost Modeling**: Establish baseline token usage for GraphRAG comparison; set tenant budget thresholds
6. **Parameter Validation**: Confirm paper-specified hyperparameters (K=20, d=3, k_o=3, α=0.5) in configuration management

### Success Metrics Review Cadence

| Metric | Review Frequency | Owner | Source |
|--------|-----------------|-------|--------|
| Strict Hit Rate / LLM Judge Accuracy | Weekly (dev); Monthly (prod) | ML Engineering | Paper Table 1 [[113]] |
| Token Efficiency vs GraphRAG | Bi-weekly | FinOps + ML Engineering | Paper Table 2 [[113]] |
| P95 Latency / Error Rate | Real-time dashboards; Weekly review | Platform Engineering | Enterprise SLO |
| Bridging Recall / Path Confirmation Rate | Weekly | ML Engineering | Paper Section 3.3.2 [[113]] |
| Security Audit Findings | Quarterly | Security Engineering | SOC 2 Requirement |
| Cost per Query / Tenant | Monthly | Product Management + FinOps | Cost Attribution Framework |

---

*Document Version: 2.0*  
*Last Updated: May 2026*  
*Approved By: Architecture Review Board, Security Council, FinOps Team*  

> **Disclaimer**: This blueprint is based on research from arXiv:2605.05643 (TGS-RAG) [[113]] and enterprise RAG best practices. Implementation details should be validated against your specific data characteristics, compliance requirements, and performance targets. The "80% compute reduction" claim should be interpreted as "~63-66% LLM token reduction" based on published benchmarks [[113]]. All paper-specified parameters (K=20, d=3, k_o=3, α=0.5, ε=0.1) are explicitly called out and should not be modified without re-validation against the golden dataset.
>
> # https://chat.qwen.ai/s/387b24b6-9bfd-4b35-892e-e750218f616d?fev=0.2.50
> 

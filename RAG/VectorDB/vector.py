## First, install the ChromaDB library and the sentence-transformers library, which provides the default embedding model.

```bash
pip install chromadb sentence-transformers

```

## This example demonstrates how to create a ChromaDB instance, add documents to a collection, and perform both a basic similarity search and a search with metadata filtering.

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

sentences = [
    "That is a happy person",
    "That is a happy dog",
    "That is a very happy person",
    "Today is a sunny day"
]
embeddings = model.encode(sentences)

similarities = model.similarity(embeddings, embeddings)
print(similarities.shape)
```

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("google/embeddinggemma-300m")

sentences = [
    "That is a happy person",
    "That is a happy dog",
    "That is a very happy person",
    "Today is a sunny day"
]
embeddings = model.encode(sentences)

similarities = model.similarity(embeddings, embeddings)
print(similarities.shape)
```

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("Qwen/Qwen3-Embedding-0.6B")

sentences = [
    "The weather is lovely today.",
    "It's so sunny outside!",
    "He drove to the stadium."
]
embeddings = model.encode(sentences)

similarities = model.similarity(embeddings, embeddings)
print(similarities.shape)
```

```python
import chromadb
from chromadb.utils import embedding_functions

# 1. Initialize the ChromaDB client
# This creates an in-memory client. For a persistent client that stores data
# on disk, use `chromadb.PersistentClient(path="./chroma_db_data")`.
chroma_client = chromadb.Client()

# 2. Define an embedding function
# We use the 'all-MiniLM-L6-v2' Sentence Transformer model, which is a good default
# for general-purpose text embedding.
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name='all-MiniLM-L6-v2'
)

# 3. Create or get a collection
# A collection is where your documents, embeddings, and metadata are stored.
# If the collection 'my_rag_collection' doesn't exist, it will be created.
collection = chroma_client.get_or_create_collection(
    name="my_rag_collection",
    embedding_function=embedding_function
)

# 4. Add documents to the collection
# We provide documents, unique IDs, and optional metadata.
documents_to_add = [
    "The official logo of Google is a multi-colored 'G' in a sans-serif typeface.",
    "The capital of France is Paris, famous for its Eiffel Tower and romantic atmosphere.",
    "Large language models (LLMs) are a type of artificial intelligence.",
    "Many large cities have issues with traffic congestion, especially during rush hour."
]
metadatas = [
    {"source": "wikipedia", "topic": "company_logo"},
    {"source": "wikipedia", "topic": "geography"},
    {"source": "tech_blog", "topic": "AI"},
    {"source": "city_planning_report", "topic": "urban_development"}
]
ids = [f"doc_{i}" for i in range(len(documents_to_add))]

collection.add(
    documents=documents_to_add,
    metadatas=metadatas,
    ids=ids
)

print("Documents added to the collection.")

# 5. Perform a similarity search
# Query for documents most similar to the search text.
query_text = "What is the capital of France?"
results = collection.query(
    query_texts=[query_text],
    n_results=2  # Return the top 2 most similar results
)

print("\n--- Similarity Search Results ---")
print(f"Query: '{query_text}'")
# The result object contains lists of ids, documents, metadatas, and distances.
for i, (doc, dist) in enumerate(zip(results['documents'][0], results['distances'][0])):
    print(f"\nResult {i+1}:")
    print(f"  - Document: '{doc}'")
    print(f"  - Distance: {dist:.4f}")
    print(f"  - Metadata: {results['metadatas'][0][i]}")


# 6. Perform a filtered similarity search
# Filter results using metadata to narrow the search space.
filtered_query_text = "What is AI?"
filtered_results = collection.query(
    query_texts=[filtered_query_text],
    n_results=1,
    where={"topic": "AI"}  # Only search for documents with 'AI' as a topic
)

print("\n--- Filtered Similarity Search Results ---")
print(f"Query: '{filtered_query_text}' with filter: 'topic=AI'")
if filtered_results['documents'][0]:
    for doc in filtered_results['documents'][0]:
        print(f"  - Document: '{doc}'")
else:
    print("No documents found for this query and filter.")
```

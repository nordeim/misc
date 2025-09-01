## Training a tokenizer for LLMs

Tokenizers are the quiet force behind every LLM: they decide what the model “sees,” how long a context really is, how fast inference runs, and even how well a model can handle code, emojis, or morphologically rich languages. If you get the tokenizer wrong, you bottleneck everything else.

---

### Why a tokenizer is needed

- **Discrete inputs for neural nets.** LLMs operate on integers (token IDs), not raw strings. A tokenizer converts text into a stable, finite vocabulary that the model can embed and attend over.
- **Compression and efficiency.** Good tokenization reduces the number of tokens per character/byte, lowering compute and latency for the same text length and effectively “stretching” the context window.
- **Generalization beyond words.** Subword tokenization handles rare words, typos, inflections, named entities, code identifiers, and multilingual scripts without exploding vocabulary size or relying on fragile out-of-vocabulary fallbacks.
- **Stable, reversible preprocessing.** Tokenizers standardize whitespace, punctuation, and Unicode so any text can be round-tripped through tokenize → detokenize without corruption—critical for prompts, tools, and safety filters.

Direct answers: Training a tokenizer balances three competing goals—coverage (handle any text), compression (fewer tokens per text), and compositionality (split text into meaningful parts)—while staying stable and reversible.

---

### How tokenizers work

#### Core algorithms
- **Byte-Pair Encoding (BPE).**  
  - **Idea:** Start from characters/bytes, iteratively merge the most frequent adjacent pairs to build subword units.  
  - **Pros:** Fast, simple, great compression for common chunks.  
  - **Cons:** Greedy merges can hide atomic units needed for symbolic/arithmetic tasks; struggles with extremely rare substrings unless byte-fallback is used.
- **WordPiece.**  
  - **Idea:** Choose subwords to maximize likelihood of training text under a unigram-like model; uses continuation markers (e.g., “##ing”).  
  - **Pros:** Balanced, robust for many languages; classic for BERT.  
  - **Cons:** Typically needs pretokenization by whitespace; less byte-native.
- **Unigram (SentencePiece).**  
  - **Idea:** Start with an overcomplete subword set, prune to minimize negative log-likelihood via EM. Uses “▁” to mark word boundaries.  
  - **Pros:** Strong statistical grounding, flexible, byte-fallback support; no external pretokenizer needed.  
  - **Cons:** Slightly more complex to train; vocabulary choices impact runtime memory.
- **Byte-level BPE.**  
  - **Idea:** Run BPE directly over bytes; all inputs are representable without <unk>.  
  - **Pros:** Perfect coverage of arbitrary text, code, emojis.  
  - **Cons:** Can reduce linguistic interpretability of tokens; careful normalization still matters.

#### Normalization and pretokenization
- **Unicode normalization:** Choose NFC/NFKC policy to unify canonically equivalent strings; be explicit to avoid homoglyph and security pitfalls.
- **Case and accents:** Lowercasing improves compression but loses signal (names, acronyms). Accent stripping trades recall for compactness—decide based on domain.
- **Whitespace and punctuation:** For code and data, preserve exact whitespace and line breaks; for natural text, light cleanup can help. Consistency is crucial.

#### Vocabulary size trade‑offs
- **Larger vocab (e.g., 100k+):**  
  - **Pros:** Fewer tokens per text; faster inference at fixed context.  
  - **Cons:** Bigger embedding matrix, more memory; higher risk of “overfitting” rare strings as single tokens.
- **Smaller vocab (e.g., 30–50k):**  
  - **Pros:** Leaner embeddings; better compositionality.  
  - **Cons:** More tokens per text; potentially slower at same window length.

#### Special tokens and fallback
- **Special tokens:** Reserve IDs for BOS/EOS, PAD, mask, system/user roles, function-call boundaries, tool-IO sentinels, and safety separators. Keep them stable.
- **Fallback:** Prefer byte-fallback over <unk> so any input (URLs, emojis, identifiers) is representable without loss.

---

### How to train a tokenizer

1. **Define scope and constraints**  
   - **Domain:** General, code-heavy, biomedical, legal, multilingual.  
   - **Constraints:** Memory budget, expected context window, latency targets, on-device vs server.  
   - **Markers:** Whether to use boundary markers (“▁”/“Ġ”), continuation (“##”), or pure byte-level.

2. **Collect and sanitize corpus**  
   - **Coverage:** Include representative text (and code, if relevant), across languages/scripts you care about.  
   - **Quality:** De-duplicate aggressively; remove boilerplate; keep exact whitespace if code is in-scope.  
   - **Normalization policy:** Fix Unicode policy now and never change it later.

3. **Choose algorithm and vocab size**  
   - **Defaults that work:** SentencePiece Unigram or SP-BPE with byte-fallback; vocab ≈ 32k–100k depending on memory/latency.  
   - **Code-focused:** Byte-level BPE or SP with byte-fallback; include indentation/newline-friendly choices.

4. **Train**  
   - **BPE:** Build initial symbol table (bytes/chars); count pair frequencies; merge until target size.  
   - **Unigram:** Initialize overcomplete vocab; EM to prune subwords minimizing NLL; iterate to target size.  
   - **WordPiece:** Optimize subword inventory for likelihood with continuation markers.

5. **Evaluate and iterate**  
   - **Compression:** Average tokens per byte/character; bytes per token.  
   - **Fertility:** Subword pieces per word (lower is better up to a point).  
   - **Fragmentation hotspots:** Rare but important terms: entities, formulas, code identifiers, numbers.  
   - **Round‑trip:** Detokenize(tokenize(x)) == x for a large sample.  
   - **Downstream proxy:** Quick pretraining step to compare loss/perplexity at equal compute.  
   - **Latency:** Real-world tokens/s on intended hardware.

6. **Freeze and version**  
   - **Artifacts:** Vocabulary file, merges/model file, normalization rules, special token list.  
   - **Compatibility:** Once you pretrain the LLM, changing the tokenizer means changing the embedding matrix—treat it as immutable.

Tip: If you must extend a tokenizer later (e.g., domain adaptation), add new tokens and randomly initialize their embeddings; keep all original token IDs stable.

---

### Tokenizers in major LLM families

| Family/examples | Algorithm/style | Boundary marker | Typical vocab | Notable traits |
| --- | --- | --- | --- | --- |
| GPT-style (GPT-2/3/4, many OSS GPT clones) | Byte-level BPE | Leading space encoded (often shown as “Ġ” or literal space) | ≈ 50k–100k | Strong coverage via bytes; great for code and emojis. |
| BERT/RoBERTa | WordPiece / BPE | “##” for continuations (BERT); “Ġ” in RoBERTa vocab display | ≈ 30k–50k | Classic subword scheme; strong for NLU; often lowercased variants. |
| T5/PaLM/UL2 (Google lineage) | SentencePiece Unigram | “▁” marks word boundary | ≈ 32k | Language-agnostic, no external pretokenizer needed. |
| Llama/Mistral families | SentencePiece (BPE or Unigram) with byte-fallback | “▁” marks word boundary | ≈ 32k–128k | Good multilingual/code handling; stable round-trip. |
| Code LLMs (CodeLlama, StarCoder etc.) | Byte-level BPE or SP with byte-fallback | Space/newline preserved | ≈ 50k–100k | Emphasize whitespace fidelity and symbol coverage. |

> These are representative patterns; exact sizes and markers vary by release and vendor.

---

### Example: tokenizing a famous quote

We’ll use: “To be, or not to be: that is the question.”

Note: The exact result depends on the trained vocabulary. The samples below reflect common conventions for each tokenizer family.

#### GPT-style byte-level BPE (displaying the common “Ġ” space marker)
Tokens:
- To, Ġbe, ,, Ġor, Ġnot, Ġto, Ġbe, :, Ġthat, Ġis, Ġthe, Ġquestion, .

- **Token count:** 13  
- **Notes:** Spaces are encoded into the token (e.g., “Ġbe”). Strong compression on frequent words; punctuation kept separate.

#### BERT WordPiece (uncased; “##” means continuation)
Tokens:
- to, be, ,, or, not, to, be, :, that, is, the, question, .

- **Token count:** 13  
- **Notes:** Many common words stay whole; if “question” were unseen, it might split like “quest” + “##ion”.

#### SentencePiece Unigram (T5/PaLM style; “▁” marks a word boundary/space)
Tokens:
- ▁To, ▁be, ,, ▁or, ▁not, ▁to, ▁be, :, ▁that, ▁is, ▁the, ▁question, .

- **Token count:** 13  
- **Notes:** Boundary marker “▁” represents a preceding space; robust, language-agnostic behavior.

#### SentencePiece BPE (Llama/Mistral style; similar to above)
Tokens:
- ▁To, ▁be, ,, ▁or, ▁not, ▁to, ▁be, :, ▁that, ▁is, ▁the, ▁question, .

- **Token count:** 13  
- **Notes:** Very similar to Unigram for common text; byte-fallback ensures no <unk>.

What changes in harder cases:
- **Emojis:** Byte-level and byte-fallback schemes represent them reliably without <unk>.  
- **Code/indentation:** Byte-aware schemes preserve exact whitespace and newlines, preventing syntactic breakage.  
- **Numbers and math:** Some tokenizers fuse frequent number patterns (“10,000”), others split digits; the choice affects arithmetic reliability.

---

### Practical guidance and pitfalls

- **When to train a new tokenizer**
  - **Domain shift:** Biomedical, legal, or log/code-heavy workloads benefit from domain-aware subwords (e.g., “carcinoma”, “HTTPRequest”).  
  - **Multilingual:** Ensure representative data and scripts; byte-fallback plus a balanced vocab reduces fragmentation in low-resource languages.  
  - **Hardware constraints:** If memory-bound, prefer a smaller vocab; if latency-bound on long contexts, a larger vocab can win.

- **What not to do**
  - **Changing normalization midstream:** It breaks round-trip and reproducibility. Decide once.  
  - **Overfitting rare strings:** Huge vocabs with many singletons can hurt generalization and memory.  
  - **Dropping whitespace for code:** You’ll corrupt programs and reduce downstream performance.

- **Adapting an existing model**
  - **Safest path:** Keep the tokenizer; fine-tune the model.  
  - **If extending vocab:** Append new tokens, initialize their embeddings randomly (or with averages of related subwords), and fine-tune. Never renumber existing tokens.  
  - **Full swap:** Retokenizing and remapping embeddings is possible but risky; expect to re-pretrain or at least run substantial continued pretraining.

- **Quick start with SentencePiece (example)**
  ```bash
  spm_train \
    --input=corpus.txt \
    --model_prefix=mytok \
    --vocab_size=50000 \
    --model_type=unigram \
    --character_coverage=1.0 \
    --byte_fallback=true \
    --normalization_rule_name=nfkc
  ```
  - **Key flags:**  
    - **vocab_size:** Compression vs memory trade-off.  
    - **character_coverage:** 1.0 ensures full Unicode coverage.  
    - **byte_fallback:** Eliminates <unk> by falling back to bytes.  
    - **normalization_rule_name:** Freeze your Unicode policy early.

If you want, tell me your target domain (e.g., multilingual chat, source code, biomedical) and memory/latency constraints, and I’ll propose an exact tokenizer spec (algorithm, vocab size, normalization, special tokens) and a validation checklist tailored to your use case.

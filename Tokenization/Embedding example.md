Alright Sepnet — let’s wire this up so you can literally **watch the journey** of each generated token:  

**Token ID → Embedding Vector → Predicted Next Token**  

I’ll extend both the **PyTorch** and **TensorFlow** “pro” streaming generation examples from before.  
We’ll keep temperature, top‑k, top‑p sampling, EOS stopping, and now **print the embedding vector** for each generated token in real time.

---

## **1️⃣ PyTorch – Pro Streaming with Embedding Debug**

```python
import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import sentencepiece as spm

# === CONFIG ===
INPUT_TEXT_FILE = "input.txt"
MODEL_PREFIX = "custom_tokenizer"
VOCAB_SIZE = 64000
MODEL_SAVE_PATH = "pytorch_model.pth"

# === 1. TRAIN TOKENIZER IF NEEDED ===
if not os.path.exists(f"{MODEL_PREFIX}.model"):
    spm.SentencePieceTrainer.Train(
        input=INPUT_TEXT_FILE,
        model_prefix=MODEL_PREFIX,
        vocab_size=VOCAB_SIZE,
        model_type="bpe",
        byte_fallback=True,
        normalization_rule_name="nfkc",
        character_coverage=1.0,
        pad_id=0, unk_id=1, bos_id=2, eos_id=3
    )

# === 2. LOAD TOKENIZER ===
sp = spm.SentencePieceProcessor()
sp.load(f"{MODEL_PREFIX}.model")
vocab_size = sp.get_piece_size()
EOS_ID = sp.eos_id()

# === 3. DATASET ===
class TextDataset(Dataset):
    def __init__(self, texts):
        self.data = [torch.tensor(sp.encode(t, out_type=int)) for t in texts]

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        x = self.data[idx][:-1]
        y = self.data[idx][1:]
        return x, y

def collate_fn(batch):
    xs, ys = zip(*batch)
    xs = nn.utils.rnn.pad_sequence(xs, batch_first=True, padding_value=0)
    ys = nn.utils.rnn.pad_sequence(ys, batch_first=True, padding_value=0)
    return xs, ys

texts = [
    "Hello world!",
    "PyTorch integration with SentencePiece.",
    "Tokenizers are fun to build."
]
dataset = TextDataset(texts)
loader = DataLoader(dataset, batch_size=2, collate_fn=collate_fn)

# === 4. MODEL ===
class SimpleLM(nn.Module):
    def __init__(self, vocab_size, embed_dim=64):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, 128, batch_first=True)
        self.fc = nn.Linear(128, vocab_size)

    def forward(self, x, hidden=None):
        emb = self.embed(x)
        out, hidden = self.lstm(emb, hidden)
        logits = self.fc(out)
        return logits, hidden, emb  # Return embeddings for debug

model = SimpleLM(vocab_size)
criterion = nn.CrossEntropyLoss(ignore_index=0)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# === 5. TRAIN ===
for epoch in range(3):
    for x, y in loader:
        optimizer.zero_grad()
        logits, _, _ = model(x)
        loss = criterion(logits.view(-1, vocab_size), y.view(-1))
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch+1} Loss: {loss.item():.4f}")

torch.save(model.state_dict(), MODEL_SAVE_PATH)

# === 6. SAMPLING UTILS ===
def sample_next_token(logits, temperature=1.0, top_k=50, top_p=0.9):
    logits = logits / temperature
    probs = torch.softmax(logits, dim=-1)

    if top_k > 0:
        top_k = min(top_k, probs.size(-1))
        values, _ = torch.topk(probs, top_k)
        min_prob = values[:, -1].unsqueeze(1)
        probs = torch.where(probs < min_prob, torch.zeros_like(probs), probs)

    if top_p < 1.0:
        sorted_probs, sorted_indices = torch.sort(probs, descending=True)
        cumulative_probs = torch.cumsum(sorted_probs, dim=-1)
        cutoff = cumulative_probs > top_p
        cutoff[..., 1:] = cutoff[..., :-1].clone()
        cutoff[..., 0] = False
        sorted_probs[cutoff] = 0.0
        probs = torch.zeros_like(probs).scatter(1, sorted_indices, sorted_probs)

    probs = probs / probs.sum(dim=-1, keepdim=True)
    next_id = torch.multinomial(probs, num_samples=1)
    return next_id.item()

# === 7. PRO STREAMING GENERATION WITH EMBEDDING DEBUG ===
def generate_stream(prompt, max_new_tokens=10, temperature=1.0, top_k=50, top_p=0.9, delay=0.3):
    model.eval()
    ids = sp.encode(prompt, out_type=int)
    input_ids = torch.tensor(ids).unsqueeze(0)
    hidden = None
    print(f"[Prompt IDs]: {ids}")
    print(prompt, end="", flush=True)

    for _ in range(max_new_tokens):
        with torch.no_grad():
            logits, hidden, emb = model(input_ids[:, -1:], hidden)
            # Print embedding vector for the last token
            print(f"\n[Embedding for token ID {input_ids[0, -1].item()}]: {emb[0, -1].tolist()}")
            next_id = sample_next_token(logits[:, -1, :], temperature, top_k, top_p)

        if next_id == EOS_ID:
            print(" <EOS>")
            break

        token = sp.id_to_piece(next_id)
        print(token.replace("▁", " "), end="", flush=True)
        print(f" [{next_id}]", end="", flush=True)
        time.sleep(delay)
        input_ids = torch.cat([input_ids, torch.tensor([[next_id]])], dim=1)
    print()

generate_stream("Tokenizers", temperature=0.8, top_k=40, top_p=0.9)
```

---

## **2️⃣ TensorFlow – Pro Streaming with Embedding Debug**

```python
import os
import time
import tensorflow as tf
import sentencepiece as spm

# === CONFIG ===
INPUT_TEXT_FILE = "input.txt"
MODEL_PREFIX = "custom_tokenizer"
VOCAB_SIZE = 64000
MODEL_SAVE_DIR = "tf_model"

# === 1. TRAIN TOKENIZER IF NEEDED ===
if not os.path.exists(f"{MODEL_PREFIX}.model"):
    spm.SentencePieceTrainer.Train(
        input=INPUT_TEXT_FILE,
        model_prefix=MODEL_PREFIX,
        vocab_size=VOCAB_SIZE,
        model_type="bpe",
        byte_fallback=True,
        normalization_rule_name="nfkc",
        character_coverage=1.0,
        pad_id=0, unk_id=1, bos_id=2, eos_id=3
    )

# === 2. LOAD TOKENIZER ===
sp = spm.SentencePieceProcessor()
sp.load(f"{MODEL_PREFIX}.model")
vocab_size = sp.get_piece_size()
EOS_ID = sp.eos_id()

# === 3. DATA ===
texts = [
    "Hello world!",
    "TensorFlow integration with SentencePiece.",
    "Tokenizers are fun to build."
]

def encode_text(t):
    ids = sp.encode(t, out_type=int)
    return ids[:-1], ids[1:]

encoded = [encode_text(t) for t in texts]

def pad_sequences(sequences, pad_value=0):
    max_len = max(len(seq) for seq in sequences)
    return tf.constant([seq + [pad_value]*(max_len - len(seq)) for seq in sequences])

inputs = pad_sequences([inp for inp, _ in encoded])
targets = pad_sequences([tgt for _, tgt in encoded])

dataset = tf.data.Dataset.from_tensor_slices((inputs, targets)).batch(2)

# === 4. MODEL WITH EMBEDDING ACCESS ===
class SimpleLM(tf.keras.Model):
    def __init__(self, vocab_size, embed_dim=64):
        super().__init__()
        self.embed = tf.keras.layers.Embedding(vocab_size, embed_dim, mask_zero=True)
        self.lstm = tf.keras.layers.LSTM(128, return_sequences=True, return_state=True)
        self.fc = tf.keras.layers.Dense(vocab_size)

    def call(self, x, states=None, training=False):
        emb = self.embed(x)
        if states is None:
            lstm_out, h, c = self.lstm(emb, training=training)
        else:
            lstm_out, h, c = self.lstm(emb, initial_state=states, training=training)
        logits = self.fc(lstm_out)
        return logits, (h, c), emb

model = SimpleLM(vocab_size)
loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
model.compile(optimizer="adam", loss=loss_fn)

# === 5. TRAIN ===
model.fit(dataset, epochs=3)
model.save(MODEL_SAVE_DIR)

# === 6. SAMPLING UTILS ===
def sample_next_token(logits, temperature=1.0, top_k=

---

Perfect — let’s upgrade the **PyTorch streaming example** so that for each generated token you’ll see:

1. **Token ID**  
2. **Embedding vector shape** (so you can confirm the dimension)  
3. **Norm (magnitude)** of the embedding vector (so you can watch scale changes)  
4. **The embedding vector itself**  
5. **The predicted token**  

This will make the token → embedding → prediction pipeline fully transparent.

---

## **Extended PyTorch Streaming Example with Shape & Norm**

```python
import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import sentencepiece as spm

# === CONFIG ===
INPUT_TEXT_FILE = "input.txt"
MODEL_PREFIX = "custom_tokenizer"
VOCAB_SIZE = 64000
MODEL_SAVE_PATH = "pytorch_model.pth"

# === 1. TRAIN TOKENIZER IF NEEDED ===
if not os.path.exists(f"{MODEL_PREFIX}.model"):
    spm.SentencePieceTrainer.Train(
        input=INPUT_TEXT_FILE,
        model_prefix=MODEL_PREFIX,
        vocab_size=VOCAB_SIZE,
        model_type="bpe",
        byte_fallback=True,
        normalization_rule_name="nfkc",
        character_coverage=1.0,
        pad_id=0, unk_id=1, bos_id=2, eos_id=3
    )

# === 2. LOAD TOKENIZER ===
sp = spm.SentencePieceProcessor()
sp.load(f"{MODEL_PREFIX}.model")
vocab_size = sp.get_piece_size()
EOS_ID = sp.eos_id()

# === 3. DATASET ===
class TextDataset(Dataset):
    def __init__(self, texts):
        self.data = [torch.tensor(sp.encode(t, out_type=int)) for t in texts]

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        x = self.data[idx][:-1]
        y = self.data[idx][1:]
        return x, y

def collate_fn(batch):
    xs, ys = zip(*batch)
    xs = nn.utils.rnn.pad_sequence(xs, batch_first=True, padding_value=0)
    ys = nn.utils.rnn.pad_sequence(ys, batch_first=True, padding_value=0)
    return xs, ys

texts = [
    "Hello world!",
    "PyTorch integration with SentencePiece.",
    "Tokenizers are fun to build."
]
dataset = TextDataset(texts)
loader = DataLoader(dataset, batch_size=2, collate_fn=collate_fn)

# === 4. MODEL ===
class SimpleLM(nn.Module):
    def __init__(self, vocab_size, embed_dim=64):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, 128, batch_first=True)
        self.fc = nn.Linear(128, vocab_size)

    def forward(self, x, hidden=None):
        emb = self.embed(x)
        out, hidden = self.lstm(emb, hidden)
        logits = self.fc(out)
        return logits, hidden, emb  # Return embeddings for debug

model = SimpleLM(vocab_size)
criterion = nn.CrossEntropyLoss(ignore_index=0)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# === 5. TRAIN ===
for epoch in range(3):
    for x, y in loader:
        optimizer.zero_grad()
        logits, _, _ = model(x)
        loss = criterion(logits.view(-1, vocab_size), y.view(-1))
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch+1} Loss: {loss.item():.4f}")

torch.save(model.state_dict(), MODEL_SAVE_PATH)

# === 6. SAMPLING UTILS ===
def sample_next_token(logits, temperature=1.0, top_k=50, top_p=0.9):
    logits = logits / temperature
    probs = torch.softmax(logits, dim=-1)

    if top_k > 0:
        top_k = min(top_k, probs.size(-1))
        values, _ = torch.topk(probs, top_k)
        min_prob = values[:, -1].unsqueeze(1)
        probs = torch.where(probs < min_prob, torch.zeros_like(probs), probs)

    if top_p < 1.0:
        sorted_probs, sorted_indices = torch.sort(probs, descending=True)
        cumulative_probs = torch.cumsum(sorted_probs, dim=-1)
        cutoff = cumulative_probs > top_p
        cutoff[..., 1:] = cutoff[..., :-1].clone()
        cutoff[..., 0] = False
        sorted_probs[cutoff] = 0.0
        probs = torch.zeros_like(probs).scatter(1, sorted_indices, sorted_probs)

    probs = probs / probs.sum(dim=-1, keepdim=True)
    next_id = torch.multinomial(probs, num_samples=1)
    return next_id.item()

# === 7. PRO STREAMING GENERATION WITH EMBEDDING DEBUG ===
def generate_stream(prompt, max_new_tokens=10, temperature=1.0, top_k=50, top_p=0.9, delay=0.3):
    model.eval()
    ids = sp.encode(prompt, out_type=int)
    input_ids = torch.tensor(ids).unsqueeze(0)
    hidden = None
    print(f"[Prompt IDs]: {ids}")
    print(prompt, end="", flush=True)

    for _ in range(max_new_tokens):
        with torch.no_grad():
            logits, hidden, emb = model(input_ids[:, -1:], hidden)

            # Extract the embedding vector for the last token
            last_token_id = input_ids[0, -1].item()
            last_emb = emb[0, -1]

            # Print debug info
            print(f"\n--- Token Debug ---")
            print(f"Token ID: {last_token_id}")
            print(f"Embedding shape: {tuple(last_emb.shape)}")
            print(f"Embedding norm: {last_emb.norm().item():.6f}")
            print(f"Embedding vector: {last_emb.tolist()}")

            next_id = sample_next_token(logits[:, -1, :], temperature, top_k, top_p)

        if next_id == EOS_ID:
            print(" <EOS>")
            break

        token = sp.id_to_piece(next_id)
        print(token.replace("▁", " "), end="", flush=True)
        print(f" [{next_id}]", end="", flush=True)
        time.sleep(delay)
        input_ids = torch.cat([input_ids, torch.tensor([[next_id]])], dim=1)
    print()

# === RUN DEMO ===
generate_stream("Tokenizers", temperature=0.8, top_k=40, top_p=0.9)
```

---

### **What’s new in this version**
- **`Embedding shape`** — confirms the dimensionality (e.g., `(64,)` in this toy model).
- **`Embedding norm`** — shows the vector’s magnitude, which can change depending on the token and training.
- **`Embedding vector`** — the actual list of floats for that token at that step.
- Still streams token-by-token with top‑k/top‑p sampling.

---

💡 **Tip for real LLMs:**  
If you swap in a real pre‑trained model (e.g., GPT‑2, LLaMA, etc.), the embedding dimension will be much larger (768, 1024, 4096+), and norms will vary more subtly. Watching the norm can be useful for diagnosing training stability or token representation drift.

---

If you want, I can also **log the cosine similarity** between consecutive token embeddings during generation — that way you can see how semantically “close” each step is in the embedding space. That would make the transformation story even richer. Would you like me to add that next?

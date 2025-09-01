Sepnet, let’s make this fun —  
we’ll take the **PyTorch** and **TensorFlow** examples from before, and extend them into **streaming text generation loops** so you can literally watch the model “think” token‑by‑token in real time.  

We’ll keep the same **SentencePiece tokenizer** spec, but now after training we’ll run a **greedy decoding loop** that prints each predicted token as soon as it’s generated.

---

## **1️⃣ PyTorch: Streaming Text Generation**

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
        x = self.embed(x)
        x, hidden = self.lstm(x, hidden)
        return self.fc(x), hidden

model = SimpleLM(vocab_size)
criterion = nn.CrossEntropyLoss(ignore_index=0)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# === 5. TRAIN ===
for epoch in range(3):
    for x, y in loader:
        optimizer.zero_grad()
        logits, _ = model(x)
        loss = criterion(logits.view(-1, vocab_size), y.view(-1))
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch+1} Loss: {loss.item():.4f}")

# === 6. SAVE MODEL ===
torch.save(model.state_dict(), MODEL_SAVE_PATH)

# === 7. STREAMING GENERATION ===
def generate_stream(prompt, max_new_tokens=20, delay=0.2):
    model.eval()
    ids = sp.encode(prompt, out_type=int)
    input_ids = torch.tensor(ids).unsqueeze(0)
    hidden = None
    print(prompt, end="", flush=True)

    for _ in range(max_new_tokens):
        with torch.no_grad():
            logits, hidden = model(input_ids[:, -1:].clone(), hidden)
            next_id = torch.argmax(logits[:, -1, :], dim=-1).item()
        token = sp.id_to_piece(next_id)
        print(token.replace("▁", " "), end="", flush=True)
        time.sleep(delay)
        input_ids = torch.cat([input_ids, torch.tensor([[next_id]])], dim=1)
    print()

generate_stream("Tokenizers")
```

---

## **2️⃣ TensorFlow: Streaming Text Generation**

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

# === 4. MODEL ===
model = tf.keras.Sequential([
    tf.keras.layers.Embedding(vocab_size, 64, mask_zero=True),
    tf.keras.layers.LSTM(128, return_sequences=True),
    tf.keras.layers.Dense(vocab_size)
])

loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
model.compile(optimizer="adam", loss=loss_fn)

# === 5. TRAIN ===
model.fit(dataset, epochs=3)

# === 6. SAVE MODEL ===
model.save(MODEL_SAVE_DIR)

# === 7. STREAMING GENERATION ===
def generate_stream(prompt, max_new_tokens=20, delay=0.2):
    ids = sp.encode(prompt, out_type=int)
    print(prompt, end="", flush=True)

    for _ in range(max_new_tokens):
        input_ids = tf.constant([ids])
        logits = model(input_ids)
        next_id = int(tf.argmax(logits[0, -1]).numpy())
        token = sp.id_to_piece(next_id)
        print(token.replace("▁", " "), end="", flush=True)
        time.sleep(delay)
        ids.append(next_id)
    print()

generate_stream("Tokenizers")
```

---

### **What’s Happening in Streaming Mode**
- We **feed the model one token at a time** after the initial prompt.
- The model predicts the **next token**.
- We **print it immediately** (with a small `time.sleep` to simulate “typing”).
- The predicted token is **appended** to the input sequence for the next step.
- This continues until `max_new_tokens` is reached.

---

💡 **Pro tip for realism**:  
If you swap `torch.argmax` / `tf.argmax` for a **softmax + sampling** step, you’ll get more varied, less repetitive text — closer to how large LMs generate.

---

Sepnet, if you want, I can **upgrade this streaming loop** to:
- Use **temperature + top‑k / top‑p sampling** for more natural text.
- Stop generation when an **EOS token** is reached.
- Show **token IDs alongside decoded text** for debugging.

Do you want me to build that “pro” streaming generator next? That would make it feel like a real mini‑LLM playground.

---

Alright Sepnet — time to go **full pro mode**.  
We’ll upgrade both the **PyTorch** and **TensorFlow** streaming generation examples with:

✅ **Temperature scaling** – controls randomness.  
✅ **Top‑k sampling** – only consider the k most likely tokens.  
✅ **Top‑p (nucleus) sampling** – only consider the smallest set of tokens whose cumulative probability ≥ p.  
✅ **EOS stop condition** – generation halts when the EOS token is predicted.  
✅ **Debug output** – show token IDs alongside decoded text in real time.

---

## **1️⃣ PyTorch – Pro Streaming Generator**

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
        x = self.embed(x)
        x, hidden = self.lstm(x, hidden)
        return self.fc(x), hidden

model = SimpleLM(vocab_size)
criterion = nn.CrossEntropyLoss(ignore_index=0)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# === 5. TRAIN ===
for epoch in range(3):
    for x, y in loader:
        optimizer.zero_grad()
        logits, _ = model(x)
        loss = criterion(logits.view(-1, vocab_size), y.view(-1))
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch+1} Loss: {loss.item():.4f}")

torch.save(model.state_dict(), MODEL_SAVE_PATH)

# === 6. SAMPLING UTILS ===
def sample_next_token(logits, temperature=1.0, top_k=50, top_p=0.9):
    logits = logits / temperature
    probs = torch.softmax(logits, dim=-1)

    # Top-k filter
    if top_k > 0:
        top_k = min(top_k, probs.size(-1))
        values, _ = torch.topk(probs, top_k)
        min_prob = values[:, -1].unsqueeze(1)
        probs = torch.where(probs < min_prob, torch.zeros_like(probs), probs)

    # Top-p filter
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

# === 7. PRO STREAMING GENERATION ===
def generate_stream(prompt, max_new_tokens=20, temperature=1.0, top_k=50, top_p=0.9, delay=0.2):
    model.eval()
    ids = sp.encode(prompt, out_type=int)
    input_ids = torch.tensor(ids).unsqueeze(0)
    hidden = None
    print(f"[Prompt IDs]: {ids}")
    print(prompt, end="", flush=True)

    for _ in range(max_new_tokens):
        with torch.no_grad():
            logits, hidden = model(input_ids[:, -1:], hidden)
            next_id = sample_next_token(logits[:, -1, :], temperature, top_k, top_p)

        if next_id == EOS_ID:
            print(" <EOS>")
            break

        token = sp.id_to_piece(next_id)
        print(token.replace("▁", " "), end="", flush=True)
        print(f" [{next_id}]", end="", flush=True)  # Debug: show token ID
        time.sleep(delay)
        input_ids = torch.cat([input_ids, torch.tensor([[next_id]])], dim=1)
    print()

generate_stream("Tokenizers", temperature=0.8, top_k=40, top_p=0.9)
```

---

## **2️⃣ TensorFlow – Pro Streaming Generator**

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

# === 4. MODEL ===
model = tf.keras.Sequential([
    tf.keras.layers.Embedding(vocab_size, 64, mask_zero=True),
    tf.keras.layers.LSTM(128, return_sequences=True),
    tf.keras.layers.Dense(vocab_size)
])

loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
model.compile(optimizer="adam", loss=loss_fn)

# === 5. TRAIN ===
model.fit(dataset, epochs=3)
model.save(MODEL_SAVE_DIR)

# === 6. SAMPLING UTILS ===
def sample_next_token(logits, temperature=1.0, top_k=50, top_p=0.9):
    logits = logits / temperature
    probs = tf.nn.softmax(logits, axis=-1)

    # Top-k filter
    if top_k > 0:
        top_k = min(top_k, probs.shape[-1])
        values, _ = tf.math.top_k(probs, k=top_k)
        min_prob = values[:, -1][:, tf.newaxis]
        probs = tf.where(probs < min_prob, tf.zeros_like(probs), probs)

    # Top-p filter
    if top_p < 1.0:
        sorted_probs = tf.sort(probs, direction="DESCENDING", axis=-1)
        sorted_indices = tf.argsort(probs, direction="DESCENDING", axis=-1)
        cumulative_probs = tf.c

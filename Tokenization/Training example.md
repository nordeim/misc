Alright Sepnet — let’s take your custom SentencePiece tokenizer and wire it directly into **two minimal training loops**: one in **PyTorch** and one in **TensorFlow**.  
Both examples will:

- Load your `custom_tokenizer.model`
- Tokenize text into IDs
- Feed those IDs into a simple model
- Run a tiny training loop

This way, you’ll see exactly how the `.model` file becomes part of your ML pipeline.

---

## **1️⃣ PyTorch Example**

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import sentencepiece as spm

# === Load your trained tokenizer ===
sp = spm.SentencePieceProcessor()
sp.load("custom_tokenizer.model")
vocab_size = sp.get_piece_size()

# === Example dataset ===
class TextDataset(Dataset):
    def __init__(self, texts):
        self.data = [torch.tensor(sp.encode(t, out_type=int)) for t in texts]

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        x = self.data[idx][:-1]  # input tokens
        y = self.data[idx][1:]   # target tokens (next-token prediction)
        return x, y

# === Collate function for padding ===
def collate_fn(batch):
    xs, ys = zip(*batch)
    xs = nn.utils.rnn.pad_sequence(xs, batch_first=True, padding_value=0)
    ys = nn.utils.rnn.pad_sequence(ys, batch_first=True, padding_value=0)
    return xs, ys

# === Dummy training data ===
texts = [
    "Hello world!",
    "PyTorch integration with SentencePiece.",
    "Tokenizers are fun to build."
]
dataset = TextDataset(texts)
loader = DataLoader(dataset, batch_size=2, collate_fn=collate_fn)

# === Simple model ===
class SimpleLM(nn.Module):
    def __init__(self, vocab_size, embed_dim=64):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, 128, batch_first=True)
        self.fc = nn.Linear(128, vocab_size)

    def forward(self, x):
        x = self.embed(x)
        x, _ = self.lstm(x)
        return self.fc(x)

model = SimpleLM(vocab_size)
criterion = nn.CrossEntropyLoss(ignore_index=0)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# === Training loop ===
for epoch in range(3):
    for x, y in loader:
        optimizer.zero_grad()
        logits = model(x)
        loss = criterion(logits.view(-1, vocab_size), y.view(-1))
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch+1} Loss: {loss.item():.4f}")
```

---

## **2️⃣ TensorFlow Example**

```python
import tensorflow as tf
import sentencepiece as spm

# === Load your trained tokenizer ===
sp = spm.SentencePieceProcessor()
sp.load("custom_tokenizer.model")
vocab_size = sp.get_piece_size()

# === Example dataset ===
texts = [
    "Hello world!",
    "TensorFlow integration with SentencePiece.",
    "Tokenizers are fun to build."
]

# Tokenize and prepare input/target sequences
def encode_text(t):
    ids = sp.encode(t, out_type=int)
    return ids[:-1], ids[1:]  # input, target

encoded = [encode_text(t) for t in texts]

# Pad sequences
def pad_sequences(sequences, pad_value=0):
    max_len = max(len(seq) for seq in sequences)
    return tf.constant([seq + [pad_value]*(max_len - len(seq)) for seq in sequences])

inputs = pad_sequences([inp for inp, _ in encoded])
targets = pad_sequences([tgt for _, tgt in encoded])

dataset = tf.data.Dataset.from_tensor_slices((inputs, targets)).batch(2)

# === Simple model ===
model = tf.keras.Sequential([
    tf.keras.layers.Embedding(vocab_size, 64, mask_zero=True),
    tf.keras.layers.LSTM(128, return_sequences=True),
    tf.keras.layers.Dense(vocab_size)
])

loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
model.compile(optimizer="adam", loss=loss_fn)

# === Training loop ===
model.fit(dataset, epochs=3)
```

---

## **How the `.model` Fits In**
- **Training phase**: Every time you load your dataset, you pass raw text through `sp.encode(...)` to get token IDs.
- **Inference phase**: You take user input, tokenize with the same `.model`, feed IDs to your model, then decode predictions back to text with `sp.decode(...)`.
- **Consistency**: The `.model` ensures that token IDs mean the same thing during training and inference — change the tokenizer, and you must retrain the model.

---

Alright Sepnet — let’s go full end‑to‑end so you can see exactly how the **custom SentencePiece tokenizer** we designed gets used in a **real training loop**, and how to **save and reload** both the model and tokenizer for later inference.

I’ll give you **two separate, self‑contained scripts**:

- **PyTorch version**
- **TensorFlow version**

Both will:
1. Train/load the tokenizer from `input.txt` (using our spec: SentencePiece BPE, byte‑fallback, NFKC normalization, vocab size 64k).
2. Tokenize a small dataset.
3. Train a tiny next‑token prediction model.
4. Save the model **and** tokenizer.
5. Reload them and run a quick inference.

---

## **1️⃣ PyTorch: Training + Save/Load + Inference**

```python
import os
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
    print("Tokenizer trained.")
else:
    print("Using existing tokenizer.")

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

    def forward(self, x):
        x = self.embed(x)
        x, _ = self.lstm(x)
        return self.fc(x)

model = SimpleLM(vocab_size)
criterion = nn.CrossEntropyLoss(ignore_index=0)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# === 5. TRAIN ===
for epoch in range(3):
    for x, y in loader:
        optimizer.zero_grad()
        logits = model(x)
        loss = criterion(logits.view(-1, vocab_size), y.view(-1))
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch+1} Loss: {loss.item():.4f}")

# === 6. SAVE MODEL + TOKENIZER ===
torch.save(model.state_dict(), MODEL_SAVE_PATH)
print(f"Model saved to {MODEL_SAVE_PATH}")
# Tokenizer is already in custom_tokenizer.model

# === 7. LOAD MODEL + TOKENIZER ===
loaded_model = SimpleLM(vocab_size)
loaded_model.load_state_dict(torch.load(MODEL_SAVE_PATH))
loaded_model.eval()
loaded_sp = spm.SentencePieceProcessor()
loaded_sp.load(f"{MODEL_PREFIX}.model")

# === 8. INFERENCE ===
test_text = "Tokenizers"
ids = loaded_sp.encode(test_text, out_type=int)
input_ids = torch.tensor(ids).unsqueeze(0)  # batch size 1
with torch.no_grad():
    logits = loaded_model(input_ids)
    next_id = torch.argmax(logits[0, -1]).item()
print(f"Input: {test_text}")
print(f"Predicted next token: {loaded_sp.id_to_piece(next_id)}")
```

---

## **2️⃣ TensorFlow: Training + Save/Load + Inference**

```python
import os
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
    print("Tokenizer trained.")
else:
    print("Using existing tokenizer.")

# === 2. LOAD TOKENIZER ===
sp = spm.SentencePieceProcessor()
sp.load(f"{MODEL_PREFIX}.model")
vocab_size = sp.get_piece_size()

# === 3. DATA PREP ===
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

# === 6. SAVE MODEL + TOKENIZER ===
model.save(MODEL_SAVE_DIR)
print(f"Model saved to {MODEL_SAVE_DIR}")
# Tokenizer is already in custom_tokenizer.model

# === 7. LOAD MODEL + TOKENIZER ===
loaded_model = tf.keras.models.load_model(MODEL_SAVE_DIR)
loaded_sp = spm.SentencePieceProcessor()
loaded_sp.load(f"{MODEL_PREFIX}.model")

# === 8. INFERENCE ===
test_text = "Tokenizers"
ids = loaded_sp.encode(test_text, out_type=int)
input_ids = tf.constant([ids])
logits = loaded_model(input_ids)
next_id = tf.argmax(logits[0, -1]).numpy()
print(f"Input: {test_text}")
print(f"Predicted next token: {loaded_sp.id_to_piece(int(next_id))}")
```

---

### **How This All Fits Together**
- **Tokenizer (`.model`)**: Always load the same file for both training and inference — it’s the “vocabulary + rules” your model understands.
- **Model**: Saved in PyTorch (`.pth`) or TensorFlow (`SavedModel` directory).
- **Workflow**:
  1. Tokenize raw text → token IDs.
  2. Train model on token IDs.
  3. Save both model and tokenizer.
  4. Reload both for inference.
  5. Tokenize new input, run model, decode predictions.

---

If you want, I can **extend these examples** to handle **streaming text generation** (predicting multiple tokens in sequence) so you can see the tokenizer and model working together in a loop to produce coherent output. That would make it a true mini‑LLM demo. Would you like me to prepare that next?
- A quick inference demo that takes raw text and predicts the next tokens

Do you want me to prepare that next so you have a full end‑to‑end workflow?

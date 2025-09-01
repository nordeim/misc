Perfect — let’s turn your streaming generation loop into a **full transparency mode** so you can literally watch the model think.  
We’ll hook into the logits at each step, extract the top‑k candidates, show their probabilities, and annotate the chosen token with the reason it was picked.

---

## **Extended Streaming Debug Code**

Below is a minimal but production‑style PyTorch example that works with any causal LM from Hugging Face (e.g., GPT‑2, LLaMA, MPT).  
It assumes you already have a tokenizer and model loaded.

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch.nn.functional as F

# --- Setup ---
model_name = "gpt2"  # or your fine-tuned model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
model.eval()

# --- Generation parameters ---
max_new_tokens = 20
temperature = 0.8
top_k = 5  # how many candidates to display

# --- Prompt ---
prompt = "Once upon a time"
input_ids = tokenizer.encode(prompt, return_tensors="pt")

# --- Streaming loop ---
for step in range(max_new_tokens):
    with torch.no_grad():
        outputs = model(input_ids)
        logits = outputs.logits  # shape: [batch, seq_len, vocab_size]

    # Focus on the last token's logits
    next_token_logits = logits[0, -1, :]

    # Apply temperature scaling
    scaled_logits = next_token_logits / temperature

    # Convert to probabilities
    probs = F.softmax(scaled_logits, dim=-1)

    # Get top-k candidates
    top_k_probs, top_k_ids = torch.topk(probs, top_k)
    top_k_logits = scaled_logits[top_k_ids]

    # Debug print
    print(f"\nStep {step+1}")
    print(f"Context so far: {tokenizer.decode(input_ids[0])}")
    print("Top candidates:")
    for rank, (tok_id, logit_val, prob_val) in enumerate(zip(top_k_ids, top_k_logits, top_k_probs), start=1):
        token_str = tokenizer.decode(tok_id.unsqueeze(0))
        print(f"  {rank}. '{token_str}' | logit={logit_val.item():.4f} | prob={prob_val.item():.4f}")

    # Choose next token (sampling here; swap for greedy if needed)
    chosen_id = torch.multinomial(probs, num_samples=1)

    chosen_token_str = tokenizer.decode(chosen_id)
    chosen_prob = probs[chosen_id].item()

    # Reason for choice
    if chosen_id.item() == top_k_ids[0].item():
        reason = "Chosen because it had the highest probability (greedy match)."
    else:
        reason = f"Chosen via sampling — probability {chosen_prob:.4f}."

    print(f"Chosen token: '{chosen_token_str}' → {reason}")

    # Append chosen token to input_ids
    input_ids = torch.cat([input_ids, chosen_id.unsqueeze(0)], dim=1)
```

---

## **What this does**

- **`logits` capture**: We grab the raw scores for the last position before softmax.
- **Temperature scaling**: Adjusts randomness by dividing logits by `temperature`.
- **Softmax**: Converts logits into probabilities.
- **Top‑k display**: Shows the top few candidates with their logits and probabilities.
- **Choice annotation**: Explains whether the token was picked because it was the most probable (greedy) or due to sampling randomness.
- **Streaming**: Prints the context and decision at each generation step.

---

## **Sample Output (abridged)**

```
Step 1
Context so far: Once upon a time
Top candidates:
  1. ' the' | logit=12.3456 | prob=0.4521
  2. ' in'  | logit=11.8765 | prob=0.3012
  3. ' there' | logit=10.9876 | prob=0.1234
  4. ' at'  | logit=10.5432 | prob=0.0789
  5. ' on'  | logit=10.1234 | prob=0.0444
Chosen token: ' the' → Chosen because it had the highest probability (greedy match).

Step 2
Context so far: Once upon a time the
...
```

---

## **Why this is powerful for you**
- You can **see the model’s internal preference ordering** at each step.
- You can **experiment with temperature, top‑k, and top‑p** and watch how the decision process changes.
- You can **debug odd generations** by checking if the model *wanted* to output something else but was overridden by sampling randomness.

---

If you want, I can **extend this further** so that:
- It **plots logits and probabilities** as a live bar chart for each step.
- It **streams tokens in real time** while still logging the debug info.

That would give you a **visual + textual** window into the model’s brain.  
Do you want me to build that next?

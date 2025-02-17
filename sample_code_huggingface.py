from huggingface_hub import InferenceClient

client = InferenceClient(
	provider="together",
	api_key="hf_xxxxxxxxxxxxxxxxxxxxxxxx"
)

messages = [
	{
		"role": "user",
		"content": "What is the capital of France?"
	}
]

completion = client.chat.completions.create(
    model="mistralai/Mistral-Small-24B-Instruct-2501", 
	messages=messages, 
	max_tokens=500,
)

print(completion.choices[0].message)

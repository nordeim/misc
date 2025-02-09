## create a new repository on the command line
echo "# RAG" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/nordeim/RAG.git
git push -u origin main

## push an existing repository from the command line
git remote add origin https://github.com/nordeim/RAG.git
git branch -M main
git push -u origin main

# https://www.youtube.com/watch?v=hOsZzcMYMLI
# https://www.datacamp.com/datalab/w/8653f44e-39a6-4f57-8962-22f6bda62e7a/edit (matthew de45)
!pip install ollama
!pip install langchain chromadb gradio 
!pip install -U langchain-community
!pip install pymupdf

# Import necessary packages
import ollama  # Enables interaction with local large language models (LLMs)
import gradio as gr  # Provides an easy-to-use web interface for the chatbot

# Document processing and retrieval  
from langchain_community.document_loaders import PyMuPDFLoader  # Extracts text from PDF files for processing
from langchain.text_splitter import RecursiveCharacterTextSplitter  # Splits text into smaller chunks for better embedding and retrieval
from langchain.vectorstores import Chroma  # Handles storage and retrieval of vector embeddings using ChromaDB

# Embedding generation  
from langchain_community.embeddings import OllamaEmbeddings  # Converts text into numerical vectors using Ollama's embedding model

import re  # Provides tools for working with regular expressions, useful for text cleaning and pattern matching

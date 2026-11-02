# Lost and Found AI - Deep Learning Module

## Project Overview

This module uses Artificial Intelligence and Deep Learning to identify possible matches between lost and found items.

The system processes the lost item image, extracts visual features using CLIP, compares it with found-item images, and ranks the most similar items.

## Technologies Used

- Python
- OpenCV
- NumPy
- PyTorch
- Hugging Face Transformers
- CLIP (OpenAI ViT-B/32)
- Cosine Similarity

## AI Workflow

Lost Item Image
        ↓
OpenCV Preprocessing
        ↓
CLIP Image Embedding
        ↓
Category Filtering
        ↓
Compare with Found Images
        ↓
Cosine Similarity
        ↓
Rank Similar Items
        ↓
Possible Match

## Dataset

The current test dataset contains 5 categories:

- Bag
- Book
- Key
- Phone
- Earphone

Total test images: 2285

## AI Model

A pretrained CLIP model (`openai/clip-vit-base-patch32`) is used to generate 512-dimensional image embeddings.

The embeddings are normalized and compared using cosine similarity.

## Matching

The system:

1. Takes a lost item image and category.
2. Generates the lost image embedding using CLIP.
3. Filters found items using the same category.
4. Generates embeddings for the found images.
5. Calculates cosine similarity.
6. Sorts the results from highest to lowest similarity.
7. Marks candidates above the experimental threshold as possible matches.

## Evaluation

A category-level evaluation was performed using:

- 25 positive pairs
- 25 negative pairs
- 50 total image pairs

The best tested threshold was 0.65, with:

- Accuracy: 92%
- Precision: 95.65%
- Recall: 88%
- F1 Score: 91.67%

This evaluation measures category-level similarity and does not represent verified same-item matching accuracy.

## Project Structure

LostFound_AI/
│
├── dataset/
│   ├── train/
│   ├── validation/
│   └── test/
│
├── models/
│
├── src/
│   ├── preprocessing.py
│   ├── clip_features.py
│   ├── similarity.py
│   ├── match_score.py
│   ├── evaluate.py
│   ├── rank_matches.py
│   ├── predict.py
│   └── user_input.py
│
├── results/
├── requirements.txt
└── README.md

## Current Status

The core AI matching pipeline has been implemented and tested.

The system can accept a lost item image and category, compare it with the available found-item images, and return ranked possible matches.
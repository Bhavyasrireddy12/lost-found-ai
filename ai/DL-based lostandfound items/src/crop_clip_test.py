from clip_features import get_image_embedding

print("Loading detected object crop...")

image_path = "results/detected_crop_1.jpg"

embedding = get_image_embedding(image_path)

print("\n==============================")
print("CLIP CROP EMBEDDING")
print("==============================")
print("Image:", image_path)
print("Embedding shape:", embedding.shape)
print("CLIP embedding generated successfully!")
from clip_features import get_image_embedding
import torch

# Lost item image
lost_image = "dataset/test/phone/phone0.jpg"

# Object detected from CCTV
cctv_crop = "results/detected_crop_1.jpg"

print("Generating CLIP embedding for lost item...")
lost_embedding = get_image_embedding(lost_image)

print("Generating CLIP embedding for CCTV object...")
cctv_embedding = get_image_embedding(cctv_crop)

# Cosine similarity
similarity = torch.sum(
    lost_embedding * cctv_embedding,
    dim=-1
).item()

print("\n================================")
print("       CCTV MATCH RESULT")
print("================================")
print("Lost Image:", lost_image)
print("CCTV Crop:", cctv_crop)
print("Similarity:", round(similarity * 100, 2), "%")

if similarity >= 0.65:
    print("Result: POSSIBLE MATCH")
else:
    print("Result: LOW MATCH")
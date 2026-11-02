from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

print("Loading CLIP model...")

# Load CLIP model from local cache
model = CLIPModel.from_pretrained(
    "openai/clip-vit-base-patch32",
    local_files_only=True
)

# Load CLIP processor from local cache
processor = CLIPProcessor.from_pretrained(
    "openai/clip-vit-base-patch32",
    local_files_only=True
)

print("CLIP model loaded successfully!")


def get_image_embedding(image_path):

    image = Image.open(
        image_path
    ).convert("RGB")

    inputs = processor(
        images=image,
        return_tensors="pt"
    )

    with torch.no_grad():

        vision_output = model.vision_model(
            pixel_values=inputs["pixel_values"]
        )

        image_features = (
            vision_output.pooler_output
        )

        image_features = model.visual_projection(
            image_features
        )

    # Normalize embedding
    image_features = (
        image_features /
        image_features.norm(
            dim=-1,
            keepdim=True
        )
    )

    return image_features


def get_text_embedding(text):

    inputs = processor(
        text=text,
        return_tensors="pt",
        padding=True
    )

    with torch.no_grad():

        text_output = model.text_model(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"]
        )

        text_features = (
            text_output.pooler_output
        )

        text_features = model.text_projection(
            text_features
        )

    # Normalize embedding
    text_features = (
        text_features /
        text_features.norm(
            dim=-1,
            keepdim=True
        )
    )

    return text_features


# Test CLIP
if __name__ == "__main__":

    image_path = (
        "dataset/test/phone/phone0.jpg"
    )

    embedding = get_image_embedding(
        image_path
    )

    print("\n================================")
    print("       CLIP IMAGE TEST")
    print("================================")

    print(
        "Image:",
        image_path
    )

    print(
        "Image embedding shape:",
        embedding.shape
    )

    print(
        "CLIP image embedding generated successfully!"
    )

    # Text test
    text = "black mobile phone"

    text_embedding = get_text_embedding(
        text
    )

    print("\n================================")
    print("       CLIP TEXT TEST")
    print("================================")

    print(
        "Text:",
        text
    )

    print(
        "Text embedding shape:",
        text_embedding.shape
    )

    print(
        "CLIP text embedding generated successfully!"
    )
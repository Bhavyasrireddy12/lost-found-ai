import os
import cv2

from ultralytics import YOLO

from src.similarity import image_similarity
from src.match_score import text_similarity, category_similarity
from src.context_score import calculate_context_score


# =====================================================
# LOAD YOLO MODEL
# =====================================================

YOLO_MODEL = "runs/detect/train-3/weights/best.pt"

print("Loading YOLO model...")

model = YOLO(YOLO_MODEL)

print("YOLO model loaded successfully!")


# =====================================================
# OPENCV IMAGE PREPROCESSING
# =====================================================

def preprocess_image(image_path):
    """
    OpenCV preprocessing before YOLO.

    Steps:
    1. Read image
    2. Resize image
    3. Denoise image
    4. Improve brightness and contrast
    5. Save processed image
    """

    print("\nSTEP 0: OpenCV Image Preprocessing")

    # -------------------------------------------------
    # Read image
    # -------------------------------------------------

    image = cv2.imread(image_path)

    if image is None:
        print("ERROR: OpenCV could not load image.")
        print("Image path:", image_path)

        return None

    print("Original image loaded successfully.")

    # -------------------------------------------------
    # Get original dimensions
    # -------------------------------------------------

    height, width = image.shape[:2]

    print(
        "Original size:",
        width,
        "x",
        height
    )

    # -------------------------------------------------
    # Resize image
    # -------------------------------------------------

    target_width = 640
    target_height = 640

    processed = cv2.resize(
        image,
        (target_width, target_height),
        interpolation=cv2.INTER_AREA
    )

    print(
        "Image resized to:",
        target_width,
        "x",
        target_height
    )

    # -------------------------------------------------
    # Noise removal
    # -------------------------------------------------

    processed = cv2.GaussianBlur(
        processed,
        (3, 3),
        0
    )

    print("Noise reduction completed.")

    # -------------------------------------------------
    # Brightness and contrast enhancement
    # -------------------------------------------------

    lab = cv2.cvtColor(
        processed,
        cv2.COLOR_BGR2LAB
    )

    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    enhanced_l = clahe.apply(l_channel)

    enhanced_lab = cv2.merge(
        (
            enhanced_l,
            a_channel,
            b_channel
        )
    )

    processed = cv2.cvtColor(
        enhanced_lab,
        cv2.COLOR_LAB2BGR
    )

    print("Brightness and contrast enhancement completed.")

    # -------------------------------------------------
    # Save processed image
    # -------------------------------------------------

    os.makedirs(
        "results",
        exist_ok=True
    )

    processed_path = (
        "results/opencv_preprocessed.jpg"
    )

    success = cv2.imwrite(
        processed_path,
        processed
    )

    if not success:
        print(
            "ERROR: Could not save OpenCV processed image."
        )

        return None

    print(
        "OpenCV processed image saved:",
        processed_path
    )

    return processed_path


# =====================================================
# YOLO DETECTION
# =====================================================

def detect_and_crop(image_path):

    print("\nSTEP 1: YOLO Detection")

    # -------------------------------------------------
    # OpenCV preprocessing
    # -------------------------------------------------

    processed_path = preprocess_image(
        image_path
    )

    if processed_path is None:
        return None, None

    # -------------------------------------------------
    # Read processed image
    # -------------------------------------------------

    image = cv2.imread(
        processed_path
    )

    if image is None:
        print(
            "ERROR: Processed image could not be loaded."
        )

        return None, None

    print(
        "Processed image loaded for YOLO."
    )

    # -------------------------------------------------
    # YOLO prediction
    # -------------------------------------------------

    results = model(
        image,
        imgsz=640,
        conf=0.25,
        verbose=False
    )

    best_crop = None
    best_class = None
    best_confidence = 0.0

    # -------------------------------------------------
    # Find best detection
    # -------------------------------------------------

    for result in results:

        if result.boxes is None:
            continue

        for box in result.boxes:

            confidence = float(
                box.conf[0]
            )

            class_id = int(
                box.cls[0]
            )

            if confidence > best_confidence:

                x1, y1, x2, y2 = (
                    box.xyxy[0].tolist()
                )

                x1 = max(
                    0,
                    int(x1)
                )

                y1 = max(
                    0,
                    int(y1)
                )

                x2 = min(
                    image.shape[1],
                    int(x2)
                )

                y2 = min(
                    image.shape[0],
                    int(y2)
                )

                crop = image[
                    y1:y2,
                    x1:x2
                ]

                if crop.size == 0:
                    continue

                best_crop = crop

                best_class = (
                    model.names[class_id]
                )

                best_confidence = (
                    confidence
                )

    # -------------------------------------------------
    # No object detected
    # -------------------------------------------------

    if best_crop is None:

        print(
            "No object detected by YOLO."
        )

        print(
            "Continuing with OpenCV processed image."
        )

        return processed_path, None

    # -------------------------------------------------
    # Save detected crop
    # -------------------------------------------------

    os.makedirs(
        "results",
        exist_ok=True
    )

    crop_path = (
        "results/pipeline_crop.jpg"
    )

    cv2.imwrite(
        crop_path,
        best_crop
    )

    print("\nObject detected:")

    print(
        "Category:",
        best_class
    )

    print(
        "Confidence:",
        round(
            best_confidence * 100,
            2
        ),
        "%"
    )

    print(
        "Crop saved:",
        crop_path
    )

    return (
        crop_path,
        best_class
    )


# =====================================================
# COMPLETE AI MATCHING PIPELINE
# =====================================================

def run_ai_pipeline(
    lost_image,
    found_image,
    lost_description,
    found_description,
    lost_category,
    found_category,
    lost_location,
    found_location,
    lost_time,
    found_time
):

    print("\n================================")
    print("       AI MATCHING PIPELINE")
    print("================================")

    # =================================================
    # STEP 1 - OPENCV + YOLO
    # =================================================

    lost_crop, detected_category = (
        detect_and_crop(
            lost_image
        )
    )

    if lost_crop is None:

        print(
            "ERROR: Lost image could not be processed."
        )

        return None

    # =================================================
    # STEP 2 - IMAGE SIMILARITY
    # =================================================

    print("\nSTEP 2: Image Similarity")

    try:

        image_score = image_similarity(
            lost_crop,
            found_image
        )

        print(
            "Image Score:",
            round(
                image_score,
                4
            )
        )

    except Exception as error:

        print(
            "Image similarity error:",
            str(error)
        )

        image_score = 0.0

    # =================================================
    # STEP 3 - TEXT SIMILARITY
    # =================================================

    print("\nSTEP 3: Text Similarity")

    try:

        text_score = text_similarity(
            lost_description,
            found_description
        )

        print(
            "Text Score:",
            round(
                text_score,
                4
            )
        )

    except Exception as error:

        print(
            "Text similarity error:",
            str(error)
        )

        text_score = 0.0

    # =================================================
    # STEP 4 - CATEGORY SIMILARITY
    # =================================================

    print("\nSTEP 4: Category Similarity")

    category_score = category_similarity(
        lost_category,
        found_category
    )

    print(
        "Category Score:",
        round(
            category_score,
            4
        )
    )

    # =================================================
    # STEP 5 - LOCATION + TIME
    # =================================================

    print("\nSTEP 5: Context Similarity")

    try:

        location_score, time_score = (
            calculate_context_score(
                lost_location,
                found_location,
                lost_time,
                found_time
            )
        )

        print(
            "Location Score:",
            round(
                location_score,
                4
            )
        )

        print(
            "Time Score:",
            round(
                time_score,
                4
            )
        )

    except Exception as error:

        print(
            "Context similarity error:",
            str(error)
        )

        location_score = 0.0
        time_score = 0.0

    # =================================================
    # STEP 6 - FINAL SCORE
    # =================================================

    print("\nSTEP 6: Final Score")

    if category_score == 0:

        final_score = 0.0

    else:

        final_score = (

            0.50 * image_score

            +

            0.20 * text_score

            +

            0.10 * category_score

            +

            0.10 * location_score

            +

            0.10 * time_score

        )

    # =================================================
    # STEP 7 - RESULT
    # =================================================

    threshold = 0.70

    if category_score == 0:

        result = "DIFFERENT CATEGORY"

    elif final_score >= threshold:

        result = "POSSIBLE MATCH"

    else:

        result = "LOW MATCH"

    # =================================================
    # PRINT FINAL RESULT
    # =================================================

    print("\n================================")
    print("           AI RESULT")
    print("================================")

    print(
        "Detected Category:",
        detected_category
    )

    print(
        "Image Score:",
        round(
            image_score,
            4
        )
    )

    print(
        "Text Score:",
        round(
            text_score,
            4
        )
    )

    print(
        "Category Score:",
        round(
            category_score,
            4
        )
    )

    print(
        "Location Score:",
        round(
            location_score,
            4
        )
    )

    print(
        "Time Score:",
        round(
            time_score,
            4
        )
    )

    print(
        "Final Score:",
        round(
            final_score,
            4
        )
    )

    print(
        "Result:",
        result
    )

    print("================================")

    # =================================================
    # RETURN RESULT
    # =================================================

    return {

        "detected_category":
            detected_category,

        "image_score":
            image_score,

        "text_score":
            text_score,

        "category_score":
            category_score,

        "location_score":
            location_score,

        "time_score":
            time_score,

        "final_score":
            final_score,

        "result":
            result
    }


# =====================================================
# DIRECT TEST
# =====================================================

if __name__ == "__main__":

    run_ai_pipeline(

        lost_image=
            "dataset/test/phone/phone0.jpg",

        found_image=
            "yolo_dataset/images/val/phone0.jpg",

        lost_description=
            "black mobile phone",

        found_description=
            "blue smartphone with case",

        lost_category=
            "phone",

        found_category=
            "phone",

        lost_location=
            "College Library",

        found_location=
            "College Library",

        lost_time=
            "2026-10-03 10:00",

        found_time=
            "2026-10-03 11:00"
    )
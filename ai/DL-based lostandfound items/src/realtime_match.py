import cv2
import torch
import os
import csv
from datetime import datetime
from ultralytics import YOLO
from clip_features import get_image_embedding


# ============================================================
# SETTINGS
# ============================================================

YOLO_MODEL = "runs/detect/train-3/weights/best.pt"

# CHANGE THESE TWO LINES FOR DIFFERENT LOST ITEMS
lost_image = "dataset/test/earphone/earphone1.jpg"
lost_category = "earphone"

# Best tested threshold
MATCH_THRESHOLD = 0.65

# CLIP runs once every 10 frames
CLIP_INTERVAL = 10

# Object must disappear for this many frames
# before a new match event can be created
MATCH_RESET_FRAMES = 30


# ============================================================
# RESULT FOLDERS
# ============================================================

os.makedirs(
    "results/matches",
    exist_ok=True
)


# ============================================================
# MATCH HISTORY CSV
# ============================================================

history_file = "results/match_history.csv"


if not os.path.exists(history_file):

    with open(
        history_file,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow([
            "Date",
            "Time",
            "Lost Item",
            "Detected Item",
            "YOLO Confidence",
            "CLIP Similarity",
            "Status",
            "Screenshot"
        ])


# ============================================================
# LOAD YOLO MODEL
# ============================================================

print("\n==========================================")
print("       AI LOST & FOUND SYSTEM")
print("==========================================")

print("Loading custom YOLO model...")

model = YOLO(
    YOLO_MODEL
)

print("YOLO model loaded successfully!")


# ============================================================
# LOST ITEM
# ============================================================

print(
    "Lost item category:",
    lost_category
)

print(
    "Generating lost item CLIP embedding..."
)

lost_embedding = get_image_embedding(
    lost_image
)

print(
    "Lost item embedding generated!"
)


# ============================================================
# START CAMERA
# ============================================================

print("\nStarting real-time monitoring...")

print(
    "Detecting all 5 categories:"
)

print(
    "bag, book, key, phone, earphone"
)

print(
    "Matching only:",
    lost_category
)

print(
    "Press Q to stop."
)


cap = cv2.VideoCapture(
    0,
    cv2.CAP_DSHOW
)

print(
    "Camera opened:",
    cap.isOpened()
)


if not cap.isOpened():

    print(
        "ERROR: Camera could not be opened."
    )

    exit()


# ============================================================
# VARIABLES
# ============================================================

frame_count = 0

last_similarity = 0.0

last_status = "SCANNING..."

last_category = "Waiting..."

last_confidence = 0.0

alert_cooldown = 0

# ============================================================
# MATCH EVENT CONTROL
# ============================================================

# False = no match event currently active
# True  = screenshot already saved for current event
match_event_active = False

# Counts frames where no object is detected
no_detection_frames = 0


# ============================================================
# DRAW PROGRESS BAR
# ============================================================

def draw_progress_bar(
    frame,
    x,
    y,
    width,
    height,
    value
):

    value = max(
        0.0,
        min(1.0, value)
    )

    # Background
    cv2.rectangle(
        frame,
        (x, y),
        (
            x + width,
            y + height
        ),
        (45, 45, 45),
        -1
    )

    filled_width = int(
        width * value
    )

    if value >= MATCH_THRESHOLD:

        bar_color = (
            80,
            220,
            120
        )

    else:

        bar_color = (
            80,
            150,
            220
        )

    if filled_width > 0:

        cv2.rectangle(
            frame,
            (x, y),
            (
                x + filled_width,
                y + height
            ),
            bar_color,
            -1
        )

    cv2.rectangle(
        frame,
        (x, y),
        (
            x + width,
            y + height
        ),
        (100, 100, 100),
        1
    )


# ============================================================
# SAVE MATCH HISTORY
# ============================================================

def save_match_history(
    lost_item,
    detected_item,
    yolo_confidence,
    clip_similarity,
    status,
    screenshot_path
):

    now = datetime.now()

    date_value = now.strftime(
        "%Y-%m-%d"
    )

    time_value = now.strftime(
        "%H:%M:%S"
    )

    with open(
        history_file,
        "a",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow([
            date_value,
            time_value,
            lost_item,
            detected_item,
            f"{yolo_confidence * 100:.2f}%",
            f"{clip_similarity * 100:.2f}%",
            status,
            screenshot_path
        ])


# ============================================================
# REAL-TIME LOOP
# ============================================================

while True:

    # --------------------------------------------------------
    # READ CAMERA
    # --------------------------------------------------------

    ret, frame = cap.read()

    if not ret:

        print(
            "ERROR: Could not read frame."
        )

        break


    frame_count += 1

    height, width = frame.shape[:2]


    # ========================================================
    # ALERT COOLDOWN
    # ========================================================

    if alert_cooldown > 0:

        alert_cooldown -= 1


    # ========================================================
    # YOLO DETECTION
    # ========================================================

    results = model(
        frame,
        verbose=False
    )


    best_box = None

    best_confidence = 0.0

    best_category = None


    # ========================================================
    # FIND STRONGEST DETECTION
    # ========================================================

    for result in results:

        if result.boxes is None:

            continue


        for box in result.boxes:

            confidence = float(
                box.conf[0]
            )


            # YOLO minimum confidence
            if confidence < 0.50:

                continue


            class_id = int(
                box.cls[0]
            )


            object_name = model.names[
                class_id
            ]


            # Keep highest-confidence object
            if confidence > best_confidence:

                best_confidence = confidence

                best_category = object_name


                x1, y1, x2, y2 = (
                    box.xyxy[0].tolist()
                )


                best_box = (
                    int(x1),
                    int(y1),
                    int(x2),
                    int(y2)
                )


    # ========================================================
    # OBJECT DETECTED
    # ========================================================

    if best_box is not None:

        # Object is present
        no_detection_frames = 0


        x1, y1, x2, y2 = best_box


        last_category = best_category

        last_confidence = best_confidence


        # ----------------------------------------------------
        # BOX COLOR
        # ----------------------------------------------------

        if (
            best_category.lower()
            == lost_category.lower()
        ):

            box_color = (
                80,
                220,
                120
            )

        else:

            box_color = (
                80,
                150,
                220
            )


        # ----------------------------------------------------
        # DRAW BOUNDING BOX
        # ----------------------------------------------------

        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            box_color,
            2
        )


        # ----------------------------------------------------
        # YOLO LABEL
        # ----------------------------------------------------

        label = (
            f"{best_category.upper()} "
            f"{best_confidence * 100:.1f}%"
        )


        label_y = max(
            30,
            y1 - 10
        )


        cv2.rectangle(
            frame,
            (
                x1,
                label_y - 25
            ),
            (
                x1 + 190,
                label_y
            ),
            box_color,
            -1
        )


        cv2.putText(
            frame,
            label,
            (
                x1 + 5,
                label_y - 7
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (10, 10, 10),
            1,
            cv2.LINE_AA
        )


        # ====================================================
        # CLIP MATCHING
        # ====================================================

        if (
            best_category.lower()
            == lost_category.lower()
        ):


            if frame_count % CLIP_INTERVAL == 0:

                cropped_object = frame[
                    max(0, y1):min(height, y2),
                    max(0, x1):min(width, x2)
                ]


                if cropped_object.size != 0:

                    crop_path = (
                        "results/live_crop.jpg"
                    )


                    cv2.imwrite(
                        crop_path,
                        cropped_object
                    )


                    print(
                        "\nRunning CLIP matching..."
                    )


                    try:

                        # ========================================
                        # CLIP EMBEDDING
                        # ========================================

                        found_embedding = (
                            get_image_embedding(
                                crop_path
                            )
                        )


                        # ========================================
                        # COSINE SIMILARITY
                        # ========================================

                        similarity = torch.sum(
                            lost_embedding
                            * found_embedding,
                            dim=-1
                        ).item()


                        last_similarity = similarity


                        # ========================================
                        # POSSIBLE MATCH
                        # ========================================

                        if (
                            similarity
                            >= MATCH_THRESHOLD
                        ):

                            last_status = (
                                "POSSIBLE MATCH"
                            )


                            # ====================================
                            # SAVE ONLY ONCE
                            # ====================================

                            if not match_event_active:

                                timestamp = (
                                    datetime.now()
                                    .strftime(
                                        "%Y%m%d_%H%M%S"
                                    )
                                )


                                match_filename = (
                                    "results/matches/"
                                    f"match_"
                                    f"{lost_category}_"
                                    f"{timestamp}.jpg"
                                )


                                # ------------------------------
                                # SAVE SCREENSHOT
                                # ------------------------------

                                cv2.imwrite(
                                    match_filename,
                                    frame
                                )


                                print(
                                    "\n📸 MATCH SCREENSHOT SAVED"
                                )


                                print(
                                    match_filename
                                )


                                # ------------------------------
                                # SAVE CSV HISTORY
                                # ------------------------------

                                save_match_history(
                                    lost_category,
                                    best_category,
                                    best_confidence,
                                    similarity,
                                    "POSSIBLE MATCH",
                                    match_filename
                                )


                                print(
                                    "🧾 MATCH HISTORY UPDATED"
                                )


                                print(
                                    history_file
                                )


                                # Lock current event
                                match_event_active = True


                            # ====================================
                            # ALERT
                            # ====================================

                            if alert_cooldown == 0:

                                print(
                                    "\n"
                                    + "=" * 48
                                )

                                print(
                                    "       🚨 POSSIBLE MATCH DETECTED"
                                )

                                print(
                                    "=" * 48
                                )

                                print(
                                    f"Lost Item       : "
                                    f"{lost_category}"
                                )

                                print(
                                    f"Detected Item   : "
                                    f"{best_category}"
                                )

                                print(
                                    f"YOLO Confidence : "
                                    f"{best_confidence * 100:.2f}%"
                                )

                                print(
                                    f"CLIP Similarity : "
                                    f"{similarity * 100:.2f}%"
                                )

                                print(
                                    "Status          : "
                                    "POSSIBLE MATCH"
                                )

                                print(
                                    "=" * 48
                                )


                                alert_cooldown = 50


                        # ========================================
                        # LOW MATCH
                        # ========================================

                        else:

                            last_status = (
                                "LOW MATCH"
                            )


                            print(
                                f"Match: "
                                f"{similarity * 100:.2f}% "
                                f"| Status: LOW MATCH"
                            )

                            # IMPORTANT:
                            # Do NOT reset match_event_active here.
                            #
                            # A temporary low CLIP score should
                            # NOT create another screenshot for
                            # the same physical object.


                    except Exception as e:

                        print(
                            "CLIP error:",
                            e
                        )


        # ====================================================
        # DISPLAY CLIP RESULT
        # ====================================================

        if (
            best_category.lower()
            == lost_category.lower()
        ):

            match_text = (
                f"CLIP: "
                f"{last_similarity * 100:.1f}%"
            )


            cv2.putText(
                frame,
                match_text,
                (
                    x1,
                    min(
                        height - 50,
                        y2 + 25
                    )
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (255, 255, 255),
                2,
                cv2.LINE_AA
            )


            cv2.putText(
                frame,
                last_status,
                (
                    x1,
                    min(
                        height - 20,
                        y2 + 50
                    )
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.65,
                box_color,
                2,
                cv2.LINE_AA
            )


    # ========================================================
    # NO OBJECT DETECTED
    # ========================================================

    else:

        last_category = "No object"

        last_confidence = 0.0

        last_status = "SCANNING..."


        # Count frames with no object
        no_detection_frames += 1


        # ----------------------------------------------------
        # RESET MATCH EVENT
        # ----------------------------------------------------

        if (
            no_detection_frames
            >= MATCH_RESET_FRAMES
        ):

            match_event_active = False


    # ========================================================
    # TOP HEADER
    # ========================================================

    cv2.rectangle(
        frame,
        (0, 0),
        (width, 70),
        (15, 15, 15),
        -1
    )


    cv2.putText(
        frame,
        "AI LOST & FOUND",
        (20, 32),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.85,
        (255, 255, 255),
        2,
        cv2.LINE_AA
    )


    cv2.putText(
        frame,
        "REAL-TIME AI SCANNER",
        (23, 55),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (160, 160, 160),
        1,
        cv2.LINE_AA
    )


    # LIVE indicator

    cv2.circle(
        frame,
        (width - 35, 27),
        7,
        (80, 220, 120),
        -1
    )


    cv2.putText(
        frame,
        "LIVE",
        (width - 75, 33),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.45,
        (100, 220, 130),
        1,
        cv2.LINE_AA
    )


    # ========================================================
    # RIGHT INFORMATION PANEL
    # ========================================================

    panel_width = 300

    panel_x = width - panel_width


    cv2.rectangle(
        frame,
        (panel_x, 70),
        (width, height - 40),
        (20, 20, 20),
        -1
    )


    px = panel_x + 20


    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    cv2.putText(
        frame,
        "MATCH ANALYSIS",
        (px, 105),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (210, 210, 210),
        1,
        cv2.LINE_AA
    )


    cv2.line(
        frame,
        (px, 120),
        (width - 20, 120),
        (70, 70, 70),
        1
    )


    # --------------------------------------------------------
    # LOST ITEM
    # --------------------------------------------------------

    cv2.putText(
        frame,
        "LOST ITEM",
        (px, 155),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (130, 130, 130),
        1,
        cv2.LINE_AA
    )


    cv2.putText(
        frame,
        lost_category.upper(),
        (px, 182),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA
    )


    # --------------------------------------------------------
    # DETECTED OBJECT
    # --------------------------------------------------------

    cv2.putText(
        frame,
        "DETECTED OBJECT",
        (px, 220),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (130, 130, 130),
        1,
        cv2.LINE_AA
    )


    cv2.putText(
        frame,
        last_category.upper(),
        (px, 247),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA
    )


    # YOLO confidence

    cv2.putText(
        frame,
        f"YOLO: "
        f"{last_confidence * 100:.1f}%",
        (px, 278),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.45,
        (160, 160, 160),
        1,
        cv2.LINE_AA
    )


    # --------------------------------------------------------
    # CLIP SIMILARITY
    # --------------------------------------------------------

    cv2.putText(
        frame,
        "CLIP SIMILARITY",
        (px, 330),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (130, 130, 130),
        1,
        cv2.LINE_AA
    )


    cv2.putText(
        frame,
        f"{last_similarity * 100:.1f}%",
        (px, 365),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.95,
        (255, 255, 255),
        2,
        cv2.LINE_AA
    )


    draw_progress_bar(
        frame,
        px,
        380,
        panel_width - 40,
        12,
        last_similarity
    )


    cv2.putText(
        frame,
        "MATCH THRESHOLD: 65%",
        (px, 420),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.38,
        (120, 120, 120),
        1,
        cv2.LINE_AA
    )


    # --------------------------------------------------------
    # DECISION
    # --------------------------------------------------------

    cv2.putText(
        frame,
        "DECISION",
        (px, 470),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (130, 130, 130),
        1,
        cv2.LINE_AA
    )


    if last_status == "POSSIBLE MATCH":

        status_color = (
            80,
            220,
            120
        )

    elif last_status == "LOW MATCH":

        status_color = (
            80,
            150,
            220
        )

    else:

        status_color = (
            180,
            180,
            180
        )


    cv2.putText(
        frame,
        last_status,
        (px, 505),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.58,
        status_color,
        2,
        cv2.LINE_AA
    )


    # ========================================================
    # BOTTOM STATUS BAR
    # ========================================================

    bottom_y = height - 40


    cv2.rectangle(
        frame,
        (0, bottom_y),
        (width, height),
        (12, 12, 12),
        -1
    )


    cv2.putText(
        frame,
        "YOLO OK",
        (20, height - 14),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (150, 220, 170),
        1,
        cv2.LINE_AA
    )


    cv2.putText(
        frame,
        "CLIP OK",
        (100, height - 14),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (150, 220, 170),
        1,
        cv2.LINE_AA
    )


    cv2.putText(
        frame,
        "CAMERA OK",
        (180, height - 14),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (150, 220, 170),
        1,
        cv2.LINE_AA
    )


    cv2.putText(
        frame,
        "THRESHOLD 65%",
        (280, height - 14),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (180, 180, 180),
        1,
        cv2.LINE_AA
    )


    cv2.putText(
        frame,
        "Q = EXIT",
        (width - 85, height - 14),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.42,
        (180, 180, 180),
        1,
        cv2.LINE_AA
    )


    # ========================================================
    # SHOW CAMERA
    # ========================================================

    cv2.imshow(
        "AI Lost & Found - Real-Time Scanner",
        frame
    )


    # ========================================================
    # PRESS Q
    # ========================================================

    key = cv2.waitKey(1) & 0xFF


    if key == ord("q") or key == ord("Q"):

        break


# ============================================================
# CLEANUP
# ============================================================

cap.release()

cv2.destroyAllWindows()


print("\n==========================================")
print("       MONITORING STOPPED")
print("==========================================")

print(
    f"Match history: {history_file}"
)
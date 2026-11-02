from similarity import image_similarity
import os
import random


# ==========================================
# DATASET
# ==========================================

base_path = "dataset/test"

categories = [
    "bag",
    "book",
    "key",
    "phone",
    "earphone"
]


# ==========================================
# LOAD IMAGES
# ==========================================

image_files = {}

for category in categories:

    folder = os.path.join(
        base_path,
        category
    )

    files = []

    for filename in os.listdir(folder):

        if filename.lower().endswith(
            (".jpg", ".jpeg", ".png")
        ):

            files.append(
                os.path.join(
                    folder,
                    filename
                )
            )

    image_files[category] = files

    print(
        category,
        ":",
        len(files),
        "images"
    )


# ==========================================
# CREATE EVALUATION PAIRS
# ==========================================

random.seed(42)

pairs = []


# ------------------------------------------
# POSITIVE PAIRS
# Same category
# ------------------------------------------

for category in categories:

    files = image_files[category]

    for i in range(5):

        image1, image2 = random.sample(
            files,
            2
        )

        pairs.append(
            (
                image1,
                image2,
                1
            )
        )


# ------------------------------------------
# NEGATIVE PAIRS
# Different categories
# ------------------------------------------

for i in range(25):

    category1, category2 = random.sample(
        categories,
        2
    )

    image1 = random.choice(
        image_files[category1]
    )

    image2 = random.choice(
        image_files[category2]
    )

    pairs.append(
        (
            image1,
            image2,
            0
        )
    )


print(
    "\nTotal evaluation pairs:",
    len(pairs)
)

print(
    "Positive pairs:",
    25
)

print(
    "Negative pairs:",
    25
)


# ==========================================
# CALCULATE SIMILARITY
# ==========================================

scores = []

print(
    "\n===== CALCULATING SCORES ====="
)


for index, (
    image1,
    image2,
    actual_label
) in enumerate(
    pairs,
    start=1
):

    score = image_similarity(
        image1,
        image2
    )

    scores.append(
        (
            score,
            actual_label
        )
    )

    if index % 10 == 0:

        print(
            "Processed:",
            index,
            "/",
            len(pairs)
        )


# ==========================================
# THRESHOLD TESTING
# ==========================================

thresholds = [
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80
]


print(
    "\n===== THRESHOLD EVALUATION ====="
)


best_threshold = 0
best_accuracy = 0
best_f1 = 0


for threshold in thresholds:

    TP = 0
    TN = 0
    FP = 0
    FN = 0


    for score, actual_label in scores:

        if score >= threshold:

            predicted_label = 1

        else:

            predicted_label = 0


        if (
            actual_label == 1
            and predicted_label == 1
        ):

            TP += 1

        elif (
            actual_label == 0
            and predicted_label == 0
        ):

            TN += 1

        elif (
            actual_label == 0
            and predicted_label == 1
        ):

            FP += 1

        elif (
            actual_label == 1
            and predicted_label == 0
        ):

            FN += 1


    # ======================================
    # METRICS
    # ======================================

    total = TP + TN + FP + FN

    accuracy = (
        (TP + TN) / total
    )


    if TP + FP > 0:

        precision = (
            TP / (TP + FP)
        )

    else:

        precision = 0


    if TP + FN > 0:

        recall = (
            TP / (TP + FN)
        )

    else:

        recall = 0


    if precision + recall > 0:

        f1_score = (
            2 * precision * recall
            / (precision + recall)
        )

    else:

        f1_score = 0


    # ======================================
    # DISPLAY
    # ======================================

    print(
        "\n------------------------------"
    )

    print(
        "Threshold:",
        threshold
    )

    print(
        "Accuracy:",
        round(
            accuracy * 100,
            2
        ),
        "%"
    )

    print(
        "Precision:",
        round(
            precision * 100,
            2
        ),
        "%"
    )

    print(
        "Recall:",
        round(
            recall * 100,
            2
        ),
        "%"
    )

    print(
        "F1 Score:",
        round(
            f1_score * 100,
            2
        ),
        "%"
    )

    print(
        "TP:",
        TP
    )

    print(
        "TN:",
        TN
    )

    print(
        "FP:",
        FP
    )

    print(
        "FN:",
        FN
    )


    # ======================================
    # BEST RESULT
    # ======================================

    if (
        accuracy > best_accuracy
        or (
            accuracy == best_accuracy
            and f1_score > best_f1
        )
    ):

        best_accuracy = accuracy

        best_threshold = threshold

        best_f1 = f1_score


# ==========================================
# FINAL RESULT
# ==========================================

print(
    "\n================================"
)

print(
    "       BEST THRESHOLD RESULT"
)

print(
    "================================"
)

print(
    "Best Threshold:",
    best_threshold
)

print(
    "Best Accuracy:",
    round(
        best_accuracy * 100,
        2
    ),
    "%"
)

print(
    "Best F1 Score:",
    round(
        best_f1 * 100,
        2
    ),
    "%"
)

print(
    "================================"
)

print(
    "\nNOTE:"
)

print(
    "This evaluation measures"
)

print(
    "category-level similarity."
)

print(
    "It is not a verified"
)

print(
    "same-physical-item evaluation."
)
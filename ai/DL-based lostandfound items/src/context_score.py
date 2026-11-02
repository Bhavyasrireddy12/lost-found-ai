from datetime import datetime


# ==========================================
# LOCATION SIMILARITY
# ==========================================

def location_similarity(location1, location2):

    if not location1 or not location2:
        return 0.0

    location1 = location1.strip().lower()
    location2 = location2.strip().lower()

    if location1 == location2:
        return 1.0

    return 0.0


# ==========================================
# TIME SIMILARITY
# ==========================================

def time_similarity(time1, time2):

    if not time1 or not time2:
        return 0.0

    try:

        t1 = datetime.strptime(
            time1,
            "%Y-%m-%d %H:%M"
        )

        t2 = datetime.strptime(
            time2,
            "%Y-%m-%d %H:%M"
        )

        difference_hours = abs(
            (t1 - t2).total_seconds()
        ) / 3600

        if difference_hours <= 1:
            return 1.0

        elif difference_hours <= 6:
            return 0.75

        elif difference_hours <= 24:
            return 0.50

        else:
            return 0.0

    except ValueError:

        print("Invalid date/time format.")

        return 0.0


# ==========================================
# CONTEXT SCORE
# ==========================================

def calculate_context_score(
    lost_location,
    found_location,
    lost_time,
    found_time
):

    location_score = location_similarity(
        lost_location,
        found_location
    )

    time_score = time_similarity(
        lost_time,
        found_time
    )

    return location_score, time_score


# ==========================================
# TEST
# ==========================================

if __name__ == "__main__":

    location_score, time_score = calculate_context_score(
        "College Library",
        "College Library",
        "2026-10-03 10:00",
        "2026-10-03 11:00"
    )

    print("Location Similarity:",
          round(location_score * 100, 2),
          "%")

    print("Time Similarity:",
          round(time_score * 100, 2),
          "%")
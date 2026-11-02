import tkinter as tk
from tkinter import ttk, messagebox
import csv
import os
from datetime import datetime


# ============================================================
# FILE PATH
# ============================================================

HISTORY_FILE = "results/match_history.csv"


# ============================================================
# LOAD HISTORY
# ============================================================

def load_history():

    records = []

    if not os.path.exists(HISTORY_FILE):

        return records

    try:

        with open(
            HISTORY_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                records.append(row)

    except Exception as e:

        messagebox.showerror(
            "Error",
            f"Could not read match history:\n{e}"
        )

    return records


# ============================================================
# CONVERT PERCENTAGE
# ============================================================

def percentage_to_float(value):

    try:

        return float(
            value.replace("%", "")
        )

    except:

        return 0.0


# ============================================================
# MAIN WINDOW
# ============================================================

root = tk.Tk()

root.title(
    "AI Lost & Found - Match History"
)

root.geometry(
    "1100x700"
)

root.minsize(
    900,
    600
)


# ============================================================
# COLORS
# ============================================================

BG = "#101418"

CARD = "#1B2228"

TEXT = "#F2F4F5"

MUTED = "#9BA7B0"

GREEN = "#4ADE80"

BLUE = "#60A5FA"

BORDER = "#303A42"


root.configure(
    bg=BG
)


# ============================================================
# HEADER
# ============================================================

header = tk.Frame(
    root,
    bg=BG
)

header.pack(
    fill="x",
    padx=25,
    pady=(20, 10)
)


title = tk.Label(
    header,
    text="AI LOST & FOUND",
    font=("Segoe UI", 22, "bold"),
    bg=BG,
    fg=TEXT
)

title.pack(
    anchor="w"
)


subtitle = tk.Label(
    header,
    text="Match History & AI Detection Analytics",
    font=("Segoe UI", 10),
    bg=BG,
    fg=MUTED
)

subtitle.pack(
    anchor="w",
    pady=(3, 0)
)


# ============================================================
# STATISTICS AREA
# ============================================================

stats_frame = tk.Frame(
    root,
    bg=BG
)

stats_frame.pack(
    fill="x",
    padx=25,
    pady=10
)


def create_card(
    parent,
    title_text,
    value_text,
    color
):

    card = tk.Frame(
        parent,
        bg=CARD,
        highlightbackground=BORDER,
        highlightthickness=1
    )

    card.pack(
        side="left",
        expand=True,
        fill="both",
        padx=5
    )


    title_label = tk.Label(
        card,
        text=title_text,
        font=("Segoe UI", 9),
        bg=CARD,
        fg=MUTED
    )

    title_label.pack(
        anchor="w",
        padx=18,
        pady=(15, 3)
    )


    value_label = tk.Label(
        card,
        text=value_text,
        font=("Segoe UI", 20, "bold"),
        bg=CARD,
        fg=color
    )

    value_label.pack(
        anchor="w",
        padx=18,
        pady=(0, 15)
    )


    return value_label


records = load_history()


# ============================================================
# CALCULATE STATISTICS
# ============================================================

total_matches = len(records)


clip_values = []

yolo_values = []


for record in records:

    clip_values.append(
        percentage_to_float(
            record.get(
                "CLIP Similarity",
                "0"
            )
        )
    )

    yolo_values.append(
        percentage_to_float(
            record.get(
                "YOLO Confidence",
                "0"
            )
        )
    )


if clip_values:

    average_clip = (
        sum(clip_values)
        / len(clip_values)
    )

else:

    average_clip = 0


if yolo_values:

    average_yolo = (
        sum(yolo_values)
        / len(yolo_values)
    )

else:

    average_yolo = 0


possible_matches = 0


for record in records:

    if record.get(
        "Status",
        ""
    ) == "POSSIBLE MATCH":

        possible_matches += 1


# ============================================================
# CREATE STAT CARDS
# ============================================================

create_card(
    stats_frame,
    "TOTAL MATCH EVENTS",
    str(total_matches),
    TEXT
)


create_card(
    stats_frame,
    "POSSIBLE MATCHES",
    str(possible_matches),
    GREEN
)


create_card(
    stats_frame,
    "AVG CLIP SIMILARITY",
    f"{average_clip:.1f}%",
    BLUE
)


create_card(
    stats_frame,
    "AVG YOLO CONFIDENCE",
    f"{average_yolo:.1f}%",
    GREEN
)


# ============================================================
# CHART SECTION
# ============================================================

chart_frame = tk.Frame(
    root,
    bg=CARD,
    highlightbackground=BORDER,
    highlightthickness=1
)

chart_frame.pack(
    fill="x",
    padx=30,
    pady=15
)


chart_title = tk.Label(
    chart_frame,
    text="MATCH SIMILARITY TREND",
    font=("Segoe UI", 11, "bold"),
    bg=CARD,
    fg=TEXT
)

chart_title.pack(
    anchor="w",
    padx=18,
    pady=(15, 5)
)


# ============================================================
# CANVAS
# ============================================================

canvas = tk.Canvas(
    chart_frame,
    bg=CARD,
    highlightthickness=0,
    height=190
)

canvas.pack(
    fill="x",
    padx=15,
    pady=(0, 15)
)


# ============================================================
# DRAW GRAPH
# ============================================================

def draw_graph():

    canvas.delete(
        "all"
    )


    width = canvas.winfo_width()

    height = canvas.winfo_height()


    if width < 100:

        return


    # No data

    if not clip_values:

        canvas.create_text(
            width // 2,
            height // 2,
            text="No match history available",
            fill=MUTED,
            font=("Segoe UI", 11)
        )

        return


    # --------------------------------------------------------
    # GRAPH AREA
    # --------------------------------------------------------

    left = 55

    right = width - 25

    top = 20

    bottom = height - 35


    graph_width = (
        right - left
    )

    graph_height = (
        bottom - top
    )


    # --------------------------------------------------------
    # GRID LINES
    # --------------------------------------------------------

    for percent in [
        0,
        25,
        50,
        65,
        75,
        100
    ]:

        y = (
            bottom
            - (
                percent / 100
            )
            * graph_height
        )


        canvas.create_line(
            left,
            y,
            right,
            y,
            fill="#303840",
            width=1
        )


        canvas.create_text(
            30,
            y,
            text=f"{percent}%",
            fill=MUTED,
            font=("Segoe UI", 8)
        )


    # --------------------------------------------------------
    # THRESHOLD LINE
    # --------------------------------------------------------

    threshold_y = (
        bottom
        - (
            65 / 100
        )
        * graph_height
    )


    canvas.create_line(
        left,
        threshold_y,
        right,
        threshold_y,
        fill=GREEN,
        width=1,
        dash=(5, 4)
    )


    canvas.create_text(
        right - 40,
        threshold_y - 10,
        text="65%",
        fill=GREEN,
        font=("Segoe UI", 8, "bold")
    )


    # --------------------------------------------------------
    # POINTS
    # --------------------------------------------------------

    max_points = min(
        len(clip_values),
        30
    )


    values = clip_values[
        -max_points:
    ]


    points = []


    for i, value in enumerate(values):

        if max_points == 1:

            x = (
                left
                + graph_width / 2
            )

        else:

            x = (
                left
                + (
                    i
                    / (
                        max_points - 1
                    )
                )
                * graph_width
            )


        y = (
            bottom
            - (
                value / 100
            )
            * graph_height
        )


        points.append(
            (x, y)
        )


    # --------------------------------------------------------
    # CONNECT POINTS
    # --------------------------------------------------------

    if len(points) > 1:

        for i in range(
            len(points) - 1
        ):

            canvas.create_line(
                points[i][0],
                points[i][1],
                points[i + 1][0],
                points[i + 1][1],
                fill=BLUE,
                width=2
            )


    # --------------------------------------------------------
    # DRAW POINTS
    # --------------------------------------------------------

    for i, point in enumerate(
        points
    ):

        x, y = point


        canvas.create_oval(
            x - 4,
            y - 4,
            x + 4,
            y + 4,
            fill=GREEN,
            outline=""
        )


        # Show value
        if (
            i == len(points) - 1
            or len(points) <= 10
        ):

            canvas.create_text(
                x,
                y - 12,
                text=f"{values[i]:.1f}%",
                fill=TEXT,
                font=(
                    "Segoe UI",
                    8
                )
            )


# Draw after window appears

root.after(
    100,
    draw_graph
)


canvas.bind(
    "<Configure>",
    lambda event: draw_graph()
)


# ============================================================
# HISTORY TABLE
# ============================================================

table_frame = tk.Frame(
    root,
    bg=BG
)

table_frame.pack(
    fill="both",
    expand=True,
    padx=25,
    pady=(0, 20)
)


table_title = tk.Label(
    table_frame,
    text="RECENT MATCH HISTORY",
    font=("Segoe UI", 11, "bold"),
    bg=BG,
    fg=TEXT
)

table_title.pack(
    anchor="w",
    pady=(0, 8)
)


# ============================================================
# TREEVIEW STYLE
# ============================================================

style = ttk.Style()

style.theme_use(
    "clam"
)


style.configure(
    "Treeview",
    background=CARD,
    foreground=TEXT,
    fieldbackground=CARD,
    rowheight=30,
    borderwidth=0,
    font=("Segoe UI", 9)
)


style.configure(
    "Treeview.Heading",
    background="#252E35",
    foreground=TEXT,
    font=(
        "Segoe UI",
        9,
        "bold"
    )
)


style.map(
    "Treeview",
    background=[
        (
            "selected",
            "#315D45"
        )
    ]
)


# ============================================================
# TABLE
# ============================================================

columns = (
    "Date",
    "Time",
    "Lost Item",
    "Detected",
    "YOLO",
    "CLIP",
    "Status"
)


tree = ttk.Treeview(
    table_frame,
    columns=columns,
    show="headings"
)


for column in columns:

    tree.heading(
        column,
        text=column
    )


tree.column(
    "Date",
    width=100
)

tree.column(
    "Time",
    width=90
)

tree.column(
    "Lost Item",
    width=100
)

tree.column(
    "Detected",
    width=100
)

tree.column(
    "YOLO",
    width=90
)

tree.column(
    "CLIP",
    width=90
)

tree.column(
    "Status",
    width=150
)


# ============================================================
# SCROLLBAR
# ============================================================

scrollbar = ttk.Scrollbar(
    table_frame,
    orient="vertical",
    command=tree.yview
)


tree.configure(
    yscrollcommand=scrollbar.set
)


tree.pack(
    side="left",
    fill="both",
    expand=True
)


scrollbar.pack(
    side="right",
    fill="y"
)


# ============================================================
# INSERT DATA
# ============================================================

for record in records:

    tree.insert(
        "",
        "end",
        values=(
            record.get(
                "Date",
                ""
            ),
            record.get(
                "Time",
                ""
            ),
            record.get(
                "Lost Item",
                ""
            ),
            record.get(
                "Detected Item",
                ""
            ),
            record.get(
                "YOLO Confidence",
                ""
            ),
            record.get(
                "CLIP Similarity",
                ""
            ),
            record.get(
                "Status",
                ""
            )
        )
    )


# ============================================================
# FOOTER
# ============================================================

footer = tk.Label(
    root,
    text=(
        "Data source: "
        "results/match_history.csv"
    ),
    font=("Segoe UI", 8),
    bg=BG,
    fg=MUTED
)

footer.pack(
    anchor="w",
    padx=25,
    pady=(0, 10)
)


# ============================================================
# START APPLICATION
# ============================================================

root.mainloop()
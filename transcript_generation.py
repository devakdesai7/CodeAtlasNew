import csv
import random
import re
from pathlib import Path

# ============================================================
# CONFIG
# ============================================================

NUM_ROWS = 3000
OUTPUT_FILE = "emergency_nlp_dataset_3000.csv"

random.seed(42)

# ============================================================
# DATA VOCABULARY
# ============================================================

INCIDENTS = [
    "vehicle collision",
    "truck accident",
    "bus crash",
    "motorcycle accident",
    "car rollover",
    "building fire",
    "warehouse fire",
    "factory fire",
    "gas leak",
    "chemical spill",
    "fuel leak",
    "explosion",
    "flash flood",
    "urban flooding",
    "landslide",
    "earthquake damage",
    "building collapse",
    "electrical accident",
    "power line failure",
    "train derailment",
    "railway accident",
    "aircraft emergency",
    "boat accident",
    "drowning",
    "missing person",
    "crowd emergency",
    "stampede",
    "medical emergency",
    "industrial accident",
    "forest fire",
    "wildfire",
    "fallen tree",
    "road blockage",
    "bridge damage",
    "storm damage",
    "lightning strike",
    "cyclone damage",
    "severe rainfall",
    "heat emergency",
    "cold exposure",
    "hazardous material incident",
    "dam overflow",
    "evacuation",
]

VEHICLES = [
    "car",
    "sedan",
    "SUV",
    "truck",
    "tanker",
    "bus",
    "school bus",
    "motorcycle",
    "van",
    "ambulance",
    "train",
    "delivery vehicle",
    "container truck",
    "fuel tanker",
]

LOCATIONS = [
    "Ring Road",
    "Airport Road",
    "Old Bridge",
    "Central Market",
    "Main Highway",
    "Eastern Bypass",
    "Western Expressway",
    "Railway Station",
    "City Hospital",
    "Industrial Area",
    "Industrial Gate",
    "Bus Terminal",
    "River Bridge",
    "North Underpass",
    "South Flyover",
    "Central Flyover",
    "Old Railway Crossing",
    "Market Road",
    "Station Road",
    "College Road",
    "Temple Road",
    "Factory Road",
    "Warehouse District",
    "Residential Block",
    "City Center",
    "Outer Ring Road",
    "Airport Junction",
    "Highway Toll Plaza",
    "Riverbank",
    "Dam Road",
    "Forest Checkpoint",
    "Coastal Road",
    "Harbor Area",
    "Port Entrance",
    "Railway Yard",
    "Bus Depot",
    "Shopping District",
    "Commercial Street",
    "Underpass",
    "Tunnel Entrance",
]

WEATHER = [
    "heavy rain",
    "continuous rainfall",
    "strong winds",
    "dense fog",
    "thunderstorm",
    "lightning",
    "extreme heat",
    "cold weather",
    "dust storm",
    "cyclonic winds",
    "poor visibility",
    "wet roads",
    "stormy weather",
]

HAZARDS = [
    "smoke",
    "fire",
    "diesel leak",
    "fuel leak",
    "gas leak",
    "chemical fumes",
    "live electrical wires",
    "rising water",
    "debris",
    "broken glass",
    "unstable structure",
    "fallen tree",
    "blocked road",
    "toxic fumes",
    "oil spill",
]

INJURIES = [
    "one injured person",
    "two injured people",
    "three injured passengers",
    "several injured people",
    "a seriously injured driver",
    "an unconscious person",
    "people with minor injuries",
    "multiple casualties",
    "a trapped passenger",
    "an injured child",
]

RESOURCES = [
    "ambulance",
    "fire brigade",
    "police",
    "rescue team",
    "medical team",
    "disaster response team",
    "fire truck",
    "paramedics",
    "search and rescue team",
]

NUMBERS = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "several",
    "multiple",
]

TIMES = [
    "a few minutes ago",
    "about ten minutes ago",
    "just now",
    "around midnight",
    "early this morning",
    "late last night",
    "during rush hour",
    "around noon",
    "this afternoon",
    "before sunrise",
    "about half an hour ago",
]

PEOPLE = [
    "driver",
    "passenger",
    "pedestrian",
    "worker",
    "resident",
    "shopkeeper",
    "security guard",
    "child",
    "elderly person",
    "cyclist",
    "construction worker",
]

# ============================================================
# TRANSCRIPT GENERATION
# ============================================================

def generate_transcript():
    incident = random.choice(INCIDENTS)
    location = random.choice(LOCATIONS)
    vehicle = random.choice(VEHICLES)
    weather = random.choice(WEATHER)
    hazard = random.choice(HAZARDS)
    injury = random.choice(INJURIES)
    resource = random.choice(RESOURCES)
    person = random.choice(PEOPLE)
    time = random.choice(TIMES)

    templates = [

        f"There has been a {incident} near {location}. "
        f"I can see a {vehicle} involved and {injury}.",

        f"Caller reports a {incident} at {location}. "
        f"There is {hazard} and the area may be dangerous.",

        f"We have a {incident} near {location}. "
        f"It happened {time}, and a {person} is reporting the situation.",

        f"Something serious happened around {location}. "
        f"It looks like a {incident}, and there is {hazard}.",

        f"Emergency reported from {location}. "
        f"A {vehicle} appears to be involved in a {incident}. "
        f"{injury}.",

        f"I am near {location} and there has been a {incident}. "
        f"The road is affected and I can see {hazard}.",

        f"The caller says there is a {incident} at {location}. "
        f"They are requesting {resource}.",

        f"Traffic has stopped near {location} because of a {incident}. "
        f"There is {hazard} on the road.",

        f"Please send {resource} to {location}. "
        f"We have a {incident} involving a {vehicle}.",

        f"There was a {incident} around {location} {time}. "
        f"{injury} and emergency crews are needed.",

        f"Heavy {weather} is making the situation worse near {location}. "
        f"There is a {incident} with {hazard}.",

        f"I cannot see everything clearly because of {weather}, "
        f"but there appears to be a {incident} near {location}.",

        f"A {person} says there is a {incident} near {location}. "
        f"They noticed {hazard} and asked for help.",

        f"The situation at {location} is getting worse. "
        f"There has been a {incident} and {injury}.",

        f"Emergency teams are needed at {location} after a {incident}. "
        f"A {vehicle} is blocking part of the road.",

        f"Reports are coming in from {location} about a {incident}. "
        f"There is {hazard} and several people are nearby.",

        f"I think there has been a {incident} near {location}. "
        f"I am not sure how many people are involved, but {injury}.",

        f"Something has happened near {location}. "
        f"I can hear people asking for help and I can see {hazard}.",

        f"The caller reports that a {vehicle} is involved in an incident "
        f"near {location}. There may be {injury}.",

        f"Please check {location}. "
        f"There is a reported {incident}, and {resource} may be required.",
    ]

    transcript = random.choice(templates)

    # Randomly add secondary information
    additions = [
        f" The incident happened {time}.",
        f" The weather is {weather}.",
        f" A {person} is waiting near the scene.",
        f" Traffic is building up in the area.",
        f" People are moving away from the location.",
        f" Visibility is poor.",
        f" The exact number of people involved is unknown.",
        f" Emergency vehicles are being requested.",
        f" The caller is unsure what caused the incident.",
        f" Nearby roads are becoming difficult to use.",
        "",
        "",
        "",
    ]

    # Add 0–2 additional pieces of information
    for _ in range(random.randint(0, 2)):
        transcript += random.choice(additions)

    return transcript.strip()


# ============================================================
# KEYWORD EXTRACTION
# IMPORTANT:
# Keywords are extracted ONLY from the generated transcript.
# Nothing is independently generated as a keyword.
# ============================================================

STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were",
    "there", "this", "that", "and", "or", "of",
    "to", "in", "at", "near", "from", "with",
    "for", "on", "after", "before", "around",
    "has", "have", "had", "be", "been", "being",
    "it", "i", "we", "they", "he", "she",
    "can", "could", "may", "might",
    "about", "very", "just", "some",
    "one", "two", "three", "four", "five",
}


def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    return text


def extract_keywords(transcript, max_keywords=3):
    """
    Extract up to 3 keywords/key phrases ONLY from the transcript.
    """

    original = transcript.lower()

    candidates = []

    # --------------------------------------------------------
    # 1. Match known meaningful phrases IF THEY EXIST
    # --------------------------------------------------------

    all_phrases = (
        INCIDENTS
        + VEHICLES
        + HAZARDS
        + INJURIES
        + RESOURCES
        + LOCATIONS
        + WEATHER
        + PEOPLE
    )

    # Longer phrases first
    all_phrases = sorted(
        set(all_phrases),
        key=lambda x: len(x.split()),
        reverse=True
    )

    for phrase in all_phrases:
        if phrase.lower() in original:
            candidates.append(phrase.lower())

    # --------------------------------------------------------
    # 2. Extract useful noun-like words directly from transcript
    # --------------------------------------------------------

    cleaned = clean_text(transcript)

    words = cleaned.split()

    for word in words:
        if (
            len(word) >= 4
            and word not in STOPWORDS
            and word not in [x.lower() for x in candidates]
        ):
            candidates.append(word)

    # --------------------------------------------------------
    # 3. Remove duplicate / overlapping keywords
    # --------------------------------------------------------

    final_keywords = []

    for keyword in candidates:

        keyword = keyword.strip().lower()

        if not keyword:
            continue

        duplicate = False

        for existing in final_keywords:

            if keyword == existing:
                duplicate = True
                break

            # Avoid selecting "fire" when "building fire" already exists
            if keyword in existing or existing in keyword:
                duplicate = True
                break

        if not duplicate:
            final_keywords.append(keyword)

        if len(final_keywords) >= max_keywords:
            break

    return "; ".join(final_keywords[:max_keywords])


# ============================================================
# GENERATE DATASET
# ============================================================

def generate_dataset():
    rows = []
    seen_transcripts = set()

    attempts = 0
    max_attempts = NUM_ROWS * 20

    while len(rows) < NUM_ROWS and attempts < max_attempts:

        attempts += 1

        transcript = generate_transcript()

        normalized = transcript.lower().strip()

        # Prevent exact duplicates
        if normalized in seen_transcripts:
            continue

        keywords = extract_keywords(transcript, max_keywords=3)

        # Make sure keyword extraction succeeded
        if not keywords:
            continue

        seen_transcripts.add(normalized)

        rows.append({
            "randomised_transcript": transcript,
            "extracted_keywords": keywords
        })

        if len(rows) % 100 == 0:
            print(f"Generated {len(rows)}/{NUM_ROWS}")

    return rows


# ============================================================
# SAVE CSV
# ============================================================

def save_csv(rows):

    output_path = Path(OUTPUT_FILE)

    with output_path.open(
        "w",
        newline="",
        encoding="utf-8-sig"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=[
                "randomised_transcript",
                "extracted_keywords"
            ]
        )

        writer.writeheader()
        writer.writerows(rows)

    print("\n======================================")
    print("DATASET GENERATED SUCCESSFULLY")
    print("======================================")
    print(f"Rows      : {len(rows)}")
    print(f"Columns   : 2")
    print(f"File      : {output_path.resolve()}")
    print("======================================")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("Starting emergency transcript generation...")
    print(f"Target rows: {NUM_ROWS}\n")

    dataset = generate_dataset()

    save_csv(dataset)
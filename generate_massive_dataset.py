import csv
import random
from transcript_generation import INCIDENTS, VEHICLES, LOCATIONS, WEATHER, HAZARDS, INJURIES, RESOURCES, PEOPLE, TIMES, extract_keywords

category_mapping = {
    "vehicle collision": "CRASH", "truck accident": "CRASH", "bus crash": "CRASH",
    "motorcycle accident": "CRASH", "car rollover": "CRASH", "train derailment": "CRASH",
    "railway accident": "CRASH", "aircraft emergency": "CRASH", "boat accident": "CRASH",
    "building fire": "FIRE", "warehouse fire": "FIRE", "factory fire": "FIRE",
    "forest fire": "FIRE", "wildfire": "FIRE", "electrical accident": "FIRE",
    "gas leak": "HAZMAT", "chemical spill": "HAZMAT", "fuel leak": "HAZMAT",
    "hazardous material incident": "HAZMAT", "power line failure": "HAZMAT",
    "flash flood": "FLOOD", "urban flooding": "FLOOD", "dam overflow": "FLOOD",
    "earthquake damage": "RESCUE", "building collapse": "RESCUE", "landslide": "RESCUE",
    "missing person": "RESCUE", "drowning": "RESCUE", "fallen tree": "RESCUE",
    "road blockage": "RESCUE", "bridge damage": "RESCUE", "crowd emergency": "RESCUE", 
    "stampede": "RESCUE",
    "cyclone damage": "CYCLONE", "storm damage": "CYCLONE", "lightning strike": "CYCLONE",
    "severe rainfall": "CYCLONE",
    "medical emergency": "MEDICAL", "industrial accident": "MEDICAL",
    "heat emergency": "MEDICAL", "cold exposure": "MEDICAL"
}

def determine_severity(text):
    text_lower = text.lower()
    high_sev_words = ['trapped', 'unconscious', 'explosion', 'massive', 'multiple casualties', 'drowning', 'engulfed', 'collapse', 'derailment', 'earthquake']
    mid_sev_words = ['bleeding', 'injured', 'spill', 'leak', 'crash', 'storm', 'fire', 'flood']
    
    if any(w in text_lower for w in high_sev_words):
        return random.choice([4, 5])
    elif any(w in text_lower for w in mid_sev_words):
        return random.choice([2, 3])
    else:
        return random.choice([1, 2])

def generate_row():
    # Negative sample (15%)
    if random.random() < 0.15:
        negatives = [
            "pocket dial", "loud music from neighbor", "parking issue", 
            "lost pet dog", "wrong number", "general noise", "asking for directions",
            "pizza delivery complaint", "cat stuck in tree", "pothole on road"
        ]
        base = random.choice(negatives)
        return f"Oh sorry, {base}. Everything is fine.", "none", "NOISE", 0

    incident = random.choice(INCIDENTS)
    location = random.choice(LOCATIONS)
    vehicle = random.choice(VEHICLES)
    weather = random.choice(WEATHER)
    hazard = random.choice(HAZARDS)
    injury = random.choice(INJURIES)
    time = random.choice(TIMES)
    person = random.choice(PEOPLE)

    templates = [
        f"There has been a {incident} near {location}. I can see a {vehicle} involved and {injury}.",
        f"Caller reports a {incident} at {location}. There is {hazard}.",
        f"We have a {incident} near {location}. It happened {time}.",
        f"I am near {location} and there has been a {incident}. The road is affected and I can see {hazard}.",
        f"Heavy {weather} is making the situation worse near {location}. There is a {incident}.",
        f"Please send help to {location}. We have a {incident} involving a {vehicle}.",
        f"I think there has been a {incident} near {location}. {injury}.",
        f"Reports are coming in from {location} about a {incident}. There is {hazard}.",
        f"The caller says there is a {incident} at {location}.",
        f"A {person} says there is a {incident} near {location}. They noticed {hazard}."
    ]

    transcript = random.choice(templates)
    
    additions = [
        f" The weather is {weather}.", f" A {person} is waiting.",
        f" Traffic is building up.", f" People are moving away.",
        f" Visibility is poor.", f" The incident happened {time}."
    ]
    for _ in range(random.randint(0, 2)):
        transcript += random.choice(additions)

    # Panic wrappers
    greetings = ["Oh my god! ", "Help! ", "Please hurry! ", "911? ", "Ahhh! "]
    stutters = ["I... I don't know, ", "It's, um, ", "Wait, yes, ", "There's... "]
    pleas = [" Send someone now!", " Please hurry!", " What do I do?!"]

    if random.random() > 0.5:
        transcript = random.choice(greetings) + transcript
    if random.random() > 0.6:
        transcript = random.choice(stutters) + transcript
    if random.random() > 0.6:
        transcript = transcript + random.choice(pleas)

    category = category_mapping.get(incident, "RESCUE")
    keywords = extract_keywords(transcript)
    if not keywords: keywords = incident
    severity = determine_severity(transcript)

    return transcript.strip(), keywords, category, severity

def build_dataset():
    seen = set()
    rows = []
    
    while len(rows) < 5000:
        t, k, c, s = generate_row()
        if t not in seen:
            seen.add(t)
            rows.append({"text_content": t, "extracted_keywords": k, "true_category": c, "true_severity": s})
            
    with open("triage_training_data_v3.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["text_content", "extracted_keywords", "true_category", "true_severity"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"Successfully generated {len(rows)} unique rows for robust training!")

if __name__ == "__main__":
    build_dataset()

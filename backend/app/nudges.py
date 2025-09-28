def generate_nudges(patient, prediction):
    """
    Generate dynamic nudges based on risk band + feature drivers.
    """
    nudges = []

    band = prediction["band"]
    top_features = prediction["top_features"]

    # Risk-based nudges
    if band == "high":
        nudges.append("Schedule a follow-up appointment within 7 days.")
        nudges.append("Assign case manager to check-in with patient.")
    elif band == "medium":
        nudges.append("Recommend outpatient visit in 14 days.")
    else:
        nudges.append("Standard discharge checklist is sufficient.")

    # Feature-driven nudges
    if "num_medications" in top_features and top_features["num_medications"] > 0:
        nudges.append("Perform a medication adherence check.")
    if "time_in_hospital" in top_features and top_features["time_in_hospital"] > 0:
        nudges.append("Consider shortening hospital stay if clinically safe.")
    if "A1Cresult" in top_features:
        nudges.append("Provide diabetes self-management counseling.")

    return nudges
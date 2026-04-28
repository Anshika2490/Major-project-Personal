from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

def analyze_speech(voice_data_mock):
    # Mock voice analysis
    if voice_data_mock == "too_low":
        return {"error": "Voice volume too low. Please speak louder.", "valid": False}
    elif voice_data_mock == "tired":
        return {"sentiment": "Tired/Low Energy", "depression_boost": 0.25, "valid": True}
    else:
        return {"sentiment": "Normal Tone", "depression_boost": 0.0, "valid": True}

def generate_multi_parameters(text, answers, voice_boost):
    # Base score normalized from 11 questions (0-3 scale)
    base_score = sum(answers) / (len(answers) * 3)
    text = text.lower()
    
    # 1. Depression & Mild Depression
    dep_score = base_score * 0.4 + voice_boost
    if "hopeless" in text or "sad" in text: dep_score += 0.3
    
    is_depression = dep_score > 0.6
    is_mild_depression = 0.4 < dep_score <= 0.6

    # 2. Anxiety & Panic
    anx_score = base_score * 0.3
    if "nervous" in text or "worry" in text: anx_score += 0.4
    if "panic" in text or "heart" in text: anx_score += 0.5
    
    is_anxiety = anx_score > 0.5
    is_panic = anx_score > 0.75

    # 3. Stress
    stress_score = base_score * 0.5
    if "overwhelmed" in text or "tired" in text: stress_score += 0.3
    is_stress = stress_score > 0.5

    # 4. Trauma
    trauma_score = 0
    if "flashback" in text or "nightmare" in text or "past" in text or "abuse" in text or answers[8] >= 2:
        trauma_score = 0.8
    is_trauma = trauma_score > 0.7

    # 5. OCD Thinking
    ocd_score = 0
    if "obsess" in text or "intrusive" in text or "repeat" in text or answers[9] >= 2:
        ocd_score = 0.75
    is_ocd = ocd_score > 0.6

    # 6. Phobia / Fear
    fear_score = 0
    if "scared" in text or "terrified" in text or "fear" in text or answers[10] >= 2:
        fear_score = 0.8
    is_phobia = fear_score > 0.7

    detected = []
    if is_depression: detected.append("Depression")
    if is_mild_depression: detected.append("Mild Depression")
    if is_anxiety: detected.append("Anxiety")
    if is_panic: detected.append("Panic Attack")
    if is_stress: detected.append("Stress")
    if is_trauma: detected.append("Trauma")
    if is_ocd: detected.append("OCD Thinking")
    if is_phobia: detected.append("Phobia / Fear")

    if not detected:
        detected.append("Healthy / Low Risk")

    # Determine highest risk category for primary label
    primary = detected[0] if detected else "Healthy Baseline"
    
    return detected, primary

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    name = data.get("name", "User")
    email = data.get("email", "")
    text = data.get("text", "")
    answers = data.get("answers", [])
    voice_mock = data.get("voice_status", "normal") # too_low, tired, normal

    time.sleep(1.5) # simulate processing

    speech_res = analyze_speech(voice_mock)
    if not speech_res["valid"]:
        return jsonify({"status": "error", "message": speech_res["error"]}), 400

    parameters, primary_condition = generate_multi_parameters(text, answers, speech_res["depression_boost"])

    # Provide Trauma follow-up requirement
    requires_trauma_followup = "Trauma" in parameters

    # General mock models
    lstm_result = {"sentiment": "Negative" if "Depression" in parameters or "Anxiety" in parameters else "Neutral", "score": random.uniform(0.7, 0.95)}
    rf_result = {"risk": primary_condition, "probability": random.uniform(0.65, 0.95)}

    color = "red" if ("Depression" in parameters or "Trauma" in parameters or "Panic Attack" in parameters) else "orange" if len(parameters) > 1 else "green"

    return jsonify({
        "status": "success",
        "user": {"name": name, "email": email, "notifications_enabled": bool(email)},
        "lstm_analysis": lstm_result,
        "rf_analysis": rf_result,
        "parameters_detected": parameters,
        "requires_trauma_followup": requires_trauma_followup,
        "speech_analysis": speech_res["sentiment"],
        "combined_prediction": {
            "risk_level": primary_condition,
            "confidence_score": round(random.uniform(0.85, 0.99), 2),
            "severity_color": color
        }
    })

@app.route("/trauma_solution", methods=["POST"])
def trauma_solution():
    data = request.json
    trauma_details = data.get("details", "")
    
    # Simple logic to provide solutions based on details
    return jsonify({
        "solution": "Thank you for sharing safely. For trauma related to your experiences, we recommend 'Grounding with the 5 Senses' daily. Write down 5 things you see, 4 you touch, 3 you hear, 2 you smell, and 1 you taste. EMDR therapy is highly effective for this; our chatbot can help you find an EMDR specialist.",
        "daily_practice": "15-minute guided safe-space visualization every morning."
    })

if __name__ == "__main__":
    app.run(debug=True)
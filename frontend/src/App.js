import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './index.css';

// --- MOCK DATA ---
const questions = [
  "How often do you feel tired or have little energy?",
  "How often do you feel nervous, anxious, or on edge?",
  "How often do you have trouble relaxing?",
  "How often do you feel sad, depressed, or hopeless?",
  "How often do you have little interest or pleasure in doing things?",
  "How often do you feel panic or overwhelming fear?",
  // Advanced questions for deeper analysis:
  "How often do you find yourself reliving past negative experiences or having intrusive memories?",
  "How often do you feel detached from yourself, your surroundings, or reality?",
  "How often do you purposefully avoid people, places, or activities that remind you of past trauma?",
  "How often do you have repetitive, unwanted thoughts or behaviors you feel driven to perform?",
  "How often do you experience intense, irrational fear or phobia of specific situations?"
];

const doctors = [
  { name: "Dr. Sarah Jenkins", specialty: "Clinical Psychologist", phone: "+1 (555) 123-4567", rating: "⭐⭐⭐⭐⭐ (4.9)", details: "$80/session - Specializes in Anxiety & Depression." },
  { name: "Dr. Marcus Wei", specialty: "Psychiatrist", phone: "+1 (555) 987-6543", rating: "⭐⭐⭐⭐½ (4.7)", details: "$120/session - Expert in Panic Disorders & Medication." },
  { name: "TherapyRoute Online", specialty: "Affordable Counseling", phone: "+1 (800) 555-0000", rating: "⭐⭐⭐⭐ (4.5)", details: "$40/session - Best for trauma and affordable care." }
];

const dailyProgress = [
  { day: "Mon", exercises: 2, mood: 7 },
  { day: "Tue", exercises: 3, mood: 6 },
  { day: "Wed", exercises: 1, mood: 5 },
  { day: "Thu", exercises: 4, mood: 8 },
  { day: "Fri", exercises: 3, mood: 8 },
  { day: "Sat", exercises: 5, mood: 9 },
  { day: "Sun", exercises: 2, mood: 8 },
];

function App() {
  const [activeTab, setActiveTab] = useState('about'); // about, test, progress, chat

  // Test State
  const [testStage, setTestStage] = useState('input'); // input, processing, results
  const [formData, setFormData] = useState({ name: '', email: '', text: '', answers: Array(11).fill(null), voice_status: 'normal' });
  const [processingStep, setProcessingStep] = useState(0);
  const [resultData, setResultData] = useState(null);
  
  // Voice Recording Mock
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);

  // Trauma Flow State
  const [traumaDetails, setTraumaDetails] = useState('');
  const [traumaSolution, setTraumaSolution] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your Mental Health Companion. You can ask me for exercises, how to handle panic, or say "Connect me to a doctor".' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  // Handlers
  const handleAnswer = (index, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingComplete(false);
    setTimeout(() => {
      setIsRecording(false);
      setRecordingComplete(true);
      // Using the dropdown selection (formData.voice_status) as the mock result for testing
    }, 3000);
  };

  const handleAnalyze = async () => {
    if (formData.answers.includes(null)) { alert("Please complete the questionnaire completely."); return; }
    if (!recordingComplete) { alert("Please complete the Voice Speech Analysis."); return; }

    setTestStage('processing');
    const steps = ["Analyzing speech patterns...", "Evaluating behavior...", "Generating complex report..."];
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", formData);
      setResultData(res.data);
      setTestStage('results');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
         alert("AI Note: " + err.response.data.message);
         setTestStage('input'); // Send them back to speak louder
         setRecordingComplete(false);
      } else {
         alert("Backend error. Make sure app.py is running!");
         setTestStage('input');
      }
    }
  };

  const submitTraumaDetails = async () => {
    if(!traumaDetails) return;
    try {
      const res = await axios.post("http://127.0.0.1:5000/trauma_solution", { details: traumaDetails });
      setTraumaSolution(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.toLowerCase();
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');

    setTimeout(() => {
      let response = "I hear you. Could you tell me a little more?";
      
      if (query.includes('doctor') || query.includes('therapist') || query.includes('doc')) {
        response = "Here are some highly-rated online therapists and doctors you can contact right now:";
        setChatMessages(prev => [
          ...prev, 
          { sender: 'bot', text: response },
          { sender: 'bot', type: 'doctor-list' }
        ]);
        return;
      }
      if (query.includes('panic') || query.includes('attack')) {
        response = "Panic can be overwhelming. Try holding an ice cube, chewing sour candy, or using the 5-4-3-2-1 grounding technique (name 5 things you see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste).";
      }
      if (query.includes('exercise') || query.includes('what to do')) {
        response = "For anxiety, try 4-7-8 breathing. For depression, a 10-minute mindful walk outdoors can help. Would you like me to guide you through a breathing exercise?";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: response }]);
    }, 600);
  };

  const handleQuickChatBtn = (text) => {
    setChatInput(text);
  };

  return (
    <div className="app-container">
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>

      <nav className="navbar glass-card">
        <div className="nav-logo">
          <span className="nav-icon">🌿</span> MentalHealth.AI
        </div>
        <div className="nav-links">
          <button className={`nav-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>🏠 About</button>
          <button className={`nav-btn ${activeTab === 'test' ? 'active' : ''}`} onClick={() => setActiveTab('test')}>🧠 Screening Test</button>
          <button className={`nav-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>📈 My Progress</button>
          <button className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 AI Chatbot</button>
        </div>
      </nav>

      <main className="main-content">
        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="tab-fade-in">
            <div className="hero-section glass-card">
              <img src="https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Mental peace" className="hero-img" />
              <div className="hero-overlay">
                <h1>Welcome to Your Safe Space</h1>
                <p>An advanced, AI-driven platform for mental health screening utilizing Speech Recognition, CNN, LSTM, and Random Forest models.</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-card glass-card hover-lift" onClick={() => setActiveTab('test')}>
                <div className="info-icon">🧠</div>
                <h3>Deep AI Screening</h3>
                <p>Use our 11-point advanced clinical questionnaire and voice-speech analysis to detect Trauma, OCD, Phobias, and Depression.</p>
                <div className="go-arrow">→</div>
              </div>
              <div className="info-card glass-card hover-lift" onClick={() => setActiveTab('progress')}>
                <div className="info-icon">📈</div>
                <h3>Daily Tracking</h3>
                <p>Set up email notifications and text alarms for your mental health exercises and track daily mood graphs.</p>
                <div className="go-arrow">→</div>
              </div>
              <div className="info-card glass-card hover-lift" onClick={() => setActiveTab('chat')}>
                <div className="info-icon">💬</div>
                <h3>24/7 AI Companion</h3>
                <p>Find affordable therapists, learn grounding techniques for panic, and chat instantly.</p>
                <div className="go-arrow">→</div>
              </div>
            </div>
          </div>
        )}

        {/* SCREENING TEST TAB */}
        {activeTab === 'test' && (
          <div className="tab-fade-in">
            {testStage === 'input' && (
              <div className="glass-card">
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                  <h2>Advanced Multimodal Screening</h2>
                  <p>Includes speech pattern analysis, sentiment journaling, and clinical evaluation.</p>
                </div>

                <div className="input-group">
                  <label>Your Name</label>
                  <input type="text" placeholder="Enter your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="input-group mt-2">
                  <label>Email Address <span style={{fontSize:'0.8rem', color:'var(--success)'}}>(Required for daily notifications and text alarms for exercises)</span></label>
                  <input type="email" placeholder="example@mail.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="mt-3 mb-2 p-2" style={{background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem'}}>
                  <h3>🎤 Voice Speech Analysis</h3>
                  <p style={{fontSize:'0.9rem', marginBottom:'1rem'}}>Please read the prompt aloud: "I am feeling okay today, but sometimes I struggle." The AI will analyze your speech tone.</p>
                  
                  <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                    <button className={`mic-btn ${isRecording ? 'recording' : ''}`} onClick={startRecording}>
                      {isRecording ? "🎙️ Recording..." : "🎙️ Tap to Speak"}
                    </button>
                    {recordingComplete && <span style={{color: 'var(--success)'}}>✅ Audio Captured!</span>}
                  </div>

                  <div className="mt-2">
                    <label style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Test Sandbox (Select what the AI hears):</label>
                    <select value={formData.voice_status} onChange={e => setFormData({...formData, voice_status: e.target.value})} className="mock-select">
                      <option value="normal">Loud & Clear (Normal Tone)</option>
                      <option value="too_low">Too Low (Will prompt user to speak louder)</option>
                      <option value="tired">Ok Volume but sounds Low/Tired (Depression factor)</option>
                    </select>
                  </div>
                </div>

                <div className="input-group mt-3">
                  <label>Journal Entry (Text Analysis)</label>
                  <textarea placeholder="Describe any trauma, fears, or how you feel today..." value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} />
                </div>

                <div className="mt-3 mb-2">
                  <h3>Clinical Questionnaire (11 Points)</h3>
                  {questions.map((q, i) => (
                    <div key={i} className="question-item">
                      <div className="question-text"><b>{i+1}.</b> {q}</div>
                      <div className="options-container">
                        {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((opt, val) => (
                          <button key={val} className={`option-btn ${formData.answers[i] === val ? 'selected' : ''}`} onClick={() => handleAnswer(i, val)}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn-primary" onClick={handleAnalyze}>✨ Analyze Comprehensive Profile</button>
              </div>
            )}

            {testStage === 'processing' && (
              <div className="glass-card processing-container">
                <div className="loader"></div>
                <h2>Analyzing Multimodal Data</h2>
                <p className="processing-step">{["Processing speech tone & frequency...", "Extracting linguistic features (LSTM)...", "Evaluating deep behavioral parameters (RF)...", "Generating complex report..."][processingStep]}</p>
              </div>
            )}

            {testStage === 'results' && resultData && (
              <div className="results-wrapper">
                <div className="result-header glass-card">
                  <h1>Assessment Complete</h1>
                  <p>For: {resultData.user.name || 'User'} | Email Notifications: {resultData.user.notifications_enabled ? 'ON ✅' : 'OFF ❌'}</p>
                  
                  <div style={{marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                    {resultData.parameters_detected.map(param => (
                       <span key={param} className={`param-badge`}>{param}</span>
                    ))}
                  </div>
                  
                  <div className={`risk-badge risk-${resultData.combined_prediction.severity_color}`}>
                    Primary: {resultData.combined_prediction.risk_level}
                  </div>
                </div>

                {/* TRAUMA DEEP DIVE MODAL/SECTION */}
                {resultData.requires_trauma_followup && (
                  <div className="glass-card trauma-card mb-2">
                    <h2>⚠️ Trauma Detected: Let's Dig Deeper</h2>
                    <p>We detected signs of trauma or past negative experiences. To give you the right daily practice, could you detail a bit more about how this trauma affects your body (e.g., tight chest, insomnia)?</p>
                    <textarea 
                      placeholder="Share safely here..." 
                      value={traumaDetails} 
                      onChange={e=>setTraumaDetails(e.target.value)}
                      style={{minHeight: '80px', marginTop: '1rem', width: '100%'}}
                    />
                    <button className="btn-primary mt-2" onClick={submitTraumaDetails}>Get Custom Trauma Solution</button>
                    
                    {traumaSolution && (
                      <div className="trauma-solution mt-2">
                        <h4>Dr. AI's Solution:</h4>
                        <p>{traumaSolution.solution}</p>
                        <div className="daily-practice">
                           <b>Daily Practice Alarm Set:</b> {traumaSolution.daily_practice}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="results-grid">
                  <div className="glass-card">
                    <h2>🧠 Model Breakdown</h2>
                    <div className="stat-box">
                      <div className="stat-label">Speech Pattern AI</div>
                      <div className="stat-value">{resultData.speech_analysis}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Text Sentiment (LSTM)</div>
                      <div className="stat-value">{resultData.lstm_analysis.sentiment}</div>
                    </div>
                    <div className="stat-box primary-stat">
                      <div className="stat-label">Combined Confidence</div>
                      <div className="stat-value">{(resultData.combined_prediction.confidence_score * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="glass-card exercise-card">
                    <h2>🧘‍♀️ Prescribed Exercises</h2>
                    <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Yoga" className="card-img" />
                    <ul className="exercise-list">
                      <li className="exercise-item">
                        <div className="exercise-icon">🌬️</div>
                        <div className="exercise-content">
                          <h4>4-7-8 Breathing (Alarm: 8:00 AM)</h4>
                          <p>Inhale 4s, hold 7s, exhale 8s to lower heart rate.</p>
                        </div>
                      </li>
                      <li className="exercise-item">
                        <div className="exercise-icon">🧊</div>
                        <div className="exercise-content">
                          <h4>Temperature Shock</h4>
                          <p>Hold an ice cube to disrupt panic attacks instantly.</p>
                        </div>
                      </li>
                    </ul>
                    <button className="btn-secondary w-100 mt-2" onClick={() => setTestStage('input')}>Retake Assessment</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="tab-fade-in">
             <div className="glass-card mb-2">
                <h2>📈 Your Wellness Journey</h2>
                <p>Track your mood and exercise completion day by day. SMS alarms are active.</p>
             </div>
             <div className="results-grid">
                <div className="glass-card">
                  <h3>Mood Level (Out of 10)</h3>
                  <div className="css-chart">
                    {dailyProgress.map((day, i) => (
                      <div key={i} className="chart-bar-container">
                        <div className="chart-bar" style={{height: `${day.mood * 10}%`, background: 'var(--primary)'}}>
                          <span className="bar-tooltip">Mood: {day.mood}/10</span>
                        </div>
                        <span className="chart-label">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card">
                  <h3>Exercises Completed</h3>
                  <div className="css-chart">
                    {dailyProgress.map((day, i) => (
                      <div key={i} className="chart-bar-container">
                        <div className="chart-bar" style={{height: `${day.exercises * 20}%`, background: 'var(--accent)'}}>
                          <span className="bar-tooltip">Ex: {day.exercises}</span>
                        </div>
                        <span className="chart-label">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* CHATBOT TAB */}
        {activeTab === 'chat' && (
          <div className="tab-fade-in chat-layout">
            <div className="glass-card chat-sidebar">
              <h3>Quick Topics</h3>
              <p>Click to ask:</p>
              <button className="quick-btn" onClick={() => handleQuickChatBtn("Connect me to a doctor")}>🩺 Find a Therapist</button>
              <button className="quick-btn" onClick={() => handleQuickChatBtn("What items slow down panic attacks?")}>🧊 Stop Panic</button>
              <button className="quick-btn" onClick={() => handleQuickChatBtn("What exercises for anxiety?")}>🧘‍♀️ Anxiety Relief</button>
              <button className="quick-btn" onClick={() => handleQuickChatBtn("How do I cope with trauma?")}>🛡️ Cope with Trauma</button>
              
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Therapist" style={{width:'100%', borderRadius:'12px', marginTop:'2rem'}} />
            </div>

            <div className="glass-card chatbot-container">
              <div className="chat-header">
                <h3>💬 AI Mental Health Assistant</h3>
                <span className="status-dot"></span> Online
              </div>
              <div className="chat-messages">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-bubble-wrapper ${msg.sender === 'bot' ? 'wrapper-bot' : 'wrapper-user'}`}>
                    <div className={`chat-bubble ${msg.sender === 'bot' ? 'chat-bot' : 'chat-user'}`}>
                      {msg.text}
                      {msg.type === 'doctor-list' && (
                        <div className="doctor-list">
                          {doctors.map((doc, idx) => (
                            <div key={idx} className="doctor-card">
                              <h4>{doc.name} <span>{doc.rating}</span></h4>
                              <p className="doc-spec">{doc.specialty}</p>
                              <p className="doc-phone">📞 {doc.phone}</p>
                              <p className="doc-details">{doc.details}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form className="chat-input-area" onSubmit={handleChat}>
                <input type="text" placeholder="Ask about exercises, doctors, trauma..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
                <button type="submit">Send ↗</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

import interviewData from "../data/interviewData.json" assert { type: "json" };

// In-memory store for sessions (for demo — replace with DB if needed)
const mockInterviewSessions = new Map();

export const startMockInterview = (req, res) => {
  const { role, company } = req.body;

  const roleQuestions = interviewData.questions[role?.toLowerCase()] || [];
  const companyTips = interviewData.tips[company] || [];

  if (roleQuestions.length === 0) {
    return res.status(404).json({ success: false, message: `No questions for role "${role}".` });
  }

  // Select 5 random questions
  const selectedQuestions = roleQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);

  // Create session ID
  const sessionId = Date.now().toString();

  // Save to session store
  mockInterviewSessions.set(sessionId, {
    questions: selectedQuestions,
    startTime: Date.now(),
    role,
    company,
  });

  res.status(200).json({
    success: true,
    sessionId,
    questions: selectedQuestions,
    tips: companyTips,
  });
};

export const submitMockInterview = (req, res) => {
  const { sessionId, answers } = req.body;

  const session = mockInterviewSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: "Invalid session ID." });
  }

  // Optional: Calculate time taken
  const endTime = Date.now();
  const durationSec = Math.floor((endTime - session.startTime) / 1000);

  // Scoring logic (for demo): 1 point per answered question
  const score = answers.filter(ans => ans && ans.trim() !== "").length;

  // Save session result (expandable to DB)
  session.score = score;
  session.duration = durationSec;
  session.answers = answers;

  mockInterviewSessions.set(sessionId, session);

  res.status(200).json({
    success: true,
    message: "Mock interview submitted.",
    score,
    total: session.questions.length,
    duration: durationSec,
    session,
  });
};

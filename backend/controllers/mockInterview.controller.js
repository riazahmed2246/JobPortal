import interviewData from "../data/interviewData.json" assert { type: "json" };

export const startMockInterview = (req, res) => {
  
  const { role, company } = req.body;

  const roleQuestions = interviewData.questions[role?.toLowerCase()] || [];
  
  const companyTips = interviewData.tips[company] || [];

  if (roleQuestions.length === 0) {
    
    return res.status(404).json({
      
      success: false,
      
      message: `No questions found for role "${role}".`,
    });
  }

  // Select 5 random questions
  
  const shuffled = roleQuestions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, 5);

  res.status(200).json({
    success: true,
    questions: selectedQuestions,
    tips: companyTips,
  });
};

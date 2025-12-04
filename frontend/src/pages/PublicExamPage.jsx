import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import api from "../utils/api";
import AdBlockRaw from "../components/ads/AdBlockRaw";
import AdBlockAtOptions from "../components/ads/AdBlockAtOptions";

export default function PublicExamPage() {
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  // State to trigger the ad refresh
  const [adKey, setAdKey] = useState(Math.random());

  // Fetch public questions
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/public/exam/questions");
        setQuestions(res.data.questions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <Box height="80vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  // No questions found
  if (!questions.length)
    return (
      <Container>
        <Typography>No demo questions available.</Typography>
      </Container>
    );

  // Submit demo exam
  const handleSubmit = async () => {
    const unselectedAnswers = Object.values(answers).some((sel) => !sel);

    if (unselectedAnswers) {
      alert("Please answer all questions before submitting.");
      return; // Do not submit if any question is unanswered
    }

    const payload = Object.entries(answers).map(([qId, sel]) => ({
      question_id: Number(qId),
      selected_option: sel,
    }));

    try {
      const res = await api.post("/public/exam/submit", { answers: payload });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Disable the "Next" button if the current question is unanswered
  const isNextDisabled = !answers[questions[qIndex]?.id];

  // Function to handle the "Next" button click
  const handleNext = () => {
    setQIndex(qIndex + 1);
    setAdKey(Math.random());  // Trigger ad refresh on Next
  };

  // Function to handle option selection
  const handleOptionSelect = (qId, selectedOption) => {
    setAnswers({ ...answers, [qId]: selectedOption });
    setAdKey(Math.random());  // Trigger ad refresh when an option is selected
  };

  // If result exists → show result page
  if (result)
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700}>
            Your Score: {result.score}%
          </Typography>

          <Typography sx={{ mt: 2 }}>
            Correct: {result.correct} | Wrong: {result.wrong} | Unselected: {result.unselected}
          </Typography>

          <Typography sx={{ mt: 2 }}>
            Detailed Analysis:
          </Typography>
          {result.analysis.map((item, idx) => (
            <Box key={idx} sx={{ mt: 1 }}>
              <Typography>
                Question {idx + 1}: Selected: {item.selected_option || "None"} | Correct: {item.correct_option}
                {item.is_correct ? " (Correct)" : item.is_wrong ? " (Wrong)" : " (No Answer)"}
              </Typography>
            </Box>
          ))}

          <Button
            variant="contained"
            sx={{ mt: 4, fontSize: "1.1rem", py: 1.5 }}
            fullWidth
            href="/register"
          >
            Create Free Account to Access Full CBT
          </Button>
        </Paper>

        {/* Ad Block 1 */}
        <Box sx={{ mt: 6 }}>
          <AdBlockRaw
            key={adKey}  // Use the adKey to trigger re-render of the ad
            scriptSrc="//pl28075655.effectivegatecpm.com/c9272b516636923aeedfc69498e5dd37/invoke.js"
            containerId="container-c9272b516636923aeedfc69498e5dd37"
          />
        </Box>

        {/* Ad Block 2 */}
        <Box sx={{ mt: 6 }}>
          <AdBlockAtOptions
            key={adKey}  // Use the adKey to trigger re-render of the ad
            adKey="efd800066af5754002a75671dd92ec61"
            id="ad-bottom-section"
            width={728}
            height={90}
          />
        </Box>
      </Container>
    );

  const q = questions[qIndex];
  const progress = ((qIndex + 1) / questions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} textAlign="center" mb={2}>
        Free CBT Demo Practice
      </Typography>

      <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Question {qIndex + 1} of {questions.length}
        </Typography>

        <Typography sx={{ mt: 2, mb: 3 }}>{q.question}</Typography>

        <Grid container spacing={2}>
          {["A", "B", "C", "D"].map((opt) => {
            const selected = answers[q.id] === opt;
            return (
              <Grid item xs={12} key={opt}>
                <Card
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderRadius: 2,
                    border: selected ? "2px solid #1976d2" : "1px solid #ccc",
                    background: selected ? "#e3f2fd" : "#fff",
                  }}
                  onClick={() => handleOptionSelect(q.id, opt)} // Update the answer and refresh ad
                >
                  <Typography>
                    <strong>{opt}.</strong> {q[`option_${opt.toLowerCase()}`]}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Navigation */}
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button
            variant="outlined"
            disabled={qIndex === 0}
            onClick={() => setQIndex(qIndex - 1)}
          >
            Previous
          </Button>

          {qIndex === questions.length - 1 ? (
            <Button variant="contained" color="error" onClick={handleSubmit} disabled={isNextDisabled}>
              Submit Demo
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isNextDisabled} // Disable Next button if unanswered
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* Ad Block 1 */}
      <Box sx={{ mt: 6 }}>
        <AdBlockRaw
          key={adKey}  // Use the adKey to trigger re-render of the ad
          scriptSrc="//pl28075655.effectivegatecpm.com/c9272b516636923aeedfc69498e5dd37/invoke.js"
          containerId="container-c9272b516636923aeedfc69498e5dd37"
        />
      </Box>

      {/* Ad Block 2 */}
      <Box sx={{ mt: 6 }}>
        <AdBlockAtOptions
          key={adKey}  // Use the adKey to trigger re-render of the ad
          adKey="efd800066af5754002a75671dd92ec61"
          id="ad-bottom-section"
          width={728}
          height={90}
        />
      </Box>
    </Container>
  );
}

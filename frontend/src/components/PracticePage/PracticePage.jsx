import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Timer from './Timer';
import PracticeQuestion from './PracticeQuestion';
import { Button, Snackbar, Alert, Typography } from '@mui/material';

export default function PracticePage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Start practice session when the page loads
    const startPractice = async () => {
      try {
        const response = await axios.get('/exam/practice/start');
        console.log('Fetched Questions:', response.data.questions); // Log the data to inspect the structure
        if (response.data.questions && response.data.questions.length > 0) {
          setQuestions(response.data.questions); // Set the questions from the response
        } else {
          setSnackbarMessage('No questions available.');
          setOpenSnackbar(true);
        }
        setLoading(false); // Set loading to false when data is loaded
      } catch (error) {
        console.error('Error starting the practice session', error);
        setSnackbarMessage('Error fetching questions.');
        setOpenSnackbar(true);
        setLoading(false); // Stop loading if there's an error
      }
    };

    startPractice();

    // Timer countdown every second
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerInterval);
          handleSubmit();
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval); // Cleanup on component unmount
  }, []);

  const handleAnswerChange = (questionId, option) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: option,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/exam/practice/submit');
      setIsCompleted(true);
      setSnackbarMessage('Practice completed! Please register to get detailed feedback.');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error submitting the practice session', error);
      setSnackbarMessage('Error submitting the practice session.');
      setOpenSnackbar(true);
    }
  };

  if (loading) {
    return <Typography variant="h6">Loading questions...</Typography>; // Display loading message while data is being fetched
  }

  if (!questions || questions.length === 0) {
    return <Typography variant="h6">No questions available. Please try again later.</Typography>; // Show if no questions are found
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Public Practice Session - Math
      </Typography>

      <Timer timeLeft={timeLeft} />

      {!isCompleted ? (
        <>
          <PracticeQuestion
            question={questions[currentQuestionIndex]}
            onAnswerChange={handleAnswerChange}
            answer={answers[questions[currentQuestionIndex]?.id]}
          />

          <div>
            <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>
            <Button onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1}>
              Next
            </Button>
          </div>
        </>
      ) : (
        <div>
          <Typography variant="h6">Session Complete</Typography>
          <Button onClick={() => window.location.href = "/register"} variant="contained">
            Register to View Results
          </Button>
        </div>
      )}

      {/* Snackbar for showing session completion */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="info">{snackbarMessage}</Alert>
      </Snackbar>
    </div>
  );
}

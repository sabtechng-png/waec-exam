import React from 'react';
import { Button, Card, Typography } from '@mui/material';

export default function PracticeQuestion({ question, onAnswerChange, answer }) {
  if (!question) {
    return <Typography variant="h6">Loading question...</Typography>; // Display loading message if question is undefined
  }

  const { question: questionText, option_a, option_b, option_c, option_d } = question;

  return (
    <Card variant="outlined" sx={{ padding: 3, marginBottom: 2 }}>
      <Typography variant="h6">{questionText}</Typography>

      <div>
        {['A', 'B', 'C', 'D'].map((opt) => {
          const optionKey = `option_${opt.toLowerCase()}`;
          const optionText = question[optionKey];
          if (!optionText) return null; // Skip if option text is missing

          return (
            <Button
              key={opt}
              variant={answer === opt ? 'contained' : 'outlined'}
              color={answer === opt ? 'primary' : 'default'}
              onClick={() => onAnswerChange(question.id, opt)}
              sx={{ margin: 1 }}
            >
              {opt}. {optionText || 'No Option'}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}

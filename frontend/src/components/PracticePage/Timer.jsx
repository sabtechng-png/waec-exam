import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

export default function Timer({ timeLeft }) {
  const [minutes, setMinutes] = useState(Math.floor(timeLeft / 60));
  const [seconds, setSeconds] = useState(timeLeft % 60);

  useEffect(() => {
    setMinutes(Math.floor(timeLeft / 60));
    setSeconds(timeLeft % 60);
  }, [timeLeft]);

  return (
    <Typography variant="h6">
      Time Remaining: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </Typography>
  );
}

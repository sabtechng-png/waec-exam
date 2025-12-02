import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

export default function SubmitModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Practice Completed</DialogTitle>
      <DialogContent>
        <p>You've completed the practice session. Please register to view detailed feedback.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => window.location.href = "/register"} color="primary">
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import api from "../../utils/api";

export default function ExamStartPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const startExam = async () => {
      try {
        const res = await api.post("/exam/start", { subject_id: subjectId });

        if (res.data?.exam?.id) {
          // Redirect to new session route
          navigate(`/exam/session/${res.data.exam.id}`);
        } else {
          alert("Unable to start exam");
          navigate("/dashboard/subjects");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Unable to start exam");
        navigate("/dashboard/subjects");
      }
    };

    startExam();
  }, [subjectId, navigate]);

  return (
    <Box height="70vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <CircularProgress />
      <Typography mt={2}>Preparing your exam...</Typography>
    </Box>
  );
}

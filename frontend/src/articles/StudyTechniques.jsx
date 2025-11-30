// ====================================================================
// File: src/articles/StudyTechniques.jsx
// Article: 7 Study Habits of High-Scoring Students
// SEO-Optimized, Long, AdSense-Ready
// ====================================================================

import { Typography, Divider } from "@mui/material";

export default function StudyTechniques() {
  return (
    <>
      {/* INTRO */}
      <Typography sx={{ mb: 2 }}>
        High-scoring students are not always the smartest — they are simply more
        strategic, consistent, and intentional about how they study. Research in
        cognitive psychology shows that learning effectively is not about long
        hours but about **using the right techniques**.
      </Typography>

      <Typography sx={{ mb: 3 }}>
        In this guide, you will learn 7 scientifically proven study techniques
        used by top-performing students in WAEC, JAMB, NECO, and university-level
        exams. These methods will help you study faster, remember more, and
        perform better under exam pressure.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* HABIT 1 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        1. Active Recall (The Most Powerful Study Technique)
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Active recall means testing yourself while studying. Instead of reading a
        page over and over, close the book and **try to remember the key ideas**.
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Read a short note</li>
        <li>Close the book</li>
        <li>Recall everything you can remember</li>
        <li>Check what you missed</li>
      </Typography>

      <Typography sx={{ mb: 3 }}>
        This method increases memory retention by up to **70%**, according to
        educational psychology research.
      </Typography>

      {/* HABIT 2 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        2. Spaced Repetition (Don’t Cram — Space It Out)
      </Typography>

      <Typography sx={{ mt: 2, mb: 3 }}>
        Spaced repetition means reviewing a topic at increasing time intervals.
        This strengthens long-term memory far more than cramming the night before
        an exam.
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Day 1 → Learn</li>
        <li>Day 3 → Review</li>
        <li>Day 7 → Review again</li>
        <li>Day 14 → Review again</li>
      </Typography>

      <Typography sx={{ mb: 3 }}>
        This method is used in top learning apps like Anki and Duolingo.
      </Typography>

      {/* HABIT 3 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        3. Practice Questions Under Exam Conditions
      </Typography>

      <Typography sx={{ mt: 2 }}>
        High-scoring students use practice questions — especially CBT tests — to
        master exam patterns and time management.
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Set a timer</li>
        <li>Avoid distractions</li>
        <li>Simulate real exam timing</li>
        <li>Review wrong answers immediately</li>
      </Typography>

      <Typography sx={{ mb: 3 }}>
        Practicing WAEC, JAMB, and NECO CBT questions on platforms like **CBT
        Master** increases speed and accuracy.
      </Typography>

      {/* HABIT 4 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        4. Focus on Understanding, Not Memorizing
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Top students understand concepts instead of memorizing blindly. When you
        understand a topic deeply, you can answer any question twist.
      </Typography>

      <Typography sx={{ mt: 1, mb: 3 }}>
        Ask yourself:
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Why does this formula work?</li>
        <li>Can I explain this topic to a friend?</li>
        <li>Can I solve variations of the question?</li>
      </Typography>

      {/* HABIT 5 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        5. Break Study Sessions Into Short Intervals (Pomodoro Technique)
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Instead of studying for 3 hours straight, break it into:
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>25 minutes reading</li>
        <li>5 minutes rest</li>
        <li>Repeat 4 times</li>
        <li>Take a 15-minute break</li>
      </Typography>

      <Typography sx={{ mb: 3 }}>
        This boosts focus, reduces fatigue, and improves productivity.
      </Typography>

      {/* HABIT 6 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        6. Teach Someone Else (Feynman Technique)
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Teaching is one of the most powerful ways to learn. If you explain a
        topic to someone else, you quickly discover the areas you don’t
        understand well.
      </Typography>

      <Typography sx={{ mb: 3 }}>
        Top students always revise by **teaching friends**, siblings, or even an
        imaginary audience.
      </Typography>

      {/* HABIT 7 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        7. Remove Distractions and Use a Dedicated Study Space
      </Typography>

      <Typography sx={{ mt: 2 }}>
        High-performing students create a personal study environment free from:
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Phone distractions</li>
        <li>Noise</li>
        <li>Social media notifications</li>
        <li>Clutter</li>
      </Typography>

      <Typography sx={{ mb: 3 }}>
        Environment affects concentration more than motivation.
      </Typography>

      <Divider sx={{ my: 4 }} />

      {/* ENDING */}
      <Typography sx={{ mb: 2 }}>
        Building these study habits gradually will transform the way you learn.
        If you practice consistently, you will remember more, understand better,
        and perform excellently in any exam — WAEC, JAMB, NECO, or university
        tests.
      </Typography>

      <Typography>
        Ready to practice smarter? Explore CBT Master’s free CBT exam
        simulations.
      </Typography>
    </>
  );
}

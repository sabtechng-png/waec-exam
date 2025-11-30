// ======================================================================
// File: src/articles/WaecMathsGuide.jsx
// Article: WAEC Mathematics – Complete Master Guide
// ======================================================================

import { Typography, Divider } from "@mui/material";

export default function WaecMathsGuide() {
  return (
    <>
      {/* INTRO */}
      <Typography sx={{ mb: 2 }}>
        Mathematics is one of the most feared subjects in WAEC, yet it is also
        one of the most scoring — if you understand the right topics. WAEC does
        not ask random questions; it repeatedly tests specific core concepts year
        after year.
      </Typography>

      <Typography sx={{ mb: 3 }}>
        This guide explains the most important WAEC Mathematics topics, shows you
        how to study them, and includes sample exam-style questions with
        solutions. If you follow this structure, you will build confidence and
        drastically improve your maths score.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* SECTION 1 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        1. Most Important Topics for WAEC Mathematics
      </Typography>

      <Typography sx={{ mt: 2 }}>
        The following topics contribute over 80% of WAEC Maths questions:
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Algebra and Quadratics</li>
        <li>Indices and Logarithms</li>
        <li>Trigonometry</li>
        <li>Mensuration (length, area, volume)</li>
        <li>Statistics and Probability</li>
        <li>Geometry and Construction</li>
        <li>Number bases</li>
        <li>Simultaneous equations</li>
        <li>Graph interpretation</li>
      </Typography>

      <Typography sx={{ mb: 3 }}>
        WAEC loves calculations, not theory. You must practice frequently.
      </Typography>

      {/* SECTION 2 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        2. Algebra – The Foundation of WAEC Maths
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Algebra appears in almost every WAEC paper. Key areas include:
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Simplifying expressions</li>
        <li>Factorization</li>
        <li>Quadratic equations</li>
        <li>Word problems</li>
        <li>Variation</li>
      </Typography>

      <Typography sx={{ fontWeight: 700 }}>Sample Question:</Typography>
      <Typography sx={{ mt: 1 }}>
        Solve: <strong>x² – 5x + 6 = 0</strong>
      </Typography>

      <Typography sx={{ mt: 1 }}>
        Factorize: (x – 2)(x – 3)  
        Solutions: <strong>x = 2 or x = 3</strong>
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* SECTION 3 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        3. Indices and Logarithms – High Scoring Topic
      </Typography>

      <Typography sx={{ mt: 2 }}>
        WAEC frequently tests:
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Laws of indices</li>
        <li>Standard form</li>
        <li>Simple logarithms</li>
      </Typography>

      <Typography sx={{ fontWeight: 700 }}>Sample Question:</Typography>
      <Typography sx={{ mt: 1 }}>
        Simplify: 2³ × 2⁵
      </Typography>

      <Typography sx={{ mt: 1 }}>
        2³ × 2⁵ = 2⁸ = <strong>256</strong>
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* SECTION 4 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        4. Trigonometry – Sine, Cosine, and Tangent
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Trigonometry questions usually involve angle calculations or solving
        right-angled triangles.
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>SOH-CAH-TOA</li>
        <li>Finding missing sides or angles</li>
        <li>Heights and distances</li>
      </Typography>

      <Typography sx={{ fontWeight: 700 }}>Sample Question:</Typography>
      <Typography sx={{ mt: 1 }}>
        In a right-angled triangle, opposite = 6 cm, hypotenuse = 10 cm.  
        Find the sine of angle θ.
      </Typography>

      <Typography sx={{ mt: 1 }}>
        sin θ = 6/10 = <strong>0.6</strong>
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* SECTION 5 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        5. Mensuration – Area and Volume
      </Typography>

      <Typography sx={{ mt: 2 }}>
        WAEC loves questions involving geometric shapes. Focus on formulas for:
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Area of circles, trapeziums, triangles</li>
        <li>Surface area of cylinders and cones</li>
        <li>Volume of solids</li>
      </Typography>

      <Typography sx={{ mt: 1 }}>
        Formula tip: Always memorize π = 22/7 or 3.142.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* SECTION 6 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        6. Geometry – Angles and Construction
      </Typography>

      <Typography sx={{ mt: 2 }}>
        You must understand:
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Parallel line angle rules</li>
        <li>Interior and exterior angles</li>
        <li>Polygons</li>
        <li>Circle theorems</li>
        <li>Construction using compass</li>
      </Typography>

      <Typography sx={{ fontWeight: 700 }}>Sample Question:</Typography>
      <Typography sx={{ mt: 1 }}>
        Find the exterior angle of a regular hexagon.
      </Typography>

      <Typography sx={{ mt: 1 }}>
        Exterior angle = 360/6 = <strong>60°</strong>
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* SECTION 7 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        7. Statistics and Probability
      </Typography>

      <Typography sx={{ mt: 2 }}>
        These topics are easy marks if you practice:
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Mean, median, mode</li>
        <li>Bar charts & histograms</li>
        <li>Pie charts</li>
        <li>Basic probability</li>
      </Typography>

      <Typography sx={{ fontWeight: 700 }}>Sample Question:</Typography>
      <Typography sx={{ mt: 1 }}>
        If P(A) = 0.3, P(B) = 0.2 and A, B are independent,  
        find P(A ∩ B).
      </Typography>

      <Typography sx={{ mt: 1 }}>
        P(A ∩ B) = 0.3 × 0.2 = <strong>0.06</strong>
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* SECTION 8 */}
      <Typography variant="h4" fontWeight={700} sx={{ mt: 3 }}>
        8. How to Study WAEC Mathematics Effectively
      </Typography>

      <Typography component="ul" sx={{ pl: 3, mb: 3 }}>
        <li>Practice at least 20–40 questions daily</li>
        <li>Focus on the most repeated topics</li>
        <li>Understand formulas (don’t cram blindly)</li>
        <li>Solve past questions under timed conditions</li>
        <li>Watch short explanation videos</li>
        <li>Revise errors and solve similar problems</li>
      </Typography>

      {/* ENDING */}
      <Divider sx={{ my: 4 }} />

      <Typography sx={{ mb: 2 }}>
        WAEC Mathematics becomes easy when you master the right topics and
        practice consistently. Focus on understanding concepts rather than
        memorizing steps. With continuous practice, your speed and accuracy will
        increase, and you will perform far better in the exam.
      </Typography>

      <Typography>
        Start solving WAEC Maths past questions on CBT Master to boost your
        preparation.
      </Typography>
    </>
  );
}

import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";

export default function PremiumPage() {
  const handleSubscribe = () => {
    // TODO: connect Flutterwave / Paystack / Stripe
    alert("Premium payment gateway will open here.");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 10 }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          borderRadius: 4,
          textAlign: "center",
          boxShadow: "0 25px 80px rgba(0,0,0,0.1)",
        }}
      >
        <Chip
          icon={<StarIcon />}
          label="CBT Master Premium"
          color="primary"
          sx={{ borderRadius: 2, fontWeight: 700, mb: 2 }}
        />

        <Typography variant="h4" fontWeight={800}>
          Upgrade to Premium
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: "auto", mt: 1, mb: 4 }}
        >
          Remove ads, unlock unlimited practice and enjoy an improved CBT experience.
          Support our mission to keep CBT Master free for all students.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                borderRadius: 3,
                height: "100%",
                borderColor: "rgba(148,163,184,0.5)",
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom>
                What's Included
              </Typography>

              <List dense>
                {[
                  "100% Ad-Free Experience",
                  "Unlimited CBT Practice Sessions",
                  "Detailed Performance Analytics",
                  "Topic-Level Strength & Weakness Report",
                  "Premium Priority Support",
                  "Exclusive Subjects & Mock Exams",
                  "Faster Loading & No Distractions",
                ].map((benefit, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Pricing Card */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 3,
                textAlign: "center",
                border: "2px solid #3b82f6",
              }}
            >
              <Typography variant="h5" fontWeight={700}>
                Premium Plan
              </Typography>

              <Typography variant="h3" fontWeight={800} sx={{ mt: 2 }}>
                ₦1,500<span style={{ fontSize: 16 }}>/month</span>
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                or <strong>₦15,000 yearly</strong> (save 20%)
              </Typography>

              <Button
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  borderRadius: 999,
                  px: 6,
                  py: 1.5,
                  fontWeight: 700,
                }}
                onClick={handleSubscribe}
              >
                Go Premium
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 2 }}
              >
                Cancel anytime · Instant activation
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

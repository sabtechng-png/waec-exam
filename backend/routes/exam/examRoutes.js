const express = require("express");
const router = express.Router();

router.use("/", require("./examStartRoutes"));
router.use("/", require("./examAnswerRoutes"));
router.use("/", require("./examSubmitRoutes"));
router.use("/", require("./examResultRoutes"));

router.use("/english-exam", require("./english/englishStartRoutes"));
router.use("/english-exam", require("./english/englishQuestionRoutes"));
router.use("/english-exam", require("./english/englishAnswerRoutes"));
router.use("/english-exam", require("./english/englishSubmitRoutes"));

router.use("/", require("./examSessionRoutes"));


module.exports = router;

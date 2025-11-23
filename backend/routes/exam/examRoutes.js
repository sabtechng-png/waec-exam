const express = require("express");
const router = express.Router();

router.use("/", require("./examStartRoutes"));
router.use("/", require("./examAnswerRoutes"));
router.use("/", require("./examSubmitRoutes"));
router.use("/", require("./examResultRoutes"));

module.exports = router;

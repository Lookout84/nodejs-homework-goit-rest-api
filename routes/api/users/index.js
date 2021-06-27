const express = require("express");
const router = express.Router();
const ctrl = require("../../../controllers/users");
const guard = require("../../../helpers/guard");
const upload = require("../../../helpers/upload");

const {
  validationCreateUser,
  validationLoginUser,
  validationUpdateUserSubscription,
} = require("./validation");

router.post("/register", validationCreateUser, ctrl.register);
router.post("/login", validationLoginUser, ctrl.login);
router.post("/logout", guard, ctrl.logout);
router.get("/current", guard, ctrl.currentUser);
router.patch(
  "/",
  guard,
  validationUpdateUserSubscription,
  ctrl.updateUserSubscription
);
router.patch(
  "/avatars",
  guard,
  upload.single("avatarUrl"),
  ctrl.updateUserAvatar
);
router.get("/verify/:verificationToken", ctrl.verify);
router.post("/verify", ctrl.repeatEmailVerification);

module.exports = router;

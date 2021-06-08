const express = require("express");
const router = express.Router();
const ctrl = require("../../../controllers/contacts");
const guard = require("../../../helpers/guard");

const {
  validationCreateContact,
  validationUpdateContact,
  validationUpdateFavoriteStatus,
  validateContactId,
} = require("./validation");

router.use((req, res, next) => {
  console.log(req.url);
  next();
});

router
  .get("/", guard, ctrl.listContacts)
  .post("/", guard, validationCreateContact, ctrl.addContact);

router
  .get("/:contactId", guard, validateContactId, ctrl.getContactById)
  .delete("/:contactId", guard, validateContactId, ctrl.removeContact)
  .put(
    "/:contactId", guard,
    validateContactId,
    validationUpdateContact,
    ctrl.updateContact
  );

router.patch(
  "/:contactId/favorite", guard,
  validateContactId,
  validationUpdateFavoriteStatus,
  ctrl.updateStatusContact
);

module.exports = router;

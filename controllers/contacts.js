const Contacts = require("../repositories/contacts");
const { HttpCode } = require("../helpers/constants");

const listContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { docs: contacts, ...rest } = await Contacts.listContacts(
      userId,
      req.query
    );
    return res.json({
      status: "success",
      code: HttpCode.OK,
      data: { contacts, ...rest },
    });
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.getContactById(userId, req.params.contactId);
    if (contact) {
      return res.json({
        status: "success",
        code: HttpCode.OK,
        data: { contact },
      });
    }
    return res.status(HttpCode.NOT_FOUND).json({
      status: "error",
      code: HttpCode.NOT_FOUND,
      message: "Not found",
    });
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.addContact(userId, req.body);
    if (contact) {
      return res
        .status(HttpCode.CREATED)
        .json({ status: "success", code: HttpCode.CREATED, data: { contact } });
    }
    return res.status(HttpCode.BAD_REQUEST).json({
      status: "error",
      code: HttpCode.BAD_REQUEST,
      message: "missing required name field",
    });
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conatct = await Contacts.removeContact(userId, req.params.contactId);
    if (conatct) {
      return res.json({
        status: "success",
        code: HttpCode.OK,
        data: { conatct },
      });
    }
    return res.status(HttpCode.NOT_FOUND).json({
      status: "error",
      code: HttpCode.NOT_FOUND,
      message: "Not found",
    });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conatct = await Contacts.updateContact(
      userId,
      req.params.contactId,
      req.body
    );
    if (conatct) {
      return res.json({
        status: "success",
        code: HttpCode.OK,
        data: { conatct },
      });
    }
    return res.status(HttpCode.NOT_FOUND).json({
      status: "error",
      code: HttpCode.NOT_FOUND,
      message: "Not found",
    });
  } catch (error) {
    next(error);
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.updateContact(
      userId,
      req.params.contactId,
      req.body
    );
    if (contact) {
      return res.json({
        status: "success",
        code: HttpCode.OK,
        data: { contact },
      });
    }
    return res.status(HttpCode.NOT_FOUND).json({
      status: "error",
      code: HttpCode.NOT_FOUND,
      message: "Not found",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};

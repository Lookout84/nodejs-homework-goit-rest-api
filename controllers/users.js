const Users = require("../repositories/users");
const { HttpCode } = require("../helpers/constants");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fs = require('fs/promises');
const path = require('path');
const UploadAvatarService = require("../services/local-upload");
const EmailService = require('../services/email');
const {
  CreateSenderNodemailer
} = require('../services/email-sender');
const SECRET_KEY = process.env.SECRET_KEY;

const register = async (req, res, next) => {
  try {
    const userEmail = await Users.findByEmail(req.body.email);
    const userName = await Users.findByName(req.body.name);
    if (userEmail || userName) {
      return res.status(HttpCode.CONFLICT).json({
        status: "error",
        code: HttpCode.CONFLICT,
        message: "Email or name in use",
      });
    }

    const { id, name, email, subscription, avatarURL, verifyToken } = await Users.create(
      req.body
    );

    try {
      const emailService = new EmailService(
        process.env.NODE_ENV,
        new CreateSenderNodemailer(),
      )
      await emailService.sendVerifyEmail(verifyToken, email, name)
    } catch (error) {
      console.log(error.message)
    }

    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      user: { id, name, email, subscription, avatarURL },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);
    const isValidPassword = await user?.isValidPassword(req.body.password);
    if (!user || !isValidPassword || !user.verify) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        message: "Email or password is wrong",
      });
    }
    const id = user.id;
    const subscription = user.subscription;
    const payload = { id, subscription };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });
    await Users.updateToken(id, token);
    return res.json({ status: "OK", code: HttpCode.OK, data: { token } });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const id = req.user.id;
    await Users.updateToken(id, null);
    return res.status(HttpCode.NO_CONTENT).json({ status: "No Content" });
  } catch (error) {
    next(error);
  }
};

const currentUser = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { name, email, subscription } = await Users.findById(id);
    return res.status(HttpCode.OK).json({
      status: "OK",
      code: HttpCode.OK,
      user: { name, email, subscription },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserSubscription = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    const id = req.user.id;
    await Users.updateUserSubscription({ _id: id }, subscription);
    return res.status(HttpCode.OK).json({
      status: "OK",
      code: HttpCode.OK,
      user: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserAvatar = async (req, res, next) => {
  try {
    const id = req.user.id;
    const uploads = new UploadAvatarService(process.env.PUBLIC_DIR);
    const avatarUrl = await uploads.saveAvatar({ idUser: id, file: req.file });

    try {
      await fs.unlink(path.join(process.env.PUBLIC_DIR, req.user.avatarUrl));
    } catch (error) {
      console.log(error.message);
    }

    await Users.updateUserAvatar(id, avatarUrl);
    res.json({ status: "success", code: HttpCode.OK, data: { avatarUrl } });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const user = await Users.findByVerifyToken(req.params.verificationToken)
    if (user) {
      await Users.updateTokenVerify(user.id, true, null)
      return res.json({
        status: "success",
        code: HttpCode.OK,
        data: { message: 'Verification successful!' },
      })
    }
    return res.status(HttpCode.BAD_REQUEST).json({
      status: "error",
      code: HttpCode.BAD_REQUEST,
      message: "Verification has already been passed",
    })
  } catch (error) {
    next(error)
  }
}

const repeatEmailVerification = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email)
    if (user) {
      const { name, email, verify, verifyToken } = user
      if (!verify) {
        const emailService = new EmailService(
          process.env.NODE_ENV,
          new CreateSenderNodemailer(),
        )
        await emailService.sendVerifyEmail(verifyToken, email, name)
        return res.json({
          status: "success",
          code: HttpCode.OK,
          data: { message: 'Verification email sent' },
        })
      }
      return res.status(HttpCode.CONFLICT).json({
        status: "error",
        code: HttpCode.CONFLICT,
        message: "Email has been verified",
      })
    }
    return res.status(HttpCode.NOT_FOUND).json({
      status: 'error',
      code: HttpCode.NOT_FOUND,
      message: 'User not found',
    })
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  currentUser,
  updateUserSubscription,
  updateUserAvatar,
  verify,
  repeatEmailVerification,
};

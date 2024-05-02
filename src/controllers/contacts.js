const contactsRouter = require("express").Router();
const { body, param, query, validationResult } = require("express-validator");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const converter = require("json-2-csv");
const Contact = require("../models/contact");

const storage = multer.diskStorage({
  destination(req, res, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const fileName = `${uuid().replace(/-/g, "")}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

contactsRouter.post(
  "/",
  upload.single("avatar"),
  [
    body("name").notEmpty().withMessage("name is required"),
    body("phones").isArray().withMessage("phones must be an array"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const newContact = {
        name: req.body.name,
        phones: req.body.phones,
      };

      if (req.file) {
        newContact.avatar_url = `${req.protocol}://${req.hostname}/${req.file.path}`;
      }

      const contact = await Contact.create(newContact);

      return res.status(201).json({
        data: {
          contact,
        },
      });
    } catch (error) {
      return res.json(error);
    }
  },
);

contactsRouter.delete(
  "/:id",
  [param("id").notEmpty().withMessage("contact id is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await Contact.deleteOne({ _id: req.params.id });
      return res.json({
        message: "contact deleted successfully",
      });
    } catch (error) {
      return res.json(error);
    }
  },
);

contactsRouter.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find({});
    return res.json({
      data: {
        contacts,
      },
    });
  } catch (error) {
    return res.json(error);
  }
});

contactsRouter.get(
  "/search",
  [
    query("query")
      .isString()
      .withMessage("query is required, it can either name or phone number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          errors: errors.array(),
        });
      }

      const contacts = await Contact.find({
        $or: [
          { name: { $regex: req.query.query, $options: "i" } },
          { phones: { $regex: req.query.query, $options: "i" } },
        ],
      });

      return res.json({
        data: {
          contacts,
        },
      });
    } catch (error) {
      return res.json(error);
    }
  },
);

contactsRouter.patch(
  "/:id",
  upload.single("avatar"),
  [
    body("name").optional().isString().withMessage("name must be a string"),
    body("phones").optional().isArray().withMessage("phones must be an array"),
    body("phones.*")
      .isString()
      .withMessage("each element of the array must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({
          errors: errors.array(),
        });
      }

      const updatedContact = {};

      const { name, phones } = req.body;

      if (name) updatedContact.name = name;
      if (phones) updatedContact.phones = phones;
      if (req.file)
        updatedContact.avatar_url = `${req.protocol}://${req.hostname}/${req.file.path}`;

      const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        updatedContact,
        { new: true },
      );

      return res.json({
        data: {
          contact,
        },
      });
    } catch (error) {
      return res.json(error);
    }
  },
);

contactsRouter.get("/export", async (req, res) => {
  try {
    const contacts = await Contact.find({});
    const csv = await converter.json2csv(JSON.parse(JSON.stringify(contacts)));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename:contacts.csv");

    return res.send(csv);
  } catch (error) {
    return res.json(error);
  }
});

module.exports = contactsRouter;

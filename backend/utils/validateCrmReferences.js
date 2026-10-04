const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const Company = require("../models/Company");

async function validateCrmReferences({ contact, company }, ownerId) {
  if (contact != null && !mongoose.isValidObjectId(contact)) return false;
  if (company != null && !mongoose.isValidObjectId(company)) return false;

  const [contactExists, companyExists] = await Promise.all([
    contact == null ? true : Contact.exists({ _id: contact, owner: ownerId }),
    company == null ? true : Company.exists({ _id: company, owner: ownerId }),
  ]);

  return Boolean(contactExists && companyExists);
}

module.exports = validateCrmReferences;
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
}, { collection: "admins", timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

async function seed() {
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is missing from .env");

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_NAME) {
    throw new Error("ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME must be set in .env before seeding the admin.");
  }

  await mongoose.connect(process.env.MONGO_URL);
  const email = String(process.env.ADMIN_EMAIL).toLowerCase().trim();
  const name = String(process.env.ADMIN_NAME).trim();
  const password = await bcrypt.hash(String(process.env.ADMIN_PASSWORD), 12);

  await Admin.updateOne(
    { email },
    { $set: { email, password, name } },
    { upsert: true }
  );

  console.log(`Admin seeded successfully: ${email}`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

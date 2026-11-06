require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sams_db');
  const user = await User.findOne({ email: 'priyal@gmail.com' });
  if (!user) throw new Error('Account missing');

  const candidates = ['Student@123', '123456', '12345678', 'Priyal@123', 'priyal123'];
  const matches = [];
  for (const password of candidates) {
    if (await user.comparePassword(password)) matches.push(password);
  }

  console.log(JSON.stringify({ email: user.email, commonPasswordMatches: matches }, null, 2));
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error(error.message || error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

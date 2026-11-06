require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sams_db';

async function inspectDB() {
  try {
    await mongoose.connect(uri);
    console.log('1. Database Connection: SUCCESS');
    console.log('2. Configured Database Name:', mongoose.connection.name);
    console.log('   Connection Host:', mongoose.connection.host);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n3. Existing Collections in Database:');
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      console.log('   - ' + c.name + ': ' + count + ' documents');
    }

    console.log('\n4. All Accounts in users collection:');
    const allUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    allUsers.forEach((u) => {
      console.log(
        '   - Role: ' +
          u.role +
          ' | Name: ' +
          u.name +
          ' | Email: ' +
          u.email +
          ' | ID: ' +
          u._id +
          ' | studentRef: ' +
          u.student +
          ' | studentId: ' +
          u.studentId
      );
    });

    console.log('\n5. Checking Student Profile for each Student User:');
    for (const u of allUsers) {
      if (u.role === 'student') {
        const studentByRef = (u.student || u.studentId)
          ? await mongoose.connection.db.collection('students').findOne({ _id: u.student || u.studentId })
          : null;
        const studentByEmail = await mongoose.connection.db.collection('students').findOne({ email: u.email });
        const studentByUserId = await mongoose.connection.db.collection('students').findOne({
          $or: [{ userId: u._id }, { user: u._id }],
        });

        const found = studentByRef || studentByEmail || studentByUserId;
        console.log('   User ' + u.email + ':');
        if (found) {
          console.log(
            '     -> Student Profile Found! RegNo: ' +
              found.registrationNumber +
              ', Name: ' +
              (found.fullName || found.name) +
              ', Course: ' +
              found.course +
              ', userId on Student: ' +
              (found.userId || found.user)
          );
        } else {
          console.log('     -> MISSING STUDENT PROFILE! No record in students collection.');
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Inspection error:', err);
    process.exit(1);
  }
}

inspectDB();

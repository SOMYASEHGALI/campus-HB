// Migration script to add isActive field to existing users
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const migrateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update all users without isActive field
        const result = await User.updateMany(
            { isActive: { $exists: false } },
            { $set: { isActive: true } }
        );

        console.log(`Migration complete: ${result.modifiedCount} users updated`);

        // Verify
        const users = await User.find({}, 'email isActive');
        console.log('\nAll users:');
        users.forEach(user => {
            console.log(`- ${user.email}: isActive = ${user.isActive}`);
        });

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
};

migrateUsers();

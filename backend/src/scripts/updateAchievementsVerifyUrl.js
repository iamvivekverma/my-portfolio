const mongoose = require('mongoose');
const { AchievementsModel } = require('../models/AchievementsModel');
require('dotenv').config();

const updateAchievements = async () => {
  try {
    // Connect to MongoDB using .env file
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all achievements
    const achievements = await AchievementsModel.find({});
    console.log(`Found ${achievements.length} achievements`);

    // Update each achievement with WhatsApp verifyUrl
    const updatePromises = achievements.map(async (achievement) => {
      const phoneNumber = '917209640726'; // Your actual WhatsApp number (91 for India)
      const message = encodeURIComponent(`Hey Vivek, I want to look at your certificate: ${achievement.title} from ${achievement.issuer}. Can you share the details?`);
      const verifyUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      
      await AchievementsModel.findByIdAndUpdate(achievement._id, { verifyUrl });
      console.log(`Updated: ${achievement.title} with WhatsApp verifyUrl`);
    });

    await Promise.all(updatePromises);
    console.log('All achievements updated successfully');

  } catch (error) {
    console.error('Error updating achievements:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

updateAchievements();

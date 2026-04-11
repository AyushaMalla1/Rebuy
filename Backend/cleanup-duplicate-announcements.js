const mongoose = require('mongoose');
require('dotenv').config();

const Announcement = require('./models/Announcement');

async function cleanupDuplicateAnnouncements() {
  try {
    // Connect to PRODUCTION database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database');

    console.log('\n🧹 Cleaning up duplicate announcements...\n');

    // Get all announcements
    const allAnnouncements = await Announcement.find({}).sort({ createdAt: 1 });
    console.log(`Found ${allAnnouncements.length} total announcements`);

    // Group by title and content to find duplicates
    const seen = new Map();
    const duplicateIds = [];

    for (const announcement of allAnnouncements) {
      const key = `${announcement.title}|${announcement.content}`;
      
      if (seen.has(key)) {
        // This is a duplicate, mark for deletion
        duplicateIds.push(announcement._id);
      } else {
        // First occurrence, keep it
        seen.set(key, announcement._id);
      }
    }

    console.log(`Found ${duplicateIds.length} duplicate announcements`);
    console.log(`Keeping ${seen.size} unique announcements`);

    if (duplicateIds.length > 0) {
      const result = await Announcement.deleteMany({
        _id: { $in: duplicateIds }
      });
      console.log(`✅ Deleted ${result.deletedCount} duplicate announcements`);
    }

    // Also delete any test announcements
    const testAnnouncements = await Announcement.deleteMany({
      $or: [
        { title: { $regex: /test/i } },
        { content: { $regex: /test announcement/i } }
      ]
    });
    console.log(`✅ Deleted ${testAnnouncements.deletedCount} test announcements`);

    console.log('\n✅ Cleanup completed successfully!\n');

    // Show remaining announcements
    const remaining = await Announcement.countDocuments();
    console.log(`📊 Remaining announcements: ${remaining}`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
}

cleanupDuplicateAnnouncements();

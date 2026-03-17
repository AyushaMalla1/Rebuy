const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rebuy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Remove sellers with null sellerId
    const result = await mongoose.connection.db.collection('sellers').deleteMany({ 
      sellerId: null 
    });
    console.log(`Deleted ${result.deletedCount} sellers with null sellerId`);
    
    // Drop the problematic index
    try {
      await mongoose.connection.db.collection('sellers').dropIndex('sellerId_1');
      console.log('Dropped sellerId_1 index');
    } catch (err) {
      console.log('Index already dropped or does not exist');
    }
    
    console.log('Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

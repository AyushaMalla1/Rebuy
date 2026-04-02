const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products
    const products = await Product.find({})
      .select('name price category description stock')
      .limit(50);

    console.log(`📊 Total products in database: ${products.length}\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found in database!');
      return;
    }

    // Group by category
    const byCategory = {};
    products.forEach(p => {
      if (!byCategory[p.category]) {
        byCategory[p.category] = [];
      }
      byCategory[p.category].push(p);
    });

    console.log('📋 Products by Category:\n');
    Object.entries(byCategory).forEach(([category, prods]) => {
      console.log(`${category} (${prods.length} products):`);
      prods.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name}: NPR ${p.price} (Stock: ${p.stock})`);
      });
      console.log('');
    });

    console.log('\n✅ These are your ACTUAL products that the chatbot should use!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkProducts();

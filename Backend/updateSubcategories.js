const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thrift-store', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Function to guess subcategory from product name
function guessSubcategory(name, category) {
  const nameLower = name.toLowerCase();
  
  if (category === "Men's Collection") {
    if (nameLower.includes('hoodie') || nameLower.includes('sweatshirt')) {
      return 'Hoodie';
    } else if (nameLower.includes('pant') || nameLower.includes('trouser') || nameLower.includes('jean')) {
      return 'Pants';
    } else if (nameLower.includes('jacket') || nameLower.includes('coat') || nameLower.includes('blazer')) {
      return 'Jacket';
    } else {
      return 'Other';
    }
  } else if (category === "Women's Collection") {
    if (nameLower.includes('skirt') || nameLower.includes('midi') || nameLower.includes('pleated')) {
      return 'Skirt';
    } else if (nameLower.includes('blazer')) {
      return 'Blazer';
    } else if (nameLower.includes('top') || nameLower.includes('blouse') || nameLower.includes('shirt') || nameLower.includes('tee')) {
      return 'Top';
    } else {
      return 'Other';
    }
  }
  
  return 'Other';
}

async function updateSubcategories() {
  try {
    console.log('Starting subcategory update...');
    
    // First, let's see all products
    const allProducts = await Product.find({});
    console.log(`Total products in database: ${allProducts.length}`);
    
    // Show first few products with their subcategories
    console.log('\nFirst 5 products:');
    allProducts.slice(0, 5).forEach(p => {
      console.log(`- ${p.name}: category="${p.category}", subcategory="${p.subcategory}"`);
    });
    
    // Find all products without subcategories
    const products = await Product.find({
      $or: [
        { subcategory: { $exists: false } },
        { subcategory: null },
        { subcategory: '' }
      ]
    });
    
    console.log(`\nFound ${products.length} products without subcategories`);
    
    let updated = 0;
    for (const product of products) {
      const subcategory = guessSubcategory(product.name, product.category);
      product.subcategory = subcategory;
      await product.save();
      console.log(`Updated: ${product.name} -> ${subcategory}`);
      updated++;
    }
    
    console.log(`\nSuccessfully updated ${updated} products!`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating subcategories:', error);
    process.exit(1);
  }
}

updateSubcategories();

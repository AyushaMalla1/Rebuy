const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

const Product = require('./models/Product');
const Seller = require('./models/Seller');

// Real thrift store products with proper image URLs
const thriftProducts = [
  {
    name: 'Vintage Levi\'s 501 Jeans',
    description: 'Classic 90s Levi\'s 501 jeans in excellent condition. Authentic vintage denim with original button fly. Perfect for that retro look.',
    price: 3500,
    category: 'Men',
    condition: 'Vintage',
    size: '32x34',
    brand: 'Levi\'s',
    stock: 1,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
    story: 'Found in a vintage collection from the 90s. These jeans have been worn but maintained beautifully. Original Levi\'s quality that lasts decades.',
    tags: ['vintage', 'denim', 'levis', '90s']
  },
  {
    name: 'Retro Nike Windbreaker',
    description: 'Authentic 80s Nike windbreaker jacket. Vibrant colors, lightweight, perfect for spring. Rare find!',
    price: 4200,
    category: 'Men',
    condition: 'Like New',
    size: 'L',
    brand: 'Nike',
    stock: 1,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
    story: 'This windbreaker is from the golden era of Nike sportswear. Barely worn, kept in pristine condition.',
    tags: ['nike', 'windbreaker', '80s', 'sportswear']
  },
  {
    name: 'Vintage Band T-Shirt',
    description: 'Original concert t-shirt from the 90s. Soft, worn-in cotton. Perfect vintage condition.',
    price: 2800,
    category: 'Men',
    condition: 'Slightly Used',
    size: 'M',
    brand: 'Unbranded',
    stock: 2,
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
    story: 'Concert merchandise from the 90s rock era. The faded print adds to its authentic vintage charm.',
    tags: ['vintage', 'band', 'concert', '90s']
  },
  {
    name: 'Thrifted Leather Jacket',
    description: 'Genuine leather jacket with classic biker style. Well-maintained, soft leather with character.',
    price: 8500,
    category: 'Men',
    condition: 'Vintage',
    size: 'L',
    brand: 'Unknown',
    stock: 1,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
    story: 'This leather jacket has stories to tell. Each scratch and patina mark adds character. Real leather that improves with age.',
    tags: ['leather', 'jacket', 'biker', 'vintage']
  },
  {
    name: 'Vintage Flannel Shirt',
    description: 'Classic plaid flannel shirt. Soft, comfortable, perfect for layering. True vintage quality.',
    price: 1800,
    category: 'Men',
    condition: 'Slightly Used',
    size: 'L',
    brand: 'Unbranded',
    stock: 3,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800'],
    story: 'Authentic flannel from the grunge era. The kind of shirt that gets better with every wash.',
    tags: ['flannel', 'plaid', 'grunge', '90s']
  },
  {
    name: 'Retro Adidas Track Jacket',
    description: 'Classic Adidas track jacket with iconic three stripes. Vintage sportswear at its finest.',
    price: 3800,
    category: 'Men',
    condition: 'Like New',
    size: 'M',
    brand: 'Adidas',
    stock: 1,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
    story: 'From the golden age of Adidas sportswear. Barely worn, kept in excellent condition.',
    tags: ['adidas', 'track', 'sportswear', 'vintage']
  },
  {
    name: 'Vintage Denim Jacket',
    description: 'Classic denim jacket with perfect fade. Timeless style that never goes out of fashion.',
    price: 4500,
    category: 'Women',
    condition: 'Vintage',
    size: 'M',
    brand: 'Levi\'s',
    stock: 1,
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800'],
    story: 'This denim jacket has been loved and worn. The natural fading creates a unique, one-of-a-kind piece.',
    tags: ['denim', 'jacket', 'levis', 'vintage']
  },
  {
    name: 'Vintage Floral Dress',
    description: 'Beautiful vintage floral dress. Flowing fabric, perfect for summer. Unique pattern.',
    price: 3200,
    category: 'Women',
    condition: 'Like New',
    size: 'S',
    brand: 'Unbranded',
    stock: 1,
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
    story: 'A timeless piece from a vintage collection. The floral pattern is classic and elegant.',
    tags: ['dress', 'floral', 'summer', 'vintage']
  },
  {
    name: 'Retro Bomber Jacket',
    description: 'Classic bomber jacket in excellent condition. Warm, stylish, and versatile.',
    price: 5500,
    category: 'Men',
    condition: 'Like New',
    size: 'L',
    brand: 'Alpha Industries',
    stock: 1,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
    story: 'Military-inspired bomber jacket. Built to last, this piece combines style with functionality.',
    tags: ['bomber', 'jacket', 'military', 'vintage']
  },
  {
    name: 'Vintage Sweater',
    description: 'Cozy vintage sweater with unique pattern. Perfect for cold weather.',
    price: 2500,
    category: 'Women',
    condition: 'Slightly Used',
    size: 'M',
    brand: 'Unbranded',
    stock: 2,
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'],
    story: 'Hand-knit quality from decades past. The kind of sweater that becomes a wardrobe staple.',
    tags: ['sweater', 'knitwear', 'cozy', 'vintage']
  },
  {
    name: 'Vintage Cargo Pants',
    description: 'Classic cargo pants with multiple pockets. Durable and practical.',
    price: 2200,
    category: 'Men',
    condition: 'Slightly Used',
    size: '32',
    brand: 'Carhartt',
    stock: 2,
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
    story: 'Workwear that has stood the test of time. These cargo pants are built for durability.',
    tags: ['cargo', 'pants', 'workwear', 'vintage']
  },
  {
    name: 'Retro Hoodie',
    description: 'Comfortable vintage hoodie. Soft, worn-in feel. Perfect for casual wear.',
    price: 2800,
    category: 'Men',
    condition: 'Slightly Used',
    size: 'L',
    brand: 'Champion',
    stock: 3,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
    story: 'Champion quality from the 90s. The more you wear it, the better it feels.',
    tags: ['hoodie', 'champion', 'streetwear', '90s']
  }
];

async function seedDatabase() {
  try {
    // Check if we have any sellers
    let sellers = await Seller.find();
    
    if (sellers.length === 0) {
      console.log('No sellers found. Creating demo sellers...');
      
      // Create demo sellers one by one to trigger password hashing
      const seller1 = await Seller.create({
        fullName: 'Vintage Vault',
        email: 'vintage@thriftstore.com',
        password: '123456',
        phone: '+977 9812345678',
        storeName: 'Vintage Vault',
        storeDescription: 'Curated vintage clothing from the 80s and 90s',
        address: 'Thamel, Kathmandu',
        city: 'Kathmandu',
        status: 'approved'
      });
      
      const seller2 = await Seller.create({
        fullName: 'Retro Revival',
        email: 'retro@thriftstore.com',
        password: '123456',
        phone: '+977 9823456789',
        storeName: 'Retro Revival',
        storeDescription: 'Premium thrift finds and rare vintage pieces',
        address: 'Patan, Lalitpur',
        city: 'Lalitpur',
        status: 'approved'
      });
      
      sellers = [seller1, seller2];
      console.log('✅ Demo sellers created!');
    }
    
    console.log(`Found ${sellers.length} sellers`);
    
    // Debug: Check seller data
    sellers.forEach((seller, i) => {
      console.log(`Seller ${i + 1}:`, {
        name: seller.fullName,
        storeName: seller.storeName,
        id: seller._id
      });
    });
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');
    
    // Add products with seller references
    const productsWithSellers = thriftProducts.map((product, index) => {
      const seller = sellers[index % sellers.length];
      
      // Debug: Log what we're using
      console.log(`Product ${index + 1}: Using seller "${seller.fullName}" with store "${seller.storeName}"`);
      
      return {
        ...product,
        seller: seller._id,
        sellerName: seller.fullName || 'Unknown Seller',
        storeName: seller.storeName || 'Thrift Store',
        status: 'Approved',
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        reviews: Math.floor(Math.random() * 200) + 50,
        featured: index < 4
      };
    });
    
    console.log('Creating products...');
    await Product.insertMany(productsWithSellers);
    
    console.log(`✅ Successfully seeded ${thriftProducts.length} thrift products!`);
    console.log('✅ Products are now available with real image URLs');
    console.log('✅ All products are approved and ready to display');
    console.log('\n🎉 Your thrift store is ready with real products!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

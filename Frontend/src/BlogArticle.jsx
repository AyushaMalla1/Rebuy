import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './BlogArticle.css';

function BlogArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (token && userRole) {
      setUser({ role: userRole });
    }
  }, [slug]);

  const handleShopClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/shop');
    } else {
      navigate('/login');
    }
  };

  const handleStartSellingClick = () => {
    navigate('/seller');
  };

  const articles = {
    'why-thrift-shopping-matters': {
      category: 'SUSTAINABILITY',
      title: 'Why Thrift Shopping on ReBuy Matters',
      image: '',
      intro: "Every purchase on ReBuy is a vote for sustainable fashion and a healthier planet.",
      intro2: "Discover how shopping secondhand on our platform reduces waste, saves money, and supports local sellers in Nepal.",
      sections: [
        {
          title: 'The Environmental Impact',
          content: `The fashion industry is one of the world's largest polluters. By shopping on ReBuy, you're giving clothes a second life instead of contributing to landfills. Each thrifted item saves water, reduces carbon emissions, and decreases demand for new production. Our marketplace connects you with quality pre-loved fashion right here in Nepal.`
        },
        {
          quote: `"Shopping on ReBuy changed how I think about fashion. I'm saving money AND helping the environment. Win-win!"`
        },
        {
          title: 'Supporting Local Sellers',
          content: `When you shop on ReBuy, you're supporting real people in Nepal. Our sellers are students, professionals, and fashion enthusiasts who curate their collections with care. Your purchase helps them earn extra income while promoting sustainable fashion in our community.`
        }
      ],
      cta: {
        image: 'https://i.pinimg.com/736x/23/50/07/235007311b603b79a509aa7fd3ac361d.jpg',
        title: "Shop Sustainable, Shop Local",
        subtitle: 'REBUY MARKETPLACE',
        description: `Browse thousands of pre-loved items from verified sellers across Nepal. Quality fashion, affordable prices, secure payments, and condition verification on every purchase.`,
        button: 'Start Shopping',
        action: 'shop'
      }
    },
    'the-vintage-revival': {
      category: 'TRENDS',
      title: 'The Vintage Revival on ReBuy',
      image: '',
      intro: "Vintage fashion is making a comeback in Nepal, and ReBuy is at the center of it.",
      intro2: "Discover unique vintage pieces from local sellers and learn why pre-loved fashion is the future of style.",
      sections: [
        {
          title: 'Why Vintage Matters on ReBuy',
          content: `Vintage clothing offers something fast fashion never can: authenticity, quality craftsmanship, and a story. On ReBuy, our sellers curate vintage collections from the 80s, 90s, and 2000s. Each piece has character and history. Use our "Vintage" category filter to discover leather jackets, denim, band tees, and classic accessories.`
        },
        {
          quote: `"I found an authentic 90s leather jacket on ReBuy for Rs. 3,500. It's my most complimented piece!"`
        }
      ],
      cta: {
        image: 'https://i.pinimg.com/1200x/79/ff/84/79ff843d4cbfe334e123e697441b3a36.jpg',
        title: 'Find Your Vintage Treasure',
        subtitle: 'VINTAGE COLLECTION',
        description: 'Browse our carefully curated vintage pieces from verified sellers across Nepal. Authentic styles, verified condition, secure payments.',
        button: 'Explore Vintage',
        action: 'shop'
      }
    },
    'capsule-wardrobe-guide': {
      category: 'STYLE GUIDE',
      title: 'How to Build a Capsule Wardrobe with Thrift Fashion',
      image: '',
      intro: "Building a sustainable wardrobe doesn't mean buying new - it means buying smart.",
      intro2: "Discover how ReBuy's thrift marketplace helps you create a versatile, eco-friendly wardrobe without breaking the bank.",
      sections: [
        {
          title: 'Why Thrift for Your Capsule Wardrobe?',
          content: `Thrift shopping on ReBuy is perfect for building a capsule wardrobe. You get quality pre-loved pieces at affordable prices, reduce fashion waste, and find unique items that define your personal style. Our sellers curate their collections carefully, so you're getting pieces that have already proven their worth.`
        },
        {
          quote: `"I built my entire capsule wardrobe from ReBuy. 25 pieces, all under Rs. 15,000. Every item works together perfectly." - Maya, ReBuy Customer`
        },
        {
          title: 'Start with ReBuy Essentials',
          content: `Browse our marketplace for timeless basics: neutral-colored tops, classic jeans, versatile jackets, and quality shoes. Use our condition tags to find "Like New" or "Excellent" items. Filter by size and subcategory to find exactly what you need. With ReBuy's secure payment and condition verification, you can shop with confidence.`
        }
      ],
      cta: {
        image: 'https://i.pinimg.com/736x/3a/aa/8f/3aaa8f28ad7f0892aeb63cce913dc3eb.jpg',
        title: 'Build Your Sustainable Capsule Wardrobe',
        subtitle: 'SHOP THRIFT ON REBUY',
        description: `Start with our curated selection of pre-loved essentials. Quality pieces, affordable prices, verified condition. Browse by category, filter by size, and build a wardrobe you'll love - sustainably.`,
        button: 'Shop Essentials',
        action: 'shop'
      }
    },
    'meet-our-sellers': {
      category: 'COMMUNITY',
      title: 'Meet Our ReBuy Sellers',
      image: '',
      intro: "Behind every item on ReBuy is a real person with a passion for sustainable fashion.",
      intro2: "Get to know the sellers who make our marketplace special and learn how you can join them.",
      sections: [
        {
          title: 'Real Sellers, Real Stories',
          content: `Our sellers are students earning extra income, fashion enthusiasts sharing their collections, and professionals decluttering their wardrobes. They're from Kathmandu, Pokhara, Lalitpur, and cities across Nepal. Each seller is verified by our admin team to ensure quality and trust. They curate their collections, photograph their items, and ship with care.`
        },
        {
          quote: `"Selling on ReBuy helped me pay for college while sharing my love for fashion. I've made over Rs. 50,000 in 6 months!" - Alex, Kathmandu`
        },
        {
          title: 'Become a ReBuy Seller',
          content: `Ready to join our community? Click "Become a Seller" to register. Our admin team reviews applications within 48 hours. Once approved, you can list unlimited items, set your own prices, and manage orders through your seller dashboard. We handle payments securely - you get 97% of each sale. Minimum payout is Rs. 500 via bank transfer, Khalti, or eSewa.`
        }
      ],
      cta: {
        image: 'https://i.pinimg.com/736x/e2/0a/42/e20a423958fdb7903cd5419ab02ee243.jpg',
        title: 'Join Our Seller Community',
        subtitle: 'START EARNING TODAY',
        description: 'Turn your pre-loved fashion into cash. Register as a seller, get approved by our admin team, and start listing your items. Secure payments, seller dashboard, and 97% commission.',
        button: 'Become a Seller',
        action: 'seller'
      }
    }
  };

  const article = articles[slug] || articles['why-thrift-shopping-matters'];

  return (
    <div className="blog-article-page">
      {/* Top Navigation */}
      <div className="blog-top-nav">
        <button onClick={() => navigate('/')}>← Back</button>
        <span className="blog-category">{article.category}</span>
      </div>

      {/* Main Content */}
      <div className="blog-content-wrapper">
        {/* Title */}
        <h1 className="blog-main-title">{article.title}</h1>

        {/* Intro Paragraphs */}
        <div className="blog-intro">
          <p>{article.intro}</p>
          <p>{article.intro2}</p>
        </div>

        {/* Sections */}
        <div className="blog-sections">
          {article.sections.map((section, index) => (
            <div key={index} className="blog-section">
              {section.title && <h2>{section.title}</h2>}
              {section.content && <p>{section.content}</p>}
              {section.quote && (
                <blockquote className="blog-quote">
                  {section.quote}
                </blockquote>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section with Image */}
        <div className="blog-cta-section">
          <div className="cta-image">
            <img src={article.cta.image} alt={article.cta.title} />
          </div>
          <div className="cta-content">
            <p className="cta-subtitle">{article.cta.subtitle}</p>
            <h3>{article.cta.title}</h3>
            <p>{article.cta.description}</p>
            <button onClick={article.cta.action === 'seller' ? handleStartSellingClick : handleShopClick}>
              {article.cta.button}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogArticle;

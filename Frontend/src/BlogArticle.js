import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './BlogArticle.css';

function BlogArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (token && userRole) {
      setUser({ role: userRole });
    }
  }, []);

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
      title: 'Got Nothing to Wear?',
      image: 'https://i.pinimg.com/736x/bc/83/08/bc8308ad115003adae43e7743ef2254f.jpg',
      intro: "We're all familiar with the experience of opening your closet and finding clothing that inspires. But this spring, we're determined to step that up.",
      intro2: "Our team took a closer look at what triggers closet burnout: overconsumption and how you can build a timeless wardrobe you'll actually enjoy.",
      sections: [
        {
          title: 'Behind the Paradox',
          content: `To better understand this global phenomenon, we observed how our members perceive their closets. We asked them in-depth questions about why they wear certain items and not others, collecting more than 5,000 responses. This allowed us to go beyond symptoms and identify the root cause: a gap between perception and reality.

What we call "nothing to wear" is a feeling that has nothing to do with closet size. The truth is, we all have things to wear. They're just not items that matter to us emotionally, often bought on impulse and easily forgotten. This process, known`
        },
        {
          quote: `"When I feel like I have nothing to wear, I immediately think buying something new will fix it. It's not that I need more clothes... I just want the feeling to go away." - Giulia`
        },
        {
          title: '"Nothing to Wear" is a Lie',
          content: `"Nothing to wear" has little to do with quantity and everything to do with emotional connection. (In fact, our respondents reported the feeling was triggered by how they felt about themselves 7 out of 10 times.)

Want to make a change? Stop buying clothes impulsively, and instead sell what no longer serves you to make space (and cash) for items that do.`
        }
      ],
      cta: {
        image: 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
        title: "Your 'nothing' is someone else's everything",
        subtitle: 'FASHION COLLECTIVE',
        description: `You're not out of options; you're out of inspiration. As the #1 global fashion marketplace, we've got you covered with exclusive access to the world's most coveted closets.

From timeless wardrobe essentials to styles you'll cherish forever, your next (impulse-free) obsession is waiting...`,
        button: 'Shop preloved',
        action: 'shop'
      }
    },
    'the-vintage-revival': {
      category: 'TRENDS',
      title: 'The Vintage Revival',
      image: 'https://www.pinterest.com/pin/2885187258282314/',
      intro: "Vintage fashion is making a powerful comeback, and it's more than just a trend.",
      intro2: "Discover why more people are turning to vintage pieces for their unique style and sustainable benefits.",
      sections: [
        {
          title: 'Why Vintage Matters',
          content: `Vintage clothing offers something that fast fashion never can: authenticity, quality craftsmanship, and a story. Each piece has lived a life before finding its way to you.`
        },
        {
          quote: `"Wearing vintage is like wearing a piece of history. It's sustainable, unique, and tells a story." - Sarah`
        }
      ],
      cta: {
        image: 'https://i.pinimg.com/1200x/06/56/44/065644e9485e9b7010771873bc5b61c8.jpg',
        title: 'Find Your Vintage Treasure',
        subtitle: 'CURATED COLLECTION',
        description: 'Browse our carefully selected vintage pieces and find something truly special.',
        button: 'Explore Vintage',
        action: 'shop'
      }
    },
    'capsule-wardrobe-guide': {
      category: 'STYLE GUIDE',
      title: 'How to Build a Capsule Wardrobe',
      image: 'https://i.pinimg.com/1200x/85/50/eb/8550eb7065f3ae9b2617558814ff21f7.jpg',
      intro: "Less is more when it comes to building a functional, stylish wardrobe.",
      intro2: "Learn how to curate a collection of versatile pieces that work together seamlessly.",
      sections: [
        {
          title: 'Start with Basics',
          content: `A capsule wardrobe begins with timeless basics that can be mixed and matched. Focus on quality over quantity.`
        },
        {
          quote: `"I used to have a closet full of clothes but nothing to wear. Now with 30 pieces, I have endless outfits." - Maya`
        }
      ],
      cta: {
        image: 'https://i.pinimg.com/736x/f5/6e/01/f56e016ac0abff71aff30bf64cab7b83.jpg',
        title: 'Build Your Capsule',
        subtitle: 'ESSENTIALS',
        description: 'Start with our curated selection of wardrobe essentials.',
        button: 'Shop Essentials',
        action: 'shop'
      }
    },
    'meet-our-sellers': {
      category: 'COMMUNITY',
      title: 'Meet Our Sellers',
      image: 'https://i.pinimg.com/1200x/9f/66/52/9f665241f2a2f3347c91a5f0104b2733.jpg',
      intro: "Behind every piece is a seller with a story to tell.",
      intro2: "Get to know the community that makes our marketplace special.",
      sections: [
        {
          title: 'Real People, Real Stories',
          content: `Our sellers are passionate about fashion, sustainability, and sharing their carefully curated collections with you.`
        },
        {
          quote: `"Selling my pre-loved items gives them a second life and helps others discover unique pieces." - Alex`
        }
      ],
      cta: {
        image: 'https://i.pinimg.com/736x/28/68/77/2868771ebc5e4708ba23a67646d12663.jpg',
        title: 'Join Our Community',
        subtitle: 'BECOME A SELLER',
        description: 'Share your style and earn money by selling your pre-loved fashion.',
        button: 'Start Selling',
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

        {/* CTA Section */}
        <div className="blog-cta-section">
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './FAQ.css';

function FAQ() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [openQuestion, setOpenQuestion] = useState(null);

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'general', name: 'General' },
    { id: 'buying', name: 'Buying' },
    { id: 'selling', name: 'Selling' },
    { id: 'shipping', name: 'Shipping' },
    { id: 'returns', name: 'Returns' },
    { id: 'payment', name: 'Payment' },
    { id: 'account', name: 'Account' }
  ];

  const faqs = [
    {
      category: 'general',
      question: 'What is Rebuy?',
      answer: 'Rebuy is a sustainable fashion marketplace where you can buy and sell pre-loved clothing. We help reduce textile waste while making fashion more affordable and accessible.'
    },
    {
      category: 'general',
      question: 'How does Rebuy work?',
      answer: 'Sellers list their pre-loved items with photos and descriptions. Buyers browse, purchase, and receive items directly from sellers. We facilitate secure transactions and provide buyer protection.'
    },
    {
      category: 'buying',
      question: 'How do I purchase an item?',
      answer: 'Browse products, add items to your cart, and proceed to checkout. You can pay using eSewa, Khalti, credit/debit cards, or cash on delivery.'
    },
    {
      category: 'buying',
      question: 'Is buyer protection available?',
      answer: 'Yes! All purchases are covered by our buyer protection policy. If an item doesn\'t match the description, you can request a return within 7 days of delivery.'
    },
    {
      category: 'selling',
      question: 'How do I start selling?',
      answer: 'Click "Become a Seller" in the navigation menu, fill out the registration form, and start listing your items. It\'s free to create a seller account!'
    },
    {
      category: 'selling',
      question: 'What fees does Rebuy charge?',
      answer: 'We charge a 10% commission on each sale. This covers payment processing, buyer protection, and platform maintenance.'
    },
    {
      category: 'shipping',
      question: 'How long does shipping take?',
      answer: 'Delivery typically takes 3-7 business days within Nepal. Sellers ship within 1-2 business days of order confirmation.'
    },
    {
      category: 'shipping',
      question: 'Can I track my order?',
      answer: 'Yes! Once your order ships, you\'ll receive a tracking number via email and can track it in your profile under "My Orders".'
    },
    {
      category: 'shipping',
      question: 'What are the shipping costs?',
      answer: 'Shipping costs vary by location and item size. The exact cost is calculated at checkout before you complete your purchase.'
    },
    {
      category: 'returns',
      question: 'What is the return policy?',
      answer: 'You can return items within 7 days of delivery if they don\'t match the seller\'s description. Items must be unused and in original condition.'
    },
    {
      category: 'returns',
      question: 'How do I request a return?',
      answer: 'Go to "My Orders" in your profile, select the order, and click "Request Return". Provide details about why you\'re returning the item.'
    },
    {
      category: 'returns',
      question: 'Who pays for return shipping?',
      answer: 'If the item is defective or doesn\'t match the description, the seller covers return shipping. For other reasons, the buyer may be responsible.'
    },
    {
      category: 'payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept eSewa, Khalti, credit/debit cards (Visa, Mastercard), and cash on delivery for eligible orders.'
    },
    {
      category: 'payment',
      question: 'Is my payment information secure?',
      answer: 'Yes! All payments are processed through secure, encrypted channels. We never store your complete card details.'
    },
    {
      category: 'payment',
      question: 'When will I receive my refund?',
      answer: 'Refunds are processed within 3-5 business days after the return is approved. The amount will be credited to your original payment method.'
    },
    {
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" in the top right corner, fill in your details, and verify your email address. It\'s free and takes less than a minute!'
    },
    {
      category: 'account',
      question: 'Can I change my account information?',
      answer: 'Yes! Go to your profile settings to update your name, email, phone number, address, and password.'
    },
    {
      category: 'account',
      question: 'What are loyalty points?',
      answer: 'Earn points with every purchase and verified order. Redeem points for discounts on future purchases. 100 points = Rs. 10 discount.'
    }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="faq-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back to Home
      </button>

      <div className="faq-hero">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about Rebuy</p>
      </div>

      <div className="faq-content">
        <div className="faq-categories">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="faq-list">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div 
                className="faq-question"
                onClick={() => toggleQuestion(index)}
              >
                <h3>{faq.question}</h3>
                {openQuestion === index ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              {openQuestion === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h2>Still have questions?</h2>
          <p>Can't find what you're looking for? Our support team is here to help!</p>
          <button className="contact-btn" onClick={() => navigate('/contact')}>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

export default FAQ;

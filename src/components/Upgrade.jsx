import React, { useState, useRef, useEffect } from 'react';
import './Upgrade.css';

const features = {
  basic: [
    "3 clarity sessions per week",
    "Mood check-ins & summaries",
    "Basic reframe guidance",
    "Save your 3 most recent sessions",
    "Access to your 'Mind Space'"
  ],
  clarity: [
    "Unlimited AI clarity sessions",
    "Thought summaries, reframes, and to-do lists",
    "Save unlimited thoughts + sessions",
    "Weekly Clarity Report",
    "Soft habit nudges & progress reflections",
    "Coming soon: Notion & Google Tasks sync"
  ]
};

const PricingCard = ({ plan, price, period, features, isPopular, isActive, onChoose }) => (
  <div className={`pricing-card ${isPopular ? 'popular' : ''} ${isActive ? 'active' : ''}`}>
    {isPopular && <div className="popular-tag">Most Popular</div>}
    <div className="card-header">
      <h3>{plan}</h3>
      <div className="price">
        <span className="currency">$</span>
        <span className="amount">{price}</span>
        <div className="price-details">
          <span>per user/{period}</span>
          <span>billed {period === 'month' ? 'monthly' : 'annually'}</span>
        </div>
      </div>
    </div>

    <div className="features-list">
      {features.map((feature, index) => (
        <div key={index} className="feature-item">
          <span className="feature-icon">✓</span>
          <span>{feature}</span>
        </div>
      ))}
    </div>

    <button 
      onClick={onChoose}
      className={`choose-plan-button ${isActive ? 'current' : ''}`}
      disabled={isActive}
    >
      {isActive ? 'Current Plan' : 'Choose Plan'}
    </button>
  </div>
);

export default function Upgrade() {
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardsRef = useRef(null);

  const plans = [
    {
      id: 'basic',
      plan: "Basic Plan",
      price: "0",
      period: "month",
      features: features.basic
    },
    {
      id: 'clarity',
      plan: "Clarity+ Plan",
      price: "10",
      period: "month",
      features: features.clarity,
      isPopular: true
    },
    {
      id: 'clarity-annual',
      plan: "Clarity+ Plan Annually",
      price: "79",
      period: "annual",
      features: features.clarity
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (cardsRef.current) {
        const scrollPosition = cardsRef.current.scrollLeft;
        const cardWidth = cardsRef.current.offsetWidth * 0.85; // 85% of container width
        const newIndex = Math.round(scrollPosition / (cardWidth + 16)); // 16px is the gap
        setActiveCardIndex(newIndex);
      }
    };

    const cardsElement = cardsRef.current;
    if (cardsElement) {
      cardsElement.addEventListener('scroll', handleScroll);
      return () => cardsElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handlePlanChoice = async (plan) => {
    try {
      console.log(`Switching to plan: ${plan}`);
      setCurrentPlan(plan);
      alert('Plan updated successfully!');
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Failed to update plan. Please try again.');
    }
  };

  const scrollToCard = (index) => {
    if (cardsRef.current) {
      const cardWidth = cardsRef.current.offsetWidth * 0.85;
      cardsRef.current.scrollTo({
        left: index * (cardWidth + 16),
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="upgrade-container">
      <div className="upgrade-header">
        <h1>Purchase a subscription</h1>
        <p>Choose the plan that works for you.</p>
      </div>

      <div className="swipe-instruction">
        Swipe to compare plans
      </div>

      <div className="pricing-cards" ref={cardsRef}>
        {plans.map((plan, index) => (
          <PricingCard
            key={plan.id}
            plan={plan.plan}
            price={plan.price}
            period={plan.period}
            features={plan.features}
            isPopular={plan.isPopular}
            isActive={currentPlan === plan.id}
            onChoose={() => handlePlanChoice(plan.id)}
          />
        ))}
      </div>

      <div className="swipe-indicators">
        {plans.map((_, index) => (
          <div
            key={index}
            className={`swipe-indicator ${index === activeCardIndex ? 'active' : ''}`}
            onClick={() => scrollToCard(index)}
          />
        ))}
      </div>
    </div>
  );
} 
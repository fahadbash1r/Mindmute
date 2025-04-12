import React, { useState } from 'react';
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
    <div className="card-header">
      {isPopular && <div className="popular-tag">Most Popular</div>}
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
    >
      {isActive ? 'Current Plan' : 'Choose Plan'}
    </button>
  </div>
);

export default function Upgrade() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const handlePlanChoice = (plan) => {
    console.log(`Selected plan: ${plan}`);
  };

  return (
    <div className="upgrade-container">
      <div className="upgrade-header">
        <h1>Purchase a subscription</h1>
        <p>Choose the plan that works for you.</p>
      </div>

      <div className="billing-toggle">
        <button 
          className={billingPeriod === 'monthly' ? 'active' : ''}
          onClick={() => setBillingPeriod('monthly')}
        >
          Monthly
        </button>
      </div>

      <div className="pricing-cards">
        <PricingCard
          plan="Basic Plan"
          price="0"
          period={billingPeriod === 'monthly' ? 'month' : 'annual'}
          features={features.basic}
          isActive={true}
          onChoose={() => handlePlanChoice('basic')}
        />
        <PricingCard
          plan="Clarity+ Plan"
          price={billingPeriod === 'monthly' ? '10' : '79'}
          period={billingPeriod === 'monthly' ? 'month' : 'annual'}
          features={features.clarity}
          isPopular={true}
          onChoose={() => handlePlanChoice('clarity')}
        />
        <PricingCard
          plan="Clarity+ Plan Annually"
          price="79"
          period="annual"
          features={features.clarity}
          onChoose={() => handlePlanChoice('clarity-annual')}
        />
      </div>
    </div>
  );
} 
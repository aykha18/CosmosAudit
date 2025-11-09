# CosmosAudit Landing Page

Modern React-based validation landing page for CosmosAudit, following the unitasa.in strategy.

## Strategy Overview

This landing page implements a **validation-first approach** to test market demand before building the full product:

### Key Elements

1. **Hook** - Problem-focused headline addressing the $3B+ smart contract security crisis
2. **Assessment Flow** - 10-question security readiness assessment to qualify leads
3. **Co-Creator Program** - Limited to 10 seats at $697 (vs $2,000+ regular price)
4. **Readiness Scoring** - Segments users into 3 tiers:
   - **Priority (71-100%)**: Direct founder access, priority integration
   - **Co-Creator Qualified (41-70%)**: Eligible for $697 program
   - **Nurture (0-40%)**: Free resources and education

### Value Proposition

- **Problem**: $3B+ lost to hacks, $50K+ audit costs, 3-6 week delays
- **Solution**: AI-powered audits in 60 seconds, MiCA/SEC compliance, $99/month
- **Urgency**: Limited to 10 co-creator seats with countdown

## Installation

```bash
cd auditgpt-landing
npm install
npm start
```

## Project Structure

```
src/
├── components/
│   ├── HeroSection.tsx           # Hook + CTA
│   ├── ProblemSection.tsx        # $3B problem statement
│   ├── SolutionSection.tsx       # CosmosAudit features
│   ├── CoCreatorSection.tsx      # $697 limited offer
│   ├── AssessmentModal.tsx       # Assessment orchestrator
│   ├── LeadCaptureForm.tsx       # Lead capture (step 1)
│   ├── AssessmentQuestions.tsx   # 10 questions (step 2)
│   └── AssessmentResults.tsx     # Results + CTA (step 3)
├── types/
│   └── index.ts                  # TypeScript interfaces
└── App.tsx                       # Main app
```

## Assessment Flow

1. **Lead Capture**: Name, email, company, role
2. **10 Questions**: Security awareness, compliance needs, technical readiness, budget
3. **Results**: Score, readiness level, personalized recommendations
4. **CTA**: Co-creator offer (if qualified) or free resources

## Customization

### Update Co-Creator Pricing

Edit `src/components/CoCreatorSection.tsx`:
```typescript
const [seatsRemaining, setSeatsRemaining] = useState(10);
const totalSeats = 10;
```

### Modify Assessment Questions

Edit `src/components/AssessmentQuestions.tsx`:
```typescript
const questions: AssessmentQuestion[] = [
  // Add/modify questions here
];
```

### Change Scoring Logic

Edit `src/components/AssessmentModal.tsx`:
```typescript
const calculateAssessmentResult = (responses, lead) => {
  // Customize scoring algorithm
};
```

## Next Steps

1. **Backend Integration**: Connect to your API for lead capture and assessment storage
2. **Payment Integration**: Add Stripe/Razorpay for co-creator payments
3. **Analytics**: Integrate Google Analytics, Facebook Pixel for conversion tracking
4. **Email Automation**: Set up drip campaigns based on readiness level
5. **A/B Testing**: Test different headlines, CTAs, and pricing

## Deployment

```bash
npm run build
```

Deploy the `build/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Railway

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls (ready to integrate)

## License

MIT

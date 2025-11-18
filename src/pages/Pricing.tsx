import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Star, Zap, Users, Globe } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for individual entrepreneurs",
      features: [
        "5 AI persona analyses per month",
        "Basic market insights",
        "Standard response time",
        "Community support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "per month",
      description: "Ideal for growing startups",
      features: [
        "Unlimited AI persona analyses",
        "Advanced market insights",
        "Priority response time",
        "Email support",
        "Export reports",
        "Custom persona creation"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For established companies",
      features: [
        "Everything in Professional",
        "White-label solution",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "Advanced analytics",
        "Team collaboration"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How accurate are the AI personas?",
      answer: "Our AI personas are trained on real demographic and psychographic data from 195+ countries, providing 85%+ accuracy in market predictions."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. No long-term contracts or hidden fees."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll refund your payment."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade security with end-to-end encryption and comply with GDPR and SOC 2 standards."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <img src="/logo.png" alt="PipeIt Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold">PipeIt</span>
          </div>
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-12">
          {/* Page Header */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Simple Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include access to our AI-powered market research platform.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`bg-card/50 backdrop-blur-lg border border-border relative ${
                  plan.popular ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">{plan.price}</div>
                    <div className="text-sm text-muted-foreground">{plan.period}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'bg-secondary hover:bg-secondary/90'
                    }`}
                    onClick={() => {
                      if (plan.name === 'Starter') {
                        navigate('/simulation');
                      } else if (plan.name === 'Professional') {
                        navigate('/simulation');
                      } else {
                        navigate('/contact');
                      }
                    }}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Comparison */}
          <Card className="bg-card/50 backdrop-blur-lg border border-border">
            <CardHeader>
              <CardTitle className="text-center">Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Features</th>
                      <th className="text-center p-4">Starter</th>
                      <th className="text-center p-4">Professional</th>
                      <th className="text-center p-4">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "AI Persona Analyses", starter: "5/month", pro: "Unlimited", enterprise: "Unlimited" },
                      { feature: "Market Insights", starter: "Basic", pro: "Advanced", enterprise: "Advanced" },
                      { feature: "Response Time", starter: "Standard", pro: "Priority", enterprise: "Dedicated" },
                      { feature: "Support", starter: "Community", pro: "Email", enterprise: "Dedicated" },
                      { feature: "API Access", starter: "❌", pro: "❌", enterprise: "✅" },
                      { feature: "White-label", starter: "❌", pro: "❌", enterprise: "✅" }
                    ].map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-4 font-medium">{row.feature}</td>
                        <td className="p-4 text-center">{row.starter}</td>
                        <td className="p-4 text-center">{row.pro}</td>
                        <td className="p-4 text-center">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-lg border border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Happy Customers", value: "10,000+" },
              { label: "Ideas Analyzed", value: "50,000+" },
              { label: "Success Rate", value: "85%" },
              { label: "Support Rating", value: "4.9/5" }
            ].map((stat, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-lg border border-border">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Join thousands of entrepreneurs who trust PipeIt for their market research
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => navigate("/simulation")}
                className="bg-primary hover:bg-primary/90"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Free Analysis
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/about")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

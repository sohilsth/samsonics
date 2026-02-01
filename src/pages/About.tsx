import React, { useState, useEffect } from "react";
import { Award, Users, Globe, Heart, ChevronDown, ArrowRight, CheckCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: number;
  suffix: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  key: string;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  skills: string[];
}

interface Milestone {
  year: string;
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ValueItem {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  description: string;
}

export default function About() {
  const [activeTab, setActiveTab] = useState("story");
  const [countUp, setCountUp] = useState({ customers: 0, products: 0, countries: 0, years: 0 });
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const stats: StatItem[] = [
    { label: "Happy Customers", value: 50000, suffix: "+", icon: Users, key: "customers" },
    { label: "Products Sold", value: 100000, suffix: "+", icon: Award, key: "products" },
    { label: "Countries Served", value: 25, suffix: "+", icon: Globe, key: "countries" },
    { label: "Years in Business", value: 10, suffix: "+", icon: Heart, key: "years" },
  ];


  const milestones: Milestone[] = [
    { year: "2014", title: "Company Founded", description: "Started in a garage with big dreams" },
    { year: "2016", title: "First 1000 Customers", description: "Reached our first major milestone" },
    { year: "2019", title: "Global Expansion", description: "Expanded to serve 15+ countries" },
    { year: "2022", title: "50K Milestone", description: "Celebrated 50,000 happy customers" },
    { year: "2024", title: "Innovation Hub", description: "Launched our tech innovation center" }
  ];

  const faqs: FAQ[] = [
    {
      question: "What makes Samsonix different from other electronics retailers?",
      answer: "We focus on quality curation, personal customer service, and competitive pricing. Every product is tested and vetted by our team."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to 25+ countries worldwide with various shipping options to suit your needs."
    },
    {
      question: "What's your return policy?",
      answer: "We offer a 30-day return policy on most items, with free returns for defective products."
    }
  ];

  const values: ValueItem[] = [
    { title: "Quality First", icon: Award, color: "blue", description: "We source only the highest quality products from trusted manufacturers and rigorously test everything before it reaches our customers." },
    { title: "Customer Centric", icon: Users, color: "green", description: "Every decision we make is driven by what's best for our customers. Your satisfaction and success are our top priorities." },
    { title: "Innovation", icon: Heart, color: "purple", description: "We stay at the forefront of technology trends to bring you the latest innovations that can make a real difference in your life." }
  ];

  // Counter animation
  useEffect(() => {
    const animateCounters = () => {
      stats.forEach(stat => {
        let start = 0;
        const end = stat.value;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCountUp(prev => ({ ...prev, [stat.key]: end }));
            clearInterval(timer);
          } else {
            setCountUp(prev => ({ ...prev, [stat.key]: Math.floor(start) }));
          }
        }, 16);
      });
    };

    const timer = setTimeout(animateCounters, 500);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[id]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 text-blue-600";
      case "green": return "bg-green-100 text-green-600";
      case "purple": return "bg-purple-100 text-purple-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Parallax Effect */}
      <section className="relative bg-gradient-to-br from-primary/10 to-secondary/10 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-8 text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              About Samsonix
            </h1>
            <p className="text-2xl text-muted-foreground text-balance mb-8 leading-relaxed">
              We're passionate about bringing you the latest and greatest in electronic technology, 
              backed by exceptional service and competitive prices.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <CheckCircle className="size-5 text-green-500" />
                <span>Trusted by 50K+ customers</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <Star className="size-5 text-yellow-500" />
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-secondary/20 rounded-full animate-float-delayed"></div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-12">
            <div className="bg-card border rounded-full p-2 shadow-lg">
              {["story", "timeline", "values"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-full transition-all duration-300 font-medium capitalize ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "timeline" ? "Our Journey" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="transition-all duration-500 ease-in-out">
            {activeTab === "story" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in">
                <div className="space-y-6">
                  <h2 className="text-4xl font-bold text-foreground mb-6">Our Story</h2>
                  <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p className="transform hover:scale-[1.02] transition-transform duration-300 hover:text-foreground p-4 rounded-lg hover:bg-card/50">
                      Founded in 2014, Samsonix began as a small family business with a simple mission: 
                      to make cutting-edge technology accessible to everyone. What started in a garage has 
                      grown into one of the most trusted online electronics retailers.
                    </p>
                    <p className="transform hover:scale-[1.02] transition-transform duration-300 hover:text-foreground p-4 rounded-lg hover:bg-card/50">
                      We believe that technology should enhance people's lives, not complicate them. That's 
                      why we carefully curate our product selection, ensuring that every item meets our high 
                      standards for quality, functionality, and value.
                    </p>
                    <p className="transform hover:scale-[1.02] transition-transform duration-300 hover:text-foreground p-4 rounded-lg hover:bg-card/50">
                      Today, we serve customers worldwide, but we've never forgotten our roots. Every 
                      interaction, every product recommendation, and every support ticket is handled with 
                      the personal touch that made us who we are.
                    </p>
                  </div>
                </div>
                <div className="relative group">
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop" 
                      alt="Our team working"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="animate-fade-in">
                <h2 className="text-4xl font-bold text-center text-foreground mb-12">Our Journey</h2>
                <div className="relative">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                  {milestones.map((milestone, index) => (
                    <div key={index} className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-l-4 border-l-primary">
                          <CardContent className="p-6">
                            <div className="text-primary font-bold text-xl mb-2">{milestone.year}</div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">{milestone.title}</h3>
                            <p className="text-muted-foreground">{milestone.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg z-10 flex-shrink-0"></div>
                      <div className="w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "values" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                {values.map((value, index) => (
                  <Card key={index} className="group p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border-0 bg-gradient-to-br from-card to-card/50">
                    <CardContent className="pt-6">
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg ${getColorClass(value.color).split(' ')[0]}`}>
                        <value.icon className={`size-10 ${getColorClass(value.color).split(' ')[1]}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 bg-card relative overflow-hidden" id="stats">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Impact</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Numbers that reflect our commitment to excellence and customer satisfaction
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="group text-center p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-background border-0">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <stat.icon className="size-10 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-3 font-mono">
                    {formatNumber(countUp[stat.key as keyof typeof countUp])}{stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Get answers to common questions about Samsonix</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full p-6 text-left hover:bg-muted/50 transition-colors duration-200 flex justify-between items-center"
                >
                  <h3 className="text-lg font-semibold text-foreground pr-4">{faq.question}</h3>
                  <ChevronDown 
                    className={`size-6 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${
                  expandedFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Experience the Samsonix Difference?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 text-balance">
            Join thousands of satisfied customers who trust us for their technology needs
          </p>
          <button className="group bg-background text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto">
            Shop Now
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #000 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}

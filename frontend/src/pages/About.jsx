import React from 'react';
import { Shield, Leaf, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="bg-secondary/30 py-20 border-b border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-foreground">Trust in Every Link of the Chain</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            AgriChain is revolutionizing the agricultural industry by providing end-to-end transparency, ensuring fair value for farmers and quality assurance for consumers.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center space-y-4 p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Leaf size={32} />
            </div>
            <h3 className="text-2xl font-heading font-bold">For Farmers</h3>
            <p className="text-muted-foreground">
              Empowering producers with verified data to prove quality, sustainable practices, and command fair market prices for their harvest.
            </p>
          </div>
          
          <div className="text-center space-y-4 p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-heading font-bold">For Suppliers</h3>
            <p className="text-muted-foreground">
              Streamlining logistics with real-time tracking, automated status updates, and immutable proof of handling and delivery.
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Shield size={32} />
            </div>
            <h3 className="text-2xl font-heading font-bold">For Customers</h3>
            <p className="text-muted-foreground">
              Providing absolute certainty about the origin, safety, and journey of the food on your table. Scan, track, and trust.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-secondary/20 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-heading font-bold text-foreground">Our Story</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Founded in 2025, AgTrace began with a simple question: "Where does our food really come from?" 
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              In a world of complex global supply chains, information often gets lost. We set out to build a bridge of digital trust connecting the hardworking hands that plant the seeds to the families that enjoy the harvest. Using simple, accessible technology, we make the invisible visible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
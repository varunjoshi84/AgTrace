import React, { useEffect, useState } from 'react';
import Hero from '../component/Hero';
import TrackingCard from '../component/TrackingCard';
import MetricsCard from '../component/MetricsCard';
import { Leaf, Globe, ShieldCheck } from 'lucide-react';
import * as metricsApi from '../api/metricsApi';

export default function Home() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    metricsApi.getSummaryMetrics().then(setMetrics);
  }, []);

  return (
    <div className="space-y-24 pb-24">
      <Hero />
      
      <div className="container mx-auto px-4 -mt-20 relative z-20">
         <TrackingCard />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-heading font-bold mb-4">Impact & Transparency</h2>
          <p className="text-muted-foreground">See the real-time metrics of our transparent supply chain network.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricsCard 
            title="Total Verified Batches" 
            value={metrics?.totalVerifiedBatches || "1200"} 
            icon={ShieldCheck}
            subtext="Successfully tracked"
          />
          <MetricsCard 
            title="Active Farms" 
            value={metrics?.activeFarms || "120"} 
            icon={Leaf}
            subtext="Partnered worldwide"
          />
          <MetricsCard 
            title="Carbon Offset" 
            value={metrics?.carbonOffset || "..."} 
            icon={Globe}
            subtext="Through optimized logistics"
          />
        </div>
      </div>
    </div>
  );
}
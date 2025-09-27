
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Award, Target } from "lucide-react";
import { useEffect, useState } from "react";

const Statistics = () => {
  const [counts, setCounts] = useState({ members: 0, projects: 0, companies: 0, success: 0 });
  
  const stats = [
    { 
      icon: Users, 
      title: "Onze missie", 
      value: 1, 
      suffix: "",
      description: "Een veilige en respectvolle bouwsector voor iedereen"
    },
    { 
      icon: Target, 
      title: "Doelstelling", 
      value: 2025, 
      suffix: "",
      description: "Het jaar waarin we samen het verschil gaan maken"
    },
    { 
      icon: Award, 
      title: "Focus", 
      value: 100, 
      suffix: "%",
      description: "Op het aanpakken van grensoverschrijdend gedrag"
    },
    { 
      icon: TrendingUp, 
      title: "Commitment", 
      value: 100, 
      suffix: "%",
      description: "Voor positieve cultuurverandering in de bouw"
    }
  ];

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    
    stats.forEach((stat, index) => {
      let step = 0;
      const increment = stat.value / steps;
      const timer = setInterval(() => {
        step++;
        setCounts(prev => ({
          ...prev,
          [index === 0 ? 'members' : index === 1 ? 'projects' : index === 2 ? 'companies' : 'success']: 
            Math.min(Math.floor(increment * step), stat.value)
        }));
        
        if (step >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);
    });
  }, []);

  const getCountValue = (index: number) => {
    switch (index) {
      case 0: return counts.members;
      case 1: return counts.projects;
      case 2: return counts.companies;
      case 3: return counts.success;
      default: return 0;
    }
  };

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Onze impact in cijfers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Samen maken we echt verschil. Bekijk hoe wij de bouwsector aantrekkelijker maken 
            en grensoverschrijdend gedrag aanpakken door cultuurverandering op de bouwplaats.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-primary bg-card group hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <stat.icon className="w-8 h-8 text-accent" />
              </div>
              <div className="text-4xl font-bold text-accent mb-2">
                {getCountValue(index).toLocaleString()}{stat.suffix}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-accent">{stat.title}</h3>
              <p className="text-accent text-sm">{stat.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;

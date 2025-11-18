import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/loading', { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="PipeIt Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold">PipeIt</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm hover:text-gray-300 transition-colors">Home</Link>
            <Link to="/market-insights" className="text-sm hover:text-gray-300 transition-colors">Market Insights</Link>
            <Link to="/personas" className="text-sm hover:text-gray-300 transition-colors">Personas</Link>
            <Link to="/quick-actions" className="text-sm hover:text-gray-300 transition-colors">Quick Actions</Link>
            <Link to="/about" className="text-sm hover:text-gray-300 transition-colors">About</Link>
            <Link to="/pricing" className="text-sm hover:text-gray-300 transition-colors">Pricing</Link>
            <Link to="/discovery" className="text-sm hover:text-gray-300 transition-colors">
              Discovery →
            </Link>
          </div>
          
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
            Login →
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] relative">
        {/* Background Globe */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-96 h-96 border border-white/30 rounded-full flex items-center justify-center">
            <div className="w-80 h-80 border border-white/20 rounded-full flex items-center justify-center">
              <div className="w-64 h-64 border border-white/10 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="relative z-10 mb-8">
          <div className="bg-gray-800/80 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
            Latest update <span className="text-white font-semibold">Cloudflare Workers AI Support Is Here!</span> →
          </div>
        </div>

        {/* Main Headline */}
        <div className="relative z-10 text-center mb-6">
          <h1 className="text-6xl font-bold leading-tight">
            <span className="text-white">AI agents for simulated</span>
            <br />
            <span className="text-green-400">market research</span>
          </h1>
        </div>

        {/* Sub-headline */}
        <div className="relative z-10 text-center mb-8">
          <p className="text-xl text-gray-300">
            Get a market analysis in minutes, not months.
          </p>
        </div>

        {/* CTA Button */}
        <div className="relative z-10">
          <Button 
            onClick={handleExploreClick}
            className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            Explore PipeIt →
          </Button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-gray-900/50 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center font-bold text-black text-sm">
                P
              </div>
              <span className="text-sm font-bold">PipeIt</span>
            </div>
            <Link to="/projects" className="text-sm hover:text-gray-300 transition-colors">
              ← Projects View
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gray-800 border border-white/20 rounded px-3 py-1 text-xs">
                ANALYSIS MODE
              </div>
              <span className="text-sm text-gray-300">Ideation Scoring</span>
            </div>
            
            <Button className="bg-transparent border border-white/20 text-white hover:bg-white/10">
              + Create New Session
            </Button>
            
            <Link to="/share" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Share Simulation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
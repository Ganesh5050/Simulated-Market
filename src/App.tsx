import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "./pages/Home";
import Loading from "./pages/Loading";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Simulation from "./pages/Simulation";
import Tunnel from "./pages/Tunnel";
import TunnelDemo from "./components/TunnelDemo";
import Insights from "./pages/Insights";
import Personas from "./pages/Personas";
import Actions from "./pages/Actions";
import MarketInsights from "./pages/MarketInsights";
import QuickActions from "./pages/QuickActions";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Discovery from "./pages/Discovery";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="font-mono">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/simulation/:id" element={<Simulation />} />
              <Route path="/tunnel" element={<Tunnel />} />
              <Route path="/tunnel-demo" element={<TunnelDemo />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/personas" element={<Personas />} />
              <Route path="/actions" element={<Actions />} />
              <Route path="/market-insights" element={<MarketInsights />} />
              <Route path="/quick-actions" element={<QuickActions />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/discovery" element={<Discovery />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
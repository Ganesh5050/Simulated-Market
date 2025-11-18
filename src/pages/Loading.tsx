import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Loading = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate("/projects"), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-mono">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground tracking-wider">
            The Correct Way To Launch
          </p>
          <h1 className="text-5xl font-bold">PipeIt</h1>
        </div>

        <div className="space-y-4 max-w-md">
          <p className="text-sm text-muted-foreground">
            Calibrating behavioral models
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-2xl font-bold">
              <span>{progress}%</span>
              <span className="text-xs text-muted-foreground self-end">
                {progress > 0 && `+${Math.floor(progress * 0.02)}% since you last checked`}
              </span>
            </div>
            
            <div className="flex gap-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 flex-1 transition-colors duration-300 ${
                    i < (progress * 40) / 100
                      ? "bg-foreground"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
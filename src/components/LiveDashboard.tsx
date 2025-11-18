import { useRealTimeData } from '@/hooks/useRealTimeData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, Zap, TrendingUp, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export const LiveDashboard = () => {
  const { stats, getLiveMetrics, getTrendingTopics } = useRealTimeData();
  const liveMetrics = getLiveMetrics();
  const trendingTopics = getTrendingTopics();

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-lg border border-border animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const liveCards = [
    {
      title: "Ideas/Min",
      value: liveMetrics.ideasPerMinute,
      icon: <Zap className="w-5 h-5" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      trend: "+12%"
    },
    {
      title: "Active Sessions",
      value: liveMetrics.activeSessions,
      icon: <Users className="w-5 h-5" />,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      trend: "+8%"
    },
    {
      title: "Response Time",
      value: `${liveMetrics.averageResponseTime}ms`,
      icon: <Clock className="w-5 h-5" />,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
      trend: "-5%"
    },
    {
      title: "Engagement",
      value: `${liveMetrics.userEngagement}%`,
      icon: <Target className="w-5 h-5" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      trend: "+15%"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-lg border border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <motion.p 
                      className="text-2xl font-bold"
                      key={card.value}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {card.value}
                    </motion.p>
                  </div>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <div className={card.color}>
                      {card.icon}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {card.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Trending Topics */}
      <Card className="bg-card/50 backdrop-blur-lg border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingTopics.slice(0, 6).map((topic, index) => (
              <motion.div
                key={topic.topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">{topic.topic}</div>
                  <Badge 
                    variant={topic.sentiment === 'positive' ? 'default' : topic.sentiment === 'negative' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {topic.sentiment}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{topic.mentions} mentions</span>
                  <Badge variant="outline" className="text-xs">
                    +{topic.growth}%
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card className="bg-card/50 backdrop-blur-lg border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stats.recentActivity.slice(0, 8).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={activity.status === 'completed' ? 'default' : activity.status === 'in-progress' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {activity.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

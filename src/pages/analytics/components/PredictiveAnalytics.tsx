import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Brain, 
  AlertTriangle, 
  Target, 
  Activity,
  Zap,
  BarChart3,
  LineChart,
  Calendar,
  Users
} from "lucide-react";

export const PredictiveAnalytics = () => {
  const [selectedModel, setSelectedModel] = useState("demand");
  const [selectedHorizon, setSelectedHorizon] = useState("30d");

  const demandForecasts = [
    { product: "Premium Seeds", currentDemand: 1250, predictedDemand: 1420, confidence: 87, trend: "up" },
    { product: "Organic Fertilizer", currentDemand: 890, predictedDemand: 780, confidence: 82, trend: "down" },
    { product: "Bio Pesticide", currentDemand: 654, predictedDemand: 890, confidence: 79, trend: "up" },
    { product: "Irrigation Kit", currentDemand: 234, predictedDemand: 340, confidence: 91, trend: "up" }
  ];

  const behaviorPredictions = [
    { segment: "New Farmers", churnRisk: 15, engagementScore: 72, nextAction: "Product Trial", probability: 68 },
    { segment: "Active Users", churnRisk: 8, engagementScore: 84, nextAction: "Upgrade Purchase", probability: 82 },
    { segment: "Premium Users", churnRisk: 3, engagementScore: 91, nextAction: "Renewal", probability: 94 },
    { segment: "At-Risk Users", churnRisk: 67, engagementScore: 42, nextAction: "Support Contact", probability: 45 }
  ];

  const campaignPredictions = [
    { campaign: "Kharif Season Promo", predictedROI: 3.4, reach: 8500, conversionRate: 12.3, confidence: 89 },
    { campaign: "Premium Seeds Launch", predictedROI: 2.8, reach: 5200, conversionRate: 18.7, confidence: 76 },
    { campaign: "Organic Farming Guide", predictedROI: 1.9, reach: 12000, conversionRate: 8.4, confidence: 82 },
    { campaign: "Equipment Financing", predictedROI: 4.1, reach: 3400, conversionRate: 22.1, confidence: 71 }
  ];

  const riskAssessments = [
    { 
      category: "Market Risk", 
      level: "Medium", 
      score: 65, 
      factors: ["Price volatility", "Seasonal demand"],
      impact: "Revenue fluctuation up to 15%"
    },
    { 
      category: "Operational Risk", 
      level: "Low", 
      score: 28, 
      factors: ["Supply chain", "Quality issues"],
      impact: "Minor operational delays"
    },
    { 
      category: "Customer Risk", 
      level: "High", 
      score: 78, 
      factors: ["Farmer churn", "Adoption rates"],
      impact: "Potential 20% revenue loss"
    },
    { 
      category: "Technology Risk", 
      level: "Low", 
      score: 32, 
      factors: ["Platform downtime", "Data issues"],
      impact: "Service disruption <2 hours"
    }
  ];

  const marketTrends = [
    { trend: "Organic Farming Growth", impact: "+25%", timeframe: "Next 6 months", confidence: 92 },
    { trend: "Smart Agriculture Adoption", impact: "+40%", timeframe: "Next 12 months", confidence: 78 },
    { trend: "Climate-Resilient Crops", impact: "+18%", timeframe: "Next 9 months", confidence: 85 },
    { trend: "Precision Irrigation", impact: "+30%", timeframe: "Next 8 months", confidence: 73 }
  ];

  const yieldPredictions = [
    { crop: "Wheat", region: "Punjab", currentYield: 4.2, predictedYield: 4.6, factors: ["Weather", "Soil health"] },
    { crop: "Rice", region: "West Bengal", currentYield: 3.8, predictedYield: 4.1, factors: ["Rainfall", "Fertilizers"] },
    { crop: "Cotton", region: "Gujarat", currentYield: 2.1, predictedYield: 2.4, factors: ["Irrigation", "Pest control"] },
    { crop: "Sugarcane", region: "Maharashtra", currentYield: 5.3, predictedYield: 5.7, factors: ["Weather", "Technology"] }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Model Selection */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Predictive Analytics</h2>
        <div className="flex gap-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="demand">Demand Forecasting</SelectItem>
              <SelectItem value="behavior">Behavior Prediction</SelectItem>
              <SelectItem value="campaign">Campaign Outcomes</SelectItem>
              <SelectItem value="risk">Risk Assessment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedHorizon} onValueChange={setSelectedHorizon}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Horizon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="forecasting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasting">Demand Forecasting</TabsTrigger>
          <TabsTrigger value="behavior">Behavior Prediction</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Outcomes</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demand Forecasting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Product Demand Forecast</span>
                </CardTitle>
                <CardDescription>Predicted demand for next {selectedHorizon}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {demandForecasts.map((forecast) => (
                  <div key={forecast.product} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{forecast.product}</span>
                      <Badge className={getConfidenceColor(forecast.confidence)}>
                        {forecast.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-bold ml-2">{forecast.currentDemand}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Predicted:</span>
                        <span className="font-bold ml-2">{forecast.predictedDemand}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress 
                        value={(forecast.predictedDemand / forecast.currentDemand) * 50} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Yield Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Crop Yield Predictions</span>
                </CardTitle>
                <CardDescription>Expected yield improvements by region</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {yieldPredictions.map((prediction) => (
                  <div key={`${prediction.crop}-${prediction.region}`} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-medium">{prediction.crop}</span>
                        <span className="text-sm text-muted-foreground ml-2">({prediction.region})</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-bold ml-2">{prediction.currentYield} t/ha</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Predicted:</span>
                        <span className="font-bold ml-2">{prediction.predictedYield} t/ha</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">
                        Key factors: {prediction.factors.join(", ")}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Market Trend Analysis</CardTitle>
              <CardDescription>Emerging trends and their predicted impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketTrends.map((trend) => (
                  <div key={trend.trend} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{trend.trend}</span>
                      <Badge variant="outline">{trend.confidence}% confidence</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-muted-foreground">Impact:</span>
                        <span className="font-bold ml-2 text-green-600">{trend.impact}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeframe:</span>
                        <span className="ml-2">{trend.timeframe}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Farmer Behavior Predictions</span>
              </CardTitle>
              <CardDescription>Predicted farmer actions and engagement patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {behaviorPredictions.map((prediction) => (
                <div key={prediction.segment} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">{prediction.segment}</span>
                    <div className="flex space-x-2">
                      <Badge variant={prediction.churnRisk > 50 ? "destructive" : prediction.churnRisk > 20 ? "secondary" : "default"}>
                        {prediction.churnRisk}% churn risk
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Engagement:</span>
                      <div className="font-bold">{prediction.engagementScore}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Action:</span>
                      <div className="font-bold">{prediction.nextAction}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Probability:</span>
                      <div className="font-bold">{prediction.probability}%</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={prediction.probability} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Campaign Outcome Predictions</span>
              </CardTitle>
              <CardDescription>Predicted performance for upcoming campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaignPredictions.map((campaign) => (
                <div key={campaign.campaign} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">{campaign.campaign}</span>
                    <Badge className={getConfidenceColor(campaign.confidence)}>
                      {campaign.confidence}% confidence
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Predicted ROI:</span>
                      <div className="font-bold text-green-600">{campaign.predictedROI}x</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reach:</span>
                      <div className="font-bold">{campaign.reach.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conversion:</span>
                      <div className="font-bold">{campaign.conversionRate}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Risk Assessment</span>
              </CardTitle>
              <CardDescription>Identified risks and their potential impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskAssessments.map((risk) => (
                <div key={risk.category} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">{risk.category}</span>
                    <Badge className={getRiskColor(risk.level)}>
                      {risk.level} Risk
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Risk Score</span>
                      <span className="font-bold">{risk.score}/100</span>
                    </div>
                    <Progress value={risk.score} className="h-2" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Key factors:</span>
                      <span className="ml-2">{risk.factors.join(", ")}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Potential impact:</span>
                      <span className="ml-2">{risk.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Target, Gift, DollarSign, Award, 
  Calendar, TrendingUp, Star
} from 'lucide-react';

export const IncentiveManagement = () => {
  const [incentivePrograms] = useState([
    {
      id: 'p1',
      name: 'Q1 Sales Champion',
      type: 'sales_target',
      status: 'active',
      start_date: '2024-01-01',
      end_date: '2024-03-31',
      target_amount: 500000,
      reward_amount: 25000,
      participants: 12,
      description: 'Achieve sales target for Q1 2024'
    },
    {
      id: 'p2',
      name: 'Farmer Acquisition Bonus',
      type: 'farmer_acquisition',
      status: 'active',
      start_date: '2024-01-01',
      end_date: '2024-06-30',
      target_amount: 100,
      reward_amount: 10000,
      participants: 8,
      description: 'Acquire 100+ new farmers'
    }
  ]);

  const [dealerProgress] = useState([
    {
      dealer_id: 'd1',
      dealer_name: 'Green Valley Seeds',
      programs: [
        {
          program_id: 'p1',
          program_name: 'Q1 Sales Champion',
          progress: 95,
          current_value: 475000,
          target_value: 500000,
          estimated_reward: 23750
        },
        {
          program_id: 'p2',
          program_name: 'Farmer Acquisition Bonus',
          progress: 85,
          current_value: 85,
          target_value: 100,
          estimated_reward: 8500
        }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Running this quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹35,000</div>
            <p className="text-xs text-muted-foreground">
              Allocated this quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Dealers participating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Towards targets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Programs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Incentive Programs</CardTitle>
              <CardDescription>
                Manage and track dealer incentive programs
              </CardDescription>
            </div>
            <Button>
              <Gift className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incentivePrograms.map((program) => (
              <div key={program.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{program.name}</h3>
                    <Badge variant={getStatusColor(program.status)}>
                      {program.status}
                    </Badge>
                    <Badge variant="outline">
                      {program.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ₹{program.reward_amount.toLocaleString()} reward
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {program.participants} participants
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {program.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Target: {program.type === 'sales_target' 
                        ? `₹${(program.target_amount / 100000).toFixed(1)}L` 
                        : `${program.target_amount} farmers`}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dealer Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Dealer Progress Tracking</CardTitle>
          <CardDescription>
            Track individual dealer progress across all active programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dealerProgress.map((dealer) => (
              <div key={dealer.dealer_id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">{dealer.dealer_name}</h3>
                
                <div className="space-y-4">
                  {dealer.programs.map((program) => (
                    <div key={program.program_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{program.program_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {program.progress}% complete
                        </span>
                      </div>
                      
                      <Progress value={program.progress} className="h-2" />
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Current: {program.program_id === 'p1' 
                            ? `₹${(program.current_value / 100000).toFixed(1)}L` 
                            : `${program.current_value} farmers`} / 
                          Target: {program.program_id === 'p1' 
                            ? `₹${(program.target_value / 100000).toFixed(1)}L` 
                            : `${program.target_value} farmers`}
                        </span>
                        <span className="font-medium text-green-600">
                          Estimated Reward: ₹{program.estimated_reward.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Performance Leaderboard
          </CardTitle>
          <CardDescription>
            Top performing dealers across all incentive programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Green Valley Seeds', score: 95, reward: 25000 },
              { rank: 2, name: 'Krishi Kendra', score: 88, reward: 18000 },
              { rank: 3, name: 'Farm Solutions', score: 82, reward: 15000 }
            ].map((dealer) => (
              <div key={dealer.rank} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  dealer.rank === 1 ? 'bg-yellow-500' : 
                  dealer.rank === 2 ? 'bg-gray-400' : 'bg-orange-600'
                }`}>
                  {dealer.rank}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold">{dealer.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Performance Score: {dealer.score}%
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ₹{dealer.reward.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Expected reward</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
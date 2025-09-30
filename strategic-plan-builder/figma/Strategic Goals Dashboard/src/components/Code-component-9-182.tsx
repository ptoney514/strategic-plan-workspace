import { ArrowLeft, BarChart3, Target, TrendingUp } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface Goal {
  id: string;
  number: string;
  title: string;
  description: string;
  completionPercentage: number;
  type: 'measure' | 'goal';
}

interface ObjectiveDetailProps {
  objective: {
    id: string;
    goalNumber: number;
    title: string;
    description: string;
    goals: Goal[];
  };
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
}

const mockGoals: Goal[] = [
  {
    id: '1.1',
    number: '1.1',
    title: 'Improve Reading Proficiency',
    description: 'Increase the percentage of students reading at grade level through targeted interventions.',
    completionPercentage: 0,
    type: 'goal'
  },
  {
    id: '1.2',
    number: '1.2', 
    title: 'Reduce Chronic Absenteeism',
    description: 'This is a measure',
    completionPercentage: 0,
    type: 'measure'
  },
  {
    id: '1.3',
    number: '1.3',
    title: 'Improve Reading Proficiency',
    description: '',
    completionPercentage: 0,
    type: 'goal'
  },
  {
    id: '1.4',
    number: '1.4',
    title: 'Reduce Chronic Absenteeism', 
    description: 'Implement strategies to improve student attendance and engagement.',
    completionPercentage: 0,
    type: 'measure'
  }
];

export function ObjectiveDetailView({ objective, isOpen, onClose, trigger }: ObjectiveDetailProps) {
  const goals = objective.goals || mockGoals;

  const getGoalIcon = (type: string) => {
    return type === 'measure' ? BarChart3 : Target;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 75) return 'text-emerald-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-full sm:w-[600px] sm:max-w-[600px] p-0 overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
                className="p-2 hover:bg-neutral-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                    Goal {objective.goalNumber}
                  </span>
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                </div>
                <SheetTitle className="text-left text-lg">{objective.title}</SheetTitle>
                <p className="text-sm text-neutral-600 mt-1">{objective.description}</p>
              </div>
            </div>
          </SheetHeader>

          {/* Goal Hierarchy Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-neutral-600" />
              <h3 className="text-base text-neutral-900">Goal Hierarchy</h3>
            </div>
            <p className="text-sm text-neutral-600">
              Track progress across all goals and measures within this strategic objective.
            </p>
          </div>

          {/* Goals List */}
          <div className="flex-1 px-6 pb-6">
            <div className="space-y-4">
              {goals.map((goal) => {
                const Icon = getGoalIcon(goal.type);
                
                return (
                  <div 
                    key={goal.id}
                    className="group p-4 bg-white border border-neutral-200 rounded-xl hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-teal-50 rounded-lg flex-shrink-0">
                        <Icon className="h-4 w-4 text-teal-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-teal-600">{goal.number}</span>
                          <h4 className="text-sm text-neutral-900 truncate">{goal.title}</h4>
                        </div>
                        
                        {goal.description && (
                          <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                            {goal.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${getProgressColor(goal.completionPercentage)}`}
                                style={{ width: `${goal.completionPercentage}%` }}
                              />
                            </div>
                            <span className={`text-xs ${getStatusColor(goal.completionPercentage)}`}>
                              {goal.completionPercentage}% complete
                            </span>
                          </div>
                          
                          <span className="text-xs text-neutral-400 group-hover:text-teal-600 transition-colors">
                            View details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
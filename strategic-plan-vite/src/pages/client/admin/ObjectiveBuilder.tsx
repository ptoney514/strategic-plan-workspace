import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Target,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  FileText,
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  Flag,
  AlertCircle,
  ChevronRight,
  Eye,
  Save,
  X,
  TrendingUp,
  Upload,
  Edit2
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { OverallProgressBar } from '../../../components/OverallProgressBar';
import { DEFAULT_OBJECTIVE_IMAGES } from '../../../lib/default-images';
import { GoalsService } from '../../../lib/services/goals.service';
import type { Goal } from '../../../lib/types';

interface ComponentItem {
  id: string;
  type: 'goal' | 'metric' | 'property';
  icon: React.ReactNode;
  label: string;
  description: string;
  category: string;
}

interface BuilderState {
  objective: Partial<Goal>;
  goals: Partial<Goal>[];
  activeSlot: 'basic' | 'visual' | 'goals' | 'metrics' | 'properties' | null;
  visibleComponents: {
    title: boolean;
    description: boolean;
    cardColor: boolean;
    cardImage: boolean;
    progressBar: boolean;
  };
  headerMode: 'color' | 'image';
}

const AVAILABLE_COMPONENTS: ComponentItem[] = [
  // Goals only - objective fields are now inline
  { id: 'new_goal', type: 'goal', icon: <Target size={20} />, label: 'Add Goal', description: 'Add a sub-goal', category: 'Goals' },
];

export function ObjectiveBuilder() {
  const { slug, objectiveId } = useParams();
  const navigate = useNavigate();
  const { data: district } = useDistrict(slug!);
  const isEditMode = !!objectiveId;
  const [builderState, setBuilderState] = useState<BuilderState>({
    objective: {
      title: '',
      description: '',
      level: 0,
    },
    goals: [],
    activeSlot: null,
    visibleComponents: {
      title: true,
      description: true,
      cardColor: true,
      cardImage: true,
      progressBar: true,
    },
    headerMode: 'color',
  });
  const [activeTab, setActiveTab] = useState<'objective' | 'goals'>('objective');
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [...new Set(AVAILABLE_COMPONENTS.map(c => c.category))];

  // Load objective data in edit mode
  useEffect(() => {
    if (isEditMode && objectiveId) {
      setIsLoading(true);
      Promise.all([
        GoalsService.getById(objectiveId),
        GoalsService.getChildren(objectiveId)
      ])
        .then(([objective, children]) => {
          if (objective) {
            setBuilderState(prev => ({
              ...prev,
              objective: objective,
              goals: children || [],
              headerMode: objective.image_url ? 'image' : 'color'
            }));
          }
        })
        .catch(error => {
          console.error('Error loading objective:', error);
          alert('Failed to load objective');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isEditMode, objectiveId]);

  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [propertyValue, setPropertyValue] = useState<string>('');

  const addProperty = (componentId: string) => {
    setEditingProperty(componentId);
    // Pre-fill with existing value if editing
    if (componentId === 'title') setPropertyValue(builderState.objective.title || '');
    if (componentId === 'description') setPropertyValue(builderState.objective.description || '');
    if (componentId === 'executive_summary') setPropertyValue(builderState.objective.executive_summary || '');
    if (componentId === 'image_url') setPropertyValue(builderState.objective.image_url || '');
    if (componentId === 'header_color') setPropertyValue(builderState.objective.header_color || '#3b82f6');
    if (componentId === 'owner') setPropertyValue(builderState.objective.owner_name || '');
    if (componentId === 'department') setPropertyValue(builderState.objective.department || '');
    if (componentId === 'dates') setPropertyValue(builderState.objective.start_date || '');
    if (componentId === 'priority') setPropertyValue(builderState.objective.priority || 'medium');
    if (componentId === 'progress_display') setPropertyValue(builderState.objective.overall_progress_display_mode || 'percentage');
  };

  const [endDate, setEndDate] = useState<string>('');

  const saveProperty = () => {
    if (!editingProperty) return;

    let updates: Partial<Goal> = {};

    // Map component IDs to objective properties
    if (editingProperty === 'title') updates.title = propertyValue;
    if (editingProperty === 'description') updates.description = propertyValue;
    if (editingProperty === 'executive_summary') updates.executive_summary = propertyValue;
    if (editingProperty === 'image_url') updates.image_url = propertyValue;
    if (editingProperty === 'header_color') updates.header_color = propertyValue;
    if (editingProperty === 'owner') updates.owner_name = propertyValue;
    if (editingProperty === 'department') updates.department = propertyValue;
    if (editingProperty === 'priority') updates.priority = propertyValue as any;
    if (editingProperty === 'progress_display') updates.overall_progress_display_mode = propertyValue as any;
    if (editingProperty === 'dates') {
      updates.start_date = propertyValue;
      updates.end_date = endDate;
    }

    setBuilderState(prev => ({
      ...prev,
      objective: {
        ...prev.objective,
        ...updates
      }
    }));

    setEditingProperty(null);
    setPropertyValue('');
    setEndDate('');
  };

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  const [goalWizardStep, setGoalWizardStep] = useState<1 | 2>(1);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    indicator_text: '',
    indicator_color: '#10b981',
    metrics: [] as Array<{
      name: string;
      visualization_type: string;
      target_value?: number;
      current_value?: number;
      unit: string;
    }>
  });
  const [selectedVisualization, setSelectedVisualization] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addGoal = () => {
    setEditingGoalIndex(null);
    setGoalWizardStep(1);
    setGoalForm({
      title: '',
      description: '',
      indicator_text: '',
      indicator_color: '#10b981',
      metrics: []
    });
    setSelectedVisualization('');
    setShowGoalModal(true);
  };

  const editGoal = (index: number) => {
    const goal = builderState.goals[index];
    setEditingGoalIndex(index);
    setGoalWizardStep(1);
    setGoalForm({
      title: goal.title || '',
      description: goal.description || '',
      indicator_text: goal.indicator_text || '',
      indicator_color: goal.indicator_color || '#10b981',
      metrics: (goal as any).metrics || []
    });
    setShowGoalModal(true);
  };

  const saveGoal = () => {
    if (!goalForm.title.trim()) return;

    if (editingGoalIndex !== null) {
      // Update existing goal
      setBuilderState(prev => ({
        ...prev,
        goals: prev.goals.map((g, i) => i === editingGoalIndex ? {
          ...g,
          title: goalForm.title,
          description: goalForm.description,
          indicator_text: goalForm.indicator_text,
          indicator_color: goalForm.indicator_color
        } : g)
      }));
    } else {
      // Add new goal
      setBuilderState(prev => ({
        ...prev,
        goals: [...prev.goals, {
          title: goalForm.title,
          description: goalForm.description,
          indicator_text: goalForm.indicator_text,
          indicator_color: goalForm.indicator_color,
          level: 1,
          parent_id: prev.objective.id,
          goal_number: `${prev.goals.length + 1}`,
        }]
      }));
    }

    setShowGoalModal(false);
    setEditingGoalIndex(null);
  };

  const removeGoal = (index: number) => {
    setBuilderState(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // Create local URL (in production, this would upload to Supabase Storage)
    const localUrl = URL.createObjectURL(file);
    setBuilderState(prev => ({
      ...prev,
      objective: { ...prev.objective, image_url: localUrl, header_color: undefined }
    }));
  };

  const toggleComponent = (componentKey: keyof BuilderState['visibleComponents']) => {
    setBuilderState(prev => ({
      ...prev,
      visibleComponents: {
        ...prev.visibleComponents,
        [componentKey]: !prev.visibleComponents[componentKey]
      }
    }));
  };

  const handleSaveAndPublish = async () => {
    if (!district?.id) {
      alert('District not found');
      return;
    }

    // Validate required fields
    if (!builderState.objective.title?.trim()) {
      alert('Please enter an objective title');
      return;
    }

    setIsSaving(true);
    try {
      let savedObjective: Goal;

      const objectiveData: Partial<Goal> = {
        district_id: district.id,
        title: builderState.objective.title,
        description: builderState.objective.description,
        level: 0,
        parent_id: null,
        image_url: builderState.objective.image_url,
        header_color: builderState.objective.header_color,
        overall_progress: builderState.objective.overall_progress,
        overall_progress_display_mode: builderState.objective.overall_progress_display_mode,
      };

      if (isEditMode && objectiveId) {
        // UPDATE existing objective
        savedObjective = await GoalsService.update(objectiveId, objectiveData);
        console.log('Updated objective:', savedObjective);

        // Delete all existing child goals
        const existingChildren = await GoalsService.getChildren(objectiveId);
        for (const child of existingChildren) {
          await GoalsService.delete(child.id);
        }
      } else {
        // CREATE new objective
        savedObjective = await GoalsService.create(objectiveData);
        console.log('Created objective:', savedObjective);
      }

      // Create/recreate all Goals (level 1) under this objective
      for (const goal of builderState.goals) {
        const goalData: Partial<Goal> = {
          district_id: district.id,
          title: goal.title!,
          description: goal.description,
          indicator_text: goal.indicator_text,
          indicator_color: goal.indicator_color,
          level: 1,
          parent_id: savedObjective.id,
        };

        await GoalsService.create(goalData);
      }

      alert(isEditMode ? 'Strategic Objective updated successfully!' : 'Strategic Objective created successfully!');
      navigate(`/${slug}/admin/goals`);
    } catch (error) {
      console.error('Error saving objective:', error);
      alert('Failed to save objective. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderCenterCanvas = () => {
    const { objective } = builderState;

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-foreground">Strategic Objective Builder</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create your strategic objective and add goals
            </p>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Objective Card Preview */}
            <div className="border-2 border-dashed border-border rounded-lg bg-white">
              {/* Header Section */}
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Strategic Objective</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Header Visual - Image or Color */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-medium text-muted-foreground">
                      CARD HEADER
                    </label>
                    <div className="flex border border-border rounded-md overflow-hidden">
                      <button
                        onClick={() => setBuilderState(prev => ({ ...prev, headerMode: 'color' }))}
                        className={`px-3 py-1 text-xs font-medium transition-colors ${
                          builderState.headerMode === 'color'
                            ? 'bg-primary text-white'
                            : 'bg-white text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        Color
                      </button>
                      <button
                        onClick={() => setBuilderState(prev => ({ ...prev, headerMode: 'image' }))}
                        className={`px-3 py-1 text-xs font-medium transition-colors ${
                          builderState.headerMode === 'image'
                            ? 'bg-primary text-white'
                            : 'bg-white text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        Image
                      </button>
                    </div>
                  </div>

                  {builderState.headerMode === 'color' ? (
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={objective.header_color || '#3b82f6'}
                        onChange={(e) => setBuilderState(prev => ({
                          ...prev,
                          objective: { ...prev.objective, header_color: e.target.value, image_url: undefined }
                        }))}
                        className="h-10 w-16 border border-border rounded cursor-pointer"
                      />
                      <div
                        className="flex-1 h-10 rounded-lg border border-border transition-all"
                        style={{ backgroundColor: objective.header_color || '#3b82f6' }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {objective.image_url ? (
                        <div className="relative">
                          <img
                            src={objective.image_url}
                            alt="Header"
                            className="w-full h-32 object-cover rounded-lg border border-border"
                          />
                          <button
                            onClick={() => setBuilderState(prev => ({
                              ...prev,
                              objective: { ...prev.objective, image_url: undefined }
                            }))}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Upload Custom Button */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                          >
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Upload Custom Image</span>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                          />

                          {/* Divider */}
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center">
                              <span className="px-2 bg-white text-xs text-muted-foreground">or choose from library</span>
                            </div>
                          </div>

                          {/* Image Library */}
                          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                            {DEFAULT_OBJECTIVE_IMAGES.map((img) => (
                              <button
                                key={img.id}
                                onClick={() => setBuilderState(prev => ({
                                  ...prev,
                                  objective: { ...prev.objective, image_url: img.url, header_color: undefined }
                                }))}
                                className="group relative aspect-[2/1] rounded-md overflow-hidden border-2 border-border hover:border-primary transition-all"
                                title={img.name}
                              >
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                  <div className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity text-center px-1">
                                    {img.name}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Title - Inline Editable */}
                {builderState.visibleComponents.title && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      OBJECTIVE TITLE
                    </label>
                    <input
                      type="text"
                      value={objective.title || ''}
                      onChange={(e) => setBuilderState(prev => ({
                        ...prev,
                        objective: { ...prev.objective, title: e.target.value }
                      }))}
                      placeholder="Enter strategic objective title..."
                      className="w-full text-2xl font-bold text-foreground bg-transparent border-0 border-b-2 border-transparent hover:border-muted focus:border-primary focus:outline-none px-0 py-2 transition-colors"
                    />
                  </div>
                )}

                {/* Description - Inline Editable */}
                {builderState.visibleComponents.description && (
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      DESCRIPTION
                    </label>
                    <textarea
                      value={objective.description || ''}
                      onChange={(e) => setBuilderState(prev => ({
                        ...prev,
                        objective: { ...prev.objective, description: e.target.value }
                      }))}
                      placeholder="Enter a detailed description of this strategic objective..."
                      rows={3}
                      className="w-full text-sm text-muted-foreground bg-transparent border-2 border-transparent hover:border-muted focus:border-primary focus:outline-none px-3 py-2 rounded-md resize-none transition-colors"
                    />
                  </div>
                )}

                {/* Progress Bar Preview */}
                {builderState.visibleComponents.progressBar && (
                  <div className="mb-6 p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-medium text-muted-foreground">
                        OVERALL PROGRESS (Preview)
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(objective.overall_progress || 0)}%
                      </span>
                    </div>
                    <OverallProgressBar
                      goal={{
                        ...objective,
                        overall_progress: objective.overall_progress || 0,
                        overall_progress_display_mode: objective.overall_progress_display_mode || 'percentage'
                      } as Goal}
                      showLabel={true}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={objective.overall_progress || 0}
                      onChange={(e) => setBuilderState(prev => ({
                        ...prev,
                        objective: { ...prev.objective, overall_progress: parseInt(e.target.value) }
                      }))}
                      className="w-full mt-3"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Adjust slider to preview different progress levels
                    </p>
                  </div>
                )}

                {/* Properties Grid */}
                {(objective.owner_name || objective.department || objective.start_date || objective.priority) && (
                  <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-muted/20 rounded-lg">
                    {objective.owner_name && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Owner</div>
                          <div className="font-medium">{objective.owner_name}</div>
                        </div>
                      </div>
                    )}
                    {objective.department && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Department</div>
                          <div className="font-medium">{objective.department}</div>
                        </div>
                      </div>
                    )}
                    {objective.start_date && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Timeline</div>
                          <div className="font-medium">{objective.start_date} - {objective.end_date}</div>
                        </div>
                      </div>
                    )}
                    {objective.priority && (
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Priority</div>
                          <div className="font-medium capitalize">{objective.priority}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Goals Section */}
                {builderState.goals.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">Goals Component</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{builderState.goals.length} goals</span>
                    </div>
                    <div className="space-y-2">
                      {builderState.goals.map((goal, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-border rounded-lg hover:border-primary/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">{goal.title}</div>
                              {goal.description && (
                                <div className="text-xs text-muted-foreground">{goal.description}</div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeGoal(idx)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComponentLibrary = () => {
    return (
      <div className="h-full flex flex-col bg-white border-r border-border">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Goals</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Add goals to this objective</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Add Goal Button */}
          <button
            onClick={addGoal}
            className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg text-left transition-all group"
          >
            <div className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg">
              <Plus size={20} />
            </div>
            <div>
              <div className="font-semibold text-blue-900 text-sm">
                Add New Goal
              </div>
              <div className="text-xs text-blue-700 mt-0.5">
                Click to create a sub-goal
              </div>
            </div>
          </button>

          {/* Goals List */}
          {builderState.goals.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  GOALS ({builderState.goals.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {builderState.goals.map((goal, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white border border-border rounded-md hover:border-primary/40 transition-colors group"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">
                            Goal {goal.goal_number}
                          </span>
                          {goal.indicator_text && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: goal.indicator_color || '#10b981' }}
                            >
                              {goal.indicator_text}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {goal.title}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => editGoal(idx)}
                        className="flex-shrink-0 p-1 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => removeGoal(idx)}
                        className="flex-shrink-0 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActiveComponents = () => {
    const { objective, goals, visibleComponents } = builderState;

    const activeComponents = [
      {
        id: 'title' as const,
        label: 'Title',
        value: objective.title,
        active: !!objective.title,
        visible: visibleComponents.title
      },
      {
        id: 'description' as const,
        label: 'Description',
        value: objective.description,
        active: !!objective.description,
        visible: visibleComponents.description
      },
      {
        id: 'cardImage' as const,
        label: 'Header Visual',
        value: objective.image_url || objective.header_color,
        active: !!(objective.image_url || objective.header_color),
        visible: visibleComponents.cardImage
      },
      {
        id: 'progressBar' as const,
        label: 'Progress Bar',
        value: 'Enabled',
        active: true,
        visible: visibleComponents.progressBar
      },
    ];

    return (
      <div className="h-full flex flex-col bg-white border-l border-border">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Active Components</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle components on/off
              </p>
            </div>
            <button className="p-1 hover:bg-muted rounded">
              <Eye className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Active Components List */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1.5">
            {activeComponents.map(component => (
              <div
                key={component.id}
                className={`flex items-center justify-between p-3 rounded-md border transition-all ${
                  component.visible
                    ? 'bg-white border-border'
                    : 'bg-muted/30 border-transparent opacity-50'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${component.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{component.label}</div>
                    {component.active && component.value && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {typeof component.value === 'string' ? component.value.substring(0, 30) : 'Configured'}
                      </div>
                    )}
                  </div>
                </div>
                <button className="flex-shrink-0 ml-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={component.visible}
                      onChange={() => toggleComponent(component.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </button>
              </div>
            ))}

            {/* Goals Section */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-foreground">Goals</div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {goals.length}
                </span>
              </div>
              {goals.length > 0 ? (
                <div className="space-y-1.5">
                  {goals.map((goal, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white border border-border rounded-md">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{goal.title}</span>
                      </div>
                      <button className="flex-shrink-0 ml-2 p-1 hover:bg-muted rounded">
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/30 rounded-md">
                  <p className="text-xs text-muted-foreground">No goals added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border space-y-2 bg-white">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border border-border hover:bg-muted/50 rounded-md transition-colors text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          <button
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            <span>Publish</span>
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading objective...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEditMode ? 'Edit Strategic Objective' : 'Create Strategic Objective'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditMode ? 'Update your strategic objective and goals' : 'Build your strategic objective visually'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/${slug}/admin/goals`)}
            className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-md transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndPublish}
            disabled={isSaving || !builderState.objective.title}
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save & Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Builder Interface */}
      <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
        {/* 3 Column Layout */}
        <div className="flex" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Left Sidebar - Component Library */}
          <div className="w-80 border-r border-border">
            {renderComponentLibrary()}
          </div>

          {/* Center - Visual Canvas */}
          <div className="flex-1 bg-slate-50">
            {renderCenterCanvas()}
          </div>

          {/* Right Sidebar - Active Components */}
          <div className="w-80 border-l border-border">
            {renderActiveComponents()}
          </div>
        </div>
      </div>

      {/* Property Edit Modal */}
      {editingProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingProperty === 'title' && 'Add Objective Title'}
                {editingProperty === 'description' && 'Add Description'}
                {editingProperty === 'executive_summary' && 'Add Executive Summary'}
                {editingProperty === 'image_url' && 'Add Header Image'}
                {editingProperty === 'header_color' && 'Choose Header Color'}
                {editingProperty === 'owner' && 'Add Owner'}
                {editingProperty === 'department' && 'Add Department'}
                {editingProperty === 'dates' && 'Set Timeline'}
                {editingProperty === 'priority' && 'Set Priority'}
                {editingProperty === 'progress_display' && 'Progress Display Mode'}
              </h3>

              {editingProperty === 'title' || editingProperty === 'owner' || editingProperty === 'department' ? (
                <input
                  type="text"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  placeholder={
                    editingProperty === 'title' ? 'Enter objective title...' :
                    editingProperty === 'owner' ? 'Enter owner name...' :
                    'Enter department name...'
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              ) : editingProperty === 'dates' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              ) : editingProperty === 'priority' ? (
                <div className="space-y-2">
                  {['critical', 'high', 'medium', 'low'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setPropertyValue(level)}
                      className={`w-full px-4 py-3 text-left border rounded-md transition-all ${
                        propertyValue === level
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{level}</span>
                        {propertyValue === level && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : editingProperty === 'progress_display' ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Choose how progress will be displayed on this objective</p>
                  {[
                    { value: 'percentage', label: 'Percentage', description: 'Show as 75%' },
                    { value: 'qualitative', label: 'Qualitative', description: 'Show as Excellent/Great/Good' },
                    { value: 'score', label: 'Score out of 5', description: 'Show as 3.75/5.00' },
                    { value: 'color-only', label: 'Color Only', description: 'Just the progress bar color' },
                    { value: 'hidden', label: 'Hidden', description: 'Don\'t show progress' },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setPropertyValue(mode.value)}
                      className={`w-full px-4 py-3 text-left border rounded-md transition-all ${
                        propertyValue === mode.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{mode.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{mode.description}</div>
                        </div>
                        {propertyValue === mode.value && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : editingProperty === 'image_url' ? (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the URL of an image to use as the header background
                  </p>
                  {propertyValue && (
                    <div className="mt-2 border border-border rounded-md overflow-hidden">
                      <img
                        src={propertyValue}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : editingProperty === 'header_color' ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      className="h-12 w-20 border border-border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div
                    className="h-20 rounded-md border border-border"
                    style={{ backgroundColor: propertyValue }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a color or enter a hex code
                  </p>
                </div>
              ) : (
                <textarea
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  placeholder={`Enter ${editingProperty === 'description' ? 'description' : 'executive summary'}...`}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  autoFocus
                />
              )}

              <div className="flex items-center justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setPropertyValue('');
                  }}
                  className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProperty}
                  className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Goal Modal - Wizard */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {editingGoalIndex !== null ? 'Edit Goal' : 'Create New Goal'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {goalWizardStep === 1 ? 'Step 1: Goal Information' : 'Step 2: Add Metrics (Optional)'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowGoalModal(false);
                    setGoalWizardStep(1);
                    setEditingGoalIndex(null);
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center space-x-2 mt-4">
                <div className={`flex-1 h-1 rounded-full ${goalWizardStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-1 rounded-full ${goalWizardStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {goalWizardStep === 1 ? (
                <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">Goal Title *</label>
                  <input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    placeholder="Enter goal title..."
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    placeholder="Enter goal description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Visual Customization Section */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center space-x-2">
                    <Flag className="h-4 w-4" />
                    <span>Visual Badge (Optional)</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Indicator Text */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={goalForm.indicator_text}
                        onChange={(e) => setGoalForm({ ...goalForm, indicator_text: e.target.value })}
                        placeholder="e.g., Priority, Featured"
                        maxLength={20}
                        className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Indicator Color */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Badge Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={goalForm.indicator_color}
                          onChange={(e) => setGoalForm({ ...goalForm, indicator_color: e.target.value })}
                          className="h-9 w-16 border border-border rounded cursor-pointer"
                        />
                        <div
                          className="flex-1 h-9 rounded border border-border"
                          style={{ backgroundColor: goalForm.indicator_color }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Badge */}
                  {goalForm.indicator_text && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-md">
                      <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: goalForm.indicator_color,
                          color: '#ffffff'
                        }}
                      >
                        {goalForm.indicator_text}
                      </span>
                    </div>
                  )}
                </div>

                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Add Metrics to "{goalForm.title}"</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose how you want to visualize performance for this goal (optional)
                    </p>
                  </div>

                  {/* Visualization Type Selector */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Available Visualizations */}
                    {[
                      { id: 'percentage', icon: '%', label: 'Percentage', desc: 'Show progress as %', available: true },
                      { id: 'number', icon: '#', label: 'Number/KPI', desc: 'Display key number', available: true },
                      { id: 'bar', icon: '📊', label: 'Bar Chart', desc: 'Compare values', available: true },
                      { id: 'line', icon: '📈', label: 'Line Chart', desc: 'Show trends', available: false },
                      { id: 'donut', icon: '🍩', label: 'Donut Chart', desc: 'Proportions', available: false },
                      { id: 'gauge', icon: '⏱️', label: 'Gauge', desc: 'Performance scale', available: false },
                    ].map((viz) => (
                      <button
                        key={viz.id}
                        onClick={() => viz.available && setSelectedVisualization(viz.id)}
                        disabled={!viz.available}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          selectedVisualization === viz.id
                            ? 'border-blue-600 bg-blue-50'
                            : viz.available
                            ? 'border-border hover:border-blue-300'
                            : 'border-border opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-2xl mb-2">{viz.icon}</div>
                        <div className="font-medium text-sm">{viz.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{viz.desc}</div>
                        {!viz.available && (
                          <div className="mt-2">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Coming Soon
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Metric Data Input - Shows when visualization is selected */}
                  {selectedVisualization && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                      <h4 className="font-semibold text-sm mb-3">Metric Details</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Metric Name *</label>
                          <input
                            type="text"
                            placeholder="e.g., Student Achievement Rate"
                            className="w-full px-3 py-2 border border-border rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Current Value</label>
                          <input
                            type="number"
                            placeholder="0"
                            className="w-full px-3 py-2 border border-border rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Target Value</label>
                          <input
                            type="number"
                            placeholder="100"
                            className="w-full px-3 py-2 border border-border rounded-md text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Unit</label>
                          <input
                            type="text"
                            placeholder="%"
                            defaultValue="%"
                            className="w-full px-3 py-2 border border-border rounded-md text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedVisualization('')}
                        className="mt-3 text-xs text-blue-600 hover:text-blue-700"
                      >
                        ← Change visualization type
                      </button>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-xs text-blue-900">
                      💡 {selectedVisualization ? 'Fill in metric details above, or skip to add later.' : 'Skip this step to add metrics later, or choose a visualization to add one now.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Navigation */}
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowGoalModal(false);
                    setGoalWizardStep(1);
                    setEditingGoalIndex(null);
                  }}
                  className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-md transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center space-x-2">
                  {goalWizardStep === 2 && (
                    <button
                      onClick={() => setGoalWizardStep(1)}
                      className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-md transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {goalWizardStep === 1 ? (
                    <button
                      onClick={() => setGoalWizardStep(2)}
                      disabled={!goalForm.title.trim()}
                      className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Add Metrics
                    </button>
                  ) : (
                    <button
                      onClick={saveGoal}
                      className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                    >
                      {editingGoalIndex !== null ? 'Update Goal' : 'Save Goal'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

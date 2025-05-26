'use client';

import { useMutation, useQuery } from 'convex/react';
import { AlertCircle, Filter, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

import { api } from '../../../../convex/_generated/api';

type QuestionMode = 'all' | 'unanswered' | 'incorrect' | 'bookmarked';
type TestMode = 'study' | 'exam';

interface FilterState {
  questionMode: QuestionMode;
  selectedThemes: string[];
  selectedSubthemes: string[];
  selectedGroups: string[];
  numQuestions: number;
  testMode: TestMode;
  name: string;
}

const initialFilters: FilterState = {
  questionMode: 'all',
  selectedThemes: [],
  selectedSubthemes: [],
  selectedGroups: [],
  numQuestions: 30,
  testMode: 'study',
  name: 'Test Quiz',
};

export default function FilterTestPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [testResults, setTestResults] = useState<any>();
  const [error, setError] = useState<string | undefined>();

  // Fetch hierarchical data like in the form
  const hierarchicalData = useQuery(api.themes.getHierarchicalData, {});

  // Live question count (now implemented!)
  const questionCount = useQuery(api.questionFiltering.getLiveQuestionCount, {
    questionMode: filters.questionMode,
    selectedThemes: filters.selectedThemes,
    selectedSubthemes: filters.selectedSubthemes,
    selectedGroups: filters.selectedGroups,
  });

  // Debug filter resolution
  const debugInfo = useQuery(api.questionFiltering.debugFilterResolution, {
    selectedThemes: filters.selectedThemes,
    selectedSubthemes: filters.selectedSubthemes,
    selectedGroups: filters.selectedGroups,
  });

  // Create quiz mutation (this will be updated)
  const createQuiz = useMutation(api.customQuizzes.create);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setError(undefined);
  };

  const toggleSelection = (
    key: 'selectedThemes' | 'selectedSubthemes' | 'selectedGroups',
    id: string,
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter(item => item !== id)
        : [...prev[key], id],
    }));
    setError(undefined);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setTestResults(undefined);
    setError(undefined);
  };

  const handleCreateTest = async () => {
    try {
      setError(undefined);
      // TODO: Implement when the new API is ready
      // const result = await createQuiz({
      //   name: filters.name,
      //   description: `Test quiz with ${filters.numQuestions} questions`,
      //   testMode: filters.testMode,
      //   questionMode: filters.questionMode,
      //   numQuestions: filters.numQuestions,
      //   selectedThemes: filters.selectedThemes,
      //   selectedSubthemes: filters.selectedSubthemes,
      //   selectedGroups: filters.selectedGroups,
      // });
      // setTestResults(result);

      // Placeholder for testing
      setTestResults({
        quizId: 'test-quiz-id',
        questionCount: filters.numQuestions,
      });
    } catch (error_: any) {
      setError(error_.message || 'Failed to create test');
    }
  };

  // Helper functions for hierarchical display
  const getSubthemesForTheme = (themeId: string) => {
    return (
      hierarchicalData?.subthemes?.filter(sub => sub.themeId === themeId) || []
    );
  };

  const getGroupsForSubtheme = (subthemeId: string) => {
    return (
      hierarchicalData?.groups?.filter(
        group => group.subthemeId === subthemeId,
      ) || []
    );
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Filter Test Page</h1>
          <p className="text-muted-foreground">
            Test the new filtering functionality as you implement it
          </p>
        </div>
        <Button
          onClick={resetFilters}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Filter Controls */}
        <div className="space-y-6 lg:col-span-2">
          {/* Primary Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Primary Filter (Question Mode)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={filters.questionMode}
                onValueChange={(value: QuestionMode) =>
                  updateFilter('questionMode', value)
                }
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">All Questions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unanswered" id="unanswered" />
                  <Label htmlFor="unanswered">Unanswered</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="incorrect" id="incorrect" />
                  <Label htmlFor="incorrect">Incorrect</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bookmarked" id="bookmarked" />
                  <Label htmlFor="bookmarked">Bookmarked</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Secondary Filters - Hierarchical Layout */}
          <Card>
            <CardHeader>
              <CardTitle>Secondary Filters (Hierarchy)</CardTitle>
              <p className="text-muted-foreground text-sm">
                Groups override subthemes, subthemes override themes
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Themes with nested subthemes and groups */}
              <div>
                <Label className="text-base font-medium">
                  Themes & Subthemes
                </Label>
                {hierarchicalData ? (
                  <div className="mt-4 space-y-4">
                    {hierarchicalData.themes?.map(theme => (
                      <div key={theme._id} className="space-y-3">
                        {/* Theme */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`theme-${theme._id}`}
                            checked={filters.selectedThemes.includes(theme._id)}
                            onCheckedChange={() =>
                              toggleSelection('selectedThemes', theme._id)
                            }
                          />
                          <Label
                            htmlFor={`theme-${theme._id}`}
                            className="font-medium"
                          >
                            {theme.name}
                          </Label>
                        </div>

                        {/* Subthemes for this theme */}
                        {getSubthemesForTheme(theme._id).length > 0 && (
                          <div className="ml-6 space-y-2">
                            {getSubthemesForTheme(theme._id).map(subtheme => (
                              <div key={subtheme._id} className="space-y-2">
                                {/* Subtheme */}
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`subtheme-${subtheme._id}`}
                                    checked={filters.selectedSubthemes.includes(
                                      subtheme._id,
                                    )}
                                    onCheckedChange={() =>
                                      toggleSelection(
                                        'selectedSubthemes',
                                        subtheme._id,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`subtheme-${subtheme._id}`}
                                    className="text-muted-foreground text-sm font-medium"
                                  >
                                    {subtheme.name}
                                  </Label>
                                </div>

                                {/* Groups for this subtheme */}
                                {getGroupsForSubtheme(subtheme._id).length >
                                  0 && (
                                  <div className="ml-6 grid grid-cols-1 gap-1 sm:grid-cols-2">
                                    {getGroupsForSubtheme(subtheme._id).map(
                                      group => (
                                        <div
                                          key={group._id}
                                          className="flex items-center space-x-2"
                                        >
                                          <Checkbox
                                            id={`group-${group._id}`}
                                            checked={filters.selectedGroups.includes(
                                              group._id,
                                            )}
                                            onCheckedChange={() =>
                                              toggleSelection(
                                                'selectedGroups',
                                                group._id,
                                              )
                                            }
                                          />
                                          <Label
                                            htmlFor={`group-${group._id}`}
                                            className="text-muted-foreground text-xs"
                                          >
                                            {group.name}
                                          </Label>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground mt-4 text-sm">
                    Loading themes...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Test Name</Label>
                  <Input
                    id="name"
                    value={filters.name}
                    onChange={e => updateFilter('name', e.target.value)}
                    placeholder="Enter test name"
                  />
                </div>
                <div>
                  <Label htmlFor="numQuestions">Number of Questions</Label>
                  <Input
                    id="numQuestions"
                    type="number"
                    min="1"
                    max="120"
                    value={filters.numQuestions}
                    onChange={e =>
                      updateFilter(
                        'numQuestions',
                        Number.parseInt(e.target.value) || 30,
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Test Mode</Label>
                <RadioGroup
                  value={filters.testMode}
                  onValueChange={(value: TestMode) =>
                    updateFilter('testMode', value)
                  }
                  className="mt-2 flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="study" id="study" />
                    <Label htmlFor="study">Study Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="exam" id="exam" />
                    <Label htmlFor="exam">Exam Mode</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Live Count */}
          <Card>
            <CardHeader>
              <CardTitle>Live Question Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-primary text-4xl font-bold">
                  {questionCount === undefined ? '...' : questionCount}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  questions match your filters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Filters Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Active Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Question Mode:</Label>
                <Badge variant="secondary" className="ml-2">
                  {filters.questionMode}
                </Badge>
              </div>

              {filters.selectedThemes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Themes:</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {filters.selectedThemes.map(id => {
                      const theme = hierarchicalData?.themes?.find(
                        t => t._id === id,
                      );
                      return (
                        <Badge key={id} variant="outline" className="text-xs">
                          {theme?.name || id}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {filters.selectedSubthemes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Subthemes:</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {filters.selectedSubthemes.map(id => {
                      const subtheme = hierarchicalData?.subthemes?.find(
                        s => s._id === id,
                      );
                      return (
                        <Badge key={id} variant="outline" className="text-xs">
                          {subtheme?.name || id}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {filters.selectedGroups.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Groups:</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {filters.selectedGroups.map(id => {
                      const group = hierarchicalData?.groups?.find(
                        g => g._id === id,
                      );
                      return (
                        <Badge key={id} variant="outline" className="text-xs">
                          {group?.name || id}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Test Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleCreateTest}
                className="flex w-full items-center gap-2"
                disabled={!questionCount || questionCount === 0}
              >
                <Play className="h-4 w-4" />
                Create Test ({filters.numQuestions} questions)
              </Button>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Test Results */}
          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle>Test Created Successfully!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Quiz ID:</strong> {testResults.quizId}
                  </p>
                  <p>
                    <strong>Questions Selected:</strong>{' '}
                    {testResults.questionCount}
                  </p>
                  <p>
                    <strong>Mode:</strong> {filters.testMode}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Filter State:</Label>
            <pre className="bg-muted mt-2 overflow-auto rounded p-4 text-xs">
              {JSON.stringify(filters, undefined, 2)}
            </pre>
          </div>

          {debugInfo && (
            <div>
              <Label className="text-sm font-medium">Filter Resolution:</Label>
              <pre className="bg-muted mt-2 overflow-auto rounded p-4 text-xs">
                {JSON.stringify(debugInfo, undefined, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

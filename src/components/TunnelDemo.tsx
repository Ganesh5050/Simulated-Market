import React, { useState } from 'react'
import { useTunnel } from '@/hooks/useTunnel'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Phone, PhoneOff, Mic, Save } from 'lucide-react'

export default function TunnelDemo() {
  const [idea, setIdea] = useState('')
  const [userId] = useState('demo-user-123') // In real app, this would come from auth
  
  const {
    analysis,
    isLoading,
    error,
    activeCall,
    isCallLoading,
    callError,
    analyzeIdea,
    startVoiceCall,
    endVoiceCall,
    clearError,
  } = useTunnel()

  // Auto-save functionality
  const { saveNow } = useAutoSave(analysis?.sessionId || null, analysis, 2000)

  const handleAnalyze = async () => {
    if (!idea.trim()) return
    await analyzeIdea(userId, idea)
  }

  const handleVoiceCall = async (personaId: string) => {
    if (!analysis) return
    await startVoiceCall(personaId, analysis.idea)
  }

  const handleEndCall = async () => {
    if (!activeCall) return
    await endVoiceCall(activeCall.id)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Tunnel AI Market Research</h1>
          <p className="text-muted-foreground">
            Test your product idea against AI personas in real-time
          </p>
          {analysis && (
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline">Session: {analysis.sessionId.slice(0, 8)}...</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={saveNow}
                className="text-xs"
              >
                <Save className="w-3 h-3 mr-1" />
                Save Now
              </Button>
            </div>
          )}
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Product Idea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Describe your product idea..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={isLoading || !idea.trim()}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </div>
            
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm">{error}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearError}
                  className="mt-2"
                >
                  Clear Error
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Sentiment Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Market Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Badge variant="default" className="bg-green-500">
                    Positive: {analysis.sentiment.positive}
                  </Badge>
                  <Badge variant="secondary">
                    Neutral: {analysis.sentiment.neutral}
                  </Badge>
                  <Badge variant="destructive">
                    Negative: {analysis.sentiment.negative}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {analysis.insights}
                </p>
              </CardContent>
            </Card>

            {/* Viral Coefficient & Global Deployment */}
            {analysis.viralCoefficient !== undefined && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Viral Coefficient</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {analysis.viralCoefficient.toFixed(1)}/10
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Potential for organic spread
                      </p>
                      <div className="mt-4 w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(analysis.viralCoefficient / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {analysis.globalDeployment && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Global Deployment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Total Reactions:</span>
                          <span className="text-sm">{analysis.globalDeployment.totalReactions}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">By Continent:</p>
                          <div className="space-y-1">
                            {Object.entries(analysis.globalDeployment.continentBreakdown).map(([continent, count]) => (
                              <div key={continent} className="flex justify-between text-xs">
                                <span>{continent}:</span>
                                <span>{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Top Concerns & Suggestions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Concerns</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.topConcerns.map((concern, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {concern}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.topSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Persona Reactions */}
            <Card>
              <CardHeader>
                <CardTitle>Focus Group Reactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.reactions.map((reaction, index) => {
                    const persona = analysis.focusGroupPersonas[index]
                    return (
                      <div key={reaction.personaId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{persona?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {persona?.role} in {persona?.industry}, {persona?.age} years old
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                reaction.reaction === 'positive' ? 'default' :
                                reaction.reaction === 'neutral' ? 'secondary' : 'destructive'
                              }
                            >
                              {reaction.reaction}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVoiceCall(reaction.personaId)}
                              disabled={isCallLoading || activeCall?.id === reaction.personaId}
                            >
                              {activeCall?.id === reaction.personaId ? (
                                <>
                                  <Mic className="w-4 h-4 mr-1" />
                                  Talking...
                                </>
                              ) : (
                                <>
                                  <Phone className="w-4 h-4 mr-1" />
                                  Call
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {reaction.reasoning}
                        </p>
                        {reaction.suggestions && reaction.suggestions.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Suggestions:</strong> {reaction.suggestions.join(', ')}
                          </div>
                        )}
                        {reaction.concerns && reaction.concerns.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Concerns:</strong> {reaction.concerns.join(', ')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active Call Status */}
            {activeCall && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Voice Call</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Call Status: {activeCall.status}</p>
                      {activeCall.transcript && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Transcript: {activeCall.transcript}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleEndCall}
                      disabled={activeCall.status === 'completed'}
                    >
                      <PhoneOff className="w-4 h-4 mr-1" />
                      End Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {callError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm">{callError}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

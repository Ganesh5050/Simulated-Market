import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GlobeScene from "@/components/GlobeScene";
import { Node } from "@/components/GlobeNodes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { generateNodes } from "@/utils/generateNodes";
import NodeInfo from "@/components/NodeInfo";
import { PersonaService } from "@/services/personaService";
import { voiceRecordingService, VoiceCall } from "@/services/voiceRecordingService";
import { ProjectService } from "@/services/projectService";
import { AIPersonaService } from "@/services/aiPersonaService";
import { Project, ProjectPersonaNode } from "@/lib/supabase";
import { useSessionState } from "@/hooks/useSessionState";
import { Trash2 } from "lucide-react";
import { vapiService } from "@/services/vapiService";

const Simulation = () => {
  const { id } = useParams();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [analysisInput, setAnalysisInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [callTranscripts, setCallTranscripts] = useState<Array<{role: 'user' | 'assistant', text: string}>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [focusedNodes, setFocusedNodes] = useState<string[]>([]);
  const [analyzedNodes, setAnalyzedNodes] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [feedbackList, setFeedbackList] = useState<Node[]>([]);
  const [impactScore, setImpactScore] = useState(0);
  const [showAllNodes, setShowAllNodes] = useState(false);
  const [showFocusedNodes, setShowFocusedNodes] = useState(false);
  const [clickedNodes, setClickedNodes] = useState<Set<string>>(new Set());
  const [personaService] = useState(() => PersonaService.getInstance());
  const [currentVoiceCall, setCurrentVoiceCall] = useState<VoiceCall | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [realPersonas, setRealPersonas] = useState<any[]>([]);
  const [realFeedback, setRealFeedback] = useState<any[]>([]);
  
  // Session management state
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionDescription, setNewSessionDescription] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  
  // Project and AI services
  const [projectService] = useState(() => ProjectService.getInstance());
  const [aiPersonaService] = useState(() => AIPersonaService.getInstance());
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectPersonaNodes, setProjectPersonaNodes] = useState<ProjectPersonaNode[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // Session state management
  const {
    sessionState,
    userPreferences,
    isLoading: isLoadingSession,
    isSaving,
    updateSessionState,
    saveSessionState,
    createSession,
    getProjectSessions,
    deleteSession,
    resumeSession
  } = useSessionState(id || '', 'Main Session');
  
  // Generate nodes based on project persona nodes or fallback to mock data
  const nodes = useMemo(() => {
    if (projectPersonaNodes.length > 0) {
      // Use real project persona nodes
      return projectPersonaNodes.map((projectNode, index) => {
        const persona = projectNode.persona;
        const sentiment = projectNode.sentiment === 'positive' ? 'green' : 
                        projectNode.sentiment === 'negative' ? 'red' : 'yellow';
        
        return {
          id: projectNode.node_id,
          lat: projectNode.lat,
          lon: projectNode.lon,
          status: sentiment as 'green' | 'yellow' | 'red',
          sentiment: sentiment as 'green' | 'yellow' | 'red',
          name: persona?.name || `Persona ${index + 1}`,
          persona: persona,
          feedback: projectNode.feedback
        };
      });
    } else {
      // Fallback to mock data
      const generatedNodes = generateNodes(200);
      const allPersonas = personaService.getAllPersonas();
      
      return generatedNodes.map((node, index) => {
        const persona = allPersonas[index % allPersonas.length];
        
        const hash = node.id.split('').reduce((acc, char) => {
          acc = ((acc << 5) - acc) + char.charCodeAt(0);
          return acc & acc;
        }, 0);
        const normalizedHash = Math.abs(hash) % 100;
        
        let sentiment: 'green' | 'yellow' | 'red';
        if (normalizedHash < 40) sentiment = 'green';
        else if (normalizedHash < 70) sentiment = 'yellow';
        else sentiment = 'red';
        
        return { 
          ...node, 
          sentiment,
          status: sentiment,
          name: persona?.name || `Persona ${index + 1}`,
          persona: persona
        };
      });
    }
  }, [projectPersonaNodes, personaService]);

  // State for tracking which nodes have analyzed sentiment
  const [analyzedSentiment, setAnalyzedSentiment] = useState(false);

  // Load project data and restore session state when component mounts
  useEffect(() => {
    if (id) {
      loadProjectData(id);
      loadSessions();
    }
  }, [id]);

  // Load sessions for the project
  const loadSessions = async () => {
    try {
      const projectSessions = await getProjectSessions();
      setSessions(projectSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  // Restore session state when it loads
  useEffect(() => {
    if (sessionState && !isLoadingSession) {
      restoreSessionState(sessionState);
    }
  }, [sessionState, isLoadingSession]);

  // Reload feedback when project changes (either currentProject or URL params)
  useEffect(() => {
    const activeProjectId = currentProject?.id || id;
    if (activeProjectId) {
      console.log('Project changed, reloading feedback for:', activeProjectId, {
        fromCurrentProject: !!currentProject?.id,
        fromUrlParams: !!id
      });
      loadFeedbackFromLocalStorage();
    }
  }, [currentProject?.id, id]); // Trigger on both changes

  const loadProjectData = async (projectId: string) => {
    try {
      setIsLoadingProject(true);
      
      // Load project details
      const project = await projectService.getProject(projectId);
      setCurrentProject(project);
      
      // Load feedback for this project from localStorage
      setTimeout(() => {
        loadFeedbackFromLocalStorage();
      }, 200);
      
      // Set analysis input from project prompt
      if (project && project.prompt) {
        setAnalysisInput(project.prompt);
      }
      
      // Load existing persona nodes
      const personaNodes = await projectService.getProjectPersonaNodes(projectId);
      setProjectPersonaNodes(personaNodes);
      
      // If no persona nodes exist, generate them
      if (personaNodes.length === 0 && project && project.prompt) {
        await generatePersonasForProject(projectId, project.prompt);
      }
      
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setIsLoadingProject(false);
    }
  };

  const generatePersonasForProject = async (projectId: string, prompt: string) => {
    try {
      const personaNodes = await aiPersonaService.generatePersonasForProject(projectId, prompt);
      setProjectPersonaNodes(personaNodes);
    } catch (error) {
      console.error('Failed to generate personas:', error);
    }
  };

  // Load feedback from localStorage for current project
  const loadFeedbackFromLocalStorage = () => {
    // Use project ID from currentProject or fallback to URL params
    const activeProjectId = currentProject?.id || id;
    const activeProjectName = currentProject?.name || `Project ${id}`;
    
    if (!activeProjectId) {
      console.log('❌ No project ID available (neither currentProject nor URL params), cannot load feedback');
      return;
    }
    
    const projectFeedbackKey = `project_feedback_${activeProjectId}`;
    const localStorageFeedback = JSON.parse(localStorage.getItem(projectFeedbackKey) || '[]');
    console.log('🔍 Loading feedback from localStorage:', {
      projectKey: projectFeedbackKey,
      projectId: activeProjectId,
      projectName: activeProjectName,
      feedbackItems: localStorageFeedback.length,
      feedbackData: localStorageFeedback,
      source: currentProject?.id ? 'currentProject' : 'URL params'
    });
    
    if (localStorageFeedback.length > 0) {
      console.log('✅ Setting feedback list from localStorage:', localStorageFeedback);
      setFeedbackList(localStorageFeedback);
    } else {
      console.log('⚠️ No feedback found in localStorage for this project');
    }
  };

  // Restore session state from saved data
  const restoreSessionState = (state: any) => {
    console.log('🔄 Restoring session state:', {
      hasFeedbackList: !!(state.feedback_list && state.feedback_list.length > 0),
      feedbackListLength: state.feedback_list?.length || 0,
      currentProjectId: currentProject?.id
    });
    
    setAnalysisInput(state.analysis_input || '');
    setSelectedNode(state.selected_node || null);
    setFocusedNodes(state.focused_nodes || []);
    setAnalyzedNodes(state.analyzed_nodes || []);
    
    // Don't immediately set feedback list from session state
    // Let localStorage take priority, fallback to session state
    const sessionFeedback = state.feedback_list || [];
    if (sessionFeedback.length > 0) {
      console.log('📝 Session has feedback, but will let localStorage override');
    }
    
    setImpactScore(state.impact_score || 0);
    setAnalyzedSentiment(state.analyzed_sentiment || false);
    setShowAllNodes(state.show_all_nodes || false);
    setShowFocusedNodes(state.show_focused_nodes || false);
    setClickedNodes(new Set(state.clicked_nodes || []));
    setCurrentVoiceCall(state.current_voice_call || null);
    setIsRecording(state.is_recording || false);
    setLiveTranscript(state.live_transcript || '');
    setAnalysisProgress(state.analysis_progress || 0);
    setIsAnalyzing(state.is_analyzing || false);
    setIsFocusing(state.is_focusing || false);
    setShowFeedback(state.show_feedback || false);
    setIsCalling(state.is_calling || false);
    
    // Load feedback from localStorage after a delay to ensure it overrides session state
    setTimeout(() => {
      console.log('⏰ Delayed feedback loading triggered');
      loadFeedbackFromLocalStorage();
    }, 300);
  };

  // Determine which nodes to display based on state
  const getDisplayNodes = () => {
    if (showFocusedNodes && focusedNodes.length > 0) {
      // Show focused nodes with their STABLE colors (NO white nodes)
      return nodes
        .filter(node => focusedNodes.includes(node.id))
        .map(node => ({ ...node, status: node.sentiment }));
    } else if (showAllNodes) {
      // Show all 200 nodes in WHITE
      return nodes.map(node => ({ ...node, status: 'white' as const }));
    } else {
      // Show no nodes initially
      return [];
    }
  };

  const displayNodes = getDisplayNodes();

  const handleAnalyze = async () => {
    if (!analysisInput.trim()) return;
    
    // Reset everything for fresh analysis
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalyzedNodes([]);
    setShowAllNodes(true); // Show all 200 nodes in WHITE
    setShowFocusedNodes(false);
    setFocusedNodes([]);
    setFeedbackList([]);
    setImpactScore(0);
    setAnalyzedSentiment(false);
    
    // Auto-save analysis state
    updateSessionState({
      analysis_input: analysisInput,
      is_analyzing: true,
      analysis_progress: 0,
      show_all_nodes: true,
      show_focused_nodes: false,
      focused_nodes: [],
      analyzed_nodes: [],
      feedback_list: [],
      impact_score: 0,
      analyzed_sentiment: false
    });
    
    try {
      // Get real personas from the service
      const personas = personaService.getAllPersonas();
      setRealPersonas(personas);
      
      // Analyze personas with the idea
      const analyzedCountries = personaService.analyzePersonasWithIdea(analysisInput);
    
    // Simulate analysis progress
      const totalNodes = 200;
    let processed = 0;
    
    const interval = setInterval(() => {
        processed += 10;
      const progress = Math.min((processed / totalNodes) * 100, 100);
      setAnalysisProgress(progress);
        
        // Auto-save progress
        updateSessionState({
          analysis_progress: progress,
          analyzed_nodes: Array.from({ length: processed }, (_, i) => `node-${i + 1}`)
        });
      
        if (processed >= totalNodes) {
          clearInterval(interval);
            setIsAnalyzing(false);
          
          // Auto-save completion
          updateSessionState({
            is_analyzing: false,
            analysis_progress: 100
          });
        }
      }, 50);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
      
      // Auto-save error state
      updateSessionState({
        is_analyzing: false,
        analysis_progress: 0
      });
    }
  };

  const handleFocus = () => {
    if (!showAllNodes) return; // Only allow focus after Enter
    
    setIsFocusing(true);
    setShowFocusedNodes(false);
    
    // Select 10-15 random nodes from the 200 nodes
    const focusCount = Math.floor(Math.random() * 6) + 10; // Random between 10-15
    const randomNodes = [...nodes]
      .sort(() => Math.random() - 0.5)
      .slice(0, focusCount)
      .map(n => n.id);
    
    setTimeout(() => {
      setFocusedNodes(randomNodes);
      setShowFocusedNodes(true); // Show COLORED nodes (NO white)
      setShowAllNodes(false); // Hide white nodes
      setIsFocusing(false);
    }, 1500);
  };

  // Calculate impact score based on colored focused nodes
  const calculateImpactScore = () => {
    if (!showFocusedNodes || displayNodes.length === 0) return;
    
    const greenCount = displayNodes.filter(n => n.status === 'green').length;
    const yellowCount = displayNodes.filter(n => n.status === 'yellow').length;
    const redCount = displayNodes.filter(n => n.status === 'red').length;
    
    // Calculate score: green = +3, yellow = +1, red = -1
    const totalScore = (greenCount * 3) + (yellowCount * 1) + (redCount * -1);
    const maxPossibleScore = displayNodes.length * 3;
    const score = Math.max(0, Math.round((totalScore / maxPossibleScore) * 100));
    
    setImpactScore(score);
    setAnalyzedSentiment(true);
  };

  const handleAddFeedback = async () => {
    console.log('🎯 handleAddFeedback called:', {
      hasSelectedNode: !!selectedNode,
      selectedNodeId: selectedNode?.id,
      currentProjectId: currentProject?.id,
      urlProjectId: id, // Get from URL params
      feedbackListLength: feedbackList.length,
      alreadyInFeedbackList: feedbackList.find(n => n.id === selectedNode?.id)
    });
    
    if (selectedNode && !feedbackList.find(n => n.id === selectedNode.id)) {
      const updatedList = [...feedbackList, selectedNode];
      setFeedbackList(updatedList);
      updateSessionState({ feedback_list: updatedList });

      // Use project ID from currentProject or fallback to URL params
      const activeProjectId = currentProject?.id || id;
      const activeProjectName = currentProject?.name || `Project ${id}`;
      
      console.log('🔧 Using project info:', {
        fromCurrentProject: !!currentProject?.id,
        fromUrlParams: !!id,
        activeProjectId: activeProjectId,
        activeProjectName: activeProjectName
      });

      // Save to localStorage as fallback for immediate persistence
      if (activeProjectId) {
        const projectFeedbackKey = `project_feedback_${activeProjectId}`;
        const existingFeedback = JSON.parse(localStorage.getItem(projectFeedbackKey) || '[]');
        const newFeedback = {
          ...selectedNode,
          project_id: activeProjectId,
          created_at: new Date().toISOString()
        };
        const combinedFeedback = [...existingFeedback, newFeedback];
        
        console.log('💾 Saving feedback to localStorage:', {
          projectKey: projectFeedbackKey,
          beforeSave: existingFeedback.length,
          afterSave: combinedFeedback.length,
          newFeedbackId: selectedNode.id,
          projectName: activeProjectName,
          newFeedbackData: newFeedback
        });
        
        localStorage.setItem(projectFeedbackKey, JSON.stringify(combinedFeedback));
        
        // Verify it was saved
        const verifySaved = JSON.parse(localStorage.getItem(projectFeedbackKey) || '[]');
        console.log('✅ Verification - feedback saved to localStorage:', {
          totalItems: verifySaved.length,
          lastItem: verifySaved[verifySaved.length - 1]
        });
      } else {
        console.log('❌ Cannot save feedback - no project ID available');
      }

      // Save to database if we have a project and user is authenticated
      if (currentProject?.id && localStorage.getItem('auth_token')) {
        try {
          await fetch('https://pipe-it-backend.onrender.com/feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo-token'}`
            },
            body: JSON.stringify({
              project_id: currentProject.id,
              node_id: selectedNode.id,
              persona_id: selectedNode.persona?.id || null,
              feedback_text: selectedNode.feedback || `Feedback from ${selectedNode.name}`,
              sentiment: selectedNode.status === 'green' ? 'positive' : 
                        selectedNode.status === 'red' ? 'negative' : 'neutral',
              confidence_score: selectedNode.status === 'green' ? 0.8 :
                              selectedNode.status === 'red' ? 0.7 : 0.5
            })
          });
          console.log('✅ Feedback saved to database');
        } catch (error) {
          console.error('Failed to save feedback to database:', error);
          // Feedback is still saved in localStorage, so it will persist
        }
      } else {
        console.log('⚠️ Skipping database save - no authenticated user or project');
      }
    } else {
      console.log('⚠️ Feedback not added - either no selected node or already in feedback list');
    }
  };

  const handleGetFeedback = async () => {
    if (!currentProject?.id) {
      console.log('No project selected');
      return;
    }

    try {
      const response = await fetch(`https://pipe-it-backend.onrender.com/projects/${currentProject.id}/feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRealFeedback(data.feedback || []);
        console.log('✅ Fetched feedback from database:', data.feedback);
        
        // Show a success message
        setLiveTranscript(`✅ Loaded ${data.feedback?.length || 0} feedback items from database`);
        setTimeout(() => setLiveTranscript(""), 3000);
      } else {
        console.error('Failed to fetch feedback');
        setLiveTranscript('❌ Failed to load feedback');
        setTimeout(() => setLiveTranscript(""), 3000);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setLiveTranscript('❌ Error loading feedback');
      setTimeout(() => setLiveTranscript(""), 3000);
    }
  };

  const handleCreateSession = async () => {
    if (newSessionName.trim()) {
      try {
        const newSession = await createSession(newSessionName, newSessionDescription);
        
        setNewSessionName("");
        setNewSessionDescription("");
        setIsSessionDialogOpen(false);
        
        // Refresh sessions list
        await loadSessions();
        
      } catch (error) {
        console.error('Failed to create session:', error);
        alert('Failed to create session. Please try again.');
      }
    }
  };

  const handleDeleteSession = async (sessionId: string, sessionName: string) => {
    if (confirm(`Are you sure you want to delete "${sessionName}"? This action cannot be undone.`)) {
      try {
        await deleteSession(sessionId);
        await loadSessions(); // Refresh the sessions list
      } catch (error) {
        console.error('Failed to delete session:', error);
        alert('Failed to delete session. Please try again.');
      }
    }
  };

  const handleStopRecording = async () => {
    try {
      if (isRecording) {
        console.log('Stopping recording...');
        // Stop recording
        const voiceCall = await voiceRecordingService.stopRecording();
        setIsRecording(false);
        
        console.log('Voice call stopped:', voiceCall);
        console.log('Current voice call:', currentVoiceCall);
        
        if (voiceCall && currentVoiceCall) {
          // Get transcript from the recording
          let transcript = voiceCall.transcript || "";
          console.log('Transcript from recording:', transcript);
          
          // Get duration from the recording if available
          const duration = voiceCall.recording?.duration || 3;
          
          // If no transcript (speech recognition didn't work), use a default message
          if (!transcript || transcript.includes('Speech recognition not available') || transcript.includes('⚠️') || transcript.includes('Listening')) {
            transcript = "Hi! I'd like to know your thoughts on this product idea.";
            setLiveTranscript("📝 Processing your voice message...");
            console.log('Using default message');
          } else {
            setLiveTranscript("📝 Processing your voice message...");
          }

          // Call AI service for response
          const response = await fetch('https://pipe-it-backend.onrender.com/ai/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo-token'}`
            },
            body: JSON.stringify({
              personaName: selectedNode?.name || `Persona ${selectedNode?.id}`,
              productIdea: analysisInput || "Product idea",
              userMessage: transcript,
              demographics: selectedNode
            })
          });

          console.log('AI response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            const aiResponse = result.response || "I understand your question.";
            console.log('AI response received:', aiResponse);
            
            // Show conversation
            setCallTranscripts([
              { role: 'user', text: '🎤 [Voice Message]' },
              { role: 'assistant', text: aiResponse }
            ]);
            setLiveTranscript("✅ Response received");
            
            console.log('Speaking response...');
            // Speak the AI response using text-to-speech
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(aiResponse);
              utterance.lang = 'en-US';
              utterance.rate = 0.9;
              utterance.pitch = 1.0;
              speechSynthesis.speak(utterance);
            }
          } else {
            console.log('AI not configured, showing demo response');
            // If AI not configured, show a demo response
            const demoResponse = `Thank you for your voice message! I'd love to share my thoughts on your product idea. Since the AI service isn't fully configured yet, this is a demo response. The voice recording feature is working - you successfully recorded about 5 seconds of audio!`;
            
            setCallTranscripts([
              { role: 'user', text: '🎤 [Voice Message Recorded]' },
              { role: 'assistant', text: demoResponse }
            ]);
            setLiveTranscript("✅ Recording successful!");
            
            console.log('Speaking demo response...');
            // Speak the demo response
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(demoResponse);
              utterance.lang = 'en-US';
              utterance.rate = 0.9;
              utterance.pitch = 1.0;
              speechSynthesis.speak(utterance);
            }
          }

          setCurrentVoiceCall({
            ...currentVoiceCall,
            status: 'completed',
            recording: voiceCall.recording,
            transcript
          });
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setLiveTranscript("Error stopping recording");
    }
  };

  const handleCall = async () => {
    if (!selectedNode) return;
    
    try {
      if (isRecording) {
        // Stop recording
        await handleStopRecording();
      } else {
        // Start recording
        setCallTranscripts([]);
        setLiveTranscript("🎙️ Starting recording...");
        
        const call = await voiceRecordingService.startRecording(
          selectedNode.id,
          selectedNode.name || `Node ${selectedNode.id}`
        );
        setCurrentVoiceCall(call);
        setIsRecording(true);
        
        // Set initial message after a short delay to ensure state is set
    setTimeout(() => {
          setLiveTranscript("🎙️ Recording... Speak for 3-5 seconds, then click Stop!");
        }, 100);
      }
    } catch (error) {
      console.error('Voice call error:', error);
      setLiveTranscript("Voice recording failed. Please check microphone permissions.");
    }
  };

  const handleCallPersona = async () => {
    if (!selectedNode) return;
    
    try {
    setIsCalling(true);
      setCallTranscripts([]);
      setLiveTranscript("🔌 Initializing voice call...");
      
      // Show initialization in the UI
      setTimeout(() => setLiveTranscript("📡 Connecting to backend..."), 300);
      
      // Request assistant creation from backend
      const response = await fetch('http://localhost:5050/voice/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || 'demo-token'}`
        },
        body: JSON.stringify({
          persona: {
            name: selectedNode.name || `Persona ${selectedNode.id}`,
            demographics: selectedNode
          },
          idea: analysisInput || "Product idea to discuss"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start voice call');
      }

      const result = await response.json();
      console.log('Voice call config received:', result);
      
      // Update UI with connection progress
      setLiveTranscript("✅ Backend connected successfully");
      setLiveTranscript("🎙️ Initializing voice service...");
      
      // Initialize Vapi service
      vapiService.initialize(result.publicKey);
      setLiveTranscript("🎙️ Starting voice call...");
      
      // Start the ACTUAL Vapi voice call
      await vapiService.startCall(
        {
          assistantConfig: result.assistantConfig,
          personaName: result.persona.name,
          productIdea: analysisInput || "Product idea to discuss",
          publicKey: result.publicKey
        },
        {
          onCallStart: () => {
            console.log('Voice call started!');
            setLiveTranscript(`🎙️ Connected to ${result.persona.name}`);
            setCallTranscripts(prev => [...prev, {
              role: 'assistant',
              text: `Hi! I'm ${result.persona.name}. ${result.assistantConfig.firstMessage || "Let's discuss your idea!"}`
            }]);
          },
          
          onCallEnd: () => {
            console.log('Voice call ended');
      setIsCalling(false);
            setLiveTranscript("Call ended");
          },
          
          onSpeechStart: () => {
            setIsSpeaking(true);
          },
          
          onSpeechEnd: () => {
            setIsSpeaking(false);
          },
          
          onTranscript: (transcript, role) => {
            console.log(`${role}: ${transcript}`);
            setCallTranscripts(prev => {
              // Avoid duplicates - check if last message is the same
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.role === role && lastMsg.text === transcript) {
                return prev;
              }
              return [...prev, { role, text: transcript }];
            });
          },
          
          onError: (error) => {
            console.error('Vapi error:', error);
            setLiveTranscript(`Error: ${error.message || 'Call failed'}`);
            setCallTranscripts(prev => [...prev, {
              role: 'assistant',
              text: `❌ Error: ${error.message || 'Call failed'}`
            }]);
            setTimeout(() => setIsCalling(false), 3000);
          }
        }
      );
      
    } catch (error: any) {
      console.error('Failed to start persona call:', error);
      setCallTranscripts([
        { role: 'assistant', text: `❌ Error: ${error.message}` }
      ]);
      setLiveTranscript(`Connection failed: ${error.message}`);
      setTimeout(() => setIsCalling(false), 3000);
    }
  };

  const handleEndCall = async () => {
    try {
      await vapiService.endCall();
      setIsCalling(false);
      setCallTranscripts([]);
      setLiveTranscript("");
      setIsMuted(false);
      setIsSpeaking(false);
    } catch (error) {
      console.error('Failed to end call:', error);
      setIsCalling(false);
    }
  };

  const handleToggleMute = () => {
    try {
      const newMutedState = !isMuted;
      vapiService.setMuted(newMutedState);
      setIsMuted(newMutedState);
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  // Show loading state while project is being loaded
  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/projects">
              <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="PipeIt Logo" className="w-6 h-6 object-contain" />
                <span className="text-sm font-bold">PipeIt</span>
              </div>
            </Link>
            {currentProject && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>/</span>
                <span className="font-semibold">{currentProject.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              Welcome krishgarg19
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Simulation
          </Button>
          </div>
        </div>
      </nav>

          {/* Main Layout */}
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Left Sidebar */}
            <div className="w-full lg:w-64 border-r border-white/10 glass-panel p-4 space-y-4">
          <Link to="/projects">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              ← Projects View
            </Button>
          </Link>

          {/* Project Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-xs font-semibold">PROJECT INFO</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">User:</span>
                <span className="font-semibold">krishgarg19</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">Project:</span>
                <span className="font-semibold">{currentProject?.name || 'Loading...'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">Description:</span>
                <span className="text-[10px]">{currentProject?.description || 'No description'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">Status:</span>
                <span className={`px-2 py-1 rounded text-[10px] ${
                  currentProject?.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  currentProject?.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {currentProject?.status || 'Unknown'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">Created:</span>
                <span className="text-[10px]">
                  {currentProject?.created_at ? new Date(currentProject.created_at).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Current Society</p>
            <select className="w-full bg-muted border border-white/10 rounded px-3 py-2 text-sm">
              <option>Startup Investors</option>
            </select>
          </div>

          <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
            <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs border-white/20">
            <span className="mr-2">+</span> Create New Session
          </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-background border-border">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-xl font-semibold">Create New Session</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Start a new analysis session to track your simulation progress
                </p>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name" className="text-sm font-medium">
                    Session Name
                  </Label>
                  <Input
                    id="session-name"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Enter session name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateSession();
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-description" className="text-sm font-medium">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="session-description"
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                    placeholder="Brief description of your analysis session"
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsSessionDialogOpen(false);
                    setNewSessionName("");
                    setNewSessionDescription("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateSession}
                  disabled={!newSessionName.trim()}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Analysis Sessions</p>
            {sessions.length === 0 ? (
            <div className="text-xs text-muted-foreground">No sessions yet</div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-2 bg-muted/50 rounded hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{session.session_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {session.analysis_input || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteSession(session.id, session.session_name)}
                        >
                          <Trash2 className="w-2 h-2" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-[10px] text-muted-foreground">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-1 text-xs text-muted-foreground">
            <p>199 Auth® users loaded</p>
            <p>No analysis running</p>
          </div>

          <div className="pt-4 text-xs text-muted-foreground">
            Version 2.1
                {isSaving && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                    <span>Saving...</span>
                  </div>
                )}
          </div>
        </div>

            {/* Globe Area */}
            <div className="flex-1 relative min-h-[400px] lg:min-h-screen">
          <GlobeScene nodes={displayNodes} onNodeClick={(node) => {
            setSelectedNode(node);
            setClickedNodes(prev => new Set([...prev, node.id]));
          }} />

          {/* Node Info Panel */}
          <NodeInfo node={selectedNode} onClose={() => setSelectedNode(null)} />

              {/* Bottom Input */}
              <div className="absolute bottom-6 left-4 right-4 lg:left-6 lg:right-6 flex flex-col sm:flex-row gap-2">
            <Input
              value={analysisInput}
                  onChange={(e) => {
                    setAnalysisInput(e.target.value);
                    // Auto-save input changes
                    updateSessionState({ analysis_input: e.target.value });
                  }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleFocus();
                }
              }}
              placeholder="Enter your idea to analyze against nodes..."
              className="flex-1 bg-black/60 backdrop-blur-md border-white/20 text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || isFocusing || !analysisInput.trim()}
                className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
              >
                {isAnalyzing ? "Analyzing..." : "Enter"}
              </Button>
              <Button 
                onClick={handleFocus}
                disabled={isFocusing || isAnalyzing || !showAllNodes}
                variant="outline"
                className="bg-black/60 backdrop-blur-md border-white/20 flex-1 sm:flex-none"
              >
                {isFocusing ? "Selecting Focus Group..." : "Focus"}
              </Button>
              <Button 
                onClick={calculateImpactScore}
                disabled={!showFocusedNodes}
                variant="outline"
                className="bg-black/60 backdrop-blur-md border-white/20 flex-1 sm:flex-none"
              >
                Analyze
              </Button>
            </div>
          </div>

          {/* Focus Progress */}
          <AnimatePresence>
            {isFocusing && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-6 left-6 glass-panel p-4 rounded-lg max-w-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full bg-primary animate-pulse`}
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-semibold">Selecting Focus Group...</p>
                  <p className="text-xs text-muted-foreground">Selecting 10-15 random nodes for analysis</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis Progress */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-6 left-6 glass-panel p-4 rounded-lg max-w-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full bg-primary animate-pulse`}
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-semibold">Processing nodes...</p>
                  <p className="text-xs text-muted-foreground">
                    Nodes Processed: {analyzedNodes.length} / {focusedNodes.length > 0 ? focusedNodes.length : nodes.length}
                  </p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Progress: {Math.round(analysisProgress)}%
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-80 border-l border-white/10 glass-panel p-4 space-y-4 overflow-y-auto max-h-[400px] lg:max-h-none">
          {/* Mission Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-xs font-semibold">MISSION STATUS</span>
              </div>
              <span className="text-xs text-success">ACTIVE</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Impact Score</span>
                <motion.span 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{ 
                    opacity: [0, 1, 1, 1],
                    scale: [0.2, 1.4, 0.8, 1.2, 1] // Strong bounce effect
                  }}
                  transition={{ 
                    duration: 0.8, 
                    ease: "easeInOut",
                    times: [0, 0.3, 0.5, 0.7, 1]
                  }}
                  key={`impact-${impactScore}`}
                >
                  {impactScore}
                </motion.span>
              </div>
              <div className="h-4 flex gap-0.5">
                {[...Array(20)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className={`flex-1 rounded-sm transition-colors ${
                      i < (impactScore / 5) ? 'bg-success' : 'bg-muted'
                    }`} 
                    initial={{ scaleY: 0 }}
                    animate={{ 
                      scaleY: [0, 1.2, 0.9, 1.1, 1] // Back-and-forth motion
                    }}
                    transition={{ 
                      duration: 0.8, 
                      ease: "easeInOut", 
                      delay: 0.1 + (i * 0.03),
                      times: [0, 0.3, 0.5, 0.7, 1] // Timing for each keyframe
                    }}
                    style={{ transformOrigin: 'bottom' }}
                  />
                ))}
              </div>
              <motion.div 
                className="flex items-center justify-between text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <span className={`text-muted-foreground ${
                  impactScore >= 80 ? 'text-success' : impactScore >= 50 ? 'text-warning' : 'text-destructive'
                }`}>
                  Status: {impactScore >= 80 ? 'EXCELLENT' : impactScore >= 50 ? 'GOOD' : 'CRITICAL'}
                </span>
                <span className="text-muted-foreground">/100</span>
              </motion.div>
            </div>
          </div>

          {/* Agent Activity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-xs font-semibold">AGENT ACTIVITY</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <motion.div 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ 
                    opacity: [0, 1, 1, 1],
                    scale: [0.3, 1.3, 0.9, 1], // Bounce effect
                  }}
                  transition={{ 
                    duration: 0.6, 
                    ease: "easeInOut",
                    times: [0, 0.4, 0.7, 1]
                  }}
                  key={`green-${analyzedSentiment ? displayNodes.filter(n => n.status === 'green').length : 0}`}
                >
                  {analyzedSentiment ? displayNodes.filter(n => n.status === 'green').length : 0}
                </motion.div>
                <div className="text-xs text-muted-foreground">Online</div>
              </div>
              <div>
                <motion.div 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ 
                    opacity: [0, 1, 1, 1],
                    scale: [0.3, 1.3, 0.9, 1], // Bounce effect
                  }}
                  transition={{ 
                    duration: 0.6, 
                    ease: "easeInOut", 
                    delay: 0.1,
                    times: [0, 0.4, 0.7, 1]
                  }}
                  key={`yellow-${analyzedSentiment ? displayNodes.filter(n => n.status === 'yellow').length : 0}`}
                >
                  {analyzedSentiment ? displayNodes.filter(n => n.status === 'yellow').length : 0}
                </motion.div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div>
                <motion.div 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ 
                    opacity: [0, 1, 1, 1],
                    scale: [0.3, 1.3, 0.9, 1], // Bounce effect
                  }}
                  transition={{ 
                    duration: 0.6, 
                    ease: "easeInOut", 
                    delay: 0.2,
                    times: [0, 0.4, 0.7, 1]
                  }}
                  key={`red-${analyzedSentiment ? displayNodes.filter(n => n.status === 'red').length : 0}`}
                >
                  {analyzedSentiment ? displayNodes.filter(n => n.status === 'red').length : 0}
                </motion.div>
                <div className="text-xs text-muted-foreground">Issues</div>
              </div>
            </div>
          </div>

          {/* Engagement Levels */}
          <div className="space-y-2">
            {[
              { 
                label: "ONLINE NODES", 
                count: analyzedSentiment ? displayNodes.filter(n => n.status === 'green').length : 0, 
                color: "bg-success",
                delay: 0.5
              },
              { 
                label: "ACTIVE NODES", 
                count: analyzedSentiment ? displayNodes.filter(n => n.status === 'yellow').length : 0, 
                color: "bg-warning",
                delay: 1.0
              },
              { 
                label: "ISSUE NODES", 
                count: analyzedSentiment ? displayNodes.filter(n => n.status === 'red').length : 0, 
                color: "bg-destructive",
                delay: 1.5
              }
            ].map((level) => (
              <motion.div 
                key={level.label} 
                className="space-y-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: level.delay }}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${level.color} rounded-full`} />
                    <span>{level.label}</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: level.delay + 0.2 }}
                  >
                    {level.count}
                  </motion.span>
                </div>
                <div className="h-2 flex gap-0.5">
                  {[...Array(20)].map((_, i) => (
                    <motion.div 
                      key={`${level.label}-segment-${i}`}
                      className={`flex-1 rounded-sm ${
                        i < level.count ? level.color : 'bg-muted'
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ 
                        scaleX: [0, 1.15, 0.85, 1.08, 1] // Back-and-forth motion
                      }}
                      transition={{ 
                        duration: 0.7, 
                        ease: "easeInOut", 
                        delay: level.delay + (i * 0.3), // Each segment delayed by 0.3s from previous
                        times: [0, 0.35, 0.55, 0.75, 1] // Timing for each keyframe
                      }}
                      style={{ transformOrigin: 'left' }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feedback List (Session) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-xs font-semibold">SESSION FEEDBACK ({feedbackList.length})</span>
              </div>
            </div>
            {feedbackList.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-8">
                No feedback collected yet
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {feedbackList.map((node) => (
                  <div
                    key={node.id}
                    className="p-3 bg-muted/50 rounded cursor-pointer hover:bg-muted transition-colors border border-white/10"
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{node.name || `Node ${node.id}`}</p>
                        {node.persona && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {node.persona.demographics?.age || 'N/A'} • {node.persona.demographics?.gender || 'N/A'}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground truncate">
                          {node.persona?.country?.name || `${node.lat.toFixed(2)}°, ${node.lon.toFixed(2)}°`}
                        </p>
                      </div>
                      <div 
                        className={`px-2 py-0.5 rounded text-[10px] flex-shrink-0 ${
                          node.status === 'green' ? 'bg-green-500/20 text-green-400' :
                          node.status === 'red' ? 'bg-red-500/20 text-red-400' :
                          node.status === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-white/20 text-white'
                        }`}
                      >
                        {node.status === 'green' ? '🟢' :
                         node.status === 'yellow' ? '🟡' :
                         node.status === 'red' ? '🔴' :
                         '⚪'}
                    </div>
                    </div>
                    {node.feedback && (
                      <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2 italic">
                        "{node.feedback}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Database Feedback */}
          {realFeedback.length > 0 && (
          <div className="space-y-2">
              <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold">DATABASE FEEDBACK ({realFeedback.length})</span>
            </div>
            </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {realFeedback.map((feedback: any, idx: number) => (
                  <div
                    key={feedback.id || idx}
                    className="p-3 bg-green-500/10 rounded border border-green-500/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">Node: {feedback.project_persona_nodes?.node_id}</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </p>
          </div>
                      <div 
                        className={`px-2 py-0.5 rounded text-[10px] flex-shrink-0 ${
                          feedback.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                          feedback.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {feedback.sentiment === 'positive' ? '🟢' :
                         feedback.sentiment === 'negative' ? '🔴' :
                         '🟡'}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 line-clamp-3 italic">
                      "{feedback.feedback_text}"
                    </p>
                    {feedback.confidence_score && (
                      <p className="text-[10px] text-green-400 mt-1">
                        Confidence: {(feedback.confidence_score * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-xs font-semibold">ANALYSIS INPUT</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="mb-2">Enter your idea to analyze against nodes...</p>
              <p className="text-[10px]">When you're ready, deploy your idea to the whole world</p>
              <p className="text-[10px] mt-2">200 real personas loaded</p>
              <p className="text-[10px]">Click Enter → See all 200 nodes</p>
              <p className="text-[10px]">Click Focus → See 10-15 colored nodes</p>
              <p className="text-[10px]">Click Analyze → Calculate impact score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Node Detail Modal */}
      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="bg-black border-white/20 max-w-md">
          {selectedNode && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedNode.name || `Node ${selectedNode.id}`}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">Sentiment:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedNode.status === 'green' ? 'bg-green-500/20 text-green-400' :
                    selectedNode.status === 'red' ? 'bg-red-500/20 text-red-400' :
                    selectedNode.status === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-white/20 text-white'
                  }`}>
                    {selectedNode.status === 'green' ? '🟢 Positive' :
                     selectedNode.status === 'yellow' ? '🟡 Neutral' :
                     selectedNode.status === 'red' ? '🔴 Negative' :
                     '⚪ Unanalyzed'}
                  </span>
                </div>
                {selectedNode.persona && (
                  <>
                <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">Country:</span>
                      <span>{selectedNode.persona.country?.name}</span>
                </div>
                <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">Industry:</span>
                      <span>{selectedNode.persona.industry || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">Demographics:</span>
                      <span className="text-xs">
                        {selectedNode.persona.demographics?.age || 'N/A'} • 
                        {selectedNode.persona.demographics?.gender || 'N/A'} • 
                        {selectedNode.persona.demographics?.income || 'N/A'}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-xs">{selectedNode.lat.toFixed(2)}°, {selectedNode.lon.toFixed(2)}°</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">Node ID:</span>
                  <span className="font-mono text-xs">{selectedNode.id}</span>
                </div>
              </div>

              {!isRecording && !isCalling ? (
                <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCall}
                    className="flex-1 bg-success hover:bg-success/90"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                      Record Voice Message
                  </Button>
                    <Button 
                      onClick={handleCallPersona}
                      disabled={isCalling}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call Persona
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddFeedback}
                      variant="outline"
                      className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/50"
                      disabled={feedbackList.some(n => n.id === selectedNode.id)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {feedbackList.some(n => n.id === selectedNode.id) ? '✓ Added' : 'Add to Feedback'}
                    </Button>
                    <Button 
                      onClick={handleGetFeedback}
                      variant="outline"
                      className="flex-1 bg-green-500/10 hover:bg-green-500/20 border-green-500/50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Get Feedback
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedNode(null)} className="w-full">
                    Close
                  </Button>
                </div>
              ) : isCalling ? (
                <div className="space-y-4">
                  {/* Call Status Header */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded border border-blue-500/30">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                      <span className="text-sm font-semibold">
                        {isSpeaking ? '🗣️ Speaking...' : '🎙️ Connected'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Live Call</span>
                  </div>

                  {/* Live Transcript */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold flex items-center gap-2">
                      <span>CONVERSATION:</span>
                      {isSpeaking && (
                        <span className="inline-flex gap-1">
                          <span className="w-1 h-3 bg-green-500 animate-pulse" style={{animationDelay: '0ms'}} />
                          <span className="w-1 h-3 bg-green-500 animate-pulse" style={{animationDelay: '150ms'}} />
                          <span className="w-1 h-3 bg-green-500 animate-pulse" style={{animationDelay: '300ms'}} />
                        </span>
                      )}
                    </div>
                    
                    {/* Transcript Display */}
                    <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-muted/50 rounded border border-white/10">
                      {callTranscripts.length > 0 ? (
                        callTranscripts.map((transcript, idx) => (
                          <div key={idx} className={`text-sm ${transcript.role === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                            <span className="font-semibold">
                              {transcript.role === 'user' ? 'You' : selectedNode.name}:
                            </span>
                            <span className="ml-2 text-white/90">{transcript.text}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          {liveTranscript || "Waiting for conversation to start..."}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Call Controls */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleToggleMute}
                      variant="outline"
                      size="sm"
                      className={`flex-1 ${isMuted ? 'bg-red-500/20 border-red-500' : 'bg-white/5'}`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isMuted ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        )}
                      </svg>
                      {isMuted ? 'Unmute' : 'Mute'}
                    </Button>
                    
                    <Button 
                      onClick={handleEndCall}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                      </svg>
                      End Call
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recording Status */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm">RECORDING</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>

                  {/* Show Conversation if available, otherwise show live transcript */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold flex items-center gap-2">
                      {callTranscripts.length > 0 ? 'CONVERSATION:' : 'LIVE TRANSCRIPT:'}
                      {!callTranscripts.length && (
                        <span className="text-xs text-muted-foreground italic">(speak now...)</span>
                      )}
                    </div>
                    <div className="min-h-[120px] max-h-48 overflow-y-auto space-y-2 p-4 bg-black/50 rounded border border-white/20">
                      {callTranscripts.length > 0 ? (
                        callTranscripts.map((transcript, idx) => (
                          <div key={idx} className={`text-sm ${transcript.role === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                            <span className="font-semibold">
                              {transcript.role === 'user' ? 'You' : selectedNode.name}:
                            </span>
                            <span className="ml-2 text-white/90">{transcript.text}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-base text-white/90 leading-relaxed">
                          {liveTranscript || "Listening..."}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 bg-blue-500/20 border-blue-500 hover:bg-blue-500/30"
                      onClick={() => {
                        if (currentVoiceCall?.recording) {
                          voiceRecordingService.playRecording(currentVoiceCall);
                        }
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Play Recording
                    </Button>
                    <Button 
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={handleCall}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Stop Recording
                    </Button>
                  </div>

                  {/* Close button when conversation is done */}
                  {callTranscripts.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                      onClick={() => {
                        setIsRecording(false);
                        setCallTranscripts([]);
                        setLiveTranscript("");
                        setCurrentVoiceCall(null);
                      }}
                    >
                      Close
                  </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Simulation;
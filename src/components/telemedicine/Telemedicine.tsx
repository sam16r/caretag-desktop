import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, MessageSquare, User,
  Copy, Check, MonitorUp, MonitorOff, FileText, StickyNote, Clock, Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';

interface TelemedicineProps {
  patientName?: string;
  patientId?: string;
}

export function Telemedicine({ patientName, patientId }: TelemedicineProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [copied, setCopied] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [sidePanel, setSidePanel] = useState<'notes' | 'prescriptions' | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Timer
  useEffect(() => {
    if (!inCall || !callStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - callStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [inCall, callStartTime]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Fetch patient prescriptions for sharing
  const { data: prescriptions } = useQuery({
    queryKey: ['patient-prescriptions-tele', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId!)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!patientId && inCall,
  });

  // Past telemedicine sessions
  const { data: pastSessions } = useQuery({
    queryKey: ['tele-sessions', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telemedicine_sessions')
        .select('*')
        .eq('patient_id', patientId!)
        .eq('doctor_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!patientId && !!user?.id,
  });

  const createSession = useMutation({
    mutationFn: async (rId: string) => {
      if (!user || !patientId) return null;
      const { data, error } = await supabase
        .from('telemedicine_sessions')
        .insert({ doctor_id: user.id, patient_id: patientId, room_id: rId })
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    },
  });

  const endSession = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      const { error } = await supabase
        .from('telemedicine_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: elapsed,
          call_notes: callNotes || null,
          status: 'completed',
        })
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Session saved to patient records');
    },
  });

  const generateRoomId = () => {
    const id = `CARE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setRoomId(id);
    return id;
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled,
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const rId = roomId || generateRoomId();
      setInCall(true);
      setCallStartTime(new Date());
      setElapsed(0);

      // Create DB session
      if (patientId) {
        const id = await createSession.mutateAsync(rId);
        if (id) setSessionId(id);
      }

      toast.success('Video call started', { description: 'Share the room ID with your patient to connect' });
    } catch (err) {
      console.error('Failed to start call:', err);
      toast.error('Failed to start video call', { description: 'Please check camera and microphone permissions' });
    }
  };

  const endCall = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setScreenSharing(false);

    if (sessionId) {
      await endSession.mutateAsync();
    }

    setInCall(false);
    setCallStartTime(null);
    setSidePanel(null);
    toast.info('Call ended');
  }, [sessionId, elapsed, callNotes]);

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      // Restore camera
      if (localVideoRef.current && streamRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
      setScreenSharing(false);
    } else {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screen;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screen;
        }
        screen.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && streamRef.current) {
            localVideoRef.current.srcObject = streamRef.current;
          }
          setScreenSharing(false);
        };
        setScreenSharing(true);
        toast.success('Screen sharing started');
      } catch {
        toast.error('Screen sharing cancelled');
      }
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Room ID copied to clipboard');
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!open && inCall) {
      endCall();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Video className="h-4 w-4" />
          Video Consult
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] h-auto max-h-[90vh] flex flex-col bg-background border-border/50 shadow-xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Telemedicine Consultation</DialogTitle>
                <DialogDescription>
                  {patientName ? `With ${patientName}` : 'Start or join a video consultation'}
                </DialogDescription>
              </div>
            </div>
            {inCall && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="gap-1 animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-destructive-foreground" />
                  LIVE
                </Badge>
                <Badge variant="outline" className="gap-1 font-mono">
                  <Clock className="h-3 w-3" />
                  {formatTime(elapsed)}
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex">
          {/* Main area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!inCall ? (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Start New Consultation</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button variant={videoEnabled ? 'default' : 'outline'} size="sm" onClick={() => setVideoEnabled(!videoEnabled)}>
                            {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                          </Button>
                          <Button variant={audioEnabled ? 'default' : 'outline'} size="sm" onClick={() => setAudioEnabled(!audioEnabled)}>
                            {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button onClick={startCall} className="gap-2 flex-1">
                          <Phone className="h-4 w-4" />
                          Start Video Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Join Existing Room</h3>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter Room ID (e.g., CARE-ABC123)"
                          value={joinRoomId}
                          onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                          className="flex-1"
                        />
                        <Button onClick={() => { setRoomId(joinRoomId); startCall(); }} disabled={!joinRoomId.trim()}>
                          Join
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Past sessions */}
                  {pastSessions && pastSessions.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-3">Recent Sessions</h3>
                        <div className="space-y-2">
                          {pastSessions.map((s: any) => (
                            <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                              <div>
                                <span className="text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</span>
                                <span className="ml-2 font-medium">{s.duration_seconds ? `${Math.floor(s.duration_seconds / 60)}m` : 'N/A'}</span>
                              </div>
                              <Badge variant="outline" className="capitalize">{s.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <>
                  {/* Active call view */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
                      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <Badge className="absolute top-3 left-3 bg-background/80">
                        {screenSharing ? 'Screen' : 'You'}
                      </Badge>
                      {!videoEnabled && !screenSharing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <User className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="relative aspect-video bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                      <div className="text-center">
                        <User className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">Waiting for patient...</p>
                      </div>
                      <Badge className="absolute top-3 left-3 bg-background/80">{patientName || 'Patient'}</Badge>
                    </div>
                  </div>

                  {/* Room ID */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Room ID</p>
                          <p className="font-mono font-semibold text-sm">{roomId}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={copyRoomId} className="gap-1">
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Call controls */}
                  <div className="flex items-center justify-center gap-3">
                    <Button variant={videoEnabled ? 'outline' : 'secondary'} size="lg" onClick={toggleVideo} className="rounded-full h-12 w-12">
                      {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                    <Button variant={audioEnabled ? 'outline' : 'secondary'} size="lg" onClick={toggleAudio} className="rounded-full h-12 w-12">
                      {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    <Button variant={screenSharing ? 'secondary' : 'outline'} size="lg" onClick={toggleScreenShare} className="rounded-full h-12 w-12">
                      {screenSharing ? <MonitorOff className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
                    </Button>
                    <Separator orientation="vertical" className="h-8" />
                    <Button variant="outline" size="lg" onClick={() => setSidePanel(sidePanel === 'notes' ? null : 'notes')} className={`rounded-full h-12 w-12 ${sidePanel === 'notes' ? 'bg-primary/10 border-primary' : ''}`}>
                      <StickyNote className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setSidePanel(sidePanel === 'prescriptions' ? null : 'prescriptions')} className={`rounded-full h-12 w-12 ${sidePanel === 'prescriptions' ? 'bg-primary/10 border-primary' : ''}`}>
                      <FileText className="h-5 w-5" />
                    </Button>
                    <Separator orientation="vertical" className="h-8" />
                    <Button variant="destructive" size="lg" onClick={endCall} className="rounded-full h-12 w-12">
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              )}

              {!inCall && (
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
                      ⚠️ <strong>Demo Mode:</strong> This is a local video preview. Real peer-to-peer video calling requires WebRTC signaling server integration.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Side panel */}
          {inCall && sidePanel && (
            <div className="w-72 border-l border-border flex flex-col shrink-0">
              {sidePanel === 'notes' && (
                <div className="flex flex-col h-full">
                  <div className="p-3 border-b border-border">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      Call Notes
                    </h4>
                  </div>
                  <div className="flex-1 p-3">
                    <Textarea
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Type notes during the consultation..."
                      className="h-full resize-none text-sm"
                    />
                  </div>
                  <div className="p-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">Notes auto-save when you end the call</p>
                  </div>
                </div>
              )}
              {sidePanel === 'prescriptions' && (
                <div className="flex flex-col h-full">
                  <div className="p-3 border-b border-border">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Active Prescriptions
                    </h4>
                  </div>
                  <ScrollArea className="flex-1 p-3">
                    {prescriptions && prescriptions.length > 0 ? (
                      <div className="space-y-3">
                        {prescriptions.map((rx: any) => (
                          <Card key={rx.id} className="p-3">
                            <p className="text-sm font-medium">{rx.diagnosis || 'No diagnosis'}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(rx.created_at).toLocaleDateString()}
                            </p>
                            {Array.isArray(rx.medications) && (
                              <div className="mt-2 space-y-1">
                                {(rx.medications as any[]).slice(0, 3).map((med: any, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs mr-1">
                                    {med.name || med.drug_name || `Med ${i + 1}`}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No active prescriptions</p>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

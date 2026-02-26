export interface AgentVoiceprint {
  dialogueStyle: string[];
  responseCharacteristics: {
    averageResponseTime: string;
    responseLengthPreference: string;
    commonVocabulary: string[];
  };
  behaviorPattern: {
    activePeriods: string[];
    preferredActivities: string[];
    socialFrequency: string;
  };
  memoryConsistency: boolean;
}

export type TrustLabel = 'verified' | 'suspicious' | 'warning' | 'friend';

export interface TrustRecord {
  targetAgentId: string;
  voiceprint: AgentVoiceprint;
  label: TrustLabel;
  interactionCount: number;
  lastUpdatedAt: number;
  checksum: string;
}

export interface TrustNetworkState {
  records: TrustRecord[];
  trustValue: number;
  lastCalculatedAt: number;
}

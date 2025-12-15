import React from 'react';

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  label: string;
}

export interface TrackedObject extends BoundingBox {
  trackingId: number; // Simulated DeepSORT ID
  velocity?: { x: number, y: number };
  lastSeen: number;
}

export interface Zone {
  id: string;
  name: string;
  type: 'SAFE' | 'DANGER' | 'RESTRICTED';
  bounds: { x: number, y: number, w: number, h: number }; // Percentage 0-1
}

export interface PPEScanResult {
  compliant: boolean;
  detected_items: string[];
  bounding_boxes: BoundingBox[];
  risk_assessment: string;
  recommendation: string;
  active_zone_violations?: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  source: string;
  message: string;
}

export interface LogAnalysisResult {
  sentiment: {
    score: number; // -1 to 1
    label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  };
  anomalies: string[];
  summary: string;
  action_items: string[];
}

export interface AuditRecord {
  id: string;
  timestamp: number;
  imageHash: string;
  ipfsCid: string;
  blockNumber: number;
  contractAddress: string;
  gasUsed: number;
  result: PPEScanResult;
  agentSignature: string;
  status: 'pending' | 'attested' | 'failed';
}

export enum AgentStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  ATTESTING = 'ATTESTING',
  ERROR = 'ERROR'
}

export type UserRole = 'ADMIN' | 'OPERATOR' | 'AUDITOR';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category?: 'core' | 'modules' | 'system';
}

export interface InteractionEvent {
  id: string;
  timestamp: number;
  appContext: string; // e.g., "Vision Agent", "Command Center"
  action: string; // e.g., "Navigated", "Clicked Button", "Received Alert"
  details: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- Phase 2: Maintenance Types ---
export interface Asset {
  id: string;
  name: string;
  type: 'HVAC' | 'CONVEYOR' | 'SERVER' | 'GENERATOR';
  healthScore: number; // 0-100
  temperature: number;
  vibration: number;
  lastService: string;
  predictedFailureDate?: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

// --- Phase 3: Outage Types ---
export interface OutageZone {
  id: string;
  name: string;
  riskScore: number; // 0-100
  powerLoad: number; // %
  weatherCondition: 'CLEAR' | 'STORM' | 'HEATWAVE' | 'WIND';
  gridStatus: 'STABLE' | 'UNSTABLE' | 'OUTAGE';
}

// --- Phase 5: Ticketing Types ---
export interface Ticket {
  id: string;
  title: string;
  description: string;
  source: 'VISION' | 'MAINTENANCE' | 'OUTAGE' | 'MANUAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  assignee?: string;
  aiResolutionPlan?: string;
  timestamp: number;
}

// --- Data Injection Types ---
export interface ParsedSubstationData {
  timestamp: string;
  substation_id: string;
  capacity_mw: number;
  actual_load_mw: number;
  ambient_temp_f: number;
  status: string;
  event_description: string;
}

export interface ParsedEquipmentData {
  timestamp: string;
  device_id: string;
  temperature_C: number;
  vibration_mm_s: number;
  pressure_kpa: number;
  motor_amps: number;
  operational_status: string;
}

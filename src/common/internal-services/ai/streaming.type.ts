// ============================================
// Core Streaming Event Types
// ============================================

export type StreamEventType =
  | 'text'
  | 'function_call'
  | 'function_result'
  | 'mcp_call'
  | 'mcp_result'
  | 'mcp_approval'
  | 'mcp_list_tools'
  | 'status'
  | 'error'
  | 'usage'
  | 'complete';

export type StatusType =
  | 'started'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'preparing_tool'
  | 'preparing_mcp_tool'
  | 'tool_initiated'
  | 'generating_response'
  | 'discovering_tools';

export type ErrorCode =
  | 'API_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_REQUEST'
  | 'AUTHENTICATION_FAILED'
  | 'FUNCTION_FAILED'
  | 'MCP_ERROR'
  | 'TIMEOUT'
  | 'RESPONSE_FAILED'
  | 'STREAM_ERROR'
  | 'MCP_LIST_TOOLS_FAILED'
  | 'MCP_ARGS_ERROR';

// ============================================
// Base Event Structure
// ============================================

export interface StreamEventMeta {
  timestamp: number; // Unix timestamp with milliseconds
  sequence?: number; // Event sequence number
  response_id?: string; // Unique response identifier
}

export interface BaseStreamEvent {
  type: StreamEventType;
  content?: string;
  data?: Record<string, any>;
  meta?: StreamEventMeta;
}

// ============================================
// Specific Event Data Types
// ============================================

export interface FunctionCallData {
  function_name: string;
  function_args: Record<string, any>;
  handle_by_client: boolean; // false = server-side, true = client-side
}

export interface FunctionResultData {
  function_name: string;
  success: boolean;
}

export interface MCPCallData {
  server_label: string;
  tool_name: string;
  tool_args: Record<string, any>;
  approval_required: boolean;
}

export interface MCPResultData {
  server_label: string;
  tool_name: string;
  success: boolean;
}

export interface MCPApprovalData {
  server_label: string;
  tool_name: string;
  approval_required: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<
      string,
      {
        type: string;
        description?: string;
      }
    >;
    required?: string[];
  };
}

export interface MCPListToolsData {
  server_label: string;
  tools: MCPTool[];
}

export interface StatusData {
  status_type: StatusType;
  message: string;
}

export interface ErrorData {
  error_code: ErrorCode;
  error_message: string;
  details?: {
    retry_after?: number;
    limit?: number;
    window?: string;
    [key: string]: any;
  };
}

export interface TokenUsage {
  input: number;
  cached?: number;
  output: number;
  reasoning?: number;
}

export interface UsageData {
  tokens: TokenUsage;
  model: string;
}

// ============================================
// Specific Event Types
// ============================================

export interface TextEvent extends BaseStreamEvent {
  type: 'text';
  content: string;
}

export interface FunctionCallEvent extends BaseStreamEvent {
  type: 'function_call';
  data: FunctionCallData;
}

export interface FunctionResultEvent extends BaseStreamEvent {
  type: 'function_result';
  content: string;
  data: FunctionResultData;
}

export interface MCPCallEvent extends BaseStreamEvent {
  type: 'mcp_call';
  data: MCPCallData;
}

export interface MCPResultEvent extends BaseStreamEvent {
  type: 'mcp_result';
  content: string;
  data: MCPResultData;
}

export interface MCPApprovalEvent extends BaseStreamEvent {
  type: 'mcp_approval';
  content: string;
  data: MCPApprovalData;
}

export interface MCPListToolsEvent extends BaseStreamEvent {
  type: 'mcp_list_tools';
  data: MCPListToolsData;
}

export interface StatusEvent extends BaseStreamEvent {
  type: 'status';
  data: StatusData;
}

export interface ErrorEvent extends BaseStreamEvent {
  type: 'error';
  data: ErrorData;
}

export interface UsageEvent extends BaseStreamEvent {
  type: 'usage';
  data: UsageData;
}

export interface CompleteEvent extends BaseStreamEvent {
  type: 'complete';
}

// ============================================
// Union Type for All Events
// ============================================

export type StreamEvent =
  | TextEvent
  | FunctionCallEvent
  | FunctionResultEvent
  | MCPCallEvent
  | MCPResultEvent
  | MCPApprovalEvent
  | MCPListToolsEvent
  | StatusEvent
  | ErrorEvent
  | UsageEvent
  | CompleteEvent;

// ============================================
// Type Guards for Event Identification
// ============================================

export function isTextEvent(event: StreamEvent): event is TextEvent {
  return event.type === 'text';
}

export function isFunctionCallEvent(
  event: StreamEvent,
): event is FunctionCallEvent {
  return event.type === 'function_call';
}

export function isFunctionResultEvent(
  event: StreamEvent,
): event is FunctionResultEvent {
  return event.type === 'function_result';
}

export function isMCPCallEvent(event: StreamEvent): event is MCPCallEvent {
  return event.type === 'mcp_call';
}

export function isMCPResultEvent(event: StreamEvent): event is MCPResultEvent {
  return event.type === 'mcp_result';
}

export function isMCPApprovalEvent(
  event: StreamEvent,
): event is MCPApprovalEvent {
  return event.type === 'mcp_approval';
}

export function isMCPListToolsEvent(
  event: StreamEvent,
): event is MCPListToolsEvent {
  return event.type === 'mcp_list_tools';
}

export function isStatusEvent(event: StreamEvent): event is StatusEvent {
  return event.type === 'status';
}

export function isErrorEvent(event: StreamEvent): event is ErrorEvent {
  return event.type === 'error';
}

export function isUsageEvent(event: StreamEvent): event is UsageEvent {
  return event.type === 'usage';
}

export function isCompleteEvent(event: StreamEvent): event is CompleteEvent {
  return event.type === 'complete';
}

// ============================================
// Helper Types for Parsing
// ============================================

export interface StreamChunkParser {
  parseChunk(chunk: string): StreamEvent[];
  isComplete(event: StreamEvent): boolean;
  isError(event: StreamEvent): boolean;
}

export interface StreamEventHandler {
  onText?: (event: TextEvent) => void;
  onFunctionCall?: (event: FunctionCallEvent) => void;
  onFunctionResult?: (event: FunctionResultEvent) => void;
  onMCPCall?: (event: MCPCallEvent) => void;
  onMCPResult?: (event: MCPResultEvent) => void;
  onMCPApproval?: (event: MCPApprovalEvent) => void;
  onMCPListTools?: (event: MCPListToolsEvent) => void;
  onStatus?: (event: StatusEvent) => void;
  onError?: (event: ErrorEvent) => void;
  onUsage?: (event: UsageEvent) => void;
  onComplete?: (event: CompleteEvent) => void;
}

// ============================================
// Utility Functions
// ============================================

export function handleStreamEvent(
  event: StreamEvent,
  handlers: StreamEventHandler,
): void {
  switch (event.type) {
    case 'text':
      handlers.onText?.(event);
      break;
    case 'function_call':
      handlers.onFunctionCall?.(event);
      break;
    case 'function_result':
      handlers.onFunctionResult?.(event);
      break;
    case 'mcp_call':
      handlers.onMCPCall?.(event);
      break;
    case 'mcp_result':
      handlers.onMCPResult?.(event);
      break;
    case 'mcp_approval':
      handlers.onMCPApproval?.(event);
      break;
    case 'mcp_list_tools':
      handlers.onMCPListTools?.(event);
      break;
    case 'status':
      handlers.onStatus?.(event);
      break;
    case 'error':
      handlers.onError?.(event);
      break;
    case 'usage':
      handlers.onUsage?.(event);
      break;
    case 'complete':
      handlers.onComplete?.(event);
      break;
    default:
      throw new Error(`Unknown stream event type`);
  }
}

export function createStreamEventHandler(
  handlers: Partial<StreamEventHandler>,
): StreamEventHandler {
  return {
    onText: handlers.onText || (() => {}),
    onFunctionCall: handlers.onFunctionCall || (() => {}),
    onFunctionResult: handlers.onFunctionResult || (() => {}),
    onMCPCall: handlers.onMCPCall || (() => {}),
    onMCPResult: handlers.onMCPResult || (() => {}),
    onMCPApproval: handlers.onMCPApproval || (() => {}),
    onMCPListTools: handlers.onMCPListTools || (() => {}),
    onStatus: handlers.onStatus || (() => {}),
    onError: handlers.onError || (() => {}),
    onUsage: handlers.onUsage || (() => {}),
    onComplete: handlers.onComplete || (() => {}),
  };
}

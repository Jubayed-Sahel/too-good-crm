/**
 * Twilio Service for VOIP calling
 */

import api from '@/lib/apiClient';

export interface Call {
  id: number;
  call_sid: string;
  from_number: string;
  to_number: string;
  direction: 'outbound' | 'inbound';
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'failed' | 'canceled';
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  duration_formatted: string;
  recording_url: string | null;
  notes: string;
  error_message: string | null;
  organization: number;
  customer: number | null;
  customer_name: string | null;
  initiated_by: number | null;
  initiated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface InitiateCallResponse {
  message: string;
  call: Call;
  twilio_response: {
    call_sid: string;
    status: string;
    to: string;
    from: string;
    direction: string;
    date_created: string;
  };
}

export interface CallHistoryResponse {
  calls: Call[];
}

class TwilioService {
  /**
   * Initiate a call to a customer
   */
  async initiateCall(customerId: number): Promise<InitiateCallResponse> {
    try {
      const response = await api.post<InitiateCallResponse>(
        `/customers/${customerId}/initiate_call/`
      );
      return response;
    } catch (error: any) {
      console.error('Twilio service error:', error);
      
      // The API client transforms errors to APIError format
      // Error structure: { message: string, status: number, errors?: object }
      if (error.message) {
        throw new Error(error.message);
      }
      
      // Fallback
      throw new Error('Failed to initiate call. Please try again.');
    }
  }

  /**
   * Get call history for a customer
   */
  async getCallHistory(customerId: number): Promise<Call[]> {
    try {
      const response = await api.get<Call[]>(
        `/customers/${customerId}/call_history/`
      );
      return response;
    } catch (error: any) {
      console.error('Error fetching call history:', error);
      throw new Error('Failed to fetch call history');
    }
  }

  /**
   * Get call status by call SID
   */
  async getCallStatus(callSid: string): Promise<Call> {
    try {
      const response = await api.get<Call>(`/calls/${callSid}/`);
      return response;
    } catch (error: any) {
      console.error('Error fetching call status:', error);
      throw new Error('Failed to fetch call status');
    }
  }
}

// Export singleton instance
const twilioService = new TwilioService();
export default twilioService;

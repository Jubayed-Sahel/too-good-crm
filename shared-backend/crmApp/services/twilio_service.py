"""
Twilio Service for Voice Calls
Handles all Twilio-related operations for VOIP calling
"""
import logging
from django.conf import settings

# Optional import - Twilio may not be installed
try:
    from twilio.rest import Client
    from twilio.base.exceptions import TwilioRestException
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    Client = None
    TwilioRestException = Exception

logger = logging.getLogger(__name__)


class TwilioService:
    """Service class for Twilio VOIP operations"""
    
    def __init__(self):
        """Initialize Twilio client"""
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.phone_number = settings.TWILIO_PHONE_NUMBER
        
        # Initialize client only if credentials are available
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            logger.warning("Twilio credentials not configured. Calls will fail.")
    
    def is_configured(self):
        """Check if Twilio is properly configured"""
        return all([
            self.account_sid,
            self.auth_token,
            self.phone_number,
            self.client is not None
        ])
    
    def initiate_call(self, to_number, from_number=None):
        """
        Initiate a call to the specified number
        
        Args:
            to_number (str): Phone number to call (E.164 format recommended)
            from_number (str, optional): Phone number to call from. Defaults to TWILIO_PHONE_NUMBER.
        
        Returns:
            dict: Call details including call_sid, status, etc.
        
        Raises:
            ValueError: If Twilio is not configured
            TwilioRestException: If the call fails
        """
        if not self.is_configured():
            raise ValueError(
                "Twilio is not configured. Please set TWILIO_ACCOUNT_SID, "
                "TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your environment variables."
            )
        
        if from_number is None:
            from_number = self.phone_number
        
        try:
            # Initiate the call
            # For now, we'll use a simple TwiML URL that plays a message
            # In production, you should create a proper TwiML endpoint
            call = self.client.calls.create(
                to=to_number,
                from_=from_number,
                # This is a test URL. Replace with your TwiML endpoint
                url='http://demo.twilio.com/docs/voice.xml'
            )
            
            logger.info(f"Call initiated successfully. SID: {call.sid}, Status: {call.status}")
            
            return {
                'call_sid': call.sid,
                'status': call.status,
                'to': call.to,
                'from': call.from_formatted if hasattr(call, 'from_formatted') else from_number,
                'direction': call.direction,
                'date_created': call.date_created.isoformat() if call.date_created else None,
            }
        
        except TwilioRestException as e:
            logger.error(f"Twilio call failed: {e.msg} (Code: {e.code})")
            raise
        except Exception as e:
            logger.error(f"Unexpected error initiating call: {str(e)}")
            raise
    
    def get_call_status(self, call_sid):
        """
        Get the status of a specific call
        
        Args:
            call_sid (str): The Twilio Call SID
        
        Returns:
            dict: Call status details
        """
        if not self.is_configured():
            raise ValueError("Twilio is not configured")
        
        try:
            call = self.client.calls(call_sid).fetch()
            
            return {
                'call_sid': call.sid,
                'status': call.status,
                'duration': call.duration,
                'to': call.to,
                'from': call.from_,
                'direction': call.direction,
                'start_time': call.start_time.isoformat() if call.start_time else None,
                'end_time': call.end_time.isoformat() if call.end_time else None,
            }
        
        except TwilioRestException as e:
            logger.error(f"Failed to fetch call status: {e.msg}")
            raise
    
    def hangup_call(self, call_sid):
        """
        Hangup an ongoing call
        
        Args:
            call_sid (str): The Twilio Call SID
        
        Returns:
            dict: Updated call status
        """
        if not self.is_configured():
            raise ValueError("Twilio is not configured")
        
        try:
            call = self.client.calls(call_sid).update(status='completed')
            
            logger.info(f"Call {call_sid} ended successfully")
            
            return {
                'call_sid': call.sid,
                'status': call.status,
            }
        
        except TwilioRestException as e:
            logger.error(f"Failed to hangup call: {e.msg}")
            raise


# Singleton instance
twilio_service = TwilioService()

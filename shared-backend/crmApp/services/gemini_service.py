"""
Gemini AI Service
Integrates Google Gemini with MCP server for AI-powered CRM operations
"""

import os
import logging
import asyncio
from typing import Optional, Dict, Any, AsyncIterator
from django.conf import settings
from asgiref.sync import sync_to_async
from fastmcp import Client as MCPClient
from google import genai

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for handling Gemini AI interactions with MCP tools"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.getenv('GEMINI_API_KEY')
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not configured. Gemini features will not be available.")
        
        self.model_name = "gemini-2.0-flash-exp"  # Using Gemini 2.0 Flash
        self.mcp_server_path = os.path.join(settings.BASE_DIR, 'mcp_server.py')
    
    @sync_to_async
    def _get_user_context_sync(self, user) -> Dict[str, Any]:
        """
        Synchronous helper to build user context from database.
        This is wrapped by get_user_context for async compatibility.
        """
        # Get active user profile
        active_profile = user.user_profiles.filter(
            is_primary=True,
            status='active'
        ).first() or user.user_profiles.filter(status='active').first()
        
        if not active_profile:
            raise ValueError("No active profile found for user")
        
        # Get user permissions
        permissions = []
        
        try:
            # Get all permissions for user's role
            user_roles = user.user_roles.filter(
                organization=active_profile.organization,
                is_active=True
            )
            
            for user_role in user_roles:
                role = user_role.role
                role_permissions = role.role_permissions.filter(
                    is_active=True
                ).select_related('permission')
                
                for rp in role_permissions:
                    perm_str = f"{rp.permission.resource}:{rp.permission.action}"
                    if perm_str not in permissions:
                        permissions.append(perm_str)
        except Exception as e:
            logger.warning(f"Could not load permissions for user {user.id}: {str(e)}")
        
        context = {
            'user_id': user.id,
            'organization_id': active_profile.organization_id,
            'role': active_profile.profile_type,
            'permissions': permissions
        }
        
        logger.info(
            f"Built user context: user={user.id}, org={active_profile.organization_id}, "
            f"role={active_profile.profile_type}, perms={len(permissions)}"
        )
        
        return context
    
    async def get_user_context(self, user) -> Dict[str, Any]:
        """
        Build user context for MCP server authentication and RBAC (async).
        
        Args:
            user: Django user object
        
        Returns:
            Dictionary with user context (user_id, organization_id, role, permissions)
        """
        return await self._get_user_context_sync(user)
    
    async def chat_stream(
        self,
        message: str,
        user,
        conversation_history: Optional[list] = None
    ) -> AsyncIterator[str]:
        """
        Stream Gemini responses with MCP tool access.
        
        Args:
            message: User's message
            user: Django user object
            conversation_history: Optional previous conversation messages
        
        Yields:
            Response chunks from Gemini
        """
        if not self.api_key:
            yield "Error: Gemini API key not configured. Please set GEMINI_API_KEY in your environment."
            return
        
        try:
            # Build user context (async operation)
            user_context = await self.get_user_context(user)
            
            # Initialize Gemini client (sync)
            gemini_client = genai.Client(api_key=self.api_key)
            
            # Note: For now, we'll skip MCP integration to test basic Gemini functionality
            # MCP integration requires running the MCP server as a separate process
            # TODO: Start MCP server as subprocess or use HTTP transport
            
            # For testing without MCP:
            if False:  # Disable MCP for now
                # Initialize MCP client with user context
                mcp_client = MCPClient(self.mcp_server_path)
                
                # Set user context in MCP server
                async with mcp_client:
                    # Pass user context to MCP server
                    mcp_client.context = user_context
                
            # Build conversation contents
            contents = []
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history:
                    contents.append(msg)
            
            # Add current message
            contents.append(message)
            
            # System instruction to guide Gemini
            system_instruction = f"""You are an AI assistant for a CRM system.

Current user context:
- Role: {user_context['role']}
- Organization ID: {user_context.get('organization_id', 'Not assigned')}

You are a helpful CRM assistant. Respond professionally and helpfully to user questions.
Note: Full CRM tool integration is being configured. For now, provide helpful guidance and information."""
            
            logger.info(f"Sending message to Gemini (user: {user_context['user_id']})")
            
            # Generate response with streaming (without MCP tools for now)
            response = await gemini_client.aio.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=genai.types.GenerateContentConfig(
                    temperature=0.7,
                    top_p=0.95,
                    max_output_tokens=2048,
                    system_instruction=system_instruction,
                )
            )
            
            # Stream the response
            if hasattr(response, 'text'):
                # Non-streaming response
                yield response.text
            else:
                # Streaming response
                async for chunk in response:
                    if hasattr(chunk, 'text'):
                        yield chunk.text
            
            logger.info("Gemini response completed")
                
        except Exception as e:
            error_msg = f"Error in Gemini chat: {str(e)}"
            logger.error(error_msg, exc_info=True)
            yield f"\n\nError: {error_msg}"
    
    async def chat(
        self,
        message: str,
        user,
        conversation_history: Optional[list] = None
    ) -> str:
        """
        Get a complete Gemini response (non-streaming).
        
        Args:
            message: User's message
            user: Django user object
            conversation_history: Optional previous conversation messages
        
        Returns:
            Complete response from Gemini
        """
        response_parts = []
        async for chunk in self.chat_stream(message, user, conversation_history):
            response_parts.append(chunk)
        
        return ''.join(response_parts)


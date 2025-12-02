import { useEffect, useRef, useState } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { toaster } from '../ui/toaster';
import { authService } from '@/services';
import { useAuth } from '@/hooks';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  botUsername?: string;
  buttonSize?: 'small' | 'medium' | 'large';
  cornerRadius?: number;
  requestAccess?: 'write' | 'read';
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}

/**
 * Telegram Login Widget Component
 * 
 * Integrates Telegram Login Widget for seamless authentication.
 * Based on: https://core.telegram.org/widgets/login
 * 
 * Features:
 * - One-click authentication via Telegram
 * - Links Telegram account to CRM user
 * - Syncs roles and permissions between web and bot
 */
export const TelegramLoginButton = ({
  botUsername = 'LeadGrid_bot',  // Your bot username
  buttonSize = 'large',
  cornerRadius = 10,
  requestAccess = 'write',
  onAuthSuccess,
  onAuthError,
}: TelegramLoginButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresLink, setRequiresLink] = useState(false);
  const [telegramUserData, setTelegramUserData] = useState<TelegramUser | null>(null);
  const { login: authLogin } = useAuth();

  useEffect(() => {
    // Define callback function that Telegram widget will call
    (window as any).onTelegramAuth = async (user: TelegramUser) => {
      console.log('📱 Telegram authentication callback received:', user);
      setIsLoading(true);

      try {
        // Send auth data to backend
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/telegram/auth/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });

        const data = await response.json();

        if (data.success && data.telegram_linked) {
          // User already linked - authenticate directly
          console.log('✅ Telegram user already linked, logging in...');
          
          toaster.create({
            title: 'Success!',
            description: `Welcome back, ${data.user.full_name}!`,
            type: 'success',
            duration: 3000,
          });

          // Store auth data
          authService.setAuthData(data.token, data.user);
          
          if (onAuthSuccess) {
            onAuthSuccess();
          } else {
            // Trigger page reload to update auth state
            window.location.reload();
          }
        } else if (data.action_required === 'link_account') {
          // User needs to link their Telegram to existing CRM account
          console.log('⚠️  Telegram account not linked, showing link form...');
          
          setTelegramUserData(user);
          setRequiresLink(true);
          
          toaster.create({
            title: 'Link Your Account',
            description: 'Please enter your CRM credentials to link your Telegram account.',
            type: 'info',
            duration: 5000,
          });
        } else {
          throw new Error(data.message || 'Authentication failed');
        }
      } catch (error: any) {
        console.error('❌ Telegram authentication error:', error);
        
        const errorMessage = error.message || 'Failed to authenticate with Telegram';
        
        toaster.create({
          title: 'Authentication Error',
          description: errorMessage,
          type: 'error',
          duration: 5000,
        });

        if (onAuthError) {
          onAuthError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Load Telegram widget script
    if (containerRef.current && !containerRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', buttonSize);
      script.setAttribute('data-radius', cornerRadius.toString());
      script.setAttribute('data-request-access', requestAccess);
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');

      containerRef.current.appendChild(script);
    }

    // Cleanup
    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [botUsername, buttonSize, cornerRadius, requestAccess, onAuthSuccess, onAuthError, authLogin]);

  if (requiresLink && telegramUserData) {
    return (
      <Box>
        <VStack gap={3} align="stretch">
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Telegram account detected: @{telegramUserData.username || telegramUserData.first_name}
          </Text>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Please log in with your CRM credentials below to link your Telegram account.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={3}>
        <Box
          ref={containerRef}
          display="flex"
          justifyContent="center"
          alignItems="center"
          opacity={isLoading ? 0.5 : 1}
          pointerEvents={isLoading ? 'none' : 'auto'}
          transition="opacity 0.2s"
        />
        <Text fontSize="xs" color="gray.500" textAlign="center" maxW="280px">
          Login securely with your Telegram account. Your data is protected and never shared.
        </Text>
      </VStack>
    </Box>
  );
};

export default TelegramLoginButton;


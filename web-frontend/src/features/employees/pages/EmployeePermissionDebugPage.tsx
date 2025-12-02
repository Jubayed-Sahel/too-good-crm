import { Box, Button, Card, Code, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { roleService } from '@/services/role.service';

interface DebugInfo {
  user: {
    id: number;
    email: string;
    full_name: string;
  };
  organizations: Array<{
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    is_owner: boolean;
    permissions_count: number;
  }>;
  permissions_count: number;
  sample_permissions: Array<{
    id: number;
    resource: string;
    action: string;
    description: string;
    organization_id: number;
  }>;
}

export default function EmployeePermissionDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fixResult, setFixResult] = useState<any>(null);

  const fetchDebugInfo = async () => {
    setIsLoading(true);
    setError(null);
    setFixResult(null);
    try {
      const info = await roleService.debugPermissionContext();
      setDebugInfo(info);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch debug info');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fixMissingPermissions = async () => {
    setIsFixing(true);
    setError(null);
    try {
      const result = await roleService.fixMissingPermissions();
      setFixResult(result);
      
      // Refresh debug info to show updated counts
      await fetchDebugInfo();
    } catch (err: any) {
      setError(err.message || 'Failed to fix permissions');
      console.error(err);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack align="stretch" gap={6}>
        <HStack justify="space-between">
          <Heading size="lg">Permission System Diagnostics</Heading>
          <Button
            onClick={fetchDebugInfo}
            colorPalette="blue"
            loading={isLoading}
          >
            Run Diagnostics
          </Button>
        </HStack>

        {error && (
          <Card.Root colorPalette="red">
            <Card.Body>
              <Text fontWeight="bold" mb={2}>Error</Text>
              <Text>{error}</Text>
            </Card.Body>
          </Card.Root>
        )}

        {fixResult && (
          <Card.Root colorPalette="green">
            <Card.Body>
              <Text fontWeight="bold" mb={2}>✅ Fix Applied Successfully!</Text>
              <Text>{fixResult.message}</Text>
              {fixResult.organizations && fixResult.organizations.length > 0 && (
                <Box mt={3}>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>Details:</Text>
                  {fixResult.organizations.map((org: any, idx: number) => (
                    <Text key={idx} fontSize="sm">
                      • {org.organization_name}: {org.status === 'created' 
                        ? `Created ${org.permissions_created} permissions` 
                        : `Skipped (${org.existing_permissions} existing)`}
                    </Text>
                  ))}
                </Box>
              )}
            </Card.Body>
          </Card.Root>
        )}

        {isLoading && (
          <HStack justify="center" py={8}>
            <Spinner size="lg" />
            <Text>Running diagnostics...</Text>
          </HStack>
        )}

        {debugInfo && (
          <VStack align="stretch" gap={4}>
            {/* User Info */}
            <Card.Root>
              <Card.Header>
                <Heading size="md">👤 User Information</Heading>
              </Card.Header>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <Text><strong>ID:</strong> {debugInfo.user.id}</Text>
                  <Text><strong>Email:</strong> {debugInfo.user.email}</Text>
                  <Text><strong>Name:</strong> {debugInfo.user.full_name}</Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Organizations */}
            <Card.Root>
              <Card.Header>
                <Heading size="md">🏢 Organizations ({debugInfo.organizations.length})</Heading>
              </Card.Header>
              <Card.Body>
                {debugInfo.organizations.length === 0 ? (
                  <Card.Root colorPalette="orange">
                    <Card.Body>
                      <Text fontWeight="bold">⚠️ No Organizations Found</Text>
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        You need to create an organization first. Go to Settings → Organization.
                      </Text>
                    </Card.Body>
                  </Card.Root>
                ) : (
                  <VStack align="stretch" gap={3}>
                    {debugInfo.organizations.map((org) => (
                      <Card.Root
                        key={org.id}
                        colorPalette={org.is_active ? 'green' : 'gray'}
                        variant="subtle"
                      >
                        <Card.Body>
                          <VStack align="start" gap={1}>
                            <HStack>
                              <Text fontWeight="bold">{org.name}</Text>
                              {org.is_owner && (
                                <Text fontSize="xs" px={2} py={0.5} bg="blue.100" color="blue.800" borderRadius="md">
                                  Owner
                                </Text>
                              )}
                              {org.is_active && (
                                <Text fontSize="xs" px={2} py={0.5} bg="green.100" color="green.800" borderRadius="md">
                                  Active
                                </Text>
                              )}
                              {!org.is_active && (
                                <Text fontSize="xs" px={2} py={0.5} bg="red.100" color="red.800" borderRadius="md">
                                  Inactive
                                </Text>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="gray.600">Slug: {org.slug}</Text>
                            <Text fontSize="sm" color="gray.600">ID: {org.id}</Text>
                            <Text fontSize="sm" fontWeight="semibold" mt={1}>
                              Permissions: {org.permissions_count}
                            </Text>
                            {org.permissions_count === 0 && (
                              <Text fontSize="sm" color="red.600" mt={1}>
                                ⚠️ No permissions found! This should not happen.
                              </Text>
                            )}
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    ))}
                  </VStack>
                )}
              </Card.Body>
            </Card.Root>

            {/* Permissions Summary */}
            <Card.Root>
              <Card.Header>
                <Heading size="md">🔐 Permissions Summary</Heading>
              </Card.Header>
              <Card.Body>
                <VStack align="start" gap={3}>
                  <Text fontSize="lg">
                    <strong>Total Permissions Available:</strong> {debugInfo.permissions_count}
                  </Text>
                  
                  {debugInfo.permissions_count === 0 ? (
                    <Card.Root colorPalette="red">
                      <Card.Body>
                        <Text fontWeight="bold">❌ No Permissions Found</Text>
                        <Text fontSize="sm" color="gray.600" mt={2}>
                          This is a critical issue. Permissions should be created automatically when you create an organization.
                        </Text>
                        <Text fontSize="sm" color="gray.600" mt={2}>
                          <strong>Possible solutions:</strong>
                        </Text>
                        <VStack align="start" fontSize="sm" color="gray.600" pl={4} mt={1}>
                          <Text>1. Try creating a new organization</Text>
                          <Text>2. Check backend logs for errors during organization creation</Text>
                          <Text>3. Run Django shell commands from PERMISSIONS_DEBUG_GUIDE.md</Text>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ) : (
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={2}>Sample Permissions:</Text>
                      <VStack align="start" gap={2} pl={4}>
                        {debugInfo.sample_permissions.map((perm) => (
                          <HStack key={perm.id} fontSize="sm">
                            <Code colorPalette="blue" fontSize="xs">
                              {perm.resource}.{perm.action}
                            </Code>
                            <Text color="gray.600">- {perm.description}</Text>
                            <Text fontSize="xs" color="gray.400">(Org ID: {perm.organization_id})</Text>
                          </HStack>
                        ))}
                        {debugInfo.permissions_count > debugInfo.sample_permissions.length && (
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            ... and {debugInfo.permissions_count - debugInfo.sample_permissions.length} more
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Diagnosis */}
            <Card.Root colorPalette={
              debugInfo.permissions_count > 0 ? 'green' : 
              debugInfo.organizations.length === 0 ? 'orange' : 'red'
            }>
              <Card.Header>
                <Heading size="md">🔬 Diagnosis</Heading>
              </Card.Header>
              <Card.Body>
                {debugInfo.organizations.length === 0 ? (
                  <VStack align="start" gap={2}>
                    <Text fontWeight="bold">⚠️ No organizations found</Text>
                    <Text>Action required: Create an organization in Settings → Organization</Text>
                  </VStack>
                ) : !debugInfo.organizations.some(o => o.is_active) ? (
                  <VStack align="start" gap={2}>
                    <Text fontWeight="bold">⚠️ No active organization</Text>
                    <Text>Your organization membership is inactive. Contact support.</Text>
                  </VStack>
                ) : debugInfo.permissions_count === 0 ? (
                  <VStack align="start" gap={3}>
                    <Text fontWeight="bold">❌ Critical: No permissions</Text>
                    <Text>Organization exists but has no permissions. This should not happen.</Text>
                    <Text fontSize="sm" color="gray.600">
                      Click the button below to automatically create default permissions.
                    </Text>
                    <Button
                      colorPalette="red"
                      onClick={fixMissingPermissions}
                      loading={isFixing}
                      size="lg"
                    >
                      🔧 Fix Missing Permissions
                    </Button>
                  </VStack>
                ) : (
                  <VStack align="start" gap={2}>
                    <Text fontWeight="bold">✅ Everything looks good!</Text>
                    <Text>You have {debugInfo.permissions_count} permissions available.</Text>
                    <Text fontSize="sm" color="gray.600" mt={2}>
                      If you're still seeing empty permissions in the role creation dialog,
                      check the browser console for API errors.
                    </Text>
                  </VStack>
                )}
              </Card.Body>
            </Card.Root>

            {/* Raw JSON */}
            <Card.Root>
              <Card.Header>
                <Heading size="md">📄 Raw Debug Data</Heading>
              </Card.Header>
              <Card.Body>
                <Box
                  as="pre"
                  p={4}
                  bg="gray.50"
                  borderRadius="md"
                  fontSize="xs"
                  overflow="auto"
                  maxH="400px"
                >
                  {JSON.stringify(debugInfo, null, 2)}
                </Box>
              </Card.Body>
            </Card.Root>
          </VStack>
        )}

        {!debugInfo && !isLoading && (
          <Card.Root>
            <Card.Body textAlign="center" py={12}>
              <Text color="gray.500" mb={4}>
                Click "Run Diagnostics" to check your permission system status
              </Text>
              <Text fontSize="sm" color="gray.400">
                This will show your user info, organizations, and permission counts
              </Text>
            </Card.Body>
          </Card.Root>
        )}
      </VStack>
    </Box>
  );
}

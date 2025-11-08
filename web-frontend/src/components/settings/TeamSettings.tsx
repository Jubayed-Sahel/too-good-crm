import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Grid,
  Spinner,
} from '@chakra-ui/react';
import { Card } from '../common';
import { Field } from '../ui/field';
import CustomSelect from '../ui/CustomSelect';
import { FiUserPlus, FiMail, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { employeeService, type Employee } from '@/services/employee.service';
import { roleService, type Role } from '@/services/role.service';
import { useProfile } from '@/contexts/ProfileContext';
import { toaster } from '../ui/toaster';

const TeamSettings = () => {
  const { activeOrganizationId } = useProfile();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState<number | undefined>(undefined);
  const [inviteDepartment, setInviteDepartment] = useState('');
  const [inviteJobTitle, setInviteJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    setIsFetchingEmployees(true);
    try {
      const organizationId = activeOrganizationId;
      const filters: any = { status: 'active' };
      if (organizationId) {
        filters.organization = organizationId;
      }
      const employees = await employeeService.getEmployees(filters);
      setTeamMembers(employees || []);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toaster.create({
        title: 'Error Loading Employees',
        description: error.message || 'Failed to load team members.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsFetchingEmployees(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const organizationId = activeOrganizationId;
      const filters: any = { is_active: true };
      if (organizationId) {
        filters.organization = organizationId;
      }
      const fetchedRoles = await roleService.getRoles(filters);
      setRoles(fetchedRoles || []);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await employeeService.inviteEmployee({
        email: inviteEmail,
        first_name: inviteFirstName,
        last_name: inviteLastName,
        department: inviteDepartment,
        job_title: inviteJobTitle,
        role_id: inviteRole,
      });
      
      toaster.create({
        title: 'Invitation Sent',
        description: `Invitation sent to ${inviteEmail}`,
        type: 'success',
        duration: 3000,
      });
      
      setInviteEmail('');
      setInviteFirstName('');
      setInviteLastName('');
      setInviteDepartment('');
      setInviteJobTitle('');
      setInviteRole(undefined);
      setShowInviteForm(false);
      
      // Refresh employee list
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error inviting employee:', error);
      toaster.create({
        title: 'Error Sending Invitation',
        description: error.message || 'Failed to send invitation.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (member: Employee) => {
    if (window.confirm(`Remove ${member.first_name} ${member.last_name} from the team?`)) {
      try {
        await employeeService.deleteEmployee(member.id);
        toaster.create({
          title: 'Employee Removed',
          description: `${member.first_name} ${member.last_name} removed from team`,
          type: 'success',
          duration: 3000,
        });
        await fetchEmployees();
      } catch (error: any) {
        console.error('Error removing employee:', error);
        toaster.create({
          title: 'Error Removing Employee',
          description: error.message || 'Failed to remove employee.',
          type: 'error',
          duration: 3000,
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'pending':
        return 'orange';
      case 'inactive':
      case 'on-leave':
        return 'gray';
      case 'terminated':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getRoleColor = (roleName?: string) => {
    if (!roleName) return 'gray';
    const lowerRole = roleName.toLowerCase();
    if (lowerRole.includes('admin')) return 'purple';
    if (lowerRole.includes('manager')) return 'blue';
    return 'gray';
  };

  return (
    <VStack align="stretch" gap={6}>
      {/* Invite Member */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Invite Team Member
            </Text>
            {!showInviteForm && (
              <Button
                size="sm"
                colorPalette="blue"
                onClick={() => setShowInviteForm(true)}
              >
                <FiUserPlus />
                <Box ml={2}>Invite Member</Box>
              </Button>
            )}
          </HStack>

          {showInviteForm && (
            <form onSubmit={handleInvite}>
              <VStack align="stretch" gap={4} p={4} bg="gray.50" borderRadius="md">
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={3}>
                  <Field label="First Name" required>
                    <Input
                      type="text"
                      placeholder="John"
                      value={inviteFirstName}
                      onChange={(e) => setInviteFirstName(e.target.value)}
                      size="md"
                      bg="white"
                      borderRadius="lg"
                    />
                  </Field>

                  <Field label="Last Name" required>
                    <Input
                      type="text"
                      placeholder="Doe"
                      value={inviteLastName}
                      onChange={(e) => setInviteLastName(e.target.value)}
                      size="md"
                      bg="white"
                      borderRadius="lg"
                    />
                  </Field>
                </Grid>

                <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={3}>
                  <Field label="Email Address" required>
                    <Box position="relative">
                      <Box
                        position="absolute"
                        left="12px"
                        top="50%"
                        transform="translateY(-50%)"
                        pointerEvents="none"
                        color="gray.400"
                      >
                        <FiMail size={16} />
                      </Box>
                      <Input
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        size="md"
                        bg="white"
                        pl="40px"
                        borderRadius="lg"
                      />
                    </Box>
                  </Field>

                  <Field label="Role">
                    <CustomSelect
                      value={inviteRole?.toString() || ''}
                      onChange={(val) => setInviteRole(val ? parseInt(val) : undefined)}
                      options={roles.map(r => ({ value: r.id.toString(), label: r.name }))}
                      placeholder="Select role"
                      accentColor="purple"
                    />
                  </Field>
                </Grid>

                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={3}>
                  <Field label="Department">
                    <Input
                      type="text"
                      placeholder="Sales"
                      value={inviteDepartment}
                      onChange={(e) => setInviteDepartment(e.target.value)}
                      size="md"
                      bg="white"
                      borderRadius="lg"
                    />
                  </Field>

                  <Field label="Job Title">
                    <Input
                      type="text"
                      placeholder="Sales Representative"
                      value={inviteJobTitle}
                      onChange={(e) => setInviteJobTitle(e.target.value)}
                      size="md"
                      bg="white"
                      borderRadius="lg"
                    />
                  </Field>
                </Grid>

                <HStack justify="flex-end" gap={2}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteEmail('');
                      setInviteFirstName('');
                      setInviteLastName('');
                      setInviteDepartment('');
                      setInviteJobTitle('');
                      setInviteRole(undefined);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorPalette="blue"
                    size="sm"
                    loading={isLoading}
                  >
                    Send Invitation
                  </Button>
                </HStack>
              </VStack>
            </form>
          )}

          <Text fontSize="xs" color="gray.500">
            Invited members will receive an email to join your organization
          </Text>
        </VStack>
      </Card>

      {/* Team Members List */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Team Members ({teamMembers.length})
            </Text>
          </HStack>

          {isFetchingEmployees ? (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" colorPalette="blue" />
              <Text mt={4} fontSize="sm" color="gray.500">Loading team members...</Text>
            </Box>
          ) : teamMembers.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text fontSize="sm" color="gray.500">No team members yet. Invite someone to get started!</Text>
            </Box>
          ) : (
            <>
              {/* Desktop View */}
              <Box display={{ base: 'none', md: 'block' }}>
                <VStack align="stretch" gap={0}>
                  {/* Header */}
                  <Grid
                    templateColumns="2fr 2fr 1.5fr 1fr 1fr 80px"
                    gap={4}
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.600"
                    textTransform="uppercase"
                  >
                    <Text>Employee Name</Text>
                    <Text>Email</Text>
                    <Text>Job Title</Text>
                    <Text>Role</Text>
                    <Text>Status</Text>
                    <Text>Actions</Text>
                  </Grid>

                  {/* Members */}
                  {teamMembers.map((member) => (
                    <Grid
                      key={member.id}
                      templateColumns="2fr 2fr 1.5fr 1fr 1fr 80px"
                      gap={4}
                      p={3}
                      borderBottomWidth="1px"
                      borderColor="gray.100"
                      alignItems="center"
                      _hover={{ bg: 'gray.50' }}
                    >
                      <Text fontSize="sm" fontWeight="medium" color="gray.900">
                        {member.first_name} {member.last_name}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {member.email}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {member.job_title || '-'}
                      </Text>
                      <Badge
                        colorPalette={getRoleColor(member.role_name)}
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                        w="fit-content"
                      >
                        {member.role_name || 'No Role'}
                      </Badge>
                      <Badge
                        colorPalette={getStatusColor(member.status)}
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                        w="fit-content"
                      >
                        {member.status}
                      </Badge>
                      <HStack gap={1}>
                        <IconButton
                          aria-label="More options"
                          size="sm"
                          variant="ghost"
                        >
                          <FiMoreVertical />
                        </IconButton>
                        <IconButton
                          aria-label="Remove member"
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => handleRemoveMember(member)}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </HStack>
                    </Grid>
                  ))}
                </VStack>
              </Box>

              {/* Mobile View */}
              <VStack align="stretch" gap={3} display={{ base: 'flex', md: 'none' }}>
                {teamMembers.map((member) => (
                  <Card key={member.id} p={4} bg="gray.50">
                    <VStack align="stretch" gap={3}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                          {member.first_name} {member.last_name}
                        </Text>
                        <HStack gap={1}>
                          <Badge
                            colorPalette={getStatusColor(member.status)}
                            borderRadius="full"
                            px={2}
                            py={1}
                            fontSize="xs"
                          >
                            {member.status}
                          </Badge>
                        </HStack>
                      </HStack>

                      <VStack align="stretch" gap={2}>
                        <HStack gap={2}>
                          <FiMail size={14} color="#718096" />
                          <Text fontSize="sm" color="gray.600">
                            {member.email}
                          </Text>
                        </HStack>
                        {member.job_title && (
                          <Text fontSize="sm" color="gray.600">
                            {member.job_title}
                          </Text>
                        )}
                        <HStack gap={2}>
                          <Badge
                            colorPalette={getRoleColor(member.role_name)}
                            borderRadius="full"
                            px={2}
                            py={1}
                            fontSize="xs"
                          >
                            {member.role_name || 'No Role'}
                          </Badge>
                        </HStack>
                      </VStack>

                      <HStack justify="flex-end" pt={2} borderTopWidth="1px" borderColor="gray.200">
                        <Button
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => handleRemoveMember(member)}
                        >
                          <FiTrash2 />
                          <Box ml={2}>Remove</Box>
                        </Button>
                      </HStack>
                    </VStack>
                  </Card>
                ))}
              </VStack>
            </>
          )}
        </VStack>
      </Card>
    </VStack>
  );
};

export default TeamSettings;

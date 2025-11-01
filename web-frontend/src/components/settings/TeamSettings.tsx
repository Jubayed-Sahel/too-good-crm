import { useState } from 'react';
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
} from '@chakra-ui/react';
import { Card } from '../common';
import { Field } from '../ui/field';
import { FiUserPlus, FiMail, FiTrash2, FiMoreVertical } from 'react-icons/fi';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
}

const TeamSettings = () => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('sales_rep');
  const [isLoading, setIsLoading] = useState(false);

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'Admin',
      status: 'active',
      joinedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      role: 'Sales Manager',
      status: 'active',
      joinedDate: '2024-02-01',
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      role: 'Sales Rep',
      status: 'active',
      joinedDate: '2024-02-15',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      role: 'Sales Rep',
      status: 'pending',
      joinedDate: '2024-03-01',
    },
  ]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInviteForm(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleRemoveMember = (member: TeamMember) => {
    if (window.confirm(`Remove ${member.name} from the team?`)) {
      alert(`${member.name} removed from team`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'pending':
        return 'orange';
      case 'inactive':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'purple';
      case 'Sales Manager':
        return 'blue';
      default:
        return 'gray';
    }
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
                <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={3}>
                  <Field label="Email Address" required>
                    <HStack>
                      <Box color="gray.400" pl={3}>
                        <FiMail size={16} />
                      </Box>
                      <Input
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        size="md"
                        bg="white"
                        pl={2}
                      />
                    </HStack>
                  </Field>

                  <Field label="Role" required>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      aria-label="Role"
                      className="chakra-select"
                    >
                      <option value="admin">Admin</option>
                      <option value="sales_manager">Sales Manager</option>
                      <option value="sales_rep">Sales Rep</option>
                    </select>
                  </Field>
                </Grid>

                <HStack justify="flex-end" gap={2}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteEmail('');
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

          {/* Desktop View */}
          <Box display={{ base: 'none', md: 'block' }}>
            <VStack align="stretch" gap={0}>
              {/* Header */}
              <Grid
                templateColumns="2fr 2fr 1fr 1fr 80px"
                gap={4}
                p={3}
                bg="gray.50"
                borderRadius="md"
                fontSize="xs"
                fontWeight="bold"
                color="gray.600"
                textTransform="uppercase"
              >
                <Text>Name</Text>
                <Text>Email</Text>
                <Text>Role</Text>
                <Text>Status</Text>
                <Text>Actions</Text>
              </Grid>

              {/* Members */}
              {teamMembers.map((member) => (
                <Grid
                  key={member.id}
                  templateColumns="2fr 2fr 1fr 1fr 80px"
                  gap={4}
                  p={3}
                  borderBottomWidth="1px"
                  borderColor="gray.100"
                  alignItems="center"
                  _hover={{ bg: 'gray.50' }}
                >
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {member.name}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {member.email}
                  </Text>
                  <Badge
                    colorPalette={getRoleColor(member.role)}
                    borderRadius="full"
                    px={2}
                    py={1}
                    fontSize="xs"
                    w="fit-content"
                  >
                    {member.role}
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
                      {member.name}
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
                    <HStack gap={2}>
                      <Badge
                        colorPalette={getRoleColor(member.role)}
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                      >
                        {member.role}
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
        </VStack>
      </Card>
    </VStack>
  );
};

export default TeamSettings;

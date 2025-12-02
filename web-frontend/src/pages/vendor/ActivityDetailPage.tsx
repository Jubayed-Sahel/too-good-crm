import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, GradientBox, StandardButton, ConfirmDialog } from '@/components/common';
import {
  FiMail,
  FiPhone,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMessageSquare,
  FiCheckCircle,
  FiFileText,
  FiCheckSquare,
} from 'react-icons/fi';
import { toaster } from '@/components/ui/toaster';
import { useState, useEffect } from 'react';
import { activityService } from '@/features/activities/services/activity.service';
import type { Activity, ActivityType, ActivityStatus } from '@/types/activity.types';

const ActivityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadActivity = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await activityService.getById(Number(id));
        if (data) {
          setActivity(data);
        } else {
          throw new Error('Activity not found');
        }
      } catch (error) {
        toaster.create({
          title: 'Error loading activity',
          description: 'Failed to fetch activity details.',
          type: 'error',
          duration: 3000,
        });
        navigate('/activities');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [id, navigate]);

  const getActivityIcon = (type: ActivityType) => {
    const icons = {
      call: FiPhone,
      email: FiMail,
      telegram: FiMessageSquare,
      meeting: FiCalendar,
      note: FiFileText,
      task: FiCheckSquare,
    };
    return icons[type] || FiFileText;
  };

  const getActivityColor = (type: ActivityType) => {
    const colors = {
      call: 'blue',
      email: 'purple',
      telegram: 'cyan',
      meeting: 'orange',
      note: 'yellow',
      task: 'green',
    };
    return colors[type] || 'gray';
  };

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'scheduled':
        return 'blue';
      case 'in_progress':
        return 'orange';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    navigate(`/activities/${id}/edit`);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await activityService.delete(Number(id));
      toaster.create({
        title: 'Activity deleted',
        description: 'Activity has been successfully deleted.',
        type: 'success',
        duration: 3000,
      });
      setIsDeleteDialogOpen(false);
      navigate('/activities');
    } catch (error: any) {
      toaster.create({
        title: 'Error deleting activity',
        description: error.message || 'Failed to delete activity. Please try again.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    navigate('/activities');
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Activity Details">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="purple.500" />
        </Box>
      </DashboardLayout>
    );
  }

  if (!activity) {
    return (
      <DashboardLayout title="Activity Details">
        <Box textAlign="center" py={12}>
          <Heading size="lg" color="gray.600" mb={2}>
            Activity not found
          </Heading>
          <Text color="gray.500" mb={6}>
            The activity you're looking for doesn't exist.
          </Text>
          <StandardButton variant="primary" onClick={handleBack} leftIcon={<FiArrowLeft />}>
            Back to Activities
          </StandardButton>
        </Box>
      </DashboardLayout>
    );
  }

  const Icon = getActivityIcon(activity.activity_type);
  const activityColor = getActivityColor(activity.activity_type);

  return (
    <DashboardLayout title={`Activity: ${activity.title}`}>
      <VStack align="stretch" gap={6}>
        {/* Back Button */}
        <StandardButton
          variant="ghost"
          onClick={handleBack}
          alignSelf="flex-start"
          leftIcon={<FiArrowLeft />}
          ml={-2}
          mb={3}
        >
          Back to Activities
        </StandardButton>

        {/* Header Section with Gradient */}
        <GradientBox>
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between" align="start">
              <HStack gap={4}>
                <Box
                  p={4}
                  bg="whiteAlpha.900"
                  borderRadius="xl"
                  color={`${activityColor}.600`}
                  boxShadow="lg"
                >
                  <Icon size={32} />
                </Box>
                <VStack align="start" gap={1}>
                  <Heading size="2xl" color="white">
                    {activity.title}
                  </Heading>
                  <HStack gap={3}>
                    <Badge
                      colorPalette={getStatusColor(activity.status)}
                      size="lg"
                      textTransform="capitalize"
                    >
                      {activity.status}
                    </Badge>
                    <Badge
                      colorPalette={activityColor}
                      size="lg"
                      textTransform="capitalize"
                    >
                      {activity.activity_type}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>

              {/* Action Buttons */}
              <HStack gap={2}>
                <StandardButton
                  variant="outline"
                  onClick={handleEdit}
                  leftIcon={<FiEdit2 />}
                  bg="whiteAlpha.900"
                  _hover={{ bg: 'whiteAlpha.800' }}
                >
                  Edit
                </StandardButton>
                <StandardButton
                  variant="danger"
                  onClick={handleDelete}
                  leftIcon={<FiTrash2 />}
                  bg="whiteAlpha.900"
                  _hover={{ bg: 'whiteAlpha.800' }}
                >
                  Delete
                </StandardButton>
              </HStack>
            </HStack>

            {/* Customer Info */}
            <HStack gap={4} color="whiteAlpha.900">
              <HStack gap={2}>
                <FiUser size={20} />
                <Text fontSize="md" fontWeight="medium">
                  {activity.customer_name}
                </Text>
              </HStack>
              {activity.duration_minutes && (
                <HStack gap={2}>
                  <FiClock size={20} />
                  <Text fontSize="md" fontWeight="medium">
                    {activity.duration_minutes} minutes
                  </Text>
                </HStack>
              )}
            </HStack>
          </VStack>
        </GradientBox>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {/* Activity Details */}
          <Card>
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="gray.900">
                Activity Details
              </Heading>

              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={2}
                >
                  Description
                </Text>
                <Text fontSize="md" color="gray.700">
                  {activity.description || 'No description provided'}
                </Text>
              </Box>

              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={2}
                >
                  Created By
                </Text>
                <Text fontSize="md" color="gray.700" fontWeight="medium">
                  {activity.created_by}
                </Text>
              </Box>
            </VStack>
          </Card>

          {/* Type-Specific Details */}
          <Card>
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="gray.900">
                Contact Information
              </Heading>

              {activity.activity_type === 'call' && activity.phone_number && (
                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={2}
                  >
                    Phone Number
                  </Text>
                  <HStack gap={2}>
                    <FiPhone size={16} color="#667eea" />
                    <Text fontSize="md" color="gray.700" fontWeight="medium">
                      {activity.phone_number}
                    </Text>
                  </HStack>
                </Box>
              )}

              {activity.activity_type === 'email' && (
                <>
                  {activity.email_subject && (
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb={2}
                      >
                        Email Subject
                      </Text>
                      <Text fontSize="md" color="gray.700" fontWeight="medium">
                        {activity.email_subject}
                      </Text>
                    </Box>
                  )}
                  {activity.email_body && (
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb={2}
                      >
                        Email Body
                      </Text>
                      <Text fontSize="md" color="gray.700" whiteSpace="pre-wrap">
                        {activity.email_body}
                      </Text>
                    </Box>
                  )}
                </>
              )}

              {activity.activity_type === 'telegram' && activity.telegram_username && (
                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={2}
                  >
                    Telegram Username
                  </Text>
                  <HStack gap={2}>
                    <FiMessageSquare size={16} color="#667eea" />
                    <Text fontSize="md" color="gray.700" fontWeight="medium">
                      @{activity.telegram_username}
                    </Text>
                  </HStack>
                </Box>
              )}
            </VStack>
          </Card>

          {/* Timeline Card */}
          <Card>
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="gray.900">
                Timeline
              </Heading>

              <HStack gap={4} p={3} bg="gray.50" borderRadius="md">
                <Box
                  p={2}
                  bg="blue.100"
                  borderRadius="md"
                  color="blue.600"
                >
                  <FiCalendar size={20} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                    CREATED
                  </Text>
                  <Text fontSize="sm" color="gray.700" fontWeight="medium">
                    {formatDate(activity.created_at)}
                  </Text>
                </VStack>
              </HStack>

              {activity.scheduled_at && (
                <HStack gap={4} p={3} bg="gray.50" borderRadius="md">
                  <Box
                    p={2}
                    bg="orange.100"
                    borderRadius="md"
                    color="orange.600"
                  >
                    <FiClock size={20} />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                      SCHEDULED
                    </Text>
                    <Text fontSize="sm" color="gray.700" fontWeight="medium">
                      {formatDate(activity.scheduled_at)}
                    </Text>
                  </VStack>
                </HStack>
              )}

              {activity.completed_at && (
                <HStack gap={4} p={3} bg="gray.50" borderRadius="md">
                  <Box
                    p={2}
                    bg="green.100"
                    borderRadius="md"
                    color="green.600"
                  >
                    <FiCheckCircle size={20} />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                      COMPLETED
                    </Text>
                    <Text fontSize="sm" color="gray.700" fontWeight="medium">
                      {formatDate(activity.completed_at)}
                    </Text>
                  </VStack>
                </HStack>
              )}
            </VStack>
          </Card>

          {/* Quick Actions */}
          <Card>
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="gray.900">
                Quick Actions
              </Heading>

              <StandardButton
                variant="primary"
                onClick={handleEdit}
                size="lg"
                leftIcon={<FiEdit2 />}
              >
                Edit Activity
              </StandardButton>

              <StandardButton
                variant="danger"
                onClick={handleDelete}
                size="lg"
                leftIcon={<FiTrash2 />}
              >
                Delete Activity
              </StandardButton>
            </VStack>
          </Card>
        </Grid>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Activity"
          message={
            activity
              ? `Are you sure you want to delete activity "${activity.title}"? This action cannot be undone.`
              : 'Are you sure you want to delete this activity?'
          }
          confirmText="Delete"
          cancelText="Cancel"
          colorScheme="red"
          isLoading={isDeleting}
        />
      </VStack>
    </DashboardLayout>
  );
};

export default ActivityDetailPage;

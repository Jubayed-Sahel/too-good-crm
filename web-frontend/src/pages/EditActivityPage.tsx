import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Textarea,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react';
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CustomSelect from '../components/ui/CustomSelect';
import { Card, StandardButton } from '../components/common';
import { Field } from '../components/ui/field';
import { toaster } from '../components/ui/toaster';
import { activityService } from '../services/activity.service';
import type { Activity, ActivityType, ActivityStatus } from '../types/activity.types';

const activityTypeOptions = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
  { value: 'task', label: 'Task' },
];

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const EditActivityPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: 'call' as ActivityType,
    status: 'scheduled' as ActivityStatus,
    customer_name: '',
    phone_number: '',
    email_subject: '',
    email_body: '',
    telegram_username: '',
    scheduled_at: '',
    completed_at: '',
    notes: '',
  });

  // Fetch activity data
  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const activityData = await activityService.getById(Number(id));
        if (activityData) {
          setActivity(activityData);
          setFormData({
            title: activityData.title || '',
            description: activityData.description || '',
            activity_type: activityData.activity_type,
            status: activityData.status,
            customer_name: activityData.customer_name || '',
            phone_number: activityData.phone_number || '',
            email_subject: activityData.email_subject || '',
            email_body: activityData.email_body || '',
            telegram_username: activityData.telegram_username || '',
            scheduled_at: activityData.scheduled_at?.split('T')[0] || '', // Format for date input
            completed_at: activityData.completed_at?.split('T')[0] || '',
            notes: activityData.description || '', // Use description as notes
          });
        } else {
          setError('Activity not found');
        }
      } catch (err) {
        setError('Failed to load activity');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const handleSubmit = async () => {
    if (!id || !activity) return;

    try {
      setIsSaving(true);
      
      // Build update data - only include fields that are relevant
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        customer_name: formData.customer_name,
      };

      // Add type-specific fields
      if (formData.activity_type === 'call' && formData.phone_number) {
        updateData.phone_number = formData.phone_number;
      }
      if (formData.activity_type === 'email') {
        updateData.email_subject = formData.email_subject;
        updateData.email_body = formData.email_body;
      }
      if (formData.activity_type === 'telegram' && formData.telegram_username) {
        updateData.telegram_username = formData.telegram_username;
      }
      if (formData.scheduled_at) {
        updateData.scheduled_at = formData.scheduled_at;
      }
      if (formData.notes) {
        updateData.notes = formData.notes;
      }

      await activityService.update(Number(id), updateData);
      
      toaster.create({
        title: 'Activity updated successfully',
        type: 'success',
      });
      navigate(`/activities/${id}`);
    } catch (err: any) {
      toaster.create({
        title: 'Failed to update activity',
        description: err.response?.data?.detail || 'Please try again',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/activities/${id}`);
  };

  const isFormValid = formData.title && formData.customer_name;

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Activity">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading activity...</Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !activity) {
    return (
      <DashboardLayout title="Edit Activity">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Activity not found
          </Heading>
          <Text color="gray.500" mb={4}>
            The activity you're looking for doesn't exist or has been deleted.
          </Text>
          <StandardButton 
            variant="primary" 
            onClick={() => navigate('/activities')} 
            leftIcon={<FiArrowLeft />}
          >
            Back to Activities
          </StandardButton>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Activity">
      <VStack gap={5} align="stretch" maxW="1200px" mx="auto">
        {/* Page Header */}
        <Box>
          <StandardButton
            size="sm"
            variant="ghost"
            onClick={() => navigate('/activities')}
            leftIcon={<FiArrowLeft />}
            mb={3}
          >
            Back to Activities
          </StandardButton>
          <HStack justify="space-between" align="flex-start">
            <Box>
              <Heading size="2xl" mb={2}>
                Edit Activity
              </Heading>
              <Text color="gray.600">
                Update activity details and information
              </Text>
            </Box>
            <HStack gap={3}>
              <StandardButton
                variant="outline"
                onClick={handleCancel}
                leftIcon={<FiX />}
              >
                Cancel
              </StandardButton>
              <StandardButton
                variant="primary"
                onClick={handleSubmit}
                loading={isSaving}
                disabled={!isFormValid || isSaving}
                leftIcon={<FiSave />}
              >
                Save Changes
              </StandardButton>
            </HStack>
          </HStack>
        </Box>

        {/* Form */}
        <Card p={6}>
          <VStack gap={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <Heading size="md" mb={4}>Basic Information</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field label="Title" required>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Activity title"
                  />
                </Field>

                <Field label="Customer Name" required>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Customer name"
                  />
                </Field>

                <Field label="Activity Type">
                  <Box opacity={0.6} pointerEvents="none">
                    <CustomSelect
                      value={formData.activity_type}
                      onChange={(value) => setFormData({ ...formData, activity_type: value as ActivityType })}
                      options={activityTypeOptions}
                      placeholder="Select type"
                    />
                  </Box>
                </Field>

                <Field label="Status">
                  <CustomSelect
                    value={formData.status}
                    onChange={(value) => setFormData({ ...formData, status: value as ActivityStatus })}
                    options={statusOptions}
                    placeholder="Select status"
                  />
                </Field>

                <Field label="Scheduled Date">
                  <Input
                    type="date"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  />
                </Field>
              </SimpleGrid>

              <Box mt={4}>
                <Field label="Description">
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Activity description"
                    rows={4}
                  />
                </Field>
              </Box>
            </Box>

            {/* Type-specific fields */}
            {formData.activity_type === 'call' && (
              <Box>
                <Heading size="md" mb={4}>Call Details</Heading>
                <Field label="Phone Number">
                  <Input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+1-555-0123"
                  />
                </Field>
              </Box>
            )}

            {formData.activity_type === 'email' && (
              <Box>
                <Heading size="md" mb={4}>Email Details</Heading>
                <VStack gap={4} align="stretch">
                  <Field label="Subject">
                    <Input
                      value={formData.email_subject}
                      onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
                      placeholder="Email subject"
                    />
                  </Field>
                  <Field label="Body">
                    <Textarea
                      value={formData.email_body}
                      onChange={(e) => setFormData({ ...formData, email_body: e.target.value })}
                      placeholder="Email body"
                      rows={6}
                    />
                  </Field>
                </VStack>
              </Box>
            )}

            {formData.activity_type === 'telegram' && (
              <Box>
                <Heading size="md" mb={4}>Telegram Details</Heading>
                <Field label="Telegram Username">
                  <Input
                    value={formData.telegram_username}
                    onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                    placeholder="@username"
                  />
                </Field>
              </Box>
            )}

            {/* Additional Notes */}
            <Box>
              <Heading size="md" mb={4}>Additional Notes</Heading>
              <Field label="Notes">
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes or comments"
                  rows={4}
                />
              </Field>
            </Box>
          </VStack>
        </Card>

        {/* Action Buttons (Bottom) */}
        <HStack justify="flex-end" gap={3}>
          <StandardButton
            variant="outline"
            onClick={handleCancel}
            leftIcon={<FiX />}
          >
            Cancel
          </StandardButton>
          <StandardButton
            variant="primary"
            onClick={handleSubmit}
            loading={isSaving}
            disabled={!isFormValid || isSaving}
            leftIcon={<FiSave />}
          >
            Save Changes
          </StandardButton>
        </HStack>
      </VStack>
    </DashboardLayout>
  );
};

export default EditActivityPage;

import { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, HStack, Text, Grid, Spinner, Textarea } from '@chakra-ui/react';
import { Card } from '../common';
import { Field } from '../ui/field';
import { toaster } from '../ui/toaster';
import CustomSelect from '../ui/CustomSelect';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiBriefcase } from 'react-icons/fi';
import { useCurrentUserProfile, useUpdateProfile } from '@/hooks';

// Timezone options
const timezoneOptions = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
];

// Language options
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
];

interface ProfileSettingsProps {
  onSave?: (data: any) => void;
}

const ProfileSettings = ({ onSave }: ProfileSettingsProps) => {
  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile();
  const updateProfile = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    title: '',
    department: '',
    bio: '',
    location: '',
    timezone: '',
    language: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        title: profile.title || '',
        department: profile.department || '',
        bio: profile.bio || '',
        location: profile.location || '',
        timezone: profile.timezone || '',
        language: profile.language || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    updateProfile.mutate(
      { userId: profile.id, data: formData },
      {
        onSuccess: () => {
          toaster.create({
            title: 'Profile updated',
            description: 'Your profile has been updated successfully.',
            type: 'success',
            duration: 3000,
          });
          onSave?.(formData);
        },
        onError: (error) => {
          toaster.create({
            title: 'Update failed',
            description: error.message || 'Failed to update profile.',
            type: 'error',
            duration: 5000,
          });
        },
      }
    );
  };

  if (profileLoading) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="lg" color="purple.500" />
        <Text mt={4} color="gray.500">Loading profile...</Text>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="gray.500">Profile not found</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* Profile Picture */}
      <Card variant="elevated">
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Profile Picture
          </Text>
          <HStack gap={4} flexWrap="wrap">
            <Box
              w="20"
              h="20"
              borderRadius="full"
              bgGradient="linear(to-br, purple.500, blue.500)"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="2xl"
              fontWeight="bold"
            >
              {profile.firstName[0]}{profile.lastName[0]}
            </Box>
            <VStack align="start" gap={2}>
              <Button size="sm" colorPalette="blue">
                <FiCamera />
                <Box ml={2}>Upload Photo</Box>
              </Button>
              <Text fontSize="xs" color="gray.500">
                JPG, PNG or GIF. Max size 2MB
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Card>

      {/* Personal Information */}
      <Card variant="elevated">
        <form onSubmit={handleSubmit}>
          <VStack align="stretch" gap={5}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Personal Information
            </Text>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="First Name" required>
                <HStack>
                  <Box color="gray.400" pl={3}>
                    <FiUser size={16} />
                  </Box>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    size="md"
                    pl={2}
                  />
                </HStack>
              </Field>

              <Field label="Last Name" required>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  size="md"
                />
              </Field>
            </Grid>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="Email" helperText="Email cannot be changed">
                <HStack>
                  <Box color="gray.400" pl={3}>
                    <FiMail size={16} />
                  </Box>
                  <Input
                    type="email"
                    value={profile.email}
                    size="md"
                    pl={2}
                    disabled
                    bg="gray.50"
                  />
                </HStack>
              </Field>

              <Field label="Phone">
                <HStack>
                  <Box color="gray.400" pl={3}>
                    <FiPhone size={16} />
                  </Box>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    size="md"
                    pl={2}
                  />
                </HStack>
              </Field>
            </Grid>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="Job Title">
                <HStack>
                  <Box color="gray.400" pl={3}>
                    <FiBriefcase size={16} />
                  </Box>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    size="md"
                    pl={2}
                  />
                </HStack>
              </Field>

              <Field label="Department">
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  size="md"
                />
              </Field>
            </Grid>

            <Field label="Bio">
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                size="md"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </Field>

            <Text fontSize="sm" fontWeight="semibold" color="gray.700" pt={2}>
              Location & Preferences
            </Text>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="Location">
                <HStack>
                  <Box color="gray.400" pl={3}>
                    <FiMapPin size={16} />
                  </Box>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    size="md"
                    pl={2}
                    placeholder="City, State"
                  />
                </HStack>
              </Field>

              <Field label="Timezone">
                <CustomSelect
                  value={formData.timezone}
                  onChange={(val) => setFormData({ ...formData, timezone: val })}
                  options={timezoneOptions}
                  placeholder="Select timezone"
                  accentColor="purple"
                />
              </Field>
            </Grid>

            <Field label="Language">
              <CustomSelect
                value={formData.language}
                onChange={(val) => setFormData({ ...formData, language: val })}
                options={languageOptions}
                placeholder="Select language"
                accentColor="purple"
              />
            </Field>

            <HStack justify="flex-end" pt={2}>
              <Button variant="outline" size="md">
                Cancel
              </Button>
              <Button
                type="submit"
                colorPalette="blue"
                size="md"
                loading={updateProfile.isPending}
              >
                Save Changes
              </Button>
            </HStack>
          </VStack>
        </form>
      </Card>
    </VStack>
  );
};

export default ProfileSettings;

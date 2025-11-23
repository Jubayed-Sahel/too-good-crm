import { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, HStack, Text, Grid } from '@chakra-ui/react';
import { Card } from '../../common';
import { Field } from '../../ui/field';
import { toaster } from '../../ui/toaster';
import { FiUser, FiMail, FiPhone, FiCamera } from 'react-icons/fi';
import { useCurrentUserProfile, useUpdateProfile } from '@/hooks/useUser';

const ClientProfileSettings = () => {
  const { data: currentUser, isLoading } = useCurrentUserProfile();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
  });

  // Load user data when available
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        username: currentUser.username || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfileMutation.mutateAsync({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        username: formData.username,
      });

      toaster.create({
        title: 'Profile Updated Successfully!',
        description: 'Your profile information has been saved.',
        type: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.error || 
                       'Failed to update profile. Please try again.';
      toaster.create({
        title: 'Update Failed',
        description: errorMsg,
        type: 'error',
        duration: 4000,
      });
    }
  };

  if (isLoading) {
    return (
      <VStack align="stretch" gap={6}>
        <Card variant="elevated">
          <Text>Loading profile...</Text>
        </Card>
      </VStack>
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
              bgGradient="linear(to-br, blue.500, cyan.500)"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="2xl"
              fontWeight="bold"
            >
              {formData.firstName[0]}{formData.lastName[0]}
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

            <Field label="Username" required>
              <Box position="relative">
                <Box
                  position="absolute"
                  left="12px"
                  top="50%"
                  transform="translateY(-50%)"
                  pointerEvents="none"
                  color="gray.400"
                >
                  <FiUser size={16} />
                </Box>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  size="md"
                  pl="40px"
                  borderRadius="lg"
                />
              </Box>
            </Field>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="First Name" required>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  size="md"
                  borderRadius="lg"
                />
              </Field>

              <Field label="Last Name" required>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  size="md"
                  borderRadius="lg"
                />
              </Field>
            </Grid>

            <Field label="Email" required helperText="Email cannot be changed">
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
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  size="md"
                  pl="40px"
                  borderRadius="lg"
                  bg="gray.50"
                  cursor="not-allowed"
                />
              </Box>
            </Field>

            <Field label="Phone">
              <Box position="relative">
                <Box
                  position="absolute"
                  left="12px"
                  top="50%"
                  transform="translateY(-50%)"
                  pointerEvents="none"
                  color="gray.400"
                >
                  <FiPhone size={16} />
                </Box>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  size="md"
                  pl="40px"
                  borderRadius="lg"
                  placeholder="+1 (555) 123-4567"
                />
              </Box>
            </Field>

            <HStack justify="flex-end" pt={2}>
              <Button
                type="submit"
                colorPalette="blue"
                size="md"
                loading={updateProfileMutation.isPending}
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

export default ClientProfileSettings;

import { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text, Grid, Textarea } from '@chakra-ui/react';
import { Card } from '../../common';
import { Field } from '../../ui/field';
import { toaster } from '../../ui/toaster';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiBriefcase } from 'react-icons/fi';

const ClientProfileSettings = () => {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Startup Inc',
    title: 'CEO',
    bio: '',
    address: '123 Business St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toaster.create({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
      type: 'success',
      duration: 3000,
    });
  };

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

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="First Name" required>
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
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    size="md"
                    pl="40px"
                    borderRadius="lg"
                  />
                </Box>
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

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="Email" required>
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
                    onChange={handleChange}
                    size="md"
                    pl="40px"
                    borderRadius="lg"
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
                  />
                </Box>
              </Field>
            </Grid>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="Company">
                <Box position="relative">
                  <Box
                    position="absolute"
                    left="12px"
                    top="50%"
                    transform="translateY(-50%)"
                    pointerEvents="none"
                    color="gray.400"
                  >
                    <FiBriefcase size={16} />
                  </Box>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    size="md"
                    pl="40px"
                    borderRadius="lg"
                  />
                </Box>
              </Field>

              <Field label="Job Title">
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  size="md"
                  borderRadius="lg"
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
                borderRadius="lg"
              />
            </Field>

            <Text fontSize="sm" fontWeight="semibold" color="gray.700" pt={2}>
              Address Information
            </Text>

            <Field label="Street Address">
              <Box position="relative">
                <Box
                  position="absolute"
                  left="12px"
                  top="50%"
                  transform="translateY(-50%)"
                  pointerEvents="none"
                  color="gray.400"
                >
                  <FiMapPin size={16} />
                </Box>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  size="md"
                  pl="40px"
                  borderRadius="lg"
                />
              </Box>
            </Field>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
              <Field label="City">
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  size="md"
                  borderRadius="lg"
                />
              </Field>

              <Field label="State">
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  size="md"
                  borderRadius="lg"
                />
              </Field>

              <Field label="ZIP Code">
                <Input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  size="md"
                  borderRadius="lg"
                />
              </Field>
            </Grid>

            <Field label="Country">
              <Input
                name="country"
                value={formData.country}
                onChange={handleChange}
                size="md"
                borderRadius="lg"
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

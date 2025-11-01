import { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text, Grid } from '@chakra-ui/react';
import { Card } from '../common';
import { Field } from '../ui/field';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera } from 'react-icons/fi';

interface ProfileSettingsProps {
  onSave?: (data: any) => void;
}

const ProfileSettings = ({ onSave }: ProfileSettingsProps) => {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Sales Manager',
    department: 'Sales',
    address: '123 Business St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      alert('Profile updated successfully!');
      onSave?.(formData);
      setIsLoading(false);
    }, 1000);
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
              bg="blue.500"
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
              <Field label="Email" required>
                <HStack>
                  <Box color="gray.400" pl={3}>
                    <FiMail size={16} />
                  </Box>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    size="md"
                    pl={2}
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
                <Input
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  size="md"
                />
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

            <Text fontSize="sm" fontWeight="semibold" color="gray.700" pt={2}>
              Address
            </Text>

            <Field label="Street Address">
              <HStack>
                <Box color="gray.400" pl={3}>
                  <FiMapPin size={16} />
                </Box>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  size="md"
                  pl={2}
                />
              </HStack>
            </Field>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="City">
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  size="md"
                />
              </Field>

              <Field label="State/Province">
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  size="md"
                />
              </Field>
            </Grid>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="ZIP/Postal Code">
                <Input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  size="md"
                />
              </Field>

              <Field label="Country">
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  size="md"
                />
              </Field>
            </Grid>

            <HStack justify="flex-end" pt={2}>
              <Button variant="outline" size="md">
                Cancel
              </Button>
              <Button
                type="submit"
                colorPalette="blue"
                size="md"
                loading={isLoading}
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

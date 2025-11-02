import { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text, Grid, Badge } from '@chakra-ui/react';
import { Card } from '../common';
import { Field } from '../ui/field';
import CustomSelect from '../ui/CustomSelect';
import { FiGlobe, FiMail, FiPhone } from 'react-icons/fi';

const OrganizationSettings = () => {
  const [formData, setFormData] = useState({
    organizationName: 'LeadGrid Inc.',
    industry: 'Software & Technology',
    companySize: '51-200',
    website: 'https://leadgrid.com',
    email: 'contact@leadgrid.com',
    phone: '+1 (555) 987-6543',
    address: '456 Enterprise Ave',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      alert('Organization settings updated successfully!');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <VStack align="stretch" gap={6}>
      {/* Organization Info */}
      <Card variant="elevated">
        <form onSubmit={handleSubmit}>
          <VStack align="stretch" gap={5}>
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Organization Information
              </Text>
              <Badge colorPalette="green" borderRadius="full" px={3} py={1}>
                Active
              </Badge>
            </HStack>

            <Field label="Organization Name" required>
              <HStack>
                <Box color="gray.400" pl={3}>
                  <FiMail size={16} />
                </Box>
                <Input
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  size="md"
                  pl={2}
                />
              </HStack>
            </Field>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="Industry">
                <CustomSelect
                  value={formData.industry}
                  onChange={(val) => setFormData({ ...formData, industry: val })}
                  options={[
                    { value: 'Software & Technology', label: 'Software & Technology' },
                    { value: 'Healthcare', label: 'Healthcare' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Retail', label: 'Retail' },
                    { value: 'Manufacturing', label: 'Manufacturing' },
                    { value: 'Education', label: 'Education' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  placeholder="Select industry"
                  accentColor="purple"
                />
              </Field>

              <Field label="Company Size">
                <CustomSelect
                  value={formData.companySize}
                  onChange={(val) => setFormData({ ...formData, companySize: val })}
                  options={[
                    { value: '1-10', label: '1-10 employees' },
                    { value: '11-50', label: '11-50 employees' },
                    { value: '51-200', label: '51-200 employees' },
                    { value: '201-500', label: '201-500 employees' },
                    { value: '501-1000', label: '501-1000 employees' },
                    { value: '1000+', label: '1000+ employees' },
                  ]}
                  placeholder="Select company size"
                  accentColor="purple"
                />
              </Field>
            </Grid>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="Website">
                <HStack>
                  <Box color="gray.400" pl={3}>
                    <FiGlobe size={16} />
                  </Box>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    size="md"
                    pl={2}
                  />
                </HStack>
              </Field>

              <Field label="Email">
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
            </Grid>

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

            <Text fontSize="sm" fontWeight="semibold" color="gray.700" pt={2}>
              Address
            </Text>

            <Field label="Street Address">
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                size="md"
              />
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

            <Text fontSize="sm" fontWeight="semibold" color="gray.700" pt={2}>
              Regional Settings
            </Text>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="Timezone">
                <CustomSelect
                  value={formData.timezone}
                  onChange={(val) => setFormData({ ...formData, timezone: val })}
                  options={[
                    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                    { value: 'America/Denver', label: 'Mountain Time (MT)' },
                    { value: 'America/Chicago', label: 'Central Time (CT)' },
                    { value: 'America/New_York', label: 'Eastern Time (ET)' },
                    { value: 'Europe/London', label: 'London (GMT)' },
                    { value: 'Europe/Paris', label: 'Paris (CET)' },
                    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
                  ]}
                  placeholder="Select timezone"
                  accentColor="purple"
                />
              </Field>

              <Field label="Currency">
                <CustomSelect
                  value={formData.currency}
                  onChange={(val) => setFormData({ ...formData, currency: val })}
                  options={[
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'EUR', label: 'EUR - Euro' },
                    { value: 'GBP', label: 'GBP - British Pound' },
                    { value: 'JPY', label: 'JPY - Japanese Yen' },
                    { value: 'CAD', label: 'CAD - Canadian Dollar' },
                    { value: 'AUD', label: 'AUD - Australian Dollar' },
                  ]}
                  placeholder="Select currency"
                  accentColor="purple"
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

export default OrganizationSettings;

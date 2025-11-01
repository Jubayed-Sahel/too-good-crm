import { useState } from 'react';
import { Box, Button, Input, VStack, HStack, Text, Grid, Badge } from '@chakra-ui/react';
import { Card } from '../common';
import { Field } from '../ui/field';
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
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    width: '100%',
                  }}
                >
                  <option value="Software & Technology">Software & Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Company Size">
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    width: '100%',
                  }}
                >
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
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
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    width: '100%',
                  }}
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </Field>

              <Field label="Currency">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    width: '100%',
                  }}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
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

import { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, HStack, Text, Grid, Badge, Spinner } from '@chakra-ui/react';
import { Card } from '../common';
import { Field } from '../ui/field';
import CustomSelect from '../ui/CustomSelect';
import { FiGlobe, FiMail, FiPhone } from 'react-icons/fi';
import { organizationService, type Organization } from '@/services/organization.service';
import { toaster } from '../ui/toaster';

const OrganizationSettings = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    industry: '',
    companySize: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    timezone: '',
    currency: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      setIsLoading(true);
      const org = await organizationService.getCurrentOrganization();
      setOrganization(org);
      
      // Populate form with organization data
      setFormData({
        organizationName: org.name || '',
        industry: org.industry || '',
        companySize: '', // Not in backend model, use settings
        website: org.website || '',
        email: org.email || '',
        phone: org.phone || '',
        address: org.address || '',
        city: org.city || '',
        state: org.state || '',
        zipCode: org.zip_code || '',
        country: org.country || '',
        timezone: org.settings?.timezone || '',
        currency: org.settings?.currency || '',
      });
    } catch (error) {
      console.error('Failed to load organization:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to load organization details',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organization) {
      toaster.create({
        title: 'Error',
        description: 'No organization found',
        type: 'error',
      });
      return;
    }

    try {
      setIsSaving(true);
      
      await organizationService.updateOrganization(organization.id, {
        name: formData.organizationName,
        industry: formData.industry,
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        settings: {
          ...organization.settings,
          timezone: formData.timezone,
          currency: formData.currency,
        },
      });

      toaster.create({
        title: 'Success',
        description: 'Organization settings updated successfully',
        type: 'success',
      });
      
      // Reload organization data
      await loadOrganization();
    } catch (error) {
      console.error('Failed to update organization:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to update organization settings',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4} color="gray.500">Loading organization details...</Text>
      </Box>
    );
  }

  if (!organization) {
    return (
      <Card variant="elevated">
        <Text color="gray.500" textAlign="center">No organization found</Text>
      </Card>
    );
  }

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
              <Input
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                size="md"
                borderRadius="lg"
              />
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
                <Box position="relative">
                  <Box
                    position="absolute"
                    left="12px"
                    top="50%"
                    transform="translateY(-50%)"
                    pointerEvents="none"
                    color="gray.400"
                  >
                    <FiGlobe size={16} />
                  </Box>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    size="md"
                    pl="40px"
                    borderRadius="lg"
                  />
                </Box>
              </Field>

              <Field label="Email">
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
            </Grid>

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

            <Text fontSize="sm" fontWeight="semibold" color="gray.700" pt={2}>
              Address
            </Text>

            <Field label="Street Address">
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                size="md"
                borderRadius="lg"
              />
            </Field>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Field label="City">
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  size="md"
                  borderRadius="lg"
                />
              </Field>

              <Field label="State/Province">
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  size="md"
                  borderRadius="lg"
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
                  borderRadius="lg"
                />
              </Field>

              <Field label="Country">
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  size="md"
                  borderRadius="lg"
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
              <Button variant="outline" size="md" onClick={loadOrganization}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorPalette="blue"
                size="md"
                loading={isSaving}
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

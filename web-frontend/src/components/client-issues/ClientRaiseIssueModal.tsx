import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
} from '@chakra-ui/react';
import CustomSelect from '@/components/ui/CustomSelect';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import type { ClientRaiseIssueData, IssuePriority, IssueCategory } from '@/types';
import { vendorService } from '@/features/vendors/services/vendor.service';
import { orderService } from '@/features/orders/services/order.service';
import { organizationService } from '@/services/organization.service';
import { useAuth } from '@/hooks/useAuth';

interface ClientRaiseIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientRaiseIssueData) => void;
  isLoading?: boolean;
}

const ClientRaiseIssueModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ClientRaiseIssueModalProps) => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Array<{ id: number; name: string }>>([]);
  const [vendors, setVendors] = useState<Array<{ id: number; name: string }>>([]);
  const [orders, setOrders] = useState<Array<{ id: number; order_number: string }>>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // Auto-fill organization from user's primary organization
  const userOrganizationId = (user as any)?.primaryOrganizationId || 0;

  const [formData, setFormData] = useState<ClientRaiseIssueData>({
    organization: userOrganizationId,
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    vendor: null,
    order: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClientRaiseIssueData, string>>>({});

  // Fetch all organizations from the database
  // Customers should see all organizations when raising issues
  useEffect(() => {
    if (isOpen && user) {
      setLoadingOrgs(true);
      console.log('📋 Fetching all organizations from database for user:', user.email);
      
      // Fetch all organizations from the API
      organizationService.getAllOrganizations()
        .then((orgs) => {
          console.log('✅ Fetched all organizations:', orgs);
          const orgList = orgs.map(org => ({
            id: org.id,
            name: org.name || `Organization #${org.id}`
          }));
          setOrganizations(orgList);
          
          // Auto-select user's primary organization if available
          if (userOrganizationId && orgList.some(org => org.id === userOrganizationId)) {
            setFormData(prev => ({
              ...prev,
              organization: userOrganizationId
            }));
          } else if (orgList.length > 0) {
            // If user's primary org not in list, select first available
            setFormData(prev => ({
              ...prev,
              organization: orgList[0].id
            }));
          }
          
          setLoadingOrgs(false);
        })
        .catch((error) => {
          console.error('❌ Error fetching organizations:', error);
          setLoadingOrgs(false);
          // Fallback to empty list or user's organizations
          setOrganizations([]);
        });
    }
  }, [isOpen, user, userOrganizationId]);

  // Fetch vendors when organization is selected
  useEffect(() => {
    if (formData.organization) {
      vendorService.getAll({ organization: formData.organization } as any)
        .then((response: any) => {
          const vendorList = response.results.map((vendor: any) => ({
            id: vendor.id,
            name: vendor.name || `Vendor #${vendor.id}`,
          }));
          setVendors(vendorList);
        })
        .catch((error: any) => {
          console.error('Failed to fetch vendors:', error);
        });

      // Fetch orders
      orderService.getAll({ organization: formData.organization } as any)
        .then((response: any) => {
          const orderList = response.results.map((order: any) => ({
            id: order.id,
            order_number: order.order_number || `Order #${order.id}`,
          }));
          setOrders(orderList);
        })
        .catch((error: any) => {
          console.error('Failed to fetch orders:', error);
        });
    } else {
      setVendors([]);
      setOrders([]);
    }
  }, [formData.organization]);

  const handleChange = (field: keyof ClientRaiseIssueData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClientRaiseIssueData, string>> = {};

    if (!formData.organization) {
      newErrors.organization = 'Organization is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('🚀 Submitting issue:', formData);
    console.log('👤 User organization ID:', userOrganizationId);
    
    if (validate()) {
      console.log('✅ Validation passed, calling onSubmit...');
      onSubmit(formData);
    } else {
      console.log('❌ Validation failed:', errors);
    }
  };

  const handleClose = () => {
    setFormData({
      organization: userOrganizationId,
      title: '',
      description: '',
      priority: 'medium',
      category: 'quality',
      vendor: null,
      order: null,
    });
    setErrors({});
    onClose();
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && handleClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise Issue</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            <Field label="Organization" required invalid={!!errors.organization} errorText={errors.organization}>
              <VStack align="stretch" gap={2}>
                <CustomSelect
                  value={formData.organization.toString()}
                  onChange={(value) => handleChange('organization', Number(value))}
                  options={[
                    { value: '0', label: loadingOrgs ? 'Loading organizations...' : 'Select Organization' },
                    ...organizations.map(org => ({ value: org.id.toString(), label: org.name }))
                  ]}
                  placeholder="Select Organization"
                />
                <Text fontSize="xs" color="gray.500">
                  {organizations.length === 0 && !loadingOrgs 
                    ? 'No organizations available. You need to be part of an organization to raise issues.'
                    : 'Select the organization you want to raise an issue about'}
                </Text>
              </VStack>
            </Field>

            <Field label="Title" required invalid={!!errors.title} errorText={errors.title}>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Brief description of the issue"
              />
            </Field>

            <Field label="Description" required invalid={!!errors.description} errorText={errors.description}>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed description of the issue"
                rows={4}
              />
            </Field>

            <HStack gap={4}>
              <Field label="Priority" required invalid={!!errors.priority} errorText={errors.priority} flex={1}>
                <CustomSelect
                  value={formData.priority}
                  onChange={(value) => handleChange('priority', value as IssuePriority)}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'critical', label: 'Critical' },
                  ]}
                />
              </Field>

              <Field label="Category" required invalid={!!errors.category} errorText={errors.category} flex={1}>
                <CustomSelect
                  value={formData.category}
                  onChange={(value) => handleChange('category', value as IssueCategory)}
                  options={[
                    { value: 'general', label: 'General' },
                    { value: 'quality', label: 'Quality' },
                    { value: 'delivery', label: 'Delivery' },
                    { value: 'billing', label: 'Billing/Payment' },
                    { value: 'communication', label: 'Communication' },
                    { value: 'technical', label: 'Technical' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </Field>
            </HStack>

            {formData.organization > 0 && (
              <>
                <Field label="Vendor (Optional)">
                  <CustomSelect
                    value={formData.vendor?.toString() || ''}
                    onChange={(value) => handleChange('vendor', value ? Number(value) : null)}
                    options={[
                      { value: '', label: 'No specific vendor' },
                      ...vendors.map(v => ({ value: v.id.toString(), label: v.name }))
                    ]}
                    placeholder="No specific vendor"
                  />
                </Field>

                <Field label="Related Order (Optional)">
                  <CustomSelect
                    value={formData.order?.toString() || ''}
                    onChange={(value) => handleChange('order', value ? Number(value) : null)}
                    options={[
                      { value: '', label: 'No related order' },
                      ...orders.map(o => ({ value: o.id.toString(), label: o.order_number }))
                    ]}
                    placeholder="No related order"
                  />
                </Field>
              </>
            )}

            <Box bg="blue.50" p={3} borderRadius="md">
              <Text fontSize="sm" color="blue.800">
                <strong>Note:</strong> This issue will be sent to the selected organization. 
                Vendors and employees of that organization will be able to view and resolve it.
              </Text>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button colorScheme="blue" onClick={handleSubmit} loading={isLoading}>
            Raise Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default ClientRaiseIssueModal;

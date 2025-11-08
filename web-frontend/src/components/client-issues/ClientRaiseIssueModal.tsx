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
import { vendorService } from '@/services/vendor.service';
import { orderService } from '@/services/order.service';

interface Organization {
  id: number;
  name: string;
}

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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [vendors, setVendors] = useState<Array<{ id: number; name: string }>>([]);
  const [orders, setOrders] = useState<Array<{ id: number; order_number: string }>>([]);

  const [formData, setFormData] = useState<ClientRaiseIssueData>({
    organization: 0,
    title: '',
    description: '',
    priority: 'medium',
    category: 'quality',
    vendor: null,
    order: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClientRaiseIssueData, string>>>({});

  // Fetch organizations (vendors the client is associated with)
  useEffect(() => {
    if (isOpen) {
      vendorService.getAll()
        .then((response: any) => {
          const orgs = response.results.map((vendor: any) => ({
            id: vendor.organization || vendor.id,
            name: vendor.organization_name || vendor.name || `Vendor #${vendor.id}`,
          }));
          setOrganizations(orgs);
        })
        .catch((error: any) => {
          console.error('Failed to fetch organizations:', error);
        });
    }
  }, [isOpen]);

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
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      organization: 0,
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
              <CustomSelect
                value={formData.organization.toString()}
                onChange={(value) => handleChange('organization', Number(value))}
                options={[
                  { value: '0', label: 'Select Organization' },
                  ...organizations.map(org => ({ value: org.id.toString(), label: org.name }))
                ]}
                placeholder="Select Organization"
              />
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
                    { value: 'quality', label: 'Quality' },
                    { value: 'delivery', label: 'Delivery' },
                    { value: 'payment', label: 'Payment' },
                    { value: 'communication', label: 'Communication' },
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

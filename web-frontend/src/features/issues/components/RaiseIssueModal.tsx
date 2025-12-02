import { useState } from 'react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
} from '@/components/ui/dialog';
import { Button, Input, Textarea, VStack, Box, HStack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';

interface RaiseIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const RaiseIssueModal = ({ isOpen, onClose, onSubmit, isLoading }: RaiseIssueModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'high',
    category: 'other',
    auto_sync_linear: true,
    linear_team_id: 'b95250db-8430-4dbc-88f8-9fc109369df0', // Default team ID
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      priority: 'high',
      category: 'other',
      auto_sync_linear: true,
      linear_team_id: 'b95250db-8430-4dbc-88f8-9fc109369df0',
    });
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise Issue</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            <Field label="Title" required>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter issue title"
              />
            </Field>

            <Field label="Description">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the issue in detail..."
                rows={5}
              />
            </Field>

            <HStack gap={4}>
              <Field label="Priority" flex="1">
                <Box>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </Box>
              </Field>

              <Field label="Category" flex="1">
                <Box>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <option value="quality">Quality</option>
                    <option value="delivery">Delivery</option>
                    <option value="payment">Payment</option>
                    <option value="communication">Communication</option>
                    <option value="other">Other</option>
                  </select>
                </Box>
              </Field>
            </HStack>

            <Box p={3} bg="blue.50" borderRadius="md">
              <Checkbox
                checked={formData.auto_sync_linear}
                onCheckedChange={(e) =>
                  setFormData({ ...formData, auto_sync_linear: !!e.checked })
                }
              >
                Auto-sync to Linear (recommended)
              </Checkbox>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            colorPalette="red"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!formData.title}
          >
            Raise Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default RaiseIssueModal;

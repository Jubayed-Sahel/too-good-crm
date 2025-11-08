import { useState } from 'react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
} from '../ui/dialog';
import { Button, Input, Textarea, VStack, Box } from '@chakra-ui/react';
import { Field } from '../ui/field';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const CreateIssueModal = ({ isOpen, onClose, onSubmit, isLoading }: CreateIssueModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
    status: 'open',
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'other',
      status: 'open',
    });
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
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
                placeholder="Describe the issue..."
                rows={4}
              />
            </Field>

            <Field label="Priority">
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

            <Field label="Category">
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
          </VStack>
        </DialogBody>

        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            colorPalette="purple"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!formData.title}
          >
            Create Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default CreateIssueModal;

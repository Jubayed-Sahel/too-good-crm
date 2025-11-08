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
import { Button, Textarea, VStack, Text, Badge, Box, HStack } from '@chakra-ui/react';
import { Field } from '../ui/field';
import type { Issue } from '@/types';

interface ResolveIssueModalProps {
  isOpen: boolean;
  issue: Issue;
  onClose: () => void;
  onSubmit: (issueId: number, resolutionNotes: string) => void;
  isLoading?: boolean;
}

const ResolveIssueModal = ({ isOpen, issue, onClose, onSubmit, isLoading }: ResolveIssueModalProps) => {
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleSubmit = () => {
    onSubmit(issue.id, resolutionNotes);
    setResolutionNotes('');
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Issue</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            <Box p={4} bg="gray.50" borderRadius="md">
              <VStack align="stretch" gap={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                    Issue #{issue.issue_number}
                  </Text>
                  <Badge colorPalette="orange" size="sm">
                    {issue.status.toUpperCase()}
                  </Badge>
                </HStack>
                <Text fontWeight="semibold">{issue.title}</Text>
                <Text fontSize="sm" color="gray.600">
                  {issue.description}
                </Text>
              </VStack>
            </Box>

            <Field label="Resolution Notes" helperText="Describe how the issue was resolved">
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter resolution details..."
                rows={5}
              />
            </Field>

            {(issue as any).linear_issue_url && (
              <Box p={3} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" color="blue.700">
                  ℹ️ This issue will be updated in Linear as well
                </Text>
              </Box>
            )}
          </VStack>
        </DialogBody>

        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            colorPalette="green"
            onClick={handleSubmit}
            loading={isLoading}
          >
            Resolve Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default ResolveIssueModal;

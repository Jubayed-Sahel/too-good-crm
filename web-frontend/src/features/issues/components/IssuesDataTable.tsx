import { Table, Badge, Button, HStack, Text, Box } from '@chakra-ui/react';
import { FiEye, FiEdit, FiCheckCircle, FiTrash2, FiExternalLink, FiDownload } from 'react-icons/fi';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { usePermissions } from '@/contexts/PermissionContext';
import type { Issue, IssueStatus } from '@/types';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

interface IssuesDataTableProps {
  issues: Issue[];
  onView: (issue: Issue) => void;
  onEdit: (issue: Issue) => void;
  onResolve: (issue: Issue) => void;
  onDelete: (issueId: number) => void;
  onUpdateStatus: (issueId: number, status: IssueStatus) => void;
  onBulkDelete?: (issueIds: number[]) => void;
  onBulkExport?: (issueIds: number[]) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'green';
    default:
      return 'gray';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'orange';
    case 'in_progress':
      return 'blue';
    case 'resolved':
      return 'green';
    case 'closed':
      return 'gray';
    default:
      return 'gray';
  }
};

const IssuesDataTable = ({
  issues,
  onView,
  onEdit,
  onResolve,
  onDelete,
  onBulkDelete,
  onBulkExport,
}: IssuesDataTableProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { canAccess } = usePermissions();
  
  // Check permissions for each action (using singular 'issue')
  const canView = canAccess('issue', 'read');
  const canEdit = canAccess('issue', 'update');
  const canDelete = canAccess('issue', 'delete');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(issues.map((issue) => issue.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (issueId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, issueId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== issueId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      onBulkDelete?.(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.length > 0) {
      onBulkExport?.(selectedIds);
    }
  };

  const isAllSelected = issues.length > 0 && selectedIds.length === issues.length;

  return (
    <Box
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      overflow="hidden"
    >
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <Box bg="purple.50" px={4} py={3} borderBottomWidth="1px" borderColor="purple.200">
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium" color="purple.900">
              {selectedIds.length} {selectedIds.length === 1 ? 'issue' : 'issues'} selected
            </Text>
            <HStack gap={2}>
              {onBulkExport && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="purple"
                  onClick={handleBulkExport}
                >
                  <FiDownload />
                  <Text ml={2}>Export</Text>
                </Button>
              )}
              {onBulkDelete && (
                <Button
                  size="sm"
                  colorPalette="red"
                  onClick={handleBulkDelete}
                >
                  <FiTrash2 />
                  <Text ml={2}>Delete</Text>
                </Button>
              )}
            </HStack>
          </HStack>
        </Box>
      )}

      <Box overflowX="auto">
        <Table.Root size="sm" variant="line">
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader width="40px">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(e) => handleSelectAll(e.checked as boolean)}
                  aria-label="Select all issues"
                />
              </Table.ColumnHeader>
              <Table.ColumnHeader>Issue #</Table.ColumnHeader>
              <Table.ColumnHeader>Title</Table.ColumnHeader>
              <Table.ColumnHeader>Source</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Priority</Table.ColumnHeader>
              <Table.ColumnHeader>Category</Table.ColumnHeader>
              <Table.ColumnHeader>Vendor</Table.ColumnHeader>
              <Table.ColumnHeader>Created</Table.ColumnHeader>
              <Table.ColumnHeader>Linear</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {issues.map((issue) => (
              <Table.Row key={issue.id} _hover={{ bg: 'gray.50' }}>
                <Table.Cell>
                  <Checkbox
                    checked={selectedIds.includes(issue.id)}
                    onCheckedChange={(e) => handleSelectOne(issue.id, e.checked as boolean)}
                    aria-label={`Select issue ${issue.issue_number}`}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="semibold" color="purple.600">
                    {issue.issue_number}
                  </Text>
                </Table.Cell>
                <Table.Cell maxW="300px">
                  <Text fontSize="sm" overflow="hidden" textOverflow="ellipsis">
                    {issue.title}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  {(issue as any).is_client_issue ? (
                    <Badge colorPalette="purple" size="sm">
                      Client
                    </Badge>
                  ) : (
                    <Badge colorPalette="gray" size="sm" variant="subtle">
                      Internal
                    </Badge>
                  )}
                  {(issue as any).is_client_issue && (issue as any).raised_by_customer_name && (
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      {(issue as any).raised_by_customer_name}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={getStatusColor(issue.status)} size="sm">
                    {issue.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={getPriorityColor(issue.priority)} size="sm">
                    {issue.priority.toUpperCase()}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" textTransform="capitalize">
                    {issue.category}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm">{issue.vendor_name || `Vendor #${issue.vendor}`}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(issue.created_at)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  {(issue as any).linear_issue_url ? (
                    <a
                      href={(issue as any).linear_issue_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="blue"
                      >
                        <FiExternalLink />
                        <Text ml={1}>View</Text>
                      </Button>
                    </a>
                  ) : (
                    <Text fontSize="xs" color="gray.400">
                      Not synced
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <HStack justify="flex-end" gap={1}>
                    {canView && (
                      <Button
                        onClick={() => onView(issue)}
                        size="xs"
                        variant="ghost"
                        colorPalette="gray"
                      >
                        <FiEye />
                      </Button>
                    )}
                    {canEdit && (
                      <Button
                        onClick={() => onEdit(issue)}
                        size="xs"
                        variant="ghost"
                        colorPalette="blue"
                      >
                        <FiEdit />
                      </Button>
                    )}
                    {canEdit && issue.status !== 'resolved' && issue.status !== 'closed' && (
                      <Button
                        onClick={() => onResolve(issue)}
                        size="xs"
                        variant="ghost"
                        colorPalette="green"
                      >
                        <FiCheckCircle />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        onClick={() => onDelete(issue.id)}
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                      >
                        <FiTrash2 />
                      </Button>
                    )}
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {issues.length === 0 && (
        <Box p={8} textAlign="center">
          <Text color="gray.500">No issues to display</Text>
        </Box>
      )}
    </Box>
  );
};

export default IssuesDataTable;

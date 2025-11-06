import {
  Table,
  Badge,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
  Box,
  Flex,
} from '@chakra-ui/react';
import { Checkbox } from '../ui/checkbox';
import { FiEdit, FiTrash2, FiEye, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import { Card } from '../common';
import { ResponsiveTable } from '../common';
import { useState } from 'react';
import type { Employee } from '@/services';
import { ManageRoleDialog } from './ManageRoleDialog';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onView?: (employee: Employee) => void;
  onBulkDelete?: (employeeIds: string[]) => void;
  onBulkExport?: (employeeIds: string[]) => void;
  onRoleUpdate?: () => void;
}

const EmployeeTable = ({ 
  employees, 
  onEdit, 
  onDelete, 
  onView, 
  onBulkDelete, 
  onBulkExport,
  onRoleUpdate
}: EmployeeTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(employees.map(e => e.id.toString()));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} employee(s)?`)) {
      onBulkDelete?.(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    onBulkExport?.(selectedIds);
  };

  const handleManageRole = (employee: Employee) => {
    setSelectedEmployee(employee);
    setRoleDialogOpen(true);
  };

  const handleRoleDialogClose = () => {
    setRoleDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleRoleUpdateSuccess = () => {
    onRoleUpdate?.();
  };

  const isAllSelected = selectedIds.length === employees.length && employees.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'on-leave':
        return 'yellow';
      case 'terminated':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (employees.length === 0) {
    return (
      <Card p={6}>
        <VStack gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">No employees found</Text>
          <Text color="gray.600">Try adjusting your filters or invite a new employee.</Text>
        </VStack>
      </Card>
    );
  }

  // Mobile Card View
  const MobileView = () => (
    <VStack gap={3} align="stretch">
      {employees.map((employee) => (
        <Card key={employee.id} p={4}>
          <VStack align="stretch" gap={3}>
            {/* Header */}
            <Flex justify="space-between" align="start">
              <VStack align="start" gap={1} flex={1}>
                <Text fontWeight="bold" fontSize="md" color="gray.900">
                  {employee.first_name} {employee.last_name}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {employee.job_title || 'No Job Title'}
                </Text>
              </VStack>
              
              <Badge
                colorPalette={getStatusColor(employee.status)}
                borderRadius="full"
                px={3}
                py={1}
                textTransform="capitalize"
                fontSize="xs"
              >
                {employee.status.replace('-', ' ')}
              </Badge>
            </Flex>

            {/* Contact Info */}
            <VStack align="stretch" gap={2}>
              <HStack gap={2}>
                <FiMail size={14} color="#718096" />
                <Text fontSize="sm" color="gray.600">
                  {employee.email}
                </Text>
              </HStack>
              {employee.phone && (
                <HStack gap={2}>
                  <FiPhone size={14} color="#718096" />
                  <Text fontSize="sm" color="gray.600">
                    {employee.phone}
                  </Text>
                </HStack>
              )}
              {employee.department && (
                <HStack gap={2}>
                  <FiUser size={14} color="#718096" />
                  <Text fontSize="sm" color="gray.600">
                    {employee.department}
                  </Text>
                </HStack>
              )}
            </VStack>

            {/* Stats */}
            <Flex justify="space-between" pt={2} borderTopWidth="1px" borderColor="gray.100">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="gray.500">Employee ID</Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                  {employee.code}
                </Text>
              </VStack>
              <VStack align="end" gap={0}>
                <Text fontSize="xs" color="gray.500">Department</Text>
                <Text fontSize="sm" color="gray.600">
                  {employee.department || 'N/A'}
                </Text>
              </VStack>
            </Flex>

            {/* Actions */}
            {(onView || onEdit || onDelete) && (
              <HStack gap={2} pt={2} borderTopWidth="1px" borderColor="gray.100">
                {onView && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="purple"
                    flex={1}
                    onClick={() => onView(employee)}
                  >
                    <FiEye size={16} />
                    <Box ml={2}>View</Box>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="purple"
                  flex={1}
                  onClick={() => handleManageRole(employee)}
                >
                  <FiUser size={16} />
                  <Box ml={2}>Role</Box>
                </Button>
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="blue"
                    flex={1}
                    onClick={() => onEdit(employee)}
                  >
                    <FiEdit size={16} />
                    <Box ml={2}>Edit</Box>
                  </Button>
                )}
                {onDelete && (
                  <IconButton
                    aria-label="Delete"
                    size="sm"
                    variant="outline"
                    colorPalette="red"
                    onClick={() => onDelete(employee)}
                  >
                    <FiTrash2 size={16} />
                  </IconButton>
                )}
              </HStack>
            )}
          </VStack>
        </Card>
      ))}
    </VStack>
  );

  // Desktop Table View
  const DesktopView = () => (
    <Card p={0} overflow="hidden">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && onBulkDelete && (
        <Box bg="purple.50" borderBottomWidth="1px" borderColor="purple.200" px={4} py={3}>
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <Text fontSize="sm" fontWeight="medium" color="purple.900">
              {selectedIds.length} employee(s) selected
            </Text>
            <HStack gap={2}>
              {onBulkExport && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="purple"
                  onClick={handleBulkExport}
                >
                  Export Selected
                </Button>
              )}
              <Button
                size="sm"
                variant="solid"
                colorPalette="red"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </HStack>
          </HStack>
        </Box>
      )}
      
      <Box overflowX="auto">
        <Table.Root size="sm" variant="line">
          <Table.Header>
            <Table.Row bg="gray.50">
              {onBulkDelete && (
                <Table.ColumnHeader px={4} py={3} width="50px">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(details) => handleSelectAll(details.checked as boolean)}
                  />
                </Table.ColumnHeader>
              )}
              <Table.ColumnHeader>Employee</Table.ColumnHeader>
              <Table.ColumnHeader>Job Title</Table.ColumnHeader>
              <Table.ColumnHeader>Role</Table.ColumnHeader>
              <Table.ColumnHeader>Contact</Table.ColumnHeader>
              <Table.ColumnHeader>Department</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Employee ID</Table.ColumnHeader>
              {(onView || onEdit || onDelete) && (
                <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {employees.map((employee) => (
              <Table.Row key={employee.id} _hover={{ bg: 'gray.50' }}>
                {onBulkDelete && (
                  <Table.Cell px={4} py={3}>
                    <Checkbox
                      checked={selectedIds.includes(employee.id.toString())}
                      onCheckedChange={(details) => 
                        handleSelectOne(employee.id.toString(), details.checked as boolean)
                      }
                    />
                  </Table.Cell>
                )}
                <Table.Cell>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                    {employee.first_name} {employee.last_name}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {employee.job_title || 'No Job Title'}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette="purple"
                    variant="subtle"
                    fontSize="xs"
                  >
                    {employee.role_name || 'No Role'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="flex-start" gap={0}>
                    <HStack gap={1}>
                      <FiMail size={12} color="#718096" />
                      <Text fontSize="sm" color="gray.600">
                        {employee.email}
                      </Text>
                    </HStack>
                    {employee.phone && (
                      <HStack gap={1}>
                        <FiPhone size={12} color="#718096" />
                        <Text fontSize="xs" color="gray.500">
                          {employee.phone}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {employee.department || 'N/A'}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette={getStatusColor(employee.status)}
                    borderRadius="full"
                    px={3}
                    py={1}
                    textTransform="capitalize"
                    fontSize="xs"
                  >
                    {employee.status.replace('-', ' ')}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.600">
                    {employee.code}
                  </Text>
                </Table.Cell>
                {(onView || onEdit || onDelete) && (
                  <Table.Cell>
                    <HStack gap={1} justify="center">
                      {onView && (
                        <IconButton
                          aria-label="View employee"
                          size="sm"
                          variant="ghost"
                          colorPalette="purple"
                          onClick={() => onView(employee)}
                        >
                          <FiEye size={16} />
                        </IconButton>
                      )}
                      <IconButton
                        aria-label="Manage role"
                        size="sm"
                        variant="ghost"
                        colorPalette="purple"
                        onClick={() => handleManageRole(employee)}
                      >
                        <FiUser size={16} />
                      </IconButton>
                      {onEdit && (
                        <IconButton
                          aria-label="Edit employee"
                          size="sm"
                          variant="ghost"
                          colorPalette="blue"
                          onClick={() => onEdit(employee)}
                        >
                          <FiEdit size={16} />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton
                          aria-label="Delete employee"
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => onDelete(employee)}
                        >
                          <FiTrash2 size={16} />
                        </IconButton>
                      )}
                    </HStack>
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Card>
  );

  return (
    <>
      <ResponsiveTable mobileView={<MobileView />}>
        <DesktopView />
      </ResponsiveTable>
      
      <ManageRoleDialog
        isOpen={roleDialogOpen}
        onClose={handleRoleDialogClose}
        employee={selectedEmployee}
        onSuccess={handleRoleUpdateSuccess}
      />
    </>
  );
};

export default EmployeeTable;

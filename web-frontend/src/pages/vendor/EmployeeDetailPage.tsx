import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Heading, Text, VStack, HStack, Badge, Spinner } from '@chakra-ui/react';
import { FiArrowLeft, FiEdit, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser } from 'react-icons/fi';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card, StandardButton } from '../../components/common';
import { employeeService, type Employee } from '@/services';
import { toaster } from '@/components/ui/toaster';

const EmployeeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Fetch employee directly from database
  // Always fetch when component mounts or id changes to ensure fresh data from database
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        setError(new Error('Employee ID is missing'));
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('📥 Fetching employee from database:', id);
        const employeeData = await employeeService.getEmployee(parseInt(id));
        console.log('✅ Employee fetched from database:', employeeData);
        setEmployee(employeeData);
      } catch (err: any) {
        console.error('❌ Error fetching employee:', err);
        const errorMessage = err?.response?.data?.detail 
          || err?.response?.data?.error
          || err?.message 
          || 'Failed to fetch employee';
        setError(new Error(errorMessage));
        toaster.create({
          title: 'Error Loading Employee',
          description: errorMessage,
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Always fetch from database when component mounts or id changes
    // This ensures we get the latest data, not cached data
    fetchEmployee();
  }, [id]);

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

  if (isLoading) {
    return (
      <DashboardLayout title="Employee Details">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="purple.500" />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || (!isLoading && !employee)) {
    return (
      <DashboardLayout title="Employee Details">
        <Card p={8} textAlign="center">
          <Heading size="md" color="red.600" mb={2}>
            Employee Not Found
          </Heading>
          <Text color="gray.500" mb={4}>
            {error?.message || "The employee you're looking for doesn't exist."}
          </Text>
          <StandardButton
            variant="primary"
            onClick={() => navigate('/employees')}
            leftIcon={<FiArrowLeft />}
          >
            Back to Employees
          </StandardButton>
        </Card>
      </DashboardLayout>
    );
  }
  
  if (!employee) {
    return null;
  }

  return (
    <DashboardLayout title="Employee Details">
      <VStack gap={5} align="stretch">
        {/* Header with Back Button */}
        <Card p={4}>
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <HStack gap={3}>
              <StandardButton
                variant="ghost"
                onClick={() => navigate('/employees')}
                leftIcon={<FiArrowLeft />}
              >
                Back
              </StandardButton>
              <Box>
                <Heading size="lg" color="gray.900">
                  {employee.first_name} {employee.last_name}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {employee.job_title || 'No Job Title'}
                </Text>
              </Box>
            </HStack>
            <HStack gap={2}>
              <Badge
                colorPalette={getStatusColor(employee.status)}
                variant="subtle"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
                textTransform="capitalize"
              >
                {employee.status.replace('-', ' ')}
              </Badge>
              <StandardButton
                variant="primary"
                onClick={() => navigate(`/employees/${employee.id}/edit`)}
                leftIcon={<FiEdit />}
              >
                Edit Employee
              </StandardButton>
            </HStack>
          </HStack>
        </Card>

        {/* Main Content Grid */}
        <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={5}>
          {/* Contact Information */}
          <Card p={6}>
            <Heading size="md" mb={4} color="gray.900">
              Contact Information
            </Heading>
            <VStack align="stretch" gap={4}>
              <HStack gap={3}>
                <Box color="purple.500">
                  <FiMail size={20} />
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Email
                  </Text>
                  <Text fontSize="md" color="gray.900">
                    {employee.email}
                  </Text>
                </Box>
              </HStack>

              {employee.phone && (
                <HStack gap={3}>
                  <Box color="purple.500">
                    <FiPhone size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Phone
                    </Text>
                    <Text fontSize="md" color="gray.900">
                      {employee.phone}
                    </Text>
                  </Box>
                </HStack>
              )}

              {(employee.address || employee.city || employee.state) && (
                <HStack gap={3} alignItems="start">
                  <Box color="purple.500" mt={1}>
                    <FiMapPin size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Address
                    </Text>
                    <Text fontSize="md" color="gray.900">
                      {employee.address && `${employee.address}`}
                      {employee.city && `, ${employee.city}`}
                      {employee.state && `, ${employee.state}`}
                      {employee.zip_code && ` ${employee.zip_code}`}
                      {employee.country && `, ${employee.country}`}
                    </Text>
                  </Box>
                </HStack>
              )}

              {employee.emergency_contact && (
                <HStack gap={3}>
                  <Box color="purple.500">
                    <FiPhone size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Emergency Contact
                    </Text>
                    <Text fontSize="md" color="gray.900">
                      {employee.emergency_contact}
                    </Text>
                  </Box>
                </HStack>
              )}
            </VStack>
          </Card>

          {/* Employment Details */}
          <Card p={6}>
            <Heading size="md" mb={4} color="gray.900">
              Employment Details
            </Heading>
            <VStack align="stretch" gap={4}>
              <HStack gap={3}>
                <Box color="purple.500">
                  <FiUser size={20} />
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Employee ID
                  </Text>
                  <Text fontSize="md" color="gray.900">
                    {employee.code}
                  </Text>
                </Box>
              </HStack>

              {employee.job_title && (
                <HStack gap={3}>
                  <Box color="purple.500">
                    <FiUser size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Job Title
                    </Text>
                    <Text fontSize="md" color="gray.900">
                      {employee.job_title}
                    </Text>
                  </Box>
                </HStack>
              )}

              {employee.role_name && (
                <HStack gap={3}>
                  <Box color="purple.500">
                    <FiUser size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Role
                    </Text>
                    <Badge colorPalette="purple" variant="subtle">
                      {employee.role_name}
                    </Badge>
                  </Box>
                </HStack>
              )}

              {employee.department && (
                <HStack gap={3}>
                  <Box color="purple.500">
                    <FiUser size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Department
                    </Text>
                    <Text fontSize="md" color="gray.900">
                      {employee.department}
                    </Text>
                  </Box>
                </HStack>
              )}

              {employee.employment_type && (
                <HStack gap={3}>
                  <Box color="purple.500">
                    <FiCalendar size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Employment Type
                    </Text>
                    <Text fontSize="md" color="gray.900" textTransform="capitalize">
                      {employee.employment_type.replace('-', ' ')}
                    </Text>
                  </Box>
                </HStack>
              )}

              {employee.hire_date && (
                <HStack gap={3}>
                  <Box color="purple.500">
                    <FiCalendar size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Hire Date
                    </Text>
                    <Text fontSize="md" color="gray.900">
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </Text>
                  </Box>
                </HStack>
              )}

              {employee.termination_date && (
                <HStack gap={3}>
                  <Box color="purple.500">
                    <FiCalendar size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Termination Date
                    </Text>
                    <Text fontSize="md" color="gray.900">
                      {new Date(employee.termination_date).toLocaleDateString()}
                    </Text>
                  </Box>
                </HStack>
              )}
            </VStack>
          </Card>
        </Box>

        {/* Additional Information */}
        <Card p={6}>
          <Heading size="md" mb={4} color="gray.900">
            Additional Information
          </Heading>
          <Box display="grid" gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <Box>
              <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                Created At
              </Text>
              <Text fontSize="md" color="gray.900">
                {new Date(employee.created_at).toLocaleDateString()}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={1}>
                Last Updated
              </Text>
              <Text fontSize="md" color="gray.900">
                {new Date(employee.updated_at).toLocaleDateString()}
              </Text>
            </Box>
          </Box>
        </Card>
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeDetailPage;

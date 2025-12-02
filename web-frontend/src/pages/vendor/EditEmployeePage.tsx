import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import CustomSelect from '@/components/ui/CustomSelect';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/common';
import { toaster } from '@/components/ui/toaster';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { employeeService } from '@/services';

const employmentTypeOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
];

const EditEmployeePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employees, isLoading, refetch } = useEmployees();

  const employee = employees.find(emp => emp.id === Number(id));

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    department: '',
    employment_type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'intern',
    status: 'active' as 'active' | 'inactive' | 'on-leave' | 'terminated',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    emergency_contact: '',
    hire_date: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        job_title: employee.job_title || '',
        department: employee.department || '',
        employment_type: employee.employment_type || 'full-time',
        status: employee.status || 'active',
        address: employee.address || '',
        city: employee.city || '',
        state: employee.state || '',
        zip_code: employee.zip_code || '',
        country: employee.country || '',
        emergency_contact: employee.emergency_contact || '',
        hire_date: employee.hire_date || '',
      });
    }
  }, [employee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submitted', { id, formData });
    
    if (!id) {
      toaster.create({
        title: 'Error',
        description: 'Employee ID is missing.',
        type: 'error',
      });
      return;
    }
    
    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      toaster.create({
        title: 'Validation Error',
        description: 'Please fill in all required fields (First Name, Last Name, Email).',
        type: 'error',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare data - convert empty strings to null for optional fields
      const updateData: any = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        job_title: formData.job_title?.trim() || null,
        department: formData.department?.trim() || null,
        employment_type: formData.employment_type,
        status: formData.status,
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        zip_code: formData.zip_code?.trim() || null,
        country: formData.country?.trim() || null,
        emergency_contact: formData.emergency_contact?.trim() || null,
        hire_date: formData.hire_date || null,
      };
      
      console.log('🚀 Updating employee with data:', { id: parseInt(id), data: updateData });
      
      const updatedEmployee = await employeeService.updateEmployee(parseInt(id), updateData);
      
      console.log('✅ Employee updated successfully:', updatedEmployee);
      
      // Show success message
      toaster.create({
        title: 'Employee updated successfully',
        description: `${formData.first_name} ${formData.last_name}'s information has been updated.`,
        type: 'success',
        duration: 3000,
      });
      
      // Navigate to team page - the TeamMembersTab will refetch automatically
      console.log('🔄 Navigating to /team');
      navigate('/team', { replace: false });
    } catch (error: any) {
      console.error('❌ Error updating employee:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
      });
      
      const errorMessage = error?.response?.data?.detail 
        || error?.response?.data?.error
        || error?.response?.data?.message
        || (error?.response?.data && typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data) 
          : null)
        || error?.message 
        || 'Failed to update employee. Please try again.';
      
      toaster.create({
        title: 'Failed to update employee',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Employee">
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="purple.500" />
        </Box>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout title="Edit Employee">
        <Card p={8} textAlign="center">
          <Heading size="md" color="red.600" mb={2}>
            Employee Not Found
          </Heading>
          <Text color="gray.500" mb={4}>
            The employee you're trying to edit doesn't exist.
          </Text>
          <Button
            colorPalette="purple"
            onClick={() => navigate('/employees')}
          >
            <FiArrowLeft />
            Back to Employees
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Employee">
      <VStack gap={5} align="stretch">
        {/* Header */}
        <Card p={4}>
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <HStack gap={3}>
              <Button
                variant="ghost"
                colorPalette="gray"
                onClick={() => navigate(`/employees/${id}`)}
              >
                <FiArrowLeft />
                Back
              </Button>
              <Box>
                <Heading size="2xl" color="gray.900">
                  Edit Employee
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Update employee information
                </Text>
              </Box>
            </HStack>
          </HStack>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <VStack gap={5} align="stretch">
            {/* Personal Information */}
            <Card p={6}>
              <Heading size="md" mb={4} color="gray.900">
                Personal Information
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    First Name *
                  </Text>
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Last Name *
                  </Text>
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Email *
                  </Text>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Phone
                  </Text>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Emergency Contact
                  </Text>
                  <Input
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    placeholder="Enter emergency contact"
                  />
                </VStack>
              </SimpleGrid>
            </Card>

            {/* Employment Details */}
            <Card p={6}>
              <Heading size="md" mb={4} color="gray.900">
                Employment Details
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Job Title
                  </Text>
                  <Input
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    placeholder="Enter job title"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Department
                  </Text>
                  <Input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Employment Type
                  </Text>
                  <CustomSelect
                    options={employmentTypeOptions}
                    value={formData.employment_type}
                    onChange={(value: string) => setFormData({ ...formData, employment_type: value as any })}
                    placeholder="Select employment type"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Status
                  </Text>
                  <CustomSelect
                    options={statusOptions}
                    value={formData.status}
                    onChange={(value: string) => setFormData({ ...formData, status: value as any })}
                    placeholder="Select status"
                  />
                </VStack>

                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Hire Date
                  </Text>
                  <Input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleChange}
                  />
                </VStack>
              </SimpleGrid>
            </Card>

            {/* Address Information */}
            <Card p={6}>
              <Heading size="md" mb={4} color="gray.900">
                Address Information
              </Heading>
              <VStack gap={4} align="stretch">
                <VStack gap={1} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Street Address
                  </Text>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter street address"
                  />
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <VStack gap={1} align="stretch">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      City
                    </Text>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                    />
                  </VStack>

                  <VStack gap={1} align="stretch">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      State
                    </Text>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                    />
                  </VStack>

                  <VStack gap={1} align="stretch">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Zip Code
                    </Text>
                    <Input
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      placeholder="Enter zip code"
                    />
                  </VStack>

                  <VStack gap={1} align="stretch">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Country
                    </Text>
                    <Input
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Enter country"
                    />
                  </VStack>
                </SimpleGrid>
              </VStack>
            </Card>

            {/* Form Actions */}
            <Card p={4}>
              <HStack justify="flex-end" gap={3}>
                <Button
                  variant="outline"
                  colorPalette="gray"
                  onClick={() => navigate(`/employees/${id}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorPalette="purple"
                  loading={isSaving}
                  disabled={isSaving}
                >
                  <FiSave />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </HStack>
            </Card>
          </VStack>
        </form>
      </VStack>
    </DashboardLayout>
  );
};

export default EditEmployeePage;

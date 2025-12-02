/**
 * CRUD Testing Utility
 * Helper functions to test CRUD operations end-to-end
 */

import { customerService } from '@/features/customers/services/customer.service';
import { dealService } from '@/features/deals/services/deal.service';
import { leadService } from '@/features/leads/services/lead.service';
import { issueService } from '@/features/issues/services/issue.service';
import { activityService } from '@/features/activities/services/activity.service';

export interface CRUDTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

/**
 * Test Customer CRUD operations
 */
export async function testCustomerCRUD(): Promise<CRUDTestResult[]> {
  const results: CRUDTestResult[] = [];

  try {
    // CREATE
    const createData = {
      name: 'Test Customer CRUD',
      email: 'testcrud@example.com',
      phone: '+1234567890',
      company_name: 'Test Company CRUD',
      status: 'active' as const,
      customer_type: 'business' as const,
    };

    const created = await customerService.createCustomer(createData);
    results.push({
      success: true,
      message: 'Customer created successfully',
      data: created,
    });

    const customerId = created.id;

    // READ
    const read = await customerService.getCustomer(customerId);
    results.push({
      success: true,
      message: 'Customer read successfully',
      data: read,
    });

    // UPDATE
    const updateData = {
      name: 'Updated Test Customer CRUD',
      status: 'vip' as const,
    };
    const updated = await customerService.updateCustomer(customerId, updateData);
    results.push({
      success: true,
      message: 'Customer updated successfully',
      data: updated,
    });

    // DELETE
    await customerService.deleteCustomer(customerId);
    results.push({
      success: true,
      message: 'Customer deleted successfully',
    });

    return results;
  } catch (error: any) {
    results.push({
      success: false,
      message: 'CRUD test failed',
      error: error.message || error,
    });
    return results;
  }
}

/**
 * Test all CRUD operations for all entities
 */
export async function testAllCRUD(): Promise<Record<string, CRUDTestResult[]>> {
  return {
    customers: await testCustomerCRUD(),
    // Add other entity tests as needed
  };
}


/**
 * Form Data Transformers
 * Utilities to transform frontend form data to backend API format
 */

/**
 * Split full name into first and last name
 */
export function splitFullName(fullName: string): { first_name: string; last_name: string; name: string } {
  if (!fullName || !fullName.trim()) {
    return { first_name: '', last_name: '', name: '' };
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: '', name: parts[0] };
  }

  const first_name = parts[0];
  const last_name = parts.slice(1).join(' ');
  return { first_name, last_name, name: fullName };
}

/**
 * Transform customer form data to backend format
 */
export function transformCustomerFormData(data: any, organizationId: number) {
  const { first_name, last_name, name } = splitFullName(data.fullName || data.name || '');
  
  // Determine customer type
  const hasCompany = !!(data.company?.trim() || data.company_name?.trim());
  const customerType = data.customer_type || (hasCompany ? 'business' : 'individual');
  
  // Build name - prioritize provided name, then construct from parts, then use email, then fallback
  let customerName = name || '';
  if (!customerName && (first_name || last_name)) {
    customerName = `${first_name || ''} ${last_name || ''}`.trim();
  }
  if (!customerName && data.email) {
    customerName = data.email.split('@')[0]; // Use email username as fallback
  }
  if (!customerName) {
    customerName = 'Customer'; // Final fallback
  }

  // Don't send organization - it's set server-side from user's active profile
  // This prevents validation issues and ensures proper organization context
  const transformed: any = {
    name: customerName,
    first_name: first_name || undefined,
    last_name: last_name || undefined,
    email: data.email?.trim(),
    customer_type: customerType,
    status: data.status || 'active',
  };
  
  // Add optional fields only if they have values
  if (data.phone?.trim()) transformed.phone = data.phone.trim();
  if (hasCompany) transformed.company_name = (data.company?.trim() || data.company_name?.trim());
  if (data.address?.trim()) transformed.address = data.address.trim();
  if (data.city?.trim()) transformed.city = data.city.trim();
  if (data.state?.trim()) transformed.state = data.state.trim();
  if (data.zipCode?.trim() || data.postal_code?.trim()) transformed.postal_code = (data.zipCode?.trim() || data.postal_code?.trim());
  if (data.country?.trim()) transformed.country = data.country.trim();
  if (data.notes?.trim()) transformed.notes = data.notes.trim();
  if (data.industry?.trim()) transformed.industry = data.industry.trim();
  if (data.website?.trim()) transformed.website = data.website.trim();
  if (data.assigned_to || data.assigned_to_id) transformed.assigned_to_id = data.assigned_to || data.assigned_to_id;
  
  return transformed;
}

/**
 * Transform deal form data to backend format
 */
export function transformDealFormData(data: any, organizationId: number, stageId?: number | null) {
  return {
    organization: organizationId,
    title: data.title?.trim(),
    customer: data.customer || data.customer_id || undefined,
    value: data.value ? parseFloat(String(data.value)) : undefined,
    currency: data.currency || 'USD',
    probability: data.probability ? parseInt(String(data.probability)) : undefined,
    expected_close_date: data.expectedCloseDate || data.expected_close_date || undefined,
    description: data.description?.trim() || undefined,
    stage: stageId || data.stage_id || data.stage || undefined,
    pipeline: data.pipeline || data.pipeline_id || undefined,
    priority: data.priority || 'medium',
    assigned_to: data.assigned_to || data.assigned_to_id || undefined,
    notes: data.notes?.trim() || undefined,
    tags: data.tags || undefined,
  };
}

/**
 * Transform lead form data to backend format
 */
export function transformLeadFormData(data: any, organizationId: number) {
  return {
    organization: organizationId,
    name: data.name?.trim() || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email || 'Lead',
    first_name: data.first_name?.trim() || undefined,
    last_name: data.last_name?.trim() || undefined,
    email: data.email?.trim(),
    phone: data.phone?.trim() || undefined,
    company: data.company?.trim() || data.company_name?.trim() || undefined,
    job_title: data.job_title?.trim() || undefined,
    source: data.source || 'website',
    qualification_status: data.qualification_status || data.status || 'new',
    estimated_value: data.estimated_value ? parseFloat(String(data.estimated_value)) : undefined,
    lead_score: data.lead_score ? parseInt(String(data.lead_score)) : undefined,
    assigned_to_id: data.assigned_to || data.assigned_to_id || undefined,
    address: data.address?.trim() || undefined,
    city: data.city?.trim() || undefined,
    state: data.state?.trim() || undefined,
    postal_code: data.zipCode?.trim() || data.postal_code?.trim() || undefined,
    country: data.country?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
    campaign: data.campaign?.trim() || undefined,
    referrer: data.referrer?.trim() || undefined,
    tags: data.tags || undefined,
  };
}

/**
 * Map stage name/string to stage ID using pipeline stages
 */
export function findStageIdByName(
  stageName: string,
  stages: Array<{ id: number; name: string }>
): number | null {
  if (!stageName || !stages || stages.length === 0) {
    return null;
  }

  // If stageName is already a number, return it
  const numericId = parseInt(String(stageName));
  if (!isNaN(numericId)) {
    return numericId;
  }

  // Normalize stage name for matching
  const normalizedStageName = String(stageName).toLowerCase().trim();
  
  // Stage name mappings (frontend -> backend)
  const stageMappings: Record<string, string[]> = {
    'lead': ['lead', 'new'],
    'qualified': ['qualified', 'qualification'],
    'proposal': ['proposal', 'proposing'],
    'negotiation': ['negotiation', 'negotiating'],
    'closed-won': ['closed won', 'closed-won', 'won', 'closed'],
    'closed-lost': ['closed lost', 'closed-lost', 'lost'],
  };

  // Find matching stage
  for (const stage of stages) {
    const stageNameLower = stage.name.toLowerCase().trim();
    
    // Direct match
    if (stageNameLower === normalizedStageName) {
      return stage.id;
    }
    
    // Check mapped names
    for (const [key, variations] of Object.entries(stageMappings)) {
      if (variations.includes(normalizedStageName) && variations.some(v => stageNameLower.includes(v))) {
        return stage.id;
      }
    }
    
    // Partial match
    if (stageNameLower.includes(normalizedStageName) || normalizedStageName.includes(stageNameLower)) {
      return stage.id;
    }
  }

  return null;
}

/**
 * Clean and validate form data (remove empty strings, null values, etc.)
 */
export function cleanFormData<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Skip null, undefined, and empty strings
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}


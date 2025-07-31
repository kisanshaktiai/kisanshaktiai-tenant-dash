
import { supabase } from '@/integrations/supabase/client';

export interface LeadData {
  organization_name: string;
  organization_type: 'agri_company' | 'ngo' | 'university' | 'government' | 'cooperative' | 'other';
  contact_name: string;
  email: string;
  phone?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  expected_farmers?: number;
  budget_range?: 'under_10k' | '10k_50k' | '50k_100k' | '100k_plus';
  timeline?: 'immediate' | '1_month' | '3_months' | '6_months' | 'flexible';
  requirements?: string;
  current_solution?: string;
  how_did_you_hear?: string;
}

export interface Lead extends LeadData {
  id: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost';
  priority: 'low' | 'medium' | 'high';
  lead_source: string;
  notes?: string;
  assigned_to?: string;
  follow_up_date?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class LeadsService {
  async submitInquiry(leadData: LeadData): Promise<{ success: boolean; error?: string; lead?: Lead }> {
    try {
      // Validate required fields
      if (!leadData.organization_name.trim()) {
        return { success: false, error: 'Organization name is required' };
      }

      if (!leadData.contact_name.trim()) {
        return { success: false, error: 'Contact name is required' };
      }

      if (!leadData.email.trim()) {
        return { success: false, error: 'Email is required' };
      }

      // Validate email format
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(leadData.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Submit lead to database
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          lead_source: 'website',
          status: 'new',
          priority: 'medium'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting lead:', error);
        return { success: false, error: 'Failed to submit inquiry. Please try again.' };
      }

      // Cast the data to Lead type with proper type assertions
      const leadResult: Lead = {
        ...data,
        status: data.status as Lead['status'],
        priority: data.priority as Lead['priority'],
        organization_type: data.organization_type as Lead['organization_type'],
        company_size: data.company_size as Lead['company_size'],
        budget_range: data.budget_range as Lead['budget_range'],
        timeline: data.timeline as Lead['timeline'],
        metadata: (data.metadata || {}) as Record<string, any>
      };

      return { success: true, lead: leadResult };
    } catch (error) {
      console.error('Unexpected error submitting lead:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }

  async getLeads(): Promise<Lead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        return [];
      }

      // Cast the data to Lead[] type with proper type assertions
      return (data || []).map(lead => ({
        ...lead,
        status: lead.status as Lead['status'],
        priority: lead.priority as Lead['priority'],
        organization_type: lead.organization_type as Lead['organization_type'],
        company_size: lead.company_size as Lead['company_size'],
        budget_range: lead.budget_range as Lead['budget_range'],
        timeline: lead.timeline as Lead['timeline'],
        metadata: (lead.metadata || {}) as Record<string, any>
      }));
    } catch (error) {
      console.error('Unexpected error fetching leads:', error);
      return [];
    }
  }

  async updateLeadStatus(leadId: string, status: Lead['status'], notes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status,
          notes: notes || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error updating lead:', error);
      return false;
    }
  }
}

export const leadsService = new LeadsService();

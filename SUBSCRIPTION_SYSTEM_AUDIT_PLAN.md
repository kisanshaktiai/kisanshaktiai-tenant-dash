# 🔐 Subscription & Billing System - Deep Audit Report
**Date:** 2025-10-31  
**Status:** Pre-Migration Analysis

---

## 📊 CURRENT DATABASE STATE

### ✅ ACTIVE TABLES (DO NOT DROP - Used in Codebase)

#### 1. **subscription_plans** 
- **Rows:** 3 (Kisan ₹99/mo, Shakti ₹199/mo, AI PRO ₹299/mo)
- **Usage:** Actively used in hooks (useTenantData, useTenantAuthOptimized), services (TenantDataService)
- **Purpose:** Farmer-focused subscription plans with features & limits
- **Action:** ✅ KEEP & ENHANCE with Stripe fields

#### 2. **tenant_subscriptions**
- **Rows:** 0 (empty but referenced in code)
- **Usage:** Actively used in hooks for subscription status
- **Purpose:** Tracks active tenant subscriptions
- **Action:** ✅ KEEP & ENHANCE with billing cycle, Stripe IDs, payment tracking

#### 3. **farmer_subscriptions**
- **Rows:** 0 (empty but table exists)
- **Usage:** Referenced in types.ts
- **Purpose:** Track farmer-level subscriptions
- **Action:** ✅ KEEP & ENHANCE with payment tracking, tenant relationship

#### 4. **activation_codes** & **activation_logs**
- **Rows:** Active system for tenant activation
- **Usage:** Used for tenant onboarding codes
- **Purpose:** Activation code management
- **Action:** ✅ KEEP - Not part of subscription system

---

### ⚠️ POTENTIALLY DUPLICATE/UNUSED TABLES

#### 5. **billing_plans**
- **Rows:** 4 (Starter, Growth, Enterprise, Custom)
- **Usage:** ❌ NOT found in codebase search
- **Purpose:** Appears to be duplicate of subscription_plans but for tenants
- **Issue:** Different plan names vs subscription_plans
- **Action:** 🔄 MERGE into subscription_plans OR keep as tenant-specific plans

#### 6. **billing_analytics**
- **Rows:** 0
- **Usage:** ❌ NOT found in codebase
- **Purpose:** ARR/MRR/Churn metrics
- **Action:** ✅ KEEP - Will be used for analytics dashboard

#### 7. **billing_notifications**
- **Rows:** 0
- **Usage:** ❌ NOT found in codebase
- **Purpose:** Payment reminders, invoice notifications
- **Action:** ✅ KEEP - Essential for billing automation

#### 8. **billing_automation_rules**
- **Rows:** 0
- **Usage:** ❌ NOT found in codebase
- **Purpose:** Auto-actions on billing events
- **Action:** ✅ KEEP - Future automation system

#### 9. **subscription_change_history**
- **Rows:** 0
- **Usage:** ❌ NOT found in codebase
- **Purpose:** Audit trail of subscription changes
- **Action:** ✅ KEEP & ENHANCE - Critical for compliance

#### 10. **subscription_renewals**
- **Rows:** 0
- **Usage:** ❌ NOT found in codebase
- **Purpose:** Track renewal events
- **Action:** 🔄 MERGE into subscription_change_history OR keep separate

#### 11. **subscription_settings**
- **Rows:** 0
- **Usage:** ❌ NOT found in codebase
- **Purpose:** Per-subscription settings
- **Action:** 🔄 EVALUATE - May not be needed

#### 12. **market_price_subscriptions**
- **Rows:** 0
- **Usage:** Referenced in types.ts
- **Purpose:** Commodity price alert subscriptions (NOT billing)
- **Action:** ✅ KEEP - Different feature, not billing-related

---

## 🎯 MISSING CRITICAL TABLES

### Need to Create:
1. **invoices** - Invoice generation & tracking
2. **invoice_line_items** - Itemized billing
3. **payment_methods** - Stored payment info (Stripe)
4. **subscription_usage_logs** - Metered usage tracking
5. **subscription_addons** - Additional features/add-ons
6. **payment_transactions** - Payment history
7. **credit_notes** - Refunds & credits
8. **subscription_coupons** - Discount codes

---

## 🏗️ ARCHITECTURE ISSUES FOUND

### 1. **Dual Plan System Confusion**
- `subscription_plans`: Farmer plans (Kisan/Shakti/AI PRO)
- `billing_plans`: Tenant plans (Starter/Growth/Enterprise)
- **Fix:** Clarify with `plan_category` field: 'tenant' | 'farmer'

### 2. **No Stripe Integration**
- Missing stripe_product_id, stripe_price_id, stripe_customer_id
- **Fix:** Add Stripe fields to all relevant tables

### 3. **Empty Subscriptions**
- Tables exist but no active subscriptions recorded
- **Fix:** Sync existing tenant.subscription_plan to tenant_subscriptions

### 4. **No Billing Cycle Tracking**
- Can't track billing dates, renewals, grace periods
- **Fix:** Add proper date fields & automation

### 5. **No Payment History**
- No record of successful/failed payments
- **Fix:** Create payment_transactions table

---

## 📋 SAFE MIGRATION STRATEGY

### Phase 1: Enhance Existing Tables (NO DROPS)
```sql
-- Add Stripe fields to subscription_plans
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id_annually TEXT;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS plan_category TEXT DEFAULT 'farmer';

-- Add Stripe & billing fields to tenant_subscriptions
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ;

-- Add Stripe & billing fields to farmer_subscriptions
ALTER TABLE farmer_subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE farmer_subscriptions ADD COLUMN IF NOT EXISTS paid_by_tenant BOOLEAN DEFAULT false;
ALTER TABLE farmer_subscriptions ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;
```

### Phase 2: Create Missing Tables
- invoices
- invoice_line_items
- payment_methods
- payment_transactions
- subscription_usage_logs
- subscription_addons
- credit_notes

### Phase 3: Data Migration
- Migrate billing_plans → subscription_plans (mark as plan_category='tenant')
- Sync tenant.subscription_plan → tenant_subscriptions

### Phase 4: Add RLS Policies
- Secure all tables with proper RLS
- Admin, tenant, farmer isolation

### Phase 5: Create Services & UI
- SubscriptionService (Stripe integration)
- BillingService (Invoice generation)
- PaymentService (Transaction processing)
- UI Components (Plan selection, billing dashboard)

---

## ⚡ RECOMMENDED NEXT STEPS

### Immediate Actions:
1. ✅ **Approve this audit plan**
2. 🔧 **Run Phase 1 migration** (enhance existing tables)
3. 🆕 **Run Phase 2 migration** (create missing tables)
4. 🔄 **Data sync** (migrate existing data)
5. 🔐 **Add RLS policies**
6. 💳 **Enable Stripe integration**
7. 🎨 **Build services & UI**

### Safety Measures:
- ✅ NO table drops
- ✅ ALL existing data preserved
- ✅ Backward compatible
- ✅ Rollback-friendly
- ✅ Progressive enhancement

---

## 🎨 2030 DESIGN STANDARDS

### Billing System Features:
- 💳 **Stripe Integration:** Payment processing, invoices, webhooks
- 📊 **Real-time Analytics:** ARR, MRR, Churn, LTV
- 🤖 **Smart Automation:** Auto-renewals, dunning, grace periods
- 📧 **Notifications:** Payment reminders, invoice delivery
- 💰 **Flexible Pricing:** Usage-based, tiered, add-ons, coupons
- 🔐 **Security:** PCI compliance, encrypted payment methods
- 📈 **Scalability:** Handle 100K+ subscriptions
- 🌐 **Multi-currency:** Support global payments
- 📱 **Mobile-optimized:** Responsive billing dashboard
- 🎯 **Tenant Isolation:** Complete data separation

### Dual Subscription Model:
1. **Tenant Subscriptions** (B2B)
   - AgriCompanies, NGOs, Universities pay for platform access
   - Plans: Starter, Growth, Enterprise, Custom
   - Billing: Monthly/Annually via Stripe
   
2. **Farmer Subscriptions** (B2C)
   - Individual farmers pay for premium features
   - Plans: Kisan (Basic), Shakti (Premium), AI PRO (Enterprise)
   - Can be paid by tenant (B2B2C model) or farmer directly

---

## ✅ APPROVAL REQUIRED

Please approve to proceed with:
- [ ] Phase 1: Enhance existing tables
- [ ] Phase 2: Create missing tables
- [ ] Phase 3: Add RLS policies
- [ ] Phase 4: Build services & UI
- [ ] Phase 5: Enable Stripe integration

**Estimated Time:** 2-3 hours for complete implementation
**Risk Level:** LOW (no data loss, backward compatible)

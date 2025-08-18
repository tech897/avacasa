# Migration Strategy: Simple to Comprehensive Database Schema

## Overview

This document outlines the strategy for migrating from the current simple property database to the comprehensive schema with 100+ variables.

## Current vs Comprehensive Schema Comparison

### Current Schema (Simple)

- Basic property fields: title, description, price, area, bedrooms, bathrooms
- Simple location reference
- Basic amenities and features arrays
- Limited JSON fields for coordinates and nearby infrastructure

### Comprehensive Schema (Enhanced)

- **100+ structured fields** covering every aspect of property data
- **Enhanced user profiles** with verification and stakeholder-specific data
- **Detailed property specifications** including room sizes, materials, fittings
- **Financial modeling** with investment analysis and market data
- **Smart home integration** with IoT device tracking
- **Legal and compliance** tracking with document management
- **Vastu and cultural factors** for Indian market needs

## Migration Options

### Option 1: Clean Migration (Recommended)

**Create new comprehensive database and migrate essential data**

**Advantages:**
✅ Clean start with proper schema design
✅ No legacy data issues
✅ All new fields properly structured
✅ Can run both databases in parallel during transition

**Process:**

1. Create new MongoDB database (`avacasa_comprehensive`)
2. Deploy comprehensive schema
3. Migrate essential property data (title, price, location, images)
4. Update application to use new schema
5. Gradually populate comprehensive fields

### Option 2: Gradual Enhancement

**Gradually add new fields to existing database**

**Advantages:**
✅ No downtime
✅ Existing data preserved

**Disadvantages:**
❌ Complex migration scripts needed
❌ Data inconsistency during transition
❌ Harder to maintain during transition

## Recommended Migration Steps

### Phase 1: Database Setup (Day 1)

1. **Create new comprehensive database**

   ```bash
   # Update .env.local with new database URL
   DATABASE_URL="mongodb+srv://shiva:AvacasaPassword@prod1.00rfbqq.mongodb.net/avacasa_comprehensive?retryWrites=true&w=majority&appName=prod1"
   ```

2. **Replace schema file**

   ```bash
   # Backup current schema
   cp prisma/schema.prisma prisma/schema-simple-backup.prisma

   # Replace with comprehensive schema
   cp prisma/comprehensive-schema.prisma prisma/schema.prisma
   ```

3. **Generate new Prisma client**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Test new schema**
   ```bash
   node scripts/setup-comprehensive-database.js
   ```

### Phase 2: Data Migration (Day 2-3)

1. **Create migration script to copy essential data**
2. **Migrate properties with field mapping**
3. **Migrate locations and users**
4. **Migrate blog posts and admin data**

### Phase 3: Application Updates (Day 4-5)

1. **Update API routes** to handle new fields
2. **Update frontend components** to display enhanced data
3. **Update forms** to capture comprehensive information
4. **Test all functionality**

### Phase 4: Data Population (Ongoing)

1. **Create admin interface** for data entry
2. **Implement bulk upload** for comprehensive property data
3. **Set up data validation** and quality checks
4. **Train team** on new data structure

## Data Mapping Strategy

### Property Fields Mapping

```javascript
// Current → Comprehensive mapping
{
  // Direct mappings
  title → title,
  description → description,
  price → currentMarketPrice,
  area → totalArea,
  bedrooms → numberOfBedrooms,
  bathrooms → numberOfBathrooms,
  images → images,
  coordinates → coordinates,

  // Enhanced mappings
  amenities → buildingAmenities + societyAmenities,
  features → features + tags,
  nearbyInfrastructure → nearbyInfrastructure (enhanced structure),

  // New fields (initially empty)
  floorDetails → {},
  electricalFittings → {},
  plumbingDetails → {},
  sanitaryFittings → {},
  kitchenFittings → {},
  smartHomeFeatures → {},
  vastuCompliance → {},
  propertyCondition → {},
  marketAnalysis → {},
  // ... all other 80+ new fields will be empty initially
}
```

### User Migration

```javascript
// Current users → Enhanced user profiles
{
  // Direct mappings
  email → email,
  name → name,

  // Enhancements
  userType → "BUYER" (default),
  verificationStatus → "PENDING",
  isActive → true,

  // New profile creation based on user behavior
  // Create BuyerProfile for users who saved properties
  // Create SellerProfile for users who listed properties
}
```

## Implementation Timeline

### Week 1: Infrastructure Setup

- [ ] Create comprehensive schema
- [ ] Set up new database
- [ ] Create migration scripts
- [ ] Test schema with sample data

### Week 2: Data Migration

- [ ] Migrate essential property data
- [ ] Migrate user accounts
- [ ] Migrate locations and blog posts
- [ ] Verify data integrity

### Week 3: Application Updates

- [ ] Update API routes
- [ ] Update frontend components
- [ ] Update admin interface
- [ ] Test all functionality

### Week 4: Enhancement & Training

- [ ] Create data entry interfaces
- [ ] Set up validation rules
- [ ] Train team on new features
- [ ] Begin populating comprehensive data

## Rollback Strategy

If issues arise during migration:

1. **Quick Rollback**: Switch DATABASE_URL back to original database
2. **Schema Rollback**: Replace schema with backup version
3. **Client Regeneration**: Run `npx prisma generate` with old schema
4. **Application Restart**: Restart application with original configuration

## Benefits of Comprehensive Schema

### For Property Management

- **Detailed specifications** enable better property matching
- **Investment analysis** helps buyers make informed decisions
- **Maintenance tracking** improves property management
- **Legal compliance** reduces transaction risks

### For User Experience

- **Enhanced search** with detailed filters
- **Smart recommendations** based on comprehensive preferences
- **Vastu compliance** for culturally-aware property selection
- **Investment insights** with market analysis

### For Business Intelligence

- **Detailed analytics** on property trends
- **User behavior insights** from comprehensive profiles
- **Market analysis** with investment metrics
- **Operational efficiency** through workflow tracking

## Next Steps

1. **Review comprehensive schema** and provide feedback
2. **Approve migration timeline** and resource allocation
3. **Begin Phase 1 implementation** with database setup
4. **Set up staging environment** for testing

---

**Note**: This migration will transform Avacasa from a basic property listing platform to a comprehensive real estate intelligence system with enterprise-grade data modeling.


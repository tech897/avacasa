# Comprehensive Database Variables List

## 📋 Complete Variable Inventory

This document lists all **100+ variables** captured from your requirements document, organized by category with types and descriptions.

---

## 🏠 **PROPERTY MODEL VARIABLES**

### **Basic Property Information**

| Variable      | Type   | Description                     |
| ------------- | ------ | ------------------------------- |
| `id`          | String | Auto-generated ObjectId         |
| `title`       | String | Property title/name             |
| `slug`        | String | URL-friendly unique identifier  |
| `description` | String | Property description            |
| `propertyId`  | String | Custom property ID              |
| `unitNumber`  | String | Unit/apartment number           |
| `unitType`    | String | Villa/Apartment/Plot/Commercial |
| `buildingId`  | String | Building identifier             |

### **Area Dimensions (sqft)**

| Variable           | Type  | Description         |
| ------------------ | ----- | ------------------- |
| `totalArea`        | Float | Total property area |
| `builtUpArea`      | Float | Built-up area       |
| `carpetArea`       | Float | Carpet area         |
| `superBuiltUpArea` | Float | Super built-up area |
| `plotArea`         | Float | Plot/land area      |

### **Room Configuration**

| Variable              | Type    | Description                    |
| --------------------- | ------- | ------------------------------ |
| `numberOfBHK`         | Int     | BHK configuration (1/2/3/4/5+) |
| `numberOfBedrooms`    | Int     | Total bedrooms                 |
| `numberOfBathrooms`   | Int     | Total bathrooms                |
| `numberOfToilets`     | Int     | Separate toilet count          |
| `numberOfStudyRooms`  | Int     | Study rooms                    |
| `numberOfHalls`       | Int     | Living rooms/halls             |
| `numberOfKitchens`    | Int     | Kitchen count                  |
| `numberOfDiningRooms` | Int     | Dining areas                   |
| `numberOfBalconies`   | Int     | Balcony count                  |
| `numberOfTerraces`    | Int     | Terrace count                  |
| `servantRoom`         | Boolean | Servant room availability      |
| `servantToilet`       | Boolean | Servant toilet availability    |
| `poojaRoom`           | Boolean | Prayer room availability       |
| `storeRoom`           | Boolean | Storage room availability      |

### **Room Sizes (Individual Dimensions)**

| Variable            | Type  | Description                |
| ------------------- | ----- | -------------------------- |
| `masterBedroomSize` | Float | Master bedroom area (sqft) |
| `bedroomSizes`      | Json  | Array of bedroom sizes     |
| `bedroomSizes2`     | Json  | Additional bedroom details |
| `hallSize`          | Float | Living room area           |
| `kitchenSize`       | Float | Kitchen area               |
| `diningRoomSize`    | Float | Dining room area           |
| `kitchenSize2`      | Float | Secondary kitchen area     |
| `studyRoomSize`     | Float | Study room area            |
| `servantRoomSize`   | Float | Servant room area          |
| `storeRoomSize`     | Float | Storage room area          |
| `poojaRoomSize`     | Float | Prayer room area           |

### **Balcony Details**

| Variable            | Type | Description                           |
| ------------------- | ---- | ------------------------------------- |
| `balconySize`       | Json | Array of balcony dimensions           |
| `balconyAttachment` | Json | Which room each balcony connects to   |
| `balconyFacing`     | Json | Direction each balcony faces          |
| `balconyView`       | Json | View from each balcony                |
| `balconyType`       | Json | OPEN/COVERED/SEMI_COVERED per balcony |

### **Unit Position**

| Variable      | Type    | Description                               |
| ------------- | ------- | ----------------------------------------- |
| `floorNumber` | Int     | Floor level                               |
| `totalFloors` | Int     | Total floors in building                  |
| `doorFacing`  | String  | Main door direction (N/S/E/W/NE/NW/SE/SW) |
| `corner`      | Boolean | Corner unit                               |
| `endUnit`     | Boolean | End unit                                  |
| `penthouse`   | Boolean | Penthouse unit                            |
| `duplexUnit`  | Boolean | Duplex configuration                      |
| `triplexUnit` | Boolean | Triplex configuration                     |

### **Construction & Materials**

| Variable              | Type    | Description            |
| --------------------- | ------- | ---------------------- |
| `propertyAge`         | Int     | Age in years           |
| `constructionYear`    | Int     | Year of construction   |
| `constructionQuality` | String  | PREMIUM/STANDARD/BASIC |
| `structuralType`      | String  | RCC/LOAD_BEARING/STEEL |
| `earthquakeResistant` | Boolean | Earthquake resistance  |

### **Detailed Interior and Finishing**

| Variable        | Type | Description                                 |
| --------------- | ---- | ------------------------------------------- |
| `floorDetails`  | Json | Floor materials, brands, condition per room |
| `doorDetails`   | Json | Interior & main door specifications         |
| `windowDetails` | Json | Window materials, grills, safety features   |

### **Electrical & Plumbing Systems**

| Variable             | Type | Description                                   |
| -------------------- | ---- | --------------------------------------------- |
| `electricalFittings` | Json | Switches, wiring, power backup, AC provisions |
| `plumbingDetails`    | Json | Pipes, water pressure, hot water system       |

### **Sanitary & Kitchen Fittings**

| Variable           | Type | Description                                   |
| ------------------ | ---- | --------------------------------------------- |
| `sanitaryFittings` | Json | Toilet, basin, shower, faucets brands/details |
| `kitchenFittings`  | Json | Cabinets, countertop, sink, appliances        |

### **Furnished Status & Details**

| Variable           | Type   | Description                                |
| ------------------ | ------ | ------------------------------------------ |
| `furnishedStatus`  | String | FULLY_FURNISHED/SEMI_FURNISHED/UNFURNISHED |
| `furnitureDetails` | Json   | Complete furniture & appliance inventory   |

---

## 💰 **FINANCIAL & LEGAL VARIABLES**

### **Pricing**

| Variable                 | Type  | Description                    |
| ------------------------ | ----- | ------------------------------ |
| `currentMarketPrice`     | Float | Current market valuation       |
| `listingPrice`           | Float | Listed selling price           |
| `minimumAcceptablePrice` | Float | Minimum acceptable offer       |
| `pricePerSqft`           | Float | Rate per square foot           |
| `expectedAppreciation`   | Float | Expected annual appreciation % |
| `guidanceValue`          | Float | Government guidance value      |
| `registrationCharges`    | Float | Registration costs             |
| `stampDuty`              | Float | Stamp duty amount              |
| `brokeragePercentage`    | Float | Brokerage percentage           |

### **Rental Information**

| Variable              | Type    | Description                  |
| --------------------- | ------- | ---------------------------- |
| `expectedRental`      | Float   | Expected monthly rent        |
| `currentRental`       | Float   | Current monthly rent         |
| `rentalYield`         | Float   | Annual rental yield %        |
| `rentEscalation`      | Float   | Annual rent escalation %     |
| `securityDeposit`     | Float   | Security deposit amount      |
| `maintenanceIncluded` | Boolean | Maintenance included in rent |

### **Costs & Charges**

| Variable             | Type  | Description          |
| -------------------- | ----- | -------------------- |
| `maintenanceCost`    | Float | Monthly maintenance  |
| `propertyTax`        | Float | Annual property tax  |
| `societyCharges`     | Float | Society charges      |
| `waterCharges`       | Float | Water charges        |
| `electricityCharges` | Float | Electricity charges  |
| `parkingCharges`     | Float | Parking charges      |
| `clubMembershipFees` | Float | Club membership fees |
| `insuranceCost`      | Float | Insurance premium    |

### **Legal Status**

| Variable                 | Type    | Description                               |
| ------------------------ | ------- | ----------------------------------------- |
| `legalTitle`             | String  | CLEAR/DISPUTED/UNDER_LITIGATION           |
| `ownershipType`          | String  | FREEHOLD/LEASEHOLD/COOPERATIVE            |
| `approvals`              | Json    | Municipal, environmental, fire NOC status |
| `encumbranceCertificate` | Boolean | Encumbrance certificate availability      |
| `titleDeed`              | Boolean | Title deed availability                   |
| `salePermission`         | Boolean | Sale permission status                    |
| `NOCs`                   | Json    | Society, bank, other NOCs                 |

### **Mortgage Details**

| Variable      | Type    | Description              |
| ------------- | ------- | ------------------------ |
| `mortgaged`   | Boolean | Currently mortgaged      |
| `bankName`    | String  | Mortgage bank name       |
| `loanAmount`  | Float   | Original loan amount     |
| `loanBalance` | Float   | Outstanding loan balance |
| `emiAmount`   | Float   | Monthly EMI              |
| `loanTenure`  | Int     | Loan tenure in months    |
| `loanType`    | String  | Type of loan             |

---

## 🏢 **AMENITIES & INFRASTRUCTURE**

### **Parking**

| Variable            | Type    | Description                       |
| ------------------- | ------- | --------------------------------- |
| `parkingSpaces`     | Int     | Number of parking spaces          |
| `parkingType`       | String  | COVERED/OPEN/STILT/BASEMENT       |
| `parkingSize`       | Json    | Dimensions of each parking space  |
| `parkingLevel`      | Json    | Level/floor of each parking space |
| `visitorParking`    | Boolean | Visitor parking availability      |
| `twoWheelerParking` | Boolean | Two-wheeler parking               |

### **Building Amenities**

| Variable            | Type | Description                                        |
| ------------------- | ---- | -------------------------------------------------- |
| `buildingAmenities` | Json | Lift, power backup, water supply, security details |

### **Society/Complex Amenities**

| Variable           | Type | Description                                    |
| ------------------ | ---- | ---------------------------------------------- |
| `societyAmenities` | Json | Clubhouse, pool, gym, playground, garden, etc. |

### **Location & Connectivity**

| Variable               | Type | Description                                      |
| ---------------------- | ---- | ------------------------------------------------ |
| `nearbyInfrastructure` | Json | Schools, hospitals, shopping, transport, offices |

---

## 🌍 **ENVIRONMENTAL & COMPLIANCE**

### **Environmental Factors**

| Variable               | Type | Description                                   |
| ---------------------- | ---- | --------------------------------------------- |
| `environmentalFactors` | Json | Air quality, noise, water quality, flood risk |

### **Smart Home and Technology**

| Variable            | Type | Description                                  |
| ------------------- | ---- | -------------------------------------------- |
| `smartHomeFeatures` | Json | Home automation, IoT devices, connectivity   |
| `iotDevices`        | Json | Security, climate, energy monitoring devices |

### **Condition & Maintenance**

| Variable             | Type | Description                                         |
| -------------------- | ---- | --------------------------------------------------- |
| `propertyCondition`  | Json | Overall, structural, electrical, plumbing condition |
| `maintenanceHistory` | Json | Major repairs, painting, maintenance records        |
| `repairRequirements` | Json | Immediate, upcoming, improvement needs              |

### **Investment and Market Analysis**

| Variable              | Type | Description                                         |
| --------------------- | ---- | --------------------------------------------------- |
| `marketAnalysis`      | Json | Price history, market trends, comparable properties |
| `sellerProfile`       | Json | Reason for selling, timeline, price expectations    |
| `buyerAttractiveness` | Json | Target buyers, selling points, challenges           |

### **Vastu and Cultural Factors**

| Variable          | Type | Description                                             |
| ----------------- | ---- | ------------------------------------------------------- |
| `vastuCompliance` | Json | Overall compliance, directions, elements, certification |
| `culturalFactors` | Json | Religious proximity, community preferences, festivals   |

---

## 🖼️ **MEDIA & LOCATION**

### **Images and Media**

| Variable          | Type     | Description         |
| ----------------- | -------- | ------------------- |
| `images`          | String[] | Property image URLs |
| `videos`          | String[] | Property video URLs |
| `virtualTourUrl`  | String   | Virtual tour link   |
| `floorPlanImages` | String[] | Floor plan images   |

### **Location**

| Variable      | Type   | Description                 |
| ------------- | ------ | --------------------------- |
| `address`     | String | Complete address            |
| `coordinates` | Json   | Latitude and longitude      |
| `locationId`  | String | Reference to Location model |

### **Status and Visibility**

| Variable   | Type           | Description                        |
| ---------- | -------------- | ---------------------------------- |
| `status`   | PropertyStatus | DRAFT/ACTIVE/SOLD/RENTED/WITHDRAWN |
| `isActive` | Boolean        | Active listing status              |
| `views`    | Int            | View count                         |
| `featured` | Boolean        | Featured property status           |

### **SEO and Marketing**

| Variable    | Type     | Description        |
| ----------- | -------- | ------------------ |
| `tags`      | String[] | SEO tags           |
| `amenities` | String[] | Amenity tags       |
| `features`  | String[] | Feature highlights |

### **Timestamps**

| Variable    | Type     | Description           |
| ----------- | -------- | --------------------- |
| `createdAt` | DateTime | Creation timestamp    |
| `updatedAt` | DateTime | Last update timestamp |

---

## 👥 **USER MANAGEMENT VARIABLES**

### **Core User Fields**

| Variable   | Type     | Description                      |
| ---------- | -------- | -------------------------------- |
| `id`       | String   | Auto-generated ObjectId          |
| `email`    | String   | Unique email address             |
| `name`     | String   | User full name                   |
| `phone`    | String   | Contact number                   |
| `userType` | UserType | BUYER/SELLER/BROKER/OWNER/HYBRID |

### **Verification System**

| Variable                | Type               | Description               |
| ----------------------- | ------------------ | ------------------------- |
| `verificationStatus`    | VerificationStatus | PENDING/VERIFIED/REJECTED |
| `verificationDocuments` | Json               | KYC docs, licenses        |

### **User Preferences**

| Variable                   | Type     | Description              |
| -------------------------- | -------- | ------------------------ |
| `preferredLocations`       | String[] | Preferred location slugs |
| `budgetRange`              | Json     | Min, max, currency       |
| `investmentGoals`          | String[] | Investment objectives    |
| `communicationPreferences` | Json     | Notification preferences |

### **Profile & Trust**

| Variable              | Type    | Description                   |
| --------------------- | ------- | ----------------------------- |
| `profileCompleteness` | Float   | Profile completion percentage |
| `trustScore`          | Float   | Activity-based trust score    |
| `referralCode`        | String  | Referral code                 |
| `isActive`            | Boolean | Account status                |

---

## 🎯 **STAKEHOLDER-SPECIFIC PROFILES**

### **Buyer Profile Variables**

| Variable              | Type     | Description                                |
| --------------------- | -------- | ------------------------------------------ |
| `investmentType`      | String   | PRIMARY_RESIDENCE/INVESTMENT/VACATION_HOME |
| `financingPreference` | String   | CASH/LOAN/HYBRID                           |
| `timeframe`           | String   | IMMEDIATE/3_MONTHS/6_MONTHS/1_YEAR         |
| `priorityFactors`     | String[] | Location, amenities, price, etc.           |
| `searchCriteria`      | Json     | Saved search parameters                    |
| `alertFrequency`      | String   | IMMEDIATE/DAILY/WEEKLY                     |

### **Seller Profile Variables**

| Variable               | Type     | Description                    |
| ---------------------- | -------- | ------------------------------ |
| `sellingReason`        | String   | PRIMARY/SECONDARY/URGENT       |
| `urgency`              | String   | HIGH/MEDIUM/LOW                |
| `priceExpectation`     | Float    | Expected selling price         |
| `marketingPreferences` | Json     | Marketing strategy preferences |
| `valuationDate`        | DateTime | Property valuation date        |
| `valuationAmount`      | Float    | Valuation amount               |
| `valuationReport`      | String   | Valuation report URL           |

### **Broker Profile Variables**

| Variable              | Type     | Description                    |
| --------------------- | -------- | ------------------------------ |
| `licenseNumber`       | String   | Broker license number          |
| `licenseExpiry`       | DateTime | License expiry date            |
| `specializations`     | String[] | Area of specialization         |
| `commissionStructure` | Json     | Commission rates and structure |
| `serviceAreas`        | String[] | Service area coverage          |
| `teamMembers`         | Json     | Team member details            |

### **Owner Profile Variables**

| Variable               | Type     | Description                 |
| ---------------------- | -------- | --------------------------- |
| `portfolioValue`       | Float    | Total portfolio value       |
| `managementPreference` | String   | SELF/PROFESSIONAL/HYBRID    |
| `properties`           | String[] | Array of owned property IDs |
| `totalValue`           | Float    | Total property value        |
| `totalRental`          | Float    | Total rental income         |

---

## 📊 **SUPPORTING SYSTEM VARIABLES**

### **Location Model**

| Variable      | Type         | Description                |
| ------------- | ------------ | -------------------------- |
| `name`        | String       | Location name              |
| `slug`        | String       | URL slug                   |
| `city`        | String       | City name                  |
| `state`       | String       | State name                 |
| `country`     | String       | Country (default: India)   |
| `type`        | LocationType | CITY/AREA/LOCALITY/COMPLEX |
| `coordinates` | Json         | Lat/lng coordinates        |

### **Transaction History**

| Variable          | Type     | Description                   |
| ----------------- | -------- | ----------------------------- |
| `transactionType` | String   | PURCHASE/SALE/RENTAL/LEASE    |
| `amount`          | Float    | Transaction amount            |
| `date`            | DateTime | Transaction date              |
| `parties`         | Json     | Buyer, seller, broker details |
| `documents`       | Json     | Agreement, receipts, etc.     |

### **Document Management**

| Variable       | Type     | Description                       |
| -------------- | -------- | --------------------------------- |
| `documentType` | String   | TITLE_DEED/NOC/APPROVAL/AGREEMENT |
| `uploadDate`   | DateTime | Document upload date              |
| `expiryDate`   | DateTime | Document expiry                   |
| `verification` | String   | PENDING/VERIFIED/REJECTED         |

### **Blog System**

| Variable    | Type     | Description        |
| ----------- | -------- | ------------------ |
| `title`     | String   | Blog post title    |
| `slug`      | String   | URL slug           |
| `content`   | String   | Blog content       |
| `excerpt`   | String   | Short description  |
| `author`    | String   | Author name        |
| `tags`      | String[] | Blog tags          |
| `featured`  | Boolean  | Featured post      |
| `published` | Boolean  | Publication status |

---

## 📈 **SUMMARY STATISTICS**

### **Total Variable Count by Category:**

- **Property Model**: 85+ variables
- **User Management**: 15+ variables
- **Stakeholder Profiles**: 25+ variables
- **Supporting Systems**: 20+ variables
- **Location & Media**: 15+ variables

### **Total Variables**: **160+ comprehensive variables**

### **Data Types Used:**

- `String`: 45+ fields
- `Float`: 35+ fields
- `Int`: 20+ fields
- `Boolean`: 25+ fields
- `Json`: 30+ fields (complex nested data)
- `DateTime`: 10+ fields
- `String[]`: 15+ fields (arrays)
- `Enum`: 5+ fields

### **Special Features:**

- ✅ **Nested JSON structures** for complex data
- ✅ **Relationship mapping** between models
- ✅ **Enum types** for controlled values
- ✅ **Array fields** for multiple values
- ✅ **Optional/Required** field validation
- ✅ **Auto-generated timestamps**
- ✅ **Unique constraints** where needed

---

**This comprehensive schema captures every aspect of property data mentioned in your requirements document, providing a complete real estate intelligence platform foundation.**


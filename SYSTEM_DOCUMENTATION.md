# Clear - System Documentation

## Overview

**Clear** is a personal finance management application that provides financial clarity by tracking transactions, managing loans between users, and forecasting future cash flow. The system is built with Next.js (App Router), Supabase (PostgreSQL database), and follows a transparent, user-friendly approach to financial management.

**Core Philosophy**: "Show you the truth about your money today, and clarity about tomorrow."

---

## Core Features

### 1. Transaction Tracking
- **Income**: Track money coming in (salary, freelance, rental income, etc.)
- **Expenses**: Track money going out (rent, bills, transport, subscriptions, etc.)
- **Monthly View**: See all transactions for the current month with totals and remaining balance
- **Edit/Delete**: Full CRUD operations on all transactions

### 2. Loan Management
- **Social Loans**: Track loans between users on the platform
- **Non-Platform Loans**: Track loans with people not using the app (stored with person's name in notes)
- **Loan Repayment**: Make partial or full repayments on loans
- **Loan Status Tracking**: Loans go through states: `pending` → `accepted` → `active` → `repaid` or `cancelled`
- **Shared Visibility**: Both lender and borrower can view and manage the same loan

### 3. Recurring Items
- **Recurring Income**: Automatically track regular income (salary, monthly payments)
- **Recurring Expenses**: Automatically track regular expenses (rent, bills, subscriptions, utilities, insurance)
- **Frequency Support**: Monthly, weekly, or yearly recurrence
- **Automatic Processing**: Recurring items automatically create transactions when due

### 4. Future Forecasting
- **Next Month Cash Flow**: Forecast of income and expenses for the next month
- **Loan Projections**: Calculate loans due in the next month
- **Recurring Item Projections**: Calculate recurring items due in the next month
- **Net Cash Flow**: Shows expected cash flow including and excluding loans

### 5. Friends & Social Features
- **Friend System**: Add friends to the platform via username search
- **Friendship Management**: Send friend requests, accept/decline friendships
- **Loan Integration**: Easily create loans with friends on the platform

---

## Database Structure

### Tables

#### 1. **profiles**
User profile information that extends Supabase's `auth.users` table.

```sql
- id (UUID, Primary Key, references auth.users)
- username (TEXT, Unique, Required)
- real_name (TEXT)
- phone (TEXT)
- avatar_url (TEXT)
- created_at, updated_at (Timestamps)
```

**Auto-creation**: When a user signs up, a trigger automatically creates a profile record.

#### 2. **loans**
Tracks all loans between users (or with non-platform users).

```sql
- id (UUID, Primary Key)
- lender_id (UUID, references profiles)
- borrower_id (UUID, references profiles)
- amount (DECIMAL(10,2), Required, > 0)
- remaining_amount (DECIMAL(10,2), Required, >= 0, <= amount)
- due_date (DATE, Required)
- notes (TEXT) - Stores person name for non-platform loans
- status (TEXT) - 'pending' | 'accepted' | 'active' | 'repaid' | 'cancelled'
- created_at, updated_at (Timestamps)
```

**Special Case**: When `lender_id = borrower_id`, it represents a non-platform loan. The notes field stores the person's name as "From: PersonName" or "To: PersonName".

**Constraints**:
- `remaining_amount <= amount`
- Both parties can view, update, and delete loans

#### 3. **transactions**
All financial transactions (income, expenses, loan-related).

```sql
- id (UUID, Primary Key)
- user_id (UUID, references profiles)
- type (TEXT) - 'income' | 'expense' | 'loan_received' | 'loan_given' | 
                 'loan_repayment' | 'loan_repayment_received' | 'salary'
- amount (DECIMAL(10,2), Required)
- category (TEXT) - e.g., 'rent', 'bills', 'transport', 'salary'
- source (TEXT) - Source of income or where expense went
- description (TEXT)
- date (DATE, Required)
- loan_id (UUID, references loans, nullable)
- month (INTEGER, 1-12, Required)
- year (INTEGER, Required)
- created_at (Timestamp)
```

**Transaction Types**:
- `income`: General income
- `expense`: General expense
- `salary`: Salary/regular income
- `loan_received`: Money received from a loan
- `loan_given`: Money lent to someone
- `loan_repayment`: Money paid back on a loan
- `loan_repayment_received`: Money received as loan repayment

#### 4. **recurring_items**
Items that repeat on a schedule (salary, rent, bills, etc.).

```sql
- id (UUID, Primary Key)
- user_id (UUID, references profiles)
- type (TEXT) - 'income' | 'expense' | 'salary' | 'rent' | 'bills' | 
                 'transport' | 'subscription' | 'utilities' | 'insurance' | 'internet'
- amount (DECIMAL(10,2), Required)
- category (TEXT)
- description (TEXT)
- frequency (TEXT) - 'monthly' | 'weekly' | 'yearly' (default: 'monthly')
- start_date (DATE, Required)
- next_date (DATE, Required) - When this item is next due
- end_date (DATE, nullable) - Optional end date
- is_active (BOOLEAN, default: true)
- created_at, updated_at (Timestamps)
```

**Automatic Processing**: A utility function processes recurring items and creates transactions when `next_date` arrives.

#### 5. **friendships**
Friend relationships between users.

```sql
- id (UUID, Primary Key)
- requester_id (UUID, references profiles)
- addressee_id (UUID, references profiles)
- status (TEXT) - 'pending' | 'accepted' | 'declined' (default: 'pending')
- created_at, updated_at (Timestamps)
```

**Constraints**:
- Unique pair (requester_id, addressee_id)
- Cannot friend yourself (`requester_id != addressee_id`)

#### 6. **monthly_snapshots** (Archival)
Monthly summary snapshots for historical data.

```sql
- id (UUID, Primary Key)
- user_id (UUID, references profiles)
- month (INTEGER, 1-12)
- year (INTEGER)
- total_income (DECIMAL(10,2))
- total_expenses (DECIMAL(10,2))
- remaining_balance (DECIMAL(10,2))
- created_at (Timestamp)
- UNIQUE(user_id, month, year)
```

---

## How Loans Work

### Creating a Loan

1. **Select Direction**: Choose "I lent money" or "I borrowed money"
2. **Select Person**: 
   - Search for a friend on the platform (creates platform loan)
   - Enter name manually (creates non-platform loan with `lender_id = borrower_id`)
3. **Enter Details**:
   - Amount (must be > 0)
   - Loan date
   - Due date (must be after loan date)
   - Optional notes
4. **Status**: New loans start as `active` status
5. **Transaction Creation**: Automatically creates a transaction:
   - If you lent: `loan_given` transaction (expense)
   - If you borrowed: `loan_received` transaction (income)
   - Links to loan via `loan_id` field

### Loan Repayment

1. **Open Loan**: Click on any active loan
2. **Make Payment**: Enter repayment amount (can be partial)
3. **Update Remaining**: `remaining_amount` decreases by repayment amount
4. **Transaction Creation**: Creates `loan_repayment` transaction
   - Links to loan via `loan_id`
   - Amount is the repayment amount
5. **Auto-Status Update**: When `remaining_amount` reaches 0, loan status changes to `repaid`

### Loan States

- **pending**: Loan request sent but not yet accepted
- **accepted**: Loan accepted by both parties
- **active**: Loan is active and being paid off
- **repaid**: Loan fully repaid (`remaining_amount = 0`)
- **cancelled**: Loan was cancelled

### Loan Visibility

- Both lender and borrower can view, edit, and delete loans they're part of
- Uses Row Level Security (RLS) policies to ensure privacy
- Non-platform loans show person name from notes field

---

## How Transactions Work

### Creating Transactions

Transactions can be created:
1. **Manually**: User adds income/expense directly
2. **Via Loans**: Automatically created when loans are created/repaid
3. **Via Recurring Items**: Automatically created when recurring items process

### Transaction Categories

**Income Categories**:
- Salary
- Freelance
- Rental Income
- Other Income

**Expense Categories**:
- Rent
- Bills (utilities, water, electricity)
- Transport
- Groceries
- Entertainment
- Health
- Education
- Shopping
- Subscriptions
- Other

### Monthly Aggregation

All transactions include `month` and `year` fields for easy filtering and aggregation:
- "This Month" page filters transactions by current month/year
- Calculations aggregate by transaction type (income vs expense)

### Transaction Editing

Users can:
- Edit amount, category, description, date
- Delete transactions
- Cannot edit loan-related transactions from the transaction list (must edit via loan)

---

## How Recurring Items Work

### Creating Recurring Items

1. **Select Type**: Income or Expense
2. **Enter Details**:
   - Amount
   - Category (varies by type)
   - Frequency (monthly/weekly/yearly)
   - Start date
   - Optional end date
   - Description
3. **Initial `next_date`**: Set to `start_date`

### Automatic Processing

A utility function (`processRecurringItems`) runs when:
- User visits the dashboard
- Can be triggered manually or via cron job

**Processing Logic**:
1. Fetches all active recurring items where `next_date <= today`
2. For each item:
   - Checks if transaction already exists for current month
   - If not, creates a new transaction
   - Updates `next_date` to next period (e.g., add 1 month for monthly)
3. Transaction type mapping:
   - `income`/`salary` → `salary` transaction
   - `expense`/other → `expense` transaction

### Recurring Item States

- **Active** (`is_active = true`): Item will process automatically
- **Inactive** (`is_active = false`): Item is paused and won't process

---

## Future Forecasting System

### Next Month Cash Flow Calculation

The "Future" page calculates expected cash flow for the next month by:

1. **Fetching Active Loans**: All loans with status != 'repaid' where user is lender or borrower
2. **Filtering by Due Date**: Only loans with `due_date` in next month
3. **Calculating Loan Impact**:
   - Loans to pay: If user is borrower (or borrowed from non-platform user)
   - Loans to receive: If user is lender (or lent to non-platform user)
4. **Fetching Recurring Items**: All active recurring items
5. **Filtering by Next Date**: Only items where `next_date` falls in next month
6. **Calculating Recurring Impact**:
   - Recurring income: Items with type 'income' or 'salary'
   - Recurring expenses: All other types
7. **Totals**:
   - `totalComingIn = loansToReceive + recurringIncome`
   - `totalGoingOut = loansToPay + recurringExpenses`
   - `netCashFlow = totalComingIn - totalGoingOut`
   - `netCashFlowWithoutLoans = recurringIncome - recurringExpenses`

### Non-Platform Loan Detection

For loans where `lender_id = borrower_id`:
- Check `notes` field
- If starts with "From:": User borrowed (counts as loan to pay)
- If starts with "To:": User lent (counts as loan to receive)

---

## Security & Authentication

### Row Level Security (RLS)

All tables have RLS enabled with policies:

**Profiles**:
- Users can only view/update their own profile

**Loans**:
- Users can view loans where they're lender OR borrower
- Users can create loans where they're lender OR borrower
- Users can update/delete loans they're part of

**Transactions**:
- Users can only view/create/update/delete their own transactions

**Recurring Items**:
- Users can only view/create/update/delete their own recurring items

**Friendships**:
- Users can view friendships where they're requester OR addressee
- Users can create friendships where they're requester
- Users can update friendships they're part of

**Monthly Snapshots**:
- Users can only view/create their own snapshots

### Authentication Flow

1. User signs up → Supabase Auth creates `auth.users` record
2. Database trigger fires → Creates `profiles` record automatically
3. User logs in → Supabase Auth provides JWT token
4. All API calls include JWT → Supabase validates and applies RLS policies

---

## Key Features & UX Decisions

### 1. Dual Loan Tracking
- **Platform Loans**: Both parties see the same loan record
- **Non-Platform Loans**: Single user tracks loan with person's name in notes
- Both types are treated the same in calculations and forecasting

### 2. Automatic Transaction Creation
- Loans automatically create transactions
- Recurring items automatically create transactions
- Ensures all financial activity is tracked

### 3. Monthly Focus
- All transactions tagged with month/year
- Easy filtering and aggregation
- "This Month" page shows current reality
- "Future" page shows next month projections

### 4. Real-time Calculations
- Dashboard recalculates when data changes
- Uses React state and useEffect for data fetching
- Refresh mechanism ensures UI stays in sync with database

### 5. Edit/Delete Capabilities
- All data points are editable
- Delete requires confirmation
- Loan-related transactions must be edited via loan interface

---

## Technical Architecture

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **State Management**: React hooks (useState, useEffect)
- **Routing**: Next.js App Router with client/server components

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (available but not heavily used)
- **API**: Supabase REST API via JavaScript client

### Key Utilities
- `processRecurringItems`: Processes recurring items and creates transactions
- `archiveMonthlySnapshot`: Creates monthly summary snapshots (future archival feature)
- Date utilities using `date-fns` library

---

## Data Flow Examples

### Example 1: Creating a Loan

```
User creates loan (I lent $100 to Friend)
  ↓
Loan record created in `loans` table
  - lender_id: current_user_id
  - borrower_id: friend_id
  - amount: 100
  - remaining_amount: 100
  - status: 'active'
  ↓
Transaction created in `transactions` table
  - type: 'loan_given'
  - amount: 100
  - loan_id: new_loan_id
  - user_id: current_user_id
```

### Example 2: Recurring Item Processing

```
User visits dashboard
  ↓
processRecurringItems() runs
  ↓
Fetches recurring items where next_date <= today
  ↓
For each item (e.g., monthly rent):
  - Check if transaction exists this month
  - If not, create transaction
  - Update next_date to next month
```

### Example 3: Loan Repayment

```
User makes $30 repayment on $100 loan
  ↓
Update loan record:
  - remaining_amount: 70 (100 - 30)
  ↓
Create transaction:
  - type: 'loan_repayment'
  - amount: 30
  - loan_id: loan_id
  ↓
If remaining_amount = 0:
  - Update status to 'repaid'
```

---

## Future Enhancements (Potential)

1. **Notifications**: Alert users about upcoming due dates
2. **Loan Interest**: Track interest on loans
3. **Categories Customization**: Allow users to create custom categories
4. **Reports & Analytics**: Monthly/yearly reports and charts
5. **Export**: Export transactions to CSV/PDF
6. **Multi-Currency**: Support for multiple currencies
7. **Budgeting**: Set budgets and track against them
8. **Recurring Item Templates**: Quick-add common recurring items

---

## Summary

Clear provides a transparent, straightforward approach to personal finance management by:
- **Logging everything**: All financial activity is tracked as transactions
- **Social loans**: Easily manage loans with friends on the platform
- **Automatic processing**: Recurring items create transactions automatically
- **Future clarity**: Forecast next month's cash flow based on loans and recurring items
- **User control**: Full edit/delete capabilities on all data
- **Privacy first**: Row Level Security ensures users only see their own data

The system is designed to give users complete visibility into their financial situation today, and clear predictions about tomorrow.

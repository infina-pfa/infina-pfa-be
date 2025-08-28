# User Financial Action API - Field Mapping Guide for QA

## API Response Structure & Database Mapping

This document shows exactly where each field in the API response comes from in the database and how to verify its value.

## API Response Fields

### 1. `pyf.pyfAmount`

**Description:** Monthly PYF (Pay Yourself First) target amount  
**Database Table:** `onboarding_profiles`  
**Database Column:** `pyf_amount`  
**Data Type:** Decimal  
**How to Verify:**

- Look in the `onboarding_profiles` table for the user
- Check the `pyf_amount` column value
- If the value is null, the API returns 0 as default

**Notes:**

- This is the target amount user should save monthly
- Set during onboarding process

---

### 2. `pyf.currentPyf`

**Description:** Total amount saved this month  
**Database Table:** `transactions`  
**Calculation:** Sum of all `goal_contribution` transactions in current month  
**How to Verify:**

- Find all transactions for the user with type = 'goal_contribution'
- Filter only transactions from the 1st day of current month to now
- Add up all the amounts
- If no transactions found, the value is 0

**Example:**

- If today is December 25, 2024
- Look for transactions from December 1, 2024 to December 25, 2024
- Sum all amounts where type = 'goal_contribution'

---

### 3. `pyf.pyfAt`

**Description:** Date of the most recent PYF transaction  
**Database Table:** `transactions`  
**Database Column:** `created_at` of latest goal_contribution  
**How to Verify:**

- Find all transactions for the user with type = 'goal_contribution'
- Filter only transactions from current month
- Get the most recent transaction's created_at date
- If no transactions exist, the value is null

**Notes:**

- Only considers current month transactions
- Returns the timestamp of the last PYF contribution

---

### 4. `pyf.reasonNotPyf`

**Description:** User's reason for not completing PYF  
**Database Table:** `onboarding_profiles`  
**Database Column:** `pyf_metadata` (JSON field)  
**JSON Path:** `pyf_metadata.reasonNotPyf`  
**How to Verify:**

- Look in `onboarding_profiles` table for the user
- Check the `pyf_metadata` JSON column
- Extract the `reasonNotPyf` value from the JSON

**Example JSON:**

```json
{
  "reasonNotPyf": "Waiting for salary",
  "reminderDate": "2024-12-28"
}
```

**Notes:**

- Will be null if user hasn't deferred PYF
- Stored as text within the JSON structure

---

### 5. `pyf.reminderDate`

**Description:** Date when user wants to be reminded about PYF  
**Database Table:** `onboarding_profiles`  
**Database Column:** `pyf_metadata` (JSON field)  
**JSON Path:** `pyf_metadata.reminderDate`  
**How to Verify:**

- Look in `onboarding_profiles` table for the user
- Check the `pyf_metadata` JSON column
- Extract the `reminderDate` value from the JSON

**Notes:**

- Will be null if no reminder is set
- Stored as date string in ISO format (YYYY-MM-DD)

---

### 6. `recordSpending.recorded`

**Description:** Whether user has recorded spending (true/false)  
**Database Tables:** `onboarding_profiles` and `transactions`  
**Logic Depends On:** `budgeting_style` in onboarding_profiles

#### For `detail_tracker` style users:

**Logic:** User must have at least one `budget_spending` transaction TODAY
**How to Verify:**

1. Check user's `budgeting_style` in `onboarding_profiles` table
2. If style is `detail_tracker`, look for transactions where:
   - Type is `budget_spending`
   - Created date is today
3. If at least one transaction exists for today, `recorded` = true
4. Otherwise, `recorded` = false

#### For `goal_focused` style users:

**Logic:** User must have at least one `budget_spending` transaction THIS WEEK (from Monday to today)
**How to Verify:**

1. Check user's `budgeting_style` in `onboarding_profiles` table
2. If style is `goal_focused`, look for transactions where:
   - Type is `budget_spending`
   - Created date is between this Monday and today
3. If at least one transaction exists in this period, `recorded` = true
4. Otherwise, `recorded` = false

**Example:**

- If today is Thursday, check for transactions from Monday to Thursday
- If today is Monday, check for transactions on Monday only

---

### 7. `recordSpending.lastRecordedAt`

**Description:** Date of last spending transaction  
**Database Table:** `transactions`  
**Database Column:** `created_at` of latest budget_spending  
**How to Verify:**

- Find all transactions for the user with type = 'budget_spending'
- Get the most recent transaction's created_at date
- This looks at ALL spending transactions, not just current month

**Notes:**

- Returns null if no spending transactions exist
- Shows the last time user recorded any expense

---

### 8. `setupNextBudget`

**Description:** Whether budget for next month is created (true/false)  
**Database Table:** `budgets`  
**Logic:** Check if budget exists for next calendar month  
**How to Verify:**

1. Determine what next month is:
   - If current month is December 2024, next month is January 2025
   - If current month is November 2024, next month is December 2024
2. Look in `budgets` table for a record where:
   - user_id matches the user
   - month equals next month number (1-12)
   - year equals the correct year
3. If at least one budget exists, `setupNextBudget` = true
4. Otherwise, `setupNextBudget` = false

**Examples:**

- Current: December 2024 → Look for: month=1, year=2025
- Current: November 2024 → Look for: month=12, year=2024
- Current: January 2024 → Look for: month=2, year=2024

---

## Quick Reference Table

| API Field                       | Database Table                     | Column/Calculation         | Transaction Type  |
| ------------------------------- | ---------------------------------- | -------------------------- | ----------------- |
| `pyf.pyfAmount`                 | onboarding_profiles                | pyf_amount                 | -                 |
| `pyf.currentPyf`                | transactions                       | SUM(amount)                | goal_contribution |
| `pyf.pyfAt`                     | transactions                       | MAX(created_at)            | goal_contribution |
| `pyf.reasonNotPyf`              | onboarding_profiles                | pyf_metadata->reasonNotPyf | -                 |
| `pyf.reminderDate`              | onboarding_profiles                | pyf_metadata->reminderDate | -                 |
| `recordSpending.recorded`       | transactions + onboarding_profiles | Based on budgeting_style   | budget_spending   |
| `recordSpending.lastRecordedAt` | transactions                       | MAX(created_at)            | budget_spending   |
| `setupNextBudget`               | budgets                            | EXISTS for next month/year | -                 |

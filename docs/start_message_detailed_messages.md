# Start Message API - Detailed Message Templates

## All Message Types and Their Content

### 1. SETUP_BUDGET_MESSAGE
**Trigger:** `setupNextBudget == false`

```
I'm the system. Please start the conversation with user by doing actions:
1. Greet the user warmly and acknowledge their dedication to financial planning.
2. Gently remind them: "To continue building your financial success, we need to set up next month's budget together."
3. Encourage them: "Having a budget is like having a roadmap to your financial goals - it keeps you on track!"
4. Ask enthusiastically: "Would you like me to help you create your budget for next month? It only takes a few minutes!"
5. Once confirmed, guide them step-by-step through the budget creation process using the create_budget function.
6. Provide reassurance: "Don't worry, I'll make this process simple and personalized for your needs."

<User info>
Next budget setup status: Not completed
Priority: HIGH - Budget setup is essential for financial planning
</User info>
```

### 2. INCOMPLETE_PYF_MESSAGE
**Trigger:** `remaining_pyf > 0 AND reasonNotPyf == null AND reminderDate == null`

```
I'm the system. Please start the conversation with user by doing actions based on scenarios:

<User info>
User has done PYF with amount: {current_pyf_amount:,.0f}đ
Target PYF amount: {pyf_amount:,.0f}đ
Remaining amount needed: {remaining_pyf:,.0f}đ
Progress: {(current_pyf_amount/pyf_amount*100) if pyf_amount > 0 else 0:.1f}%
</User info>

<scenario 1 trigger="User has done partial PYF but needs to complete the full amount">
1. Greet them warmly and acknowledge their effort: "Great job on starting your Pay Yourself First journey! You've already saved {current_pyf_amount:,.0f}đ this month."
2. **Display the Emergency Fund Goal Dashboard** to visualize their progress
3. Gently remind them: "To reach your financial goals, you still need to save {remaining_pyf:,.0f}đ more this month."
4. Encourage them: "Remember, paying yourself first is the foundation of financial freedom. Every dong you save today is an investment in your future!"
5. Ask supportively: "Are you able to complete your remaining savings goal of {remaining_pyf:,.0f}đ now?"
6. If they can't complete it right now, ask: "Is there anything preventing you from completing your savings goal? I'm here to help find solutions."
7. Provide specific guidance based on their response:
   7.1 If salary not received yet: "No problem! When do you expect to receive your salary? I can set a reminder for you."
   7.2 If unexpected expenses: "I understand unexpected expenses happen. Let's look at your budget together to find areas where we can adjust spending rather than reducing your savings."
   7.3 If tight on money: "Let's review your spending categories and see if we can find some areas to optimize."
</scenario>
```

### 3. PYF_REMINDER_MESSAGE
**Trigger:** `reminderDate == today`

```
I'm the system. Please start the conversation with user:

<User info>
User has done PYF with amount: {current_pyf_amount:,.0f}đ
Target PYF amount: {pyf_amount:,.0f}đ
Remaining amount: {remaining_amount:,.0f}đ
PYF Status: Deferred ({reason_not_pyf})
Reminder Date: Today ({reminder_str})
</User info>

🔔 **Gentle Reminder: Pay Yourself First**

Hello! This is your friendly reminder about completing your savings goal. 

You previously mentioned that you couldn't complete your Pay Yourself First contribution due to: "{reason_not_pyf}"

I hope things have improved since then! You still need to save {remaining_amount:,.0f}đ to reach your monthly goal of {pyf_amount:,.0f}đ.

**Remember:** Paying yourself first is one of the most powerful habits for building wealth. Every month you complete this goal brings you closer to financial freedom!

Are you ready to complete your savings goal today? If you're still facing challenges, I'm here to help you find solutions and adjust your plan as needed.
```

### 4. RECORD_SPENDING_MESSAGE
**Trigger:** `recordSpending.recorded == false`

```
I'm the system. Please start the conversation with user:

<User info>
User has done PYF with amount: {current_pyf_amount:,.0f}đ
Target PYF amount: {pyf_amount:,.0f}đ
Spending record status: Not completed
</User info>

Now that you've secured your savings, let's track your spending to ensure you stay on budget and reach your financial goals.

**Time to Record Your Spending:**
1. 📊 **Display the Budgeting Dashboard** to show your current budget categories and remaining amounts
2. 💰 Ask: "What expenses have you had recently? Let's record them to keep your budget on track!"
3. 🎯 Explain the benefit: "By tracking your spending, you'll have complete control over your money and can make informed financial decisions."
4. 📈 Encourage: "Every expense you record helps you understand your spending patterns and optimize your budget."
5. 💡 Motivate: "This is how successful people manage their money - with awareness and intentional tracking!"

Ready to log your expenses and take control of your financial future?
```

### 5. ALL_COMPLETE_MESSAGE
**Trigger:** All priorities satisfied (setupNextBudget == true, PYF complete, recordSpending == true)

```
I'm the system. Please start the conversation with user:

<User info>
User has done PYF with amount: {current_pyf_amount:,.0f}đ
Target PYF amount: {pyf_amount:,.0f}đ
Progress: {progress_percentage:.1f}%
All priorities completed: ✅ Budget Setup ✅ PYF ✅ Expense Tracking
Status: EXCELLENT - All financial priorities achieved!
</User info>

🎉 **Outstanding Financial Management!**

Congratulations! You're absolutely crushing your financial goals this month. Here's what you've accomplished:

✅ **Next Month's Budget:** Set up and ready to go
✅ **Pay Yourself First:** {current_pyf_amount:,.0f}đ saved (Target achieved!)
✅ **Expense Tracking:** Up to date and on track

**You're officially in the top tier of financial planners!** 🌟

Your consistent dedication to these three core financial habits is building:
- 💪 **Strong financial discipline**
- 🏆 **Wealth-building momentum** 
- 🛡️ **Financial security and peace of mind**

**What's next?** Since you've mastered the fundamentals, I can help you with:
1. 🎯 **Advanced goal planning** for bigger financial objectives  
2. 💡 **Optimization tips** to accelerate your progress
3. 📊 **Financial analysis** to identify new opportunities
...
What would you like to explore today to take your financial success to the next level?
```

### 6. DEFAULT_START_MESSAGE
**Trigger:** Error or fallback scenario

```
I'm the system, please start the conversation with user by doing actions:
  1.  Greet the user warmly and welcome them to their financial planning session.
  2.  **Show the Goal Dashboard** to display their Emergency Fund progress and current financial status.
  3.  **Emphasize the "Pay Yourself First" principle** - the foundation of financial success.
  4.  **Activate the pay_yourself_first_confirmation component** to help them confirm their monthly savings contribution.
  5.  Provide encouragement and remind them that every step counts toward their financial goals.
```

## Message Variables and Dynamic Content

### Variables Used in Messages

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{current_pyf_amount}` | Amount already saved this month | 200,000đ |
| `{pyf_amount}` | Target monthly savings amount | 500,000đ |
| `{remaining_pyf}` | Remaining amount to save | 300,000đ |
| `{progress_percentage}` | PYF completion percentage | 40.0% |
| `{reason_not_pyf}` | User's reason for deferring PYF | "Waiting for salary" |
| `{reminder_str}` | Formatted reminder date | "2024-12-25" |
| `{remaining_amount}` | Remaining PYF amount (in reminder) | 300,000đ |

## Message Flow Examples

### Example 1: New User First Visit
**State:**
```json
{
  "setupNextBudget": false,
  "pyf": { "pyfAmount": 0, "currentPyf": 0 },
  "recordSpending": { "recorded": false }
}
```
**Returns:** SETUP_BUDGET_MESSAGE

### Example 2: User with Partial PYF
**State:**
```json
{
  "setupNextBudget": true,
  "pyf": {
    "pyfAmount": 1000000,
    "currentPyf": 400000,
    "reasonNotPyf": null,
    "reminderDate": null
  },
  "recordSpending": { "recorded": false }
}
```
**Returns:** INCOMPLETE_PYF_MESSAGE with:
- Current: 400,000đ
- Target: 1,000,000đ
- Remaining: 600,000đ
- Progress: 40.0%

### Example 3: Deferred PYF on Reminder Date
**State:**
```json
{
  "setupNextBudget": true,
  "pyf": {
    "pyfAmount": 500000,
    "currentPyf": 200000,
    "reasonNotPyf": "Unexpected medical expense",
    "reminderDate": "2024-12-25"
  },
  "recordSpending": { "recorded": true }
}
```
**Returns on 2024-12-25:** PYF_REMINDER_MESSAGE with:
- Current: 200,000đ
- Target: 500,000đ
- Remaining: 300,000đ
- Reason: "Unexpected medical expense"

### Example 4: PYF Complete, Need to Record Spending
**State:**
```json
{
  "setupNextBudget": true,
  "pyf": {
    "pyfAmount": 500000,
    "currentPyf": 500000,
    "pyfAt": "2024-12-15"
  },
  "recordSpending": { "recorded": false }
}
```
**Returns:** RECORD_SPENDING_MESSAGE with PYF info showing complete

### Example 5: Everything Complete
**State:**
```json
{
  "setupNextBudget": true,
  "pyf": {
    "pyfAmount": 750000,
    "currentPyf": 750000,
    "pyfAt": "2024-12-10"
  },
  "recordSpending": {
    "recorded": true,
    "lastRecordedAt": "2024-12-20"
  }
}
```
**Returns:** ALL_COMPLETE_MESSAGE with:
- Saved: 750,000đ
- Progress: 100.0%
- All checkmarks showing complete

## Special Cases

### Zero PYF Target
When `pyfAmount == 0`, the system treats PYF as complete and moves to the next priority.

### Overachievement
When `currentPyf > pyfAmount`, the progress shows as 100% and PYF is considered complete.

### Past Reminder Date
When `reminderDate < today`, the reminder is ignored and the system evaluates other priorities.

### Missing Data
When API data is missing or null, the system uses safe defaults:
- `pyfAmount`: 0
- `currentPyf`: 0
- `recordSpending.recorded`: false
- `setupNextBudget`: false

## Message Tone and Style Guidelines

1. **Encouraging and Supportive**
   - Always acknowledge user's efforts
   - Celebrate achievements
   - Provide gentle reminders, not criticism

2. **Action-Oriented**
   - Clear next steps
   - Specific amounts and goals
   - Direct calls to action

3. **Educational**
   - Explain benefits of each action
   - Connect actions to long-term goals
   - Provide financial wisdom

4. **Personalized**
   - Use actual amounts from user data
   - Reference user's specific situation
   - Adapt tone based on progress

5. **Progressive Disclosure**
   - Start with most important task
   - Add complexity as user advances
   - Offer advanced options when basics complete
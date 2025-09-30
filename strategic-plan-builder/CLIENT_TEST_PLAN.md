# Strategic Plan Builder - Client Test Plan

Welcome to the Strategic Plan Builder test environment! This document will guide you through testing the core features of our strategic planning platform. You'll learn how to create districts, develop strategic objectives, and track performance metrics.

## 🎯 Test Objectives

By completing this test plan, you will evaluate:
- **District Management**: Creating and managing school districts
- **Strategic Objective Creation**: Building comprehensive strategic objectives using our guided wizard
- **Goal Hierarchy**: Creating multi-level goals (Objectives → Goals → Sub-goals)
- **Metrics & Tracking**: Setting up measurable outcomes and tracking progress
- **Public Dashboard**: Viewing the public-facing strategic plan

## 🚀 Getting Started

**Application URL**: `http://localhost:3000`

**What You'll See**: The Strategic Plan Builder homepage with options to create new districts or select existing ones.

---

## Test Scenario 1: District Creation

### 📋 Test Steps

1. **Navigate to Homepage**
   - Open `http://localhost:3000`
   - You should see the Strategic Plan Builder homepage

2. **Create New District**
   - On the right side, find the "Create New District" card
   - Enter District Name: `"Lincoln Public Schools"`
   - Notice the URL Slug auto-generates to: `lincoln-public-schools`
   - Click **"Create District"** button

### ✅ Expected Results
- Loading spinner appears during creation
- Success message: "District created successfully!"
- Automatically redirected to `/dashboard/lincoln-public-schools`
- You should see the district dashboard with an empty state

### 🔍 Validation Points
- ✓ District appears in the left panel on homepage refresh
- ✓ URL slug is properly formatted (lowercase, hyphenated)
- ✓ District dashboard loads without errors

---

## Test Scenario 2: Creating Your First Strategic Objective

### 📋 Test Steps

1. **Access Strategic Goals**
   - From the district dashboard (`/dashboard/lincoln-public-schools`)
   - Click on **"Strategic Goals"** tab or section

2. **Launch Objective Wizard**
   - Look for **"Add Strategic Objective"** or similar button
   - Click to open the guided wizard

3. **Step 1: Choose or Create Objective**
   - **Option A**: Select a pre-built example like "Academic Excellence"
   - **Option B**: Create custom objective with title: "Student Achievement Excellence"
   - Add description: "Ensure all students achieve proficiency in core subjects and develop critical thinking skills"
   - Click **"Next"**

4. **Step 2: Define Goals**
   - The system should auto-generate goal number "1" for your first objective
   - Add sub-goals if prompted, such as:
     - Goal 1.1: "Reading Proficiency"
     - Goal 1.2: "Mathematics Proficiency"
   - Click **"Next"**

5. **Step 3: Add Metrics**
   - Add metrics for each goal:
     - **Reading Proficiency Rate**: 85% target, current: 78%
     - **Math Assessment Scores**: 90% target, current: 82%
     - **Student Engagement**: 95% target, current: 88%
   - Select appropriate metric types (percentage, number, etc.)
   - Click **"Create Objective"**

### ✅ Expected Results
- Wizard progresses smoothly through all steps
- Success message appears upon completion
- New strategic objective appears in the dashboard
- Progress bars and metrics are visually displayed
- Goal numbering follows format: 1, 1.1, 1.2, etc.

### 🔍 Validation Points
- ✓ Objective appears with proper numbering (1)
- ✓ Sub-goals show hierarchical numbering (1.1, 1.2)
- ✓ Metrics display with current vs target values
- ✓ Progress calculations appear accurate

---

## Test Scenario 3: Adding a Second Strategic Objective

### 📋 Test Steps

1. **Create Second Objective**
   - Click **"Add Strategic Objective"** again
   - Select or create: "Community Engagement"
   - Description: "Strengthen partnerships with families and community organizations"

2. **Define Goals and Metrics**
   - Goal 2.1: "Parent Participation"
     - Metric: Parent-Teacher Conference Attendance (90% target, 75% current)
   - Goal 2.2: "Community Partnerships"
     - Metric: Active Community Partners (25 target, 18 current)

### ✅ Expected Results
- Second objective receives number "2"
- Sub-goals properly numbered as 2.1, 2.2
- Dashboard shows both objectives with individual progress

---

## Test Scenario 4: Public Dashboard Testing

### 📋 Test Steps

1. **Access Public View**
   - From the homepage, find your "Lincoln Public Schools" district
   - Click the **"View"** button (external link icon)
   - This opens `/public/lincoln-public-schools` in a new tab

2. **Explore Public Dashboard**
   - Review the strategic objectives overview
   - Check metric displays and progress indicators
   - Verify data matches what you entered

### ✅ Expected Results
- Public dashboard loads without authentication
- Clean, professional layout suitable for public viewing
- All objectives and metrics display correctly
- Progress bars and charts render properly

---

## Test Scenario 5: Editing and Updating

### 📋 Test Steps

1. **Edit Existing Objective**
   - Return to the dashboard (`/dashboard/lincoln-public-schools`)
   - Find an existing objective and click **"Edit"** or drill-down
   - Modify a metric value (e.g., update current Reading Proficiency from 78% to 80%)
   - Save changes

2. **Add New Metric**
   - Add a new metric to an existing goal
   - Example: "Student Satisfaction Survey" (85% target, 79% current)

### ✅ Expected Results
- Changes save successfully
- Progress calculations update automatically
- Public dashboard reflects changes immediately

---

## 🎯 Key Features to Validate

### District Management
- ✓ Create districts with custom names and URL slugs
- ✓ Multiple districts can coexist
- ✓ District-specific data isolation

### Strategic Objective System
- ✓ Hierarchical goal structure (3 levels: Objectives → Goals → Sub-goals)
- ✓ Automatic numbering system (1, 1.1, 1.1.1)
- ✓ Guided wizard for easy objective creation

### Metrics and Progress Tracking
- ✓ Various metric types (percentage, numbers, scores)
- ✓ Current vs target value tracking
- ✓ Automatic progress calculations
- ✓ Visual progress indicators and charts

### User Experience
- ✓ Intuitive navigation and workflows
- ✓ Responsive design (test on different screen sizes)
- ✓ Clear feedback messages and loading states

### Public Dashboard
- ✓ Professional public-facing interface
- ✓ Real-time data display
- ✓ No authentication required for viewing

---

## 🔧 Troubleshooting Common Issues

### Issue: District creation fails
**Solution**: Check that the URL slug is unique and contains only lowercase letters and hyphens

### Issue: Metrics not displaying correctly
**Solution**: Ensure both current and target values are entered as numbers, not text

### Issue: Public dashboard shows empty
**Solution**: Verify you have at least one strategic objective with metrics created

### Issue: Progress calculations seem wrong
**Solution**: Check that target values are greater than zero and current values are realistic

---

## 📊 Expected Test Outcomes

After completing this test plan, you should have:

1. **Created a functional district** with professional URL structure
2. **Built 2-3 strategic objectives** with hierarchical goals
3. **Configured 5-8 metrics** with realistic targets and current values
4. **Validated the public dashboard** displays correctly
5. **Tested edit functionality** and real-time updates

### Sample Data Structure You Should Have Created:

```
Lincoln Public Schools (/lincoln-public-schools)
├── 1. Student Achievement Excellence
│   ├── 1.1 Reading Proficiency
│   │   └── Reading Proficiency Rate: 80% current / 85% target
│   └── 1.2 Mathematics Proficiency
│       └── Math Assessment Scores: 82% current / 90% target
└── 2. Community Engagement
    ├── 2.1 Parent Participation
    │   └── Conference Attendance: 75% current / 90% target
    └── 2.2 Community Partnerships
        └── Active Partners: 18 current / 25 target
```

---

## 💡 Advanced Testing (Optional)

If you want to test more advanced features:

1. **Multi-level Goals**: Create objectives with 3-level hierarchy (1.1.1, 1.1.2)
2. **Multiple Districts**: Create a second district to test data isolation
3. **Various Metric Types**: Test different units (percentages, dollar amounts, counts)
4. **Data Export**: Look for any export or reporting functionality

---

## 📞 Support & Feedback

During testing, please note:
- Any bugs or unexpected behavior
- User experience feedback
- Features that would enhance your workflow
- Questions about implementation in your environment

**Technical Requirements Met:**
- ✅ Modern web application (Next.js 14)
- ✅ Real-time data updates
- ✅ Professional UI/UX design
- ✅ Mobile-responsive interface
- ✅ Secure data management
- ✅ Public dashboard capabilities

---

*This test plan validates the core functionality of the Strategic Plan Builder. For production deployment, additional features like user authentication, data backup, and advanced reporting would be configured based on your specific requirements.*
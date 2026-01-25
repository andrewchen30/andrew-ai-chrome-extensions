# Website Blocker Test Plan

## Feature Description
A content script that blocks access to distracting websites with a full-screen overlay. Users can configure blocking rules with time schedules, exception URLs, and unlock duration. Users must enter a password (`andrew20`) and wait 30 seconds to unlock the site.

## Core Features
1. **Blocking Rules**: Each domain can have custom blocking rules
2. **Time-based Blocking**: Configure blocking schedules for weekdays and weekends (30-minute intervals)
3. **Exception URLs**: Whitelist specific URLs within blocked domains
4. **Unlock Duration**: Customizable unlock duration per rule (1-120 minutes)
5. **Statistics**: Track trigger counts for each rule
6. **Data Migration**: Automatic migration from old domain list format

## Trigger Conditions
- Navigate to any URL matching an enabled blocking rule
- The rule must be enabled and match the current time schedule
- The URL must not be in the exception list
- The blocker should initialize immediately (`document_start`)

## Expected Behavior

### Basic Blocking
1. **Overlay**: A white full-screen overlay appears covering the entire page content.
2. **Scroll Lock**: The detailed page content should not be scrollable.
3. **Password Prompt**: Input field and "Start Unlock" (開始解鎖) button are visible.
4. **Incorrect Password**: Shake animation on input field, red border.
5. **Correct Password**: Transition to countdown screen.
6. **Countdown**: 30-second timer counts down to 0.
7. **Unlock**: Overlay fades out and is removed; page becomes scrollable.
8. **Timer Bar**: Top timer bar shows remaining unlock time.

### Time-based Blocking
- Rules only trigger during configured time ranges
- Weekdays (Monday-Friday) and weekends (Saturday-Sunday) can have different schedules
- "All-day" option blocks 24/7
- "None" option disables blocking for that day type
- Time ranges use 30-minute intervals (e.g., 00:00, 00:30, 01:00...23:30)

### Exception URLs
- URLs matching exception patterns are not blocked
- Exception patterns are checked using `includes()` matching

### Statistics
- Each rule trigger is recorded
- Statistics are displayed in the admin page
- Statistics can be reset

## Manual Test Steps

### 1. Extension Setup
1. **Load Extension**: Ensure the latest version is loaded in `chrome://extensions`.
2. **Open Options Page**: Right-click extension icon → Options, or go to `chrome://extensions` → Options

### 2. Data Migration Test
1. **Check Old Data** (if exists):
   - Open Chrome DevTools → Application → Storage → chrome.storage.sync
   - Check if `blockedDomains` exists
2. **Visit Blocked Site**: Go to `https://www.youtube.com`
3. **Verify Migration**:
   - Check chrome.storage.sync for `blockingRules` array
   - Verify old `blockedDomains` and `domainTimers` are removed
   - Verify rules are created with default settings (all-day blocking)

### 3. Basic Blocking Test
1. **Visit YouTube**: Go to `https://www.youtube.com`
2. **Verify Block**:
   - Check if the "Focus Mode Active" (專注模式已啟動) screen is visible.
   - Try to scroll the page; it should be locked.
   - Inspect Element: Look for `<div id="andrew-ai-blocker-host">` at the end of `<body>` or `<html>`. Verify it contains a `#shadow-root`.
3. **Test Wrong Password**:
   - Enter `wrongpass`.
   - Press Enter or Click "Start Unlock" (開始解鎖).
   - Verify input shakes and turns red.
4. **Test Correct Password**:
   - Enter `andrew20`.
   - Click "Start Unlock".
   - Verify the countdown starts at 30.
5. **Test Countdown Completion**:
   - Wait for the timer to reach 0.
   - Verify the overlay fades out.
   - Verify top timer bar appears showing unlock duration.
   - Verify you can now interact with YouTube.

### 4. Rules Configuration Test
1. **Open Options Page**
2. **Add New Rule**:
   - Click "+ 新增規則" button
   - Enter domain: `reddit.com`
   - Verify rule card appears
3. **Configure Rule**:
   - Toggle enable/disable checkbox
   - Change unlock duration (e.g., 30 minutes)
   - Set weekday schedule to "時間範圍" → 09:00 to 17:00
   - Set weekend schedule to "整日"
   - Add exception URL: `/r/programming`
   - Verify all changes save automatically
4. **Delete Rule**:
   - Click "刪除" button on a rule
   - Confirm deletion
   - Verify rule is removed

### 5. Time-based Blocking Test
1. **Create Test Rule**:
   - Add rule for `youtube.com`
   - Set weekday schedule: "時間範圍" → 09:00 to 17:00
   - Set weekend schedule: "不封鎖"
2. **Test Weekday Blocking** (if current day is Monday-Friday):
   - Check current Taiwan time
   - If time is between 09:00-17:00: Visit YouTube → Should be blocked
   - If time is outside 09:00-17:00: Visit YouTube → Should NOT be blocked
3. **Test Weekend Blocking** (if current day is Saturday-Sunday):
   - Visit YouTube → Should NOT be blocked (weekend schedule is "不封鎖")
4. **Test All-day Blocking**:
   - Set weekday schedule to "整日"
   - Visit YouTube → Should be blocked at any time

### 6. Exception URLs Test
1. **Configure Exception**:
   - Add rule for `youtube.com` with "整日" blocking
   - Add exception URL: `/watch`
2. **Test Exception**:
   - Visit `https://www.youtube.com` → Should be blocked
   - Visit `https://www.youtube.com/watch?v=...` → Should NOT be blocked (matches exception)
   - Visit `https://www.youtube.com/feed/trending` → Should be blocked (doesn't match exception)

### 7. Statistics Test
1. **Open Statistics Page**:
   - Click "📊 統計" in sidebar
2. **Verify Statistics Display**:
   - Table shows all rules with their domains
   - Shows enabled/disabled status
   - Shows trigger count (should be 0 initially)
3. **Trigger Rules**:
   - Visit blocked sites multiple times
   - Return to statistics page
   - Verify trigger counts increase
4. **Reset Statistics**:
   - Click "重置統計" button
   - Confirm reset
   - Verify all counts reset to 0

### 8. Unlock Duration Test
1. **Configure Unlock Duration**:
   - Set rule unlock duration to 5 minutes
2. **Unlock Site**:
   - Enter password and complete countdown
   - Verify top timer bar shows remaining time
   - Wait for timer to expire
   - Verify site is blocked again after duration expires

### 9. Multiple Rules Test
1. **Create Multiple Rules**:
   - Rule 1: `youtube.com` - Weekdays 09:00-17:00
   - Rule 2: `facebook.com` - All-day
   - Rule 3: `reddit.com` - Weekends only
2. **Test Rule Matching**:
   - Visit each site at different times
   - Verify correct rules are triggered
   - Check statistics to verify correct rule IDs are recorded

### 10. Edge Cases Test
1. **Empty Rules List**:
   - Delete all rules
   - Visit previously blocked sites → Should NOT be blocked
2. **Disabled Rule**:
   - Disable a rule
   - Visit matching site → Should NOT be blocked
3. **Invalid Time Range**:
   - Set start time after end time (e.g., 17:00 to 09:00)
   - Verify system handles gracefully (may need to fix in future)
4. **Special Characters in Domain**:
   - Test with domains containing special characters
   - Verify matching works correctly

## Test Checklist

- [ ] Data migration from old format works
- [ ] Basic blocking overlay appears
- [ ] Password validation works (correct/incorrect)
- [ ] Countdown timer works
- [ ] Unlock duration timer works
- [ ] Rules can be created, edited, and deleted
- [ ] Time schedules work correctly (weekdays/weekends)
- [ ] "All-day" option works
- [ ] "None" option works (no blocking)
- [ ] Time range selection works (30-minute intervals)
- [ ] Exception URLs work correctly
- [ ] Statistics tracking works
- [ ] Statistics reset works
- [ ] Multiple rules work independently
- [ ] Disabled rules don't trigger
- [ ] Top timer bar displays correctly
- [ ] Page scrolling is locked when blocked
- [ ] Shadow DOM isolation works

## Known Issues / Future Improvements
- Time range validation (start > end) not currently enforced
- No visual indication when rule is active vs inactive based on time
- Statistics don't show historical trends
- No export/import functionality for rules

# Website Blocker Test Plan

## Feature Description
A content script that blocks access to distracting websites (default: facebook.com, youtube.com, chess.com) with a full-screen overlay. Users must enter a password (`andrew20`) and wait 30 seconds to unlock the site.

## Trigger Conditions
- Navigate to any URL containing: `facebook.com`, `youtube.com`, or `chess.com`.
- The blocker should initialize immediately (`document_start`).

## Expected Behavior
1.  **Overlay**: A white full-screen overlay appears covering the entire page content.
2.  **Scroll Lock**: The detailed page content should not be scrollable.
3.  **Password Prompt**: Input field and "Unlock" button are visible.
4.  **Incorrect Password**: Shake animation on input field, red border.
5.  **Correct Password**: Transition to countdown screen.
6.  **Countdown**: 30-second timer counts down to 0.
7.  **Unlock**: Overlay fades out and is removed; page becomes scrollable.

## Manual Test Steps
1.  **Load Extension**: Ensure the latest version is loaded in `chrome://extensions`.
2.  **Visit YouTube**: Go to `https://www.youtube.com`.
3.  **Verify Block**:
    -   Check if the "Focus Mode Active" (專注模式已啟動) screen is visible.
    -   Try to scroll the page; it should be locked.
    -   Inspect Element: Look for `<div id="andrew-ai-blocker-host">` at the end of `<body>` or `<html>`. Verify it contains a `#shadow-root`.
4.  **Test Wrong Password**:
    -   Enter `wrongpass`.
    -   Press Enter or Click "Start Unlock".
    -   Verify input shakes and turns red.
5.  **Test Correct Password**:
    -   Enter `andrew20`.
    -   Click "Start Unlock".
    -   Verify the countdown starts at 30.
6.  **Test Countdown Completion**:
    -   Wait for the timer to reach 0.
    -   Verify the overlay fades out.
    -   Verify you can now interact with YouTube.

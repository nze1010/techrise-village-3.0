# Task List – Phase 2 Corrections

## Phase 1 (Infrastructure) ✅
- [x] Add Firebase Storage SDK to index.html
- [x] Initialize `storage` variable in Firebase config
- [x] Fix mobile nav drawer emoji encoding
- [x] Activate member registration form event listener
- [x] Clean up duplicate nav buttons
- [x] Push baseline to GitHub

## Phase 2 (Current Session) ✅
- [x] Upgrade verify modal to 2-Factor (ID Card + LGA dropdown)
- [x] Update `verifyByIdCard()` — validate Track abbrev AND LGA
- [x] Update `openVerifyModal()` — reset LGA dropdown on open
- [x] Update `saveProfileEdits()` — Firebase Storage for photo uploads (Base64 fallback)
- [x] Add Admin "Reset Student PIN" tool to admin control panel
- [x] Add `adminResetStudentPin()` JS function
- [x] Fix CSS syntax bug (stray quote in @media block)
- [x] Add mobile fix for Village Hut composer (stacks on ≤480px)
- [x] Fix modal scrolling on small screens (max-height: 85vh)
- [x] Fix Mojibake in edit modal labels (upload, phone, facebook, twitter, instagram, github)
- [x] Fix social icons in resident cards
- [x] Fix admin stats labels
- [x] Fix footer/hero dash characters
- [x] Remove duplicate persistMemberLocally() function
- [x] Commit to GitHub (main branch)
- [/] Deploy to Firebase Hosting

## Remaining
- [ ] Update Firestore security rules (restrict public delete)
- [ ] Test 2-Factor verification end-to-end in browser

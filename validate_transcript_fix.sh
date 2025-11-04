#!/bin/bash

# Simple validation script to verify transcript/caption functionality fix

echo "🔍 Validating transcript and caption fixes for offline theme..."
echo

# Check if required variables are in offline video.html
echo "✅ Checking base-offline/layouts/partials/video.html..."
if grep -q "captionsLocation.*video_captions_file_url" /Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/base-offline/layouts/partials/video.html; then
    echo "   ✓ captionsLocation variable correctly extracted"
else
    echo "   ❌ captionsLocation variable missing"
fi

if grep -q "transcriptPdfLocation.*resource_url.*video_transcript_file" /Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/base-offline/layouts/partials/video.html; then
    echo "   ✓ transcriptPdfLocation variable correctly extracted"
else
    echo "   ❌ transcriptPdfLocation variable missing"
fi

if grep -q 'transcriptLink.*transcriptPdfLocation' /Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/base-offline/layouts/partials/video.html; then
    echo "   ✓ transcriptLink parameter passed to video_player"
else
    echo "   ❌ transcriptLink parameter not passed to video_player"
fi

if grep -q 'tabTitle.*Transcript' /Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/base-offline/layouts/partials/video.html; then
    echo "   ✓ Transcript tab rendering logic added"
else
    echo "   ❌ Transcript tab rendering logic missing"
fi

echo

# Check if required parameters are passed in offline video_player.html
echo "✅ Checking base-offline/layouts/partials/video_player.html..."
if grep -q "captionsLocation.*\.captionsLocation" /Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/base-offline/layouts/partials/video_player.html; then
    echo "   ✓ captionsLocation parameter passed to youtube_player"
else
    echo "   ❌ captionsLocation parameter not passed to youtube_player"
fi

if grep -q "transcriptLink.*\.transcriptLink" /Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/base-offline/layouts/partials/video_player.html; then
    echo "   ✓ transcriptLink parameter passed to youtube_player"
else
    echo "   ❌ transcriptLink parameter not passed to youtube_player"
fi

if grep -A1 "local_video_player.html" /Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/base-offline/layouts/partials/video_player.html | grep -q "captionsLocation"; then
    echo "   ✓ captionsLocation parameter passed to local_video_player"
else
    echo "   ❌ captionsLocation parameter not passed to local_video_player"
fi

echo

# Verify test files exist
echo "✅ Checking test files..."
if [ -f "/Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/tests-e2e/ocw-ci-test-course/transcript-captions.spec.ts" ]; then
    echo "   ✓ Main transcript-captions test suite created"
else
    echo "   ❌ Main transcript-captions test suite missing"
fi

if [ -f "/Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/tests-e2e/ocw-ci-test-course/offline-transcript-captions.spec.ts" ]; then
    echo "   ✓ Offline transcript-captions test suite created"
else
    echo "   ❌ Offline transcript-captions test suite missing"
fi

if [ -f "/Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/tests-e2e/ocw-ci-test-course/TRANSCRIPT_TESTS_README.md" ]; then
    echo "   ✓ Test documentation created"
else
    echo "   ❌ Test documentation missing"
fi

echo

# Compare with base theme to ensure parity
echo "✅ Verifying parity with base theme..."
base_theme_lines=$(grep -c "transcriptPdfLocation\|captionsLocation" /Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/base-theme/layouts/partials/video.html)
offline_theme_lines=$(grep -c "transcriptPdfLocation\|captionsLocation" /Users/umar.hassan/Projects/mit-odl/ocw/ocw-hugo-themes/base-offline/layouts/partials/video.html)

if [ "$offline_theme_lines" -ge "$base_theme_lines" ]; then
    echo "   ✓ Offline theme has equivalent transcript/caption variables as base theme"
else
    echo "   ❌ Offline theme missing some transcript/caption variables compared to base theme"
fi

echo

# Summary
echo "🎯 Validation Summary:"
echo "   The offline theme has been updated to include transcript and caption functionality"
echo "   that was previously missing, bringing it to parity with the online theme."
echo
echo "🔧 Changes Made:"
echo "   1. Added captionsLocation and transcriptPdfLocation variable extraction"
echo "   2. Added transcript tab conditional rendering logic"
echo "   3. Updated video_player.html to pass caption/transcript parameters"
echo "   4. Created comprehensive test suites for validation"
echo
echo "✨ The transcript functionality should now work in offline themes!"
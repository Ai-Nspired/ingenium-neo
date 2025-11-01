# Truth Engine Interface - React Implementation

## Overview
This is a React implementation of the Truth Engine Interface with enhanced conversation editing capabilities and local storage persistence.

## Key Features Implemented
- Editable recent conversations in the history panel
- Local storage persistence for conversations
- Theme switching (Silvery, Dark, Neo)
- AI model selection
- Export/import functionality
- TTS (Text-to-Speech) capabilities
- Session management

## Methods Required
- `saveToLocalHistory(query, answer, model)` - Save conversation to local storage
- `getLocalHistory()` - Retrieve local history
- `clearLocalHistory()` - Clear all local history
- `exportLocalHistory()` - Export history to JSON file
- `importLocalHistory(file)` - Import history from JSON file
- `addToCurrentSession(query, answer, model)` - Add to current session
- `clearCurrentSession()` - Clear current session
- `getSessionContext()` - Get session context for API calls
- `performTruthQuery(query, challengeResponse)` - Perform API query
- `newChat()` - Start new chat session
- `copyToClipboard(text, msg)` - Copy text to clipboard
- `showMessage(msg, duration)` - Show notification message
- `showExportPrompt()` - Show export reminder prompt
- `renderCombinedHistory()` - Render combined history list
- `openModal()` / `closeModal()` - Control result modal
- `openTtsMiniModal()` / `closeTtsMiniModal()` - Control TTS modal
- `startTts(text)` / `pauseTts()` / `resumeTts()` / `stopTts()` - TTS controls
- `updateTtsProgress(percent)` - Update TTS progress bar

## Files Required
- `index.jsx` - Main React component and application entry point
- `App.jsx` - Main application component
- `HistoryPanel.jsx` - History panel component
- `Modal.jsx` - Result modal component
- `TtsMiniModal.jsx` - TTS mini modal component
- `ThemeSelector.jsx` - Theme selection component
- `ModelSelector.jsx` - AI model selection component
- `ConversationList.jsx` - Conversation list component
- `Notification.jsx` - Notification message component
- `ExportPrompt.jsx` - Export reminder prompt component

## Dependencies
- React (v18+)
- React DOM
- Styled Components (for styling)
import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import HistoryPanel from './HistoryPanel';
import Modal from './Modal';
import TtsMiniModal from './TtsMiniModal';
import Notification from './Notification';
import ExportPrompt from './ExportPrompt';

// Styled Components
const StyledBody = styled.div`
  margin: 0;
  padding: 1.5rem 1rem;
  font-family: 'Crimson Pro', serif;
  font-size: 1.1rem;
  background-color: var(--bg-color);
  color: var(--text-color);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
  transition: background-color 0.3s, color 0.3s;
  width: 100%;
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem;
    align-items: flex-start;
    min-height: 90vh;
  }
`;

const TerminalWindow = styled.div`
  width: 100%;
  max-width: 800px;
  text-align: left;
`;

const TypedText = styled.div`
  font-weight: 700;
  font-size: 1.5rem;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  width: 0;
  border-right: 3px solid var(--accent-color);
  animation: blink-caret .75s step-end infinite;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    text-align: center;
    display: block;
  }

  &.is-typing {
    animation: typing 3.5s steps(40, end) forwards, blink-caret .75s step-end infinite;
  }
  
  &.is-done {
    animation: none;
    border-right: none;
    width: auto;
  }

  @keyframes typing { from { width: 0 } to { width: 100% } }
  @keyframes blink-caret { 50% { border-color: transparent; } }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  width: 100%;
  gap: 1rem;

  @media (max-width: 768px) {
    margin-top: 3rem;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const CommandLine = styled.div`
  display: flex;
  align-items: flex-end;
  flex-grow: 1;
  min-width: 0;
  width: 100%;
  position: relative;
  background: var(--content-bg);
  border: 2px solid var(--accent-color);
  border-radius: 16px;
  padding: 0.5rem;
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 0 20px rgba(var(--accent-color-rgb), 0.3);
    border-color: var(--accent-color);
  }

  @media (max-width: 768px) {
    order: 2;
    border-radius: 20px;
  }
`;

const EnterButton = styled.button`
  margin: 0.5rem;
  font-weight: bold;
  flex-shrink: 0;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--accent-color);
  color: var(--bg-color);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  align-self: flex-end;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px var(--accent-color);
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.8rem;
    position: absolute;
    right: 8px;
    bottom: 8px;
    z-index: 2;
  }
`;

const SearchInput = styled.textarea`
  background: transparent;
  border: none;
  color: var(--text-color);
  font-family: 'Crimson Pro', serif;
  font-size: 1.3rem;
  flex-grow: 1;
  outline: none;
  min-width: 0;
  width: 100%;
  padding: 1rem;
  resize: none;
  min-height: 60px;
  max-height: 200px;
  line-height: 1.5;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 1.2rem;
    min-height: 80px;
    padding-right: 70px;
  }

  &:focus {
    outline: none;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  width: 100%;

  @media (max-width: 768px) {
    order: 1;
    justify-content: space-between;
  }
`;

const IconButton = styled.button`
  padding: 0.75rem;
  border: 2px solid var(--accent-color);
  background: none;
  color: var(--accent-color);
  font-weight: 700;
  cursor: pointer;
  border-radius: 50%;
  font-size: 1.2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-decoration: none;

  @media (max-width: 768px) {
    width: 55px;
    height: 55px;
    font-size: 1.3rem;
  }

  &:hover, &:focus {
    background-color: var(--accent-color);
    color: var(--bg-color);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(var(--accent-color-rgb), 0.3);
  }
`;

const Disclaimer = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: var(--secondary-text);
  font-size: 0.8rem;
  text-align: center;
  max-width: 90vw;
`;

const App = () => {
  // State management
  const [theme, setTheme] = useState('silvery');
  const [model, setModel] = useState('WORKERS_AI');
  const [localHistory, setLocalHistory] = useState([]);
  const [currentSession, setCurrentSession] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTtsMiniOpen, setIsTtsMiniOpen] = useState(false);
  const [isExportPromptOpen, setIsExportPromptOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [typedText, setTypedText] = useState('Ai-Nspired. Truth-Engine. Connected.');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [isChallenging, setIsChallenging] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  // Storage keys
  const LOCAL_HISTORY_KEY = 'TRUTH_ENGINE_LOCAL_HISTORY';
  const CURRENT_SESSION_KEY = 'TRUTH_ENGINE_CURRENT_SESSION';

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'silvery';
    const savedModel = localStorage.getItem('truth-model') || 'WORKERS_AI';
    const savedLocalHistory = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY)) || [];
    const savedCurrentSession = JSON.parse(localStorage.getItem(CURRENT_SESSION_KEY)) || [];

    setTheme(savedTheme);
    setModel(savedModel);
    setLocalHistory(savedLocalHistory);
    setCurrentSession(savedCurrentSession);

    // Set theme on body
    document.body.setAttribute('data-mode', savedTheme);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(localHistory));
  }, [localHistory]);

  useEffect(() => {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(currentSession));
  }, [currentSession]);

  // Theme change handler
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-mode', newTheme);
    showNotification(`Theme: ${newTheme}`);
  };

  // Model change handler
  const handleModelChange = (newModel) => {
    setModel(newModel);
    localStorage.setItem('truth-model', newModel);
    showNotification(`Model: ${newModel}`);
  };

  // Show notification
  const showNotification = (message, duration = 3000) => {
    setNotification({ message, visible: true });
    setTimeout(() => setNotification({ message: '', visible: false }), duration);
  };

  // Show export prompt
  const showExportPrompt = () => {
    setIsExportPromptOpen(true);
    setTimeout(() => setIsExportPromptOpen(false), 5000);
  };

  // Save to local history
  const saveToLocalHistory = useCallback((query, answer, model) => {
    const entry = {
      id: Date.now().toString(),
      query: query,
      answer: answer,
      model: model,
      timestamp: Math.floor(Date.now() / 1000),
      source: 'local'
    };

    setLocalHistory(prev => {
      const newHistory = [entry, ...prev];
      // Keep only last 100 local entries
      if (newHistory.length > 100) {
        return newHistory.slice(0, 100);
      }
      return newHistory;
    });
    return entry;
  }, []);

  // Add to current session
  const addToCurrentSession = useCallback((query, answer, model) => {
    const sessionEntry = {
      query: query,
      answer: answer,
      model: model,
      timestamp: Math.floor(Date.now() / 1000)
    };

    setCurrentSession(prev => [sessionEntry, ...prev]);
  }, []);

  // Clear local history
  const clearLocalHistory = useCallback(() => {
    setLocalHistory([]);
    localStorage.setItem(LOCAL_HISTORY_KEY, '[]');
    showNotification('Local history cleared');
  }, []);

  // Export local history
  const exportLocalHistory = useCallback(() => {
    const exportData = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      source: "truth-engine-local",
      conversations: localHistory
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `truth-engine-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification(`Exported ${localHistory.length} conversations`);
  }, [localHistory]);

  // Import local history
  const importLocalHistory = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importedData = JSON.parse(e.target.result);
          
          if (!importedData.conversations || !Array.isArray(importedData.conversations)) {
            throw new Error('Invalid file format: missing conversations array');
          }
          
          const newEntries = importedData.conversations.filter(conv => 
            conv.query && conv.answer && !localHistory.some(existing => 
              existing.query === conv.query && existing.answer === conv.answer
            )
          );
          
          setLocalHistory(prev => [...newEntries, ...prev]);
          
          resolve({
            success: true,
            imported: newEntries.length,
            total: localHistory.length + newEntries.length
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [localHistory]);

  // Clear current session
  const clearCurrentSession = useCallback(() => {
    setCurrentSession([]);
    localStorage.setItem(CURRENT_SESSION_KEY, '[]');
  }, []);

  // Get session context
  const getSessionContext = useCallback(() => {
    return currentSession.slice(0, 5).reverse().map(entry => 
      `User: ${entry.query}\nAI: ${entry.answer}`
    ).join('\n\n');
  }, [currentSession]);

  // Perform truth query
  const performTruthQuery = useCallback(async (query, challengeResponse = '') => {
    if (!query?.trim()) {
      showNotification('Query required.');
      return;
    }
    
    setIsModalOpen(true);
    setResult(null);
    
    try {
      // Simulate API call
      const mockResponse = {
        answer: `This is a mock response to your query: "${query}". In a real implementation, this would be the actual AI response.`,
        model: model,
        created: new Date().toISOString(),
        cached: false
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to local history and session
      saveToLocalHistory(query, mockResponse.answer, model);
      addToCurrentSession(query, mockResponse.answer, model);
      
      setResult(mockResponse);
      showExportPrompt();
    } catch (err) {
      showNotification('Query failed. Saved locally only.');
      saveToLocalHistory(query, `Error: ${err.message}`, model);
    }
  }, [model, saveToLocalHistory, addToCurrentSession]);

  // New chat
  const newChat = useCallback(() => {
    if (window.confirm('Start new chat? This clears remote context but keeps your local history.')) {
      clearCurrentSession();
      showNotification('New chat started. Remote context cleared.');
    }
  }, [clearCurrentSession]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text, msg = 'Copied!') => {
    navigator.clipboard.writeText(text).then(() => showNotification(msg));
  }, []);

  // Toggle history panel
  const toggleHistory = useCallback(() => {
    setIsHistoryOpen(prev => !prev);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsTtsMiniOpen(false);
  }, []);

  // Open TTS mini modal
  const openTtsMiniModal = useCallback(() => {
    setIsTtsMiniOpen(true);
  }, []);

  // Close TTS mini modal
  const closeTtsMiniModal = useCallback(() => {
    setIsTtsMiniOpen(false);
  }, []);

  // Start TTS
  const startTts = useCallback((text) => {
    setIsTtsPlaying(true);
    // Simulate TTS progress
    const interval = setInterval(() => {
      setTtsProgress(prev => {
        if (prev >= 100) {
// Importing modules
import { sendWebhook, validateWebhookUrl } from './webhook.js';
import { showNotification, NotificationType } from './notifications.js';
import { copyToClipboard, formatTimestamp } from './utils.js';
import { initAnimations } from './animations.js';

let sentCount = 0;
let failedCount = 0;

const webhookUrlInput = document.getElementById('webhook-url');
const webhookNameInput = document.getElementById('webhook-name');
const webhookAvatarInput = document.getElementById('webhook-avatar');
const messageContentInput = document.getElementById('message-content');
const messageCountInput = document.getElementById('message-count');
const delayInput = document.getElementById('delay');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-button');
const clearResultsButton = document.getElementById('clear-results');
const pasteUrlButton = document.getElementById('paste-url');
const resultsLog = document.getElementById('results-log');
const sentCountElement = document.getElementById('sent-count');
const failedCountElement = document.getElementById('failed-count');
const successRateElement = document.getElementById('success-rate');

function initApp() {
  initAnimations();
  
  sendButton.addEventListener('click', handleSendMessages);
  clearButton.addEventListener('click', clearForm);
  clearResultsButton.addEventListener('click', clearResults);
  pasteUrlButton.addEventListener('click', handlePasteUrl);
  
  if (!messageContentInput.value) {
    messageContentInput.value = 'Hello from VOID.WTF webhook tool!';
  }
  
  setTimeout(() => {
    showNotification(
      'Welcome to VOID.WTF',
      'Discord webhook tool is ready to use.',
      NotificationType.INFO
    );
  }, 500);
}

async function handleSendMessages() {
  const webhookUrl = webhookUrlInput.value.trim();
  const webhookName = webhookNameInput.value.trim();
  const avatarUrl = webhookAvatarInput.value.trim();
  const messageContent = messageContentInput.value.trim();
  const messageCount = parseInt(messageCountInput.value, 10);
  const delay = parseInt(delayInput.value, 10);
  
  if (!validateWebhookUrl(webhookUrl)) {
    showNotification(
      'Invalid Webhook URL',
      'Please enter a valid Discord webhook URL.',
      NotificationType.ERROR
    );
    webhookUrlInput.classList.add('error-shake');
    setTimeout(() => webhookUrlInput.classList.remove('error-shake'), 500);
    return;
  }
  
  if (!messageContent) {
    showNotification(
      'Message Required',
      'Please enter a message to send.',
      NotificationType.WARNING
    );
    messageContentInput.classList.add('error-shake');
    setTimeout(() => messageContentInput.classList.remove('error-shake'), 500);
    return;
  }
  
  sendButton.classList.add('is-loading');
  sendButton.disabled = true;
  
  const webhookData = {
    content: messageContent
  };
  
  if (webhookName) webhookData.username = webhookName;
  if (avatarUrl) webhookData.avatar_url = avatarUrl;
  
  addLogEntry(`Starting to send ${messageCount} messages...`, 'info');
  
  let successCount = 0;
  for (let i = 0; i < messageCount; i++) {
    try {
      const uniqueData = { ...webhookData };
      uniqueData.content = `${messageContent} [${i + 1}/${messageCount}]`;
      
      const success = await sendWebhook(webhookUrl, uniqueData);
      
      if (success) {
        successCount++;
        sentCount++;
        sentCountElement.textContent = sentCount;
        addLogEntry(`Message ${i + 1}/${messageCount} sent successfully.`, 'success');
      } else {
        failedCount++;
        failedCountElement.textContent = failedCount;
        addLogEntry(`Failed to send message ${i + 1}/${messageCount}.`, 'error');
      }
      
      updateSuccessRate();
      
      if (i < messageCount - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      failedCount++;
      failedCountElement.textContent = failedCount;
      addLogEntry(`Error: ${error.message}`, 'error');
      updateSuccessRate();
    }
  }
  
  sendButton.classList.remove('is-loading');
  sendButton.disabled = false;
  
  const successRate = Math.round((successCount / messageCount) * 100);
  if (successCount === messageCount) {
    showNotification(
      'Success!',
      `All ${messageCount} messages sent successfully.`,
      NotificationType.SUCCESS
    );
  } else if (successCount > 0) {
    showNotification(
      'Partially Completed',
      `Sent ${successCount}/${messageCount} messages (${successRate}%).`,
      NotificationType.WARNING
    );
  } else {
    showNotification(
      'Failed',
      'Failed to send any messages. Check the logs for details.',
      NotificationType.ERROR
    );
  }
}

async function handlePasteUrl() {
  try {
    const text = await navigator.clipboard.readText();
    if (validateWebhookUrl(text)) {
      webhookUrlInput.value = text;
      showNotification(
        'URL Pasted',
        'Webhook URL pasted from clipboard.',
        NotificationType.SUCCESS
      );
    } else {
      showNotification(
        'Invalid URL',
        'The clipboard content is not a valid webhook URL.',
        NotificationType.WARNING
      );
    }
  } catch (error) {
    showNotification(
      'Clipboard Error',
      'Unable to read from clipboard. Check permissions.',
      NotificationType.ERROR
    );
  }
}

function addLogEntry(message, type) {
  const entry = document.createElement('div');
  entry.classList.add('log-entry', `log-${type}`);
  
  const timestamp = document.createElement('span');
  timestamp.classList.add('log-timestamp');
  timestamp.textContent = formatTimestamp(new Date());
  
  const content = document.createElement('span');
  content.textContent = message;
  
  entry.appendChild(timestamp);
  entry.appendChild(content);
  
  resultsLog.appendChild(entry);
  
  resultsLog.scrollTop = resultsLog.scrollHeight;
  
  entry.classList.add('fade-in');
}

function updateSuccessRate() {
  const total = sentCount + failedCount;
  const rate = total === 0 ? 0 : Math.round((sentCount / total) * 100);
  successRateElement.textContent = `${rate}%`;
  
  if (rate >= 90) {
    successRateElement.style.color = 'var(--success)';
  } else if (rate >= 50) {
    successRateElement.style.color = 'var(--warning)';
  } else {
    successRateElement.style.color = 'var(--error)';
  }
}

function clearForm() {
  webhookNameInput.value = '';
  webhookAvatarInput.value = '';
  messageContentInput.value = '';
  messageCountInput.value = '5';
  delayInput.value = '1000';
  
  showNotification(
    'Form Cleared',
    'All form fields have been reset.',
    NotificationType.INFO
  );
}

function clearResults() {
  resultsLog.innerHTML = '';
  sentCount = 0;
  failedCount = 0;
  sentCountElement.textContent = '0';
  failedCountElement.textContent = '0';
  successRateElement.textContent = '0%';
  
  showNotification(
    'Results Cleared',
    'All results have been cleared.',
    NotificationType.INFO
  );
}

document.addEventListener('DOMContentLoaded', initApp);

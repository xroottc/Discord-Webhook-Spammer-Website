/**
 * Functions for handling Discord webhook operations
 */

export function validateWebhookUrl(url) {
  if (!url) return false;
  
  const discordWebhookPattern = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
  return discordWebhookPattern.test(url);
}

export async function sendWebhook(webhookUrl, data) {
  try {
    if (data.content) {
      data.content = appendRandomNonce(data.content);
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.status === 204) {
      return true;
    }
    
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after') || errorData.retry_after || 5;
      console.warn(`Rate limited. Retry after ${retryAfter} seconds.`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      return sendWebhook(webhookUrl, data);
    }
    
    console.error('Webhook error:', response.status, errorData);
    return false;
  } catch (error) {
    console.error('Webhook exception:', error);
    return false;
  }
}

function appendRandomNonce(content) {
  const nonce = '\u200B' + Math.random().toString(36).substring(2);
  return content + nonce;
}

export async function getWebhookInfo(webhookUrl) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'GET',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching webhook info:', error);
    return null;
  }
}

export function createEmbed(title, description, color = 0x00FFFF, fields = []) {
  return {
    title,
    description,
    color,
    fields: fields.map(field => ({
      name: field.name,
      value: field.value,
      inline: field.inline || false,
    })),
    timestamp: new Date().toISOString(),
  };
}

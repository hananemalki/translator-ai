const API_BASE = 'http://localhost:8080/api';

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidePanelWithText') {
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
    chrome.storage.local.set({ pendingText: request.text });
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'translate') {
    handleTranslate(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'translateImage') {
    handleTranslateImage(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'translateAudio') {
    handleTranslateAudio(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'login') {
    handleLogin(request.credentials)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'signup') {
    handleSignup(request.userData)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'logout') {
    chrome.storage.local.remove(['user', 'token']);
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'createComplaint') {
    handleCreateComplaint(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'getMyComplaints') {
    handleGetMyComplaints()
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'getAllComplaints') {
    handleGetAllComplaints()
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'updateComplaintStatus') {
    handleUpdateComplaintStatus(request.id, request.status)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'addComplaintResponse') {
    handleAddComplaintResponse(request.id, request.response)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'updateComplaintPriority') {
    handleUpdateComplaintPriority(request.id, request.priority)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'getAllUsers') {
    handleGetAllUsers()
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'promoteToAdmin') {
    handlePromoteToAdmin(request.userId)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleLogin(credentials) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  const data = await response.json();
  
  await chrome.storage.local.set({
    user: {
      username: data.username,
      email: data.email,
      roles: data.roles
    },
    token: data.token
  });
  
  return data;
}

async function handleSignup(userData) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }
  
  const data = await response.json();
  
  await chrome.storage.local.set({
    user: {
      username: data.username,
      email: data.email,
      roles: data.roles
    },
    token: data.token
  });
  
  return data;
}

async function handleTranslate(requestData) {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${storage.token}`
  };
  
  const response = await fetch(`${API_BASE}/translator/translate/text`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    const error = await response.json();
    throw new Error(error.message || 'Translation failed');
  }
  
  return await response.json();
}

async function handleTranslateImage(requestData) {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${storage.token}`
  };
  
  const response = await fetch(`${API_BASE}/translator/translate/image-base64`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    const error = await response.json();
    throw new Error(error.message || 'Image translation failed');
  }
  
  return await response.json();
}

async function handleTranslateAudio(requestData) {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${storage.token}`
  };
  
  const response = await fetch(`${API_BASE}/translator/translate/audio-base64`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    const error = await response.json();
    throw new Error(error.message || 'Audio translation failed');
  }
  
  return await response.json();
}

async function handleCreateComplaint(complaintData) {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const response = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${storage.token}`
    },
    body: JSON.stringify(complaintData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create complaint');
  }
  
  return await response.json();
}

async function handleGetMyComplaints() {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const response = await fetch(`${API_BASE}/complaints/my-complaints`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${storage.token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to load complaints');
  }
  
  return await response.json();
}

async function handleGetAllComplaints() {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const response = await fetch(`${API_BASE}/complaints/all`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${storage.token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to load complaints');
  }
  
  return await response.json();
}

async function handleUpdateComplaintStatus(id, status) {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const response = await fetch(`${API_BASE}/complaints/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${storage.token}`
    },
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update status');
  }
  
  return await response.json();
}

async function handleAddComplaintResponse(id, responseText) {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const response = await fetch(`${API_BASE}/complaints/${id}/response`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${storage.token}`
    },
    body: JSON.stringify({ response: responseText })
  });
  
  if (!response.ok) {
    throw new Error('Failed to add response');
  }
  
  return await response.json();
}

async function handleUpdateComplaintPriority(id, priority) {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const response = await fetch(`${API_BASE}/complaints/${id}/priority`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${storage.token}`
    },
    body: JSON.stringify({ priority })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update priority');
  }
  
  return await response.json();
}

async function handleGetAllUsers() {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const response = await fetch(`${API_BASE}/auth/users`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${storage.token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to load users');
  }
  
  return await response.json();
}

async function handlePromoteToAdmin(userId) {
  const storage = await chrome.storage.local.get(['token']);
  
  if (!storage.token) {
    throw new Error('Please login first');
  }
  
  const response = await fetch(`${API_BASE}/auth/${userId}/promote-to-admin`, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${storage.token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to promote user');
  }
  
  return await response.json();
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Darija Translator Extension installed');
});
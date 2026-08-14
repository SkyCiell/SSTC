const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generate or refine code from UI screenshot
 */
export async function generateCodeAPI(
  fileOrBase64,
  framework = 'react-tailwind',
  customPrompt = '',
  options = {}
) {
  const { isRefinement = false, previousCode = '' } = options;
  let response;

  if (fileOrBase64 instanceof File) {
    const formData = new FormData();
    formData.append('image', fileOrBase64);
    formData.append('framework', framework);
    if (customPrompt) formData.append('customPrompt', customPrompt);
    if (isRefinement) formData.append('isRefinement', 'true');
    if (previousCode) formData.append('previousCode', previousCode);

    response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      body: formData,
    });
  } else {
    response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: fileOrBase64,
        framework,
        customPrompt,
        isRefinement,
        previousCode,
      }),
    });
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate code from screenshot.');
  }

  return data;
}

/**
 * Save new project
 */
export async function saveProjectAPI(projectData) {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to save project.');
  }

  return data;
}

/**
 * Get all project history
 */
export async function getProjectsAPI() {
  const response = await fetch(`${API_BASE_URL}/projects`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch project history.');
  }

  return data.projects || [];
}

/**
 * Get project by ID
 */
export async function getProjectByIdAPI(id) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load project details.');
  }

  return data;
}

/**
 * Update project code & add version
 */
export async function updateProjectAPI(id, updateData) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update project version.');
  }

  return data;
}

/**
 * Delete project
 */
export async function deleteProjectAPI(id) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete project.');
  }

  return data;
}

/**
 * Download ZIP Export from Backend
 */
export async function exportZipAPI(code, framework, name) {
  const response = await fetch(`${API_BASE_URL}/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, framework, name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to export project ZIP.');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

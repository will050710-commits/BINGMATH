import apiClient from './client';

export async function getLeaderboard() {
  const res = await apiClient.get('/api/leaderboard');
  return res.data; // Array of top 20 users
}

export async function getMRMLeaderboard(grade = null, limit = 20) {
  const params = { limit };
  if (grade) params.grade = grade;
  const res = await apiClient.get('/api/mrm/leaderboard', { params });
  return res.data;
}

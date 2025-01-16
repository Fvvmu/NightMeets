import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Dodaj interceptor, aby dodać token do każdego żądania
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

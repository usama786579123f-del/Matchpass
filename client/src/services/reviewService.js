import api from './api';

export const submitReview = (payload) => api.post('/reviews', payload);

export const getReviewsForUser = (userId) => api.get(`/reviews/user/${userId}`);
// URL base del backend
// En desarrollo usa localhost, en producción usará la URL de Render
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default API_URL;

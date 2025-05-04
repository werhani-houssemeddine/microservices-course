export const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
};

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
};

export const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

export const handleApiError = (error) => {
    console.error('API Error:', error);
    showNotification(error.message || 'An error occurred', 'error');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const getUserRole = () => {
    if (isAuthenticated()) {
        return localStorage.getItem('role');
    }
    return null;
};

export const getAuthHeader = () => {
    return {
        'Authorization': `${localStorage.getItem('token')}`
    };
}; 
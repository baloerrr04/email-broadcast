// Menyimpan token ke localStorage
function storeToken(token) {
    if (!localStorage.getItem('authToken')) {
        localStorage.setItem('authToken', token);
    }
}

// Mengambil token dari localStorage
function getToken() {
    return localStorage.getItem('authToken');
}

// Mengirim permintaan dengan token yang diotentikasi
async function sendAuthenticatedRequest(url, options = {}) {
    const token = getToken();

    if (!token) {
        window.location.href = '/login';
        return;
    }

    const headers = options.headers || {};
    headers['Authorization'] = `Bearer ${token}`;
    options.headers = headers;

    const response = await fetch(url, options);
    const data = await response.json();

    return data;
}

// Perbarui token jika sudah tersedia
function initializeToken(token) {
    storeToken(token);
}

const API_URL = 'http://localhost:5000/api';

const test = async () => {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@student.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.token; // Corrected path

        if (!token) {
            console.error('Login failed:', loginData);
            return;
        }
        console.log('Token obtained.');

        const examId = '6966317f457d1cb19aabc8ad'; // JAVA exam
        console.log(`Starting exam ${examId}...`);
        const startRes = await fetch(`${API_URL}/student/exam/${examId}/start`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const startData = await startRes.json();
        console.log('Response:', JSON.stringify(startData, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
};

test();

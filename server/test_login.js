async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@example.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Login successful!', data);
    } else {
      console.log('Login failed:', data);
    }
  } catch (error) {
    console.error('Login error:', error.message);
  }
}

testLogin();

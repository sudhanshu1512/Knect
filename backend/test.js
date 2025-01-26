import axios from 'axios';

const baseURL = 'http://localhost:3000/api/v1/users';
let authToken = '';

const test = async () => {
  try {
    // 1. Login to get authentication
    console.log('1. Testing Login...');
    const loginRes = await axios.post(`${baseURL}/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    authToken = loginRes.data.token;
    console.log('✅ Login successful');

    // 2. Search users
    console.log('\n2. Testing Search Users...');
    const searchRes = await axios.get(`${baseURL}/search?query=test`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Search successful');
    console.log('Found users:', searchRes.data.users);

    // 3. Test follow user
    if (searchRes.data.users.length > 0) {
      const targetUser = searchRes.data.users[0];
      console.log(`\n3. Testing Follow User (${targetUser.username})...`);
      const followRes = await axios.post(
        `${baseURL}/followorunfollow/${targetUser._id}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✅ Follow/Unfollow successful');
      console.log('Response:', followRes.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

test();

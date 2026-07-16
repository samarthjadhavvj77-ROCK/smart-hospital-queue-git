const API_URL = 'http://localhost:5000/api';

async function seed() {
  console.log('Seeding data...');

  try {
    // 1. Register Admin
    console.log('Registering Admin...');
    const adminRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Apollo Admin',
        email: 'admin@apollo.com',
        phone: '9876543210',
        password: 'password123',
        role: 'admin',
        hospitalName: 'Apollo City Hospital',
        hospitalAddress: '123 Health Ave, Metropolis'
      })
    });
    
    let adminData = await adminRes.json();
    if (!adminRes.ok) {
      if (adminData.message === 'User already exists') {
        console.log('Admin already exists. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@apollo.com', password: 'password123' })
        });
        adminData = await loginRes.json();
      } else {
        throw new Error(adminData.message);
      }
    }
    
    const adminToken = adminData.token;

    // Get Hospital ID
    const hospRes = await fetch(`${API_URL}/hospitals`);
    const hospitals = await hospRes.json();
    
    // We can also fetch headers if needed, let's find the hospital
    const myHospital = hospitals.find(h => {
      const adminId = typeof h.admin === 'object' ? h.admin._id : h.admin;
      return adminId === adminData._id;
    });

    if (!myHospital) throw new Error("Hospital wasn't created!");

    // 2. Add Doctors
    console.log('Adding Doctors...');
    const doctors = [
      { name: 'Sarah Jenkins', department: 'Cardiology', qualification: 'MD, FACC', experience: 15, consultationTime: 20, isAvailable: true },
      { name: 'Raj Patel', department: 'Orthopedics', qualification: 'MS Ortho', experience: 12, consultationTime: 15, isAvailable: true },
      { name: 'Emily Chen', department: 'Pediatrics', qualification: 'MD Pediatrics', experience: 8, consultationTime: 15, isAvailable: true }
    ];

    for (const doc of doctors) {
      await fetch(`${API_URL}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ ...doc, hospital: myHospital._id })
      });
    }

    // 3. Register Patient
    console.log('Registering Patient...');
    const patRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '1112223333',
        password: 'password123',
        role: 'patient'
      })
    });

    let patData = await patRes.json();
    if (!patRes.ok) {
      if (patData.message === 'User already exists') {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'jane@example.com', password: 'password123' })
        });
        patData = await loginRes.json();
      } else {
        throw new Error(patData.message);
      }
    }
    const patToken = patData.token;

    // 4. Book Appointments
    console.log('Booking Appointments...');
    const docsRes = await fetch(`${API_URL}/doctors/hospital/${myHospital._id}`);
    const myDocs = await docsRes.json();

    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < 2; i++) {
      if (!myDocs[i]) continue;
      await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patToken}` },
        body: JSON.stringify({
          hospital: myHospital._id,
          doctor: myDocs[i]._id,
          date: today.toISOString(),
          timeSlot: i === 0 ? '09:00 AM' : '10:00 AM'
        })
      });
    }

    console.log('Data successfully seeded!');
    console.log('Admin login: admin@apollo.com / password123');
    console.log('Patient login: jane@example.com / password123');

  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
}

seed();

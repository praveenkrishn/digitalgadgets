import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');  // ← add this

dotenv.config();

console.log('Connecting to:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('✅ Connected!'); process.exit(0); })
  .catch(err => { console.error('❌', err.message); process.exit(1); });
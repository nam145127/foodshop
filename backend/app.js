const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const authRoute = require('./routes/auth');
console.log('✅ authRoute ok');

const foodRoute = require('./routes/foods');
console.log('✅ foodRoute ok');

const orderRoutes = require('./routes/orders');
console.log('✅ orderRoutes ok');

const voucherRoutes = require("./routes/vouchers");
console.log('✅ voucherRoutes ok');

const messageRoutes = require('./routes/messages');
console.log('✅ messageRoutes ok');

const adminRoutes = require('./routes/admin');
console.log('✅ adminRoutes ok');

const userRoutes = require('./routes/user');
console.log('✅ userRoutes ok');


const app = express();

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

// Route API
app.use('/api/auth', authRoute);
app.use('/api/foods', foodRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Route frontend tĩnh
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

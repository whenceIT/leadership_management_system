const express = require('express')
const app = express()
const cors = require("cors")
const mysql = require('mysql2')
const pool = require("./db");
const bcrypt = require("bcrypt");
const multer = require('multer')
const s3Client = require('@aws-sdk/client-s3')
const crypto = require('crypto')
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const bodyParser = require("body-parser");
const axios = require("axios");
const twilio = require("twilio");
const http = require("http")
const { Server } = require("socket.io")
const dayjs = require('dayjs');
const QRCode = require('qrcode');
const archiver = require('archiver');
const createCashHealthService =
    require('./services/cashHealthService_optimized');
   

   
app.use(cors())
app.use(express.json())

app.use(bodyParser.urlencoded({ extended: false }));


const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
})

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id)

  // Register manager
  socket.on("register_manager", () => {
    socket.join("managers")
    console.log(`👤 Manager ${socket.id} joined managers room`)
  })

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id)
  })
})



app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true, // if you send cookies/auth headers
}));

const imageName = () =>{
    return crypto.randomBytes(32).toString('hex')
  }


  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


//PLACE ALL UNDER ENV WHEN PUSHING  
// DO_ACCESS_KEY_ID=DO00RP9FA3QZTA3JV637
// DO_SECRET_ACCESS_KEY=GWEj+tmCLlYb/RzX7b6vab8Kz9OjFO1PknyYyUQTnjk
// DO_DEFAULT_REGION=nyc3
// DO_BUCKET=wfssystem
// DO_ENDPOINT=https://wfssystem.nyc3.digitaloceanspaces.com


const branches = [
  "Zimco Branch Lusaka",
  "Kambendekela House Branch Lusaka",
  "Anchor House Branch Lusaka",
  "Kabwe Branch",
  "Kitwe Branch",
  "Ndola",
  "Solwezi",
  "Mansa",
  "Kasama",
  "Chipata",
  "Livingstone",
  "Mazabuka",
  "Kafue",
  "Chingola",
  "Choma",
  "Petauke",
  "Kalumbila",
  "Mongu",
  "Chongwe",
  "Kaoma",
  "Luanshya",
  "Lumwana",
  "Monze",
  "Mufulira",
  "Mpika",
  "Chirundu",
  "Masala-Ndola",
  "Mpongwe",
  "Kalomo",
  "Chambishi"
];


const officerNumbers = [
  { branchId: 0, phone: "whatsapp:+260970000001" }, // Zimco Branch Lusaka
  { branchId: 1, phone: "whatsapp:+260963689579" }, // Kambendekela House Branch Lusaka
  { branchId: 2, phone: "whatsapp:+260963689579" }, // Anchor House Branch Lusaka
  { branchId: 3, phone: "whatsapp:+260970000004" }, // Kabwe Branch
  { branchId: 4, phone: "whatsapp:+260970000005" }, // Kitwe Branch
  { branchId: 5, phone: "whatsapp:+260970000006" }, // Ndola
  { branchId: 6, phone: "whatsapp:+260970000007" }, // Solwezi
  { branchId: 7, phone: "whatsapp:+260970000008" }, // Mansa
  { branchId: 8, phone: "whatsapp:+260970000009" }, // Kasama
  { branchId: 9, phone: "whatsapp:+260970000010" }, // Chipata
  { branchId: 10, phone: "whatsapp:+260970000011" }, // Livingstone
  { branchId: 11, phone: "whatsapp:+260970000012" }, // Mazabuka
  { branchId: 12, phone: "whatsapp:+260970000013" }, // Kafue
  { branchId: 13, phone: "whatsapp:+260970000014" }, // Chingola
  { branchId: 14, phone: "whatsapp:+260970000015" }, // Choma
  { branchId: 15, phone: "whatsapp:+260970000016" }, // Petauke
  { branchId: 16, phone: "whatsapp:+260970000017" }, // Kalumbila
  { branchId: 17, phone: "whatsapp:+260970000018" }, // Mongu
  { branchId: 18, phone: "whatsapp:+260970000019" }, // Chongwe
  { branchId: 19, phone: "whatsapp:+260970000020" }, // Kaoma
  { branchId: 20, phone: "whatsapp:+260970000021" }, // Luanshya
  { branchId: 21, phone: "whatsapp:+260970000022" }, // Lumwana
  { branchId: 22, phone: "whatsapp:+260970000023" }, // Monze
  { branchId: 23, phone: "whatsapp:+260970000024" }, // Mufulira
  { branchId: 24, phone: "whatsapp:+260970000025" }, // Mpika
  { branchId: 25, phone: "whatsapp:+260970000026" }, // Chirundu
  { branchId: 26, phone: "whatsapp:+260970000027" }, // Masala-Ndola
  { branchId: 27, phone: "whatsapp:+260970000028" }, // Mpongwe
  { branchId: 28, phone: "whatsapp:+260970000029" }, // Kalomo
  { branchId: 29, phone: "whatsapp:+260970000030" }  // Chambishi
];

 const cashHealthService =
    createCashHealthService(pool);



    app.get('/cash-health/national', async (req, res) => {

    try {

         const { cycle_start } = req.query;

        const result =
            await cashHealthService
                .calculateNationalCashHealth(cycle_start);


        return res.json(result);


    } catch (error) {

        console.error(
            'National Cash Health Error:',
            error
        );


        return res.status(500).json({

            error:
                'Unable to calculate national cash health',

            message:
                error.message

        });

    }

});


app.get('/cash-health/:id', async (req, res) => {
    try {
        const officeId = Number(req.params.id);

        if (
            !Number.isInteger(officeId) ||
            officeId <= 0
        ) {
            return res.status(400).json({
                error: 'A valid office ID is required'
            });
        }

        // ============================================================
        // CYCLE START DATE
        // Example:
        // ?cycle_start=2026-07-25
        // Automatically becomes:
        // 2026-07-25 -> 2026-08-24
        // ============================================================

        const { cycle_start } = req.query;

        if (!cycle_start) {
            return res.status(400).json({
                error: 'cycle_start is required',
                example: '/cash-health/3?cycle_start=2026-07-25'
            });
        }

        // Validate YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(cycle_start)) {
            return res.status(400).json({
                error: 'cycle_start must be in YYYY-MM-DD format',
                example: '2026-07-25'
            });
        }

        // Validate that it is a real date
        const parsedCycleStart = dayjs(
            cycle_start,
            'YYYY-MM-DD',
            true
        );

        if (!parsedCycleStart.isValid()) {
            return res.status(400).json({
                error: 'Invalid cycle_start date',
                example: '2026-07-25'
            });
        }

        const result =
            await cashHealthService.calculateCashHealth(
                officeId,
                cycle_start
            );

        return res.json(result);

    } catch (error) {

        console.error(
            'Cash Health Error:',
            error
        );

        return res.status(500).json({
            error: 'Unable to calculate cash health',
            message: error.message
        });
    }
});


app.get('/cash-health/district/:id', async (req, res) => {

    try {

        const districtId =
            Number(req.params.id);


        if (
            !Number.isInteger(districtId) ||
            districtId <= 0
        ) {

            return res.status(400).json({

                error:
                    'A valid district ID is required'

            });

        }

         const { cycle_start } = req.query;

             if (!cycle_start) {
            return res.status(400).json({
                error: 'cycle_start is required',
                example: '/cash-health/3?cycle_start=2026-07-25'
            });
        }

        // Validate YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(cycle_start)) {
            return res.status(400).json({
                error: 'cycle_start must be in YYYY-MM-DD format',
                example: '2026-07-25'
            });
        }


            const parsedCycleStart = dayjs(
            cycle_start,
            'YYYY-MM-DD',
            true
        );

        if (!parsedCycleStart.isValid()) {
            return res.status(400).json({
                error: 'Invalid cycle_start date',
                example: '2026-07-25'
            });
        }




        const result =
            await cashHealthService
                .calculateDistrictCashHealth(
                    districtId,
                    cycle_start
                );


        return res.json(result);


    } catch (error) {

        console.error(
            'District Cash Health Error:',
            error
        );


        return res.status(500).json({

            error:
                'Unable to calculate district cash health',

            message:
                error.message

        });

    }

});


app.get('/cash-health/province/:id', async (req, res) => {

    try {

        const provinceId =
            Number(req.params.id);


        if (
            !Number.isInteger(provinceId) ||
            provinceId <= 0
        ) {

            return res.status(400).json({

                error:
                    'A valid province ID is required'

            });

        }


            const { cycle_start } = req.query;

             if (!cycle_start) {
            return res.status(400).json({
                error: 'cycle_start is required',
                example: '/cash-health/3?cycle_start=2026-07-25'
            });
        }

        // Validate YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(cycle_start)) {
            return res.status(400).json({
                error: 'cycle_start must be in YYYY-MM-DD format',
                example: '2026-07-25'
            });
        }


            const parsedCycleStart = dayjs(
            cycle_start,
            'YYYY-MM-DD',
            true
        );

        if (!parsedCycleStart.isValid()) {
            return res.status(400).json({
                error: 'Invalid cycle_start date',
                example: '2026-07-25'
            });
        }


        const result =
            await cashHealthService
                .calculateProvinceCashHealth(
                    provinceId,
                    cycle_start
                );


        return res.json(result);


    } catch (error) {

        console.error(
            'Province Cash Health Error:',
            error
        );


        return res.status(500).json({

            error:
                'Unable to calculate province cash health',

            message:
                error.message

        });

    }

});


app.get('/cash-health/national/contributions', async (req, res) => {

    try {

        const result =
            await cashHealthService
                .calculateNationalContributionHistory();


        return res.json(result);


    } catch (error) {

        console.error(
            'National Contribution History Error:',
            error
        );


        return res.status(500).json({

            error:
                'Unable to calculate national contribution history',

            message:
                error.message

        });

    }

});


app.get('/cash-health/:id/contributions', async (req, res) => {

    try {

        const officeId =
            Number(req.params.id);


        if (
            !Number.isInteger(officeId) ||
            officeId <= 0
        ) {

            return res.status(400).json({
                error:
                    'A valid office ID is required'
            });

        }


        const result =
            await cashHealthService
                .calculateContributionHistory(
                    officeId
                );


        return res.json(result);


    } catch (error) {

        console.error(
            'Contribution History Error:',
            error
        );


        return res.status(500).json({

            error:
                'Unable to calculate contribution history',

            message:
                error.message

        });

    }

});








async function notifyOfficer(clientData) {
  const officer = officerNumbers.find(o => o.branchId === clientData.branchId);
  if (!officer) return; // no officer found for that branch

// const message = `📢 New Loan Application
// Name: ${clientData.name}
// Phone: ${clientData.phone}
// Occupation: ${clientData.occupation}
// Branch: ${clientData.branch}
// Amount: ${clientData.amount}`;

  
const message = `Whence Financial Services
Transaction Receipt
Transaction ID: 60933
Date: 2023-08-10
Type: repayment
Amount: 800.00
Balance After: 2000.00`;

  await client.messages.create({
    from: "whatsapp:+14155238886", // your Twilio WhatsApp number
    to: "whatsapp:+260963689579",
    body: message
  });
}




async function saveClientData(data) {
  await pool.query(`
    INSERT INTO whatsapp_client 
      (name, phone_number, occupation, amount, status, location) 
    VALUES (?, ?, ?, ?, ?, ?)
  `, [  data.name,
    data.phone,
    data.occupation,
    data.amount,
    "pending",          // default status
    data.branchId ]);
}

const sessions = {};

async function handleMessage(from, message) {
  if (!sessions[from]) {
    sessions[from] = { step: 1, data: {} };
    return "Hello! Thank you for your interest in a loan with Whence Financial Services. To get started, could you please provide your full name?";
  }

  const session = sessions[from];

  switch (session.step) {
    case 1:
      session.data.name = message;
      session.step++;
      return "What is your phone number?";

    case 2:
      session.data.phone = message;
      session.step++;
      return "What is your occupation?";

    case 3:
      session.data.occupation = message;
      session.step++;
      // Send numbered list of branches
      let branchList = "Kindly select a Whence Branch that is closest to you by typing the number in front of it:\n";
      branches.forEach((branch, index) => {
        branchList += `${index + 1}. ${branch}\n`;
      });
      return branchList;

    case 4:
      const branchIndex = parseInt(message) - 1;
      if (branchIndex >= 0 && branchIndex < branches.length) {
        session.data.branch = branches[branchIndex];
        session.data.branchId = branchIndex;
        session.step++;
        return "Please enter the loan amount you want:";
      } else {
        return "Invalid selection. Please type the number corresponding to your branch.";
      }

    case 5:
      session.data.amount = message;


        // Save to database
  await saveClientData(session.data);

   // Notify officer
  await notifyOfficer(session.data);

      // Clear session
      delete sessions[from];

      return `Thank you! We have received your information. One of our loan consultants will be in touch with you shortly:
Name: ${session.data.name}
Phone: ${session.data.phone}
Occupation: ${session.data.occupation}
Branch: ${session.data.branch}
Amount: ${session.data.amount}`;

    default:
      delete sessions[from];
      return "Something went wrong. Please start again by sending any message.";
  }
}




app.post("/whatsapp-webhook", async (req, res) => {
  const from = req.body.From;
  const message = req.body.Body;


  const isOfficer = officerNumbers.some(officer => officer.phone === from);
  if (isOfficer) {
    console.log("Message from officer ignored:", from, message);
    return res.status(200).end(); // skip reply
  }


  // Your bot logic
  const reply = await handleMessage(from, message);

  if (reply) {
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: from,
      body: reply
    });
  }

  // CRUCIAL: do NOT send any text back
  res.status(200).end(); // <--- NO "OK", NO "res.send()"
});



//polices 
// Configure multer for file handling
const polupload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// Configure S3 client for DigitalOcean Spaces
const s3Client1 = new S3Client({
  region: process.env.DO_SPACES_REGION || 'nyc3',
  endpoint: process.env.DO_SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
})






  const s3 = new s3Client.S3({
    forcePathStyle: false,
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    region: 'nyc3',
    credentials:{
      accessKeyId: 'DO00RP9FA3QZTA3JV637',
      secretAccessKey: 'GWEj+tmCLlYb/RzX7b6vab8Kz9OjFO1PknyYyUQTnjk'
    }
  })
  


const storage = multer.memoryStorage()
const upload = multer({storage:storage})

//GET ROUTES


app.post("/notification", (req, res) => {
  const { loan_id } = req.body

  // Here you would save loan to DB first...
  // Then notify managers only
  io.to("managers").emit("approval_due", {
    title: "New Loan Added",
    message: `Loan #${loanId} was added by staff.`,
  })

  res.json({ success: true })
})


app.get("/announcement", async (req, res) => {
    try {
        // Fetch latest active announcement
        const result = await pool.query(`
            SELECT title, message, end_date 
            FROM announcements 
            ORDER BY id DESC 
            LIMIT 1
        `);

        // If no announcement found, send empty object
        if (result[0].length === 0) {
            return res.json({});
        }

        res.json(result[0][0]);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to load announcement" });
    }
});



app.get("/offices",async(req,res)=>{
    try{
        const offices =  await pool.query(`SELECT * FROM offices`);
        res.json(offices[0])
    } catch(err){
        console.log(err)
    }
})


app.get("/client_identification_types",async(req,res)=>{
  try{
      const client_identification_types =  await pool.query(`SELECT * FROM client_identification_types`);
      res.json(client_identification_types[0])
  } catch(err){
      console.log(err)
  }
})


app.get("/client_relationships",async(req,res)=>{
  try{
      const client_relationships =  await pool.query(`SELECT * FROM client_relationships`);
      res.json(client_relationships[0])
  } catch(err){
      console.log(err)
  }
})





app.get("/province_offices/:province",async(req,res)=>{
  try{
     const {province} = req.params;
      const offices =  await pool.query(`SELECT * FROM offices WHERE province_id = ?`,[province]);
      res.json(offices[0])
  } catch(err){
      console.log(err)
  }
})

app.get("/provinces",async(req,res)=>{
  try{
    const provinces = await pool.query(`SELECT * FROM province`);
    res.json(provinces[0])
  }catch(err){
    console.log(err)
  }
})

app.get("/province/:id",async(req,res)=>{
  try{
     const {id} = req.params;
     console.log(id)
     const province = await pool.query(`SELECT * FROM province where id = ?`,[id]);
     console.log(province[0][0])
    res.json(province[0][0])
  }catch(err){
    console.log(err)
  }
})







app.get('/transactions',async(req,res)=>{
    try{
        const transactions = await pool.query(`SELECT * FROM loan_transactions`);
        res.json(transactions[0])
        console.log(transactions[0])
    }catch(err){
        console.log(err)
    }
})


app.get('/edit_requests',async(req,res)=>{
  try{
      const edit_requests = await pool.query(`SELECT * FROM edit_requests`);
      res.json(edit_requests[0])
  }catch(err){
      console.log(err)
  }
})

app.get('/resignation_requests',async(req,res)=>{
  try{
    const resignation_requests = await pool.query(`SELECT * FROM resignations`);
    res.json(resignation_requests[0])
  }catch(err){
    console.log(err)
  }
})

app.get('/resignation_requests_dm/:id',async(req,res)=>{
  try{
      const {id} = req.params;
    const resignation_requests = await pool.query(`SELECT * FROM resignations WHERE office_id = ?`,[id]);
    res.json(resignation_requests[0])
  }catch(err){
    console.log(err)
  }
})


app.put('/approve_resignation_request',async(req,res)=>{
   const {id,status} = req.body;
  try{
   const resignation_request = await pool.query(`UPDATE resignations SET status = ? WHERE id = ?`,[status,id])
   res.json(edit_request)
  }catch(err){
    console.log(err)
  }
})


app.put('/final_approve_resignation_request', async (req, res) => {
  const {status, id,user_id } = req.body;

  try {
    // Update the edit request status
    await pool.query(
      `UPDATE resignations SET status = ? WHERE id = ?`,
      [status, id]
    );

  await pool.query(
        `UPDATE users SET block = '1' WHERE id = ?`,
        [user_id]
      );


    res.status(200).json({ message: 'Resignation approved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


app.get('/edit_requests_dm/:id',async(req,res)=>{
  try{
    const { id } = req.params;
    console.log(id)
      const edit_requests = await pool.query(`SELECT * FROM edit_requests WHERE branch_id = ?`,[id]);
      res.json(edit_requests[0])
  }catch(err){
      console.log(err)
  }
})


app.get('/edit_requests_pm/:id',async(req,res)=>{
  try{

    const { id } = req.params;
    // Expect offices as comma-separated list: ?offices=1,2,3
    const officesParam = req.query.offices;
    if (!officesParam) return res.status(400).json({ error: "Offices are required" });

    const officeIds = officesParam.split(",").map(Number); //
      const edit_requests = await pool.query(`SELECT * FROM edit_requests WHERE branch_id IN (?)`,[officeIds]);
      res.json(edit_requests[0])
  }catch(err){
      console.log(err)
  }
})


app.put('/approve_edit_request',async(req,res)=>{
   const {id,status} = req.body;
  try{
   const edit_request = await pool.query(`UPDATE edit_requests SET status = ? WHERE id = ?`,[status,id])
   res.json(edit_request)
  }catch(err){
    console.log(err)
  }
})

app.put('/final_approve_edit_request', async (req, res) => {
  const {status, transaction_id, new_amount, transaction_type } = req.body;

  try {
    // Update the edit request status
    await pool.query(
      `UPDATE edit_requests SET status = ? WHERE id = ?`,
      [status, id]
    );


    if (
      transaction_type === 'disbursement' ||
      transaction_type === 'charge' ||
      transaction_type === 'interest' ||
      transaction_type === 'interest_initial'
    ) {
      await pool.query(
        `UPDATE transactions SET debit = ? WHERE transaction_id = ?`,
        [new_amount, transaction_id]
      );
    } else {
      await pool.query(
        `UPDATE transactions SET credit = ? WHERE transaction_id = ?`,
        [new_amount, transaction_id]
      );
    }

    res.status(200).json({ message: 'Edit request and transaction updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


app.put('/decline_charge',async(req,res)=>{
  const status = 'declined';
  try{
    const {id} = req.body;
    const transaction = await pool.query(`UPDATE charge_transactions_unapproved SET status = ? WHERE id = ?`,[status,id])
    res.json(transaction)
  }catch(err){
    console.log(err)
  }
})



app.get('/active_loans',async(req,res)=>{
    try{
        console.log('hello')
        const loans = await pool.query("SELECT * FROM loans WHERE status = 'disbursed'");
         res.json(loans[0])
    }catch(err){
        console.log(err)
    }
})

app.get('/closed_loans',async(req,res)=>{
  try{
      console.log('hello')
      const loans = await pool.query("SELECT * FROM loans WHERE status = 'closed'");
       res.json(loans[0])
  }catch(err){
      console.log(err)
  }
})

app.get('/declined_loans',async(req,res)=>{
  try{
      console.log('hello')
      const loans = await pool.query("SELECT * FROM loans WHERE status = 'declined'");
       res.json(loans[0])
  }catch(err){
      console.log(err)
  }
})

app.get('/rescheduled_loans',async(req,res)=>{
  try{
      const loans = await pool.query("SELECT * FROM loans WHERE status = 'rescheduled'");
       res.json(loans[0])
  }catch(err){
      console.log(err)
  }
})

app.get('/written_off_loans',async(req,res)=>{
  try{
      const loans = await pool.query("SELECT * FROM loans WHERE status = 'written_off'");
       res.json(loans[0])
  }catch(err){
      console.log(err)
  }
})

app.get('/pending_loans',async(req,res)=>{
    try{
        const loans = await pool.query("SELECT * FROM loans WHERE status = 'pending' OR status = 'active'");
        res.json(loans[0])
    }catch(err){
        console.log(err)
    }
})

app.post('/upload_client_image',upload.single('client_picture'),async(req,res)=>{

    const mimeToExt = {
        'image/jpeg': '.jpeg',
        'image/png': '.png',
        'image/webp': '.webp',
      };


      const ext = mimeToExt[req.file.mimetype];
    if (!ext) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }
  
   
    var client_picture = imageName();
    const params = {
        Bucket: 'wfssystem',
        Key: client_picture + ext,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        region:'nyc3',
        ACL: 'public-read',
    }

    console.log(client_picture)

    const command = new s3Client.PutObjectCommand(params)
    await s3.send(command)
    client_picture = 'https://wfssystem.nyc3.digitaloceanspaces.com/' + client_picture + ext;
    try{
        const {client_id} = req.body;
        const new_picture = await pool.query('UPDATE clients SET picture = ? WHERE id = ?',[client_picture,client_id]);
        res.json(new_picture)
    }
catch(err){
    console.log(err)
}
   
})


app.post('/add_identification',upload.single('attachment'),async(req,res)=>{
  const ext = req.file.mimetype;
  var attachment = imageName();
  const params = {
    Bucket: 'wfssystem',
    Key: attachment + ext,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    region:'nyc3',
    ACL: 'public-read',
}

const command = new s3Client.PutObjectCommand(params)
await s3.send(command)
attachment = 'https://wfssystem.nyc3.digitaloceanspaces.com/' + attachment + ext;
try{
  const {type,unique_number,description,client_id} = req.body;
  const new_identification = await pool.query(`INSERT INTO client_identifications (client_id,client_identification_type_id,name,notes,attachment) VALUES 
    (?,?,?,?,?)`,[client_id,type,unique_number,description,attachment])
  res.json(new_identification)
  console.log(new_identification)
}catch(err){
  console.log(err)
}
})


app.post('/add_nok',upload.single('attachment'),async(req,res)=>{
  const ext = req.file.mimetype;
  var attachment = imageName();
  const params = {
    Bucket: 'wfssystem',
    Key: attachment + ext,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    region:'nyc3',
    ACL: 'public-read',
}
const command = new s3Client.PutObjectCommand(params)
await s3.send(command)
attachment = 'https://wfssystem.nyc3.digitaloceanspaces.com/' + attachment + ext;
try{
  const {firstName,middleName,lastName,mobile,relationship,gender,address,notes,client_id} = req.body;
  const nok = await pool.query(`INSERT INTO client_next_of_kin (client_relationship_id,first_name,middle_name,last_name,address,picture,mobile,gender,notes,client_id) VALUES 
    (?,?,?,?,?,?,?,?,?,?)`,[relationship,firstName,middleName,lastName,address,attachment,mobile,gender,notes,client_id])
    res.json(nok)
}catch(err){
  console.log(err)
}
})

app.post('/add_address',upload.single('attachment'),async(req,res)=>{
  const ext = req.file.mimetype;
  var attachment = imageName();
  const params = {
    Bucket: 'wfssystem',
    Key: attachment + ext,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    region:'nyc3',
    ACL: 'public-read',
}
const command = new s3Client.PutObjectCommand(params)
await s3.send(command)
attachment = 'https://wfssystem.nyc3.digitaloceanspaces.com/' + attachment + ext;
try{
  const {client_id,name,location} = req.body;
  const new_address = await pool.query(`INSERT INTO client_addressess (client_id,name,location,attachment) VALUES 
    (?,?,?,?)`,[client_id,name,location,attachment])
    res.json(new_address)
}catch(err){
  console.log(err)
}
})


app.post('/create_edit_approval',upload.single('proof'),async(req,res)=>{
  const ext = req.file.mimetype;
  var attachment = imageName();
  const status = 'DM'
  const params = {
    Bucket: 'wfssystem',
    Key: attachment + ext,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    region:'nyc3',
    ACL: 'public-read',
}
const command = new s3Client.PutObjectCommand(params)
await s3.send(command)
attachment = 'https://wfssystem.nyc3.digitaloceanspaces.com/' + attachment + ext;
try{
  const {transaction_id,transaction_type,loan_id,user_id,client_id,branch_id,amount,current_amount,issue} = req.body;
  const edit_request = await pool.query(`INSERT INTO edit_requests (transaction_id,loan_id,client_id,user_id,branch_id,new_amount,current_amount,
    transaction_type,issue,proof,status) VALUES 
    (?,?,?,?,?,?,?,?,?,?,?)`,[transaction_id,loan_id,client_id,user_id,branch_id,amount,current_amount,transaction_type,issue,attachment,status])
    res.json(edit_request)
}catch(err){
  console.log(err)
}
})


app.post('/create_resignation',upload.single('resignation_letter'),async(req,res)=>{
  const ext = req.file.mimetype;
  var attachment = imageName();
  const status = 'DM'
  const params = {
    Bucket: 'wfssystem',
    Key: attachment + ext,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    region:'nyc3',
    ACL: 'public-read',
  } 
  const command = new s3Client.PutObjectCommand(params)
  await s3.send(command)
  attachment = 'https://wfssystem.nyc3.digitaloceanspaces.com/' + attachment + ext;
  try{
    const {user_id,office_id} = req.body;
    const resignation = await pool.query(`INSERT INTO resignations (user_id,office_id,status,file) VALUES (?,?,?,?)`,[user_id,office_id,status,attachment])
    res.json(resignation)
  }catch(err){
    console.log(err)
  }
})



app.post('/create_edit',upload.single('attachment'),async(req,res)=>{
  const ext = req.file.mimetype;
  var attachment = imageName();
  const params = {
    Bucket: 'wfssystem',
    Key: attachment + ext,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    region:'nyc3',
    ACL: 'public-read',
}
const command = new s3Client.PutObjectCommand(params)
await s3.send(command)
attachment = 'https://wfssystem.nyc3.digitaloceanspaces.com/' + attachment + ext;
try{
  const {client_id,name,location} = req.body;
  const new_address = await pool.query(`INSERT INTO client_addressess (client_id,name,location,attachment) VALUES 
    (?,?,?,?)`,[client_id,name,location,attachment])
    res.json(new_address)
}catch(err){
  console.log(err)
}
})



app.post('/add_client_document',upload.single('attachment'),async(req,res)=>{
try{
  const {name,description,client_id,attachment} = req.body;
  const document = await pool.query(`INSERT INTO documents (name,record_id,location,notes) VALUES 
    (?,?,?,?)`,[name,client_id,attachment,description])
    res.json(document)
}catch(err){
  console.log(err)
}
})

// Delete client document
app.delete('/delete_document/:id', async (req, res) => {
  try {
    const { id } = req.params;
 // Delete document
    await pool.query('DELETE FROM documents WHERE id = ?', [id]);

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});


app.delete('/delete_nok/:id', async (req, res) => {
  try {
    const { id } = req.params;
 // Delete document
    await pool.query('DELETE FROM documents WHERE id = ?', [id]);

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});


app.delete('/delete_address/:id', async (req, res) => {
  try {
    const { id } = req.params;
 // Delete document
    await pool.query('DELETE FROM documents WHERE id = ?', [id]);

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});


app.delete('/delete_socials/:id', async (req, res) => {
  try {
    const { id } = req.params;
 // Delete document
    await pool.query('DELETE FROM documents WHERE id = ?', [id]);

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});


app.delete('/delete_ids/:id', async (req, res) => {
  try {
    const { id } = req.params;
 // Delete document
    await pool.query('DELETE FROM documents WHERE id = ?', [id]);

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});




app.post('/add_socials',async(req,res)=>{
try{
  const {client_id,name,link} = req.body;
  const new_socials = await pool.query(`INSERT INTO client_socials (client_id,name,link) VALUES 
    (?,?,?)`,[client_id,name,link])
    res.json(new_socials)
}catch(err){
  console.log(err)
}
})



app.get("/office/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const office =  await pool.query(`SELECT * FROM offices WHERE id = ? `,[id]);
        //res.json(cycle_date[0][0])

    res.json(office[0][0])
    } catch(err){
        console.log(err)
    }
})


app.get("/loan_product/:id",async(req,res)=>{
  try{
      const {id} = req.params;
      const office =  await pool.query(`SELECT * FROM loan_products WHERE id = ? `,[id]);
  res.json(office[0][0])
  } catch(err){
      console.log(err)
  }
})


app.get("/my_clients/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const office =  await pool.query(`SELECT * FROM clients WHERE staff_id = ? `,[id]);
        //res.json(cycle_date[0][0])
console.log(office[0])
    res.json(office[0])
    } catch(err){
        console.log(err)
    }
})

app.get("/admin_counts/:id/:office", async (req, res) => {
  try {
    const { id, office } = req.params;

    const [
      [active_loans_count],
      [my_active_loans_count],
      [branch_active_loans_count],
      [closed_loans_count],
      [declined_loans_count],
      [res_loans_count],
      [written_off_loans_count],
      [transaction_approvals_count],
      [reloan_approvals_count],
      [waiver_approvals_count],
      [charge_approvals_count],
      [loans_pending_count],
      [clients_pending_count],
      [advances_pending_count],
      [topup_advance_pending_count],
      [edit_requests_count],
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'disbursed'`), // active loans
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE loan_officer_id = ? AND status = 'disbursed'`, [id]), // my active loans
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE office_id = ? AND status = 'disbursed'`, [office]), // branch active loans
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'closed'`), // closed
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'declined'`), // declined
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'rescheduled'`), // rescheduled
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'written_off'`), // written off
      pool.query(`SELECT COUNT(*) AS total FROM loan_transactions_pp_fp`), // transaction approvals
      pool.query(`SELECT COUNT(*) AS total FROM loan_transactions_requests`), // reloan approvals
      pool.query(`SELECT COUNT(*) AS total FROM waiver_transactions_unapproved`), // waiver approvals
      pool.query(`SELECT COUNT(*) AS total FROM charge_transactions_unapproved`), // charge approvals
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'pending'`), // loans pending
      pool.query(`SELECT COUNT(*) AS total FROM clients WHERE status = 'pending'`), // clients pending
      pool.query(`SELECT COUNT(*) AS total FROM advances WHERE status = 'pending'`), // advances pending
      pool.query(`SELECT COUNT(*) AS total FROM advance_topups WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*) AS total FROM edit_requests WHERE status != 'approved'`)
       // topup advances pending
    ]);
    res.json({
      active_loans_count: active_loans_count[0].total,
      my_active_loans_count: my_active_loans_count[0].total,
      branch_active_loans_count: branch_active_loans_count[0].total,
      closed_loans_count: closed_loans_count[0].total,
      declined_loans_count: declined_loans_count[0].total,
      res_loans_count: res_loans_count[0].total,
      written_off_loans_count: written_off_loans_count[0].total,
      transaction_approvals_count: transaction_approvals_count[0].total,
      reloan_approvals_count: reloan_approvals_count[0].total,
      waiver_approvals_count: waiver_approvals_count[0].total,
      charge_approvals_count: charge_approvals_count[0].total,
      loans_pending_count: loans_pending_count[0].total,
      clients_pending_count: clients_pending_count[0].total,
      advances_pending_count: advances_pending_count[0].total,
      topup_advance_pending_count: topup_advance_pending_count[0].total,
      edit_requests_count: edit_requests_count[0].total
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/dm_counts/:id/:office", async (req, res) => {
  try {
    const { id, office } = req.params;

    const [
      [active_loans_count],
      [my_active_loans_count],
      [branch_active_loans_count],
      [closed_loans_count],
      [declined_loans_count],
      [res_loans_count],
      [written_off_loans_count],
      [transaction_approvals_count],
      [reloan_approvals_count],
      [waiver_approvals_count],
      [charge_approvals_count],
      [loans_pending_count],
      [clients_pending_count],
      [advances_pending_count],
      [topup_advance_pending_count],
      [edit_requests_count]
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'disbursed'`), // active loans
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE loan_officer_id = ? AND status = 'disbursed'`, [id]), // my active loans
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE office_id = ? AND status = 'disbursed'`, [office]), // branch active loans
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'closed'`), // closed
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'declined'`), // declined
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'rescheduled'`), // rescheduled
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'written_off'`), // written off
      pool.query(`SELECT COUNT(*) AS total FROM loan_transactions_pp_fp WHERE office_id = ?`,[office]), // transaction approvals
      pool.query(`SELECT COUNT(*) AS total FROM loan_transactions_requests WHERE office_id = ?`,[office]), // reloan approvals
      pool.query(`SELECT COUNT(*) AS total FROM waiver_transactions_unapproved WHERE office_id = ?`,[office]), // waiver approvals
      pool.query(`SELECT COUNT(*) AS total FROM charge_transactions_unapproved WHERE office_id = ?`,[office]), // charge approvals
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'pending' AND office_id = ?`,[office]), // loans pending
      pool.query(`SELECT COUNT(*) AS total FROM clients WHERE status = 'pending' AND office_id = ?`,[office]), // clients pending
      pool.query(`SELECT COUNT(*) AS total FROM advances WHERE status = 'pending' AND office_id = ?`,[office]), // advances pending
      pool.query(`SELECT COUNT(*) AS total FROM advance_topups WHERE status = 'pending' AND office_id = ?`,[office]),
      pool.query(`SELECT COUNT(*) AS total FROM edit_requests WHERE status = 'DM' AND branch_id = ?`,[office])
    ]);

    res.json({
      active_loans_count: active_loans_count[0].total,
      my_active_loans_count: my_active_loans_count[0].total,
      branch_active_loans_count: branch_active_loans_count[0].total,
      closed_loans_count: closed_loans_count[0].total,
      declined_loans_count: declined_loans_count[0].total,
      res_loans_count: res_loans_count[0].total,
      written_off_loans_count: written_off_loans_count[0].total,
      transaction_approvals_count: transaction_approvals_count[0].total,
      reloan_approvals_count: reloan_approvals_count[0].total,
      waiver_approvals_count: waiver_approvals_count[0].total,
      charge_approvals_count: charge_approvals_count[0].total,
      loans_pending_count: loans_pending_count[0].total,
      clients_pending_count: clients_pending_count[0].total,
      advances_pending_count: advances_pending_count[0].total,
      topup_advance_pending_count: topup_advance_pending_count[0].total,
      edit_requests_count: edit_requests_count[0].total
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/pm_counts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Expect offices as comma-separated list: ?offices=1,2,3
    const officesParam = req.query.offices;
    if (!officesParam) return res.status(400).json({ error: "Offices are required" });

    const officeIds = officesParam.split(",").map(Number); // convert to numbers

    const [
      [active_loans_count],
      [my_active_loans_count],
      [branch_active_loans_count],
      [closed_loans_count],
      [declined_loans_count],
      [res_loans_count],
      [written_off_loans_count],
      [transaction_approvals_count],
      [reloan_approvals_count],
      [waiver_approvals_count],
      [charge_approvals_count],
      [loans_pending_count],
      [clients_pending_count],
      [advances_pending_count],
      [topup_advance_pending_count],
      [edit_requests_count]
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'disbursed'`), // active loans
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE loan_officer_id = ? AND status = 'disbursed'`, [id]), // my active loans
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE office_id IN (?) AND status = 'disbursed'`, [officeIds]), // branch active loans
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'closed'`), // closed
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'declined'`), // declined
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'rescheduled'`), // rescheduled
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'written_off'`), // written off
      pool.query(`SELECT COUNT(*) AS total FROM loan_transactions_pp_fp WHERE office_id IN (?)`, [officeIds]), // transaction approvals
      pool.query(`SELECT COUNT(*) AS total FROM loan_transactions_requests WHERE office_id IN (?)`, [officeIds]), // reloan approvals
      pool.query(`SELECT COUNT(*) AS total FROM waiver_transactions_unapproved WHERE office_id IN (?)`, [officeIds]), // waiver approvals
      pool.query(`SELECT COUNT(*) AS total FROM charge_transactions_unapproved WHERE office_id IN (?)`, [officeIds]), // charge approvals
      pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'pending' AND office_id IN (?)`, [officeIds]), // loans pending
      pool.query(`SELECT COUNT(*) AS total FROM clients WHERE status = 'pending' AND office_id IN (?)`, [officeIds]), // clients pending
      pool.query(`SELECT COUNT(*) AS total FROM advances WHERE status = 'pending' AND office_id IN (?)`, [officeIds]), // advances pending
      pool.query(`SELECT COUNT(*) AS total FROM advance_topups WHERE status = 'pending' AND office_id IN (?)`, [officeIds]), // topup advances pending
      pool.query(`SELECT COUNT(*) AS total FROM edit_requests WHERE status = 'PM' AND branch_id IN (?)`,[officeIds])
    ]);

    res.json({
      active_loans_count: active_loans_count[0].total,
      my_active_loans_count: my_active_loans_count[0].total,
      branch_active_loans_count: branch_active_loans_count[0].total,
      closed_loans_count: closed_loans_count[0].total,
      declined_loans_count: declined_loans_count[0].total,
      res_loans_count: res_loans_count[0].total,
      written_off_loans_count: written_off_loans_count[0].total,
      transaction_approvals_count: transaction_approvals_count[0].total,
      reloan_approvals_count: reloan_approvals_count[0].total,
      waiver_approvals_count: waiver_approvals_count[0].total,
      charge_approvals_count: charge_approvals_count[0].total,
      loans_pending_count: loans_pending_count[0].total,
      clients_pending_count: clients_pending_count[0].total,
      advances_pending_count: advances_pending_count[0].total,
      topup_advance_pending_count: topup_advance_pending_count[0].total,
      edit_requests_count: edit_requests_count[0].total
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});



app.get("/my_loans/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const loans = await pool.query(`SELECT * FROM loans WHERE loan_officer_id = ? `,[id])
        res.json(loans[0])
    }
    catch(err){
        console.log(err)
    }
})

app.get("/my_active_loans_count/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const status = 'disbursed';

    const [result] = await pool.query(
      `SELECT COUNT(*) AS total_loans FROM loans WHERE loan_officer_id = ? AND status = ?`,
      [id,status]
    );

    res.json(result[0].total_loans );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/branch_loans/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const loans = await pool.query(`SELECT * FROM loans WHERE office_id = ? `,[id])
        res.json(loans[0])
    }
    catch(err){
        console.log(err)
    }
})


app.get("/branch_active_loans_count/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const status = 'disbursed';

    const [result] = await pool.query(
      `SELECT COUNT(*) AS total_loans FROM loans WHERE office_id = ? AND status = ?`,
      [id,status]
    );

    res.json(result[0].total_loans );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/active_loans_count", async (req, res) => {
  try {
    const status = 'disbursed';

    const [result] = await pool.query(
      `SELECT COUNT(*) AS total_loans FROM loans WHERE status = ?`,
      [status]
    );

    console.log(result[0].total_loans)
    res.json(result[0].total_loans );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/closed_loans_count", async (req, res) => {
  try {
    const status = 'closed';

    const [result] = await pool.query(
      `SELECT COUNT(*) AS total_loans FROM loans WHERE status = ?`,
      [status]
    );

    res.json(result[0].total_loans );
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/declined_loans_count", async (req, res) => {
  try {
    const status = 'declined';

    const [result] = await pool.query(
      `SELECT COUNT(*) AS total_loans FROM loans WHERE status = ?`,
      [status]
    );

    res.json(result[0].total_loans );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/rescheduled_loans_count", async (req, res) => {
  try {
    const status = 'rescheduled';

    const [result] = await pool.query(
      `SELECT COUNT(*) AS total_loans FROM loans WHERE status = ?`,
      [status]
    );

    res.json(result[0].total_loans );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/written_off_loans_count", async (req, res) => {
  try {
    const status = 'written_off';

    const [result] = await pool.query(
      `SELECT COUNT(*) AS total_loans FROM loans WHERE status = ?`,
      [status]
    );

    res.json(result[0].total_loans );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});




app.get("/client_loans/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const loans =  await pool.query(`SELECT * FROM loans WHERE client_id = ? `,[id]);
        //res.json(cycle_date[0][0])
console.log(loans[0])
    res.json(loans[0])
    } catch(err){
        console.log(err)
    }
})


app.get("/client_nok/:id",async(req,res)=>{
  try{
    const {id} = req.params;
    const client_nok = await pool.query(`SELECT * FROM client_next_of_kin WHERE client_id = ? `,[id])
    res.json(client_nok[0])
  }catch(err){
    console.log(err)
  }
})

app.get("/client_identification/:id",async(req,res)=>{
  try{
    const {id} = req.params;
    const client_identification = await pool.query(`SELECT * FROM client_identifications WHERE client_id = ? `,[id])
    res.json(client_identification[0])
  }catch(err){
    console.log(err)
  }
})


app.get("/client_addresses/:id",async(req,res)=>{
  try{
    const {id} = req.params;
    const client_address = await pool.query(`SELECT * FROM client_addressess WHERE client_id = ? `,[id])
    res.json(client_address[0])
  }catch(err){
    console.log(err)
  }
})


app.get("/client_documents/:id",async(req,res)=>{
  try{
    const {id} = req.params;
    const documents = await pool.query(`SELECT * FROM documents WHERE record_id = ? `,[id])
    res.json(documents[0])
  }catch(err){
    console.log(err)
  }
})



app.get("/client_socials/:id",async(req,res)=>{
  try{
     const {id} = req.params;
      const client_socials = await pool.query(`SELECT * FROM client_socials WHERE client_id = ? `,[id])
      res.json(client_socials[0])
  } catch(err){
      console.log(err)
  }
})

app.get('/my_dashboard_loans/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { cycle_date } = req.query; // <-- selectedCycle comes here
      console.log(cycle_date)
  
      if (!cycle_date) {
        return res.status(400).json({ error: "cycle_date is required" });
      }
  
      const [loans] = await pool.query(
        'SELECT * FROM loans WHERE loan_officer_id = ?',
        [id]
      );
  
      if (!loans || loans.length === 0) {
        return res.json({
          loan_list: [],
          transactions: [],
          COUA: 0,
          SUT: 0,
          given_out: 0,
          pdua: 0,
          ledgerData: []
        });
      }
  
      const loanIds = loans.map(loan => loan.id);
  
      const [transactions] = await pool.query(
        `SELECT * FROM loan_transactions WHERE loan_id IN (?)`,
        [loanIds]
      );
  
      // --- helpers same as before (getLoanBalances, sumPrincipalByCycleDate, etc.) ---
      const formatToYYYYMMDD = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      };
  
      const getLoanBalances = (loansWithTxns) =>
        loansWithTxns.map(({ id, principal, filteredTransactions }) => {
          let debit = 0;
          let credit = 0;
      
          filteredTransactions.forEach(t => {
            debit += Number(t.debit) || 0; // add charges
            if (t.payment_apply_to === "reloan_payment") {
              const reloanAmount = Number(principal) + (Number(principal) * 0.4);
              credit += reloanAmount;
            } else {
              credit += Number(t.credit) || 0;
            }
          });
      
          // ✅ If any transaction is a reloan_payment, force balance to 0
          const hasReloanPayment = filteredTransactions.some(
            t => t.payment_apply_to === "reloan_payment"
          );
      
          return { id, balance: hasReloanPayment ? 0 : debit - credit };
        });
      
  
      const sumPrincipalByCycleDate = (loans, targetDate) =>
        loans.reduce((sum, loan) =>
          formatToYYYYMMDD(loan.cycle_date) === targetDate
            ? sum + (Number(loan.principal) || 0)
            : sum,
          0
        );
  
      const getLedgerLoans = (loans, transactions, targetDate) => {
        const matchingLoans = loans.filter(loan => formatToYYYYMMDD(loan.cycle_date) === targetDate);
        return matchingLoans.map(loan => {
          const loanTxns = transactions.filter(txn => txn.loan_id === loan.id);
          let balance = 0;
  
          if (!loan.reloaned) {
            let debit = 0, credit = 0;
            loanTxns.forEach(txn => {
              debit += Number(txn.debit) || 0;
              credit += Number(txn.credit) || 0;
            });
            balance = debit - credit;
          }
  
          return {
            id: loan.id,
            client: loan.client_id,
            reloan: loan.reloaned,
            principal: Number(loan.principal) + (Number(loan.principal) * 0.4),
            balance,
            date: loan.created_date
          };
        });
      };
  
      const getTotalCreditInRange = (transactions, givenDate, givenDate2) => {
        const start = new Date(givenDate);
        const end = new Date(givenDate2);
  
        return transactions.reduce((total, txn) => {
          const txnDate = new Date(txn.date);
          const isInRange = txnDate > start && txnDate <= end;
  
          const meetsConditions =
            (txn.transaction_type === 'repayment' && txn.payment_apply_to === 'full_payment' && isInRange) ||
            (txn.payment_apply_to === 'part_payment' && isInRange) ||
            (txn.payment_apply_to === 'reloan_payment' && isInRange);
  
          return meetsConditions ? total + (Number(txn.credit) || 0) : total;
        }, 0);
      };
  
      // --- use selectedCycle from frontend ---
      const todayStr = formatToYYYYMMDD(cycle_date); // <-- important!
      const givenDate2 = new Date(cycle_date);
      givenDate2.setMonth(givenDate2.getMonth() + 1);
  
      const loansWithFilteredTxns = loans
      .filter(loan => loan.status === "disbursed")
      .map(loan => ({
        ...loan,
        filteredTransactions: transactions.filter(
          txn =>
            txn.loan_id === loan.id &&
            new Date(txn.date) < new Date(cycle_date) &&
            txn.transaction_type !== "specified_due_date_fee"
        )
      }));
    
  
      const loansWithFilteredTxns2 = loans.map(loan => ({
        ...loan,
        filteredTransactions: transactions.filter(
          txn => txn.loan_id === loan.id &&
          txn.transaction_type !== "specified_due_date_fee"
        )
      }));
  
      const loanBalances = getLoanBalances(loansWithFilteredTxns);
      const loanBalances2 = getLoanBalances(loansWithFilteredTxns2);
  
      const COUA = loanBalances.reduce((sum, loan) => sum + loan.balance, 0);
      const SUT = loanBalances2.reduce((sum, loan) => sum + loan.balance, 0);
      const given_out = sumPrincipalByCycleDate(loans, todayStr);
  
      const TCC = getTotalCreditInRange(transactions, todayStr, formatToYYYYMMDD(givenDate2));
      const pdua = COUA > 0 ? (TCC / COUA) * 100 : 0;
      const ledgerData = getLedgerLoans(loans, transactions, todayStr);
  
      res.json({
        loan_list: loans,
        transactions,
        COUA,
        SUT,
        given_out,
        pdua,
        ledgerData,
        TCC
      });
  
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get('/dashboard_loans_admin', async (req, res) => {
    try {
      const { cycle_date } = req.query;
      if (!cycle_date) return res.status(400).json({ error: "cycle_date is required" });
  
      // Get today's date string
      const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().slice(0, 10);
      };
  
      // Generate last 12 cycles (24th -> 23rd)
      const getLast12Cycles = () => {
        const today = new Date();
        const cycles = [];
        for (let i = 11; i >= 0; i--) {
          let month = today.getMonth() - i;
          let year = today.getFullYear();
          if (month < 0) { month += 12; year -= 1; }
          const cycleStart = new Date(year, month, 24);
          const nextMonth = (month + 1) % 12;
          const nextYear = (month + 1 > 11 ? year + 1 : year);
          const cycleEnd = new Date(nextYear, nextMonth, 23, 23, 59, 59);
          cycles.push({
            cycleStr: `${cycleStart.getFullYear()}-${String(cycleStart.getMonth() + 1).padStart(2,'0')}`,
            cycleStart, cycleEnd
          });
        }
        return cycles;
      };
  
      const cycles = getLast12Cycles();
  
      // Fetch loans and transactions
      const [loans] = await pool.query('SELECT * FROM loans');
      const loanIds = loans.map(l => l.id);
      const [transactions] = await pool.query(`SELECT * FROM loan_transactions WHERE loan_id IN (?)`, [loanIds]);
  
      // Filter disbursed loans and transactions
      const loansWithFilteredTxns = loans
        .filter(l => l.status === "disbursed")
        .map(l => ({
          ...l,
          filteredTransactions: transactions.filter(
            t => t.loan_id === l.id && new Date(t.date) < new Date(cycle_date) && t.transaction_type !== "specified_due_date_fee"
          )
        }));
  
      // Compute loan balances
      const loanBalances = loansWithFilteredTxns.map(({ id, principal, filteredTransactions }) => {
        let debit = 0, credit = 0;
        filteredTransactions.forEach(t => {
          debit += Number(t.debit) || 0;
          credit += t.payment_apply_to === 'reloan_payment' ? Number(principal) * 1.4 : Number(t.credit) || 0;
        });
        const hasReloanPayment = filteredTransactions.some(t => t.payment_apply_to === 'reloan_payment');
        return { id, balance: hasReloanPayment ? 0 : debit - credit };
      });
  
      // Fetch TCC and today's stats
      const [[{ TCC }]] = await pool.query(`
        SELECT COALESCE(SUM(t.credit),0) AS TCC
        FROM loan_transactions t
        WHERE t.date > DATE(?) AND t.date <= DATE_ADD(DATE(?), INTERVAL 1 MONTH)
          AND ((t.transaction_type='repayment' AND t.payment_apply_to='full_payment') 
            OR t.payment_apply_to IN ('part_payment','reloan_payment'))`,
        [cycle_date, cycle_date]
      );
  
      const [[todayStats]] = await pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN t.transaction_type='repayment' AND t.payment_apply_to='full_payment' THEN t.credit ELSE 0 END),0) AS full_payments_today,
          COALESCE(SUM(CASE WHEN t.payment_apply_to='part_payment' THEN t.credit ELSE 0 END),0) AS part_payments_today,
          COALESCE(SUM(CASE WHEN t.payment_apply_to='reloan_payment' THEN t.credit ELSE 0 END),0) AS reloan_payments_today,
          COALESCE(SUM(CASE WHEN t.payment_apply_to='reloan_payment' THEN t.credit/0.4 ELSE 0 END),0) AS interest_today,
          COALESCE(SUM(t.credit),0) AS total_collected_today
        FROM loan_transactions t
        WHERE DATE(t.date) = DATE(?)`,
        [getTodayDate()]
      );
  
      // Fetch monthlyStats and givenOutStats using JS cycle ranges
      const monthlyStats = [];
      const givenOutStats = [];
  
      for (const cycle of cycles) {
        const [mRow] = await pool.query(`
          SELECT
            COALESCE(SUM(CASE WHEN t.payment_apply_to='full_payment' THEN t.credit ELSE 0 END),0) AS full_payments,
            COALESCE(SUM(CASE WHEN t.payment_apply_to='part_payment' THEN t.credit ELSE 0 END),0) AS part_payments,
            COALESCE(SUM(CASE WHEN t.payment_apply_to='reloan_payment' THEN t.credit ELSE 0 END),0) AS reloan_payments,
            COALESCE(SUM(t.credit),0) AS total_collected
          FROM loan_transactions t
          WHERE t.transaction_type='repayment' AND t.date >= ? AND t.date <= ?`,
          [cycle.cycleStart, cycle.cycleEnd]
        );
        monthlyStats.push({
          cycle_month: cycle.cycleStr,
          full_payments: Number(mRow[0].full_payments),
          part_payments: Number(mRow[0].part_payments),
          reloan_payments: Number(mRow[0].reloan_payments),
          total_collected: Number(mRow[0].total_collected)
        });
  
        const [gRow] = await pool.query(`
          SELECT
            COALESCE(SUM(CASE WHEN t.transaction_type='disbursement' THEN t.debit + (t.debit/0.4) ELSE 0 END),0) AS new_loans_given_out,
            COALESCE(SUM(CASE WHEN t.transaction_type='interest' THEN t.debit + (t.debit/0.4) ELSE 0 END),0) AS reloans_given_out,
            COALESCE(SUM(CASE WHEN t.transaction_type IN ('disbursement','interest') THEN t.debit + (t.debit/0.4) ELSE 0 END),0) AS total_given_out
          FROM loan_transactions t
          WHERE t.date >= ? AND t.date <= ?`,
          [cycle.cycleStart, cycle.cycleEnd]
        );
        givenOutStats.push({
          cycle_month: cycle.cycleStr,
          new_loans_given_out: Number(gRow[0].new_loans_given_out),
          reloans_given_out: Number(gRow[0].reloans_given_out),
          total_given_out: Number(gRow[0].total_given_out)
        });
      }
  
      // Merge collections vs given out
      const collections_v_given_out = cycles.map(cycle => {
        const collected = monthlyStats.find(m => m.cycle_month === cycle.cycleStr) || {};
        const given = givenOutStats.find(g => g.cycle_month === cycle.cycleStr) || {};
        return {
          cycle_month: cycle.cycleStr,
          total_collected: collected.total_collected || 0,
          full_payments: collected.full_payments || 0,
          part_payments: collected.part_payments || 0,
          reloan_payments: collected.reloan_payments || 0,
          total_given_out: given.total_given_out || 0,
          new_loans_given_out: given.new_loans_given_out || 0,
          reloans_given_out: given.reloans_given_out || 0
        };
      });
  
      const COUA = loanBalances.reduce((sum, l) => sum + l.balance, 0);
      const pdua = COUA > 0 ? (TCC / COUA) * 100 : 0;
  
      // ✅ Send single response
      res.json({
        COUA: Number(COUA),
        SUT: '',
        given_out: '',
        TCC: Number(TCC),
        pdua,
        total_collected_today: Number(todayStats.total_collected_today),
        full_payments_today: Number(todayStats.full_payments_today),
        part_payments_today: Number(todayStats.part_payments_today),
        reloan_payments_today: Number(todayStats.reloan_payments_today),
        interest_today: Number(todayStats.interest_today),
        monthlyStats,
        givenOutStats,
        collections_v_given_out
      });
  
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  });
  
  
  //SPECIAL ENDPOINTS
app.get('/customers-fast', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
          c.id AS id,
          CONCAT(c.first_name, ' ', c.last_name) AS full_name,
          o.name AS office_name,
          l.id AS loan_id,
          l.principal AS principal,

          -- Compute balance using SQL logic
          (
            SUM(IF(t.debit IS NULL, 0, t.debit))
            -
            SUM(
              IF(
                t.payment_apply_to = 'reloan_payment',
                l.principal * 1.4,
                IF(t.credit IS NULL, 0, t.credit)
              )
            )
          ) AS balance,

          -- detect reloan so we can zero-out balance
          MAX(t.payment_apply_to = 'reloan_payment') AS has_reloan_payment

      FROM loans l
      INNER JOIN clients c ON c.id = l.client_id
      INNER JOIN offices o ON o.id = c.office_id
      LEFT JOIN loan_transactions t ON t.loan_id = l.id

      WHERE
          l.status = 'disbursed'
          AND l.created_at >= '2024-12-25'

      GROUP BY
          l.id, c.id, full_name, office_name, principal
    `);

    // apply reloan rule: if has_reloan_payment = 1 → balance = 0
    const final = rows.map(r => ({
      id: r.id,
      full_name: r.full_name,
      office_name: r.office_name,
      loan_id: r.loan_id,
      principal: r.principal,
      balance: r.has_reloan_payment ? 0 : r.balance
    }));

    res.json(final);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


  

app.get('/customers', async (req, res) => {
  try {
    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => {
      officeMap[o.id] = o.name;
    });

    // 2. Fetch clients
    const [clients] = await pool.query(`SELECT * FROM clients`);

    const clientMap = {};
    clients.forEach(c => {
      clientMap[c.id] = {
        first_name: c.first_name,
        last_name: c.last_name,
        office_id: c.office_id
      };
    });

    // 3. Fetch disbursed loans since 25 December
    const [loans] = await pool.query(`
      SELECT *
      FROM loans
      WHERE status = 'disbursed'
      AND created_at >= '2024-12-25'
    `);

    if (loans.length === 0) {
      return res.json([]);
    }

    // 4. Get loan IDs
    const loanIds = loans.map(l => l.id);

    // 5. Fetch transactions for those loans
    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions WHERE loan_id IN (?)`,
      [loanIds]
    );

    // Group transactions by loan_id
    const txByLoan = {};
    transactions.forEach(tx => {
      if (!txByLoan[tx.loan_id]) txByLoan[tx.loan_id] = [];
      txByLoan[tx.loan_id].push(tx);
    });

    // 6. Build result
    let result = loans.map(loan => {
      const tList = txByLoan[loan.id] || [];

      let debit = 0;
      let credit = 0;

      tList.forEach(t => {
        debit += Number(t.debit) || 0;
        credit += Number(t.credit) || 0;
      });

      const balance = debit - credit;

      const client = clientMap[loan.client_id];

      return {
        id: loan.client_id,
        full_name: `${client.first_name} ${client.last_name}`,
        office_name: officeMap[client.office_id] || null,
        loan_id: loan.id,
        amount_due: balance
      };
    });

    // 7. Filter out loans with 0 balance
    result = result.filter(r => r.balance !== 0);

    // 8. Sort by office_name
    result.sort((a, b) => {
      if (!a.office_name) return 1;
      if (!b.office_name) return -1;
      return a.office_name.localeCompare(b.office_name);
    });

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/loans-list', async (req, res) => {
  try {
    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => {
      officeMap[o.id] = o.name;
    });

    // 2. Fetch clients
    const [clients] = await pool.query(`SELECT * FROM clients`);
    const clientMap = {};
    clients.forEach(c => {
      clientMap[c.id] = {
        first_name: c.first_name,
        last_name: c.last_name,
        office_id: c.office_id
      };
    });

    // 3. Fetch loans issued from 25th Dec 2024 till today
    const [loans] = await pool.query(`
      SELECT *
      FROM loans
      WHERE status = 'disbursed'
      AND created_date >= '2024-12-25'
      ORDER BY created_date ASC
    `);

    if (loans.length === 0) return res.json([]);

    // 4. Build the result list
    const result = loans.map(loan => {
      const client = clientMap[loan.client_id];
      const loanDate = new Date(loan.created_date).toISOString().split('T')[0];
      return {
        full_name: `${client.first_name} ${client.last_name}`,
        office_name: officeMap[client.office_id] || null,
        loan_id: loan.id,
        principal: loan.principal,
        loan_date: loanDate
      };
    });

    // 5. Sort by month of loan_date
    result.sort((a, b) => {
      const monthA = new Date(a.loan_date).getMonth();
      const monthB = new Date(b.loan_date).getMonth();
      return monthA - monthB;
    });

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/reloans-list', async (req, res) => {
  try {
    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 2. Fetch clients (name + NRC)
    const [clients] = await pool.query(`SELECT * FROM clients`);
    const clientMap = {};
    clients.forEach(c => {
      clientMap[c.id] = {
        first_name: c.first_name,
        last_name: c.last_name,
        nrc_number: c.nrc_number
      };
    });

    // 3. Fetch loans (MUST include client_id + loan_officer_id)
    const [loans] = await pool.query(`
      SELECT id, client_id, loan_officer_id
      FROM loans
    `);

    const loanMap = {};
    loans.forEach(l => {
      loanMap[l.id] = {
        client_id: l.client_id,
        loan_officer_id: l.loan_officer_id
      };
    });

    // 4. Fetch users (loan officers)
    const [users] = await pool.query(`
      SELECT id, first_name, last_name
      FROM users
    `);

    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = {
        first_name: u.first_name,
        last_name: u.last_name
      };
    });

    // 5. Fetch reloan repayment transactions
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
      AND payment_apply_to IN ('reloan_payment')
      AND date >= '2024-12-25'
      ORDER BY date ASC
    `);

    if (transactions.length === 0) return res.json([]);

    // 6. Build final response
    const result = transactions.map(tx => {
      const office_name = officeMap[tx.office_id];
      const txDate = new Date(tx.date).toISOString().split('T')[0];

      // ============
      // GET CLIENT
      // ============
      const loanInfo = loanMap[tx.loan_id] || {};
      const client_id = loanInfo.client_id || null;

      const client = clientMap[client_id] || {};
      const client_name = client.first_name
        ? `${client.first_name} ${client.last_name}`
        : null;

      // ============
      // GET LOAN OFFICER
      // ============
      const loan_officer_id = loanInfo.loan_officer_id || null;
      const officer = userMap[loan_officer_id] || {};

      return {
        id: tx.id,
        loan_id: tx.loan_id,
        amount: tx.balance_bf - tx.credit,
        payment_apply_to: tx.payment_apply_to,
        office_id: office_name,

        // Client fields
        client_id: client_id,
        client_name: client_name,
        client_nrc: client.nrc_number || null,

        // Loan officer fields
        loan_officer_id: loan_officer_id,
        loan_officer_name: officer.first_name + ' ' + officer.last_name || null,

        date: txDate
      };
    });

    // Already sorted by SQL
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get('/transactions-list', async (req, res) => {
  try {
    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 3. Fetch transactions from 25 Dec 2024 onwards, filtered by transaction_type AND payment_apply_to
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
      AND payment_apply_to IN ('part_payment', 'full_payment')
      AND date >= '2024-12-25'
      ORDER BY date ASC
    `);

    if (transactions.length === 0) return res.json([]);

    // 4. Map transactions to required format
    const result = transactions.map(tx => {
      const office_name = officeMap[tx.office_id];
      const txDate = new Date(tx.date).toISOString().split('T')[0]; // YYYY-MM-DD

      return {
        id: tx.id,
        loan_id:tx.loan_id,
        amount: tx.credit,
        payment_apply_to: tx.payment_apply_to,
        office_id: office_name,
        date: txDate
      };
    });

    // Already sorted by date from SQL, but double-check:
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get('/expense-list', async (req, res) => {
  try {
    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 2. Fetch expenses from 25 Dec 2024 till today
    const [expenses] = await pool.query(`
      SELECT *
      FROM expenses
      WHERE date >= '2024-12-25'
      ORDER BY date ASC
    `);

    if (expenses.length === 0) return res.json([]);

    // 3. Map expenses to required format
    const result = expenses.map(exp => {
      const office_name = officeMap[exp.office_id] || null;
      const expenseDate = new Date(exp.date).toISOString().split('T')[0]; // YYYY-MM-DD

      return {
        office_name: office_name,
        name: exp.name,
        amount: exp.amount,
        date: expenseDate,
        expense_type: exp.expense_type
      };
    });

    // Already sorted by date from SQL, double-check just in case
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

/////////////////////////////////
app.get('/expenses-daily', async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const date = today.toISOString().split('T')[0];

    // Fetch offices for mapping
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // Fetch expenses for the specified date
    const [expenses] = await pool.query(`
      SELECT *
      FROM expenses
      WHERE date = ?
      ORDER BY created_at DESC
    `, [date]);

    // Map expenses with office names
    const result = expenses.map(exp => ({
      id: exp.id,
      office_id: exp.office_id,
      office_name: officeMap[exp.office_id] || null,
      created_by_id: exp.created_by_id,
      expense_type_id: exp.expense_type_id,
      name: exp.name,
      amount: exp.amount,
      date: exp.date,
      year: exp.year,
      month: exp.month,
      recurring: exp.recurring,
      recur_frequency: exp.recur_frequency,
      recur_start_date: exp.recur_start_date,
      recur_end_date: exp.recur_end_date,
      recur_next_date: exp.recur_next_date,
      recur_type: exp.recur_type,
      status: exp.status,
      approved_date: exp.approved_date,
      approved_by_id: exp.approved_by_id,
      declined_date: exp.declined_date,
      declined_by_id: exp.declined_by_id,
      notes: exp.notes,
      files: exp.files,
      created_at: exp.created_at,
      updated_at: exp.updated_at
    }));

    res.json({
      success: true,
      count: result.length,
      expenses: result
    });

  } catch (err) {
    console.error("Error fetching daily expenses:", err);
    res.status(500).json({
      error: true,
      message: "Failed to fetch daily expenses",
      details: err.message
    });
  }
});

/////////////////////////////////
app.get('/expenses-yearly', async (req, res) => {
  try {
    // Always use: Dec 25 (prev year) to Dec 24 (current year)
    const today = new Date();
    const currentYear = today.getFullYear();

    const startDate = `${currentYear - 1}-12-25`;
    const endDate = `${currentYear}-12-24`;

    // Fetch offices for mapping
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // Fetch expenses for the custom year range
    const [expenses] = await pool.query(`
      SELECT *
      FROM expenses
      WHERE date >= ? AND date <= ?
      ORDER BY date DESC, created_at DESC
    `, [startDate, endDate]);

    // Map expenses with office names
    const result = expenses.map(exp => ({
      id: exp.id,
      office_id: exp.office_id,
      office_name: officeMap[exp.office_id] || null,
      created_by_id: exp.created_by_id,
      expense_type_id: exp.expense_type_id,
      name: exp.name,
      amount: exp.amount,
      date: exp.date,
      year: exp.year,
      month: exp.month,
      recurring: exp.recurring,
      recur_frequency: exp.recur_frequency,
      recur_start_date: exp.recur_start_date,
      recur_end_date: exp.recur_end_date,
      recur_next_date: exp.recur_next_date,
      recur_type: exp.recur_type,
      status: exp.status,
      approved_date: exp.approved_date,
      approved_by_id: exp.approved_by_id,
      declined_date: exp.declined_date,
      declined_by_id: exp.declined_by_id,
      notes: exp.notes,
      files: exp.files,
      created_at: exp.created_at,
      updated_at: exp.updated_at
    }));

    res.json({
      success: true,
      count: result.length,
      period: {
        start: startDate,
        end: endDate
      },
      expenses: result
    });

  } catch (err) {
    console.error("Error fetching yearly expenses:", err);
    res.status(500).json({
      error: true,
      message: "Failed to fetch yearly expenses",
      details: err.message
    });
  }
});

app.get("/disbursed-transactions", async (req, res) => {
  try {
    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 2. Get today's date formatted as YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // 3. Fetch all disbursement transactions where date = today
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'disbursement'
      AND DATE(date) = ?
      ORDER BY date ASC
    `, [today]);

    if (transactions.length === 0) {
      return res.json([]);
    }

    // 4. Map the results
    const result = transactions.map(tx => {
      const office_name = officeMap[tx.office_id] || null;
      const formattedDate = new Date(tx.date).toISOString().split('T')[0];

      return {
        loan_id: tx.loan_id,
        transaction_type: tx.transaction_type,
        office_name: office_name,
        amount: tx.debit,   // disbursement = debit
        date: formattedDate
      };
    });

    // 5. Sort (SQL already did it)
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/disbursement-and-interest", async (req, res) => {
  try {
    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 2. Today (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // 3. Fetch today's disbursement + interest transactions
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type IN ('disbursement', 'interest_initial')
      AND DATE(date) = ?
      ORDER BY date ASC
    `, [today]);

    if (!transactions.length) return res.json([]);

    // 4. Map formatted output
    const result = transactions.map(tx => {
      const office_name = officeMap[tx.office_id] || null;
      const formattedDate = new Date(tx.date).toISOString().split('T')[0];

      return {
        loan_id: tx.loan_id,
        transaction_type: tx.transaction_type,
        office_name: office_name,
        amount:  tx.debit,
        date: formattedDate
      };
    });

    // 5. Sort (SQL already sorted)
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/loans-by-branch", async (req, res) => {
  try {
    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 2. Fetch clients
    const [clients] = await pool.query(`SELECT * FROM clients`);
    const clientMap = {};
    clients.forEach(c => {
      clientMap[c.id] = {
        first_name: c.first_name,
        last_name: c.last_name,
        office_id: c.office_id
      };
    });

    // 3. Today's date
    const today = new Date().toISOString().split("T")[0];

    // 4. Fetch loans given out today
    const [loans] = await pool.query(`
      SELECT *
      FROM loans
      WHERE status = 'disbursed'
      AND DATE(created_date) = ?
    `, [today]);

    if (loans.length === 0) return res.json([]);

    // 5. Map the result
    const result = loans.map(loan => {
      const client = clientMap[loan.client_id];
      const office_name = officeMap[client.office_id] || null;
      const fullName = `${client.first_name} ${client.last_name}`;
      const loanDate = new Date(loan.created_date).toISOString().split("T")[0];

      return {
        loan_id: loan.id,
        principal: loan.principal,
        client_name: fullName,
        office_name: office_name,
        date: loanDate
      };
    });

    // 6. Sort by branch/office
    result.sort((a, b) => {
      if (!a.office_name) return 1;
      if (!b.office_name) return -1;
      return a.office_name.localeCompare(b.office_name);
    });

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/transactions-by-type', async (req, res) => {
  try {
    // Today's date in YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 2. Fetch today's repayment transactions
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
      AND payment_apply_to IN ('part_payment', 'full_payment')
      AND DATE(date) = ?
      ORDER BY transaction_type ASC
    `, [today]);

    if (transactions.length === 0) return res.json([]);

    // 3. Format output
    const result = transactions.map(tx => {
      const office_name = officeMap[tx.office_id];
      const txDate = new Date(tx.date).toISOString().split('T')[0];

      return {
        id: tx.id,
        loan_id: tx.loan_id,
        amount: tx.credit,
        payment_apply_to: tx.payment_apply_to,
        office_id: office_name,
        transaction_type: tx.transaction_type,
        date: txDate
      };
    });

    // Sorted by transaction_type already, but double-check:
    result.sort((a, b) => a.transaction_type.localeCompare(b.transaction_type));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get('/transactions-reloan', async (req, res) => {
  try {
    // Today's date in YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 2. Fetch today's reloan payment transactions
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
      AND payment_apply_to = 'reloan_payment'
      AND DATE(date) = ?
    `, [today]);

    if (transactions.length === 0) return res.json([]);

    // 3. Format output
    const result = transactions.map(tx => {
      const office_name = officeMap[tx.office_id];
      const txDate = new Date(tx.date).toISOString().split('T')[0];

      return {
        id: tx.id,
        loan_id: tx.loan_id,
        amount: tx.credit,
        payment_apply_to: tx.payment_apply_to,
        office_id: office_name,
        transaction_type: tx.transaction_type,
        date: txDate
      };
    });

    // ✔ Sort by branch (office_name)
    result.sort((a, b) => {
      if (!a.office_id) return 1;
      if (!b.office_id) return -1;
      return a.office_id.localeCompare(b.office_id);
    });

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/transactions-penalties', async (req, res) => {
  try {
    // Today's date in YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 2. Fetch today's transactions for specified_due_date_fee
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'specified_due_date_fee'
      AND DATE(date) = ?
    `, [today]);

    if (transactions.length === 0) return res.json([]);

    // 3. Map to desired format
    const result = transactions.map(tx => {
      const office_name = officeMap[tx.office_id] || null;
      const txDate = new Date(tx.date).toISOString().split('T')[0];

      return {
        id: tx.id,
        loan_id: tx.loan_id,
        amount: tx.credit,
        transaction_type: tx.transaction_type,
        office_id: office_name,
        date: txDate
      };
    });

    // 4. Sort by branch/office_name
    result.sort((a, b) => {
      if (!a.office_id) return 1;
      if (!b.office_id) return -1;
      return a.office_id.localeCompare(b.office_id);
    });

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

//Monthly
// app.get("/disbursed-transactions-monthly", async (req, res) => {
//   try {
//     const now = new Date();
//     const yyyy = now.getFullYear();
//     const mm = now.getMonth() + 1;

//     const [offices] = await pool.query(`SELECT * FROM offices`);
//     const officeMap = {};
//     offices.forEach(o => officeMap[o.id] = o.name);

//     const [transactions] = await pool.query(`
//       SELECT *
//       FROM loan_transactions
//       WHERE transaction_type = 'disbursement'
//       AND YEAR(date) = ?
//       AND MONTH(date) = ?
//       ORDER BY date ASC
//     `, [yyyy, mm]);

//     if (!transactions.length) return res.json([]);

//     const result = transactions.map(tx => ({
//       loan_id: tx.loan_id,
//       transaction_type: tx.transaction_type,
//       office_name: officeMap[tx.office_id] || null,
//       amount: tx.debit,
//       date: new Date(tx.date).toISOString().split("T")[0]
//     }));

//     res.json(result);

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// Monthly (Custom Cycle: 25th of previous month to 24th of current month)
app.get("/disbursed-transactions-monthly", async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // Always use: 25th of previous month → 24th of current month
    let startYear, startMonth;
    
    if (currentMonth === 1) {
      startYear = currentYear - 1;
      startMonth = 12;
    } else {
      startYear = currentYear;
      startMonth = currentMonth - 1;
    }

    const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-25`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-24`;

    // Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // Fetch transactions within the custom date range
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'disbursement'
      AND date >= ? AND date <= ?
      ORDER BY date ASC
    `, [startDate, endDate]);

    if (!transactions.length) return res.json([]);

    const result = transactions.map(tx => ({
      loan_id: tx.loan_id,
      transaction_type: tx.transaction_type,
      office_name: officeMap[tx.office_id] || null,
      amount: tx.debit,
      date: new Date(tx.date).toISOString().split("T")[0]
    }));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Monthly Expenses (Custom Cycle: 25th of previous month to 24th of current month)
app.get("/expenses-monthly", async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // Always use: 25th of previous month → 24th of current month
    let startYear, startMonth;
    
    if (currentMonth === 1) {
      startYear = currentYear - 1;
      startMonth = 12;
    } else {
      startYear = currentYear;
      startMonth = currentMonth - 1;
    }

    const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-25`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-24`;

    // Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // Fetch expenses within the custom date range
    const [expenses] = await pool.query(`
      SELECT *
      FROM expenses
      WHERE date >= ? AND date <= ?
      ORDER BY created_at DESC
    `, [startDate, endDate]);

    // Map expenses with office names
    const result = expenses.map(exp => ({
      id: exp.id,
      office_id: exp.office_id,
      office_name: officeMap[exp.office_id] || null,
      created_by_id: exp.created_by_id,
      expense_type_id: exp.expense_type_id,
      name: exp.name,
      amount: exp.amount,
      date: exp.date,
      year: exp.year,
      month: exp.month,
      recurring: exp.recurring,
      recur_frequency: exp.recur_frequency,
      recur_start_date: exp.recur_start_date,
      recur_end_date: exp.recur_end_date,
      recur_next_date: exp.recur_next_date,
      recur_type: exp.recur_type,
      status: exp.status,
      approved_date: exp.approved_date,
      approved_by_id: exp.approved_by_id,
      declined_date: exp.declined_date,
      declined_by_id: exp.declined_by_id,
      notes: exp.notes,
      files: exp.files,
      created_at: exp.created_at,
      updated_at: exp.updated_at
    }));

    res.json({
      success: true,
      count: result.length,
      period: {
        start: startDate,
        end: endDate
      },
      expenses: result
    });

  } catch (err) {
    console.error("Error fetching monthly expenses:", err);
    res.status(500).json({
      error: true,
      message: "Failed to fetch monthly expenses",
      details: err.message
    });
  }
});


app.get("/disbursement-and-interest-monthly", async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // Always use: 25th of previous month → 24th of current month
    let startYear, startMonth;
    
    if (currentMonth === 1) {
      startYear = currentYear - 1;
      startMonth = 12;
    } else {
      startYear = currentYear;
      startMonth = currentMonth - 1;
    }

    const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-25`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-24`;

    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type IN ('disbursement', 'interest_initial')
      AND date >= ? AND date <= ?
      ORDER BY date ASC
    `, [startDate, endDate]);

    if (!transactions.length) return res.json([]);

    const result = transactions.map(tx => ({
      loan_id: tx.loan_id,
      transaction_type: tx.transaction_type,
      office_name: officeMap[tx.office_id] || null,
      amount: tx.debit,
      date: new Date(tx.date).toISOString().split("T")[0]
    }));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/loans-by-branch-monthly", async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // Always use: 25th of previous month → 24th of current month
    let startYear, startMonth;
    
    if (currentMonth === 1) {
      startYear = currentYear - 1;
      startMonth = 12;
    } else {
      startYear = currentYear;
      startMonth = currentMonth - 1;
    }

    const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-25`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-24`;

    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    const [clients] = await pool.query(`SELECT * FROM clients`);
    const clientMap = {};
    clients.forEach(c => {
      clientMap[c.id] = {
        first_name: c.first_name,
        last_name: c.last_name,
        office_id: c.office_id
      };
    });

    const [loans] = await pool.query(`
      SELECT *
      FROM loans
      WHERE status = 'disbursed'
      AND created_date >= ? AND created_date <= ?
    `, [startDate, endDate]);

    if (!loans.length) return res.json([]);

    const result = loans.map(loan => {
      const client = clientMap[loan.client_id];
      const office_name = officeMap[client.office_id] || null;

      return {
        loan_id: loan.id,
        principal: loan.principal,
        client_name: `${client.first_name} ${client.last_name}`,
        office_name,
        date: new Date(loan.created_date).toISOString().split("T")[0]
      };
    });

    result.sort((a, b) => {
      if (!a.office_name) return 1;
      if (!b.office_name) return -1;
      return a.office_name.localeCompare(b.office_name);
    });

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/transactions-by-type-monthly', async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // Always use: 25th of previous month → 24th of current month
    let startYear, startMonth;
    
    if (currentMonth === 1) {
      startYear = currentYear - 1;
      startMonth = 12;
    } else {
      startYear = currentYear;
      startMonth = currentMonth - 1;
    }

    const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-25`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-24`;

    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
      AND payment_apply_to IN ('part_payment', 'full_payment')
      AND date >= ? AND date <= ?
      ORDER BY transaction_type ASC
    `, [startDate, endDate]);

    if (transactions.length === 0) return res.json([]);

    const result = transactions.map(tx => ({
      id: tx.id,
      loan_id: tx.loan_id,
      amount: tx.credit,
      payment_apply_to: tx.payment_apply_to,
      office_id: officeMap[tx.office_id],
      transaction_type: tx.transaction_type,
      date: new Date(tx.date).toISOString().split("T")[0]
    }));

    result.sort((a, b) => a.transaction_type.localeCompare(b.transaction_type));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/transactions-reloan-monthly', async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // Always use: 25th of previous month → 24th of current month
    let startYear, startMonth;
    
    if (currentMonth === 1) {
      startYear = currentYear - 1;
      startMonth = 12;
    } else {
      startYear = currentYear;
      startMonth = currentMonth - 1;
    }

    const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-25`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-24`;

    const [transactions] = await pool.query(`
      SELECT 
        lt.id,
        lt.loan_id,
        lt.credit AS amount,
        lt.payment_apply_to,
        lt.transaction_type,
        DATE(lt.date) AS date,
        o.name AS office_name
      FROM loan_transactions lt
      LEFT JOIN offices o ON lt.office_id = o.id
      WHERE lt.transaction_type = 'repayment'
        AND lt.payment_apply_to = 'reloan_payment'
        AND DATE(lt.date) BETWEEN ? AND ?
      ORDER BY o.name ASC
    `, [startDate, endDate]);

    res.json(transactions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get('/transactions-penalties-monthly', async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // Always use: 25th of previous month → 24th of current month
    let startYear, startMonth;
    
    if (currentMonth === 1) {
      startYear = currentYear - 1;
      startMonth = 12;
    } else {
      startYear = currentYear;
      startMonth = currentMonth - 1;
    }

    const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-25`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-24`;

    const [transactions] = await pool.query(`
      SELECT lt.*, o.name AS office_name
      FROM loan_transactions lt
      LEFT JOIN offices o ON lt.office_id = o.id
      WHERE lt.transaction_type = 'specified_due_date_fee'
        AND DATE(lt.date) BETWEEN ? AND ?
      ORDER BY o.name ASC
    `, [startDate, endDate]);

    if (!transactions.length) return res.json([]);

    const result = transactions.map(tx => ({
      id: tx.id,
      loan_id: tx.loan_id,
      amount: tx.credit,
      transaction_type: tx.transaction_type,
      office_id: tx.office_name || null,
      date: new Date(tx.date).toISOString().split('T')[0]
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//yearly (Custom Cycle: Dec 25 of previous year to Dec 24 of current year)
app.get("/disbursed-transactions-yearly", async (req, res) => {
  try {
    // Always use: Dec 25 (prev year) to Dec 24 (current year)
    const today = new Date();
    const currentYear = today.getFullYear();

    const startDate = `${currentYear - 1}-12-25`;
    const endDate = `${currentYear}-12-24`;

    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'disbursement'
      AND date >= ? AND date <= ?
      ORDER BY date ASC
    `, [startDate, endDate]);

    if (!transactions.length) return res.json([]);

    const result = transactions.map(tx => ({
      loan_id: tx.loan_id,
      transaction_type: tx.transaction_type,
      office_name: officeMap[tx.office_id] || null,
      amount: tx.debit,
      date: new Date(tx.date).toISOString().split("T")[0]
    }));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/disbursement-and-interest-yearly", async (req, res) => {
  try {
    // Always use: Dec 25 (prev year) to Dec 24 (current year)
    const today = new Date();
    const currentYear = today.getFullYear();

    const startDate = `${currentYear - 1}-12-25`;
    const endDate = `${currentYear}-12-24`;

    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type IN ('disbursement', 'interest_initial')
      AND date >= ? AND date <= ?
      ORDER BY date ASC
    `, [startDate, endDate]);

    if (!transactions.length) return res.json([]);

    const result = transactions.map(tx => ({
      loan_id: tx.loan_id,
      transaction_type: tx.transaction_type,
      office_name: officeMap[tx.office_id] || null,
      amount: tx.debit,
      date: new Date(tx.date).toISOString().split("T")[0]
    }));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/loans-by-branch-yearly", async (req, res) => {
  try {
    // Always use: Dec 25 (prev year) to Dec 24 (current year)
    const today = new Date();
    const currentYear = today.getFullYear();

    const startDate = `${currentYear - 1}-12-25`;
    const endDate = `${currentYear}-12-24`;

    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    const [clients] = await pool.query(`SELECT * FROM clients`);
    const clientMap = {};
    clients.forEach(c => {
      clientMap[c.id] = {
        first_name: c.first_name,
        last_name: c.last_name,
        office_id: c.office_id
      };
    });

    const [loans] = await pool.query(`
      SELECT *
      FROM loans
      WHERE status = 'disbursed'
      AND created_date >= ? AND created_date <= ?
    `, [startDate, endDate]);

    if (!loans.length) return res.json([]);

    const result = loans.map(loan => {
      const client = clientMap[loan.client_id];
      const office_name = officeMap[client.office_id] || null;

      return {
        loan_id: loan.id,
        principal: loan.principal,
        client_name: `${client.first_name} ${client.last_name}`,
        office_name,
        date: new Date(loan.created_date).toISOString().split("T")[0]
      };
    });

    result.sort((a, b) => {
      if (!a.office_name) return 1;
      if (!b.office_name) return -1;
      return a.office_name.localeCompare(b.office_name);
    });

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/transactions-by-type-yearly', async (req, res) => {
  try {
    // Always use: Dec 25 (prev year) to Dec 24 (current year)
    const today = new Date();
    const currentYear = today.getFullYear();

    const startDate = `${currentYear - 1}-12-25`;
    const endDate = `${currentYear}-12-24`;

    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
      AND payment_apply_to IN ('part_payment', 'full_payment')
      AND date >= ? AND date <= ?
      ORDER BY transaction_type ASC
    `, [startDate, endDate]);

    if (transactions.length === 0) return res.json([]);

    const result = transactions.map(tx => ({
      id: tx.id,
      loan_id: tx.loan_id,
      amount: tx.credit,
      payment_apply_to: tx.payment_apply_to,
      office_id: officeMap[tx.office_id],
      transaction_type: tx.transaction_type,
      date: new Date(tx.date).toISOString().split("T")[0]
    }));

    result.sort((a, b) => a.transaction_type.localeCompare(b.transaction_type));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/transactions-reloan-yearly', async (req, res) => {
  try {
    // Always use: Dec 25 (prev year) to Dec 24 (current year)
    const today = new Date();
    const currentYear = today.getFullYear();

    const startDate = `${currentYear - 1}-12-25`;
    const endDate = `${currentYear}-12-24`;

    const [transactions] = await pool.query(`
      SELECT 
        lt.id,
        lt.loan_id,
        lt.credit AS amount,
        lt.payment_apply_to,
        lt.transaction_type,
        DATE(lt.date) AS date,
        o.name AS office_name
      FROM loan_transactions lt
      LEFT JOIN offices o ON lt.office_id = o.id
      WHERE lt.transaction_type = 'repayment'
        AND lt.payment_apply_to = 'reloan_payment'
        AND DATE(lt.date) BETWEEN ? AND ?
      ORDER BY o.name ASC
    `, [startDate, endDate]);

    res.json(transactions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get('/transactions-penalties-yearly', async (req, res) => {
  try {
    // Always use: Dec 25 (prev year) to Dec 24 (current year)
    const today = new Date();
    const currentYear = today.getFullYear();

    const startDate = `${currentYear - 1}-12-25`;
    const endDate = `${currentYear}-12-24`;

    const [transactions] = await pool.query(`
      SELECT lt.*, o.name AS office_name
      FROM loan_transactions lt
      LEFT JOIN offices o ON lt.office_id = o.id
      WHERE lt.transaction_type = 'specified_due_date_fee'
        AND DATE(lt.date) BETWEEN ? AND ?
      ORDER BY o.name ASC
    `, [startDate, endDate]);

    if (!transactions.length) return res.json([]);

    const result = transactions.map(tx => ({
      id: tx.id,
      loan_id: tx.loan_id,
      amount: tx.credit,
      transaction_type: tx.transaction_type,
      office_id: tx.office_name || null,
      date: new Date(tx.date).toISOString().split('T')[0]
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});






app.get('/total-transactions-current-year', async (req, res) => {
  try {
    // Always use: Dec 25 (prev year) to Dec 24 (current year)
    const today = new Date();
    const currentYear = today.getFullYear();

    const startOfYear = `${currentYear - 1}-12-25`;
    const endOfYear = `${currentYear}-12-24`;

    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 2. Fetch transactions for the current year
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
      AND (
        payment_apply_to = 'reloan_payment'
        OR payment_apply_to IN ('part_payment', 'full_payment')
      )
      AND DATE(date) BETWEEN ? AND ?
      ORDER BY date ASC
    `, [startOfYear, endOfYear]);

    if (transactions.length === 0) return res.json([]);

    // 3. Map to desired format
    const result = transactions.map(tx => {
      const office_name = officeMap[tx.office_id] || null;
      const txDate = new Date(tx.date).toISOString().split('T')[0];

      return {
        id: tx.id,
        loan_id: tx.loan_id,
        amount: tx.credit,
        payment_apply_to: tx.payment_apply_to,
        transaction_type: tx.transaction_type,
        office_name: office_name,
        date: txDate
      };
    });

    // 4. Sort by branch/office name
    result.sort((a, b) => {
      if (!a.office_name) return 1;
      if (!b.office_name) return -1;
      return a.office_name.localeCompare(b.office_name);
    });

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/uncollected-this-year", async (req, res) => {
  try {
    // 1. Fetch clients
    const [clients] = await pool.query(`SELECT * FROM clients`);
    const clientMap = {};
    clients.forEach(c => {
      clientMap[c.id] = {
        first_name: c.first_name,
        last_name: c.last_name,
        office_id: c.office_id
      };
    });

    // 2. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => {
      officeMap[o.id] = o.name;
    });

    // 3. Fetch disbursed loans created in 2025
    const [loans] = await pool.query(`
      SELECT *
      FROM loans
      WHERE status = 'disbursed'
      AND YEAR(created_at) = 2025
    `);

    if (loans.length === 0) return res.json([]);

    const loanIds = loans.map(l => l.id);

    // 4. Fetch transactions
    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions WHERE loan_id IN (?)`,
      [loanIds]
    );

    // 5. Group transactions by loan_id
    const txByLoan = {};
    transactions.forEach(tx => {
      if (!txByLoan[tx.loan_id]) txByLoan[tx.loan_id] = [];
      txByLoan[tx.loan_id].push(tx);
    });

    // 6. Build result with balance
    let result = loans.map(loan => {
      const tList = txByLoan[loan.id] || [];

      let debit = 0;
      let credit = 0;

      tList.forEach(t => {
        debit += Number(t.debit) || 0;
        credit += Number(t.credit) || 0;
      });

      const balance = debit - credit;

      if (balance === 0) return null; // skip zero balances

      const client = clientMap[loan.client_id];
      const loanDate = loan.created_at.toISOString().split('T')[0]; // YYYY-MM-DD

      return {
        loan_id: loan.id,
        client_id: loan.client_id,
        full_name: `${client.first_name} ${client.last_name}`,
        office_name: officeMap[client.office_id] || null,
        balance,
        loan_date: loanDate
      };
    }).filter(l => l !== null);

    // 7. Sort by month (loan_date)
    result.sort((a, b) => new Date(a.loan_date) - new Date(b.loan_date));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/uncollected-last-year", async (req, res) => {
  try {
    // 1. Fetch clients
    const [clients] = await pool.query(`SELECT * FROM clients`);
    const clientMap = {};
    clients.forEach(c => {
      clientMap[c.id] = {
        first_name: c.first_name,
        last_name: c.last_name,
        office_id: c.office_id
      };
    });

    // 2. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => {
      officeMap[o.id] = o.name;
    });

    // 3. Fetch disbursed loans created in 2025
    const [loans] = await pool.query(`
      SELECT *
      FROM loans
      WHERE YEAR(created_at) = 2023
    `);

    if (loans.length === 0) return res.json([]);

    const loanIds = loans.map(l => l.id);

    // 4. Fetch transactions, BUT ONLY UP TO 31 DEC 2024
    const [transactions] = await pool.query(
      `SELECT * 
       FROM loan_transactions 
       WHERE loan_id IN (?) 
       AND date <= '2023-12-31'`,
      [loanIds]
    );

    // 5. Group transactions by loan_id
    const txByLoan = {};
    transactions.forEach(tx => {
      if (!txByLoan[tx.loan_id]) txByLoan[tx.loan_id] = [];
      txByLoan[tx.loan_id].push(tx);
    });

    // 6. Build result with balance
    let result = loans.map(loan => {
      const tList = txByLoan[loan.id] || [];

      let debit = 0;
      let credit = 0;

      tList.forEach(t => {
        debit += Number(t.debit) || 0;
        credit += Number(t.credit) || 0;
      });

      const balance = debit - credit;

      // ✔ skip zero balances
      if (balance <= 0) return null;

      const client = clientMap[loan.client_id];

if (!client) {
  console.log("Missing client for loan:", loan.id, "client_id:", loan.client_id);
  return null; // Skip this entry to avoid crash
}

      const loanDate = loan.created_at.toISOString().split('T')[0];

      return {
        loan_id: loan.id,
        client_id: loan.client_id,
        full_name: `${client.first_name} ${client.last_name}`,
        office_name: officeMap[client.office_id] || null,
        balance,
        loan_date: loanDate
      };
    }).filter(l => l !== null);

    // 7. Sort by month (loan_date)
    result.sort((a, b) => new Date(a.loan_date) - new Date(b.loan_date));

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/branch-collections-list', async (req, res) => {
  try {
    // 1. Fetch collections per branch using SQL aggregation
    const [collections] = await pool.query(`
      SELECT o.name AS office_name, 
             SUM(t.credit) AS total_collections
      FROM loan_transactions t
      JOIN offices o ON o.id = t.office_id
      WHERE t.payment_apply_to IN ('full_payment', 'part_payment', 'reloan_payment')
      GROUP BY o.id, o.name
      ORDER BY total_collections DESC
    `);

    res.json(collections);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/employee-collections', async (req, res) => {
  try {
    const [collections] = await pool.query(`
      SELECT 
        CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
        SUM(t.credit) AS total_collections
      FROM loan_transactions t
      JOIN loans l ON l.id = t.loan_id
      JOIN users u ON u.id = l.loan_officer_id
      WHERE t.payment_apply_to IN ('full_payment', 'part_payment', 'reloan_payment')
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY total_collections DESC
    `);

    res.json(collections);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get('/transactions-reloan-interest', async (req, res) => {
  try {
    // Today's date in YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch offices
    const [offices] = await pool.query(`SELECT * FROM offices`);
    const officeMap = {};
    offices.forEach(o => officeMap[o.id] = o.name);

    // 2. Fetch today's transactions for specified_due_date_fee
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'interest'
      AND DATE(date) = ?
    `, [today]);

    if (transactions.length === 0) return res.json([]);

    // 3. Map to desired format
    const result = transactions.map(tx => {
      const office_name = officeMap[tx.office_id] || null;
      const txDate = new Date(tx.date).toISOString().split('T')[0];

      return {
        id: tx.id,
        loan_id: tx.loan_id,
        amount: tx.credit,
        transaction_type: tx.transaction_type,
        office_id: office_name,
        date: txDate
      };
    });

    // 4. Sort by branch/office_name
    result.sort((a, b) => {
      if (!a.office_id) return 1;
      if (!b.office_id) return -1;
      return a.office_id.localeCompare(b.office_id);
    });

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});




app.get("/my_clients/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const office =  await pool.query(`SELECT * FROM clients WHERE staff_id = ? `,[id]);
        //res.json(cycle_date[0][0])
console.log(office[0])
    res.json(office[0])
    } catch(err){
        console.log(err)
    }
})



app.get('/dashboard_loans_dm/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { cycle_date } = req.query; // <-- selectedCycle comes here

      console.log(cycle_date + 'AM HERE')
  
      if (!cycle_date) {
        return res.status(400).json({ error: "cycle_date is required" });
      }
  
      const [loans] = await pool.query(
        'SELECT * FROM loans WHERE office_id = ?',
        [id]
      );
  
      if (!loans || loans.length === 0) {
        return res.json({
          loan_list: [],
          transactions: [],
          COUA: 0,
          SUT: 0,
          given_out: 0,
          pdua: 0,
          ledgerData: []
        });
      }
  
      const loanIds = loans.map(loan => loan.id);
  
      const [transactions] = await pool.query(
        `SELECT * FROM loan_transactions WHERE loan_id IN (?)`,
        [loanIds]
      );
  
      // --- helpers same as before (getLoanBalances, sumPrincipalByCycleDate, etc.) ---
      const formatToYYYYMMDD = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      };
  
      const getLoanBalances = (loansWithTxns) =>
        loansWithTxns.map(({ id, principal, filteredTransactions }) => {
          let debit = 0;
          let credit = 0;
  
          filteredTransactions.forEach(t => {
            debit += Number(t.debit) || 0;
            if (t.payment_apply_to === 'reloan_payment') {
              const reloanAmount = Number(principal) + (Number(principal) * 0.4);
              credit += reloanAmount;
            } else {
              credit += Number(t.credit) || 0;
            }
          });
  
          return { id, balance: debit - credit };
        });
  
      const sumPrincipalByCycleDate = (loans, targetDate) =>
        loans.reduce((sum, loan) =>
          formatToYYYYMMDD(loan.cycle_date) === targetDate
            ? sum + (Number(loan.principal) || 0)
            : sum,
          0
        );
  
      const getLedgerLoans = (loans, transactions, targetDate) => {
        const matchingLoans = loans.filter(loan => formatToYYYYMMDD(loan.cycle_date) === targetDate);
        return matchingLoans.map(loan => {
          const loanTxns = transactions.filter(txn => txn.loan_id === loan.id);
          let balance = 0;
  
          if (!loan.reloaned) {
            let debit = 0, credit = 0;
            loanTxns.forEach(txn => {
              debit += Number(txn.debit) || 0;
              credit += Number(txn.credit) || 0;
            });
            balance = debit - credit;
          }
  
          return {
            id: loan.id,
            client: loan.client_id,
            reloan: loan.reloaned,
            principal: Number(loan.principal) + (Number(loan.principal) * 0.4),
            balance,
            date: loan.created_date
          };
        });
      };
  
      const getTotalCreditInRange = (transactions, givenDate, givenDate2) => {
        const start = new Date(givenDate);
        const end = new Date(givenDate2);
  
        return transactions.reduce((total, txn) => {
          const txnDate = new Date(txn.date);
          const isInRange = txnDate > start && txnDate <= end;
  
          const meetsConditions =
            (txn.transaction_type === 'repayment' && txn.payment_apply_to === 'full_payment' && isInRange) ||
            (txn.payment_apply_to === 'part_payment' && isInRange) ||
            (txn.payment_apply_to === 'reloan_payment' && isInRange);
  
          return meetsConditions ? total + (Number(txn.credit) || 0) : total;
        }, 0);
      };
  
      // --- use selectedCycle from frontend ---
      const todayStr = formatToYYYYMMDD(cycle_date); // <-- important!
      const givenDate2 = new Date(cycle_date);
      givenDate2.setMonth(givenDate2.getMonth() + 1);
  
      const loansWithFilteredTxns = loans.map(loan => ({
        ...loan,
        filteredTransactions: transactions.filter(
          txn => txn.loan_id === loan.id &&
          new Date(txn.date) < new Date(cycle_date) &&
          txn.transaction_type !== "specified_due_date_fee"
        )
      }));
  
      const loansWithFilteredTxns2 = loans.map(loan => ({
        ...loan,
        filteredTransactions: transactions.filter(
          txn => txn.loan_id === loan.id &&
          txn.transaction_type !== "specified_due_date_fee"
        )
      }));
  
      const loanBalances = getLoanBalances(loansWithFilteredTxns);
      const loanBalances2 = getLoanBalances(loansWithFilteredTxns2);
  
      const COUA = loanBalances.reduce((sum, loan) => sum + loan.balance, 0);
      const SUT = loanBalances2.reduce((sum, loan) => sum + loan.balance, 0);
      const given_out = sumPrincipalByCycleDate(loans, todayStr);
  
      const TCC = getTotalCreditInRange(transactions, todayStr, formatToYYYYMMDD(givenDate2));
      const pdua = COUA > 0 ? (TCC / COUA) * 100 : 0;
      const ledgerData = getLedgerLoans(loans, transactions, todayStr);
  
      res.json({
        loan_list: loans,
        transactions,
        COUA,
        SUT,
        given_out,
        pdua,
        ledgerData,
        TCC
      });
  
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });



app.get('/loan_balances',async(req,res)=>{
    try{
        const [loans] = await pool.query('SELECT id FROM loans WHERE status = "disbursed"');
        console.log(loans)
        const balances = await Promise.all(
            loans.map(async (loan) => {
              const [transactions] = await pool.query(
                'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
                [loan.id]
              );
      
              let debit = 0;
              let credit = 0;
      
              transactions.forEach((t) => {
                debit += Number(t.debit) || 0;
                credit += Number(t.credit) || 0;
              });
      
              return {
                loanId: loan.id,
                balance: debit - credit,
              };
            })
          );
      console.log(balances)
          res.json(balances);
    }catch(err){
        console.error('Error fetching loan balances:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})


app.get('/loan-consultant-targets', async (req, res) => {
  try {
    const YEAR = 2025;
    const TOTAL_CONSULTANTS = 200;

    // 1. Get loan consultants (IDs only, count ignored)
    const [consultants] = await pool.query(`
      SELECT u.id
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      WHERE ru.role_id = 3
    `);

    const consultantIds = consultants.map(c => c.id);
    if (consultantIds.length === 0) {
      return res.json({
        year: YEAR,
        annual_averages: {
          target_50000: "0.00",
          target_80000: "0.00"
        },
        monthly_breakdown: []
      });
    }

    // 2. Monthly given_out per consultant
    const [monthlyGivenOut] = await pool.query(`
      SELECT 
        l.loan_officer_id AS user_id,
        MONTH(lt.date) AS month,
        SUM(
          CASE 
            WHEN lt.transaction_type = 'disbursement' 
              THEN lt.debit
            WHEN lt.transaction_type = 'repayment'
              AND lt.payment_apply_to = 'reloan_payment'
              THEN (lt.balance_bf - lt.credit)
            ELSE 0
          END
        ) AS given_out
      FROM loan_transactions lt
      JOIN loans l ON l.id = lt.loan_id
      WHERE YEAR(lt.date) = ${YEAR}
        AND l.loan_officer_id IN (?)
      GROUP BY l.loan_officer_id, MONTH(lt.date)
    `, [consultantIds]);

    // 3. Organize per month
    const monthMap = {};
    monthlyGivenOut.forEach(row => {
      if (!monthMap[row.month]) monthMap[row.month] = [];
      monthMap[row.month].push(Number(row.given_out));
    });

    const monthNames = [
      "", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthlyBreakdown = [];
    let sum50 = 0;
    let sum80 = 0;
    let monthsCounted = 0;

    // 4. Monthly calculations
    Object.keys(monthMap)
      .sort((a, b) => a - b)
      .forEach(month => {
        const values = monthMap[month];

        const between50 = values.filter(v => v >= 50000 && v < 80000).length;
        const above80 = values.filter(v => v >= 80000).length;

        const percent50 = (between50 / TOTAL_CONSULTANTS) * 100;
        const percent80 = (above80 / TOTAL_CONSULTANTS) * 100;

        monthlyBreakdown.push({
          month: monthNames[month],
          target_50000: {
            count: between50,
            percentage: percent50.toFixed(2)
          },
          target_80000: {
            count: above80,
            percentage: percent80.toFixed(2)
          }
        });

        sum50 += percent50;
        sum80 += percent80;
        monthsCounted++;
      });

    // 5. Annual averages
    const annual50 = monthsCounted ? sum50 / monthsCounted : 0;
    const annual80 = monthsCounted ? sum80 / monthsCounted : 0;

    res.json({
      year: YEAR,
      annual_averages: {
        target_50000: annual50.toFixed(2),
        target_80000: annual80.toFixed(2)
      },
      monthly_breakdown: monthlyBreakdown
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});



app.get('/loan-consultant-performance', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date and end_date are required query params" });
    }

    // 1. Get consultants + office info
    const [consultants] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.office_id,
        o.name AS office_name
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      WHERE ru.role_id = 3
    `);

    const userIds = consultants.map(u => u.id);

    if (userIds.length === 0) return res.json([]);

    // 2. Get all disbursed loans for these users
    const [loans] = await pool.query(`
      SELECT id, loan_officer_id
      FROM loans
      WHERE loan_officer_id IN (?)
    `, [userIds]);

    const loanIds = loans.map(l => l.id);
    if (loanIds.length === 0) {
      // Return empty balances if no loans
      return res.json(consultants.map(u => ({
        user_id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        office: u.office_name || "No office",
        total_uncollected: 0,
        total_collected: 0,
        still_uncollected: 0,
        given_out:0 
      })));
    }

    // 3. Fetch all transactions for these loans in the date range
    const [transactions] = await pool.query(`
      SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?) 
      AND date > ? AND date <= ?
    `, [loanIds, start_date, end_date]);



  const [transactions_two] = await pool.query(`
  SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
  FROM loan_transactions
  WHERE loan_id IN (?)
    AND (
      date < ?
      OR transaction_type = 'interest_waiver'
    )
`, [loanIds, start_date]);



    // 4. Map loan_id -> user_id
    const loanToUser = {};
    loans.forEach(l => {
      loanToUser[l.id] = l.loan_officer_id;
    });

    // 5. Aggregate totals per user
    const userTotals = {};
    userIds.forEach(id => {
      userTotals[id] = { total_uncollected: 0, total_collected: 0,given_out:0 };
    });

    transactions.forEach(t => {
      const userId = loanToUser[t.loan_id];
      if (!userId) return;

      // Uncollected: debit - credit excluding specified_due_date_fee
      if (t.transaction_type !== 'specified_due_date_fee') {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;
        userTotals[userId].total_uncollected += debit - credit;
      }

      // Collected: repayment credits with payment_apply_to filter

   if (t.transaction_type === 'repayment') {
    
        const credit = Number(t.credit) || 0;
    if(t.payment_apply_to === 'reloan_payment'){
      userTotals[userId].total_collected += Number(t.balance_bf); 
    }else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)){
         userTotals[userId].total_collected += credit;
    }
   }




      
      if (t.transaction_type === 'disbursement') {
        const debit = Number(t.debit) || 0;
        userTotals[userId].given_out += debit;
      }


      if (t.transaction_type === 'repayment' &&
          ['reloan_payment'].includes(t.payment_apply_to)) {
        const reloan_amount = Number(t.balance_bf) - Number(t.credit) || 0;
        userTotals[userId].given_out += reloan_amount;
      }


    });



      transactions_two.forEach(t => {
      const userId = loanToUser[t.loan_id];
      if (!userId) return;

           const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

      // Uncollected: debit - credit excluding specified_due_date_fee
      if (t.transaction_type !== 'specified_due_date_fee') {
        userTotals[userId].total_uncollected += debit - credit;
      }

    });


 


    // 6. Combine results
 const results = consultants.map(u => {
  const totals = userTotals[u.id] || { total_uncollected: 0, total_collected: 0, given_out: 0};
  const still_uncollected = totals.total_uncollected - totals.total_collected;
  return {
    user_id: u.id,
    name: `${u.first_name} ${u.last_name}`,
    office: u.office_name || "No office",
    total_uncollected: totals.total_uncollected.toFixed(2),
    total_collected: totals.total_collected.toFixed(2),
    still_uncollected: still_uncollected.toFixed(2),
    given_out: totals.given_out.toFixed(2)
  };
});


    // 7. Sort by office name
    results.sort((a, b) => a.office.localeCompare(b.office));

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});



app.get('/my-performance', async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;

    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "user_id, start_date and end_date are required"
      });
    }

    // Helper: shift a date by X months
    function shiftMonth(dateStr, months) {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      dt.setUTCMonth(dt.getUTCMonth() + months);
      const yyyy = dt.getUTCFullYear();
      const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(dt.getUTCDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    // Validate consultant
    const [consultant] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, o.name AS office
      FROM users u
      LEFT JOIN offices o ON o.id = u.office_id
      WHERE u.id = ? AND EXISTS (
        SELECT 1 FROM role_users ru WHERE ru.role_id = 3 AND ru.user_id = u.id
      )
    `, [user_id]);

    if (consultant.length === 0) {
      return res.status(404).json({ error: "Consultant not found" });
    }

    // Prepare cycles (current + 11 previous)
    const cycles = [];
    let carry_in = 0;

    for (let i = 0; i < 12; i++) {

      const cycleStart = shiftMonth(start_date, -i);
      const cycleEnd = shiftMonth(end_date, -i);

      // Fetch disbursements for this cycle
      const [rows] = await pool.query(`
        SELECT SUM(debit) AS total_disbursed
        FROM loan_transactions lt
        JOIN loans l ON l.id = lt.loan_id
        WHERE l.loan_officer_id = ?
        AND lt.transaction_type = 'disbursement'
        AND lt.date >= ? 
        AND lt.date < ?
      `, [user_id, cycleStart, cycleEnd]);

      const actual = Number(rows[0].total_disbursed || 0);

      // Option B logic
      const total_available = carry_in + actual;

      let cycle_given_out = 0;
      let new_carry_over = 0;

      if (total_available >= 40000) {
        cycle_given_out = 40000;
        new_carry_over = total_available - 40000;
      } else {
        cycle_given_out = total_available;
        new_carry_over = 0;
      }

      cycles.push({
        label: `Cycle ${i + 1}`,
        start: cycleStart,
        end: cycleEnd,
        carry_in: carry_in.toFixed(2),
        cycle_given_out: cycle_given_out.toFixed(2),
        carry_over: new_carry_over.toFixed(2),
      });

      carry_in = new_carry_over; // next cycle
    }

    return res.json({
      consultant: consultant[0],
      current_cycle: cycles[0],
      cycles,
      final_carry_over: carry_in.toFixed(2)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});



app.get('/my-performance-new', async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;

    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "user_id, start_date and end_date are required query params"
      });
    }

    // Convert start_date to proper YYYY-MM-DD format for MySQL
    const startDate = new Date(start_date).toISOString().split('T')[0];

    // 1. Fetch the consultant + office
 const [consultantRows] = await pool.query(`
  SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.office_id,
    o.name AS office_name
  FROM users u
  JOIN role_users ru ON ru.user_id = u.id
  LEFT JOIN offices o ON o.id = u.office_id
  WHERE ru.role_id IN (3, 4, 6) AND u.id = ?
`, [user_id]);

    if (consultantRows.length === 0) {
      return res.status(404).json({ error: "Consultant not found or not role_id = 3" });
    }

    const consultant = consultantRows[0];

    // 2. Get loans assigned to this consultant
    const [loans] = await pool.query(`
      SELECT id
      FROM loans
      WHERE loan_officer_id = ?
    `, [user_id]);

    const loanIds = loans.map(l => l.id);

    // 2a. Fetch carry_over even if no loans exist
    const [carryOverRows] = await pool.query(`
      SELECT amount
      FROM carry_overs
      WHERE user_id = ? AND cycle_date = ? AND status = 'active'
      LIMIT 1
    `, [user_id, startDate]);

    const carryOverAmount = carryOverRows.length > 0 ? Number(carryOverRows[0].amount) : 0;

    if (loanIds.length === 0) {
      return res.json({
        user_id: consultant.id,
        name: `${consultant.first_name} ${consultant.last_name}`,
        office: consultant.office_name || "No office",
        total_uncollected: "0.00",
        total_collected: "0.00",
        still_uncollected: "0.00",
        given_out: carryOverAmount.toFixed(2) // include carry over even if no loans
      });
    }

    // 3. Get loan transactions in date range
    const [transactions] = await pool.query(`
      SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?) 
      AND date >= ? AND date <= ?
    `, [loanIds, start_date, end_date]);

    const [transactions_two] = await pool.query(`
      SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND (
          date < ?
          OR transaction_type = 'interest_waiver'
        )
    `, [loanIds, start_date]);

    // 4. Aggregate
    let total_uncollected = 0;
    let uncollected_without_charges = 0;
    let total_collected = 0;
    let given_out = 0;

    transactions.forEach(t => {
      const debit = Number(t.debit) || 0;
      const credit = Number(t.credit) || 0;

      if (['repayment'].includes(t.transaction_type)) {
        if (t.payment_apply_to === 'reloan_payment') {
          total_collected += Number(t.balance_bf); 
        } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
          total_collected += credit;
        }
      }

      if (t.transaction_type === 'disbursement') {
        given_out += debit;
      }

      if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
        const reloan_amount = (Number(t.balance_bf) || 0) - credit;
        given_out += reloan_amount;
      }
    });

    transactions_two.forEach(t => {
      const debit = Number(t.debit) || 0;
      const credit = Number(t.credit) || 0;

      if (t.transaction_type !== 'specified_due_date_fee') {
        total_uncollected += debit - credit;
      }

      uncollected_without_charges += debit - credit;
    });

    const still_uncollected = total_uncollected - total_collected;
    const pdua = Math.min(total_collected / total_uncollected, 1);

    // 5. Add carry over to given_out
    given_out += carryOverAmount;

    // 6. Respond
    res.json({
      user_id: consultant.id,
      name: `${consultant.first_name} ${consultant.last_name}`,
      office: consultant.office_name || "No office",
      total_uncollected: total_uncollected.toFixed(2),
      total_collected: total_collected.toFixed(2),
      still_uncollected: still_uncollected.toFixed(2),
      given_out: given_out.toFixed(2),
      carry_over: carryOverAmount,// includes carry_over now
      uncollected_without_charges:uncollected_without_charges.toFixed(2),
      pdua: pdua.toFixed(2)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.get('/my-performance-new-admin', async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;

    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "user_id, start_date and end_date are required query params"
      });
    }

    // Convert start_date to proper YYYY-MM-DD format for MySQL
    const startDate = new Date(start_date).toISOString().split('T')[0];

    // 1. Fetch the consultant + office
    const [consultantRows] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.office_id,
        o.name AS office_name
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      WHERE ru.role_id IN (3, 4, 6) AND u.id = ?
    `, [user_id]);

    if (consultantRows.length === 0) {
      return res.status(404).json({ error: "Consultant not found or not role_id = 3" });
    }

    const consultant = consultantRows[0];

    // NEW: Get clients joined by this consultant within the given date range
    const [newClients] = await pool.query(`
      SELECT
        id,
        first_name,
        last_name,
        joined_date
      FROM clients
      WHERE staff_id = ?
        AND joined_date >= ?
        AND joined_date <= ?
      ORDER BY joined_date ASC
    `, [user_id, start_date, end_date]);

    // 2. Get loans assigned to this consultant
    const [loans] = await pool.query(`
      SELECT id
      FROM loans
      WHERE loan_officer_id = ?
    `, [user_id]);

    const loanIds = loans.map(l => l.id);

    // 2a. Fetch carry_over even if no loans exist
    const [carryOverRows] = await pool.query(`
      SELECT amount
      FROM carry_overs
      WHERE user_id = ? AND cycle_date = ? AND status = 'active'
      LIMIT 1
    `, [user_id, startDate]);

    const carryOverAmount = carryOverRows.length > 0 ? Number(carryOverRows[0].amount) : 0;

    if (loanIds.length === 0) {
      return res.json({
        user_id: consultant.id,
        name: `${consultant.first_name} ${consultant.last_name}`,
        office: consultant.office_name || "No office",
        total_uncollected: "0.00",
        total_collected: "0.00",
        still_uncollected: "0.00",
        given_out: carryOverAmount.toFixed(2),

        reloan_collections_percentage: "0.00",
        full_payment_collections_percentage: "0.00",
        part_payment_collections_percentage: "0.00",

        reloan_given_out_percentage: "0.00",
        new_loans_given_out_percentage: "0.00",

        new_clients_count: newClients.length,
        new_clients: newClients
      });
    }

    // 3. Get loan transactions in date range
    const [transactions] = await pool.query(`
      SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?) 
      AND date >= ? AND date <= ?
    `, [loanIds, start_date, end_date]);

    const [transactions_two] = await pool.query(`
      SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND (
          date < ?
          OR transaction_type = 'interest_waiver'
        )
    `, [loanIds, start_date]);

    // 4. Aggregate
    let total_uncollected = 0;
    let uncollected_without_charges = 0;
    let total_collected = 0;
    let given_out = 0;

    // NEW: Collection breakdowns
    let reloan_collections = 0;
    let full_payment_collections = 0;
    let part_payment_collections = 0;

    // NEW: Given-out breakdowns
    let reloan_given_out = 0;
    let new_loans_given_out = 0;

    transactions.forEach(t => {
      const debit = Number(t.debit) || 0;
      const credit = Number(t.credit) || 0;

      if (['repayment'].includes(t.transaction_type)) {
        if (t.payment_apply_to === 'reloan_payment') {
          total_collected += Number(t.balance_bf);

          // NEW: Track reloan collections
          reloan_collections += Number(t.balance_bf) || 0;

        } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
          total_collected += credit;

          // NEW: Track full and part payment collections
          if (t.payment_apply_to === 'full_payment') {
            full_payment_collections += credit;
          }

          if (t.payment_apply_to === 'part_payment') {
            part_payment_collections += credit;
          }
        }
      }

      if (t.transaction_type === 'disbursement') {
        given_out += debit;

        // NEW: Track new loan given out
        new_loans_given_out += debit;
      }

      if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
        const reloan_amount = (Number(t.balance_bf) || 0) - credit;

        given_out += reloan_amount;

        // NEW: Track reloan given out
        reloan_given_out += reloan_amount;
      }
    });

    transactions_two.forEach(t => {
      const debit = Number(t.debit) || 0;
      const credit = Number(t.credit) || 0;

      if (t.transaction_type !== 'specified_due_date_fee') {
        total_uncollected += debit - credit;
      }

      uncollected_without_charges += debit - credit;
    });

    const still_uncollected = total_uncollected - total_collected;
    const pdua = total_collected / total_uncollected;

    // 5. Add carry over to given_out
    given_out += carryOverAmount;

    // NEW: Calculate collection percentages
    const reloan_collections_percentage = total_collected > 0
      ? (reloan_collections / total_collected) * 100
      : 0;

    const full_payment_collections_percentage = total_collected > 0
      ? (full_payment_collections / total_collected) * 100
      : 0;

    const part_payment_collections_percentage = total_collected > 0
      ? (part_payment_collections / total_collected) * 100
      : 0;

    // NEW: Calculate given-out percentages
    const reloan_given_out_percentage = given_out > 0
      ? (reloan_given_out / given_out) * 100
      : 0;

    const new_loans_given_out_percentage = given_out > 0
      ? (new_loans_given_out / given_out) * 100
      : 0;

    // 6. Respond
    res.json({
      user_id: consultant.id,
      name: `${consultant.first_name} ${consultant.last_name}`,
      office: consultant.office_name || "No office",

      total_uncollected: total_uncollected.toFixed(2),
      total_collected: total_collected.toFixed(2),
      still_uncollected: still_uncollected.toFixed(2),
      given_out: given_out.toFixed(2),

      carry_over: carryOverAmount,

      uncollected_without_charges: uncollected_without_charges.toFixed(2),
      pdua: pdua.toFixed(2),

      // Collection statistics
      reloan_collections_percentage: reloan_collections_percentage.toFixed(2),
      full_payment_collections_percentage: full_payment_collections_percentage.toFixed(2),
      part_payment_collections_percentage: part_payment_collections_percentage.toFixed(2),

      // Given-out statistics
      reloan_given_out_percentage: reloan_given_out_percentage.toFixed(2),
      new_loans_given_out_percentage: new_loans_given_out_percentage.toFixed(2),

      // New clients
      new_clients_count: newClients.length,
      new_clients: newClients
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.get('/consultants-performance-by-office', async (req, res) => {
  try {
    const { office_id, start_date, end_date } = req.query;

    if (!office_id) {
      return res.status(400).json({ error: "office_id is required" });
    }

    // 1. GET CONSULTANTS IN OFFICE
    const [consultants] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      WHERE ru.role_id IN (3,4,6)
        AND u.office_id = ?
        AND u.status = 'active' 
    `, [office_id]);

    const results = [];

    for (const consultant of consultants) {
      const user_id = consultant.id;

      // CYCLE DATE
      const [cycleEndRows] = await pool.query(
        `SELECT * FROM cycle_dates WHERE loan_officer_id = ? LIMIT 1`,
        [user_id]
      );

      const cycle_end_on = cycleEndRows.length > 0 ? cycleEndRows[0].cycle_end_date : null;

      // ✅ HANDLE DIFFERENT CYCLE DATES PER USER
      let startDate = start_date;
      let endDate = end_date;

      if (!startDate || !endDate) {
        const cycleEndDay = cycle_end_on ? Number(dayjs(cycle_end_on).date()) : 24;
        const today = dayjs();

        let currentMonth = dayjs().startOf('month');
        let cycleDay = Math.min(cycleEndDay, currentMonth.daysInMonth());
        let cycleDate = currentMonth.date(cycleDay).add(1, 'day');

        if (today.isBefore(cycleDate)) {
          let prevMonth = dayjs().subtract(1, 'month').startOf('month');
          cycleDay = Math.min(cycleEndDay, prevMonth.daysInMonth());
          cycleDate = prevMonth.date(cycleDay).add(1, 'day');
        }

        startDate = cycleDate.format('YYYY-MM-DD');
        endDate = cycleDate.add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD');
      }

    const last_start_date = dayjs(start_date).subtract(1, 'month').format('YYYY-MM-DD');
const last_end_date = dayjs(end_date).subtract(1, 'month').format('YYYY-MM-DD');

      // 2. LOANS
      const [loans] = await pool.query(`
        SELECT id FROM loans WHERE loan_officer_id = ?
      `, [user_id]);

      const [loans_test] = await pool.query(`

    SELECT id

    FROM loans

    WHERE loan_officer_id = ?

      AND created_date BETWEEN ? AND ?

`, [user_id, last_start_date, last_end_date]);


      const loanIds = loans.map(l => l.id);
      const loanIdsTest = loans_test.map(l => l.id);
    

      // 3. CARRY OVER
      const [carryOverRows] = await pool.query(`
        SELECT amount
        FROM carry_overs
        WHERE user_id = ?
          AND DATE(cycle_date) = DATE(?)
          AND status = 'active'
        LIMIT 1
      `, [user_id, startDate]);

      const carryOverAmount = carryOverRows.length > 0 ? Number(carryOverRows[0].amount) : 0;

      let total_uncollected = 0;
      let test_still_uncollected = 0;
      let test_total_uncollected = 0;
      let total_collected = 0;
      let given_out = carryOverAmount;

      if (loanIds.length > 0) {
        const [transactions] = await pool.query(`
          SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
          FROM loan_transactions
          WHERE loan_id IN (?) 
            AND date >= ? AND date <= ?
        `, [loanIds, startDate, endDate]);

        const [transactions_two] = await pool.query(`
          SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
          FROM loan_transactions
          WHERE loan_id IN (?)
            AND (date < ? OR transaction_type = 'interest_waiver')
        `, [loanIds, start_date]);

           // Previous cycle opening uncollected amount

                const [transactions_three] = await pool.query(`
    SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
    FROM loan_transactions
    WHERE loan_id IN (?)
      AND date BETWEEN ? AND ?
`, [loanIds, last_start_date, last_end_date]);


        if (loanIdsTest.length > 0) {


    

 


    // Previous cycle transactions

    //
const [transactions_four] = await pool.query(`
    SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
    FROM loan_transactions
    WHERE loan_id IN (?) 
`, [loanIdsTest]);


    // Previous cycle total uncollected


let total_debit_four = 0;
let total_credit_four = 0;

    // Previous cycle collections
    transactions_four.forEach(t => {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

         total_debit_four += debit;
    total_credit_four += credit;
    test_still_uncollected = total_debit_four - total_credit_four
    });

}

let total_debit_three = 0;
let total_credit_three = 0;

// Previous cycle total uncollected
transactions_three.forEach(t => {

    const debit = Number(t.debit) || 0;
    const credit = Number(t.credit) || 0;

    total_debit_three += debit;
    total_credit_three += credit;
test_total_uncollected = total_debit_three - total_credit_three

});


        transactions.forEach(t => {
          const debit = Number(t.debit) || 0;
          const credit = Number(t.credit) || 0;

          if (t.transaction_type === 'repayment') {
            if (t.payment_apply_to === 'reloan_payment') {
              total_collected += Number(t.balance_bf);
            } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
              total_collected += credit;
            }
          }

          if (t.transaction_type === 'disbursement') {
            given_out += debit;
          }

          if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
            const reloan_amount = (Number(t.balance_bf) || 0) - credit;
            given_out += reloan_amount;
          }
        });

        transactions_two.forEach(t => {
          const debit = Number(t.debit) || 0;
          const credit = Number(t.credit) || 0;

          if (t.transaction_type !== 'specified_due_date_fee') {
            total_uncollected += debit - credit;
          }


        });


     
      }

      const still_uncollected = total_uncollected - total_collected;
      const pdua = total_uncollected > 0 ? total_collected / total_uncollected : 0;

      // 4. TARGET MET FOR CURRENT CYCLE
      const [currentTargetRows] = await pool.query(`
        SELECT COUNT(*) AS total
        FROM (
          SELECT MIN(id) AS id
          FROM targets_met
          WHERE user_id = ?
            AND date >= ?
            AND date <= ?
          GROUP BY user_id
        ) AS x
      `, [user_id, startDate, endDate]);

      const target_met_current = currentTargetRows[0].total > 0 ? 1 : 0;

      // 5. TARGET MET HISTORY FOR LAST 5 PREVIOUS CYCLES
      const target_history = [];

      for (let i = 1; i <= 5; i++) {
        const previousStartDate = dayjs(startDate).subtract(i, 'month').format('YYYY-MM-DD');
        const previousEndDate = dayjs(endDate).subtract(i, 'month').format('YYYY-MM-DD');

        const [historyTargetRows] = await pool.query(`
          SELECT COUNT(*) AS total
          FROM (
            SELECT MIN(id) AS id
            FROM targets_met
            WHERE user_id = ?
              AND date >= ?
              AND date <= ?
            GROUP BY user_id
          ) AS x
        `, [user_id, previousStartDate, previousEndDate]);

        target_history.push(historyTargetRows[0].total > 0 ? 1 : 0);
      }

      results.push({
        user_id,
        name: `${consultant.first_name} ${consultant.last_name}`,
        total_uncollected: total_uncollected.toFixed(2),
        test_total_uncollected: test_total_uncollected.toFixed(2),
        test_still_uncollected:test_still_uncollected.toFixed(2),
        total_collected: total_collected.toFixed(2),
        still_uncollected: still_uncollected.toFixed(2),
        given_out: given_out.toFixed(2),
        pdua: pdua.toFixed(2),
        carry_over: carryOverAmount,
        target_met_current,
        target_history,
        cycle_end_on,
      });
    }

    res.json({
      data: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.get('/consultants-target-early-warning', async (req, res) => {

    try {

        const { office_id } = req.query;

        /*
         * 1 = Target met
         * 0 = Target missed
         * 2 = No target data
         */

        let consultantsQuery = `
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.office_id,
                o.name AS office_name
            FROM users u
            JOIN role_users ru
                ON ru.user_id = u.id
            LEFT JOIN offices o
                ON o.id = u.office_id
            WHERE ru.role_id IN (3)
                AND u.status = 'active'
        `;

        const consultantsParams = [];

        if (office_id) {

            consultantsQuery += `
                AND u.office_id = ?
            `;

            consultantsParams.push(office_id);
        }

        const [consultants] = await pool.query(
            consultantsQuery,
            consultantsParams
        );

        const warnings = [];

        for (const consultant of consultants) {

            const user_id = consultant.id;

            /*
             * Get consultant's cycle end day
             */
            const [cycleRows] = await pool.query(
                `
                SELECT cycle_end_date
                FROM cycle_dates
                WHERE loan_officer_id = ?
                ORDER BY id DESC
                LIMIT 1
                `,
                [user_id]
            );

            let cycleEndDay = 24;

            if (
                cycleRows.length > 0 &&
                cycleRows[0].cycle_end_date
            ) {

                const cycleValue =
                    cycleRows[0].cycle_end_date;

                if (
                    typeof cycleValue === 'number' ||
                    /^\d+$/.test(String(cycleValue))
                ) {

                    cycleEndDay =
                        Number(cycleValue);

                } else {

                    cycleEndDay =
                        Number(
                            dayjs(cycleValue).date()
                        );
                }
            }

            /*
             * Current cycle
             */
            const today = dayjs();

            let currentCycleEnd = dayjs()
                .date(cycleEndDay);

            if (
                currentCycleEnd.isBefore(
                    today,
                    'day'
                )
            ) {

                currentCycleEnd =
                    currentCycleEnd.add(
                        1,
                        'month'
                    );
            }

            const currentCycleStart =
                currentCycleEnd
                    .subtract(1, 'month')
                    .add(1, 'day');

            const currentStartDate =
                currentCycleStart.format(
                    'YYYY-MM-DD'
                );

            const currentEndDate =
                currentCycleEnd.format(
                    'YYYY-MM-DD'
                );


            /*
             * Previous 5 cycles
             */
            const target_history = [];
            const warning_cycles = [];

            let cyclesWithData = 0;


            for (let i = 1; i <= 5; i++) {

                const cycleEnd =
                    currentCycleEnd
                        .subtract(i, 'month')
                        .startOf('day');

                const cycleStart =
                    cycleEnd
                        .subtract(1, 'month')
                        .add(1, 'day')
                        .startOf('day');

                const previousStartDate =
                    cycleStart.format(
                        'YYYY-MM-DD'
                    );

                const previousEndDate =
                    cycleEnd.format(
                        'YYYY-MM-DD'
                    );


                /*
                 * Check whether the consultant
                 * actually has a target record
                 * for this cycle.
                 *
                 * IMPORTANT:
                 *
                 * targets_met only tells us that
                 * the target was met.
                 *
                 * Therefore:
                 *
                 * total > 0
                 *      = target met
                 *
                 * total = 0
                 *      = currently treated as
                 *        no data
                 *
                 * This prevents new consultants
                 * from automatically being treated
                 * as having missed targets.
                 */
                const [historyTargetRows] =
                    await pool.query(
                        `
                        SELECT COUNT(*) AS total
                        FROM targets_met
                        WHERE user_id = ?
                            AND date >= ?
                            AND date <= ?
                        `,
                        [
                            user_id,
                            previousStartDate,
                            previousEndDate
                        ]
                    );


                const total =
                    Number(
                        historyTargetRows[0].total
                    );


                /*
                 * TARGET MET
                 */
                if (total > 0) {

                    cyclesWithData++;

                    target_history.push(1);

                    warning_cycles.push({

                        cycle_number: i,

                        status: 'met',

                        cycle_start:
                            previousStartDate,

                        cycle_end:
                            previousEndDate

                    });

                }

                /*
                 * NO DATA
                 */
                else {

                    target_history.push(2);

                    warning_cycles.push({

                        cycle_number: i,

                        status: 'no_data',

                        cycle_start:
                            previousStartDate,

                        cycle_end:
                            previousEndDate

                    });
                }
            }


            /*
             * If the consultant has no target
             * history at all, don't include them.
             */
            if (cyclesWithData === 0) {

                continue;
            }


            /*
             * If the consultant has only one
             * historical target, there is not
             * enough information to determine
             * whether they missed 2 consecutive
             * targets.
             */
            if (cyclesWithData < 2) {

                warnings.push({

                    user_id,

                    name:
                        `${consultant.first_name} ${consultant.last_name}`,

                    office_id:
                        consultant.office_id,

                    office_name:
                        consultant.office_name || 'N/A',

                    target_history,

                    consecutive_misses: 0,

                    warning: false,

                    status: 'no_data',

                    cycles_with_data:
                        cyclesWithData,

                    message:
                        'Not enough target history',

                    warning_cycles,

                    cycle_start:
                        currentStartDate,

                    cycle_end:
                        currentEndDate,

                    cycle_end_on:
                        cycleEndDay

                });

                continue;
            }


            /*
             * Count consecutive misses.
             *
             * 0 = missed
             * 1 = met
             * 2 = no data
             *
             * No data breaks the consecutive
             * missed-target sequence.
             */
            let consecutiveMisses = 0;

            for (
                let i = 0;
                i < target_history.length;
                i++
            ) {

                /*
                 * Missed target
                 */
                if (
                    target_history[i] === 0
                ) {

                    consecutiveMisses++;

                }

                /*
                 * Target met
                 *
                 * This stops the consecutive
                 * missed count.
                 */
                else if (
                    target_history[i] === 1
                ) {

                    break;

                }

                /*
                 * No data
                 *
                 * This also stops the consecutive
                 * missed count.
                 */
                else {

                    break;
                }
            }


            /*
             * WARNING
             *
             * Only show as a warning when the
             * consultant has actually missed
             * 2 or more consecutive targets.
             */
            if (consecutiveMisses >= 2) {

                warnings.push({

                    user_id,

                    name:
                        `${consultant.first_name} ${consultant.last_name}`,

                    office_id:
                        consultant.office_id,

                    office_name:
                        consultant.office_name || 'N/A',

                    target_history,

                    consecutive_misses:
                        consecutiveMisses,

                    warning: true,

                    status: 'warning',

                    warning_cycles:
                        warning_cycles
                            .filter(
                                cycle =>
                                    cycle.status ===
                                    'missed'
                            )
                            .slice(
                                0,
                                consecutiveMisses
                            ),

                    cycle_start:
                        currentStartDate,

                    cycle_end:
                        currentEndDate,

                    cycle_end_on:
                        cycleEndDay

                });
            }

        }


        /*
         * Response
         */
        res.json({

            success: true,

            total_warnings:
                warnings.filter(
                    item => item.warning === true
                ).length,

            total_with_data:
                warnings.length,

            data:
                warnings

        });


    } catch (error) {

        console.error(
            'Consultant target early warning error:',
            error
        );

        res.status(500).json({

            success: false,

            error:
                'Something went wrong.'

        });
    }

});




app.get('/consultants-target-early-warning-branch', async (req, res) => {

  try {

    const { office_id, start_date, end_date } = req.query;

    if (!office_id) {
      return res.status(400).json({
        success: false,
        error: 'office_id is required.'
      });
    }

    let consultantsQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id,
        o.name AS office_name
      FROM users u
      JOIN role_users ru 
        ON ru.user_id = u.id
      LEFT JOIN offices o
        ON o.id = u.office_id
      WHERE ru.role_id IN (3)
        AND u.status = 'active'
        AND u.office_id = ?
    `;

    const consultantsParams = [office_id];

    const [consultants] = await pool.query(
      consultantsQuery,
      consultantsParams
    );

    const warnings = [];

    for (const consultant of consultants) {

      const user_id = consultant.id;

      const [cycleEndRows] = await pool.query(
        `
        SELECT *
        FROM cycle_dates
        WHERE loan_officer_id = ?
        LIMIT 1
        `,
        [user_id]
      );

      const cycle_end_on =
        cycleEndRows.length > 0
          ? cycleEndRows[0].cycle_end_date
          : null;

      let startDate = start_date;
      let endDate = end_date;

      if (!startDate || !endDate) {

        const cycleEndDay = cycle_end_on
          ? Number(dayjs(cycle_end_on).date())
          : 24;

        const today = dayjs();

        let currentMonth = dayjs().startOf('month');

        let cycleDay = Math.min(
          cycleEndDay,
          currentMonth.daysInMonth()
        );

        let cycleDate = currentMonth
          .date(cycleDay)
          .add(1, 'day');

        if (today.isBefore(cycleDate)) {

          let prevMonth = dayjs()
            .subtract(1, 'month')
            .startOf('month');

          cycleDay = Math.min(
            cycleEndDay,
            prevMonth.daysInMonth()
          );

          cycleDate = prevMonth
            .date(cycleDay)
            .add(1, 'day');
        }

        startDate = cycleDate.format('YYYY-MM-DD');

        endDate = cycleDate
          .add(1, 'month')
          .subtract(1, 'day')
          .format('YYYY-MM-DD');
      }

      const target_history = [];

      for (let i = 1; i <= 5; i++) {

        const previousStartDate = dayjs(startDate)
          .subtract(i, 'month')
          .format('YYYY-MM-DD');

        const previousEndDate = dayjs(endDate)
          .subtract(i, 'month')
          .format('YYYY-MM-DD');

        const [historyTargetRows] = await pool.query(
          `
          SELECT COUNT(*) AS total
          FROM (
            SELECT MIN(id) AS id
            FROM targets_met
            WHERE user_id = ?
              AND date >= ?
              AND date <= ?
            GROUP BY user_id
          ) AS x
          `,
          [
            user_id,
            previousStartDate,
            previousEndDate
          ]
        );

        target_history.push(
          historyTargetRows[0].total > 0 ? 1 : 0
        );
      }

      let consecutiveMisses = 0;
      let warningCycles = [];

      for (let i = 0; i < target_history.length; i++) {

        if (target_history[i] === 0) {
          consecutiveMisses++;
        } else {
          break;
        }
      }

      if (consecutiveMisses >= 2) {

        for (let i = 0; i < consecutiveMisses; i++) {

          warningCycles.push({
            cycle_number: i + 1,
            status: 'missed'
          });

        }

        warnings.push({

          user_id,

          name:
            `${consultant.first_name} ${consultant.last_name}`,

          office_id:
            consultant.office_id,

          office_name:
            consultant.office_name || 'N/A',

          target_history,

          consecutive_misses:
            consecutiveMisses,

          warning: true,

          warning_cycles:
            warningCycles,

          cycle_start:
            startDate,

          cycle_end:
            endDate,

          cycle_end_on

        });
      }
    }

    res.json({

      success: true,

      office_id,

      total_warnings:
        warnings.length,

      data:
        warnings

    });

  } catch (error) {

    console.error(
      'Consultant target early warning error:',
      error
    );

    res.status(500).json({

      success: false,

      error: 'Something went wrong.'

    });

  }

});




app.get('/consultants-target-early-warning-district', async (req, res) => {

  try {

    const { district_id, start_date, end_date } = req.query;

    if (!district_id) {
      return res.status(400).json({
        success: false,
        error: 'district_id is required.'
      });
    }

    const [districtRows] = await pool.query(`
      SELECT
        id,
        name
      FROM districts
      WHERE id = ?
      LIMIT 1
    `, [district_id]);

    if (districtRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `District ${district_id} not found`
      });
    }

    const district = districtRows[0];

    const [consultants] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id,
        o.name AS office_name,
        o.district_id
      FROM users u
      JOIN role_users ru
        ON ru.user_id = u.id
      JOIN offices o
        ON o.id = u.office_id
      WHERE ru.role_id IN (3)
        AND u.status = 'active'
        AND o.district_id = ?
      ORDER BY o.name ASC, u.first_name ASC, u.last_name ASC
    `, [district_id]);

    const warnings = [];

    for (const consultant of consultants) {

      const user_id = consultant.id;

      const [cycleEndRows] = await pool.query(
        `
        SELECT *
        FROM cycle_dates
        WHERE loan_officer_id = ?
        LIMIT 1
        `,
        [user_id]
      );

      const cycle_end_on =
        cycleEndRows.length > 0
          ? cycleEndRows[0].cycle_end_date
          : null;

      let startDate = start_date;
      let endDate = end_date;

      if (!startDate || !endDate) {

        const cycleEndDay = cycle_end_on
          ? Number(dayjs(cycle_end_on).date())
          : 24;

        const today = dayjs();

        let currentMonth = dayjs().startOf('month');

        let cycleDay = Math.min(
          cycleEndDay,
          currentMonth.daysInMonth()
        );

        let cycleDate = currentMonth
          .date(cycleDay)
          .add(1, 'day');

        if (today.isBefore(cycleDate)) {

          let prevMonth = dayjs()
            .subtract(1, 'month')
            .startOf('month');

          cycleDay = Math.min(
            cycleEndDay,
            prevMonth.daysInMonth()
          );

          cycleDate = prevMonth
            .date(cycleDay)
            .add(1, 'day');
        }

        startDate = cycleDate.format('YYYY-MM-DD');

        endDate = cycleDate
          .add(1, 'month')
          .subtract(1, 'day')
          .format('YYYY-MM-DD');
      }

      const target_history = [];

      for (let i = 1; i <= 5; i++) {

        const previousStartDate = dayjs(startDate)
          .subtract(i, 'month')
          .format('YYYY-MM-DD');

        const previousEndDate = dayjs(endDate)
          .subtract(i, 'month')
          .format('YYYY-MM-DD');

        const [historyTargetRows] = await pool.query(
          `
          SELECT COUNT(*) AS total
          FROM (
            SELECT MIN(id) AS id
            FROM targets_met
            WHERE user_id = ?
              AND date >= ?
              AND date <= ?
            GROUP BY user_id
          ) AS x
          `,
          [
            user_id,
            previousStartDate,
            previousEndDate
          ]
        );

        target_history.push(
          historyTargetRows[0].total > 0 ? 1 : 0
        );
      }

      let consecutiveMisses = 0;
      let warningCycles = [];

      for (let i = 0; i < target_history.length; i++) {

        if (target_history[i] === 0) {
          consecutiveMisses++;
        } else {
          break;
        }
      }

      if (consecutiveMisses >= 2) {

        for (let i = 0; i < consecutiveMisses; i++) {

          warningCycles.push({
            cycle_number: i + 1,
            status: 'missed'
          });

        }

        warnings.push({

          user_id,

          name:
            `${consultant.first_name} ${consultant.last_name}`,

          office_id:
            consultant.office_id,

          office_name:
            consultant.office_name || 'N/A',

          target_history,

          consecutive_misses:
            consecutiveMisses,

          warning: true,

          warning_cycles:
            warningCycles,

          cycle_start:
            startDate,

          cycle_end:
            endDate,

          cycle_end_on

        });
      }
    }

    res.json({

      success: true,

      district_id,

      district_name:
        district.name,

      total_warnings:
        warnings.length,

      data:
        warnings

    });

  } catch (error) {

    console.error(
      'District consultant target early warning error:',
      error
    );

    res.status(500).json({

      success: false,

      error: 'Something went wrong.'

    });

  }

});



app.get('/consultants-target-early-warning-province', async (req, res) => {

  try {

    const { province_id, start_date, end_date } = req.query;

    if (!province_id) {
      return res.status(400).json({
        success: false,
        error: 'province_id is required.'
      });
    }

    const [provinceRows] = await pool.query(`
      SELECT
        id,
        name
      FROM province
      WHERE id = ?
      LIMIT 1
    `, [province_id]);

    if (provinceRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Province ${province_id} not found`
      });
    }

    const province = provinceRows[0];

    const [consultants] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id,
        o.name AS office_name,
        o.province_id,
        o.district_id
      FROM users u
      JOIN role_users ru
        ON ru.user_id = u.id
      JOIN offices o
        ON o.id = u.office_id
      WHERE ru.role_id IN (3)
        AND u.status = 'active'
        AND o.province_id = ?
      ORDER BY o.name ASC, u.first_name ASC, u.last_name ASC
    `, [province_id]);

    const warnings = [];

    for (const consultant of consultants) {

      const user_id = consultant.id;

      const [cycleEndRows] = await pool.query(
        `
        SELECT *
        FROM cycle_dates
        WHERE loan_officer_id = ?
        LIMIT 1
        `,
        [user_id]
      );

      const cycle_end_on =
        cycleEndRows.length > 0
          ? cycleEndRows[0].cycle_end_date
          : null;

      let startDate = start_date;
      let endDate = end_date;

      if (!startDate || !endDate) {

        const cycleEndDay = cycle_end_on
          ? Number(dayjs(cycle_end_on).date())
          : 24;

        const today = dayjs();

        let currentMonth = dayjs().startOf('month');

        let cycleDay = Math.min(
          cycleEndDay,
          currentMonth.daysInMonth()
        );

        let cycleDate = currentMonth
          .date(cycleDay)
          .add(1, 'day');

        if (today.isBefore(cycleDate)) {

          let prevMonth = dayjs()
            .subtract(1, 'month')
            .startOf('month');

          cycleDay = Math.min(
            cycleEndDay,
            prevMonth.daysInMonth()
          );

          cycleDate = prevMonth
            .date(cycleDay)
            .add(1, 'day');
        }

        startDate = cycleDate.format('YYYY-MM-DD');

        endDate = cycleDate
          .add(1, 'month')
          .subtract(1, 'day')
          .format('YYYY-MM-DD');
      }

      const target_history = [];

      for (let i = 1; i <= 5; i++) {

        const previousStartDate = dayjs(startDate)
          .subtract(i, 'month')
          .format('YYYY-MM-DD');

        const previousEndDate = dayjs(endDate)
          .subtract(i, 'month')
          .format('YYYY-MM-DD');

        const [historyTargetRows] = await pool.query(
          `
          SELECT COUNT(*) AS total
          FROM (
            SELECT MIN(id) AS id
            FROM targets_met
            WHERE user_id = ?
              AND date >= ?
              AND date <= ?
            GROUP BY user_id
          ) AS x
          `,
          [
            user_id,
            previousStartDate,
            previousEndDate
          ]
        );

        target_history.push(
          historyTargetRows[0].total > 0 ? 1 : 0
        );
      }

      let consecutiveMisses = 0;
      let warningCycles = [];

      for (let i = 0; i < target_history.length; i++) {

        if (target_history[i] === 0) {
          consecutiveMisses++;
        } else {
          break;
        }
      }

      if (consecutiveMisses >= 2) {

        for (let i = 0; i < consecutiveMisses; i++) {

          warningCycles.push({
            cycle_number: i + 1,
            status: 'missed'
          });

        }

        warnings.push({

          user_id,

          name:
            `${consultant.first_name} ${consultant.last_name}`,

          office_id:
            consultant.office_id,

          office_name:
            consultant.office_name || 'N/A',

          target_history,

          consecutive_misses:
            consecutiveMisses,

          warning: true,

          warning_cycles:
            warningCycles,

          cycle_start:
            startDate,

          cycle_end:
            endDate,

          cycle_end_on

        });
      }
    }

    res.json({

      success: true,

      province_id,

      province_name:
        province.name,

      total_warnings:
        warnings.length,

      data:
        warnings

    });

  } catch (error) {

    console.error(
      'Province consultant target early warning error:',
      error
    );

    res.status(500).json({

      success: false,

      error: 'Something went wrong.'

    });

  }

});



app.get('/consultants-target-triggering-pattern', async (req, res) => {

    try {

        const { office_id } = req.query;

        let consultantsQuery = `
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.office_id,
                o.name AS office_name
            FROM users u
            JOIN role_users ru
                ON ru.user_id = u.id
            LEFT JOIN offices o
                ON o.id = u.office_id
            WHERE ru.role_id IN (3)
                AND u.status = 'active'
        `;

        const consultantsParams = [];

        if (office_id) {

            consultantsQuery += `
                AND u.office_id = ?
            `;

            consultantsParams.push(office_id);
        }

        const [consultants] = await pool.query(
            consultantsQuery,
            consultantsParams
        );

        const triggeringConsultants = [];

        for (const consultant of consultants) {

            const user_id = consultant.id;

            // Get consultant's cycle end day
            const [cycleRows] = await pool.query(
                `
                SELECT cycle_end_date
                FROM cycle_dates
                WHERE loan_officer_id = ?
                ORDER BY id DESC
                LIMIT 1
                `,
                [user_id]
            );

            let cycleEndDay = 24;

            if (
                cycleRows.length > 0 &&
                cycleRows[0].cycle_end_date
            ) {

                const cycleValue =
                    cycleRows[0].cycle_end_date;

                if (
                    typeof cycleValue === 'number' ||
                    /^\d+$/.test(String(cycleValue))
                ) {

                    cycleEndDay = Number(cycleValue);

                } else {

                    cycleEndDay = Number(
                        dayjs(cycleValue).date()
                    );
                }
            }

            const today = dayjs();

            let currentCycleEnd = dayjs()
                .date(cycleEndDay);

            if (currentCycleEnd.isBefore(today, 'day')) {

                currentCycleEnd =
                    currentCycleEnd.add(1, 'month');
            }

            const currentCycleStart =
                currentCycleEnd
                    .subtract(1, 'month')
                    .add(1, 'day');

            const currentStartDate =
                currentCycleStart.format('YYYY-MM-DD');

            const currentEndDate =
                currentCycleEnd.format('YYYY-MM-DD');

            /*
             * Get the last 5 COMPLETED cycles.
             *
             * Array order:
             *
             * [most recent, previous, older, ...]
             *
             * Example:
             *
             * [1, 0, 0, 1, 1]
             *
             * means:
             * - latest cycle: met
             * - previous cycle: missed
             * - previous cycle: missed
             */
            const target_history = [];
            const cycle_history = [];

            for (let i = 1; i <= 5; i++) {

                const cycleEnd =
                    currentCycleEnd
                        .subtract(i, 'month')
                        .startOf('day');

                const cycleStart =
                    cycleEnd
                        .subtract(1, 'month')
                        .add(1, 'day')
                        .startOf('day');

                const cycleStartDate =
                    cycleStart.format('YYYY-MM-DD');

                const cycleEndDate =
                    cycleEnd.format('YYYY-MM-DD');

                const [historyTargetRows] =
                    await pool.query(
                        `
                        SELECT COUNT(*) AS total
                        FROM targets_met
                        WHERE user_id = ?
                            AND date >= ?
                            AND date <= ?
                        `,
                        [
                            user_id,
                            cycleStartDate,
                            cycleEndDate
                        ]
                    );

                const met =
                    Number(historyTargetRows[0].total) > 0;

                target_history.push(
                    met ? 1 : 0
                );

                cycle_history.push({
                    cycle_number: i,
                    status: met ? 'met' : 'missed',
                    cycle_start: cycleStartDate,
                    cycle_end: cycleEndDate
                });
            }

            /*
             * Triggering pattern:
             *
             * [1, 0, 0]
             *
             * Most recent cycle = MET
             * Previous cycle = MISSED
             * Cycle before that = MISSED
             */
            const triggeringPattern =
                target_history.length >= 3 &&
                target_history[0] === 1 &&
                target_history[1] === 0 &&
                target_history[2] === 0;

            if (triggeringPattern) {

                triggeringConsultants.push({

                    user_id,

                    name:
                        `${consultant.first_name} ${consultant.last_name}`,

                    office_id:
                        consultant.office_id,

                    office_name:
                        consultant.office_name || 'N/A',

                    target_history,

                    triggering_pattern: [
                        1,
                        0,
                        0
                    ],

                    pattern_description:
                        'Met target after missing two consecutive targets',

                    triggering_cycles: [
                        cycle_history[0],
                        cycle_history[1],
                        cycle_history[2]
                    ],

                    cycle_start:
                        currentStartDate,

                    cycle_end:
                        currentEndDate,

                    cycle_end_on:
                        cycleEndDay

                });
            }
        }

        res.json({

            success: true,

            total_triggering_patterns:
                triggeringConsultants.length,

            data:
                triggeringConsultants

        });

    } catch (error) {

        console.error(
            'Consultant target triggering pattern error:',
            error
        );

        res.status(500).json({

            success: false,

            error: 'Something went wrong.'

        });

    }

});





app.get('/branch-performance', async (req, res) => {
  try {
    const { office_id } = req.query;

    if (!office_id) {
      return res.status(400).json({
        error: "office_id is required"
      });
    }

    // 1. Get consultants + cycle_end_date
    const [consultants] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id,
        o.name AS office_name,
        cd.cycle_end_date
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      LEFT JOIN cycle_dates cd ON cd.loan_officer_id = u.id
      WHERE ru.role_id IN (3, 4, 6)
      AND u.office_id = ?
    `, [office_id]);

    if (!consultants.length) {
      return res.json({
        office_id,
        total_uncollected: "0.00",
        total_collected: "0.00",
        still_uncollected: "0.00",
        given_out: "0.00",
        carry_over: "0.00",
        uncollected_without_charges: "0.00",
        pdua: "0.00"
      });
    }

    // Branch totals
    let branch_total_uncollected = 0;
    let branch_total_collected = 0;
    let branch_given_out = 0;
    let branch_carry_over = 0;
    let branch_uncollected_without_charges = 0;

    // 2. Loop consultants
    for (const user of consultants) {

      // ===============================
      // Build Cycle Period (YOUR LOGIC)
      // ===============================

      const cycleEndDay = user.cycle_end_date
        ? parseInt(user.cycle_end_date)
        : 24;

      const today = dayjs();

      let currentMonth = dayjs().startOf('month');
      let cycleDay = Math.min(cycleEndDay, currentMonth.daysInMonth());
      let cycleDate = currentMonth.date(cycleDay).add(1, 'day');

      if (today.isBefore(cycleDate)) {
        let prevMonth = dayjs().subtract(1, 'month').startOf('month');
        cycleDay = Math.min(cycleEndDay, prevMonth.daysInMonth());
        cycleDate = prevMonth.date(cycleDay).add(1, 'day');
      }

      const start_date = cycleDate.format('YYYY-MM-DD');
      const end_date = cycleDate.add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD');

      // Format for carry_over
      const startDateFormatted = cycleDate.format('YYYY-MM-DD');

      // ===============================
      // Loans
      // ===============================

      const [loans] = await pool.query(`
        SELECT id FROM loans WHERE loan_officer_id = ?
      `, [user.id]);

      const loanIds = loans.map(l => l.id);

      // ===============================
      // Carry Over
      // ===============================

      const [carryOverRows] = await pool.query(`
        SELECT amount
        FROM carry_overs
        WHERE user_id = ? 
        AND cycle_date = ? 
        AND status = 'active'
        LIMIT 1
      `, [user.id, startDateFormatted]);

      const carryOverAmount = carryOverRows.length > 0
        ? Number(carryOverRows[0].amount)
        : 0;

      branch_carry_over += carryOverAmount;

      if (loanIds.length === 0) {
        continue;
      }

      // ===============================
      // Transactions (current cycle)
      // ===============================

      const [transactions] = await pool.query(`
        SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?) 
        AND date >= ? AND date <= ?
      `, [loanIds, start_date, end_date]);

      // ===============================
      // Transactions (before cycle)
      // ===============================

      const [transactions_two] = await pool.query(`
        SELECT loan_id, debit, credit, transaction_type
        FROM loan_transactions
        WHERE loan_id IN (?)
        AND (
          date < ?
          OR transaction_type = 'interest_waiver'
        )
      `, [loanIds, start_date]);

      let total_uncollected = 0;
      let total_collected = 0;
      let given_out = 0;
      let uncollected_without_charges = 0;

      // --- Current cycle ---
      transactions.forEach(t => {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

        if (t.transaction_type === 'repayment') {
          if (t.payment_apply_to === 'reloan_payment') {
            total_collected += Number(t.balance_bf) || 0;
          } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
            total_collected += credit;
          }
        }

        if (t.transaction_type === 'disbursement') {
          given_out += debit;
        }

        if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
          const reloan_amount = (Number(t.balance_bf) || 0) - credit;
          given_out += reloan_amount;
        }
      });

      // --- Before cycle ---
      transactions_two.forEach(t => {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

        if (t.transaction_type !== 'specified_due_date_fee') {
          total_uncollected += debit - credit;
        }

        uncollected_without_charges += debit - credit;
      });

      // ===============================
      // Aggregate to branch
      // ===============================

      branch_total_uncollected += total_uncollected;
      branch_total_collected += total_collected;
      branch_given_out += given_out;
      branch_uncollected_without_charges += uncollected_without_charges;
    }

    const still_uncollected = branch_total_uncollected - branch_total_collected;

    const pdua = branch_total_uncollected > 0
      ? branch_total_collected / branch_total_uncollected
      : 0;

    // ===============================
    // Final Response
    // ===============================

    res.json({
      office_id,
      total_uncollected: branch_total_uncollected.toFixed(2),
      total_collected: branch_total_collected.toFixed(2),
      still_uncollected: still_uncollected.toFixed(2),
      given_out: branch_given_out.toFixed(2),
      carry_over: branch_carry_over.toFixed(2),
      uncollected_without_charges: branch_uncollected_without_charges.toFixed(2),
      pdua: pdua.toFixed(2)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.get('/branch-performance-new', async (req, res) => {
  try {
    const { office_id } = req.query;

    if (!office_id) {
      return res.status(400).json({
        error: "office_id is required"
      });
    }

    // ✅ FIXED CYCLE DAY (24 → +1 = 25 start)
    const cycleEndDay = 24;

    const today = dayjs();

    let currentMonth = dayjs().startOf('month');
    let cycleDay = Math.min(cycleEndDay, currentMonth.daysInMonth());
    let cycleDate = currentMonth.date(cycleDay).add(1, 'day'); // → 25th

    if (today.isBefore(cycleDate)) {
      let prevMonth = dayjs().subtract(1, 'month').startOf('month');
      cycleDay = Math.min(cycleEndDay, prevMonth.daysInMonth());
      cycleDate = prevMonth.date(cycleDay).add(1, 'day');
    }

    const start_date = cycleDate.format('YYYY-MM-DD'); // 25th
    const end_date = cycleDate.add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD'); // 24th

    const startDateFormatted = start_date;

    // 1. Get ALL consultants (unchanged)
    const [consultants] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id,
        o.name AS office_name
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      WHERE ru.role_id IN (3,4,6)
        AND u.office_id = ?
    `, [office_id]);

    if (consultants.length === 0) {
      return res.status(404).json({ error: "No consultants found for this office" });
    }

    const consultantIds = consultants.map(c => c.id);
    const officeName = consultants[0].office_name || "No office";

    // ✅ Active consultants count
    const [activeConsultants] = await pool.query(`
      SELECT COUNT(*) as count
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      WHERE ru.role_id IN (3,4,6)
        AND u.office_id = ?
        AND u.status = 'active'
    `, [office_id]);

    const consultantsCount = activeConsultants[0]?.count || 0;

    // ✅ Targets Met Count (distinct users)
    const [targetsMetRows] = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM targets_met
      WHERE user_id IN (?)
        AND date >= ?
        AND date <= ?
    `, [consultantIds, start_date, end_date]);

    const targetsMetCount = targetsMetRows[0]?.count || 0;

    // ✅ Efficiency (avoid divide by zero)
    const efficiency = consultantsCount > 0
      ? (targetsMetCount / consultantsCount)
      : 0;

    // 2. Loans
    const [loans] = await pool.query(`
      SELECT id
      FROM loans
      WHERE office_id = ?
    `, [office_id]);

    const loanIds = loans.map(l => l.id);

    // 2a. Carry Over
    const [carryOverRows] = await pool.query(`
      SELECT SUM(amount) as total
      FROM carry_overs
      WHERE user_id IN (?)
        AND cycle_date = ?
        AND status = 'active'
    `, [consultantIds, startDateFormatted]);

    const carryOverAmount = Number(carryOverRows[0]?.total || 0);

    if (loanIds.length === 0) {
      return res.json({
        office_id,
        office: officeName,
        start_date,
        end_date,
        total_uncollected: "0.00",
        total_collected: "0.00",
        still_uncollected: "0.00",
        given_out: carryOverAmount.toFixed(2),
        carry_over: carryOverAmount,
        consultants_count: consultantsCount,
        targets_met_count: targetsMetCount,
        efficiency: efficiency.toFixed(2) // ✅ included here too
      });
    }

    // 3. Transactions
    const [transactions] = await pool.query(`
      SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?) 
        AND date >= ? AND date <= ?
    `, [loanIds, start_date, end_date]);

    const [transactions_two] = await pool.query(`
      SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND (
          date < ?
          OR transaction_type = 'interest_waiver'
        )
    `, [loanIds, start_date]);

    // 4. Aggregate
    let total_uncollected = 0;
    let uncollected_without_charges = 0;
    let total_collected = 0;
    let given_out = 0;

    transactions.forEach(t => {
      const debit = Number(t.debit) || 0;
      const credit = Number(t.credit) || 0;

      if (t.transaction_type === 'repayment') {
        if (t.payment_apply_to === 'reloan_payment') {
          total_collected += Number(t.balance_bf);
        } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
          total_collected += credit;
        }
      }

      if (t.transaction_type === 'disbursement') {
        given_out += debit;
      }

      if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
        const reloan_amount = (Number(t.balance_bf) || 0) - credit;
        given_out += reloan_amount;
      }
    });

    transactions_two.forEach(t => {
      const debit = Number(t.debit) || 0;
      const credit = Number(t.credit) || 0;

      if (t.transaction_type !== 'specified_due_date_fee') {
        total_uncollected += debit - credit;
      }

      uncollected_without_charges += debit - credit;
    });

    const still_uncollected = total_uncollected - total_collected;
    const pdua = total_uncollected > 0 ? total_collected / total_uncollected : 0;

    given_out += carryOverAmount;

    // 5. Response
    res.json({
      office_id,
      office: officeName,
      start_date,
      end_date,
      total_uncollected: total_uncollected.toFixed(2),
      total_collected: total_collected.toFixed(2),
      still_uncollected: still_uncollected.toFixed(2),
      given_out: given_out.toFixed(2),
      carry_over: carryOverAmount,
      uncollected_without_charges: uncollected_without_charges.toFixed(2),
      pdua: pdua.toFixed(2),
      consultants_count: consultantsCount,
      targets_met_count: targetsMetCount,
      efficiency: efficiency.toFixed(2) // ✅ final metric
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.get('/branch-performance-all', async (req, res) => {
  try {

// ✅ USE PARAMS INSTEAD
const { start_date, end_date } = req.query;

if (!start_date || !end_date) {
  return res.status(400).json({ error: "start_date and end_date are required" });
}

const startDateFormatted = start_date;

    // ✅ 1. GET ALL OFFICES
    const [offices] = await pool.query(`
      SELECT id, name, province_id
      FROM offices
    `);

    const results = [];

    // ✅ 2. LOOP EACH OFFICE
    for (const office of offices) {

      const office_id = office.id;
      const officeName = office.name;

      // --- CONSULTANTS ---
      const [consultants] = await pool.query(`
        SELECT u.id
        FROM users u
        JOIN role_users ru ON ru.user_id = u.id
        WHERE ru.role_id IN (3,4,6)
          AND u.office_id = ?
      `, [office_id]);

      if (consultants.length === 0) {
        results.push({
          office_id,
          office: officeName,
          start_date,
          end_date,
          consultants_count: 0,
          targets_met_count: 0,
          efficiency: "0.00"
        });
        continue;
      }

      const consultantIds = consultants.map(c => c.id);

      // --- ACTIVE CONSULTANTS ---
      const [activeConsultants] = await pool.query(`
        SELECT COUNT(*) as count
        FROM users u
        JOIN role_users ru ON ru.user_id = u.id
        WHERE ru.role_id IN (3,4,6)
          AND u.office_id = ?
          AND u.status = 'active'
      `, [office_id]);

      const consultantsCount = activeConsultants[0]?.count || 0;

      // --- TARGETS MET ---
      const [targetsMetRows] = await pool.query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM targets_met
        WHERE user_id IN (?)
          AND date >= ?
          AND date <= ?
      `, [consultantIds, start_date, end_date]);

      const targetsMetCount = targetsMetRows[0]?.count || 0;

      const efficiency = consultantsCount > 0
        ? Math.min(targetsMetCount / consultantsCount, 1)
        : 0;

      // --- LOANS ---
      const [loans] = await pool.query(`
        SELECT id
        FROM loans
        WHERE loan_officer_id IN (?)
      `, [consultantIds]);

      const loanIds = loans.map(l => l.id);

      // --- CARRY OVER ---
      const [carryOverRows] = await pool.query(`
        SELECT SUM(amount) as total
        FROM carry_overs
        WHERE user_id IN (?)
          AND cycle_date = ?
          AND status = 'active'
      `, [consultantIds, startDateFormatted]);

      const carryOverAmount = Number(carryOverRows[0]?.total || 0);

      let total_uncollected = 0;
      let uncollected_without_charges = 0;
      let total_collected = 0;
      let given_out = carryOverAmount;

      if (loanIds.length > 0) {

        // --- TRANSACTIONS ---
        const [transactions] = await pool.query(`
          SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
          FROM loan_transactions
          WHERE loan_id IN (?) 
            AND date >= ? AND date <= ?
        `, [loanIds, start_date, end_date]);

        const [transactions_two] = await pool.query(`
          SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
          FROM loan_transactions
          WHERE loan_id IN (?)
            AND (
              date < ?
              OR transaction_type = 'interest_waiver'
            )
        `, [loanIds, start_date]);

        // --- AGGREGATE ---
        transactions.forEach(t => {
          const debit = Number(t.debit) || 0;
          const credit = Number(t.credit) || 0;

          if (t.transaction_type === 'repayment') {
            if (t.payment_apply_to === 'reloan_payment') {
              total_collected += Number(t.balance_bf);
            } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
              total_collected += credit;
            }
          }

          if (t.transaction_type === 'disbursement') {
            given_out += debit;
          }

          if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
            const reloan_amount = (Number(t.balance_bf) || 0) - credit;
            given_out += reloan_amount;
          }
        });

        transactions_two.forEach(t => {
          const debit = Number(t.debit) || 0;
          const credit = Number(t.credit) || 0;

          if (t.transaction_type !== 'specified_due_date_fee') {
            total_uncollected += debit - credit;
          }

          uncollected_without_charges += debit - credit;
        });
      }

      const still_uncollected = total_uncollected - total_collected;
      const pdua = total_uncollected > 0 ? total_collected / total_uncollected : 0;

      // --- PUSH RESULT ---
      results.push({
        office_id,
        office: officeName,
        start_date,
        end_date,
        total_uncollected: total_uncollected.toFixed(2),
        total_collected: total_collected.toFixed(2),
        still_uncollected: still_uncollected.toFixed(2),
        given_out: given_out.toFixed(2),
        carry_over: carryOverAmount,
        uncollected_without_charges: uncollected_without_charges.toFixed(2),
        pdua: pdua.toFixed(2),
        consultants_count: consultantsCount,
        targets_met_count: targetsMetCount,
        efficiency: efficiency.toFixed(2),
        province_id: office.province_id
      });
    }

    // ✅ FINAL RESPONSE
    res.json({
      start_date,
      end_date,
      data: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.get('/branch-performance-by-province', async (req, res) => {
  try {
    const { start_date, end_date, province_id } = req.query;

    if (!start_date || !end_date || !province_id) {
      return res.status(400).json({
        error: "start_date, end_date and province_id are required"
      });
    }

    const startDateFormatted = start_date;

    // ✅ GET ONLY OFFICES IN THE GIVEN PROVINCE
    const [offices] = await pool.query(`
      SELECT id, name, province_id
      FROM offices
      WHERE province_id = ?
    `, [province_id]);

    const results = [];

    // ✅ LOOP EACH OFFICE IN THE PROVINCE
    for (const office of offices) {
      const office_id = office.id;
      const officeName = office.name;

      // --- CONSULTANTS ---
      const [consultants] = await pool.query(`
        SELECT u.id
        FROM users u
        JOIN role_users ru ON ru.user_id = u.id
        WHERE ru.role_id IN (3,4,6)
          AND u.office_id = ?
      `, [office_id]);

      if (consultants.length === 0) {
        results.push({
          office_id,
          office: officeName,
          province_id: office.province_id,
          start_date,
          end_date,
          consultants_count: 0,
          targets_met_count: 0,
          efficiency: "0.00",
          total_uncollected: "0.00",
          total_collected: "0.00",
          still_uncollected: "0.00",
          given_out: "0.00",
          carry_over: 0,
          uncollected_without_charges: "0.00",
          pdua: "0.00"
        });
        continue;
      }

      const consultantIds = consultants.map(c => c.id);

      // --- ACTIVE CONSULTANTS ---
      const [activeConsultants] = await pool.query(`
        SELECT COUNT(*) as count
        FROM users u
        JOIN role_users ru ON ru.user_id = u.id
        WHERE ru.role_id IN (3,4,6)
          AND u.office_id = ?
          AND u.status = 'active'
      `, [office_id]);

      const consultantsCount = activeConsultants[0]?.count || 0;

      // --- TARGETS MET ---
      const [targetsMetRows] = await pool.query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM targets_met
        WHERE user_id IN (?)
          AND date >= ?
          AND date <= ?
      `, [consultantIds, start_date, end_date]);

      const targetsMetCount = targetsMetRows[0]?.count || 0;

      const efficiency = consultantsCount > 0
        ? Math.min(targetsMetCount / consultantsCount, 1)
        : 0;

      // --- LOANS ---
      const [loans] = await pool.query(`
        SELECT id
        FROM loans
        WHERE loan_officer_id IN (?)
      `, [consultantIds]);

      const loanIds = loans.map(l => l.id);

      // --- CARRY OVER ---
      const [carryOverRows] = await pool.query(`
        SELECT SUM(amount) as total
        FROM carry_overs
        WHERE user_id IN (?)
          AND cycle_date = ?
          AND status = 'active'
      `, [consultantIds, startDateFormatted]);

      const carryOverAmount = Number(carryOverRows[0]?.total || 0);

      let total_uncollected = 0;
      let uncollected_without_charges = 0;
      let total_collected = 0;
      let given_out = carryOverAmount;

      if (loanIds.length > 0) {
        // --- TRANSACTIONS ---
        const [transactions] = await pool.query(`
          SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
          FROM loan_transactions
          WHERE loan_id IN (?) 
            AND date >= ? AND date <= ?
        `, [loanIds, start_date, end_date]);

        const [transactions_two] = await pool.query(`
          SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
          FROM loan_transactions
          WHERE loan_id IN (?)
            AND (
              date < ?
              OR transaction_type = 'interest_waiver'
            )
        `, [loanIds, start_date]);

        // --- AGGREGATE ---
        transactions.forEach(t => {
          const debit = Number(t.debit) || 0;
          const credit = Number(t.credit) || 0;

          if (t.transaction_type === 'repayment') {
            if (t.payment_apply_to === 'reloan_payment') {
              total_collected += Number(t.balance_bf);
            } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
              total_collected += credit;
            }
          }

          if (t.transaction_type === 'disbursement') {
            given_out += debit;
          }

          if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
            const reloan_amount = (Number(t.balance_bf) || 0) - credit;
            given_out += reloan_amount;
          }
        });

        transactions_two.forEach(t => {
          const debit = Number(t.debit) || 0;
          const credit = Number(t.credit) || 0;

          if (t.transaction_type !== 'specified_due_date_fee') {
            total_uncollected += debit - credit;
          }

          uncollected_without_charges += debit - credit;
        });
      }

      const still_uncollected = total_uncollected - total_collected;
      const pdua = total_uncollected > 0 ? total_collected / total_uncollected : 0;

      // --- PUSH RESULT ---
      results.push({
        office_id,
        office: officeName,
        province_id: office.province_id,
        start_date,
        end_date,
        total_uncollected: total_uncollected.toFixed(2),
        total_collected: total_collected.toFixed(2),
        still_uncollected: still_uncollected.toFixed(2),
        given_out: given_out.toFixed(2),
        carry_over: carryOverAmount,
        uncollected_without_charges: uncollected_without_charges.toFixed(2),
        pdua: pdua.toFixed(2),
        consultants_count: consultantsCount,
        targets_met_count: targetsMetCount,
        efficiency: efficiency.toFixed(2)
      });
    }

    // ✅ FINAL RESPONSE
    res.json({
      province_id,
      start_date,
      end_date,
      data: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.get('/province-performance-all', async (req, res) => {
  try {

// ✅ USE PARAMS INSTEAD
const { start_date, end_date } = req.query;

if (!start_date || !end_date) {
  return res.status(400).json({ error: "start_date and end_date are required" });
}

const startDateFormatted = start_date;

    // ✅ 1. GET ALL PROVINCES
    const [provinces] = await pool.query(`
      SELECT id, name
      FROM province
    `);

    const results = [];

    // ✅ 2. LOOP EACH PROVINCE
    for (const province of provinces) {

      const province_id = province.id;
      const provinceName = province.name;

      // --- GET OFFICES IN PROVINCE ---
      const [offices] = await pool.query(`
        SELECT id FROM offices WHERE province_id = ?
      `, [province_id]);

      const officeIds = offices.map(o => o.id);

      if (officeIds.length === 0) {
        results.push({
          province_id,
          province: provinceName,
          start_date,
          end_date,
          consultants_count: 0,
          targets_met_count: 0,
          efficiency: "0.00"
        });
        continue;
      }

      // --- CONSULTANTS ---
      const [consultants] = await pool.query(`
        SELECT u.id
        FROM users u
        JOIN role_users ru ON ru.user_id = u.id
        WHERE ru.role_id IN (3,4,6)
          AND u.office_id IN (?)
      `, [officeIds]);

      if (consultants.length === 0) {
        results.push({
          province_id,
          province: provinceName,
          start_date,
          end_date,
          consultants_count: 0,
          targets_met_count: 0,
          efficiency: "0.00"
        });
        continue;
      }

      const consultantIds = consultants.map(c => c.id);

      // --- ACTIVE CONSULTANTS ---
      const [activeConsultants] = await pool.query(`
        SELECT COUNT(*) as count
        FROM users u
        JOIN role_users ru ON ru.user_id = u.id
        WHERE ru.role_id IN (3,4,6)
          AND u.office_id IN (?)
          AND u.status = 'active'
      `, [officeIds]);

      const consultantsCount = activeConsultants[0]?.count || 0;

      // --- TARGETS MET ---
      const [targetsMetRows] = await pool.query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM targets_met
        WHERE user_id IN (?)
          AND date >= ?
          AND date <= ?
      `, [consultantIds, start_date, end_date]);

      const targetsMetCount = targetsMetRows[0]?.count || 0;

      const efficiency = consultantsCount > 0
        ? Math.min(targetsMetCount / consultantsCount, 1)
        : 0;

      // --- LOANS ---
      const [loans] = await pool.query(`
        SELECT id
        FROM loans
        WHERE loan_officer_id IN (?)
      `, [consultantIds]);

      const loanIds = loans.map(l => l.id);

      // --- CARRY OVER ---
      const [carryOverRows] = await pool.query(`
        SELECT SUM(amount) as total
        FROM carry_overs
        WHERE user_id IN (?)
          AND cycle_date = ?
          AND status = 'active'
      `, [consultantIds, startDateFormatted]);

      const carryOverAmount = Number(carryOverRows[0]?.total || 0);

      let total_uncollected = 0;
      let uncollected_without_charges = 0;
      let total_collected = 0;
      let given_out = carryOverAmount;

      if (loanIds.length > 0) {

        const [transactions] = await pool.query(`
          SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
          FROM loan_transactions
          WHERE loan_id IN (?) 
            AND date >= ? AND date <= ?
        `, [loanIds, start_date, end_date]);

        const [transactions_two] = await pool.query(`
          SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
          FROM loan_transactions
          WHERE loan_id IN (?)
            AND (
              date < ?
              OR transaction_type = 'interest_waiver'
            )
        `, [loanIds, start_date]);

        transactions.forEach(t => {
          const debit = Number(t.debit) || 0;
          const credit = Number(t.credit) || 0;

          if (t.transaction_type === 'repayment') {
            if (t.payment_apply_to === 'reloan_payment') {
              total_collected += Number(t.balance_bf);
            } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
              total_collected += credit;
            }
          }

          if (t.transaction_type === 'disbursement') {
            given_out += debit;
          }

          if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
            const reloan_amount = (Number(t.balance_bf) || 0) - credit;
            given_out += reloan_amount;
          }
        });

        transactions_two.forEach(t => {
          const debit = Number(t.debit) || 0;
          const credit = Number(t.credit) || 0;

          if (t.transaction_type !== 'specified_due_date_fee') {
            total_uncollected += debit - credit;
          }

          uncollected_without_charges += debit - credit;
        });
      }

      const still_uncollected = total_uncollected - total_collected;
      const pdua = total_uncollected > 0 ? total_collected / total_uncollected : 0;

      // ✅ PUSH PROVINCE RESULT
      results.push({
        province_id,
        province: provinceName,
        start_date,
        end_date,
        total_uncollected: total_uncollected.toFixed(2),
        total_collected: total_collected.toFixed(2),
        still_uncollected: still_uncollected.toFixed(2),
        given_out: given_out.toFixed(2),
        carry_over: carryOverAmount,
        uncollected_without_charges: uncollected_without_charges.toFixed(2),
        pdua: pdua.toFixed(2),
        consultants_count: consultantsCount,
        targets_met_count: targetsMetCount,
        efficiency: efficiency.toFixed(2)
      });
    }

    res.json({
      start_date,
      end_date,
      data: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.get('/province-performance', async (req, res) => {
  try {

    const { start_date, end_date, province_id } = req.query;

    if (!start_date || !end_date || !province_id) {
      return res.status(400).json({ 
        error: "start_date, end_date and province_id are required" 
      });
    }

    const startDateFormatted = start_date;

    // ✅ GET PROVINCE NAME
    const [provinceRow] = await pool.query(`
      SELECT id, name FROM province WHERE id = ?
    `, [province_id]);

    if (!provinceRow.length) {
      return res.status(404).json({ error: "Province not found" });
    }

    const provinceName = provinceRow[0].name;

    // --- GET OFFICES ---
    const [offices] = await pool.query(`
      SELECT id FROM offices WHERE province_id = ?
    `, [province_id]);

    const officeIds = offices.map(o => o.id);

    if (officeIds.length === 0) {
      return res.json({
        province_id,
        province: provinceName,
        start_date,
        end_date,
        consultants_count: 0,
        targets_met_count: 0,
        efficiency: "0.00"
      });
    }

    // --- CONSULTANTS ---
    const [consultants] = await pool.query(`
      SELECT u.id
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      WHERE ru.role_id IN (3,4,6)
        AND u.office_id IN (?)
    `, [officeIds]);

    if (consultants.length === 0) {
      return res.json({
        province_id,
        province: provinceName,
        start_date,
        end_date,
        consultants_count: 0,
        targets_met_count: 0,
        efficiency: "0.00"
      });
    }

    const consultantIds = consultants.map(c => c.id);

    // --- ACTIVE CONSULTANTS ---
    const [activeConsultants] = await pool.query(`
      SELECT COUNT(*) as count
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      WHERE ru.role_id IN (3,4,6)
        AND u.office_id IN (?)
        AND u.status = 'active'
    `, [officeIds]);

    const consultantsCount = activeConsultants[0]?.count || 0;

    // --- TARGETS MET ---
    const [targetsMetRows] = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM targets_met
      WHERE user_id IN (?)
        AND date >= ?
        AND date <= ?
    `, [consultantIds, start_date, end_date]);

    const targetsMetCount = targetsMetRows[0]?.count || 0;

    const efficiency = consultantsCount > 0
      ? Math.min(targetsMetCount / consultantsCount, 1)
      : 0;

    // --- LOANS ---
    const [loans] = await pool.query(`
      SELECT id
      FROM loans
      WHERE loan_officer_id IN (?)
    `, [consultantIds]);

    const loanIds = loans.map(l => l.id);

    // --- CARRY OVER ---
    const [carryOverRows] = await pool.query(`
      SELECT SUM(amount) as total
      FROM carry_overs
      WHERE user_id IN (?)
        AND cycle_date = ?
        AND status = 'active'
    `, [consultantIds, startDateFormatted]);

    const carryOverAmount = Number(carryOverRows[0]?.total || 0);

    let total_uncollected = 0;
    let uncollected_without_charges = 0;
    let total_collected = 0;
    let given_out = carryOverAmount;

    if (loanIds.length > 0) {

      const [transactions] = await pool.query(`
        SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?) 
          AND date >= ? AND date <= ?
      `, [loanIds, start_date, end_date]);

      const [transactions_two] = await pool.query(`
        SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?)
          AND (
            date < ?
            OR transaction_type = 'interest_waiver'
          )
      `, [loanIds, start_date]);

      transactions.forEach(t => {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

        if (t.transaction_type === 'repayment') {
          if (t.payment_apply_to === 'reloan_payment') {
            total_collected += Number(t.balance_bf);
          } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
            total_collected += credit;
          }
        }

        if (t.transaction_type === 'disbursement') {
          given_out += debit;
        }

        if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
          const reloan_amount = (Number(t.balance_bf) || 0) - credit;
          given_out += reloan_amount;
        }
      });

      transactions_two.forEach(t => {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

        if (t.transaction_type !== 'specified_due_date_fee') {
          total_uncollected += debit - credit;
        }

        uncollected_without_charges += debit - credit;
      });
    }

    const still_uncollected = total_uncollected - total_collected;
    const pdua = total_uncollected > 0 
      ? total_collected / total_uncollected 
      : 0;

    // ✅ FINAL RESPONSE
 res.json({
  start_date,
  end_date,
  data: [
    {
      province_id,
      province: provinceName,
      start_date,
      end_date,
      total_uncollected: total_uncollected.toFixed(2),
      total_collected: total_collected.toFixed(2),
      still_uncollected: still_uncollected.toFixed(2),
      given_out: given_out.toFixed(2),
      carry_over: carryOverAmount,
      uncollected_without_charges: uncollected_without_charges.toFixed(2),
      pdua: pdua.toFixed(2),
      consultants_count: consultantsCount,
      targets_met_count: targetsMetCount,
      efficiency: efficiency.toFixed(2)
    }
  ]
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});



app.get('/cycle-opening-uncollected-table', async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;

    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "user_id, start_date and end_date are required query params"
      });
    }

    // 1. Fetch consultant + office
    const [consultantRows] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.office_id,
        o.name AS office_name
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      WHERE ru.role_id IN (3, 4, 6) AND u.id = ?
    `, [user_id]);

    if (consultantRows.length === 0) {
      return res.status(404).json({ error: "Consultant not found or not role_id = 3" });
    }

    const consultant = consultantRows[0];

    // 2. Get loans assigned to this consultant
  const [loans] = await pool.query(`
  SELECT 
    l.id AS loan_id,
    l.principal,
    l.first_repayment_date,
    c.first_name,
    c.last_name
  FROM loans l
  JOIN clients c ON c.id = l.client_id
  WHERE l.loan_officer_id = ?
    AND l.created_date < ?
`, [user_id, start_date]);



    if (loans.length === 0) {
      return res.json({
        user_id: consultant.id,
        name: `${consultant.first_name} ${consultant.last_name}`,
        office: consultant.office_name || "No office",
        loans_uncollected: []
      });
    }

    const loanIds = loans.map(l => l.loan_id);

    // 3. Get all transactions for these loans, excluding 'specified_due_date_fee'
   const [transactions] = await pool.query(`
  SELECT loan_id, debit, credit, transaction_type, date
  FROM loan_transactions
  WHERE loan_id IN (?)
    AND (
      (date < ? AND transaction_type != 'specified_due_date_fee')
      OR transaction_type = 'interest_waiver'
    )
`, [loanIds, start_date]);


    // 4. Build per-loan summary
    const loansUncollected = loans.map(loan => {
      const loanTx = transactions.filter(t => t.loan_id === loan.loan_id);

      // Balance = sum of debit - sum of credit
      const balance = loanTx.reduce((sum, t) => sum + (Number(t.debit) || 0) - (Number(t.credit) || 0), 0);


      const amount_due = (loan.principal + (loan.principal * 0.4));

      return {
        loan_id: loan.loan_id,
        client_name: `${loan.first_name} ${loan.last_name}`,
        amount_due: amount_due,
        balance: balance.toFixed(2),
        due_date: loan.first_repayment_date
      };
    });
loansUncollected.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

    // 5. Respond
    res.json({
      user_id: consultant.id,
      name: `${consultant.first_name} ${consultant.last_name}`,
      office: consultant.office_name || "No office",
      loans_uncollected: loansUncollected
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.get('/branch-cycle-opening-uncollected-table', async (req, res) => {
  try {
    const { office_id, start_date, end_date } = req.query;

    if (!office_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "office_id, start_date and end_date are required query params"
      });
    }

    // Get office information
    const [officeRows] = await pool.query(`
      SELECT id, name
      FROM offices
      WHERE id = ?
    `, [office_id]);

    if (officeRows.length === 0) {
      return res.status(404).json({
        error: "Office not found"
      });
    }

    const office = officeRows[0];

    // Get all loans for this office created before the cycle start
    const [loans] = await pool.query(`
      SELECT
        l.id AS loan_id,
        l.principal,
        l.first_repayment_date,
        c.first_name,
        c.last_name
      FROM loans l
      JOIN clients c ON c.id = l.client_id
      WHERE l.office_id = ?
        AND l.created_date < ?
    `, [office_id, start_date]);

    if (loans.length === 0) {
      return res.json({
        office_id: office.id,
        office: office.name,
        loans_uncollected: []
      });
    }

    const loanIds = loans.map(l => l.loan_id);

    // Get all transactions for these loans
    const [transactions] = await pool.query(`
      SELECT
        loan_id,
        debit,
        credit,
        transaction_type,
        date
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND (
          (date < ? AND transaction_type != 'specified_due_date_fee')
          OR transaction_type = 'interest_waiver'
        )
    `, [loanIds, start_date]);

    // Build loan summaries
    const loansUncollected = loans.map(loan => {
      const loanTx = transactions.filter(t => t.loan_id === loan.loan_id);

      const balance = loanTx.reduce(
        (sum, t) =>
          sum +
          (Number(t.debit) || 0) -
          (Number(t.credit) || 0),
        0
      );

      const amount_due = loan.principal + (loan.principal * 0.4);

      return {
        loan_id: loan.loan_id,
        client_name: `${loan.first_name} ${loan.last_name}`,
        amount_due,
        balance: balance.toFixed(2),
        due_date: loan.first_repayment_date
      };
    });

    loansUncollected.sort(
      (a, b) => new Date(b.due_date) - new Date(a.due_date)
    );

    res.json({
      office_id: office.id,
      office: office.name,
      loans_uncollected: loansUncollected
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong."
    });
  }
});


app.get('/total-collected-table', async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;

    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "user_id, start_date and end_date are required query params"
      });
    }

    /* ----------------------------------------------------
       1. Fetch consultant + office
    ---------------------------------------------------- */
    const [consultantRows] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id,
        o.name AS office_name
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      WHERE ru.role_id IN (3, 4, 6) AND u.id = ?
    `, [user_id]);

    if (consultantRows.length === 0) {
      return res.status(404).json({ error: "Consultant not found or not role_id = 3" });
    }

    const consultant = consultantRows[0];

    /* ----------------------------------------------------
       2. Get loans + client names
    ---------------------------------------------------- */
    const [loans] = await pool.query(`
      SELECT l.id AS loan_id, c.first_name, c.last_name
      FROM loans l
      JOIN clients c ON c.id = l.client_id
      WHERE l.loan_officer_id = ?
    `, [user_id]);

    if (loans.length === 0) {
      return res.json({
        user_id: consultant.id,
        name: `${consultant.first_name} ${consultant.last_name}`,
        office: consultant.office_name || "No office",
        collected_transactions: [],
        total_collected: "0.00"
      });
    }

    const loanIds = loans.map(l => l.loan_id);

    // Loan → client name map
    const loanClientMap = {};
    loans.forEach(l => {
      loanClientMap[l.loan_id] = `${l.first_name} ${l.last_name}`;
    });

    /* ----------------------------------------------------
       3. Get transactions in date range
    ---------------------------------------------------- */
    const [transactions] = await pool.query(`
      SELECT 
        loan_id,
        credit,
        transaction_type,
        payment_apply_to,
        balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND date >= ?
        AND date <= ?
    `, [loanIds, start_date, end_date]);

    /* ----------------------------------------------------
       4. Build collected breakdown (NO AGGREGATION)
    ---------------------------------------------------- */
    const collected_transactions = [];

    transactions.forEach(t => {
      let amount = 0;

      if (['repayment',].includes(t.transaction_type)) {

        if (t.payment_apply_to === 'reloan_payment') {
          amount = Number(t.balance_bf) || 0;
        }

        if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
          amount = Number(t.credit) || 0;
        }

        if (amount > 0) {
          collected_transactions.push({
            loan_id: t.loan_id,
            client_name: loanClientMap[t.loan_id] || 'Unknown Client',
            transaction_type: t.payment_apply_to,
            amount: amount.toFixed(2)
          });
        }
      }
    });

    /* ----------------------------------------------------
       5. Optional total (matches your old endpoint)
    ---------------------------------------------------- */
    const total_collected = collected_transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    /* ----------------------------------------------------
       6. Respond
    ---------------------------------------------------- */
    res.json({
      user_id: consultant.id,
      name: `${consultant.first_name} ${consultant.last_name}`,
      office: consultant.office_name || "No office",
      collected_transactions,
      total_collected: total_collected.toFixed(2)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.get('/branch-total-collected-table', async (req, res) => {
  try {
    const { office_id, start_date, end_date } = req.query;

    if (!office_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "office_id, start_date and end_date are required query params"
      });
    }

    /* ----------------------------------------------------
       1. Fetch office
    ---------------------------------------------------- */
    const [officeRows] = await pool.query(`
      SELECT id, name
      FROM offices
      WHERE id = ?
    `, [office_id]);

    if (officeRows.length === 0) {
      return res.status(404).json({
        error: "Office not found"
      });
    }

    const office = officeRows[0];

    /* ----------------------------------------------------
       2. Get loans + client names
    ---------------------------------------------------- */
    const [loans] = await pool.query(`
      SELECT
        l.id AS loan_id,
        c.first_name,
        c.last_name
      FROM loans l
      JOIN clients c ON c.id = l.client_id
      WHERE l.office_id = ?
    `, [office_id]);

    if (loans.length === 0) {
      return res.json({
        office_id: office.id,
        office: office.name,
        collected_transactions: [],
        total_collected: "0.00"
      });
    }

    const loanIds = loans.map(l => l.loan_id);

    // Loan → client name map
    const loanClientMap = {};
    loans.forEach(l => {
      loanClientMap[l.loan_id] = `${l.first_name} ${l.last_name}`;
    });

    /* ----------------------------------------------------
       3. Get transactions in date range
    ---------------------------------------------------- */
    const [transactions] = await pool.query(`
      SELECT
        loan_id,
        credit,
        transaction_type,
        payment_apply_to,
        balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND date >= ?
        AND date <= ?
    `, [loanIds, start_date, end_date]);

    /* ----------------------------------------------------
       4. Build collected breakdown (NO AGGREGATION)
    ---------------------------------------------------- */
    const collected_transactions = [];

    transactions.forEach(t => {
      let amount = 0;

      if (t.transaction_type === 'repayment') {

        if (t.payment_apply_to === 'reloan_payment') {
          amount = Number(t.balance_bf) || 0;
        }

        if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
          amount = Number(t.credit) || 0;
        }

        if (amount > 0) {
          collected_transactions.push({
            loan_id: t.loan_id,
            client_name: loanClientMap[t.loan_id] || 'Unknown Client',
            transaction_type: t.payment_apply_to,
            amount: amount.toFixed(2)
          });
        }
      }
    });

    /* ----------------------------------------------------
       5. Calculate total
    ---------------------------------------------------- */
    const total_collected = collected_transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    /* ----------------------------------------------------
       6. Respond
    ---------------------------------------------------- */
    res.json({
      office_id: office.id,
      office: office.name,
      collected_transactions,
      total_collected: total_collected.toFixed(2)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong."
    });
  }
});


app.get('/given-out-table', async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;

    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "user_id, start_date and end_date are required query params"
      });
    }

    // 1. Fetch consultant
    const [consultantRows] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id,
        o.name AS office_name
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      WHERE ru.role_id IN (3, 4, 6) AND u.id = ?
    `, [user_id]);

    if (consultantRows.length === 0) {
      return res.status(404).json({ error: "Consultant not found" });
    }

    const consultant = consultantRows[0];

    // 2. Loans under consultant
    const [loans] = await pool.query(`
      SELECT l.id, c.first_name, c.last_name
      FROM loans l
      JOIN clients c ON c.id = l.client_id
      WHERE l.loan_officer_id = ?
    `, [user_id]);

    const loanMap = {};
    loans.forEach(l => {
      loanMap[l.id] = `${l.first_name} ${l.last_name}`;
    });

    const loanIds = loans.map(l => l.id);

    let givenOutBreakdown = [];

    // 3. 🔥 Given-out carry over (add at top if exists)
    const [carryOverRows] = await pool.query(`
      SELECT amount
      FROM carry_overs
      WHERE user_id = ?
        AND cycle_date = ?
        AND status = 'active'
      LIMIT 1
    `, [user_id, start_date]);

    if (carryOverRows.length > 0) {
      const carryOverAmount = Number(carryOverRows[0].amount) || 0;
      if (carryOverAmount > 0) {
        givenOutBreakdown.push({
          loan_id: null,
          client_name: 'Carry Over',
          transaction_type: 'carry_over',
          amount: carryOverAmount
        });
      }
    }

    // 4. Transactions in cycle
    if (loanIds.length > 0) {
      const [transactions] = await pool.query(`
        SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?)
          AND date >= ? AND date <= ?
      `, [loanIds, start_date, end_date]);

      transactions.forEach(t => {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

        // NEW LOAN
        if (t.transaction_type === 'disbursement') {
          givenOutBreakdown.push({
            loan_id: t.loan_id,
            client_name: loanMap[t.loan_id],
            transaction_type: 'new_loan',
            amount: debit
          });
        }

        // RELOAN
        if (
          t.transaction_type === 'repayment' &&
          t.payment_apply_to === 'reloan_payment'
        ) {
          const reloanAmount = (Number(t.balance_bf) || 0) - credit;

          if (reloanAmount > 0) {
            givenOutBreakdown.push({
              loan_id: t.loan_id,
              client_name: loanMap[t.loan_id],
              transaction_type: 'reloan',
              amount: reloanAmount
            });
          }
        }
      });
    }

    // 5. Response
    res.json({
      user_id: consultant.id,
      name: `${consultant.first_name} ${consultant.last_name}`,
      office: consultant.office_name || 'No office',
      given_out_breakdown: givenOutBreakdown
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.get('/branch-given-out-table', async (req, res) => {
  try {
    const { office_id, start_date, end_date } = req.query;

    if (!office_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "office_id, start_date and end_date are required query params"
      });
    }

    // 1. Fetch office
    const [officeRows] = await pool.query(`
      SELECT 
        id,
        name
      FROM offices
      WHERE id = ?
    `, [office_id]);

    if (officeRows.length === 0) {
      return res.status(404).json({
        error: "Office not found"
      });
    }

    const office = officeRows[0];

    // 2. Loans under office
    const [loans] = await pool.query(`
      SELECT 
        l.id,
        c.first_name,
        c.last_name
      FROM loans l
      JOIN clients c ON c.id = l.client_id
      WHERE l.office_id = ?
    `, [office_id]);

    const loanMap = {};
    loans.forEach(l => {
      loanMap[l.id] = `${l.first_name} ${l.last_name}`;
    });

    const loanIds = loans.map(l => l.id);

    let givenOutBreakdown = [];

    // 3. Transactions in cycle
    if (loanIds.length > 0) {
      const [transactions] = await pool.query(`
        SELECT 
          loan_id,
          debit,
          credit,
          transaction_type,
          payment_apply_to,
          balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?)
          AND date >= ?
          AND date <= ?
      `, [loanIds, start_date, end_date]);

      transactions.forEach(t => {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

        // NEW LOAN
        if (t.transaction_type === 'disbursement') {
          givenOutBreakdown.push({
            loan_id: t.loan_id,
            client_name: loanMap[t.loan_id] || 'Unknown Client',
            transaction_type: 'new_loan',
            amount: debit
          });
        }

        // RELOAN
        if (
          t.transaction_type === 'repayment' &&
          t.payment_apply_to === 'reloan_payment'
        ) {
          const reloanAmount = (Number(t.balance_bf) || 0) - credit;

          if (reloanAmount > 0) {
            givenOutBreakdown.push({
              loan_id: t.loan_id,
              client_name: loanMap[t.loan_id] || 'Unknown Client',
              transaction_type: 'reloan',
              amount: reloanAmount
            });
          }
        }
      });
    }

    // 4. Response
    res.json({
      office_id: office.id,
      office: office.name,
      given_out_breakdown: givenOutBreakdown
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong."
    });
  }
});



app.get('/my-performance-new-yearly', async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;

    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "user_id, start_date and end_date are required query params"
      });
    }

    // Convert to Date objects
    let start = new Date(start_date);
    let end = new Date(end_date);

    // 1. Fetch consultant info
    const [consultantRows] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.office_id,
        o.name AS office_name
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      WHERE ru.role_id = 3 AND u.id = ?
    `, [user_id]);

    if (consultantRows.length === 0) {
      return res.status(404).json({ error: "Consultant not found or not role_id = 3" });
    }

    const consultant = consultantRows[0];

    // 2. Get all loans
    const [loans] = await pool.query(`
      SELECT id
      FROM loans
      WHERE loan_officer_id = ?
    `, [user_id]);

    const loanIds = loans.map(l => l.id);
    if (loanIds.length === 0) {
      return res.json({
        user_id: consultant.id,
        name: `${consultant.first_name} ${consultant.last_name}`,
        office: consultant.office_name || "No office",
        periods: []
      });
    }

    // Function that returns formatted YYYY-MM-DD
    const formatDate = (d) => d.toISOString().split("T")[0];

    // ⏳ Output array for 12 cycles
    const periods = [];

    // Loop 12 times (12 months)
    for (let i = 0; i < 12; i++) {

      const cycleStart = new Date(start);
      const cycleEnd = new Date(end);

      // ============================
      // GET TRANSACTIONS FOR CYCLE
      // ============================
      const [transactions] = await pool.query(`
        SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?) 
        AND date > ? AND date <= ?
      `, [loanIds, formatDate(cycleStart), formatDate(cycleEnd)]);

      const [transactions_two] = await pool.query(`
        SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?) 
        AND date < ?
      `, [loanIds, formatDate(cycleStart)]);

      // ============================
      // AGGREGATE FOR THIS CYCLE
      // ============================
      let total_uncollected = 0;
      let total_collected = 0;
      let given_out = 0;

      transactions.forEach(t => {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

        if (t.transaction_type === 'repayment') {
          if (t.payment_apply_to === 'reloan_payment') {
            total_collected += Number(t.balance_bf);
          } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
            total_collected += credit;
          }
        }

        if (t.transaction_type === 'disbursement') {
          given_out += debit;
        }

        if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
          const reloan_amount = (Number(t.balance_bf) || 0) - credit;
          given_out += reloan_amount;
        }
      });

      transactions_two.forEach(t => {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

        if (t.transaction_type !== 'specified_due_date_fee') {
          total_uncollected += debit - credit;
        }
      });

      const still_uncollected = total_uncollected - total_collected;

const carry_over =
  given_out > 40000 ? (given_out - 40000).toFixed(2) : "0.00";

periods.push({
  period_start: formatDate(cycleStart),
  period_end: formatDate(cycleEnd),
  total_uncollected: total_uncollected.toFixed(2),
  total_collected: total_collected.toFixed(2),
  still_uncollected: still_uncollected.toFixed(2),
  given_out: given_out.toFixed(2),
  carry_over
});


      // ============================
      // MOVE DATES BACKWARD ONE MONTH
      // ============================
      start.setMonth(start.getMonth() - 1);
      end.setMonth(end.getMonth() - 1);
    }

    // Return full historical report
    res.json({
      user_id: consultant.id,
      name: `${consultant.first_name} ${consultant.last_name}`,
      office: consultant.office_name || "No office",
      periods
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});








app.get('/recoveries_graph_data', async (req, res) => {

  try {
    const [loans] = await pool.query(
      'SELECT id, principal, client_id, loan_officer_id, office_id, tag, created_date, expected_amount FROM loans WHERE tag IS NOT NULL',);

    // Get today's date and 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // include current month too

    const balances = await Promise.all(
      loans.map(async (loan) => {
        // Fetch transactions within the last 6 months
        const [transactions] = await pool.query(
          `
          SELECT 
            DATE_FORMAT(date, '%Y-%m') as month,
            SUM(credit) as total_credit
          FROM loan_transactions 
          WHERE loan_id = ? 
            AND date >= ? 
            AND date <= ?
          GROUP BY DATE_FORMAT(date, '%Y-%m')
          ORDER BY month ASC
          `,
          [loan.id, sixMonthsAgo.toISOString().slice(0, 10), now.toISOString().slice(0, 10)]
        );

        // Make sure we return all 6 months, even if some have no transactions
        let monthlyCredits = [];
        for (let i = 0; i < 6; i++) {
          let d = new Date(sixMonthsAgo);
          d.setMonth(sixMonthsAgo.getMonth() + i);
          let monthKey = d.toISOString().slice(0, 7); // YYYY-MM
          let record = transactions.find(t => t.month === monthKey);
          monthlyCredits.push({
            month: monthKey,
            total_credit: record ? Number(record.total_credit) : 0
          });
        }

        return {
          loanId: loan.id,
          client: loan.client_id,
          loan_consultant: loan.loan_officer_id,
          branch: loan.office_id,
          status: loan.tag,
          principal: loan.principal,
          expected_amount: loan.expected_amount,
          monthly_credits: monthlyCredits,
          date: loan.created_date
        };
      })
    );

    res.json(balances);
  } catch (err) {
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/recoveries_balances',async(req,res)=>{

  try{
    const { start_date, end_date } = req.query;

    const [loans] = await pool.query(
      'SELECT id,principal,client_id,loan_officer_id,office_id,tag,created_date,expected_amount FROM loans WHERE tag IS NOT NULL'
    );    
    console.log(loans)

    const balances = await Promise.all(
      loans.map(async (loan) => {
        let query = 'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?';
        let params = [loan.id];

        // if start_date and end_date are provided, filter by transaction date
        if (start_date && end_date) {
          query += ' AND date BETWEEN ? AND ?';
          params.push(start_date, end_date);
        }

        const [transactions] = await pool.query(query, params);
  
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });
  
          return {
            loanId: loan.id,
            client: loan.client_id,
            loan_consultant:loan.loan_officer_id,
            branch:loan.office_id,
            status:loan.tag,
            principal: loan.principal,
            expected_amount: loan.expected_amount,
            balance: debit - credit,
            date: loan.created_date
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})


app.get('/recoveries_balances/:id',async(req,res)=>{
  const {id} = req.params;
  try{
    const [loans] = await pool.query(
      'SELECT id,principal,client_id,loan_officer_id,office_id,tag,created_date,expected_amount FROM loans WHERE tag IS NOT NULL AND office_id = ?',[id]
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );
  
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });
  
          return {
            loanId: loan.id,
            client: loan.client_id,
            loan_consultant:loan.loan_officer_id,
            branch:loan.office_id,
            status:loan.tag,
            principal: loan.principal,
            expected_amount: loan.expected_amount,
            balance: debit - credit,
            date: loan.created_date
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})


app.get('/runaway_clients/:id',async(req,res)=>{
  const {id} = req.params;
  try{
    const [loans] = await pool.query(
      'SELECT id,principal,expected_amount FROM loans WHERE tag = 1 AND office_id = ?',[id]
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );

          const [recovered_transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ? AND recoveries_tag = 1',
            [loan.id]
          );
  
          let credit_1 = 0;
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });

          
          recovered_transactions.forEach((t) => {
            credit_1 += Number(t.credit) || 0;
          });
  
  
          return {
            loanId: loan.id,
            principal: loan.principal,
            balance: debit - credit,
            expected_amount: loan.expected_amount,
            recovered_amount: credit_1
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})


app.get('/escalated_accounts/:id',async(req,res)=>{
  const {id} = req.params;
  try{
    const [loans] = await pool.query(
      'SELECT id,principal FROM loans WHERE tag = 2 AND office_id = ?',[id]
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );
  
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });
  
          return {
            loanId: loan.id,
            principal: loan.principal,
            balance: debit - credit,
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})


app.get('/dormant_account_revival/:id',async(req,res)=>{
  const {id} = req.params;
  try{
    const [loans] = await pool.query(
      'SELECT id,principal FROM loans WHERE tag = 3 AND office_id = ?',[id]
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );
  
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });
  
          return {
            loanId: loan.id,
            principal: loan.principal,
            balance: debit - credit,
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})

app.get('/legal_recovery/:id',async(req,res)=>{
  const {id} = req.params;
  try{
    const [loans] = await pool.query(
      'SELECT id,principal FROM loans WHERE tag = 4 AND office_id = ?',[id]
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );
  
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });
  
          return {
            loanId: loan.id,
            principal: loan.principal,
            balance: debit - credit,
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})


app.get('/skip_tracing/:id',async(req,res)=>{
  const {id} = req.params;
  try{
    const [loans] = await pool.query(
      'SELECT id,principal FROM loans WHERE tag = 5 AND office_id = ?',[id]
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );
  
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });
  
          return {
            loanId: loan.id,
            principal: loan.principal,
            balance: debit - credit,
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})



app.get('/runaway_clients',async(req,res)=>{
  try{
    const [loans] = await pool.query(
      'SELECT id,principal,expected_amount FROM loans WHERE tag = 1'
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );

          const [recovered_transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ? AND recoveries_tag = 1',
            [loan.id]
          );
  
          let credit_1 = 0;
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });

          
          recovered_transactions.forEach((t) => {
            credit_1 += Number(t.credit) || 0;
          });
  
  
          return {
            loanId: loan.id,
            principal: loan.principal,
            balance: debit - credit,
            expected_amount: loan.expected_amount,
            recovered_amount: credit_1
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})



app.get('/escalated_accounts',async(req,res)=>{
  try{
    const [loans] = await pool.query(
      'SELECT id,principal FROM loans WHERE tag = 2'
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );
  
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });
  
          return {
            loanId: loan.id,
            principal: loan.principal,
            balance: debit - credit,
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})


app.get('/dormant_account_revival',async(req,res)=>{
  try{
    const [loans] = await pool.query(
      'SELECT id,principal FROM loans WHERE tag = 3'
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );
  
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });
  
          return {
            loanId: loan.id,
            principal: loan.principal,
            balance: debit - credit,
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})


app.get('/legal_recovery',async(req,res)=>{
  try{
    const [loans] = await pool.query(
      'SELECT id,principal FROM loans WHERE tag = 4'
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );
  
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });
  
          return {
            loanId: loan.id,
            principal: loan.principal,
            balance: debit - credit,
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})


app.get('/skip_tracing',async(req,res)=>{
  try{
    const [loans] = await pool.query(
      'SELECT id,principal FROM loans WHERE tag = 5'
    );    
    console.log(loans)
    const balances = await Promise.all(
        loans.map(async (loan) => {
          const [transactions] = await pool.query(
            'SELECT debit, credit FROM loan_transactions WHERE loan_id = ?',
            [loan.id]
          );
  
          let debit = 0;
          let credit = 0;
  
          transactions.forEach((t) => {
            debit += Number(t.debit) || 0;
            credit += Number(t.credit) || 0;
          });
  
          return {
            loanId: loan.id,
            principal: loan.principal,
            balance: debit - credit,
          };
        })
      );
  console.log(balances)
      res.json(balances);
}catch(err){
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
}
})






app.get("/branch_clients/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const office =  await pool.query(`SELECT * FROM clients WHERE office_id = ? `,[id]);
        //res.json(cycle_date[0][0])
console.log(office[0])
    res.json(office[0])
    } catch(err){
        console.log(err)
    }
})


app.get("/pending_clients/:id",async(req,res)=>{

     const status = 'pending'
    try{
        const {id} = req.params;
        const office =  await pool.query(`SELECT * FROM clients WHERE office_id = ? AND status = ?`,[id,status]);
        //res.json(cycle_date[0][0])
console.log(office[0])
    res.json(office[0])
    } catch(err){
        console.log(err)
    }
})


app.get("/pending_clients",async(req,res)=>{
    const status = 'pending'
    try{
        const {id} = req.params;
        const office =  await pool.query(`SELECT * FROM clients WHERE status = ? `,[status]);
        //res.json(cycle_date[0][0])
console.log(office[0])
    res.json(office[0])
    } catch(err){
        console.log(err)
    }
})


app.get("/leaderboard_loans", async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ error: "ids query param is required" });
    }

    const idArray = ids.split(",").map((id) => Number(id));
    const [loans] = await pool.query(
      "SELECT * FROM loans WHERE id IN (?)",
      [idArray]
    );

    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get('/collections',async(req,res)=>{
    const status = 'disbursed';
    try{
        const {start_date,end_date,office} = req.query;
        const loans = await pool.query(` SELECT * FROM loans
      WHERE first_repayment_date BETWEEN ? AND ?
      AND office_id = ? AND status = ?`,   [start_date, end_date, office,status])
        res.json(loans)
    }catch(err){
        console.log(err)
    }
})


app.get('/leaderboard_transactions',async(req,res)=>{
    try{
        const {start_date,end_date} = req.query;
        const transactions = await pool.query(` SELECT * FROM loan_transactions
            WHERE date BETWEEN ? AND ?`,   [start_date, end_date])
              res.json(transactions)
    }catch(err){
        console.log(err)
    }
})




app.get("/users",async(req,res)=>{
    try{
        const users =  await pool.query(`SELECT * FROM users`);
        res.json(users[0])
    } catch(err){
        console.log(err)
    }
})

app.get("/office_loan_consultants/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const users =  await pool.query(`SELECT * FROM users where office_id = ?`,[id]);
        res.json(users[0])
    } catch(err){
        console.log(err)
    }
})


app.get("/tags",async(req,res)=>{
  try{
      const tags =  await pool.query(`SELECT * FROM recoveries_tags`);
      res.json(tags[0])
  } catch(err){
      console.log(err)
  }
})


app.get("/clients",async(req,res)=>{
    try{
        const clients =  await pool.query(`SELECT * FROM clients`);
        res.json(clients[0])
    } catch(err){
        console.log(err)
    }
})


app.get("/loan_products",async(req,res)=>{
    try{
        const loan_products = await pool.query(`SELECT * FROM loan_products`);
        res.json(loan_products[0])
    }catch(err){
        console.log(err)
    }
})

app.get("/loan_purpose",async(req,res)=>{
    try{
        const loan_purpose = await pool.query(`SELECT * FROM loan_purposes`);
        res.json(loan_purpose[0])
    }catch(err){
        console.log(err)
    }
})

app.get("/client/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const client =  await pool.query(`SELECT * FROM clients WHERE id = ? `,[id]);
        console.log(client)

        res.json(client)
    } catch(err){
        console.log(err)
    }
})


app.get("/user/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const user =  await pool.query(`SELECT * FROM users WHERE id = ? `,[id]);
        res.json(user)
    } catch(err){
        console.log(err)
    }
})



app.get("/loan/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        console.log(id)
        const loan =  await pool.query(`SELECT * FROM loans WHERE id = ? `,[id]);
        console.log(loan)

        res.json(loan)
    } catch(err){
        console.log(err)
    }
})



app.get("/loan_transactions/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const loan_transactions =  await pool.query(`SELECT * FROM loan_transactions WHERE loan_id = ? `,[id]);
        res.json(loan_transactions[0])
    } catch(err){
        console.log(err)
    }
})


app.get("/clients_search", async (req, res) => {
    try {
      const search = req.query.search;
  
      if (search) {
        const clients = await pool.query(
          `SELECT * FROM clients 
           WHERE LOWER(first_name) LIKE LOWER(?) 
              OR LOWER(last_name) LIKE LOWER(?) 
              OR LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER(?)`,
          [`%${search}%`, `%${search}%`, `%${search}%`]
        );
        return res.json(clients[0]);
      }
  
      // If no search term, return empty list or optionally all (not recommended)
      return res.json([]);
    } catch (err) {
      console.error("Error fetching clients:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  app.get("/waiver_loans", async (req, res) => {
    try {
      const { ids } = req.query;
      console.log(ids + 'HELLLLOODNFIRFNRIN')
  
      if (ids) {
        // convert "1,2,3" into [1,2,3]
        const idArray = ids.split(",").map(id => parseInt(id, 10)).filter(Boolean);
  
        if (idArray.length > 0) {
          const [loans] = await pool.query(
            `SELECT * FROM loans WHERE id IN (?)`,
            [idArray]
          );
          return res.json(loans);
        }
      }
  
      // if no ids provided, return empty list
      res.json([]);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

  app.get("/charge_loans", async (req, res) => {
    try {
      const { ids } = req.query;
  
      if (ids) {
        // convert "1,2,3" into [1,2,3]
        const idArray = ids.split(",").map(id => parseInt(id, 10)).filter(Boolean);
  
        if (idArray.length > 0) {
          const [loans] = await pool.query(
            `SELECT * FROM loans WHERE id IN (?)`,
            [idArray]
          );
          return res.json(loans);
        }
      }
  
      // if no ids provided, return empty list
      res.json([]);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  


app.get("/loans/",async(req,res)=>{
    try{
        const loans = await pool.query(`SELECT * FROM loans`);
        res.json(loans[0])
    }catch(err){
        console.log(err)
    }
})


app.get("/transaction_approvals",async(req,res)=>{
    try{
        const transactions = await pool.query(`SELECT * FROM loan_transactions_pp_fp WHERE payment_apply_to IN ('part_payment', 'full_payment')`)
        console.log(transactions[0] + 'HELLO')
        res.json(transactions[0])
    } catch(err){
        console.log(err)
    }
}) 





app.get("/reloan_approvals",async(req,res)=>{
    try{
        const transactions = await pool.query(`SELECT * FROM loan_transactions_requests WHERE payment_apply_to = ? `,['reloan_payment']);
        console.log(transactions[0])
        res.json(transactions[0])
    } catch(err){
        console.log(err)
    }
   
})


app.get("/interest_waivers/:id",async(req,res)=>{
  try{
    const {id} = req.params;
    const status = 'pending'
    const transactions = await pool.query(`SELECT * FROM waiver_transactions_unapproved WHERE office_id = ? AND status = ?`,[id,status])
    res.json(transactions[0])
  }catch(err){
    console.log(err)
  }
})

app.get("/charges_list/:id",async(req,res)=>{
  try{
    const {id} = req.params;
    const status = 'pending'
    const transactions = await pool.query(`SELECT * FROM charge_transactions_unapproved WHERE office_id = ? AND status = ?`,[id,status])
    res.json(transactions[0])
  }catch(err){
    console.log(err)
  }
})

app.get("/charges/:id",async(req,res)=>{
  try{
    const {id} = req.params;
       const status = 'pending'
    const transactions = await pool.query(`SELECT * FROM charge_transactions_unapproved WHERE office_id = ? AND status = ?`[id,status])
    console.log(transactions)
    res.json(transactions[0])
  }catch(err){
    console.log(err)
  }
})



app.get("/cycle-date/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const cycle_date =  await pool.query(`SELECT * FROM cycle_dates WHERE loan_officer_id = ? `,[id]);
        console.log(cycle_date)
        //res.json(cycle_date[0][0])

            res.json(cycle_date)
      
        
    } catch(err){
        console.log(err)
    }
})

app.post("/create-cycle",async(req,res)=>{
    try{
        const {loan_officer_id,cycleEndDate} = req.body;
        console.log(loan_officer_id)
        console.log(cycleEndDate)
        const cycle = await pool.query(`INSERT INTO cycle_dates (loan_officer_id,cycle_end_date) VALUES (?,?)`,[loan_officer_id,cycleEndDate])
        res.json(cycle)
    }catch(err){
        console.log(err)
    }
})

app.post('/create_transaction',async(req,res)=>{
    try{
      const status = 'closed'
         const {created_by_id,office_id,loan_id,payment_apply_to,payment_detail_id,
             transaction_type,date,credit,notes,temp_id} = req.body;
             const transaction = await pool.query(`INSERT INTO loan_transactions (created_by_id,office_id,loan_id,payment_apply_to,payment_detail_id,
             transaction_type,date,credit,notes,temp_id) VALUES (?,?,?,?,?,?,?,?,?,?)`,[created_by_id,office_id,loan_id,payment_apply_to,payment_detail_id,
                 transaction_type,date,credit,notes,temp_id])
                 if(payment_apply_to == 'full_payment'){
                  const loan = await pool.query(`UPDATE loans SET status = ? WHERE id = ?`,[status,loan_id])
                 }
              //  console.log(created_by_id)
                res.json(transaction)
    }catch(err){
        console.log(err)
    }
})

app.put('/tag_account',async(req,res)=>{
  try{
    const {loan_id,tag} = req.body;
    const loan = await pool.query(`UPDATE loans SET tag = ? WHERE id = ?`,[tag,loan_id])
    res.json(loan)
  }catch(err){
    console.log(err)
  }
})

app.put('/add_expected_amount',async(req,res)=>{
  try{
    const {loan_id,amount} = req.body;
    const loan = await pool.query(`UPDATE loans SET expected_amount = ? WHERE id = ?`,[amount,loan_id])
    res.json(loan)
  }catch(err){
    console.log(err)
  }
})


app.post('/create_temp_charge',async(req,res)=>{
  try{
    const {created_by_id, office_id, loan_id, transaction_type,date,charge} = req.body;
    const transactions = await pool.query(`INSERT INTO charge_transactions_unapproved (created_by_id,office_id,loan_id,transaction_type,date,debit) VALUES 
      (?,?,?,?,?,?)`,[created_by_id, office_id, loan_id, transaction_type,date,charge])
      res.json(transactions)
  }catch(err){
    console.log(err)
  }
})

app.post('/create_temp_waiver',async(req,res)=>{
  try{
    const {created_by_id, office_id, loan_id, transaction_type,date,amount} = req.body;
    const transactions = await pool.query(`INSERT INTO waiver_transactions_unapproved (created_by_id,office_id,loan_id,transaction_type,date,credit) VALUES 
      (?,?,?,?,?,?)`,[created_by_id, office_id, loan_id, transaction_type,date,amount])
      res.json(transactions)
  }catch(err){
    console.log(err)
  }
})

app.post('/create_charge',async(req,res)=>{
  try{
    const {created_by_id, office_id, loan_id, transaction_type,date,amount} = req.body;
    const transactions = await pool.query(`INSERT INTO loan_transactions (created_by_id,office_id,loan_id,transaction_type,date,debit) VALUES 
      (?,?,?,?,?,?)`,[created_by_id, office_id, loan_id, transaction_type,date,amount])
      console.log(transactions)
      res.json(transactions)
  }catch(err){
    console.log(err)
  }
})

app.post('/create_waiver',async(req,res)=>{
  try{
    const {created_by_id, office_id, loan_id, transaction_type,date,amount} = req.body;
    const transactions = await pool.query(`INSERT INTO loan_transactions (created_by_id,office_id,loan_id,transaction_type,date,credit) VALUES 
      (?,?,?,?,?,?)`,[created_by_id, office_id, loan_id, transaction_type,date,amount])
      res.json(transactions)
      console.log(transactions)
  }catch(err){
    console.log(err)
  }
})

app.put('/decline_charge',async(req,res)=>{
  const status = 'declined';
  try{
    const {id} = req.body;
    const transaction = await pool.query(`UPDATE charge_transactions_unapproved SET status = ? WHERE id = ?`,[status,id])
    res.json(transaction)
  }catch(err){
    console.log(err)
  }
})

//const cycle = await pool.query(`UPDATE cycle_dates SET cycle_end_date = ? WHERE loan_officer_id = ?`,[cycleEndDate,loan_officer_id]);
app.put('/decline_waiver',async(req,res)=>{
  const status = 'declined';
  try{
    const {id} = req.body;
    const transaction = await pool.query(`UPDATE waiver_transactions_unapproved SET status = ? WHERE id = ?`,[status,id])
    res.json(transaction)
  }catch(err){
    console.log(err)
  }
})

//await pool.query(`UPDATE loans SET reloaned = ?, status = ? WHERE id = ?`, [true, 'closed', parent_id]) 

app.post('/add_top_up',async(req,res)=>{
  try{
    const {  loan_id,amount,new_interest } = req.body;
    const loan = await pool.query(`UPDATE loans SET principal = ? WHERE id = ?`,[amount,loan_id])
    const transaction_1 = await pool.query(`UPDATE loan_transactions SET debit = ? WHERE loan_id = ? AND transaction_type = ?`,[amount,loan_id,'disbursement'])
    const transaction_2 = await pool.query(`UPDATE loan_transactions SET debit = ? WHERE loan_id = ? AND transaction_type = ?`,[new_interest,loan_id,'initial_interest'])
    res.json('top up added')
}catch(err){
  console.log(err)
}
})


app.post('/create_loan_product', async (req, res) => {
  try {
    const {
      name,
      shortName,
      description,
      fund,
      currency,
      decimals,
      principalDefault,
      principalMin,
      principalMax,
      loanTermDefault,
      loanTermMin,
      loanTermMax,
      repaymentFrequency,
      interestRateDefault,
      interestRateMin,
      interestRateMax,
      days,
      interestRatePeriod,
      gracePrincipalPayments,
      graceInterestPayment,
      graceInterestCharged,
      interestMethod,
      amortizationMethod,
      daysInYear,
      daysInMonth,
      repaymentStrategy,
      lockGuaranteeFunds,
      allowAdditionalCharges,
      arrearsGraceDays
    } = req.body;

    // Insert into loan_products table
    const [result] = await pool.query(
      `INSERT INTO loan_products 
        (name, short_name, description, fund_id, currency_id, decimals, 
         default_principal, minimum_principal, maximum_principal,
         default_loan_term, minimum_loan_term, maximum_loan_term, repayment_frequency_type,
         interest_rate_type, minimum_interest_rate, maximum_interest_rate, interest_calculation_period_type,
         grace_on_principal, grace_on_interest_payment, grace_on_interest_charged,
         interest_method, armotization_method, year_days, month_days,
         	loan_transaction_strategy, lock_guarantee, allow_additional_charges, arrears_grace_days,repayment_frequency)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        shortName,
        description,
        fund,
        currency,
        decimals,
        principalDefault,
        principalMin,
        principalMax,
        loanTermDefault,
        loanTermMin,
        loanTermMax,
        repaymentFrequency,
        interestRateDefault,
        interestRateMin,
        interestRateMax,
        interestRatePeriod,
        gracePrincipalPayments,
        graceInterestPayment,
        graceInterestCharged,
        interestMethod,
        amortizationMethod,
        daysInYear,
        daysInMonth,
        repaymentStrategy,
        lockGuaranteeFunds,
        allowAdditionalCharges,
        arrearsGraceDays,days
      ]
    );

    res.json({
      message: "Loan product created successfully",
      loan_product_id: result.insertId
    });
  } catch (err) {
    console.error("Error creating loan product:", err);
    res.status(500).json({ error: "Failed to create loan product" });
  }
});

app.put('/update_loan_product/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      shortName,
      description,
      fund,
      currency,
      decimals,
      principalDefault,
      principalMin,
      principalMax,
      loanTermDefault,
      loanTermMin,
      loanTermMax,
      repaymentFrequency,
      interestRateDefault,
      interestRateMin,
      interestRateMax,
      days,
      interestRatePeriod,
      gracePrincipalPayments,
      graceInterestPayment,
      graceInterestCharged,
      interestMethod,
      amortizationMethod,
      daysInYear,
      daysInMonth,
      repaymentStrategy,
      lockGuaranteeFunds,
      allowAdditionalCharges,
      arrearsGraceDays
    } = req.body;

    // Update loan_products table
    const [result] = await pool.query(
      `UPDATE loan_products SET
        name = ?, 
        short_name = ?, 
        description = ?, 
        fund_id = ?, 
        currency_id = ?, 
        decimals = ?, 
        default_principal = ?, 
        minimum_principal = ?, 
        maximum_principal = ?, 
        default_loan_term = ?, 
        minimum_loan_term = ?, 
        maximum_loan_term = ?, 
        repayment_frequency_type = ?, 
        interest_rate_type = ?, 
        minimum_interest_rate = ?, 
        maximum_interest_rate = ?, 
        interest_calculation_period_type = ?, 
        grace_on_principal = ?, 
        grace_on_interest_payment = ?, 
        grace_on_interest_charged = ?, 
        interest_method = ?, 
        armotization_method = ?, 
        year_days = ?, 
        month_days = ?, 
        loan_transaction_strategy = ?, 
        lock_guarantee = ?, 
        allow_additional_charges = ?, 
        arrears_grace_days = ?, 
        repayment_frequency = ?
      WHERE id = ?`,
      [
        name,
        shortName,
        description,
        fund,
        currency,
        decimals,
        principalDefault,
        principalMin,
        principalMax,
        loanTermDefault,
        loanTermMin,
        loanTermMax,
        repaymentFrequency,
        interestRateDefault,
        interestRateMin,
        interestRateMax,
        interestRatePeriod,
        gracePrincipalPayments,
        graceInterestPayment,
        graceInterestCharged,
        interestMethod,
        amortizationMethod,
        daysInYear,
        daysInMonth,
        repaymentStrategy,
        lockGuaranteeFunds,
        allowAdditionalCharges,
        arrearsGraceDays,
        days,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Loan product not found" });
    }

    res.json({
      message: "Loan product updated successfully",
      loan_product_id: id
    });
  } catch (err) {
    console.error("Error updating loan product:", err);
    res.status(500).json({ error: "Failed to update loan product" });
  }
});


app.post('/create_temp_transaction',async(req,res)=>{
    console.log('working')
    try{
        const {created_by_id,client_id,office_id,loan_id,payment_apply_to,transaction_type,date,credit,loan_consultant,client} = req.body;
        const transaction = await pool.query(`INSERT INTO loan_transactions_pp_fp (created_by_id,client_id,office_id,loan_id,payment_apply_to,transaction_type,date,credit)
VALUES (?,?,?,?,?,?,?,?)`,[created_by_id,client_id,office_id,loan_id,payment_apply_to,transaction_type,date,credit])
io.to("managers").emit("approval_due", { 
  transaction_type: payment_apply_to,
  loan_consultant: loan_consultant ,
  client: client ,
  amount: credit,
  office: office_id,
})
console.log(transaction + 'HELLO')
res.json(transaction + 'HELLO')
    }catch(err){
        console.log(err)
    }
})


app.post('/create_temp_reloan_transaction',async(req,res)=>{
    try{
        const {created_by_id,client_id,office_id,loan_id,balance_bf,payment_apply_to,transaction_type,date,credit,interest,loan_consultant,client} = req.body;
        const transaction = await pool.query(`INSERT INTO loan_transactions_requests (created_by_id,client_id,office_id,loan_id,balance_bf,payment_apply_to,transaction_type,date,credit,interest)
            VALUES (?,?,?,?,?,?,?,?,?,?)`,[created_by_id,client_id,office_id,loan_id,balance_bf,payment_apply_to,transaction_type,date,credit,interest])
            io.to("managers").emit("approval_due", { 
              transaction_type: payment_apply_to,
              loan_consultant: loan_consultant ,
              client: client ,
              amount: credit,
              office: office_id,
            })
            res.json()
    }catch(err){
        console.log(err)
    }
})


app.post('/disburse_loan',async(req,res)=>{
    try{
        const status = 'disbursed';
        const {created_by_id,office_id,loan_id,transaction_type_1,transaction_type_2,date,debit_1,debit_2,first_repayment_date} = req.body;
        const disbursement = await pool.query(`INSERT INTO loan_transactions (created_by_id,office_id,loan_id,transaction_type,date,debit) VALUES 
            (?,?,?,?,?,?)`,[created_by_id,office_id,loan_id,transaction_type_1,date,debit_1])
        const interest = await pool.query(`INSERT INTO loan_transactions (created_by_id,office_id,loan_id,transaction_type,date,debit) VALUES 
                (?,?,?,?,?,?)`,[created_by_id,office_id,loan_id,transaction_type_2,date,debit_2])  
        const loan_status = await pool.query(
                    `UPDATE loans SET status = ?, disbursement_date = ?, first_repayment_date = ? WHERE id = ?`,
                    [status,date,first_repayment_date, loan_id]
                  );                  
        res.json('disbursed')
    }catch(err){
        console.log(err)
    }
  })

  app.delete('/delete_new_loan',async(req,res)=>{
    try{
        const {id} = req.body;
        const delete_loan = await pool.query(`DELETE FROM loans WHERE id = ?`,[id])
        res.json('deleted')
    }catch(err){
        console.log(err)
    }
})



app.post('/create_reloan_transaction',async(req,res)=>{
    try{
        const {  created_by_id,
            office_id,
            loan_id,
            payment_apply_to,
            payment_detail_id,
            transaction_type,
            date,
            credit,
            notes,
            temp_id,
            balance_bf} = req.body;

    const reloan_transaction = await pool.query(`INSERT INTO loan_transactions ( created_by_id,
            office_id,
            loan_id,
            payment_apply_to,
            payment_detail_id,
            transaction_type,
            date,
            credit,
            notes,
            temp_id,
            balance_bf) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,[created_by_id,
                office_id,
                loan_id,
                payment_apply_to,
                payment_detail_id,
                transaction_type,
                date,
                credit,
                notes,
                temp_id,
                balance_bf])
     res.json('created')
    }catch(err){
        console.log(err)
    }
})
  
app.post('/add_loan', async (req, res) => {
    try {
      const {
        client_type,
        loan_product_id,
        client_id,
        office_id,
        loan_purpose_id,
        loan_officer_id,
        principal,
        interest_rate,
        first_repayment_date,
        status,
        created_by_id,
        created_date,
        vetted_by,
        verified_by,
        cycle_date
      } = req.body;
  
      const [result] = await pool.query(
        `INSERT INTO loans (
          client_type,
          loan_product_id,
          client_id,
          office_id,
          loan_purpose_id,
          loan_officer_id,
          principal,
          interest_rate,
          first_repayment_date,
          status,
          created_by_id,
          created_date,
          vetted_by,
          verified_by,
          cycle_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          client_type,
          loan_product_id,
          client_id,
          office_id,
          loan_purpose_id,
          loan_officer_id,
          principal,
          interest_rate,
          first_repayment_date,
          status,
          created_by_id,
          created_date,
          vetted_by,
          verified_by,
          cycle_date
        ]
      );
  
      const insertedLoanId = result.insertId;
  
      res.status(200).json({ message: "Loan added successfully", loan_id: insertedLoanId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error adding loan" });
    }
  });
  
  app.post('/add_reloan', async (req, res) => {
    try {
      const {
        client_type,
        loan_product_id,
        client_id,
        office_id,
        loan_purpose_id,
        loan_officer_id,
        principal,
        interest_rate,
        first_repayment_date,
        status,
        created_by_id,
        created_date,
        vetted_by,
        verified_by,
        cycle_date,
        parent_id,
        reloan_id
      } = req.body;
  
    const [insertResult] = await pool.query(
        `INSERT INTO loans (
          client_type,
          loan_product_id,
          client_id,
          office_id,
          loan_purpose_id,
          loan_officer_id,
          principal,
          interest_rate,
          first_repayment_date,
          status,
          created_by_id,
          created_date,
          vetted_by,
          verified_by,
          cycle_date,
          parent_id,
          reloan_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          client_type,
          loan_product_id,
          client_id,
          office_id,
          loan_purpose_id,
          loan_officer_id,
          principal,
          interest_rate,
          first_repayment_date,
          status,
          created_by_id,
          created_date,
          vetted_by,
          verified_by,
          cycle_date,
          parent_id,
          reloan_id
        ]
      );

      const insertedId = insertResult.insertId
      const [rows] = await pool.query('SELECT * FROM loans WHERE id = ?',[insertedId])

      const close_parent_loan = await pool.query(`UPDATE loans SET reloaned = ?, status = ? WHERE id = ?`,
        [true, 'closed', parent_id]) 
  
      res.status(201).json({ message: "Loan added successfully", loan: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error adding loan" });
    }
  });




app.post('/create_reloan_initial_transactions',async(req,res)=>{

    try{
        const {created_by_id,office_id,loan_id,transaction_type_1,transaction_type_2,date,debit_1,debit_2} = req.body;
        const disbursement = await pool.query(`INSERT INTO loan_transactions (created_by_id,office_id,loan_id,transaction_type,date,debit) VALUES 
            (?,?,?,?,?,?)`,[created_by_id,office_id,loan_id,transaction_type_1,date,debit_1])
        const interest = await pool.query(`INSERT INTO loan_transactions (created_by_id,office_id,loan_id,transaction_type,date,debit) VALUES 
                (?,?,?,?,?,?)`,[created_by_id,office_id,loan_id,transaction_type_2,date,debit_2])  
    }catch(err){
        console.log(err)
    }

})

app.delete('/decline_transaction',async(req,res)=>{
    try{
        const {id} = req.body;
        console.log(id)
         const delete_transaction = await pool.query(`DELETE FROM loan_transactions_pp_fp WHERE id = ?`,[id]);
        // console.log(delete_transaction)
        console.log(delete_transaction)
         res.json('deleted')
    }catch(err){
       console.log(err)
    }
})


app.delete('/decline_pending_reloan',async(req,res)=>{
    try{
        const {id} = req.body;
         const delete_transaction = await pool.query(`DELETE FROM loan_transactions_requests WHERE id = ?`,[id]);
         res.json('deleted')
    }catch(err){
       console.log(err)
    }
})

app.delete('/delete_branch',async(req,res)=>{
    try{
        const {id} = req.body;
        const delete_branch = await pool.query(`DELETE FROM offices WHERE id = ?`,[id])
        res.json('deleted')
    }catch(err){
        console.log(err)
    }
})

app.put("/update-cycle",async(req,res)=>{
    try{
        const {loan_officer_id,cycleEndDate} = req.body;
        console.log(loan_officer_id)
        console.log(cycleEndDate)
        const cycle = await pool.query(`UPDATE cycle_dates SET cycle_end_date = ? WHERE loan_officer_id = ?`,[cycleEndDate,loan_officer_id]);
        res.json(cycle)
        console.log(cycle)
    }catch(err){
        console.log(err)
    }
})




app.put("/update_branch",async(req,res)=>{
    try{
        const {id,name,external_id,opening_date,parent_branch} = req.body;
        const branch = await pool.query(
            `UPDATE offices 
             SET name = ?, external_id = ?, opening_date = ?, parent_id = ? 
             WHERE id = ?`,
            [name, external_id, opening_date, parent_branch, id]
          );
        res.json(branch)
    }catch(err){
        console.log(err)
    }
})


app.put("/approve_client/:id",async(req,res)=>{
    const {id} = req.params;
    const status = 'active'
    try{
        const client = await pool.query(
            `UPDATE clients
            SET status = ? WHERE id = ?`,
            [status,id]
        );
        res.json(client) 
    }catch(err){
        console.log(err)
    }
})







app.post("/sign-in",async(req,res)=>{
    try{
        // const email = 'mupeta.andyson@gmail.com'
        // const userPassword = 'whence@10'
        const {email,password} = req.body;
        const user = await pool.query(`SELECT * FROM users WHERE email = ? `,[email])
        const userPassword =  user[0][0].password
        console.log(userPassword)
        const finalPassword = userPassword.replace("$2y$", "$2b$")
        console.log(finalPassword)
       // console.log(finalPassword)
        const isPasswordMatching = bcrypt.compareSync(password,finalPassword)
        console.log(isPasswordMatching)
        res.json(user[0][0])
    }catch(err){
        console.log(err)
    }
})


app.post("/add_branch", async (req, res) => {
    try {
      const { name, external_id, opening_date, parent_branch } = req.body;
      await pool.query(
        "INSERT INTO offices (name, external_id, opening_date, parent_id) VALUES (?, ?, ?, ?)",
        [name, external_id, opening_date, parent_branch || null]
      );
      res.status(200).json({ message: "Branch created" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error creating branch" });
    }
  });

  app.post("/create_client",async(req,res)=>{
    try{
        const {account_no,created_by_id,staff_id,office_id,mobile,phone,email,client_type,
            first_name,middle_name,last_name,gender,marital_status,dob,working_place,
            working_position,salary,nrc_number,notes,street, address,joined_date
        } = req.body;
        await pool.query(
            `INSERT INTO clients (
              account_no, user_id, created_by_id, staff_id, office_id,
              mobile, phone, email, client_type,
              first_name, middle_name, last_name,
              gender, marital_status, dob,
              working_place, working_position, salary,
              nrc_number, notes, street, address, joined_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              account_no,
              created_by_id, // user_id
              created_by_id,
              staff_id,
              office_id,
              mobile,
              phone,
              email,
              client_type,
              first_name,
              middle_name,
              last_name,
              gender,
              marital_status,
              dob,
              working_place,
              working_position,
              salary,
              nrc_number,
              notes,
              street,
              address,
              joined_date
            ]
          );
          
    res.status(200).json({ message: "Branch created" });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Error creating branch" });
    }
  })

  app.put("/transfer_client",async(req,res)=>{
    try{
        const { client_id, new_branch_id, new_staff_id } = req.body;
        await pool.query(  "UPDATE clients SET office_id = ?, staff_id = ? WHERE id = ?",[new_branch_id, new_staff_id, client_id])
        res.json({ message: "Client transferred successfully." });
    }catch(error){
        console.error("Transfer error:", error);
    }
  })


  app.put("/change_loan_loan_officer",async(req,res)=>{
    try{
      const {loan_id,new_officer_id} = req.body;
     const loan = await pool.query("UPDATE loans SET loan_officer_id = ? WHERE id = ?",[new_officer_id,loan_id])
      res.json('changed successfully')
    }catch(error){
      console.log(error)
    }
  })


  app.put("/change_loan_branch",async(req,res)=>{
    try{
      const {loan_id,new_branch_id} = req.body;
      await pool.query("UPDATE loans SET office_id = ? WHERE id = ?",[new_branch_id,loan_id])
      res.json('changed successfully')
    }catch(error){
      console.log(error)
    }
  })

  app.put("/update_client", async (req, res) => {
    try {
      const {
        id, // client ID to update
        account_no,
        created_by_id,
        staff_id,
        office_id,
        mobile,
        phone,
        email,
        client_type,
        first_name,
        middle_name,
        last_name,
        gender,
        marital_status,
        dob,
        working_place,
        working_position,
        salary,
        nrc_number,
        notes,
        street,
        address,
        joined_date
      } = req.body;
  
      await pool.query(
        `UPDATE clients SET
          account_no = ?,
          user_id = ?, 
          created_by_id = ?,
          staff_id = ?,
          office_id = ?,
          mobile = ?,
          phone = ?,
          email = ?,
          client_type = ?,
          first_name = ?,
          middle_name = ?,
          last_name = ?,
          gender = ?,
          marital_status = ?,
          dob = ?,
          working_place = ?,
          working_position = ?,
          salary = ?,
          nrc_number = ?,
          notes = ?,
          street = ?,
          address = ?,
          joined_date = ?
        WHERE id = ?`,
        [
          account_no,
          created_by_id, // user_id
          created_by_id,
          staff_id,
          office_id,
          mobile,
          phone,
          email,
          client_type,
          first_name,
          middle_name,
          last_name,
          gender,
          marital_status,
          dob,
          working_place,
          working_position,
          salary,
          nrc_number,
          notes,
          street,
          address,
          joined_date,
          id // WHERE clause
        ]
      );
  
      res.status(200).json({ message: "Client updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating client" });
    }
  });
  
  

  app.get("/get-user/:email", async (req, res) => {
    try {
      const { email } = req.params;
  
      // Get the user by email
      const userResult = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
      const user = userResult[0][0];
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Get the role for this user
      const roleResult = await pool.query(`SELECT * FROM role_users WHERE user_id = ?`, [user.id]);
      const role = roleResult[0][0];
  
      const cycle_date =  await pool.query(`SELECT * FROM cycle_dates WHERE loan_officer_id = ? `,[user.id]);

      const office = await pool.query(`SELECT * FROM offices WHERE id = ? `,[user.office_id])
      const provinceResult = await pool.query(`SELECT * FROM province WHERE id = ? `,[office[0][0].province_id])
      const province = provinceResult[0][0]
      console.log(province.id + 'PROVINCE')

      // Combine user info with role_id
      const userWithRole = {
        ...user,
        role_id: role ? role.role_id : null,
        cycle_date: cycle_date ? cycle_date.cycle_end_date : null, // handle case if no role is assigned
        province: province ? province.id:null
      };
  
      res.json(userWithRole);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Server error" });
    }
  });
  

app.post("/get-client",async(req,res)=>{
    try{
      const {nrc_number} = req.body
      console.log(nrc_number)
      const user = await pool.query(`SELECT * FROM clients WHERE nrc_number = ? `,[nrc_number])
      console.log(user)
      if(user[0][0]){
        res.json('exists')
      }else{
        res.json('empty')
      }
    }catch(err){
      console.log(err)
    }
  })


  app.post("/get-loan",async(req,res)=>{
    try{
        const {client_id,status} = req.body;
        const loans = await pool.query(`SELECT * FROM loans WHERE client_id = ? AND status != ?`,[client_id, status])
        console.log(JSON.stringify(loans[0][0]))
        if(loans[0][0]){
          res.json('exists')
        }else{
          res.json('empty')
        }
    }
    catch(err){
        console.log(err)
      }
  })

//  let data = '$2y$10$BGbenvQ0HjIraLF1FwWFdOsgPHz5ji5eQkcY3e51sIY42z0ha26IW';
//  const finalPassword = data.replace("$2y$", "$2b$")
//  console.log(finalPassword)
//  let password = 'miti26miti@gmail.com'
//  const isPasswordMatching = bcrypt.compareSync(password,finalPassword)
//  console.log(isPasswordMatching)
// let buff = new Buffer.from(data, 'base64');
// let text = buff.toString();
//console.log(isPasswordMatching) 

//DEBBIE'S ENDPOINTS
//DEBZ API'S
// POST endpoint for advance applications
app.post("/advance-application", async (req, res) => {
    try {
        const {
            userId,
            fullName,
            amount,
            date,
            office,
            installments,
            monthlyInstallment,
            purpose = "", 
            paymentMode = ""  
        } = req.body;

        // Required fields validation only for essential fields
        const requiredFields = {
            userId: "User ID",
            fullName: "Full name",
            amount: "Amount",
            office: "Office",
            installments: "Installment period",
            monthlyInstallment: "Monthly installment amount"
        };

        const missingFields = [];
        for (const [field, name] of Object.entries(requiredFields)) {
            if (!req.body[field]) {
                missingFields.push(name);
            }
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: true,
                // message: Missing required fields: ${missingFields.join(", ")}
            });
        }

        // Get office_id from offices table
        const [officeResult] = await pool.query(
            "SELECT id FROM offices WHERE name = ?", 
            [office]
        );
        
        if (officeResult.length === 0) {
            return res.status(400).json({
                error: true,
                message: "Invalid office specified"
            });
        }
        
        const office_id = officeResult[0].id;

        // Insert the advance application
        const [result] = await pool.query(
            `INSERT INTO advances (
                user_id,
                office_id,
                full_name,
                amount,
                installments,
                installment_amount,
                status,
                mode_of_payment,
                purpose,
                date_requested,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                userId,
                office_id,
                fullName,
                amount,
                installments,
                monthlyInstallment,
                'pending', // Default status
                paymentMode || null, // Optional field
                purpose || null, // Optional field
                date
            ]
        );

        // Get the newly created advance
        const [newAdvance] = await pool.query(
            "SELECT * FROM advances WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Advance application submitted successfully",
            advance: newAdvance[0]
        });

    } catch (err) {
        console.error("Error submitting advance application:", err);
        res.status(500).json({
            error: true,
            message: "Failed to submit advance application",
            details: err.message
        });
    }
});

// Get all pending advances
app.get("/pending-advances", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                a.*, 
                o.name AS office_name,
                COALESCE(a.full_name, CONCAT(a.first_name, ' ', a.last_name)) AS full_name,
                u.first_name AS user_first_name,
                u.last_name AS user_last_name
            FROM advances a
            LEFT JOIN offices o ON a.office_id = o.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.status = 'pending'
            ORDER BY a.date_requested DESC
        `);
        
        res.json({
            success: true,
            count: rows.length,
            advances: rows
        });
    } catch (err) {
        console.error("Error fetching pending advances:", err);
        res.status(500).json({
            error: true,
            message: "Failed to fetch pending advances",
            details: err.message
        });
    }
});




/// Fixed approve endpoint - matches your create endpoint pattern
app.post("/approve-advance/:id", async (req, res) => {
    try {
      const { id } = req.params
      const { userId } = req.body // ✅ Get from body like create endpoint
  
      if (!userId) {
        return res.status(401).json({
          error: true,
          message: "User ID is required",
        })
      }
  
      // Calculate next payment date (first day of next month)
      const now = new Date()
      const nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, 2)
  
      // Format date for MySQL
      const formattedDate = nextPaymentDate.toISOString().slice(0, 19).replace("T", " ")
  
      const [result] = await pool.query(
        `
              UPDATE advances 
              SET 
                  status = 'approved',
                  date_approved = NOW(),
                  approved_by_id = ?,
                  expected_repayment_dates = ?,
                  updated_at = NOW()
              WHERE id = ? AND status = 'pending'
          `,
        [userId, formattedDate, id],
      )
  
      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: true,
          message: "Advance not found or not pending approval",
        })
      }
  
      // Get the updated advance record
      const [updatedAdvance] = await pool.query("SELECT * FROM advances WHERE id = ?", [id])
  
      res.json({
        success: true,
        message: "Advance approved successfully",
        advance: updatedAdvance[0],
      })
    } catch (err) {
      console.error("Error approving advance:", err)
      res.status(500).json({
        error: true,
        message: "Failed to approve advance",
        details: err.message,
      })
    }
  })


// Decline an advance
app.post('/decline-advance/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.body // ✅ Get from body consistently
    
        if (!userId) {
          return res.status(401).json({
            error: true,
            message: "User ID is required",
          })
        }
    
        const [result] = await pool.query(
          `
                UPDATE advances 
                SET 
                    status = 'declined',
                    date_approved = NOW(),
                    declined_by_id = ?,
                    updated_at = NOW()
                WHERE id = ? AND status = 'pending'
            `,
          [userId, id],
        )
    
        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: true,
            message: "Advance not found or not pending approval",
          })
        }
    
        // Get the updated advance record
        const [updatedAdvance] = await pool.query("SELECT * FROM advances WHERE id = ?", [id])
    
        res.json({
          success: true,
          message: "Advance rejected successfully",
          advance: updatedAdvance[0],
        })
      } catch (err) {
        console.error("Error rejecting advance:", err)
        res.status(500).json({
          error: true,
          message: "Failed to reject advance",
          details: err.message,
        })
      }
    })

// Check if user has an active advance
app.get("/advances/active/:user_id", async (req, res) => {
    const { user_id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM advances WHERE user_id = ? AND status = 'Approved'",
      [user_id]
    );
  
    if (rows.length > 0) {
      return res.json({ hasActiveAdvance: true, advance: rows[0] });
    } else {
      return res.json({ hasActiveAdvance: false });
    }
  });
  

// Get all active advances (approved but not fully repaid)
app.get("/active-advances", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                o.name AS office_name,
                COALESCE(a.full_name, CONCAT(a.first_name, ' ', a.last_name)) AS full_name,
                u.first_name AS user_first_name,
                u.last_name AS user_last_name
            FROM advances a
            LEFT JOIN offices o ON a.office_id = o.id
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.status = 'approved' 
            AND (a.remaining_amount IS NOT NULL AND a.remaining_amount > 0.01)
            ORDER BY a.date_approved DESC
        `);
        
        res.json({
            success: true,
            count: rows.length,
            advances: rows
        });
        
    } catch (err) {
        console.error("Error fetching active advances:", err);
        res.status(500).json({
            error: true,
            message: "Failed to fetch active advances",
            details: err.message
        });
    }
});

// Modify your advance approval endpoint to set initial repayment date
app.put("/approve-advance/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Set first repayment date to next 1st of month
        const nextMonth = moment().add(1, 'month').startOf('month').format('YYYY-MM-DD');
        
        const [result] = await pool.query(`
            UPDATE advances SET
                status = 'approved',
                date_approved = NOW(),
                expected_repayment_dates = ?,
                processed_today = 0
            WHERE id = ?
        `, [nextMonth, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: "Advance not found"
            });
        }

        res.json({
            success: true,
            message: "Advance approved successfully"
        });

    } catch (err) {
        console.error("Error approving advance:", err);
        res.status(500).json({
            error: true,
            message: "Failed to approve advance",
            details: err.message
        });
    }
});

//check if user has top up
app.get("/user-active-advance/:userId", async (req, res) => {
    try {
      const { userId } = req.params
  
      if (!userId) {
        return res.status(400).json({
          error: true,
          message: "User ID is required",
        })
      }
  
      // Get user's active advance
      const [advances] = await pool.query(
        `
              SELECT 
                  a.*,
                  o.name AS office_name,
                  COALESCE(a.full_name, CONCAT(u.first_name, ' ', u.last_name)) AS full_name,
                  u.first_name AS user_first_name,
                  u.last_name AS user_last_name,
                  a.amount as originalAmount,
                  COALESCE(a.remaining_amount, a.amount) as remainingAmount,
                  a.installments as originalInstallments,
                  a.installment_amount as originalInstallmentAmount
              FROM advances a
              LEFT JOIN offices o ON a.office_id = o.id
              LEFT JOIN users u ON a.user_id = u.id
              WHERE a.user_id = ? 
              AND a.status = 'approved'
              AND (a.remaining_amount IS NULL OR a.remaining_amount > 0.01)
              ORDER BY a.date_approved DESC
            
          `,
        [userId],
      )
  
      if (advances.length === 0) {
        return res.json({
          success: true,
          hasActiveAdvance: false,
          message: "No active advance found",
        })
      }
  
      const advance = advances[0]
  
      // Check if user already has a pending top-up for this advance
      const [existingTopups] = await pool.query(
        `
              SELECT id, status 
              FROM advance_topups 
              WHERE advance_id = ? AND status = 'pending'
          `,
        [advance.id],
      )
  
      if (existingTopups.length > 0) {
        return res.json({
          success: true,
          hasActiveAdvance: true,
          hasPendingTopup: true,
          message: "You already have a pending top-up for this advance",
          advance: advance,
        })
      }
  
      res.json({
        success: true,
        hasActiveAdvance: true,
        hasPendingTopup: false,
        advance: advance,
      })
    } catch (err) {
      console.error("Error fetching user's active advance:", err)
      res.status(500).json({
        error: true,
        message: "Failed to fetch active advance",
        details: err.message,
      })
    }
  })
  
  // Keep your existing advance-topups endpoint but add user validation
  app.post("/advance-topups", async (req, res) => {
    try {
      const {
        advance_id,
       top_up_amount,
       first_name,
        last_name,
       top_up_date,
        office_id,
        installments,
        userId,
      } = req.body
  
      // Validate required fields
      const requiredFields = {
        advance_id: "Advance ID",
        top_up_amount: "Amount",
        first_name: "First name",
        last_name: "Last name",
        top_up_date: "Top-up date",
        office_id: "Office",
        installments: "Installments",
        userId: "User ID",
      }
  
      const missingFields = []
      for (const [field, name] of Object.entries(requiredFields)) {
        if (!req.body[field]) {
          missingFields.push(name)
        }
      }
  
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: true,
        //   message: Missing required fields: ${missingFields.join(", ")},
        })
      }
  
      // Verify the advance exists, is approved, and belongs to the user
      const [advanceCheck] = await pool.query("SELECT id, user_id, status FROM advances WHERE id = ? AND user_id = ?", [
        advance_id,
        userId,
      ])
  
      if (advanceCheck.length === 0) {
        return res.status(404).json({
          error: true,
          message: "Advance not found or doesn't belong to you",
        })
      }
  
      if (advanceCheck[0].status !== "approved") {
        return res.status(400).json({
          error: true,
          message: "Cannot top up an advance that is not approved",
        })
      }
  
      // Check for existing pending top-ups
      const [existingTopups] = await pool.query(
        "SELECT id FROM advance_topups WHERE advance_id = ? AND status = 'pending'",
        [advance_id],
      )
  
      if (existingTopups.length > 0) {
        return res.status(400).json({
          error: true,
          message: "You already have a pending top-up for this advance",
        })
      }
  
      // Insert the top-up record
      const [result] = await pool.query(
        `INSERT INTO advance_topups (
                  advance_id,
                  top_up_amount,
                  first_name,
                  last_name,
                  top_up_date,
                  office_id,
                  installments,
                  status,
                  created_at,
                  updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [advance_id, top_up_amount, first_name, last_name, top_up_date, office_id, installments],
      )
  
      // Get the newly created top-up
      const [newTopup] = await pool.query("SELECT * FROM advance_topups WHERE id = ?", [result.insertId])
  
      res.status(201).json({
        success: true,
        message: "Advance top-up submitted successfully",
        topup: newTopup[0],
      })
    } catch (err) {
      console.error("Error submitting advance top-up:", err)
      res.status(500).json({
        error: true,
        message: "Failed to submit advance top-up",
        details: err.message,
      })
    }
  })

  // Get all pending advance topups
app.get("/pending-topups", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          a.id,
          a.advance_id,
          a.top_up_amount AS amount,
          a.top_up_date,
          a.office_id,
          a.installments,
          a.status,
          o.name AS office_name,
          a.first_name,
          a.last_name
      FROM advance_topups a
      LEFT JOIN offices o ON a.office_id = o.id
      WHERE a.status = 'pending'
      ORDER BY a.top_up_date DESC
  `);
      
      res.json({
          success: true,
          count: rows.length,
          topups: rows
      });
  } catch (err) {
      console.error("Error fetching pending topups:", err);
      res.status(500).json({
          error: true,
          message: "Failed to fetch pending advance top ups ",
          details: err.message
      });
  }
});

// Approve endpoint
app.post("/approve-topup/:id", async (req, res) => {
  try {
    const { id } = req.params
    
    // Update status to approved
    const [result] = await pool.query(
      `UPDATE advance_topups 
       SET status = 'approved', 
           updated_at = NOW() 
       WHERE id = ?`,
      [id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: "Topup not found"
      })
    }
    
    res.json({
      success: true,
      message: "Topup approved successfully"
    })
  } catch (err) {
    console.error("Error approving topup:", err)
    res.status(500).json({
      error: true,
      message: "Failed to approve topup"
    })
  }
})

// Decline endpoint
app.post("/decline-topup/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Get userId from request body
    
    // Update status to declined without requiring a reason
    const [result] = await pool.query(
      `UPDATE advance_topups 
       SET status = 'declined', 
           updated_at = NOW() 
       WHERE id = ?`,
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: "Topup not found"
      });
    }
    
    res.json({
      success: true,
      message: "Topup declined successfully"
    });
  } catch (err) {
    console.error("Error declining topup:", err);
    res.status(500).json({
      error: true,
      message: "Failed to decline topup"
    });
  }
});


// Get all topups (approved, pending, declined)
app.get("/all-topups", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          a.id,
          a.advance_id,
          a.top_up_amount AS amount,
          a.top_up_date,
          a.office_id,
          a.installments,
          a.status,
          a.first_name,
          a.last_name,
          o.name AS office_name,
          COALESCE((
            SELECT SUM(at.amount_paid) 
            FROM advance_transactions at 
            WHERE at.topup_id = a.id
          ), 0) AS paid_amount
      FROM advance_topups a
      LEFT JOIN offices o ON a.office_id = o.id
      ORDER BY a.top_up_date DESC
    `);
    
    res.json({
      success: true,
      count: rows.length,
      topups: rows
    });
  } catch (err) {
    console.error("Error fetching topups:", err);
    res.status(500).json({
      error: true,
      message: "Failed to fetch topups"
    });
  }
});

// Record repayment
app.post("/record-repayment", async (req, res) => {
  try {
    const { topup_id, advance_id, amount_paid } = req.body;

    // Validate
    if (!topup_id || !advance_id || !amount_paid || isNaN(amount_paid) || amount_paid <= 0) {
      return res.status(400).json({
        error: true,
        message: "Invalid payment data"
      });
    }

    // Insert into advance_transactions
    const [result] = await pool.query(
      `INSERT INTO advance_transactions (
        advance_id,
        topup_id,
        amount_paid,
        last_update_date,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, NOW(), NOW(), NOW())`,
      [advance_id, topup_id, amount_paid]
    );

    res.json({
      success: true,
      message: "Payment recorded successfully",
      transaction_id: result.insertId
    });
  } catch (err) {
    console.error("Error recording repayment:", err);
    res.status(500).json({
      error: true,
      message: "Failed to record repayment"
    });
  }
});



// Get payment history for an advance
app.get("/advance-payment-history/:advanceId", async (req, res) => {
  try {
    const { advanceId } = req.params;
    
    // First get advance details with correct column names
    const [advanceDetails] = await pool.query(`
      SELECT 
        id,
        amount AS original_amount,
        remaining_amount,
        installment_amount,
        status
      FROM advances
      WHERE id = ?
    `, [advanceId]);

    if (advanceDetails.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Advance not found"
      });
    }

    // Get approved top-ups for this advance
    const [topups] = await pool.query(`
      SELECT 
        id,
        top_up_amount,
        status
      FROM advance_topups
      WHERE advance_id = ?
      AND status = 'approved'
    `, [advanceId]);

    // Calculate total top-up amount
    const totalTopupAmount = topups.reduce((sum, topup) => {
      return sum + parseFloat(topup.top_up_amount || 0);
    }, 0);


    // Get transactions for this advance
    const [transactions] = await pool.query(`
      SELECT 
        id,
        advance_id,
        topup_id,
        amount_paid,
        last_update_date AS payment_date,
        created_at,
        updated_at
      FROM advance_transactions
      WHERE advance_id = ?
      ORDER BY created_at DESC
    `, [advanceId]);

    
    res.json({
      success: true,
      advance: {
        id: advanceDetails[0].id,
        original_amount: advanceDetails[0].original_amount, 
        remaining_amount: advanceDetails[0].remaining_amount,
        installment_amount: advanceDetails[0].installment_amount,
        status: advanceDetails[0].status,
        total_topup_amount: totalTopupAmount.toFixed(2) 
      },
      transactions: transactions.map(t => ({
        id: t.id,
        advance_id: t.advance_id,
        topup_id: t.topup_id,
        amount_paid: t.amount_paid,
        payment_date: t.payment_date,
        created_at: t.created_at,
        updated_at: t.updated_at
      })),
      topups: topups 
    });
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({
      error: true,
      message: "Failed to fetch payment history",
      details: err.message
    });
  }
});



  // Get all topups

  app.get('/advance-topups', async (req, res) => {
    try {
      // Updated query using fields directly from advance_topups table
      const [topups] = await pool.query(`
        SELECT 
          at.id,
          at.first_name,
          at.last_name,
          CONCAT(at.first_name, ' ', at.last_name) AS full_name,
          o.name AS office_name,
          at.top_up_amount AS amount,
          at.installments,
          at.top_up_date AS date_requested,
          at.status,
          at.created_at,
          at.updated_at
        FROM advance_topups at
        JOIN offices o ON at.office_id = o.id
        WHERE at.status = 'pending'
        ORDER BY at.created_at DESC
      `);
  
      res.json({
        success: true,
        advances: topups 
      });
      
    } catch (err) {
      console.error("Error fetching top-ups:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending top-up advances",
        error: err.message  // Include the actual error message
      });
    }
  });


// Get all expenses with optional filtering
app.get("/expenses", async (req, res) => {
    try {
        
        const { office_id, year, month, status, expense_type_id } = req.query;
        
        let query = `
            SELECT 
                e.id,
                e.office_id,
                e.created_by_id,
                e.expense_type_id,
                e.name,
                e.amount,
                e.date,
                e.year,
                e.month,
                e.status,
                e.approved_date,
                e.approved_by_id,
                e.declined_date,
                e.declined_by_id,
                e.notes,
                e.files,
                e.created_at,
                e.updated_at,
                e.expense_type,
                e.proof_of_payment,
                o.name AS office_name,
                u.email AS created_by_email,
                approver.email AS approved_by_email,
                decliner.email AS declined_by_email
            FROM expenses e
            LEFT JOIN offices o ON e.office_id = o.id
            LEFT JOIN users u ON e.created_by_id = u.id
            LEFT JOIN users approver ON e.approved_by_id = approver.id
            LEFT JOIN users decliner ON e.declined_by_id = decliner.id
        `;
        
        // Add WHERE conditions based on query parameters
        const conditions = [];
        const params = [];
        
        if (office_id) {
            conditions.push("e.office_id = ?");
            params.push(office_id);
        }
        
        if (year) {
            conditions.push("e.year = ?");
            params.push(year);
        }
        
        if (month) {
            conditions.push("e.month = ?");
            params.push(month);
        }
        
        if (status) {
            conditions.push("e.status = ?");
            params.push(status);
        }
        
        if (expense_type_id) {
            conditions.push("e.expense_type_id = ?");
            params.push(expense_type_id);
        }
        
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }
        
        query += " ORDER BY e.date DESC, e.created_at DESC";
        
        const [rows] = await pool.query(query, params);
        
        res.json({
            success: true,
            count: rows.length,
            expenses: rows
        });
        
    } catch (err) {
        console.error("Error fetching expenses:", err);
        res.status(500).json({
            error: true,
            message: "Failed to fetch expenses",
            details: err.message
        });
    }
});

// Add a new expense
app.post("/expenses", async (req, res) => {
    try {
        const {
            office_id,
            created_by_id,
            expense_type_id,
            name,
            amount,
            date,
            year,
            month,
            status = 'pending', // default status
            notes,
            files,
            expense_type,
            proof_of_payment
        } = req.body;
        
        // Validate required fields
        if (!office_id || !created_by_id || !expense_type_id || !name || !amount || !date || !year || !month) {
            return res.status(400).json({
                error: true,
                message: "Missing required fields"
            });
        }
        
        const [result] = await pool.query(`
            INSERT INTO expenses (
                office_id,
                created_by_id,
                expense_type_id,
                name,
                amount,
                date,
                year,
                month,
                status,
                notes,
                files,
                expense_type,
                proof_of_payment,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            office_id,
            created_by_id,
            expense_type_id,
            name,
            amount,
            date,
            year,
            month,
            status,
            notes,
            files,
            expense_type,
            proof_of_payment
        ]);
        
        // Get the newly created expense
        const [newExpense] = await pool.query(`
            SELECT 
                e.*,
                o.name AS office_name,
                u.email AS created_by_email
            FROM expenses e
            LEFT JOIN offices o ON e.office_id = o.id
            LEFT JOIN users u ON e.created_by_id = u.id
            WHERE e.id = ?
        `, [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: "Expense added successfully",
            expense: newExpense[0]
        });
        
    } catch (err) {
        console.error("Error adding expense:", err);
        res.status(500).json({
            error: true,
            message: "Failed to add expense",
            details: err.message
        });
    }
});

// Get all expense types
app.get('/expense-types', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, name FROM expense_types ORDER BY name');
      res.json({
        success: true,
        expenseTypes: result.rows
      });
    } catch (err) {
      console.error('Error fetching expense types:', err);
      res.status(500).json({
        error: true,
        message: 'Failed to fetch expense types'
      });
    }
  });
  
 
//working in use
app.get("/branch-ledger", async (req, res) => {
  try {
    const { office_id } = req.query

    if (!office_id) {
      return res.status(400).json({ error: "Office ID is required" })
    }

    const [office] = await pool.query("SELECT name FROM offices WHERE id = ?", [office_id])

    if (!office.length) {
      return res.status(404).json({ error: "Office not found" })
    }

    const [ledger] = await pool.query(
      `
      SELECT cash_balance, total_income
      FROM general_ledger
      WHERE office_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [office_id],
    )

    // Get approved advances total since Jan 4 2025
    const [advances] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM advances
      WHERE office_id = ?
      AND status = 'approved'
      AND date_approved >= '2025-01-04'
    `,
      [office_id],
    )

    // Get expenses total since Jan 4 2025
    const [expenses] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM expenses
      WHERE office_id = ?
      AND status = 'approved'
      AND date >= '2025-01-04'
    `,
      [office_id],
    )

    // Get loans total since Jan 4 2025
    const [newLoansResult] = await pool.query(
      `
      SELECT COALESCE(SUM(debit), 0) AS total
      FROM loan_transactions
      WHERE office_id = ?
      AND transaction_type = 'disbursement'
      AND created_at >= '2025-01-04'
    `,
      [office_id],
    )

    const [advancesPaidBack] = await pool.query(
      `
      SELECT COALESCE(SUM(at.amount_paid), 0) AS total
      FROM advance_transactions at
      JOIN advances a ON at.advance_id = a.id
      WHERE a.office_id = ?
      AND at.created_at >= '2025-01-04'
      `,
      [office_id]
    );

    // NEW: Get total loan amounts collected (credit) since Jan 4 2025
    const [loanCollectedResult] = await pool.query(
     `
      SELECT COALESCE(SUM(credit), 0) AS total_collected
      FROM loan_transactions
      WHERE office_id = ?
      AND date >= '2025-01-04'
      AND payment_apply_to IN ('full_payment', 'part_payment', 'reloan_payment')
      `
    ,
      [office_id],
    )

    res.json({
      success: true,
      officeName: office[0].name,
      initialCashBalance: ledger[0]?.cash_balance || 0,
      totalIncome: ledger[0]?.total_income || 0,
      advances: advances[0].total,
      expenses: expenses[0].total,
      newLoans: newLoansResult[0].total,
      advancesPaidBack: advancesPaidBack[0].total, // Include new data
      loanCollected: loanCollectedResult[0].total,

    })
  } catch (err) {
    console.error("Error in /branch-ledger:", err.stack || err)
    res.status(500).json({
      error: "Server error",
      details: err.message,
    })
  }
})

// Ledger Balance endpoint with closingCashBalance
app.get("/ledger-balance", async (req, res) => {
  try {
    const { office_id } = req.query

    if (!office_id) {
      return res.status(400).json({ error: "Office ID is required" })
    }

    const [office] = await pool.query("SELECT name FROM offices WHERE id = ?", [office_id])

    if (!office.length) {
      return res.status(404).json({ error: "Office not found" })
    }

    const [ledger] = await pool.query(
      `
      SELECT cash_balance, total_income
      FROM general_ledger
      WHERE office_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [office_id],
    )

    // Get approved advances total since Jan 4 2025
    const [advances] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM advances
      WHERE office_id = ?
      AND status = 'approved'
      AND date_approved >= '2025-01-04'
    `,
      [office_id],
    )

    // Get expenses total since Jan 4 2025
    const [expenses] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM expenses
      WHERE office_id = ?
      AND status = 'approved'
      AND date >= '2025-01-04'
    `,
      [office_id],
    )

    // Get loans total since Jan 4 2025
    const [newLoansResult] = await pool.query(
      `
      SELECT COALESCE(SUM(debit), 0) AS total
      FROM loan_transactions
      WHERE office_id = ?
      AND transaction_type = 'disbursement'
      AND created_at >= '2025-01-04'
    `,
      [office_id],
    )

    const [advancesPaidBack] = await pool.query(
      `
      SELECT COALESCE(SUM(at.amount_paid), 0) AS total
      FROM advance_transactions at
      JOIN advances a ON at.advance_id = a.id
      WHERE a.office_id = ?
      AND at.created_at >= '2025-01-04'
      `,
      [office_id]
    );

    // NEW: Get total loan amounts collected (credit) since Jan 4 2025
    const [loanCollectedResult] = await pool.query(
     `
      SELECT COALESCE(SUM(credit), 0) AS total_collected
      FROM loan_transactions
      WHERE office_id = ?
      AND date >= '2025-01-04'
      AND payment_apply_to IN ('full_payment', 'part_payment', 'reloan_payment')
      `
    ,
      [office_id],
    )

    // Calculate closingCashBalance
    const initialCashBalance = Number(ledger[0]?.cash_balance || 0)
    const totalIncome = Number(ledger[0]?.total_income || 0)
    const totalAdvances = Number(advances[0].total)
    const totalExpenses = Number(expenses[0].total)
    const newLoans = Number(newLoansResult[0].total)
    const totalAdvancesPaidBack = Number(advancesPaidBack[0].total)
    const loanCollected = Number(loanCollectedResult[0].total_collected)

    const closingCashBalance = initialCashBalance + totalIncome + advancesPaidBack + loanCollected - totalAdvances - totalExpenses - newLoans

    res.json({
      success: true,
      officeName: office[0].name,
      initialCashBalance: initialCashBalance,
      totalIncome: totalIncome,
      advances: totalAdvances,
      expenses: totalExpenses,
      newLoans: newLoans,
      advancesPaidBack: advancesPaidBack,
      loanCollected: loanCollected,
      closingCashBalance: closingCashBalance
    })
  } catch (err) {
    console.error("Error in /ledger-balance:", err.stack || err)
    res.status(500).json({
      error: "Server error",
      details: err.message,
    })
  }
})

// NEW: Endpoint to get summary data for all offices
app.get("/offices-summary", async (req, res) => {
  try {
    // Fetch all offices
    const [offices] = await pool.query("SELECT id, name FROM offices")

    const officeSummaries = []

    // Latest ledger entries for each office
    const [latestLedgerEntries] = await pool.query(`
      WITH LatestLedger AS (
          SELECT
              office_id,
              cash_balance,
              total_income,
              ROW_NUMBER() OVER (PARTITION BY office_id ORDER BY created_at DESC) as rn
          FROM general_ledger
      )
      SELECT office_id, cash_balance, total_income
      FROM LatestLedger
      WHERE rn = 1;
    `)
    const ledgerMap = new Map(latestLedgerEntries.map((l) => [l.office_id, l]))

    // Sums for advances, expenses, loan_transactions, advance_transactions for all offices
    const [advancesSums] = await pool.query(`
      SELECT
          office_id,
          COALESCE(SUM(amount), 0) AS total_advances
      FROM advances
      WHERE status = 'approved' AND date_approved >= '2025-01-04'
      GROUP BY office_id;
    `)
    const advancesMap = new Map(advancesSums.map((a) => [a.office_id, a]))

    const [expensesSums] = await pool.query(`
      SELECT
          office_id,
          COALESCE(SUM(amount), 0) AS total_expenses
      FROM expenses
      WHERE status = 'approved' AND date >= '2025-01-04'
      GROUP BY office_id;
    `)
    const expensesMap = new Map(expensesSums.map((e) => [e.office_id, e]))

    const [loanTxnSums] = await pool.query(`
      SELECT
          office_id,
          COALESCE(SUM(CASE WHEN transaction_type = 'disbursement' AND created_at >= '2025-01-04' THEN debit ELSE 0 END), 0) AS total_new_loans,
          COALESCE(SUM(CASE WHEN date >= '2025-01-04' THEN credit ELSE 0 END), 0) AS total_loan_collected
      FROM loan_transactions
      WHERE date >= '2025-01-04'
      GROUP BY office_id;
    `)
    const loanTxnMap = new Map(loanTxnSums.map((l) => [l.office_id, l]))

    const [advanceTxnSums] = await pool.query(`
      SELECT
          a.office_id,
          COALESCE(SUM(at.amount_paid), 0) AS total_advances_paid_back
      FROM advance_transactions at
      JOIN advances a ON at.advance_id = a.id
      WHERE at.created_at >= '2025-01-04'
      GROUP BY a.office_id;
    `)
    const advanceTxnMap = new Map(advanceTxnSums.map((at) => [at.office_id, at]))

    for (const office of offices) {
      const ledger = ledgerMap.get(office.id) || {}
      const advances = advancesMap.get(office.id) || {}
      const expenses = expensesMap.get(office.id) || {}
      const loanTxn = loanTxnMap.get(office.id) || {}
      const advanceTxn = advanceTxnMap.get(office.id) || {}

      const initialCashBalance = Number(ledger.cash_balance || 0)
      const totalIncome = Number(ledger.total_income || 0)
      const totalAdvances = Number(advances.total_advances || 0)
      const totalExpenses = Number(expenses.total_expenses || 0)
      const newLoans = Number(loanTxn.total_new_loans || 0)
      const advancesPaidBack = Number(advanceTxn.total_advances_paid_back || 0)
      const loanCollected = Number(loanTxn.total_loan_collected || 0)

      const calculatedInflows = totalIncome + advancesPaidBack + loanCollected
      const calculatedOutflows = totalAdvances + totalExpenses + newLoans
      const calculatedCashBalance = initialCashBalance + calculatedInflows - calculatedOutflows

      officeSummaries.push({
        id: office.id,
        name: office.name,
        cashBalance: calculatedCashBalance,
        income: totalIncome, 
        expenses: totalExpenses,
        totalInflows: calculatedInflows,
        totalOutflows: calculatedOutflows,
        initialCashBalance: initialCashBalance,
        advances: totalAdvances,
        newLoans: newLoans,
        advancesPaidBack: advancesPaidBack,
        loanCollected: loanCollected,
      })
    }

    res.json({ success: true, offices: officeSummaries })
  } catch (err) {
    console.error("Error in /offices-summary:", err.stack || err)
    res.status(500).json({
      error: "Server error",
      details: err.message,
    })
  }
})


  
  //get emloyees
  app.get("/employees", async (req, res) => {
    try {
        // Extract optional query parameters
        const { department, job_title, status, work_location } = req.query;
        
        let query = "SELECT * FROM employees";
        const conditions = [];
        const params = [];
        
        // Build WHERE clause dynamically
        if (department) {
            conditions.push("department = ?");
            params.push(department);
        }
        
        if (job_title) {
            conditions.push("job_title = ?");
            params.push(job_title);
        }
        
        if (status) {
            conditions.push("status = ?");
            params.push(status);
        }
        
        if (work_location) {
            conditions.push("work_location = ?");
            params.push(work_location);
        }
        
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }
        
        query += " ORDER BY hire_date DESC";
        
        const [rows] = await pool.query(query, params);
        
        res.json({
            success: true,
            count: rows.length,
            employees: rows
        });
        
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).json({
            error: true,
            message: "Failed to fetch employees",
            details: err.message
        });
    }
});


//update employee details 
// here kaya Update employee - PUT /employees/:id
app.put("/employees/:id", async (req, res) => {
    try {
        const employeeId = req.params.id;
        const updateData = req.body;
        
        // Required field validation
        const requiredFields = ['first_name', 'last_name', 'email', 'job_title', 'department'];
        const missingFields = requiredFields.filter(field => !updateData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: true,
                // message: Missing required fields: ${missingFields.join(', ')}
            });
        }
        
        // Update employee
        await pool.query(`
            UPDATE employees SET ?
            WHERE employee_id = ?
        `, [updateData, employeeId]);
        
        // Return the updated employee
        const [updatedEmployee] = await pool.query(
            "SELECT * FROM employees WHERE employee_id = ?",
            [employeeId]
        );
        
        res.json({
            success: true,
            message: "Employee updated successfully",
            employee: updatedEmployee[0]
        });
        
    } catch (err) {
        console.error("Error updating employee:", err);
        
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: true,
                message: "Email already exists in the system"
            });
        }
        
        res.status(500).json({
            error: true,
            message: "Failed to update employee",
            details: err.message
        });
    }
});

// here GET /employees/user/:user_id
app.get("/employees/user/:id", async (req, res) => {
    try {
      const userId = req.params.id
  
      const [rows] = await pool.query("SELECT * FROM employees WHERE user_id = ?", [userId])
  
      if (rows.length === 0) {
        return res.status(404).json({ error: true, message: "Profile not found" })
      }
  
      res.json({ success: true, employee: rows[0] })
    } catch (err) {
      console.error("Error fetching employee by user_id:", err)
      res.status(500).json({ error: true, message: "Server error" })
    }
  })
  

  //get employee for lc view
  app.get("/employees/:id", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM employees WHERE employee_id = ?", [req.params.id])
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Employee not found" })
      }
      res.json({ success: true, employee: rows[0] })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

// here Create new employee - POST /employees
app.post("/employees/user/:id", async (req, res) => {
    try {
      const {
        user_id, // Must be provided from the session
        first_name,
        last_name,
        gender,
        date_of_birth,
        nationality,
        nrc_number,
        email,
        phone,
        address,
        job_title,
        department,
        branch,
        hire_date,
        employment_type,
        reporting_manager,
        work_location,
        emergency_contact_name,
        emergency_contact_relation,
        emergency_contact_number,
        medical_conditions,
      } = req.body
  
      // Check for required fields
      const requiredFields = ['user_id', 'first_name', 'last_name', 'email', 'job_title', 'department', 'hire_date']
      const missing = requiredFields.filter(field => !req.body[field])
      if (missing.length > 0) {
        return res.status(400).json({
          error: true,
        //   message: Missing required fields: ${missing.join(', ')}
        })
      }
  

  
      // Insert employee
      const [result] = await pool.query(`
        INSERT INTO employees SET ?
      `, {
        user_id,
        first_name,
        last_name,
        gender,
        date_of_birth,
        nationality,
        nrc_number,
        email,
        phone,
        address,
        job_title,
        department,
        branch,
        hire_date,
        employment_type,
        reporting_manager,
        work_location,
        emergency_contact_name,
        emergency_contact_relation,
        emergency_contact_number,
        medical_conditions,
        status: 'Active',
      })
  
      // Return new record
      const [newEmployee] = await pool.query("SELECT * FROM employees WHERE employee_id = ?", [result.insertId])
  
      res.status(201).json({
        success: true,
        message: "Employee created successfully",
        employee: newEmployee[0]
      })
  
    } catch (err) {
      console.error("Error creating employee:", err)
      res.status(500).json({
        error: true,
        message: "Failed to create employee",
        details: err.message
      })
    }
  })


  //loans
  // loans
  app.get("/loans_d", async (req, res) => {
    try {
      let query = "SELECT * FROM loans";
      const params = [];
      
      if (req.query.loan_officer_id) {
        query += " WHERE loan_officer_id = ?";
        params.push(req.query.loan_officer_id);
      }
      
      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// loan transactions
app.get("/loan-transactions", async (req, res) => {
  try {
    let query = "SELECT * FROM loan_transactions";
    const params = [];
    
    if (req.query.loan_ids) {
      const loanIds = req.query.loan_ids.split(',').map(id => parseInt(id.trim()));
      query += " WHERE loan_id IN (?)";
      params.push(loanIds);
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//reports section api's
// New Loans endpoint - FIXED
app.get("/new-loansr", async (req, res) => {
  try {
    const { office_id, start_date, end_date } = req.query

    // Handle "all" offices case
    const shouldFilterByOffice = office_id && office_id !== "all" && office_id !== "0";
    
    const [rows] = await pool.query(
      `
      SELECT 
        l.id as loan_id,
        l.disbursement_date as date,
        l.approved_amount as amount,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        CONCAT(u.first_name, ' ', u.last_name) as loan_officer,
        o.name as office_name
      FROM loans l
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON l.loan_officer_id = u.id
      JOIN offices o ON l.office_id = o.id
      WHERE ${shouldFilterByOffice ? 'l.office_id = ? AND' : ''}
        l.disbursement_date BETWEEN ? AND ?
        AND l.status IN ('approved', 'closed')
      ORDER BY l.disbursement_date DESC
    `,
      shouldFilterByOffice ? [office_id, start_date, end_date] : [start_date, end_date]
    )

    console.log("New loans:", rows)
    res.json({
      success: true,
      count: rows.length,
      data: rows,
    })
  } catch (err) {
    console.error("Error fetching new loans:", err)
    res.status(500).json({
      error: true,
      message: "Failed to fetch new loans",
      details: err.message,
    })
  }
})

// Part Payments endpoint - FIXED
app.get("/part-paymentsr", async (req, res) => {
  try {
    const { office_id, start_date, end_date } = req.query;

    // Handle "all" offices case
    const shouldFilterByOffice = office_id && office_id !== "all" && office_id !== "0";

    const [rows] = await pool.query(
      `
      SELECT 
        pp.id as transaction_id,
        pp.date,
        pp.credit as amount,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        l.id as loan_id,
        CONCAT(u.first_name, ' ', u.last_name) as loan_officer,
        o.name as office_name
      FROM loan_transactions pp
      JOIN loans l ON pp.loan_id = l.id
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON l.loan_officer_id = u.id
      JOIN offices o ON l.office_id = o.id
      WHERE ${shouldFilterByOffice ? 'l.office_id = ? AND' : ''}
        pp.date BETWEEN ? AND ?
        AND pp.transaction_type = 'repayment'
        AND pp.payment_apply_to = 'part_payment'
        AND pp.reversed = 0
      ORDER BY pp.date DESC
      `,
      shouldFilterByOffice ? [office_id, start_date, end_date] : [start_date, end_date]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("Error fetching part payments:", err);
    res.status(500).json({
      error: true,
      message: "Failed to fetch part payments",
      details: err.message,
    });
  }
});

// Full Payments endpoint - FIXED
app.get("/full-paymentsr", async (req, res) => {
  try {
    const { office_id, start_date, end_date } = req.query;

    // Handle "all" offices case
    const shouldFilterByOffice = office_id && office_id !== "all" && office_id !== "0";

    const [rows] = await pool.query(
      `
      SELECT 
        pp.id as transaction_id,
        pp.date,
        pp.credit as amount,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        l.id as loan_id,
        CONCAT(u.first_name, ' ', u.last_name) as loan_officer,
        o.name as office_name
      FROM loan_transactions pp
      JOIN loans l ON pp.loan_id = l.id
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON l.loan_officer_id = u.id
      JOIN offices o ON l.office_id = o.id
      WHERE ${shouldFilterByOffice ? 'l.office_id = ? AND' : ''}
        pp.date BETWEEN ? AND ?
        AND pp.transaction_type = 'repayment'
        AND pp.payment_apply_to = 'full_payment'
        AND pp.reversed = 0
      ORDER BY pp.date DESC
      `,
      shouldFilterByOffice ? [office_id, start_date, end_date] : [start_date, end_date]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("Error fetching full payments:", err);
    res.status(500).json({
      error: true,
      message: "Failed to fetch full payments",
      details: err.message,
    });
  }
});

// Reloan Payments endpoint - FIXED
app.get("/reloan-paymentsr", async (req, res) => {
  try {
    const { office_id, start_date, end_date } = req.query;

    // Handle "all" offices case
    const shouldFilterByOffice = office_id && office_id !== "all" && office_id !== "0";

    const [rows] = await pool.query(
      `
      SELECT 
        pp.id as transaction_id,
        pp.date,
        pp.credit as amount,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        l.id as loan_id,
        CONCAT(u.first_name, ' ', u.last_name) as loan_officer,
        o.name as office_name
      FROM loan_transactions pp
      JOIN loans l ON pp.loan_id = l.id
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON l.loan_officer_id = u.id
      JOIN offices o ON l.office_id = o.id
      WHERE ${shouldFilterByOffice ? 'l.office_id = ? AND' : ''}
        pp.date BETWEEN ? AND ?
        AND pp.transaction_type = 'repayment'
        AND pp.payment_apply_to = 'reloan_payment'
        AND pp.reversed = 0
      ORDER BY pp.date DESC
      `,
      shouldFilterByOffice ? [office_id, start_date, end_date] : [start_date, end_date]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("Error fetching reloan payments:", err);
    res.status(500).json({
      error: true,
      message: "Failed to fetch reloan payments",
      details: err.message,
    });
  }
});
  
  // Advances endpoint - FIXED
  app.get("/advances", async (req, res) => {
    try {
      const { office_id, start_date, end_date } = req.query;
  
      // Handle "all" offices case
      const shouldFilterByOffice = office_id && office_id !== "all" && office_id !== "0";
  
      const [rows] = await pool.query(
        `
        SELECT 
          a.id as advance_id,
          a.date_approved as date,
          a.amount,
          CASE
            WHEN a.full_name IS NOT NULL AND a.full_name != '' THEN a.full_name
            WHEN u.id IS NOT NULL THEN CONCAT(u.first_name, ' ', u.last_name)
            ELSE CONCAT(a.first_name, ' ', a.last_name)
          END AS staff_name,
          o.name AS office_name
        FROM advances a
        LEFT JOIN offices o ON a.office_id = o.id
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.status = 'approved'
        AND ${shouldFilterByOffice ? 'a.office_id = ? AND' : ''}
        a.date_approved BETWEEN ? AND ?
        ORDER BY a.date_approved DESC
        `,
        shouldFilterByOffice ? [office_id, start_date, end_date] : [start_date, end_date]
      );
  
      res.json({
        success: true,
        count: rows.length,
        data: rows,
      });
    } catch (err) {
      console.error("Error fetching advances:", err);
      res.status(500).json({
        error: true,
        message: "Failed to fetch advances",
        details: err.message,
      });
    }
  });
  
  // Expenses endpoint - FIXED (also fixed the endpoint name from expensesr to expenses)
  app.get("/expensesr", async (req, res) => {
    try {
      const { office_id, start_date, end_date } = req.query;
  
      // Handle "all" offices case
      const shouldFilterByOffice = office_id && office_id !== "all" && office_id !== "0";
  
      const [rows] = await pool.query(
        `
        SELECT 
          e.id,
          e.date,
          e.amount,
          e.name as expense_name,
          et.name as expense_type,
          o.name as office_name
        FROM expenses e
        JOIN expense_types et ON e.expense_type_id = et.id
        JOIN offices o ON e.office_id = o.id
        WHERE ${shouldFilterByOffice ? 'e.office_id = ? AND' : ''}
          e.date BETWEEN ? AND ?
        ORDER BY e.date DESC
        `,
        shouldFilterByOffice ? [office_id, start_date, end_date] : [start_date, end_date]
      );
  
      res.json({
        success: true,
        count: rows.length,
        data: rows,
      });
    } catch (err) {
      console.error("Error fetching expenses:", err);
      res.status(500).json({
        error: true,
        message: "Failed to fetch expenses",
        details: err.message,
      });
    }
  });

  app.get("/officesd", async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM offices WHERE active = 1')
      console.log(rows)
      res.json({
        success: true,
        count: rows.length,
        offices: rows, 
      })
    } catch (err) {
      console.error("Error fetching offices:", err)
      res.status(500).json({
        error: true,
        message: "Failed to fetch offices",
        details: err.message,
      })
    }
  })


  // New endpoint for user-specific pending advances
app.get("/user-pending-advances/:userId", async (req, res) => {
  try {
      const { userId } = req.params;
      
      const [rows] = await pool.query(`
          SELECT 
              a.*, 
              o.name AS office_name,
              COALESCE(a.full_name, CONCAT(a.first_name, ' ', a.last_name)) AS full_name
          FROM advances a
          LEFT JOIN offices o ON a.office_id = o.id
          WHERE a.status = 'pending' AND a.user_id = ?
          ORDER BY a.date_requested DESC
      `, [userId]);
      
      res.json({
          success: true,
          count: rows.length,
          advances: rows
      });
  } catch (err) {
      console.error("Error fetching user pending advances:", err);
      res.status(500).json({
          error: true,
          message: "Failed to fetch user pending advances",
          details: err.message
      });
  }
});


//testing fetching income from both generalledger table and leder income table
app.get("/branch-ledger", async (req, res) => {
  try {
    const { office_id } = req.query

    if (!office_id) {
      return res.status(400).json({ error: "Office ID is required" })
    }

    const [office] = await pool.query("SELECT name FROM offices WHERE id = ?", [office_id])

    if (!office.length) {
      return res.status(404).json({ error: "Office not found" })
    }

    const [ledger] = await pool.query(
      `
      SELECT cash_balance, total_income
      FROM general_ledger
      WHERE office_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [office_id],
    )
    // 2. NEW: Get the sum of ALL income records from ledger_income table
    const [incomeRecordsSum] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total_income_records
      FROM ledger_income 
      WHERE office_id = ?
    `,
      [office_id],
    );
    // 3. CALCULATE: Combine the historical total with all income records
    const historicalIncome = Number(ledger[0]?.total_income || 0);
    const allIncomeRecords = Number(incomeRecordsSum[0]?.total_income_records || 0);
    const combinedTotalIncome = historicalIncome + allIncomeRecords;

    // Get approved advances total since Jan 4 2025, previous system was fetching closed advances too
    const [advances] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM advances
      WHERE office_id = ?
      AND status IN ('approved', 'closed')
      AND date_approved >= '2025-01-04';
    `,
      [office_id],
    )

    // Get expenses total since Jan 4 2025
    const [expenses] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM expenses
      WHERE office_id = ?
      AND status = 'approved'
      AND date >= '2025-01-04'
    `,
      [office_id],
    )

    // Get loans total since Jan 4 2025
    const [newLoansResult] = await pool.query(
      `
      SELECT COALESCE(SUM(debit), 0) AS total
      FROM loan_transactions
      WHERE office_id = ?
      AND transaction_type = 'disbursement'
      AND created_at >= '2025-01-04'
    `,
      [office_id],
    )

    const [advancesPaidBack] = await pool.query(
      `
      SELECT COALESCE(SUM(at.amount_paid), 0) AS total
      FROM advance_transactions at
      JOIN advances a ON at.advance_id = a.id
      WHERE a.office_id = ?
      AND at.created_at >= '2025-01-04'
      `,
      [office_id]
    );

    // NEW: Get total loan amounts collected (credit) since Jan 4 2025
    const [loanCollectedResult] = await pool.query(
      `
      SELECT COALESCE(SUM(credit), 0) AS total_collected
  FROM loan_transactions
  WHERE office_id = ?
  AND date >= '2025-01-04'
  AND payment_apply_to IN ('full_payment', 'part_payment', 'reloan_payment')
  `,
      [office_id],
    )

    res.json({
      success: true,
      officeName: office[0].name,
      initialCashBalance: ledger[0]?.cash_balance || 0,
      totalIncome: combinedTotalIncome, // This is now the combined total
      historicalIncome: historicalIncome, // Optional: send breakdown for debugging
      incomeRecordsTotal: allIncomeRecords,
      advances: advances[0].total,
      expenses: expenses[0].total,
      newLoans: newLoansResult[0].total,
      advancesPaidBack: advancesPaidBack[0].total, // Include new data
      loanCollected: loanCollectedResult[0].total_collected,
      
    })
  } catch (err) {
    console.error("Error in /branch-ledger:", err.stack || err)
    res.status(500).json({
      error: "Server error",
      details: err.message,
    })
  }
})

app.get("/offices-summary", async (req, res) => {
  try {
    // Fetch all offices
    const [offices] = await pool.query("SELECT id, name FROM offices")

    const officeSummaries = []

    // Latest ledger entries for each office
    const [latestLedgerEntries] = await pool.query(`
      WITH LatestLedger AS (
          SELECT
              office_id,
              cash_balance,
              total_income,
              ROW_NUMBER() OVER (PARTITION BY office_id ORDER BY created_at DESC) as rn
          FROM general_ledger
      )
      SELECT office_id, cash_balance, total_income
      FROM LatestLedger
      WHERE rn = 1;
    `)
    const ledgerMap = new Map(latestLedgerEntries.map((l) => [l.office_id, l]))

    // 2. NEW QUERY: Get the summed income for each office from ALL ledger_income records
    const [incomeSums] = await pool.query(`
      SELECT
          office_id,
          COALESCE(SUM(amount), 0) AS total_income_records
      FROM ledger_income
      GROUP BY office_id;
    `);
    const incomeMap = new Map(incomeSums.map(i => [i.office_id, i]));

    // Sums for advances, expenses, loan_transactions, advance_transactions for all offices
    const [advancesSums] = await pool.query(`
      SELECT
    office_id,
    COALESCE(SUM(amount), 0) AS total_advances
FROM advances
WHERE status IN ('approved', 'closed')
  AND date_approved >= '2025-01-04'
GROUP BY office_id;
    `)
    const advancesMap = new Map(advancesSums.map((a) => [a.office_id, a]))

    const [expensesSums] = await pool.query(`
      SELECT
          office_id,
          COALESCE(SUM(amount), 0) AS total_expenses
      FROM expenses
      WHERE status = 'approved' AND date >= '2025-01-04'
      GROUP BY office_id;
    `)
    const expensesMap = new Map(expensesSums.map((e) => [e.office_id, e]))

    const [loanTxnSums] = await pool.query(`
      SELECT
    office_id,
    COALESCE(SUM(CASE WHEN transaction_type = 'disbursement' AND created_at >= '2025-01-04' THEN debit ELSE 0 END), 0) AS total_new_loans,
    COALESCE(SUM(credit), 0) AS total_loan_collected
  FROM loan_transactions
  WHERE office_id IN (SELECT id FROM offices) 
    AND date >= '2025-01-04'
    AND payment_apply_to IN ('full_payment', 'part_payment', 'reloan_payment')
  GROUP BY office_id;
`)
    const loanTxnMap = new Map(loanTxnSums.map((l) => [l.office_id, l]))

    const [advanceTxnSums] = await pool.query(`
      SELECT
          a.office_id,
          COALESCE(SUM(at.amount_paid), 0) AS total_advances_paid_back
      FROM advance_transactions at
      JOIN advances a ON at.advance_id = a.id
      WHERE at.created_at >= '2025-01-04'
      GROUP BY a.office_id;
    `)
    const advanceTxnMap = new Map(advanceTxnSums.map((at) => [at.office_id, at]))

    for (const office of offices) {
      const ledger = ledgerMap.get(office.id) || {}
      const income = incomeMap.get(office.id) || {};
      const advances = advancesMap.get(office.id) || {}
      const expenses = expensesMap.get(office.id) || {}
      const loanTxn = loanTxnMap.get(office.id) || {}
      const advanceTxn = advanceTxnMap.get(office.id) || {}

      const initialCashBalance = Number(ledger.cash_balance || 0)
      //const totalIncome = Number(ledger.total_income || 0)
      const totalAdvances = Number(advances.total_advances || 0)
      const totalExpenses = Number(expenses.total_expenses || 0)
      const newLoans = Number(loanTxn.total_new_loans || 0)
      const advancesPaidBack = Number(advanceTxn.total_advances_paid_back || 0)
      const loanCollected = Number(loanTxn.total_loan_collected || 0)
      const historicalIncome = Number(ledger.total_income || 0);
      const incomeRecordsTotal = Number(income.total_income_records || 0);
      const totalIncome = historicalIncome + incomeRecordsTotal;

      const calculatedInflows = totalIncome + advancesPaidBack + loanCollected
      const calculatedOutflows = totalAdvances + totalExpenses + newLoans
      const calculatedCashBalance = initialCashBalance + calculatedInflows - calculatedOutflows

      officeSummaries.push({
        id: office.id,
        name: office.name,
        cashBalance: calculatedCashBalance,
        income: totalIncome, 
        expenses: totalExpenses,
        totalInflows: calculatedInflows,
        totalOutflows: calculatedOutflows,
        initialCashBalance: initialCashBalance,
        advances: totalAdvances,
        newLoans: newLoans,
        advancesPaidBack: advancesPaidBack,
        loanCollected: loanCollected,
        historicalIncome: historicalIncome, // Optional for debugging
        incomeRecordsTotal: incomeRecordsTotal,
      })
    }

    res.json({ success: true, offices: officeSummaries })
  } catch (err) {
    console.error("Error in /offices-summary:", err.stack || err)
    res.status(500).json({
      error: "Server error",
      details: err.message,
    })
  }
})




// Policies endpoints
app.get("/policies", async (req, res) => {
  try {
    const { policy_type, document_type, start_date, end_date } = req.query
    
    
    const dateFilter = start_date && end_date ? ' AND created_at BETWEEN ? AND ?' : ''
    
    
    const policyTypeFilter = policy_type && policy_type !== 'all' ? ' AND policy_type = ?' : ''
    
    
    const documentTypeFilter = document_type && document_type !== 'all' ? ' AND document_type = ?' : ''
    
    let query = `
      SELECT 
        id,
        title,
        description,
        file_path,
        file_url,
        file_name,
        file_size,
        file_type,
        policy_type,
        document_type,
        created_at,
        updated_at
      FROM policies 
      WHERE 1=1
    `
    const params = []
    
    if (policy_type && policy_type !== 'all') {
      query += policyTypeFilter
      params.push(policy_type)
    }
    
    if (document_type && document_type !== 'all') {
      query += documentTypeFilter
      params.push(document_type)
    }
    
    if (start_date && end_date) {
      query += dateFilter
      params.push(start_date, end_date + ' 23:59:59') // Include entire end date
    }
    
    query += ' ORDER BY created_at DESC'
    
    const [rows] = await pool.query(query, params)
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    })
  } catch (error) {
    console.error('Error fetching policies:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch policies",
      error: error.message,
    })
  }
})

// Policy upload endpoint
app.post("/policies", polupload.single('policy_file'), async (req, res) => {
  try {
 
    const { title, description, policy_type, document_type } = req.body
    const file = req.file
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No policy file was uploaded.'
      })
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.'
      })
    }
    
    
    const originalName = file.originalname.replace(/\.[^/.]+$/, "") // Remove extension
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9\-]/g, '')
    const fileName = `policies/${sanitizedName}_${Date.now()}.${file.originalname.split('.').pop()}`
    
    const uploadParams = {
      Bucket: process.env.DO_SPACES_BUCKET || 'wfspolicies',
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    }
    
    const command = new PutObjectCommand(uploadParams)
    await s3Client1.send(command)
    
    
    const fileUrl = `https://${uploadParams.Bucket}.${process.env.DO_SPACES_REGION || 'nyc3'}.digitaloceanspaces.com/${fileName}`
    
    // Save to database
    const [result] = await pool.query(
      `INSERT INTO policies (title, description, file_path, file_url, file_name, file_size, file_type, policy_type, document_type, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, description, fileName, fileUrl, file.originalname, file.size, file.mimetype, policy_type || 'all_staff', document_type || 'company_policies']
    )
    
    res.status(200).json({ 
      success: true, 
      message: 'Document uploaded successfully',
      policy_id: result.insertId
    })
    
  } catch (error) {
    console.error('Document upload error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to upload document' 
    })
  }
})

// Get single policy by ID
app.get("/policies/:id", async (req, res) => {
  try {
    const { id } = req.params
    
    const [rows] = await pool.query(
      `SELECT * FROM policies WHERE id = ?`,
      [id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Policy not found"
      })
    }
    
    res.status(200).json({
      success: true,
      data: rows[0]
    })
  } catch (error) {
    console.error('Error fetching policy:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch policy",
      error: error.message,
    })
  }
})

// Delete policy
app.delete("/policies/:id", async (req, res) => {
  try {
    const { id } = req.params
    
    const [policyRows] = await pool.query(
      `SELECT * FROM policies WHERE id = ?`,
      [id]
    )
    
    if (policyRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Policy not found"
      })
    }
    
    const policy = policyRows[0]
    
    
    try {
      const deleteParams = {
        Bucket: process.env.DO_SPACES_BUCKET || 'wfspolicies',
        Key: policy.file_path,
      }
      await s3Client1.send(new DeleteObjectCommand(deleteParams))
    } catch (s3Error) {
      console.error('Error deleting file from S3:', s3Error)
      
    }
    
    
    const [result] = await pool.query(
      `DELETE FROM policies WHERE id = ?`,
      [id]
    )
    
    res.status(200).json({ 
      success: true, 
      message: 'Policy deleted successfully'
    })
    
  } catch (error) {
    console.error('Policy deletion error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to delete policy' 
    })
  }
})

app.get("/individual-clients/details", async (req, res) => {
  try {
    const staffId = req.query.staff_id;
    const category = req.query.category;
    
    let query = "";
    let queryParams = [staffId];
    
    if (category === 'total') {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) AS name,
          c.status,
          COUNT(l.id) AS loanCount,
          COALESCE(SUM(l.principal), 0) AS totalBorrowed,
          MAX(l.disbursement_date) AS lastLoanDate
        FROM clients c
        LEFT JOIN loans l ON c.id = l.client_id
        WHERE c.loan_officer_id = ? 
          AND c.status = 'active' 
          AND c.deleted_at IS NULL
        GROUP BY c.id
        ORDER BY lastLoanDate DESC
      `;
    } else if (category === 'returning') {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) AS name,
          c.status,
          COUNT(l.id) AS loanCount,
          COALESCE(SUM(l.principal), 0) AS totalBorrowed,
          MAX(l.disbursement_date) AS lastLoanDate
        FROM clients c
        JOIN loans l ON c.id = l.client_id
        WHERE c.loan_officer_id = ? 
          AND c.status = 'active' 
          AND c.deleted_at IS NULL
          AND l.status IN ('approved', 'closed', 'disbursed')
        GROUP BY c.id
        HAVING COUNT(l.id) > 1
        ORDER BY lastLoanDate DESC
      `;
    } else if (category === 'loyal') {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) AS name,
          c.status,
          COUNT(l.id) AS loanCount,
          COALESCE(SUM(l.principal), 0) AS totalBorrowed,
          MAX(l.disbursement_date) AS lastLoanDate
        FROM clients c
        JOIN loans l ON c.id = l.client_id
        WHERE c.loan_officer_id = ? 
          AND c.status = 'active' 
          AND c.deleted_at IS NULL
          AND l.status IN ('approved', 'closed', 'disbursed')
        GROUP BY c.id
        HAVING COUNT(l.id) > 5
        ORDER BY lastLoanDate DESC
      `;
    } else if (category === 'loans') {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) AS name,
          c.status,
          l.id AS loan_id,
          l.principal,
          l.disbursement_date,
          l.status AS loan_status
        FROM clients c
        JOIN loans l ON c.id = l.client_id
        WHERE c.loan_officer_id = ? 
          AND c.status = 'active' 
          AND c.deleted_at IS NULL
          AND l.status IN ('approved', 'disbursed')
        ORDER BY name, l.disbursement_date DESC
      `;
    }

    const [results] = await pool.query(query, queryParams);
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching client details:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client details",
      error: error.message,
    });
  }
});

app.get("/individual-metrics/office-dashboard", async (req, res) => {
  try {
    const staffId = req.query.staff_id;
    
    const [results] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE staff_id = ? AND status = 'active' AND deleted_at IS NULL) AS active_clients,
        
        (SELECT COUNT(*) FROM (
          SELECT client_id 
          FROM loans 
          WHERE loan_officer_id = ? AND status IN ('closed', 'approved', 'disbursed')
          GROUP BY client_id 
          HAVING COUNT(*) > 1
        ) AS rc) AS returning_clients,
        
        (SELECT COUNT(*) FROM (
          SELECT client_id 
          FROM loans 
          WHERE loan_officer_id = ? AND status IN ('closed', 'approved', 'disbursed')
          GROUP BY client_id 
          HAVING COUNT(*) > 5
        ) AS lc) AS loyal_clients,
        
        (SELECT ROUND(AVG(principal), 2) 
         FROM loans 
         WHERE loan_officer_id = ? 
         AND status IN ('closed', 'approved', 'disbursed')
         AND principal IS NOT NULL
         AND principal > 0) AS average_loan_amount
    `, [staffId, staffId, staffId, staffId]);
    
    const metrics = results[0];
    
    res.status(200).json({
      success: true,
      data: {
        total: metrics.active_clients,
        returning: metrics.returning_clients,
        loyal: metrics.loyal_clients,
        averageLoanAmount: metrics.average_loan_amount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching staff dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff dashboard metrics",
      error: error.message,
    });
  }
});

app.get("/individual-metrics/office-workplace-distribution", async (req, res) => {
  try {
    const staffId = req.query.staff_id;
    
    const [rows] = await pool.query(`
      WITH workplace_stats AS (
        SELECT 
          COALESCE(working_place, 'Unknown') AS workplace,
          COUNT(*) AS count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM clients WHERE staff_id = ? AND status = 'active' AND deleted_at IS NULL)), 1) AS percentage
        FROM clients 
        WHERE staff_id = ? 
          AND status = 'active' 
          AND deleted_at IS NULL
        GROUP BY working_place
      )
      SELECT 
        CASE 
          WHEN percentage >= 0.5 THEN workplace
          ELSE 'Other'
        END AS workplace,
        SUM(count) AS count,
        SUM(percentage) AS percentage
      FROM workplace_stats
      GROUP BY 
        CASE 
          WHEN percentage >= 0.5 THEN workplace
          ELSE 'Other'
        END
      ORDER BY count DESC
    `, [staffId, staffId]);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching staff workplace distribution:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff workplace distribution",
      error: error.message,
    });
  }
});

app.get("/individual-metrics/office-age-demographics", async (req, res) => {
  try {
    const staffId = req.query.staff_id;
    
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 36 AND 45 THEN '36-45'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 46 AND 55 THEN '46-55'
          ELSE '56+'
        END AS age_group,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) AS male,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) AS female
      FROM clients 
      WHERE staff_id = ? 
        AND status = 'active' 
        AND deleted_at IS NULL
        AND dob IS NOT NULL
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN '18-25' THEN 1
          WHEN '26-35' THEN 2
          WHEN '36-45' THEN 3
          WHEN '46-55' THEN 4
          ELSE 5
        END
    `, [staffId]);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching staff age demographics:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff age demographics",
      error: error.message,
    });
  }
});

app.get("/individual-metrics/office-gender-distribution", async (req, res) => {
  try {
    const staffId = req.query.staff_id;
    
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN gender = 'male' THEN 'Male'
          WHEN gender = 'female' THEN 'Female'
          ELSE 'Other/Unknown'
        END AS name,
        COUNT(*) AS value
      FROM clients 
      WHERE staff_id = ? 
        AND status = 'active' 
        AND deleted_at IS NULL
      GROUP BY 
        CASE 
          WHEN gender = 'male' THEN 'Male'
          WHEN gender = 'female' THEN 'Female'
          ELSE 'Other/Unknown'
        END
      ORDER BY value DESC
    `, [staffId]);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching staff gender distribution:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff gender distribution",
      error: error.message,
    });
  }
});


app.get("/individual-metrics/office-loan-disbursement", async (req, res) => {
  try {
    const loanOfficerId = req.query.loan_officer_id;
    
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(disbursement_date, '%b') AS month,
        SUM(principal) AS amount,
        COUNT(DISTINCT client_id) AS clients
      FROM loans 
      WHERE loan_officer_id = ? 
        AND status IN ('closed', 'approved', 'disbursed')
        AND disbursement_date IS NOT NULL
        AND YEAR(disbursement_date) = YEAR(CURDATE()) 
      GROUP BY DATE_FORMAT(disbursement_date, '%b'), MONTH(disbursement_date)
      ORDER BY MONTH(disbursement_date)
    `, [loanOfficerId]);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching loan officer loan disbursement data:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan officer loan disbursement data",
      error: error.message,
    });
  }
});

app.get("/individual-metrics/office-performance", async (req, res) => {
  try {
    const loanOfficerId = req.query.loan_officer_id;
    
    const [rows] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM loans WHERE loan_officer_id = ? AND status = 'active') AS activeLoans,
        (SELECT SUM(principal) FROM loans WHERE loan_officer_id = ? AND status = 'active') AS totalPortfolio,
        (SELECT COUNT(*) FROM loans WHERE loan_officer_id = ? AND status = 'default') AS defaultedLoans,
        (SELECT ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM loans WHERE loan_officer_id = ? AND status = 'active')), 1) 
         FROM loans WHERE loan_officer_id = ? AND status = 'default') AS defaultRate,
        (SELECT ROUND(AVG(DATEDIFF(disbursement_date, approved_date)), 1) 
         FROM loans WHERE loan_officer_id = ? AND disbursement_date IS NOT NULL) AS processingTime
    `, [loanOfficerId, loanOfficerId, loanOfficerId, loanOfficerId, loanOfficerId, loanOfficerId]);
    
    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching loan officer performance data:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan officer performance data",
      error: error.message,
    });
  }
});

app.get("/individual-metrics/office-loan-status", async (req, res) => {
  try {
    const loanOfficerId = req.query.loan_officer_id;
    
    const [rows] = await pool.query(`
      SELECT 
        status AS name,
        COUNT(*) AS value
      FROM loans 
      WHERE loan_officer_id = ?
      GROUP BY status
      ORDER BY value DESC
    `, [loanOfficerId]);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching loan officer loan status data:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan officer loan status data",
      error: error.message,
    });
  }
});


app.get("/individual-metrics/office-top-loans", async (req, res) => {
  try {
    const loanOfficerId = req.query.loan_officer_id;

    const [rows] = await pool.query(`
      SELECT 
        l.id,
        l.principal,
        l.status,
        l.disbursement_date,
        CONCAT(c.first_name, ' ', c.last_name) AS client_name
      FROM loans l
      JOIN clients c ON l.client_id = c.id
      WHERE 
        l.loan_officer_id = ? 
        AND l.status IN ('active', 'disbursed')
        AND l.principal > 4000
      ORDER BY l.disbursement_date DESC
      LIMIT 20
    `, [loanOfficerId]);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching loan officer top loans data:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan officer top loans data",
      error: error.message,
    });
  }
});









app.get("/province-metrics/dashboard", async (req, res) => {
  try {
    const { province_id } = req.query;
    if (!province_id) {
      return res.status(400).json({ success: false, message: "province_id is required" });
    }

    const [results] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) 
         FROM clients c 
         JOIN offices o ON c.office_id = o.id
         WHERE c.status = 'active' 
         AND c.deleted_at IS NULL
         AND o.province_id = ?) as active_clients,

        (SELECT COUNT(*) FROM (
          SELECT c.client_id 
          FROM loans c
          JOIN offices o2 ON c.office_id = o2.id
          WHERE c.status IN ('closed', 'approved', 'disbursed')
          AND o2.province_id = ?
          GROUP BY c.client_id 
          HAVING COUNT(*) > 1
        ) as rc) as returning_clients,

        (SELECT COUNT(*) FROM (
          SELECT c.client_id 
          FROM loans c
          JOIN offices o3 ON c.office_id = o3.id
          WHERE c.status IN ('closed', 'approved', 'disbursed')
          AND o3.province_id = ?
          GROUP BY c.client_id 
          HAVING COUNT(*) > 3
        ) as lc) as loyal_clients,

        (SELECT ROUND(AVG(c.principal), 2) 
         FROM loans c
         JOIN offices o4 ON c.office_id = o4.id
         WHERE c.status IN ('closed', 'approved', 'disbursed')
         AND o4.province_id = ?
         AND c.principal IS NOT NULL
         AND c.principal > 0) as average_loan_amount
    `, [province_id, province_id, province_id, province_id]);

    const metrics = results[0];

    res.status(200).json({
      success: true,
      data: {
        total: metrics.active_clients,
        returning: metrics.returning_clients,
        loyal: metrics.loyal_clients,
        averageLoanAmount: metrics.average_loan_amount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard metrics",
      error: error.message,
    });
  }
});


app.get("/province-metrics/office-dashboard", async (req, res) => {
  try {
    console.log()
    const officeIds = req.query.office_id
      ? req.query.office_id.split(",").map((id) => parseInt(id.trim()))
      : [];

    if (!officeIds.length) {
      return res.status(400).json({ success: false, message: "office_ids parameter required" });
    }

    const placeholders = officeIds.map(() => "?").join(",");

    const [results] = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE office_id IN (${placeholders}) AND status = 'active' AND deleted_at IS NULL) as active_clients,
        (SELECT COUNT(*) FROM (
          SELECT client_id FROM loans 
          WHERE office_id IN (${placeholders}) AND status IN ('closed', 'approved', 'disbursed')
          GROUP BY client_id HAVING COUNT(*) > 1
        ) as rc) as returning_clients,
        (SELECT COUNT(*) FROM (
          SELECT client_id FROM loans 
          WHERE office_id IN (${placeholders}) AND status IN ('closed', 'approved', 'disbursed')
          GROUP BY client_id HAVING COUNT(*) > 5
        ) as lc) as loyal_clients,
        (SELECT ROUND(AVG(principal), 2) 
         FROM loans 
         WHERE office_id IN (${placeholders}) AND status IN ('closed', 'approved', 'disbursed')
         AND principal IS NOT NULL AND principal > 0) as average_loan_amount
    `,
      [...officeIds, ...officeIds, ...officeIds, ...officeIds]
    );

    const metrics = results[0];
    res.status(200).json({
      success: true,
      data: {
        total: metrics.active_clients,
        returning: metrics.returning_clients,
        loyal: metrics.loyal_clients,
        averageLoanAmount: metrics.average_loan_amount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching office dashboard metrics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch metrics", error: error.message });
  }
});


app.get("/province-metrics/office-workplace-distribution", async (req, res) => {
  try {
    const officeIds = req.query.office_id
      ? req.query.office_id.split(",").map((id) => parseInt(id.trim()))
      : [];

    if (!officeIds.length) {
      return res.status(400).json({ success: false, message: "office_ids parameter required" });
    }

    const placeholders = officeIds.map(() => "?").join(",");

    const [rows] = await pool.query(
      `
      WITH workplace_stats AS (
        SELECT 
          COALESCE(working_place, 'Unknown') as workplace,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / (
            SELECT COUNT(*) FROM clients 
            WHERE office_id IN (${placeholders}) AND status = 'active' AND deleted_at IS NULL
          )), 1) as percentage
        FROM clients 
        WHERE office_id IN (${placeholders}) 
          AND status = 'active' AND deleted_at IS NULL
        GROUP BY working_place
      )
      SELECT 
        CASE WHEN percentage >= 0.5 THEN workplace ELSE 'Other' END as workplace,
        SUM(count) as count,
        SUM(percentage) as percentage
      FROM workplace_stats
      GROUP BY CASE WHEN percentage >= 0.5 THEN workplace ELSE 'Other' END
      ORDER BY count DESC
    `,
      [...officeIds, ...officeIds]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching workplace distribution:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data", error: error.message });
  }
});


app.get("/province-metrics/office-age-demographics", async (req, res) => {
  try {
    const officeIds = req.query.office_id
      ? req.query.office_id.split(",").map((id) => parseInt(id.trim()))
      : [];

    if (!officeIds.length) {
      return res.status(400).json({ success: false, message: "office_ids parameter required" });
    }

    const placeholders = officeIds.map(() => "?").join(",");

    const [rows] = await pool.query(
      `
      SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 36 AND 45 THEN '36-45'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 46 AND 55 THEN '46-55'
          ELSE '56+'
        END as age_group,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female
      FROM clients 
      WHERE office_id IN (${placeholders}) 
        AND status = 'active' AND deleted_at IS NULL AND dob IS NOT NULL
      GROUP BY age_group
      ORDER BY FIELD(age_group, '18-25','26-35','36-45','46-55','56+')
    `,
      officeIds
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching age demographics:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data", error: error.message });
  }
});


app.get("/province-metrics/office-gender-distribution", async (req, res) => {
  try {
    const officeIds = req.query.office_id
      ? req.query.office_id.split(",").map((id) => parseInt(id.trim()))
      : [];

    if (!officeIds.length) {
      return res.status(400).json({ success: false, message: "office_ids parameter required" });
    }

    const placeholders = officeIds.map(() => "?").join(",");

    const [rows] = await pool.query(
      `
      SELECT 
        CASE 
          WHEN gender = 'male' THEN 'Male'
          WHEN gender = 'female' THEN 'Female'
          ELSE 'Other/Unknown'
        END as name,
        COUNT(*) as value
      FROM clients 
      WHERE office_id IN (${placeholders})
        AND status = 'active' AND deleted_at IS NULL
      GROUP BY name
      ORDER BY value DESC
    `,
      officeIds
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching gender distribution:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data", error: error.message });
  }
});


app.get("/province-metrics/office-loan-disbursement", async (req, res) => {
  try {
    const officeIds = req.query.office_id
      ? req.query.office_id.split(",").map((id) => parseInt(id.trim()))
      : [];

    if (!officeIds.length) {
      return res.status(400).json({ success: false, message: "office_ids parameter required" });
    }

    const placeholders = officeIds.map(() => "?").join(",");

    const [rows] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(disbursement_date, '%b') as month,
        SUM(principal) as amount,
        COUNT(DISTINCT client_id) as clients
      FROM loans 
      WHERE office_id IN (${placeholders}) 
        AND status IN ('closed', 'approved', 'disbursed')
        AND disbursement_date IS NOT NULL
        AND YEAR(disbursement_date) = YEAR(CURDATE())
      GROUP BY MONTH(disbursement_date), DATE_FORMAT(disbursement_date, '%b')
      ORDER BY MONTH(disbursement_date)
    `,
      officeIds
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching loan disbursement data:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data", error: error.message });
  }
});


app.get("/province-metrics/office-performance", async (req, res) => {
  try {
    const officeIds = req.query.office_id
      ? req.query.office_id.split(",").map((id) => parseInt(id.trim()))
      : [];

    if (!officeIds.length) {
      return res.status(400).json({ success: false, message: "office_ids parameter required" });
    }

    const placeholders = officeIds.map(() => "?").join(",");

    const [rows] = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM loans WHERE office_id IN (${placeholders}) AND status = 'active') as activeLoans,
        (SELECT SUM(principal) FROM loans WHERE office_id IN (${placeholders}) AND status = 'active') as totalPortfolio,
        (SELECT COUNT(*) FROM loans WHERE office_id IN (${placeholders}) AND status = 'default') as defaultedLoans,
        (SELECT ROUND(
          (COUNT(*) * 100.0 / 
           (SELECT COUNT(*) FROM loans WHERE office_id IN (${placeholders}) AND status = 'active')), 1
         ) FROM loans WHERE office_id IN (${placeholders}) AND status = 'default') as defaultRate,
        (SELECT ROUND(AVG(DATEDIFF(disbursement_date, approved_date)), 1)
         FROM loans WHERE office_id IN (${placeholders}) AND disbursement_date IS NOT NULL) as processingTime
    `,
      [...officeIds, ...officeIds, ...officeIds, ...officeIds, ...officeIds, ...officeIds]
    );

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching office performance:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data", error: error.message });
  }
});


app.get("/province-metrics/office-loan-status", async (req, res) => {
  try {
    const officeIds = req.query.office_id
      ? req.query.office_id.split(",").map((id) => parseInt(id.trim()))
      : [];

    if (!officeIds.length) {
      return res.status(400).json({ success: false, message: "office_ids parameter required" });
    }

    const placeholders = officeIds.map(() => "?").join(",");

    const [rows] = await pool.query(
      `
      SELECT status as name, COUNT(*) as value
      FROM loans 
      WHERE office_id IN (${placeholders})
      GROUP BY status
      ORDER BY value DESC
    `,
      officeIds
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching loan status:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data", error: error.message });
  }
});


app.get("/province-metrics/office-top-loans", async (req, res) => {
  try {
    const officeIds = req.query.office_id
      ? req.query.office_id.split(",").map((id) => parseInt(id.trim()))
      : [];

    if (!officeIds.length) {
      return res.status(400).json({ success: false, message: "office_ids parameter required" });
    }

    const placeholders = officeIds.map(() => "?").join(",");

    const [rows] = await pool.query(
      `
      SELECT 
        l.id,
        l.principal,
        l.status,
        l.disbursement_date,
        CONCAT(c.first_name, ' ', c.last_name) AS client_name
      FROM loans l
      JOIN clients c ON l.client_id = c.id
      WHERE l.office_id IN (${placeholders})
        AND l.status IN ('active', 'disbursed')
        AND l.principal > 4000
      ORDER BY l.disbursement_date DESC
      LIMIT 20
    `,
      officeIds
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching top loans:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data", error: error.message });
  }
});




//analytics dashboard
app.get("/metrics/dashboard", async (req, res) => {
  try {
    const [results] = await pool.query(`
      
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE status = 'active' AND deleted_at IS NULL) as active_clients,
        
        
        (SELECT COUNT(*) FROM (
          SELECT client_id 
          FROM loans 
          WHERE status IN ('closed', 'approved', 'disbursed')
          GROUP BY client_id 
          HAVING COUNT(*) > 1
        ) as rc) as returning_clients,
        
        
        (SELECT COUNT(*) FROM (
          SELECT client_id 
          FROM loans 
          WHERE status IN ('closed', 'approved', 'disbursed')
          GROUP BY client_id 
          HAVING COUNT(*) > 3
        ) as lc) as loyal_clients,
        
        
        (SELECT ROUND(AVG(principal), 2) 
         FROM loans 
         WHERE status IN ('closed', 'approved', 'disbursed')
         AND principal IS NOT NULL
         AND principal > 0) as average_loan_amount
    `)
    
    const metrics = results[0]
    
    res.status(200).json({
      success: true,
      data: {
        total: metrics.active_clients,
        returning: metrics.returning_clients,
        loyal: metrics.loyal_clients,
        averageLoanAmount: metrics.average_loan_amount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard metrics",
      error: error.message,
    })
  }
})

// workplace-distribution get all by workplace even the wrongly spelt ones
app.get("/metrics/workplace-distribution", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      WITH workplace_stats AS (
        SELECT 
          COALESCE(working_place, 'Unknown') as workplace,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM clients WHERE status = 'active' AND deleted_at IS NULL)), 1) as percentage
        FROM clients 
        WHERE status = 'active' 
        AND deleted_at IS NULL
        GROUP BY working_place
      )
      SELECT 
        CASE 
          WHEN percentage >= 0.5 THEN workplace
          ELSE 'Other'
        END as workplace,
        SUM(count) as count,
        SUM(percentage) as percentage
      FROM workplace_stats
      GROUP BY 
        CASE 
          WHEN percentage >= 0.5 THEN workplace
          ELSE 'Other'
        END
      ORDER BY count DESC
    `)
    
    res.status(200).json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error fetching workplace distribution:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch workplace distribution",
      error: error.message,
    })
  }
})

//admin client age demo
app.get("/metrics/age-demographics", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 36 AND 45 THEN '36-45'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 46 AND 55 THEN '46-55'
          ELSE '56+'
        END as age_group,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female
      FROM clients 
      WHERE status = 'active' 
      AND deleted_at IS NULL
      AND dob IS NOT NULL
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN '18-25' THEN 1
          WHEN '26-35' THEN 2
          WHEN '36-45' THEN 3
          WHEN '46-55' THEN 4
          ELSE 5
        END
    `)
    
    res.status(200).json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error fetching age demographics:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch age demographics",
      error: error.message,
    })
  }
})

//admin gender distribution 
app.get("/metrics/gender-distribution", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN gender = 'male' THEN 'Male'
          WHEN gender = 'female' THEN 'Female'
          ELSE 'Other/Unknown'
        END as name,
        COUNT(*) as value
      FROM clients 
      WHERE status = 'active' 
      AND deleted_at IS NULL
      GROUP BY 
        CASE 
          WHEN gender = 'male' THEN 'Male'
          WHEN gender = 'female' THEN 'Female'
          ELSE 'Other/Unknown'
        END
      ORDER BY value DESC
    `)
    
    res.status(200).json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error fetching gender distribution:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch gender distribution",
      error: error.message,
    })
  }
})


//admin loan disbursement monthly pattern
app.get("/metrics/loan-disbursement", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(disbursement_date, '%b') as month,
        SUM(principal) as amount,
        COUNT(DISTINCT client_id) as clients
      FROM loans 
      WHERE status IN ('closed', 'approved', 'disbursed')
        AND disbursement_date IS NOT NULL
        AND YEAR(disbursement_date) = YEAR(CURDATE()) 
      GROUP BY DATE_FORMAT(disbursement_date, '%b'), MONTH(disbursement_date)
      ORDER BY MONTH(disbursement_date)
    `)
    
    res.status(200).json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error fetching loan disbursement data:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan disbursement data",
      error: error.message,
    })
  }
})

// admin client count
app.get("/metrics/office-clients", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        o.id as office_id, 
        o.name as office_name,
        COUNT(c.id) as client_count
      FROM offices o
      LEFT JOIN clients c ON o.id = c.office_id
      WHERE o.active = 1 AND c.status = 'active'
      GROUP BY o.id, o.name
      ORDER BY client_count DESC
    `);
    
    res.json({
      success: true,
      data: rows.map(row => ({
        office_id: row.office_id,
        office_name: row.office_name,
        count: row.client_count
      }))
    });
  } catch (err) {
    console.error("Error fetching office client data:", err);
    res.status(500).json({
      error: true,
      message: "Failed to fetch office client data",
      details: err.message,
    });
  }
});

//manager analytics dashboard
app.get("/metrics/office-dashboard", async (req, res) => {
  try {
    const officeId = req.query.office_id;
    
    const [results] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE office_id = ? AND status = 'active' AND deleted_at IS NULL) as active_clients,
        
        (SELECT COUNT(*) FROM (
          SELECT client_id 
          FROM loans 
          WHERE office_id = ? AND status IN ('closed', 'approved', 'disbursed')
          GROUP BY client_id 
          HAVING COUNT(*) > 1
        ) as rc) as returning_clients,
        
        (SELECT COUNT(*) FROM (
          SELECT client_id 
          FROM loans 
          WHERE office_id = ? AND status IN ('closed', 'approved', 'disbursed')
          GROUP BY client_id 
          HAVING COUNT(*) > 5
        ) as lc) as loyal_clients,
        
        (SELECT ROUND(AVG(principal), 2) 
         FROM loans 
         WHERE office_id = ? AND status IN ('closed', 'approved', 'disbursed')
         AND principal IS NOT NULL
         AND principal > 0) as average_loan_amount
    `, [officeId, officeId, officeId, officeId])
    
    const metrics = results[0]
    
    res.status(200).json({
      success: true,
      data: {
        total: metrics.active_clients,
        returning: metrics.returning_clients,
        loyal: metrics.loyal_clients,
        averageLoanAmount: metrics.average_loan_amount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching office dashboard metrics:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch office dashboard metrics",
      error: error.message,
    })
  }
})

app.get("/province-clients/details", async (req, res) => {
  try {
    const officeIds = req.query.office_ids
      ? req.query.office_ids.split(",").map((id) => parseInt(id.trim()))
      : [];
    const category = req.query.category;

    if (!officeIds.length) {
      return res.status(400).json({
        success: false,
        message: "office_ids query parameter is required (comma-separated IDs)",
      });
    }

    let query = "";
    let queryParams = officeIds;

    // build a dynamic placeholder string for IN clause
    const placeholders = officeIds.map(() => "?").join(",");

    if (category === "total") {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) AS name,
          c.status,
          COUNT(l.id) AS loanCount,
          COALESCE(SUM(l.principal), 0) AS totalBorrowed,
          MAX(l.disbursement_date) AS lastLoanDate
        FROM clients c
        LEFT JOIN loans l ON c.id = l.client_id
        WHERE c.office_id IN (${placeholders})
          AND c.status = 'active'
          AND c.deleted_at IS NULL
        GROUP BY c.id
        ORDER BY lastLoanDate DESC
      `;
    } else if (category === "returning") {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) AS name,
          c.status,
          COUNT(l.id) AS loanCount,
          COALESCE(SUM(l.principal), 0) AS totalBorrowed,
          MAX(l.disbursement_date) AS lastLoanDate
        FROM clients c
        JOIN loans l ON c.id = l.client_id
        WHERE c.office_id IN (${placeholders})
          AND c.status = 'active'
          AND c.deleted_at IS NULL
          AND l.status IN ('approved', 'closed', 'disbursed')
        GROUP BY c.id
        HAVING COUNT(l.id) > 1
        ORDER BY lastLoanDate DESC
      `;
    } else if (category === "loyal") {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) AS name,
          c.status,
          COUNT(l.id) AS loanCount,
          COALESCE(SUM(l.principal), 0) AS totalBorrowed,
          MAX(l.disbursement_date) AS lastLoanDate
        FROM clients c
        JOIN loans l ON c.id = l.client_id
        WHERE c.office_id IN (${placeholders})
          AND c.status = 'active'
          AND c.deleted_at IS NULL
          AND l.status IN ('approved', 'closed', 'disbursed')
        GROUP BY c.id
        HAVING COUNT(l.id) > 5
        ORDER BY lastLoanDate DESC
      `;
    } else if (category === "loans") {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) AS name,
          c.status,
          l.id AS loan_id,
          l.principal,
          l.disbursement_date,
          l.status AS loan_status
        FROM clients c
        JOIN loans l ON c.id = l.client_id
        WHERE c.office_id IN (${placeholders})
          AND c.status = 'active'
          AND c.deleted_at IS NULL
          AND l.status IN ('approved', 'disbursed')
        ORDER BY name, l.disbursement_date DESC
      `;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid category specified",
      });
    }

    const [results] = await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching client details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client details",
      error: error.message,
    });
  }
});


//get client details, for returning, loyal etc
app.get("/clients/details", async (req, res) => {
  try {
    const officeId = req.query.office_id;
    const category = req.query.category;
    
    let query = "";
    let queryParams = [officeId];
    
    if (category === 'total') {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) as name,
          c.status,
          COUNT(l.id) as loanCount,
          COALESCE(SUM(l.principal), 0) as totalBorrowed,
          MAX(l.disbursement_date) as lastLoanDate
        FROM clients c
        LEFT JOIN loans l ON c.id = l.client_id
        WHERE c.office_id = ? AND c.status = 'active' AND c.deleted_at IS NULL
        GROUP BY c.id
        ORDER BY lastLoanDate DESC
      `;
    } else if (category === 'returning') {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) as name,
          c.status,
          COUNT(l.id) as loanCount,
          COALESCE(SUM(l.principal), 0) as totalBorrowed,
          MAX(l.disbursement_date) as lastLoanDate
        FROM clients c
        JOIN loans l ON c.id = l.client_id
        WHERE c.office_id = ? 
          AND c.status = 'active' 
          AND c.deleted_at IS NULL
          AND l.status IN ('approved', 'closed', 'disbursed')
        GROUP BY c.id
        HAVING COUNT(l.id) > 1
        ORDER BY lastLoanDate DESC
      `;
    } else if (category === 'loyal') {
      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) as name,
          c.status,
          COUNT(l.id) as loanCount,
          COALESCE(SUM(l.principal), 0) as totalBorrowed,
          MAX(l.disbursement_date) as lastLoanDate
        FROM clients c
        JOIN loans l ON c.id = l.client_id
        WHERE c.office_id = ? 
          AND c.status = 'active' 
          AND c.deleted_at IS NULL
          AND l.status IN ('approved', 'closed', 'disbursed')
        GROUP BY c.id
        HAVING COUNT(l.id) > 5
        ORDER BY lastLoanDate DESC
      `;
    } else if (category === 'loans') {

      query = `
        SELECT 
          c.id, 
          CONCAT(c.first_name, ' ', COALESCE(c.middle_name, ''), ' ', c.last_name) as name,
          c.status,
          l.id as loan_id,
          l.principal,
          l.disbursement_date,
          l.status as loan_status
        FROM clients c
        JOIN loans l ON c.id = l.client_id
        WHERE c.office_id = ? 
          AND c.status = 'active' 
          AND c.deleted_at IS NULL
          AND l.status IN ('approved', 'disbursed')
        ORDER BY name, l.disbursement_date DESC
      `;
    }
    
    const [results] = await pool.query(query, queryParams);
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching client details:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client details",
      error: error.message,
    });
  }
});




//managers office-workplace-distribution
app.get("/metrics/office-workplace-distribution", async (req, res) => {
  try {
    const officeId = req.query.office_id;
    
    const [rows] = await pool.query(`
      WITH workplace_stats AS (
        SELECT 
          COALESCE(working_place, 'Unknown') as workplace,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM clients WHERE office_id = ? AND status = 'active' AND deleted_at IS NULL)), 1) as percentage
        FROM clients 
        WHERE office_id = ? AND status = 'active' 
        AND deleted_at IS NULL
        GROUP BY working_place
      )
      SELECT 
        CASE 
          WHEN percentage >= 0.5 THEN workplace
          ELSE 'Other'
        END as workplace,
        SUM(count) as count,
        SUM(percentage) as percentage
      FROM workplace_stats
      GROUP BY 
        CASE 
          WHEN percentage >= 0.5 THEN workplace
          ELSE 'Other'
        END
      ORDER BY count DESC
    `, [officeId, officeId])
    
    res.status(200).json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error fetching office workplace distribution:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch office workplace distribution",
      error: error.message,
    })
  }
})

//managers office-age-demographics
app.get("/metrics/office-age-demographics", async (req, res) => {
  try {
    const officeId = req.query.office_id;
    
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 36 AND 45 THEN '36-45'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 46 AND 55 THEN '46-55'
          ELSE '56+'
        END as age_group,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female
      FROM clients 
      WHERE office_id = ? AND status = 'active' 
      AND deleted_at IS NULL
      AND dob IS NOT NULL
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN '18-25' THEN 1
          WHEN '26-35' THEN 2
          WHEN '36-45' THEN 3
          WHEN '46-55' THEN 4
          ELSE 5
        END
    `, [officeId])
    
    res.status(200).json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error fetching office age demographics:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch office age demographics",
      error: error.message,
    })
  }
})

//managers office-gender-distribution
app.get("/metrics/office-gender-distribution", async (req, res) => {
  try {
    const officeId = req.query.office_id;
    
    const [rows] = await pool.query(`
      SELECT 
        CASE 
          WHEN gender = 'male' THEN 'Male'
          WHEN gender = 'female' THEN 'Female'
          ELSE 'Other/Unknown'
        END as name,
        COUNT(*) as value
      FROM clients 
      WHERE office_id = ? AND status = 'active' 
      AND deleted_at IS NULL
      GROUP BY 
        CASE 
          WHEN gender = 'male' THEN 'Male'
          WHEN gender = 'female' THEN 'Female'
          ELSE 'Other/Unknown'
        END
      ORDER BY value DESC
    `, [officeId])
    
    res.status(200).json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error fetching office gender distribution:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch office gender distribution",
      error: error.message,
    })
  }
})

// managers office-loan-disbursement
app.get("/metrics/office-loan-disbursement", async (req, res) => {
  try {
    const officeId = req.query.office_id;
    
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(disbursement_date, '%b') as month,
        SUM(principal) as amount,
        COUNT(DISTINCT client_id) as clients
      FROM loans 
      WHERE office_id = ? AND status IN ('closed', 'approved', 'disbursed')
      AND disbursement_date IS NOT NULL
      AND YEAR(disbursement_date) = YEAR(CURDATE()) 
      GROUP BY DATE_FORMAT(disbursement_date, '%b'), MONTH(disbursement_date)
      ORDER BY MONTH(disbursement_date)
    `, [officeId])
    
    res.status(200).json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error fetching office loan disbursement data:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch office loan disbursement data",
      error: error.message,
    })
  }
})

// mnagers office-performance
app.get("/metrics/office-performance", async (req, res) => {
  try {
    const officeId = req.query.office_id;
    
    const [rows] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM loans WHERE office_id = ? AND status = 'active') as activeLoans,
        (SELECT SUM(principal) FROM loans WHERE office_id = ? AND status = 'active') as totalPortfolio,
        (SELECT COUNT(*) FROM loans WHERE office_id = ? AND status = 'default') as defaultedLoans,
        (SELECT ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM loans WHERE office_id = ? AND status = 'active')), 1) 
         FROM loans WHERE office_id = ? AND status = 'default') as defaultRate,
        (SELECT ROUND(AVG(DATEDIFF(disbursement_date, approved_date)), 1) 
         FROM loans WHERE office_id = ? AND disbursement_date IS NOT NULL) as processingTime
    `, [officeId, officeId, officeId, officeId, officeId, officeId])
    
    res.status(200).json({
      success: true,
      data: rows[0]
    })
  } catch (error) {
    console.error('Error fetching office performance data:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch office performance data",
      error: error.message,
    })
  }
})

// managers office-loan-status
app.get("/metrics/office-loan-status", async (req, res) => {
  try {
    const officeId = req.query.office_id;
    
    const [rows] = await pool.query(`
      SELECT 
        status as name,
        COUNT(*) as value
      FROM loans 
      WHERE office_id = ?
      GROUP BY status
      ORDER BY value DESC
    `, [officeId])
    
    res.status(200).json({
      success: true,
      data: rows
    })
  } catch (error) {
    console.error('Error fetching office loan status data:', error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch office loan status data",
      error: error.message,
    })
  }
})

// managers office-top-loans
app.get("/metrics/office-top-loans", async (req, res) => {
  try {
    const officeId = req.query.office_id;

    const [rows] = await pool.query(`
      SELECT 
        l.id,
        l.principal,
        l.status,
        l.disbursement_date,
        CONCAT(c.first_name, ' ', c.last_name) AS client_name
      FROM loans l
      JOIN clients c ON l.client_id = c.id
      WHERE 
        l.office_id = ? 
        AND l.status IN ('active', 'disbursed')
        AND l.principal > 4000
      ORDER BY l.disbursement_date DESC
      LIMIT 20
    `, [officeId]);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching office top loans data:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch office top loans data",
      error: error.message,
    });
  }
});

//using hyphen instead of underscore to not clash
app.get("/office-name/:id", async (req, res) => {
  try {
    const officeId = req.params.id;
    
    const [rows] = await pool.query(`
      SELECT name FROM offices WHERE id = ?
    `, [officeId]);
    
    if (rows.length > 0) {
      res.status(200).json({
        success: true,
        officeName: rows[0].name
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Office not found"
      });
    }
  } catch (error) {
    console.error('Error fetching office name:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch office name",
      error: error.message,
    });
  }
});

// amin endpoint to get client counts by province for map
app.get('/metrics/clients-by-province', async (req, res) => {
  try {
    console.log('Fetching province data...');
    
    const query = `
      SELECT 
        o.province_id,
        p.name as province_name,
        COUNT(c.id) as client_count
      FROM clients c
      JOIN offices o ON c.office_id = o.id
      JOIN province p ON o.province_id = p.id
      GROUP BY o.province_id, p.name
      ORDER BY client_count DESC
    `;
    
    console.log('Executing query:', query);
    
    const result = await pool.query(query);
    
    console.log('Full result structure:', result);
    console.log('Result[0] (actual data):', result[0]);
    console.log('Result[1] (metadata):', result[1]);
    
    // The data is in result[0], not result.rows
    const data = result[0] || [];
    
    console.log('Data to send:', data);
    console.log('Data length:', data.length);
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Error fetching province data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch province data',
      error: error.message
    });
  }
});

// API Data for Employees
app.get('/all/staff', async (req, res) => {
  try {
    const [staff] = await pool.query(`
      SELECT u.* FROM users u
        LEFT JOIN role_users ru ON u.id = ru.user_id
        WHERE ru.role_id IN (1,3,4,6)
        AND u.status = 'Active'
    `);
    res.json(staff);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Pastel formatted staff data
app.get('/pastel/all/staff', async (req, res) => {
  try {
    const [staffData] = await pool.query(`
      SELECT DISTINCT u.* FROM users u
        LEFT JOIN role_users ru ON u.id = ru.user_id
        WHERE ru.role_id IN (1,3,4,6)
        AND u.status = 'Active'
    `);

    const formattedStaff = staffData.map(staff => ({
      "Company": "Whence Financial Services",
      "Employee": staff.id,
      "Title": staff.job_title || null,
      "Initials": staff.first_name ? staff.first_name.charAt(0)+' '+staff.last_name.charAt(0) : null,
      "First name": staff.first_name,
      "Second name": staff.last_name || null,
      "Known as": staff.first_name,
      "Surname": staff.last_name,
      "Id number/Co. No.": staff.id,
      "Date of birth": staff.date_of_birth,
      "Date engaged": staff.hire_date,
      "Date terminated": staff.status !== 'Active' ? null : null, // Assuming no termination date
      "Passport no.": null,
      "Passport country": null,
      "Namibia passport": null,
      "Language": null,
      "Group": null,
      "Gender": staff.gender,
      "Marital status": null, // Not in data
      "Spouse name": null,
      "Home number": staff.phone,
      "Business number": null,
      "Cell number": staff.phone, // Assuming phone is cell
      "Fax number": null,
      "E-mail": staff.email,
      "SOS name": staff.emergency_contact_name,
      "SOS cell": staff.emergency_contact_number,
      "SOS phone": null,
      "Tax office": null,
      "Tax number": null,
      "Tax status": null,
      "Directive %": null,
      "Tax dep": null,
      "Tax year start": null,
      "UIF status": null,
      "OID service periods": null,
      "Job grade": null,
      "Job title code": null,
      "Job title": staff.job_title,
      "Category": staff.employment_type,
      "Regional council": null,
      "Department": staff.department,
      "Paypoint": null,
      "Hrs per period": null,
      "Hours per day": null,
      "Pay method": null,
      "Bank acc type": null,
      "Bank name": null,
      "Branch name": null,
      "Branch code": null,
      "Bank acc no": null,
      "Acc holder": null,
      "Acc relationship": null,
      "Nedbank credit line": null,
      "Med aid date": null,
      "Med aid ref": null,
      "Med aid dep's": null,
      "Pension date": null,
      "Pension ref": null,
      "Pens% empl": null,
      "Pens% cc": null,
      "Provident date": null,
      "Provident ref": null,
      "Prov% empl": null,
      "Prov% cc": null,
      "Bonus month": null,
      "Manager": staff.reporting_manager,
      "Infoslip indicator": null,
      "Mobile options": null,
      "SMS indicator": null,
      "Alternate cell no.": null,
      "Default cell link": null,
      "Alternate cell link": null,
      "Rep. addr1": staff.address ? staff.address.replace(/<[^>]*>/g, '') : null,
      "Rep. addr2": null,
      "Rep. addr3": null,
      "Rep. post code": null,
      "Res. unit": null,
      "Res. complex": null,
      "Res. street no.": null,
      "Res. street name": null,
      "Res. suburb": null,
      "Res. city": null,
      "Res. post code": null,
      "Residential Country": staff.nationality,
      "Pst unit/po number": null,
      "Pst complex/agency": null,
      "Pst st number": null,
      "Pst st name/spc.serv": null,
      "Pst suburb/post off.": null,
      "Pst city": null,
      "Pst p/code": null,
      "Postal Addr Country": null,
      "Work address code": null,
      "Work unit": null,
      "Work complex": null,
      "Work street no.": null,
      "Work street name": null,
      "Work suburb": null,
      "Work city": null,
      "Work post code": null,
      "Link reporting to": null,
      "Link residential to": null,
      "Link postal to": null
    }));

    res.json(formattedStaff);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/my_dashboard_loans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cycle_date } = req.query;

    if (!cycle_date) {
      return res.status(400).json({ error: "cycle_date is required" });
    }

    const [loans] = await pool.query(
      'SELECT * FROM loans WHERE loan_officer_id = ?',
      [id]
    );

    if (!loans || loans.length === 0) {
      return res.json({ pdua: 0 });
    }

    const loanIds = loans.map(loan => loan.id);

    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions WHERE loan_id IN (?)`,
      [loanIds]
    );

    // ---------- helpers ----------
    const formatToYYYYMMDD = (dateString) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    const getLoanBalances = (loansWithTxns) =>
      loansWithTxns.map(({ id, principal, filteredTransactions }) => {
        let debit = 0;
        let credit = 0;

        filteredTransactions.forEach(t => {
          debit += Number(t.debit) || 0;

          if (t.payment_apply_to === "reloan_payment") {
            const reloanAmount = Number(principal) + (Number(principal) * 0.4);
            credit += reloanAmount;
          } else {
            credit += Number(t.credit) || 0;
          }
        });

        const hasReloanPayment = filteredTransactions.some(
          t => t.payment_apply_to === "reloan_payment"
        );

        return { id, balance: hasReloanPayment ? 0 : debit - credit };
      });

    const getTotalCreditInRange = (transactions, givenDate, givenDate2) => {
      const start = new Date(givenDate);
      const end = new Date(givenDate2);

      return transactions.reduce((total, txn) => {
        const txnDate = new Date(txn.date);
        const isInRange = txnDate > start && txnDate <= end;

        const meetsConditions =
          (txn.transaction_type === 'repayment' && txn.payment_apply_to === 'full_payment' && isInRange) ||
          (txn.payment_apply_to === 'part_payment' && isInRange) ||
          (txn.payment_apply_to === 'reloan_payment' && isInRange);

        return meetsConditions ? total + (Number(txn.credit) || 0) : total;
      }, 0);
    };

    // ---------- calculations ----------
    const todayStr = formatToYYYYMMDD(cycle_date);
    const givenDate2 = new Date(cycle_date);
    givenDate2.setMonth(givenDate2.getMonth() + 1);

    const loansWithFilteredTxns = loans
      .filter(loan => loan.status === "disbursed")
      .map(loan => ({
        ...loan,
        filteredTransactions: transactions.filter(
          txn =>
            txn.loan_id === loan.id &&
            new Date(txn.date) < new Date(cycle_date) &&
            txn.transaction_type !== "specified_due_date_fee"
        )
      }));

    const loanBalances = getLoanBalances(loansWithFilteredTxns);

    const COUA = loanBalances.reduce((sum, loan) => sum + loan.balance, 0);
    const TCC = getTotalCreditInRange(
      transactions,
      todayStr,
      formatToYYYYMMDD(givenDate2)
    );

    const pdua = COUA > 0 ? (TCC / COUA) * 100 : 0;

    // ✅ ONLY return PDUA
    res.json({ pdua });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/expenses-by-office-month-2025', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        o.id AS office_id,
        o.name AS office_name,
        MONTH(e.date) AS month,
        SUM(e.amount) AS total_expenses
      FROM expenses e
      JOIN offices o ON o.id = e.office_id
      WHERE YEAR(e.date) = 2025
        AND e.status = 'approved'
      GROUP BY o.id, o.name, MONTH(e.date)
      ORDER BY o.name, month
    `);

    const monthNames = {
      1: 'january',
      2: 'february',
      3: 'march',
      4: 'april',
      5: 'may',
      6: 'june',
      7: 'july',
      8: 'august',
      9: 'september',
      10: 'october',
      11: 'november',
      12: 'december'
    };

    const offices = {};

    rows.forEach(row => {
      if (!offices[row.office_id]) {
        offices[row.office_id] = {
          office_id: row.office_id,
          office_name: row.office_name,
          months: {}
        };
      }

      const monthName = monthNames[row.month];
      offices[row.office_id].months[monthName] = Number(row.total_expenses);
    });

    // Ensure all months exist with default 0
    Object.values(offices).forEach(office => {
      Object.values(monthNames).forEach(month => {
        if (!office.months[month]) {
          office.months[month] = 0;
        }
      });
    });

    res.json({
      success: true,
      year: 2025,
      offices: Object.values(offices)
    });

  } catch (err) {
    console.error("Error fetching expenses by office/month:", err);
    res.status(500).json({
      error: true,
      message: "Failed to fetch expenses",
      details: err.message
    });
  }
});

app.get('/interest-waivers', async (req, res) => {
  try {
    // 1️⃣ Fetch all interest waivers for 2025
    const [interestWaivers] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'interest_waiver'
        AND date BETWEEN '2025-01-01' AND '2025-12-31'
    `);

    if (!interestWaivers.length) {
      return res.json({ year: 2025, months: {} });
    }

    // 2️⃣ Fetch all loans involved
    const loanIds = interestWaivers.map(w => w.loan_id);
    const [loans] = await pool.query(`
      SELECT id, principal
      FROM loans
      WHERE id IN (?)
    `, [loanIds]);

    const loanMap = {};
    for (const loan of loans) {
      loanMap[loan.id] = loan;
    }

    // 3️⃣ Fetch all original interest applied for these loans
    const [interestAppliedRows] = await pool.query(`
      SELECT loan_id, debit
      FROM loan_transactions
      WHERE transaction_type = 'interest_initial'
        AND loan_id IN (?)
    `, [loanIds]);

    const interestMap = {};
    for (const row of interestAppliedRows) {
      interestMap[row.loan_id] = Number(row.debit);
    }

    // 4️⃣ Initialize months
    const months = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
    ];

    const grouped = {};
    for (const month of months) {
      grouped[month] = { "15%": [], "30%": [], "35%": [], "40%": [], "other": [] };
    }

    // 5️⃣ Process waivers
    for (const waiver of interestWaivers) {
      const loan = loanMap[waiver.loan_id];
      const interestApplied = interestMap[waiver.loan_id];

      if (!loan || loan.principal <= 0 || !interestApplied) continue;

      const interestWaived = Number(waiver.credit);
      const interestPaid = interestApplied - interestWaived;
      const effectiveRate = (interestPaid / loan.principal) * 100;
      const roundedRate = Number(effectiveRate.toFixed(2));

      const waiverDate = new Date(waiver.date);
      const monthName = months[waiverDate.getMonth()];

      const payload = {
        ...waiver,
        principal: loan.principal,
        interest_applied: interestApplied,
        interest_waived: interestWaived,
        interest_paid: interestPaid,
        effective_rate: roundedRate
      };

      if (roundedRate >= 14.5 && roundedRate <= 15.5) grouped[monthName]["15%"].push(payload);
      else if (roundedRate >= 29.5 && roundedRate <= 30.5) grouped[monthName]["30%"].push(payload);
      else if (roundedRate >= 34.5 && roundedRate <= 35.5) grouped[monthName]["35%"].push(payload);
      else if (roundedRate >= 39.5) grouped[monthName]["40%"].push(payload);
      else grouped[monthName]["other"].push(payload);
    }

    // 6️⃣ Prepare monthly totals
    const response = {};
    for (const month of months) {
      response[month] = {
        totals: {
          "15%": grouped[month]["15%"].length,
          "30%": grouped[month]["30%"].length,
          "35%": grouped[month]["35%"].length,
          "40%": grouped[month]["40%"].length,
          "other": grouped[month]["other"].length
        },
      };
    }

    res.json({ year: 2025, months: response });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/forty-payments', async (req, res) => {
  try {
    // 1️⃣ Get all closed loans created in 2025
    const [loans] = await pool.query(
      `SELECT * FROM loans 
       WHERE status = 'closed'
         AND created_date BETWEEN '2025-01-01' AND '2025-12-31'`
    );

    if (!loans || loans.length === 0) {
      return res.json({ months: [] });
    }

    const loanIds = loans.map(loan => loan.id);

    // 2️⃣ Get all transactions for these loans
    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions WHERE loan_id IN (?)`,
      [loanIds]
    );

    // 3️⃣ Prepare months array
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const result = monthNames.map((monthName, index) => {
      const month = index + 1;

      // Loans created in this month
      const loansInMonth = loans.filter(loan => new Date(loan.created_date).getMonth() + 1 === month);

      // Count how many of these loans have no interest_waiver
      const loansWithoutWaiver = loansInMonth.filter(loan => 
        !transactions.some(t => t.loan_id === loan.id && t.transaction_type === 'interest_waiver')
      );

      return {
        month: monthName,
        total_loans: loansInMonth.length,
        loans_without_waiver: loansWithoutWaiver.length
      };
    });

    res.json({ months: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/full-payments-2025', async (req, res) => {
  try {
    // Query: count full repayments per month
    const [rows] = await pool.query(`
      SELECT MONTH(created_at) AS month, COUNT(*) AS count
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
        AND payment_apply_to = 'full_payment'
        AND created_at BETWEEN '2025-01-01' AND '2025-12-31'
      GROUP BY MONTH(created_at)
      ORDER BY MONTH(created_at)
    `);

    // Month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Initialize result with 0 counts for all months
    const monthlyCounts = {};
    monthNames.forEach(name => monthlyCounts[name] = 0);

    // Fill in counts from query
    rows.forEach(row => {
      monthlyCounts[monthNames[row.month - 1]] = row.count;
    });

    res.json({ year: 2025, fullPaymentsPerMonth: monthlyCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/loan-consultant-performance-new', async (req, res) => {
  try {
    const { start_date, end_date, office_id } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date and end_date are required query params" });
    }

    // 1. Get consultants + office info, optionally filter by office_id
    let consultantQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.office_id,
        o.name AS office_name
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      WHERE ru.role_id IN (3, 4, 6)
    `;

    const queryParams = [];

    if (office_id) {
      consultantQuery += " AND u.office_id = ?";
      queryParams.push(office_id);
    }

    const [consultants] = await pool.query(consultantQuery, queryParams);

    const userIds = consultants.map(u => u.id);
    if (userIds.length === 0) return res.json([]);

    // 2. Get all disbursed loans for these users
    const [loans] = await pool.query(`
      SELECT id, loan_officer_id
      FROM loans
      WHERE loan_officer_id IN (?)
    `, [userIds]);

    const loanIds = loans.map(l => l.id);
    if (loanIds.length === 0) {
      return res.json(consultants.map(u => ({
        user_id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        office: u.office_name || "No office",
        total_uncollected: 0,
        total_collected: 0,
        still_uncollected: 0,
        given_out: 0
      })));
    }

    // 3. Fetch all transactions for these loans in the date range
    const [transactions] = await pool.query(`
      SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?) 
      AND date >= ? AND date <= ?
    `, [loanIds, start_date, end_date]);

    const [transactions_two] = await pool.query(`
      SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND (
          date < ?
          OR transaction_type = 'interest_waiver'
        )
    `, [loanIds, start_date]);

 let uncollected_without_charges = 0;

    // 4. Map loan_id -> user_id
    const loanToUser = {};
    loans.forEach(l => {
      loanToUser[l.id] = l.loan_officer_id;
    });

    // 5. Aggregate totals per user
    const userTotals = {};
    userIds.forEach(id => {
      userTotals[id] = { total_uncollected: 0, total_collected: 0, given_out: 0,uncollected_without_charges:0 };
    });

    transactions.forEach(t => {
      const userId = loanToUser[t.loan_id];
      if (!userId) return;

      if (['repayment'].includes(t.transaction_type)) {
        const credit = Number(t.credit) || 0;
        if (t.payment_apply_to === 'reloan_payment') {
          userTotals[userId].total_collected += Number(t.balance_bf);
        } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
          userTotals[userId].total_collected += credit;
        }
      }

      if (t.transaction_type === 'disbursement') {
        const debit = Number(t.debit) || 0;
        userTotals[userId].given_out += debit;
      }

      if (t.transaction_type === 'repayment' && t.payment_apply_to === 'reloan_payment') {
        const reloan_amount = Number(t.balance_bf) - Number(t.credit) || 0;
        userTotals[userId].given_out += reloan_amount;
      }
    });

    transactions_two.forEach(t => {
      const userId = loanToUser[t.loan_id];
      if (!userId) return;

      const debit = Number(t.debit) || 0;
      const credit = Number(t.credit) || 0;

      if (t.transaction_type !== 'specified_due_date_fee') {
        userTotals[userId].total_uncollected += debit - credit;
      }

      userTotals[userId].uncollected_without_charges += debit - credit;

    });



    // 6. Fetch carry_overs for all users and add to given_out
    const [carryOvers] = await pool.query(`
      SELECT user_id, amount
      FROM carry_overs
      WHERE user_id IN (?) AND cycle_date = ? AND status = 'active'
    `, [userIds, start_date]);

    const carryOverMap = {};
    carryOvers.forEach(c => {
      carryOverMap[c.user_id] = Number(c.amount);
    });

    // 7. Combine results
    const results = consultants.map(u => {
      const totals = userTotals[u.id] || { total_uncollected: 0, total_collected: 0, given_out: 0 };
      const carryOverAmount = carryOverMap[u.id] || 0;

     // totals.given_out += carryOverAmount; // add carry over to given_out
      const still_uncollected = totals.total_uncollected - totals.total_collected;

      return {
        user_id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        office: u.office_name || "No office",
        total_uncollected: totals.total_uncollected.toFixed(2),
        total_collected: totals.total_collected.toFixed(2),
        still_uncollected: still_uncollected.toFixed(2),
        given_out: totals.given_out.toFixed(2),
        carry_over: carryOverAmount,
        uncollected_without_charges: totals.uncollected_without_charges.toFixed(2)

      };
    });

    // 8. Sort by office name
    results.sort((a, b) => a.office.localeCompare(b.office));

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.post('/all-target-data', async (req, res) => {
  try {

    const [consultants] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id,
        o.name AS office_name,
        cd.cycle_end_date
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      LEFT JOIN cycle_dates cd ON cd.loan_officer_id = u.id
      WHERE ru.role_id IN (3, 4, 6)
    `);

    if (!consultants.length) {
      return res.sendStatus(200);
    }

    for (const user of consultants) {

      // ===============================
      // Build Cycle Period
      // ===============================

      const cycleEndDay = user.cycle_end_date
        ? parseInt(user.cycle_end_date)
        : 24;

      const today = dayjs();

      let currentMonth = dayjs().startOf('month');
      let cycleDay = Math.min(cycleEndDay, currentMonth.daysInMonth());
      let cycleDate = currentMonth.date(cycleDay).add(1, 'day');

      if (today.isBefore(cycleDate)) {
        let prevMonth = dayjs().subtract(1, 'month').startOf('month');
        cycleDay = Math.min(cycleEndDay, prevMonth.daysInMonth());
        cycleDate = prevMonth.date(cycleDay).add(1, 'day');
      }

      const start_date = cycleDate.format('YYYY-MM-DD');
      const end_date = cycleDate.add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD');

      // ===============================
      // Get Loans
      // ===============================

      const [loans] = await pool.query(
        `SELECT id FROM loans WHERE loan_officer_id = ?`,
        [user.id]
      );

      if (!loans.length) continue;

      const loanIds = loans.map(l => l.id);

      const [transactions] = await pool.query(`
        SELECT debit, credit, transaction_type, payment_apply_to, balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?)
          AND date >= ?
          AND date <= ?
      `, [loanIds, start_date, end_date]);

      const [transactions_two] = await pool.query(`
        SELECT debit, credit, transaction_type
        FROM loan_transactions
        WHERE loan_id IN (?)
          AND (
            date < ?
            OR transaction_type = 'interest_waiver'
          )
      `, [loanIds, start_date]);

      let total_uncollected = 0;
      let total_collected = 0;
      let given_out = 0;

      // Aggregate
      transactions.forEach(t => {

        if (t.transaction_type === 'repayment') {

          if (t.payment_apply_to === 'reloan_payment') {
            total_collected += Number(t.balance_bf) || 0;
          }

          if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
            total_collected += Number(t.credit) || 0;
          }
        }

        if (t.transaction_type === 'disbursement') {
          given_out += Number(t.debit) || 0;
        }

        if (t.transaction_type === 'repayment' &&
            t.payment_apply_to === 'reloan_payment') {

          const reloan_amount =
            (Number(t.balance_bf) || 0) -
            (Number(t.credit) || 0);

          given_out += reloan_amount;
        }

      });

      transactions_two.forEach(t => {
        if (t.transaction_type !== 'specified_due_date_fee') {
          total_uncollected +=
            (Number(t.debit) || 0) -
            (Number(t.credit) || 0);
        }
      });

      // Carry Over
      const [carryOver] = await pool.query(`
        SELECT amount
        FROM carry_overs
        WHERE user_id = ?
          AND cycle_date = ?
          AND status = 'active'
      `, [user.id, start_date]);

      const carryOverAmount = carryOver.length
        ? Number(carryOver[0].amount)
        : 0;

      given_out += carryOverAmount;

      const still_uncollected =
        total_uncollected - total_collected;

      // ===============================
      // TARGET SYSTEM
      // ===============================

      const uncollectedValue = Number(still_uncollected);
      const givenOutValue = Number(given_out);

      const targets = [40000.00, 50000.00, 80000.00, 120000.00];

      if (uncollectedValue < 5000) {

     const [existingTargets] = await pool.query(`
  SELECT target_level
  FROM targets_met
  WHERE user_id = ?
    AND cycle_start = ?
`, [user.id, start_date]);

        const existingLevels =
          existingTargets.map(t => t.target_level);

        const inserts = [];

        for (const targetAmount of targets) {

          if (givenOutValue >= targetAmount &&
              !existingLevels.includes(targetAmount)) {

        inserts.push([
  user.id,
  `${user.first_name} ${user.last_name}`,
  user.office_name || "No office",
  givenOutValue.toFixed(2),
  uncollectedValue.toFixed(2),
  targetAmount,
  dayjs().format('YYYY-MM-DD'),   // insert date
  start_date                      // cycle_start
]);
          }

        }

        if (inserts.length) {
         await pool.query(`
  INSERT IGNORE INTO targets_met
  (user_id, user_name, office_name, given_out, uncollected, target_level, date, cycle_start)
  VALUES ?
`, [inserts]);
        }

      }

    }

    // Webhook-style: no body returned
    return res.sendStatus(200);

  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});


async function processAllTargetData() {
  try {

    const [consultants] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id,
        o.name AS office_name,
        cd.cycle_end_date
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      LEFT JOIN cycle_dates cd ON cd.loan_officer_id = u.id
      WHERE ru.role_id IN (3, 4, 6)
    `);

    if (!consultants.length) {
      console.log('No consultants found');
      return;
    }

    for (const user of consultants) {

      // ===============================
      // Build Cycle Period
      // ===============================

      const cycleEndDay = user.cycle_end_date
        ? parseInt(user.cycle_end_date)
        : 24;

      const today = dayjs();

      let currentMonth = dayjs().startOf('month');
      let cycleDay = Math.min(
        cycleEndDay,
        currentMonth.daysInMonth()
      );

      let cycleDate = currentMonth
        .date(cycleDay)
        .add(1, 'day');

      if (today.isBefore(cycleDate)) {

        let prevMonth = dayjs()
          .subtract(1, 'month')
          .startOf('month');

        cycleDay = Math.min(
          cycleEndDay,
          prevMonth.daysInMonth()
        );

        cycleDate = prevMonth
          .date(cycleDay)
          .add(1, 'day');
      }

      const start_date = cycleDate.format('YYYY-MM-DD');

      const end_date = cycleDate
        .add(1, 'month')
        .subtract(1, 'day')
        .format('YYYY-MM-DD');


      // ===============================
      // Get Loans
      // ===============================

      const [loans] = await pool.query(
        `SELECT id FROM loans WHERE loan_officer_id = ?`,
        [user.id]
      );

      if (!loans.length) {
        continue;
      }

      const loanIds = loans.map(l => l.id);


      // ===============================
      // Transactions Inside Cycle
      // ===============================

      const [transactions] = await pool.query(`
        SELECT 
          debit,
          credit,
          transaction_type,
          payment_apply_to,
          balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?)
          AND date >= ?
          AND date <= ?
      `, [
        loanIds,
        start_date,
        end_date
      ]);


      // ===============================
      // Transactions Before Cycle
      // ===============================

      const [transactions_two] = await pool.query(`
        SELECT 
          debit,
          credit,
          transaction_type
        FROM loan_transactions
        WHERE loan_id IN (?)
          AND (
            date < ?
            OR transaction_type = 'interest_waiver'
          )
      `, [
        loanIds,
        start_date
      ]);


      let total_uncollected = 0;
      let total_collected = 0;
      let given_out = 0;


      // ===============================
      // Aggregate Transactions
      // ===============================

      transactions.forEach(t => {

        if (t.transaction_type === 'repayment') {

          if (t.payment_apply_to === 'reloan_payment') {
            total_collected += Number(t.balance_bf) || 0;
          }

          if (
            ['full_payment', 'part_payment']
              .includes(t.payment_apply_to)
          ) {
            total_collected += Number(t.credit) || 0;
          }
        }


        if (t.transaction_type === 'disbursement') {
          given_out += Number(t.debit) || 0;
        }


        if (
          t.transaction_type === 'repayment' &&
          t.payment_apply_to === 'reloan_payment'
        ) {

          const reloan_amount =
            (Number(t.balance_bf) || 0) -
            (Number(t.credit) || 0);

          given_out += reloan_amount;
        }

      });


      // ===============================
      // Uncollected
      // ===============================

      transactions_two.forEach(t => {

        if (
          t.transaction_type !==
          'specified_due_date_fee'
        ) {

          total_uncollected +=
            (Number(t.debit) || 0) -
            (Number(t.credit) || 0);
        }

      });


      // ===============================
      // Carry Over
      // ===============================

      const [carryOver] = await pool.query(`
        SELECT amount
        FROM carry_overs
        WHERE user_id = ?
          AND cycle_date = ?
          AND status = 'active'
      `, [
        user.id,
        start_date
      ]);


      const carryOverAmount = carryOver.length
        ? Number(carryOver[0].amount)
        : 0;

      given_out += carryOverAmount;


      // ===============================
      // Final Values
      // ===============================

      const still_uncollected =
        total_uncollected -
        total_collected;

      const uncollectedValue =
        Number(still_uncollected);

      const givenOutValue =
        Number(given_out);


      // ===============================
      // TARGET SYSTEM
      // ===============================

      const targets = [
        40000.00,
        50000.00,
        80000.00,
        120000.00
      ];


      if (uncollectedValue < 5000) {

        const [existingTargets] = await pool.query(`
          SELECT target_level
          FROM targets_met
          WHERE user_id = ?
            AND cycle_start = ?
        `, [
          user.id,
          start_date
        ]);


        const existingLevels =
          existingTargets.map(t =>
            Number(t.target_level)
          );


        const inserts = [];


        for (const targetAmount of targets) {

          if (
            givenOutValue >= targetAmount &&
            !existingLevels.includes(targetAmount)
          ) {

            inserts.push([
              user.id,
              `${user.first_name} ${user.last_name}`,
              user.office_name || "No office",
              givenOutValue.toFixed(2),
              uncollectedValue.toFixed(2),
              targetAmount,
              dayjs().format('YYYY-MM-DD'),
              start_date
            ]);

          }

        }


        if (inserts.length) {

          await pool.query(`
            INSERT IGNORE INTO targets_met
            (
              user_id,
              user_name,
              office_name,
              given_out,
              uncollected,
              target_level,
              date,
              cycle_start
            )
            VALUES ?
          `, [inserts]);

          console.log(
            `Targets recorded for ${user.first_name} ${user.last_name}:`,
            inserts.map(row => row[5])
          );
        }

      }

    }

    console.log(
      `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Target check completed`
    );

  } catch (error) {

    console.error(
      'Error processing target data:',
      error
    );

  }
}


// ==========================================
// MANUAL ENDPOINT
// ==========================================

app.post('/all-target-data', async (req, res) => {

  await processAllTargetData();

  return res.sendStatus(200);

});


// ==========================================
// AUTOMATICALLY RUN EVERY MINUTE
// ==========================================

setInterval(async () => {

  console.log(
    `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Running automatic target check...`
  );

  await processAllTargetData();

}, 60 * 1000);


app.get('/test-target-data/:user_id', async (req, res) => {
  try {
    const userId = req.params.user_id;

    const [consultants] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id,
        o.name AS office_name,
        cd.cycle_end_date
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      LEFT JOIN offices o ON o.id = u.office_id
      LEFT JOIN cycle_dates cd ON cd.loan_officer_id = u.id
      WHERE ru.role_id = 3
      AND u.id = ?
    `, [userId]);

    if (!consultants.length) {
      return res.json({ message: "User not found or not role 3" });
    }

    const user = consultants[0];

    // ===============================
    // Build Cycle Period
    // ===============================

    const cycleEndDay = user.cycle_end_date
      ? parseInt(user.cycle_end_date)
      : 24;

    const today = dayjs();

    let currentMonth = dayjs().startOf('month');
    let cycleDay = Math.min(cycleEndDay, currentMonth.daysInMonth());
    let cycleDate = currentMonth.date(cycleDay).add(1, 'day');

    if (today.isBefore(cycleDate)) {
      let prevMonth = dayjs().subtract(1, 'month').startOf('month');
      cycleDay = Math.min(cycleEndDay, prevMonth.daysInMonth());
      cycleDate = prevMonth.date(cycleDay).add(1, 'day');
    }

    const start_date = cycleDate.format('YYYY-MM-DD');
    const end_date = cycleDate.add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD');

    // ===============================
    // Get Loans
    // ===============================

    const [loans] = await pool.query(
      `SELECT id FROM loans WHERE loan_officer_id = ?`,
      [user.id]
    );

    if (!loans.length) {
      return res.json({
        user: user.first_name + " " + user.last_name,
        message: "No loans found"
      });
    }

    const loanIds = loans.map(l => l.id);

    const [transactions] = await pool.query(`
      SELECT debit, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND date >= ?
        AND date <= ?
    `, [loanIds, start_date, end_date]);

    const [transactions_two] = await pool.query(`
      SELECT debit, credit, transaction_type
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND (
          date < ?
          OR transaction_type = 'interest_waiver'
        )
    `, [loanIds, start_date]);

    let total_uncollected = 0;
    let total_collected = 0;
    let given_out = 0;

    transactions.forEach(t => {

      if (t.transaction_type === 'repayment') {

        if (t.payment_apply_to === 'reloan_payment') {
          total_collected += Number(t.balance_bf) || 0;
        }

        if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
          total_collected += Number(t.credit) || 0;
        }
      }

      if (t.transaction_type === 'disbursement') {
        given_out += Number(t.debit) || 0;
      }

      if (t.transaction_type === 'repayment' &&
          t.payment_apply_to === 'reloan_payment') {

        const reloan_amount =
          (Number(t.balance_bf) || 0) -
          (Number(t.credit) || 0);

        given_out += reloan_amount;
      }

    });

    transactions_two.forEach(t => {
      if (t.transaction_type !== 'specified_due_date_fee') {
        total_uncollected +=
          (Number(t.debit) || 0) -
          (Number(t.credit) || 0);
      }
    });

    const [carryOver] = await pool.query(`
      SELECT amount
      FROM carry_overs
      WHERE user_id = ?
        AND cycle_date = ?
        AND status = 'active'
    `, [user.id, start_date]);

    const carryOverAmount = carryOver.length
      ? Number(carryOver[0].amount)
      : 0;

    given_out += carryOverAmount;

    const still_uncollected =
      total_uncollected - total_collected;

    const uncollectedValue = Number(still_uncollected);
    const givenOutValue = Number(given_out);

    const targets = [40000, 50000, 80000, 120000];

    const [existingTargets] = await pool.query(`
      SELECT target_level
      FROM targets_met
      WHERE user_id = ?
        AND cycle_start = ?
    `, [user.id, start_date]);

    const existingLevels = existingTargets.map(t => Number(t.target_level));

    const qualifyingTargets = targets.filter(t =>
      givenOutValue >= t && !existingLevels.includes(t)
    );

    return res.json({
      user: user.first_name + " " + user.last_name,
      start_date,
      end_date,
      givenOutValue,
      uncollectedValue,
      passes_uncollected_check: uncollectedValue < 5000,
      existingLevels,
      qualifyingTargets
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});




app.get('/loan-repayment-period-2025', async (req, res) => {
  try {
    // 1️⃣ Get all CLOSED loans created in 2025
    const [loans] = await pool.query(`
      SELECT *
      FROM loans
      WHERE created_date BETWEEN '2025-01-01' AND '2025-12-31'
        AND status = 'closed'
    `);

    if (loans.length === 0) {
      return res.json({ message: "No loans found for 2025" });
    }

    const loanIds = loans.map(loan => loan.id);

    // 2️⃣ Get full payment transactions
    const [transactions] = await pool.query(
      `
      SELECT *
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND transaction_type = 'repayment'
        AND payment_apply_to = 'full_payment'
      `,
      [loanIds]
    );

    // 3️⃣ Initialize counts
    const counts = {
      oneMonth: 0,
      twoMonths: 0,
      threeMonths: 0,
      fourMonths: 0,
      aboveFourMonths: 0
    };

    // 4️⃣ Calculate months & count
    loans.forEach(loan => {
      const fullPayment = transactions.find(tx => tx.loan_id === loan.id);

      if (!fullPayment) {
        counts.aboveFourMonths++;
        return;
      }

      const createdDate = new Date(loan.created_date);
      const paymentDate = new Date(fullPayment.date);

      const monthsToFullPayment =
        (paymentDate.getFullYear() - createdDate.getFullYear()) * 12 +
        (paymentDate.getMonth() - createdDate.getMonth());

      if (monthsToFullPayment === 1) counts.oneMonth++;
      else if (monthsToFullPayment === 2) counts.twoMonths++;
      else if (monthsToFullPayment === 3) counts.threeMonths++;
      else if (monthsToFullPayment === 4) counts.fourMonths++;
      else counts.aboveFourMonths++;
    });

    // 5️⃣ Exclude 1-month loans from total
    const adjustedTotal =
      loans.length - counts.oneMonth;

    // Prevent division by zero
    if (adjustedTotal <= 0) {
      return res.json({
        message: "No loans beyond 1 month to calculate percentages"
      });
    }

    // 6️⃣ Calculate percentages (excluding 1 month)
    const percentages = {
      "2 months": ((counts.twoMonths / adjustedTotal) * 100).toFixed(2) + "%",
      "3 months": ((counts.threeMonths / adjustedTotal) * 100).toFixed(2) + "%",
      "4 months": ((counts.fourMonths / adjustedTotal) * 100).toFixed(2) + "%",
      ">4 months": ((counts.aboveFourMonths / adjustedTotal) * 100).toFixed(2) + "%"
    };

    return res.json({
      total_closed_loans: loans.length,
      excluded_1_month_loans: counts.oneMonth,
      percentage_base: adjustedTotal,
      percentages
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});


app.get('/given-out-performance-percentages-2025', async (req, res) => {
  try {
    const [results] = await pool.query(`
      WITH eligible_consultants AS (
        SELECT DISTINCT
          u.id AS loan_officer_id
        FROM users u
        JOIN role_users ru ON ru.user_id = u.id
        JOIN cycle_dates cd ON cd.loan_officer_id = u.id
        WHERE ru.role_id = 3
          AND cd.cycle_end_date = 24
      ),

      monthly_totals AS (
        SELECT
          l.loan_officer_id,
          MONTH(DATE_SUB(l.created_date, INTERVAL 24 DAY)) AS month_number,
          MONTHNAME(DATE_SUB(l.created_date, INTERVAL 24 DAY)) AS month_name,

          -- SUM principal + SUM of valid reloan transactions within cycle
          SUM(l.principal) +
          SUM(
            CASE
              WHEN lt.transaction_type = 'repayment'
               AND lt.payment_apply_to = 'reloan_payment'
               AND lt.date >= DATE_SUB(l.created_date, INTERVAL 24 DAY)
               AND lt.date < DATE_ADD(DATE_SUB(l.created_date, INTERVAL 24 DAY), INTERVAL 1 MONTH)
              THEN (lt.balance_bf - lt.credit)
              ELSE 0
            END
          ) AS raw_given_out

        FROM loans l
        JOIN eligible_consultants ec
          ON ec.loan_officer_id = l.loan_officer_id
        LEFT JOIN loan_transactions lt
          ON lt.loan_id = l.id

        WHERE l.created_date >= '2024-12-24'
          AND l.created_date < '2025-12-24'

        GROUP BY
          l.loan_officer_id,
          MONTH(DATE_SUB(l.created_date, INTERVAL 24 DAY)),
          MONTHNAME(DATE_SUB(l.created_date, INTERVAL 24 DAY))
      ),

      cycle_values AS (
        SELECT
          loan_officer_id,
          month_number,
          month_name,
          LEAST(raw_given_out, 40000) AS cycle_given_out
        FROM monthly_totals
      ),

      bucketed AS (
        SELECT
          month_number,
          month_name,
          loan_officer_id,
          CASE
            WHEN cycle_given_out >= 30000 AND cycle_given_out < 40000 THEN 'failed_30000'
            WHEN cycle_given_out >= 20000 AND cycle_given_out < 30000 THEN 'about_20000'
            WHEN cycle_given_out < 20000 THEN 'below_20000'
            ELSE 'hit_40000'
          END AS bucket
        FROM cycle_values
      )

      SELECT
        month_number,
        month_name,
        COUNT(*) AS total_consultants,

        SUM(bucket = 'failed_30000') AS failed_but_above_30000_count,
        SUM(bucket = 'about_20000') AS gave_about_20000_count,
        SUM(bucket = 'below_20000') AS below_20000_count,
        SUM(bucket = 'hit_40000') AS hit_40000_count,

        ROUND(100 * SUM(bucket = 'failed_30000') / COUNT(*), 2) AS failed_but_above_30000_pct,
        ROUND(100 * SUM(bucket = 'about_20000') / COUNT(*), 2) AS gave_about_20000_pct,
        ROUND(100 * SUM(bucket = 'below_20000') / COUNT(*), 2) AS below_20000_pct,
        ROUND(100 * SUM(bucket = 'hit_40000') / COUNT(*), 2) AS hit_40000_pct

      FROM bucketed
      GROUP BY month_number, month_name
      ORDER BY month_number;
    `);

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.get('/client-loan-behaviour-summary-2025', async (req, res) => {
  try {
    // 1️⃣ Get all loans created in 2025
    const [loans] = await pool.query(`
      SELECT id, client_id, created_date
      FROM loans
      WHERE created_date BETWEEN '2025-01-01' AND '2025-12-31'
      ORDER BY created_date ASC
    `);

    if (!loans.length) {
      return res.json({
        total_clients: 0,
        paid_in_full_clients: 0,
        reloan_next_month: { count: 0, percentage: "0%" },
        no_reloan_next_month: { count: 0, percentage: "0%" },
        reloan_after_quarter: { count: 0, percentage: "0%" },
        reloan_clients: { count: 0, percentage: "0%" },
        average_loans_per_client: 0
      });
    }

    const loanIds = loans.map(l => l.id);

    // 2️⃣ Get full-payment transactions
    const [fullPayments] = await pool.query(`
      SELECT loan_id, created_at
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND transaction_type = 'repayment'
        AND payment_apply_to = 'full_payment'
    `, [loanIds]);

    // 🆕 2b️⃣ Get reloan payment transactions (2025)
    const [reloanPayments] = await pool.query(`
      SELECT DISTINCT l.client_id
      FROM loan_transactions lt
      JOIN loans l ON l.id = lt.loan_id
      WHERE lt.transaction_type = 'repayment'
        AND lt.payment_apply_to = 'reloan_payment'
        AND lt.created_at BETWEEN '2025-01-01' AND '2025-12-31'
    `);

    // 3️⃣ Group loans by client
    const loansByClient = {};
    for (const loan of loans) {
      if (!loansByClient[loan.client_id]) {
        loansByClient[loan.client_id] = [];
      }
      loansByClient[loan.client_id].push(loan);
    }

    // 4️⃣ Map loan → full payment date
    const fullPaymentByLoan = {};
    for (const tx of fullPayments) {
      fullPaymentByLoan[tx.loan_id] = new Date(tx.created_at);
    }

    const clientsPaidInFull = new Set();
    const clientsNextMonth = new Set();
    const clientsQuarterReturn = new Set();

    // 🆕 Reloan clients set
    const reloanClients = new Set(
      reloanPayments.map(r => r.client_id)
    );

    let totalLoans = loans.length;

    // 5️⃣ Analyze behavior
    for (const clientId in loansByClient) {
      const clientLoans = loansByClient[clientId]
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

      for (let i = 0; i < clientLoans.length; i++) {
        const loan = clientLoans[i];
        const fullPaymentDate = fullPaymentByLoan[loan.id];

        if (!fullPaymentDate) continue;

        clientsPaidInFull.add(clientId);

        const nextLoan = clientLoans[i + 1];
        if (!nextLoan) continue;

        const nextLoanDate = new Date(nextLoan.created_date);

        const monthsBetween =
          (nextLoanDate.getFullYear() - fullPaymentDate.getFullYear()) * 12 +
          (nextLoanDate.getMonth() - fullPaymentDate.getMonth());

        // Next-month reloan
        if (monthsBetween === 1) {
          clientsNextMonth.add(clientId);
        }

        // Returned after a quarter
        if (monthsBetween === 3) {
          clientsQuarterReturn.add(clientId);
        }
      }
    }

    const paidInFullCount = clientsPaidInFull.size;
    const reloanNextMonthCount = clientsNextMonth.size;
    const noReloanNextMonthCount = paidInFullCount - reloanNextMonthCount;
    const reloanQuarterCount = clientsQuarterReturn.size;
    const reloanClientsCount = reloanClients.size;
    const totalClients = Object.keys(loansByClient).length;

    const averageLoansPerClient =
      totalClients > 0 ? (totalLoans / totalClients).toFixed(2) : 0;

    // ✅ Percent helper
    const percent = (num, total) =>
      total > 0 ? ((num / total) * 100).toFixed(2) + "%" : "0%";

    res.json({
      total_clients: totalClients,
      paid_in_full_clients: paidInFullCount,

      reloan_next_month: {
        count: reloanNextMonthCount,
        percentage: percent(reloanNextMonthCount, paidInFullCount)
      },

      no_reloan_next_month: {
        count: noReloanNextMonthCount,
        percentage: percent(noReloanNextMonthCount, paidInFullCount)
      },

      reloan_after_quarter: {
        count: reloanQuarterCount,
        percentage: percent(reloanQuarterCount, paidInFullCount)
      },

      // 🆕 Reloan clients metric
      reloan_clients: {
        count: reloanClientsCount,
        percentage: percent(reloanClientsCount, paidInFullCount)
      },

      average_loans_per_client: Number(averageLoansPerClient)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/clients-default-summary-2025', async (req, res) => {
  try {
    // 1️⃣ Get all loans created in 2025
    const [loans] = await pool.query(`
      SELECT id, client_id
      FROM loans
      WHERE created_date BETWEEN '2025-01-01' AND '2025-12-31'
    `);

    if (!loans.length) {
      return res.json({
        total_clients: 0,
        defaulted_clients: { count: 0, percentage: "0%" },
        defaulted_by_reloan_clients: { count: 0, percentage: "0%" }
      });
    }

    const loanIds = loans.map(l => l.id);

    // 2️⃣ Loans that HAVE full payments
    const [fullPayments] = await pool.query(`
      SELECT DISTINCT loan_id
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND transaction_type = 'repayment'
        AND payment_apply_to = 'full_payment'
    `, [loanIds]);

    const loansWithFullPayment = new Set(
      fullPayments.map(fp => fp.loan_id)
    );

    // 3️⃣ Clients who made reloan payments in 2025
    const [reloanPayments] = await pool.query(`
      SELECT DISTINCT l.client_id
      FROM loan_transactions lt
      JOIN loans l ON l.id = lt.loan_id
      WHERE lt.transaction_type = 'repayment'
        AND lt.payment_apply_to = 'reloan_payment'
        AND lt.created_at BETWEEN '2025-01-01' AND '2025-12-31'
    `);

    const reloanClients = new Set(
      reloanPayments.map(r => r.client_id)
    );

    const defaultedClients = new Set();
    const defaultedByReloanClients = new Set();

    // 4️⃣ Classify clients
    for (const loan of loans) {
      if (!loansWithFullPayment.has(loan.id)) {
        defaultedClients.add(loan.client_id);

        if (reloanClients.has(loan.client_id)) {
          defaultedByReloanClients.add(loan.client_id);
        }
      }
    }

    const totalClients = new Set(loans.map(l => l.client_id)).size;

    // ✅ Percent helper
    const percent = (num, total) =>
      total > 0 ? ((num / total) * 100).toFixed(2) + "%" : "0%";

    res.json({
      total_clients: totalClients,

      defaulted_clients: {
        count: defaultedClients.size,
        percentage: percent(defaultedClients.size, totalClients)
      },

      defaulted_by_reloan_clients: {
        count: defaultedByReloanClients.size,
        percentage: percent(defaultedByReloanClients.size, totalClients)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/default-start-month-analysis-2025', async (req, res) => {
  try {
    // 1️⃣ Get all loans in 2025
    const [loans] = await pool.query(`
      SELECT id, client_id, created_date
      FROM loans
      WHERE created_date BETWEEN '2025-01-01' AND '2025-12-31'
    `);

    if (!loans.length) {
      return res.json({
        total_defaulted_loans: 0,
        default_start_distribution: [],
        most_common_default_month: null
      });
    }

    const loanIds = loans.map(l => l.id);

    // 2️⃣ Loans with full payments
    const [fullPayments] = await pool.query(`
      SELECT DISTINCT loan_id
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND transaction_type = 'repayment'
        AND payment_apply_to = 'full_payment'
    `, [loanIds]);

    const loansWithFullPayment = new Set(
      fullPayments.map(fp => fp.loan_id)
    );

    // 3️⃣ Last transaction per loan
    const [lastTransactions] = await pool.query(`
      SELECT loan_id, MAX(created_at) AS last_tx_date
      FROM loan_transactions
      WHERE loan_id IN (?)
      GROUP BY loan_id
    `, [loanIds]);

    const lastTxByLoan = {};
    for (const tx of lastTransactions) {
      lastTxByLoan[tx.loan_id] = new Date(tx.last_tx_date);
    }

    const defaultMonthCounts = {};

    // 4️⃣ Determine default start month
    for (const loan of loans) {
      // Only loans that NEVER got fully paid
      if (loansWithFullPayment.has(loan.id)) continue;

      const lastTxDate = lastTxByLoan[loan.id];
      if (!lastTxDate) continue;

      const createdDate = new Date(loan.created_date);

      const monthsDiff =
        (lastTxDate.getFullYear() - createdDate.getFullYear()) * 12 +
        (lastTxDate.getMonth() - createdDate.getMonth()) + 1;

      const monthBucket = `month_${monthsDiff}`;

      defaultMonthCounts[monthBucket] =
        (defaultMonthCounts[monthBucket] || 0) + 1;
    }

    const totalDefaultedLoans = Object.values(defaultMonthCounts)
      .reduce((a, b) => a + b, 0);

    // 5️⃣ Format response + percentages
    const distribution = Object.entries(defaultMonthCounts)
      .map(([month, count]) => ({
        month,
        count,
        percentage:
          totalDefaultedLoans > 0
            ? ((count / totalDefaultedLoans) * 100).toFixed(2) + "%"
            : "0%"
      }))
      .sort((a, b) => parseInt(a.month.split('_')[1]) - parseInt(b.month.split('_')[1]));

    const mostCommon = distribution.reduce(
      (max, cur) => (cur.count > max.count ? cur : max),
      { count: 0 }
    );

    res.json({
      total_defaulted_loans: totalDefaultedLoans,
      default_start_distribution: distribution,
      most_common_default_month: mostCommon.month || null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/reloan-first-month-2025', async (req, res) => {
  try {
    // 1️⃣ Get all loans created in 2025
    const [loans] = await pool.query(`
      SELECT id, client_id, created_date
      FROM loans
      WHERE created_date BETWEEN '2025-01-01' AND '2025-12-31'
    `);

    if (!loans.length) {
      return res.json({
        total_clients: 0,
        reloan_first_month_clients: 0,
        percentage: "0%"
      });
    }

    const loanIds = loans.map(l => l.id);

    // 2️⃣ Get reloan-payment transactions
    const [reloanTx] = await pool.query(`
      SELECT loan_id, created_at
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND transaction_type = 'repayment'
        AND payment_apply_to = 'reloan_payment'
    `, [loanIds]);

    // 3️⃣ Group loans by id
    const loanMap = {};
    for (const loan of loans) {
      loanMap[loan.id] = loan;
    }

    const reloanClients = new Set();

    // 4️⃣ Check month difference
    for (const tx of reloanTx) {
      const loan = loanMap[tx.loan_id];
      if (!loan) continue;

      const loanDate = new Date(loan.created_date);
      const reloanDate = new Date(tx.created_at);

      const monthsBetween =
        (reloanDate.getFullYear() - loanDate.getFullYear()) * 12 +
        (reloanDate.getMonth() - loanDate.getMonth());

      if (monthsBetween === 1) {
        reloanClients.add(loan.client_id);
      }
    }

    const totalClients = new Set(loans.map(l => l.client_id)).size;
    const reloanCount = reloanClients.size;

    const percentage =
      totalClients > 0
        ? ((reloanCount / totalClients) * 100).toFixed(2) + "%"
        : "0%";

    res.json({
      total_clients: totalClients,
      reloan_first_month_clients: reloanCount,
      percentage
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/clients-no-loan-next-month-after-full-payment-2025', async (req, res) => {
  try {
    // 1️⃣ Get all loans created in 2025
    const [loans] = await pool.query(`
      SELECT id, client_id, created_date
      FROM loans
      WHERE created_date BETWEEN '2025-01-01' AND '2025-12-31'
      ORDER BY created_date ASC
    `);

    if (!loans.length) {
      return res.json({
        total_clients: 0,
        clients_no_loan_next_month: {
          count: 0,
          percentage: "0%"
        }
      });
    }

    const loanIds = loans.map(l => l.id);

    // 2️⃣ Get all full-payment transactions
    const [fullPayments] = await pool.query(`
      SELECT loan_id, created_at
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND transaction_type = 'repayment'
        AND payment_apply_to = 'full_payment'
    `, [loanIds]);

    // 3️⃣ Group loans by client
    const loansByClient = {};
    for (const loan of loans) {
      if (!loansByClient[loan.client_id]) {
        loansByClient[loan.client_id] = [];
      }
      loansByClient[loan.client_id].push(loan);
    }

    // 4️⃣ Map full payment dates by loan
    const fullPaymentByLoan = {};
    for (const tx of fullPayments) {
      fullPaymentByLoan[tx.loan_id] = new Date(tx.created_at);
    }

    const totalClients = new Set(loans.map(l => l.client_id)).size;
    const clientsNoLoanNextMonth = new Set();

    // 5️⃣ Analyze behavior
    for (const clientId in loansByClient) {
      const clientLoans = loansByClient[clientId]
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

      for (let i = 0; i < clientLoans.length; i++) {
        const loan = clientLoans[i];
        const fullPaymentDate = fullPaymentByLoan[loan.id];

        // Only evaluate loans that were fully paid
        if (!fullPaymentDate) continue;

        const nextLoan = clientLoans[i + 1];

        // No next loan at all
        if (!nextLoan) {
          clientsNoLoanNextMonth.add(clientId);
          continue;
        }

        const nextLoanDate = new Date(nextLoan.created_date);

        const monthsBetween =
          (nextLoanDate.getFullYear() - fullPaymentDate.getFullYear()) * 12 +
          (nextLoanDate.getMonth() - fullPaymentDate.getMonth());

        // Did NOT get a loan in the following month
        if (monthsBetween !== 1) {
          clientsNoLoanNextMonth.add(clientId);
        }
      }
    }

    const count = clientsNoLoanNextMonth.size;
    const percentage =
      totalClients > 0
        ? ((count / totalClients) * 100).toFixed(2) + "%"
        : "0%";

    res.json({
      total_clients: totalClients,
      clients_no_loan_next_month: {
        count,
        percentage
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/average-time-to-first-reloan-2025', async (req, res) => {
  try {
    // 1️⃣ Get all loans created in 2025
    const [loans] = await pool.query(`
      SELECT id, client_id, created_date
      FROM loans
      WHERE created_date BETWEEN '2025-01-01' AND '2025-12-31'
      ORDER BY created_date ASC
    `);

    if (!loans.length) {
      return res.json({
        clients_with_reloans: 0,
        average_months_to_reloan: 0
      });
    }

    const loanIds = loans.map(l => l.id);

    // 2️⃣ Get reloan payment transactions
    const [reloanPayments] = await pool.query(`
      SELECT loan_id, created_at
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND transaction_type = 'repayment'
        AND payment_apply_to = 'reloan_payment'
      ORDER BY created_at ASC
    `, [loanIds]);

    // 3️⃣ Group loans by client
    const loansByClient = {};
    for (const loan of loans) {
      if (!loansByClient[loan.client_id]) {
        loansByClient[loan.client_id] = [];
      }
      loansByClient[loan.client_id].push(loan);
    }

    // 4️⃣ Group reloan payments by loan
    const reloanByLoan = {};
    for (const tx of reloanPayments) {
      if (!reloanByLoan[tx.loan_id]) {
        reloanByLoan[tx.loan_id] = [];
      }
      reloanByLoan[tx.loan_id].push(new Date(tx.created_at));
    }

    let totalMonths = 0;
    let clientsWithReloans = 0;

    // 5️⃣ Calculate months to first reloan
    for (const clientId in loansByClient) {
      const clientLoans = loansByClient[clientId]
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

      const firstLoan = clientLoans[0];
      const firstLoanDate = new Date(firstLoan.created_date);

      let firstReloanDate = null;

      // Find earliest reloan payment across all client loans
      for (const loan of clientLoans) {
        const reloanDates = reloanByLoan[loan.id];
        if (reloanDates && reloanDates.length) {
          const earliest = reloanDates[0];
          if (!firstReloanDate || earliest < firstReloanDate) {
            firstReloanDate = earliest;
          }
        }
      }

      if (!firstReloanDate) continue;

      const monthsBetween =
        (firstReloanDate.getFullYear() - firstLoanDate.getFullYear()) * 12 +
        (firstReloanDate.getMonth() - firstLoanDate.getMonth());

      totalMonths += monthsBetween;
      clientsWithReloans++;
    }

    const averageMonths =
      clientsWithReloans > 0
        ? (totalMonths / clientsWithReloans).toFixed(2)
        : 0;

    res.json({
      clients_with_reloans: clientsWithReloans,
      average_months_to_reloan: Number(averageMonths)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/average-months-to-default-after-reloan-2025', async (req, res) => {
  try {
    // 1️⃣ Get all loans created in 2025
    const [loans] = await pool.query(`
      SELECT id, client_id, created_date
      FROM loans
      WHERE created_date BETWEEN '2025-01-01' AND '2025-12-31'
      ORDER BY created_date ASC
    `);

    if (!loans.length) {
      return res.json({
        clients_with_reloan_and_default: 0,
        average_months_to_default_after_reloan: 0
      });
    }

    const loanIds = loans.map(l => l.id);

    // 2️⃣ Get full-payment transactions
    const [fullPayments] = await pool.query(`
      SELECT loan_id, created_at
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND transaction_type = 'repayment'
        AND payment_apply_to = 'full_payment'
    `, [loanIds]);

    const fullPaymentByLoan = {};
    for (const tx of fullPayments) {
      fullPaymentByLoan[tx.loan_id] = new Date(tx.created_at);
    }

    // 3️⃣ Get reloan-payment transactions
    const [reloanPayments] = await pool.query(`
      SELECT loan_id, created_at
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND transaction_type = 'repayment'
        AND payment_apply_to = 'reloan_payment'
      ORDER BY created_at ASC
    `, [loanIds]);

    const reloanByLoan = {};
    for (const tx of reloanPayments) {
      if (!reloanByLoan[tx.loan_id]) reloanByLoan[tx.loan_id] = [];
      reloanByLoan[tx.loan_id].push(new Date(tx.created_at));
    }

    // 4️⃣ Group loans by client
    const loansByClient = {};
    for (const loan of loans) {
      if (!loansByClient[loan.client_id]) loansByClient[loan.client_id] = [];
      loansByClient[loan.client_id].push(loan);
    }

    let totalMonths = 0;
    let clientsWithReloanAndDefault = 0;

    for (const clientId in loansByClient) {
      const clientLoans = loansByClient[clientId].sort(
        (a, b) => new Date(a.created_date) - new Date(b.created_date)
      );

      // 1️⃣ First reloan date for the client
      let firstReloanDate = null;
      for (const loan of clientLoans) {
        const reloanDates = reloanByLoan[loan.id];
        if (reloanDates && reloanDates.length) {
          const earliest = reloanDates[0];
          if (!firstReloanDate || earliest < firstReloanDate) {
            firstReloanDate = earliest;
          }
        }
      }

      if (!firstReloanDate) continue; // skip clients who never reloaned

      // 2️⃣ Find first defaulted loan after first reloan
      let firstDefaultLoanDate = null;
      for (const loan of clientLoans) {
        // Loan defaulted if it has NO full payment
        if (!fullPaymentByLoan[loan.id]) {
          const loanDate = new Date(loan.created_date);
          if (loanDate >= firstReloanDate) {
            if (!firstDefaultLoanDate || loanDate < firstDefaultLoanDate) {
              firstDefaultLoanDate = loanDate;
            }
          }
        }
      }

      if (!firstDefaultLoanDate) continue; // skip clients who never defaulted after reloan

      // 3️⃣ Months between first reloan and first default
      const monthsBetween =
        (firstDefaultLoanDate.getFullYear() - firstReloanDate.getFullYear()) * 12 +
        (firstDefaultLoanDate.getMonth() - firstReloanDate.getMonth());

      totalMonths += monthsBetween;
      clientsWithReloanAndDefault++;
    }

    const averageMonths =
      clientsWithReloanAndDefault > 0
        ? (totalMonths / clientsWithReloanAndDefault).toFixed(2)
        : 0;

    res.json({
      clients_with_reloan_and_default: clientsWithReloanAndDefault,
      average_months_to_default_after_reloan: Number(averageMonths)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


////new xomment 
app.get('/targets', async (req, res) => {
  try {
    const { loan_consultant_id } = req.query;

    if (!loan_consultant_id) {
      return res.status(400).json({ error: 'loan_consultant_id is required' });
    }

    const TARGET = 40000;

    // 1️⃣ Get all loans for consultant
    const [loans] = await pool.query(`
      SELECT id
      FROM loans
      WHERE loan_officer_id = ?
    `, [loan_consultant_id]);

    if (!loans.length) {
      return res.json({});
    }

    const loanIds = loans.map(l => l.id);

    // 2️⃣ Get relevant transactions
    const [transactions] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND transaction_type IN ('disbursement', 'repayment')
        AND date BETWEEN '2025-01-25' AND '2026-01-24'
    `, [loanIds]);

    // 3️⃣ Prepare cycle buckets
    const cycles = {
      '2025-01': 0, '2025-02': 0, '2025-03': 0,
      '2025-04': 0, '2025-05': 0, '2025-06': 0,
      '2025-07': 0, '2025-08': 0, '2025-09': 0,
      '2025-10': 0, '2025-11': 0, '2025-12': 0
    };

    // 4️⃣ Cycle resolver (25th → 24th)
    function getCycleMonth(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();

      if (day <= 24) {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
      }

      return `${year}-${String(month).padStart(2, '0')}`;
    }

    // 5️⃣ Calculate raw given out per cycle
    transactions.forEach(t => {
      const cycle = getCycleMonth(t.date);
      if (!cycles.hasOwnProperty(cycle)) return;

      if (t.transaction_type === 'disbursement') {
        cycles[cycle] += Number(t.debit) || 0;
      }

      if (
        t.transaction_type === 'repayment' &&
        t.payment_apply_to === 'reloan_payment'
      ) {
        const reloanAmount =
          (Number(t.balance_bf) || 0) - (Number(t.credit) || 0);

        cycles[cycle] += Math.max(reloanAmount, 0);
      }
    });

    // 6️⃣ Apply rolling carry-over
    const orderedCycles = Object.keys(cycles).sort();
    const result = {};

    let carryForward = 0;

    orderedCycles.forEach(cycle => {
      const baseGivenOut = cycles[cycle];
      const totalWithCarry = baseGivenOut + carryForward;

      let carryOver = 0;

      if (totalWithCarry > TARGET) {
        carryOver = totalWithCarry - TARGET;
      }

      result[cycle] = {
        given_out: baseGivenOut,
        carry_in: carryForward,
        total_for_target: totalWithCarry,
        carry_over: carryOver
      };

      carryForward = carryOver;
    });

    res.json({
      loan_consultant_id,
      cycle_type: '25th_to_24th',
      target: TARGET,
      year: 2025,
      cycles: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/check-deposits', async (req, res) => {
  try {
    const { date, branch } = req.query;

    if (!date || !branch) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    // Query deposits for this branch and month
    const [deposits] = await pool.query(
      `
      SELECT deposit_type AS deposit_type_id
      FROM deposits
      WHERE office = ? AND DATE_FORMAT(date, '%Y-%m') = ?
      `,
      [branch, date] // date should be in YYYY-MM format
    );

    // Return array of deposits
    return res.json(deposits); 

  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/check-deposits-report', async (req, res) => {
  try {
    const { date, branch } = req.query;

    if (!date || !branch) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    // Query deposits for this branch and month
    const [deposits] = await pool.query(
      `
      SELECT *
      FROM deposits
      WHERE office = ? AND DATE_FORMAT(date, '%Y-%m') = ?
      `,
      [branch, date] // date should be in YYYY-MM format
    );

    // Return array of deposits
    return res.json(deposits); 

  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// create deposit
app.post('/create-deposit', async (req, res) => {
  try {
    const { deposit_type, office, amount, date, reference_number, user_id, deposit_method } = req.body;

    console.log(deposit_type,office,amount,date);
    if (deposit_type == null || office == null || amount == null || date == null) {
      return res.status(400).json({ error: 'All the fields are required' });
    }

    if (reference_number) {
      const [existingRef] = await pool.query(
        'SELECT id FROM bank_deposit_log WHERE reference_number = ?',
        [reference_number]
      );
      if (existingRef.length > 0) {
        return res.status(400).json({ error: 'Reference number already used' });
      }
    }

    // Extract month (YYYY-MM) from date
    const month = date.slice(0, 7);
    const currentMonth = new Date().toISOString().slice(0, 7);
    let debt;
    if (month < currentMonth) {
      debt = true;
    } else {
      debt = deposit_type == 0;
    }

    const [result] = await pool.query(
      `INSERT INTO deposits (deposit_type, office, amount, date, debt) VALUES (?, ?, ?, ?, ?)`,
      [deposit_type, office, amount, date, debt]
    );

    // Future Addition, once the setup debts have started
    // if (debt) {
    //   const [debtYear, debtMonth] = month.split('-').map(Number);
    //   await pool.query(
    //     `UPDATE office_debts 
    //      SET outstanding_amount = GREATEST(0, outstanding_amount - ?)
    //      WHERE office_id = ?
    //        AND deposit_type_id = ?
    //        AND debt_month = ?
    //        AND debt_year = ?
    //        AND outstanding_amount > 0`,
    //     [amount, office, deposit_type, debtMonth, debtYear]
    //   );
    // }

    // Create bank deposit log
    await pool.query(
      `INSERT INTO bank_deposit_log 
       (deposit_type, office_id, user_id, reference_number, amount, deposit_method, deposit_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [deposit_type, office, user_id, reference_number, amount, deposit_method, result.insertId]
    );

    return res.json({
      message: 'Deposit created successfully',
      deposit_id: result.insertId
    });

  } catch (error) {
    console.error('Error creating deposit:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/deposit-types', async (req, res) => {
  try {
    const { office_id } = req.query;

    const [deposit_types] = await pool.query('SELECT * FROM deposit_types ORDER BY sort_order ASC');

    const typesWithActions = deposit_types.map(d => ({
      ...d,
      this_month_endpoint: `/deposit-types/${d.id}/this-month?office_id=${office_id || ''}`,
      history_endpoint: `/deposit-types/${d.id}/history?office_id=${office_id || ''}`
    }));

    return res.json({
      success: true,
      data: typesWithActions
    });

  } catch (error) {
    console.error('Error fetching deposit types:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Route 1: this-month endpoint
app.get('/deposit-types/:depositTypeId/this-month', async (req, res) => {
  try {
    const { depositTypeId } = req.params;
    const { office_id, month } = req.query;

    if (!office_id) {
      return res.status(400).json({ error: 'office_id is required' });
    }

    const selectedMonth = month || new Date().toISOString().slice(0, 7);

    const [deposits] = await pool.query(
      `SELECT d.*, dt.name AS deposit_type_name, dt.monthly_amount, dt.bank, dt.gl_account,
              bdl.id AS bank_deposit_log_id,
              bdl.user_id AS bank_deposit_log_user_id,
              bdl.amount AS bank_deposit_log_amount,
              bdl.deposit_method AS bank_deposit_log_method,
              bdl.reference_number AS bank_deposit_log_reference_number,
              bdl.created_date AS bank_deposit_log_created_date
      FROM deposits d
      LEFT JOIN deposit_types dt ON d.deposit_type = dt.id
      LEFT JOIN bank_deposit_log bdl
        ON bdl.deposit_id = d.id
        AND bdl.deposit_type = d.deposit_type
        AND bdl.office_id = d.office
        AND DATE_FORMAT(bdl.created_date, '%Y-%m') = DATE_FORMAT(d.date, '%Y-%m')
      WHERE d.deposit_type = ?
        AND d.office = ?
        AND DATE_FORMAT(d.date, '%Y-%m') = ?
      ORDER BY dt.sort_order ASC`,
      [depositTypeId, office_id, selectedMonth]
    );

    return res.json({
      success: true,
      data: deposits
    });

  } catch (error) {
    console.error('Error fetching this month deposits:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Route 2: history endpoint
app.get('/deposit-types/:depositTypeId/history', async (req, res) => {
  try {
    const { depositTypeId } = req.params;
    const { office_id, month } = req.query;

    if (!office_id) {
      return res.status(400).json({ error: 'office_id is required' });
    }

    let query = `SELECT d.*, dt.name AS deposit_type_name, dt.monthly_amount, dt.bank, dt.gl_account,
                        bdl.id AS bank_deposit_log_id,
                        bdl.user_id AS bank_deposit_log_user_id,
                        bdl.amount AS bank_deposit_log_amount,
                        bdl.deposit_method AS bank_deposit_log_method,
                        bdl.reference_number AS bank_deposit_log_reference_number,
                        bdl.created_date AS bank_deposit_log_created_date
                 FROM deposits d
                 LEFT JOIN deposit_types dt ON d.deposit_type = dt.id
                 LEFT JOIN bank_deposit_log bdl
                   ON bdl.deposit_id = d.id
                  AND bdl.deposit_type = d.deposit_type
                  AND bdl.office_id = d.office
                 WHERE d.deposit_type = ? AND d.office = ?`;
    let params = [depositTypeId, office_id];

    if (month) {
      query += ` AND DATE_FORMAT(d.date, '%Y-%m') = ?`;
      params.push(month);
    }

    query += ` ORDER BY dt.sort_order ASC`;

    const [deposits] = await pool.query(query, params);

    return res.json({
      success: true,
      data: deposits
    });

  } catch (error) {
    console.error('Error fetching deposit history:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/daily-reports', async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      office_id = 0,
      selected_expense_type = null,
      id: loan
    } = req.query;

    let data = [];
    let part_data = [];
    let reloans_data = [];
    let top_up = [];
    let new_loans = [];
    let advances = [];
    let expenses = [];
    let pending_loans = [];
    let pending_loans_grouped = {};

    // branches (Office::select('id','name')->orderBy('name')->get())
    const [branches] = await pool.query(`
      SELECT id, name
      FROM offices
      ORDER BY name
    `);

    // expenseTypes (ExpenseType::all())
    const [expenseTypes] = await pool.query(`
      SELECT *
      FROM expense_types
    `);

    if (!start_date || !end_date) {
      return res.json({
        start_date,
        end_date,
        data,
        part_data,
        reloans_data,
        new_loans,
        office_id,
        top_up,
        expenses,
        advances,
        expenseTypes,
        selected_expense_type,
        pending_loans_grouped,
        branches
      });
    }

    const officeFilter = office_id != 0 ? `AND office_id = ?` : ``;
    const officeParams = office_id != 0 ? [office_id] : [];

    /* ===========================
       FULL PAYMENTS
    ============================ */
    [data] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
        AND payment_apply_to = 'full_payment'
        AND reversed = 0
        AND date BETWEEN ? AND ?
        ${officeFilter}
    `, [start_date, end_date, ...officeParams]);

    /* ===========================
       PART PAYMENTS
    ============================ */
    [part_data] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
        AND payment_apply_to = 'part_payment'
        AND reversed = 0
        AND date BETWEEN ? AND ?
        ${officeFilter}
    `, [start_date, end_date, ...officeParams]);

    /* ===========================
       RELOAN PAYMENTS
    ============================ */
    [reloans_data] = await pool.query(`
      SELECT *
      FROM loan_transactions
      WHERE transaction_type = 'repayment'
        AND payment_apply_to = 'reloan_payment'
        AND reversed = 0
        AND date BETWEEN ? AND ?
        ${officeFilter}
    `, [start_date, end_date, ...officeParams]);

    /* ===========================
       EXPENSES
    ============================ */
    [expenses] = await pool.query(`
      SELECT *
      FROM expenses
      WHERE date BETWEEN ? AND ?
      ${officeFilter}
    `, [start_date, end_date, ...officeParams]);

    /* ===========================
       ADVANCES
    ============================ */
    [advances] = await pool.query(`
      SELECT *
      FROM advances
      WHERE date_approved BETWEEN ? AND ?
      ${officeFilter}
    `, [start_date, end_date, ...officeParams]);

    /* ===========================
       TOP UPS
    ============================ */
    if (office_id != 0) {
      [top_up] = await pool.query(`
        SELECT *
        FROM loan_topup
        WHERE date BETWEEN ? AND ?
          AND office_id = ?
      `, [start_date, end_date, office_id]);
    } else {
      [top_up] = await pool.query(`
        SELECT *
        FROM loan_topup
        WHERE date BETWEEN ? AND ?
          AND status = 'approved'
      `, [start_date, end_date]);
    }

    /* ===========================
       PENDING LOANS
    ============================ */
    [pending_loans] = await pool.query(`
      SELECT *
      FROM loans
      WHERE status IN ('pending', 'approved')
        AND created_date BETWEEN ? AND ?
        ${officeFilter}
    `, [start_date, end_date, ...officeParams]);

    /* ===========================
       NEW LOANS
    ============================ */
    [new_loans] = await pool.query(`
      SELECT *
      FROM loan
      WHERE status IN ('disbursed', 'closed')
        AND disbursement_date BETWEEN ? AND ?
        ${officeFilter}
    `, [start_date, end_date, ...officeParams]);

    /* ===========================
       GROUP PENDING LOANS BY OFFICE
    ============================ */
    pending_loans.forEach(loan => {
      if (!pending_loans_grouped[loan.office_id]) {
        pending_loans_grouped[loan.office_id] = [];
      }
      pending_loans_grouped[loan.office_id].push(loan);
    });

    res.json({
      start_date,
      end_date,
      data,
      part_data,
      reloans_data,
      new_loans,
      office_id,
      top_up,
      expenses,
      advances,
      expenseTypes,
      selected_expense_type,
      pending_loans_grouped,
      branches
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

//new chages
app.post('/targets-met', async (req, res) => {
  try {
    /* ===============================
       0. Fixed cycle dates
    =============================== */
    const cycle_end = 24;

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const currentYearMonth = todayStr.slice(0, 7);

    let cycleDate = new Date(`${currentYearMonth}-${cycle_end}`);

    let startDate = new Date(cycleDate);
    startDate.setDate(startDate.getDate() + 1);

    if (today < cycleDate) {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    let endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const start_date = startDate.toISOString().slice(0, 10);
    const end_date = endDate.toISOString().slice(0, 10);

    /* ===============================
       1. Get ALL loan consultants
    =============================== */
    const [consultants] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.office_id
      FROM users u
      JOIN role_users ru ON ru.user_id = u.id
      WHERE ru.role_id = 3
    `);

    if (!consultants.length) return res.sendStatus(204);

    const userIds = consultants.map(u => u.id);

    /* ===============================
       2. Target tracker
    =============================== */
    const [trackers] = await pool.query(`SELECT * FROM target_tracker`);
    const trackerByUser = {};
    trackers.forEach(t => trackerByUser[t.user_id] = t);

    /* ===============================
       3. Loans
    =============================== */
    const [loans] = await pool.query(`
      SELECT id, loan_officer_id
      FROM loans
      WHERE loan_officer_id IN (?)
    `, [userIds]);

    if (!loans.length) return res.sendStatus(204);

    const loanIds = loans.map(l => l.id);
    const loanToUser = {};
    loans.forEach(l => loanToUser[l.id] = l.loan_officer_id);

    /* ===============================
       4. Transactions
    =============================== */
    const [txInRange] = await pool.query(`
      SELECT loan_id, credit, transaction_type, payment_apply_to, balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?)
      AND date > ? AND date <= ?
    `, [loanIds, start_date, end_date]);

    const [txBefore] = await pool.query(`
      SELECT loan_id, debit, credit, transaction_type
      FROM loan_transactions
      WHERE loan_id IN (?)
      AND date < ?
    `, [loanIds, start_date]);

    /* ===============================
       5. Totals
    =============================== */
    const totals = {};
    userIds.forEach(id => {
      totals[id] = { total_uncollected: 0, total_collected: 0 };
    });

    // Opening balance
    txBefore.forEach(t => {
      const userId = loanToUser[t.loan_id];
      if (!userId) return;

      if (t.transaction_type !== 'specified_due_date_fee') {
        totals[userId].total_uncollected +=
          (Number(t.debit) || 0) - (Number(t.credit) || 0);
      }
    });

    // Collections
    txInRange.forEach(t => {
      const userId = loanToUser[t.loan_id];
      if (!userId) return;

      if (['repayment', 'interest_waiver'].includes(t.transaction_type)) {
        if (t.payment_apply_to === 'reloan_payment') {
          totals[userId].total_collected += Number(t.balance_bf) || 0;
        } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
          totals[userId].total_collected += Number(t.credit) || 0;
        }
      }
    });

    /* ===============================
       6. Existing reports (cycle-safe)
    =============================== */
    const [existingReports] = await pool.query(`
      SELECT user_id
      FROM target_reports
      WHERE DATE(date) >= ? AND DATE(date) < ?
    `, [start_date, end_date]);

    const existingUserIds = new Set(existingReports.map(r => r.user_id));

    /* ===============================
       7. Insert users who met targets
    =============================== */
    const inserts = [];

    consultants.forEach(u => {
      const tracker = trackerByUser[u.id];
      if (!tracker) return;

      const actual_given_out =
        (Number(tracker.given_out) || 0) +
        (Number(tracker.brought_f) || 0);

      if (actual_given_out < 40000) return;

      const still_uncollected =
        totals[u.id].total_uncollected - totals[u.id].total_collected;

      if (still_uncollected >= 5000) return;

      if (!existingUserIds.has(u.id)) {
        inserts.push([
          u.id,
          u.office_id,
          `${u.first_name} ${u.last_name}`,
          actual_given_out,
          Number(still_uncollected)
        ]);
      }
    });

    if (inserts.length > 0) {
      await pool.query(`
        INSERT INTO target_reports
          (user_id, office_id, name, given_out, uncollected)
        VALUES ?
      `, [inserts]);
    }

    res.sendStatus(204);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});


app.get('/dormant-loans-by-province/:province', async (req, res) => {
  const { province } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        o.id AS office_id,
        o.name AS office_name,
        l.*,
        CONCAT(c.first_name, ' ', c.last_name) AS client_name,
        CONCAT(u.first_name, ' ', u.last_name) AS loan_officer_name
      FROM offices o
      JOIN loans l ON l.office_id = o.id
      LEFT JOIN clients c ON c.id = l.client_id
      LEFT JOIN users u ON u.id = l.loan_officer_id
      WHERE o.province_id = ?
        AND l.status = 'disbursed'
        AND l.first_repayment_date < CURDATE()
        AND NOT EXISTS (
          SELECT 1
          FROM loan_transactions lt
          WHERE lt.loan_id = l.id
            AND lt.transaction_type = 'repayment'
        )
      ORDER BY o.id
    `, [province]);

    // Group loans by office
    const grouped = {};

    for (const row of rows) {
      if (!grouped[row.office_id]) {
        grouped[row.office_id] = {
          office_id: row.office_id,
          office_name: row.office_name,
          loans: []
        };
      }

      const { office_id, office_name, ...loan } = row;
      grouped[row.office_id].loans.push(loan);
    }

    res.json({
      success: true,
      province_id: province,
      offices: Object.values(grouped)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dormant loans by province'
    });
  }
});


app.get('/loan_balances_2024', async (req, res) => {
  try {
    const [loans] = await pool.query('SELECT id FROM loans WHERE status = "disbursed"');

    const balances = await Promise.all(
      loans.map(async (loan) => {
        const [transactions] = await pool.query(
          `SELECT debit, credit 
           FROM loan_transactions 
           WHERE loan_id = ? AND date <= ?`,
          [loan.id, '2024-12-24']
        );

        let debit = 0;
        let credit = 0;

        transactions.forEach((t) => {
          debit += Number(t.debit) || 0;
          credit += Number(t.credit) || 0;
        });

        const balance = debit - credit;

        // Only return if balance is non-zero
        if (balance !== 0) {
          return {
            loanId: loan.id,
            balance,
          };
        }
        return null; // We'll filter out later
      })
    );

    // Filter out nulls (loans with zero balance)
    const nonZeroBalances = balances.filter(b => b !== null);

    res.json(nonZeroBalances);
  } catch (err) {
    console.error('Error fetching loan balances:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET deposit logs with optional filters
app.get('/deposit-logs', async (req, res) => {
  try {
    const { branch, date } = req.query; // optional filters

    // Base query with JOINs for readable names
    let query = `
      SELECT 
        bdl.id,
        dt.name AS deposit_type_name,
        CONCAT(u.first_name, ' ', u.last_name) AS user_name,
        o.name AS office_name,
        bdl.amount,
        bdl.deposit_method,
        bdl.reference_number,
        bdl.created_date
      FROM bank_deposit_log AS bdl
      LEFT JOIN deposit_types AS dt ON bdl.deposit_type = dt.id
      LEFT JOIN users AS u ON bdl.user_id = u.id
      LEFT JOIN offices AS o ON bdl.office_id = o.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by branch
    if (branch) {
      query += ' AND bdl.office_id = ?';
      params.push(branch);
    }

    // Filter by date (YYYY-MM-DD)
    if (date) {
      query += ' AND DATE(bdl.created_date) = ?';
      params.push(date);
    }

    query += ' ORDER BY bdl.created_date DESC'; // latest first

    const [rows] = await pool.query(query, params);

    res.status(200).json(rows);

  } catch (error) {
    console.error('Error fetching deposit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});




// app.get('/create-target-report',async(req,res)=>{
//   try{
//     const {loan_consultant,amount} = req.body;
//     const [loans] = await pool.query(`
//       SELECT id from loans WHERE loan_officer_id = ?`,[loan_consultant])
//       const [transactions] = await pool.query 
//   }
// })


app.get('/users-list',async(req,res)=>{
  try{
    const [users] = await pool.query('select id,email,first_name,last_name,phone,office_id,gender,nrc_id from users');
    res.json[users[0]]
  }catch(err){
    console.log(err)
  }
})


app.get('/app-version', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM app_versions
      ORDER BY version_code DESC
      LIMIT 1
    `)

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'No app version found.'
      })
    }

    const version = rows[0]

    res.json({
      versionName: version.version_name,
      versionCode: version.version_code,
      mandatory: Boolean(version.mandatory),
      apkUrl: version.apk_url,
      notes: version.notes
    })

  } catch (err) {
    console.error('Error fetching app version:', err)

    res.status(500).json({
      message: 'Internal server error'
    })
  }
})



app.get('/download_qr_code/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query(`SELECT * FROM users WHERE id = ? `,[id]);
    const office = await pool.query(`SELECT * FROM offices WHERE id = ? `,[user[0][0].office_id])
    // Replace with your DB call
    const unique_id = office[0][0].external_id + '-' + user[0][0].id;
    const employee_name = user[0][0].first_name + user[0][0].last_name;
   

    const url = `https://loanconsultant.whencefinancesystem.com/${unique_id}`;

    const qrBuffer = await QRCode.toBuffer(url, {
      width: 400,
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=employee_${employee_name}.png`
    );

    res.send(qrBuffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/download_all_qr_codes', async (req, res) => {
  try {

    // 1️⃣ Get all users
    const [users] = await pool.query(`SELECT * FROM users`);

    // 2️⃣ Setup ZIP response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=employee_qr_codes.zip'
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // 3️⃣ Loop through users
    for (const user of users) {

      if (!user.office_id) continue;

      // Get office
      const [officeRows] = await pool.query(
        `SELECT * FROM offices WHERE id = ?`,
        [user.office_id]
      );

      if (!officeRows.length) continue;

      const office = officeRows[0];

      // Build unique ID (same as your logic)
      const unique_id = `${office.external_id}-${user.id}`;
      const employee_name = `${user.first_name}${user.last_name}`;

      const url = `https://loanconsultant.whencefinancesystem.com/${unique_id}`;

      // Generate QR
      const qrBuffer = await QRCode.toBuffer(url, {
        width: 400,
      });

      // Clean filename
      const safeName = employee_name
        .toLowerCase()
        .replace(/\s+/g, '_');

      // Add to ZIP
      archive.append(qrBuffer, {
        name: `employee_${safeName}.png`,
      });
    }

    // 4️⃣ Finalize ZIP
    await archive.finalize();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/employee-profile/:id',async(req,res)=>{
  try{
     const { id } = req.params;
    const user = await pool.query(`SELECT * FROM users WHERE id = ? `,[id]);
    const office = await pool.query(`SELECT * FROM offices WHERE id = ? `,[user[0][0].office_id])
    const employeeProfile = {
      firstName: user[0][0].first_name,
      lastName: user[0][0].last_name,
      branch: office[0][0].name,
      phone: user[0][0].mobile_number,
      gender: user[0][0].gender,
      nrc: user[0][0].nrc_id
    }
    res.json(employeeProfile)
  }catch(err){
    console.log(err)
    res.status(500).json({ error: "Server error" });
  }
})


app.get("/province-ledger-summary", async (req, res) => {
  try {
    const { province_id } = req.query;

    if (!province_id) {
      return res.status(400).json({ error: "Province ID is required" });
    }

    // Get all offices in the province
    const [offices] = await pool.query(
      `
      SELECT id, name
      FROM offices
      WHERE province_id = ?
      `,
      [province_id]
    );

    if (!offices.length) {
      return res.status(404).json({ error: "No offices found for this province" });
    }

    const branches = [];

    for (const office of offices) {
      const office_id = office.id;

      // Latest ledger entry for this office
      const [ledger] = await pool.query(
        `
        SELECT cash_balance, total_income
        FROM general_ledger
        WHERE office_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [office_id]
      );

      // Advances total since Jan 4 2025
      const [advances] = await pool.query(
        `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM advances
        WHERE office_id = ?
          AND status = 'approved'
          AND date_approved >= '2025-01-04'
        `,
        [office_id]
      );

      // Expenses total since Jan 4 2025
      const [expenses] = await pool.query(
        `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE office_id = ?
          AND status = 'approved'
          AND date >= '2025-01-04'
        `,
        [office_id]
      );

      // New loans total for TODAY ONLY
      const [newLoansResult] = await pool.query(
        `
        SELECT COALESCE(SUM(debit), 0) AS total
        FROM loan_transactions
        WHERE office_id = ?
          AND transaction_type = 'disbursement'
          AND created_at >= CURDATE()
          AND created_at < CURDATE() + INTERVAL 1 DAY
        `,
        [office_id]
      );

      // Advances paid back since Jan 4 2025
      const [advancesPaidBack] = await pool.query(
        `
        SELECT COALESCE(SUM(at.amount_paid), 0) AS total
        FROM advance_transactions at
        JOIN advances a ON at.advance_id = a.id
        WHERE a.office_id = ?
          AND at.created_at >= '2025-01-04'
        `,
        [office_id]
      );

      // Loan collections total for TODAY ONLY
      const [loanCollectedResult] = await pool.query(
        `
        SELECT COALESCE(SUM(credit), 0) AS total_collected
        FROM loan_transactions
        WHERE office_id = ?
          AND date >= CURDATE()
          AND date < CURDATE() + INTERVAL 1 DAY
          AND payment_apply_to IN ('full_payment', 'part_payment', 'reloan_payment')
        `,
        [office_id]
      );

      // -----------------------------
      // TODAY'S TRANSACTION BREAKDOWN
      // -----------------------------

      const [fullPayments] = await pool.query(
        `
    SELECT
  CONCAT(c.first_name, ' ', c.last_name) AS name,
  lt.credit AS amount,
  lt.date
FROM loan_transactions lt
JOIN loans l ON lt.loan_id = l.id
JOIN clients c ON l.client_id = c.id
WHERE lt.office_id = ?
  AND lt.transaction_type = 'repayment'
  AND lt.payment_apply_to = 'full_payment'
  AND lt.date >= CURDATE()
  AND lt.date < CURDATE() + INTERVAL 1 DAY
        `,
        [office_id]
      );

      const [reloans] = await pool.query(
        `
       SELECT
  CONCAT(c.first_name, ' ', c.last_name) AS name,
  lt.credit AS amount,
  lt.date
FROM loan_transactions lt
JOIN loans l ON lt.loan_id = l.id
JOIN clients c ON l.client_id = c.id
WHERE lt.office_id = ?
  AND lt.transaction_type = 'repayment'
  AND lt.payment_apply_to = 'reloan_payment'
  AND lt.date >= CURDATE()
  AND lt.date < CURDATE() + INTERVAL 1 DAY
        `,
        [office_id]
      );

      const [partPayments] = await pool.query(
        `
     SELECT
  CONCAT(c.first_name, ' ', c.last_name) AS name,
  lt.credit AS amount,
  lt.date
FROM loan_transactions lt
JOIN loans l ON lt.loan_id = l.id
JOIN clients c ON l.client_id = c.id
WHERE lt.office_id = ?
  AND lt.transaction_type = 'repayment'
  AND lt.payment_apply_to = 'part_payment'
  AND lt.date >= CURDATE()
  AND lt.date < CURDATE() + INTERVAL 1 DAY
        `,
        [office_id]
      );

      const [newLoansList] = await pool.query(
        `
        SELECT
          CONCAT(c.first_name, ' ', c.last_name) AS name,
          lt.debit AS amount,
          DATE(lt.created_at) AS date
        FROM loan_transactions lt
        JOIN loans l ON lt.loan_id = l.id
        JOIN clients c ON l.client_id = c.id
        WHERE lt.office_id = ?
          AND lt.transaction_type = 'disbursement'
          AND lt.created_at >= CURDATE()
          AND lt.created_at < CURDATE() + INTERVAL 1 DAY
        `,
        [office_id]
      );

      const [expensesList] = await pool.query(
        `
   SELECT
  name,
  amount,
  date
FROM expenses
WHERE office_id = ?
  AND status = 'approved'
  AND date >= CURDATE()
  AND date < CURDATE() + INTERVAL 1 DAY
        `,
        [office_id]
      );

      const [advancesList] = await pool.query(
        `
     SELECT
  CONCAT('Staff Advance - ', u.first_name, ' ', u.last_name) AS name,
  a.amount,
  a.date_approved AS date
FROM advances a
JOIN users u ON a.user_id = u.id
WHERE a.office_id = ?
  AND a.status = 'approved'
  AND a.date_approved >= CURDATE()
  AND a.date_approved < CURDATE() + INTERVAL 1 DAY
        `,
        [office_id]
      );

      // Calculations
      const initialCashBalance = Number(ledger[0]?.cash_balance || 0);
      const totalIncome = Number(ledger[0]?.total_income || 0);
      const totalAdvances = Number(advances[0]?.total || 0);
      const totalExpenses = Number(expenses[0]?.total || 0);
      const newLoans = Number(newLoansResult[0]?.total || 0);
      const totalAdvancesPaidBack = Number(advancesPaidBack[0]?.total || 0);
      const loanCollected = Number(loanCollectedResult[0]?.total_collected || 0);

      const closingCashBalance =
        initialCashBalance +
        totalIncome +
        totalAdvancesPaidBack +
        loanCollected -
        totalAdvances -
        totalExpenses -
        newLoans;

      branches.push({
        name: office.name,
        collections: loanCollected,
        new_loans: newLoans,
        cash_balance: closingCashBalance,
        transactions: {
          full_payments: fullPayments,
          reloans: reloans,
          part_payments: partPayments,
          new_loans: newLoansList,
          expenses: expensesList,
          advances: advancesList,
        },
      });
    }

    res.json({
      success: true,
      province_id,
      branches,
    });
  } catch (err) {
    console.error("Error in /province-ledger-summary:", err.stack || err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});


app.get("/branch-ledger-summary", async (req, res) => {
  try {
    const { branch_id } = req.query;

    if (!branch_id) {
      return res.status(400).json({ error: "Branch ID is required" });
    }

    // Get the branch
    const [branchesResult] = await pool.query(
      `SELECT id, name FROM offices WHERE id = ?`,
      [branch_id]
    );

    if (!branchesResult.length) {
      return res.status(404).json({ error: "Branch not found" });
    }

    const branch = branchesResult[0];
    const office_id = branch.id;

    // Latest ledger entry
    const [ledger] = await pool.query(
      `
      SELECT cash_balance, total_income
      FROM general_ledger
      WHERE office_id = ?
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [office_id]
    );

    // Advances total since Jan 4 2025
    const [advances] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM advances
      WHERE office_id = ?
        AND status = 'approved'
        AND date_approved >= '2025-01-04'
      `,
      [office_id]
    );

    // Expenses total since Jan 4 2025
    const [expenses] = await pool.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM expenses
      WHERE office_id = ?
        AND status = 'approved'
        AND date >= '2025-01-04'
      `,
      [office_id]
    );

    // New loans today
    const [newLoansResult] = await pool.query(
      `
      SELECT COALESCE(SUM(debit), 0) AS total
      FROM loan_transactions
      WHERE office_id = ?
        AND transaction_type = 'disbursement'
        AND created_at >= CURDATE()
        AND created_at < CURDATE() + INTERVAL 1 DAY
      `,
      [office_id]
    );

    // Advances paid back since Jan 4 2025
    const [advancesPaidBack] = await pool.query(
      `
      SELECT COALESCE(SUM(at.amount_paid), 0) AS total
      FROM advance_transactions at
      JOIN advances a ON at.advance_id = a.id
      WHERE a.office_id = ?
        AND at.created_at >= '2025-01-04'
      `,
      [office_id]
    );

    // Loan collections today
    const [loanCollectedResult] = await pool.query(
      `
      SELECT COALESCE(SUM(credit), 0) AS total_collected
      FROM loan_transactions
      WHERE office_id = ?
        AND date >= CURDATE()
        AND date < CURDATE() + INTERVAL 1 DAY
        AND payment_apply_to IN ('full_payment', 'part_payment', 'reloan_payment')
      `,
      [office_id]
    );

    // -----------------------------
    // TODAY'S TRANSACTION BREAKDOWN
    // -----------------------------
    const [fullPayments] = await pool.query(
      `
      SELECT CONCAT(c.first_name, ' ', c.last_name) AS name,
             lt.credit AS amount,
             lt.date
      FROM loan_transactions lt
      JOIN loans l ON lt.loan_id = l.id
      JOIN clients c ON l.client_id = c.id
      WHERE lt.office_id = ?
        AND lt.transaction_type = 'repayment'
        AND lt.payment_apply_to = 'full_payment'
        AND lt.date >= CURDATE()
        AND lt.date < CURDATE() + INTERVAL 1 DAY
      `,
      [office_id]
    );

    const [reloans] = await pool.query(
      `
      SELECT CONCAT(c.first_name, ' ', c.last_name) AS name,
             lt.credit AS amount,
             lt.date
      FROM loan_transactions lt
      JOIN loans l ON lt.loan_id = l.id
      JOIN clients c ON l.client_id = c.id
      WHERE lt.office_id = ?
        AND lt.transaction_type = 'repayment'
        AND lt.payment_apply_to = 'reloan_payment'
        AND lt.date >= CURDATE()
        AND lt.date < CURDATE() + INTERVAL 1 DAY
      `,
      [office_id]
    );

    const [partPayments] = await pool.query(
      `
      SELECT CONCAT(c.first_name, ' ', c.last_name) AS name,
             lt.credit AS amount,
             lt.date
      FROM loan_transactions lt
      JOIN loans l ON lt.loan_id = l.id
      JOIN clients c ON l.client_id = c.id
      WHERE lt.office_id = ?
        AND lt.transaction_type = 'repayment'
        AND lt.payment_apply_to = 'part_payment'
        AND lt.date >= CURDATE()
        AND lt.date < CURDATE() + INTERVAL 1 DAY
      `,
      [office_id]
    );

    const [newLoansList] = await pool.query(
      `
      SELECT CONCAT(c.first_name, ' ', c.last_name) AS name,
             lt.debit AS amount,
             DATE(lt.created_at) AS date
      FROM loan_transactions lt
      JOIN loans l ON lt.loan_id = l.id
      JOIN clients c ON l.client_id = c.id
      WHERE lt.office_id = ?
        AND lt.transaction_type = 'disbursement'
        AND lt.created_at >= CURDATE()
        AND lt.created_at < CURDATE() + INTERVAL 1 DAY
      `,
      [office_id]
    );

    const [expensesList] = await pool.query(
      `
      SELECT name, amount, date
      FROM expenses
      WHERE office_id = ?
        AND status = 'approved'
        AND date >= CURDATE()
        AND date < CURDATE() + INTERVAL 1 DAY
      `,
      [office_id]
    );

    const [advancesList] = await pool.query(
      `
      SELECT CONCAT('Staff Advance - ', u.first_name, ' ', u.last_name) AS name,
             a.amount,
             a.date_approved AS date
      FROM advances a
      JOIN users u ON a.user_id = u.id
      WHERE a.office_id = ?
        AND a.status = 'approved'
        AND a.date_approved >= CURDATE()
        AND a.date_approved < CURDATE() + INTERVAL 1 DAY
      `,
      [office_id]
    );

    // Calculations
    const initialCashBalance = Number(ledger[0]?.cash_balance || 0);
    const totalIncome = Number(ledger[0]?.total_income || 0);
    const totalAdvances = Number(advances[0]?.total || 0);
    const totalExpenses = Number(expenses[0]?.total || 0);
    const newLoans = Number(newLoansResult[0]?.total || 0);
    const totalAdvancesPaidBack = Number(advancesPaidBack[0]?.total || 0);
    const loanCollected = Number(loanCollectedResult[0]?.total_collected || 0);

    const closingCashBalance =
      initialCashBalance +
      totalIncome +
      totalAdvancesPaidBack +
      loanCollected -
      totalAdvances -
      totalExpenses -
      newLoans;

    res.json({
        name: branch.name,
        collections: loanCollected,
        new_loans: newLoans,
        cash_balance: closingCashBalance,
        transactions: {
          full_payments: fullPayments,
          reloans: reloans,
          part_payments: partPayments,
          new_loans: newLoansList,
          expenses: expensesList,
          advances: advancesList,
        },
    });
  } catch (err) {
    console.error("Error in /branch-ledger-summary:", err.stack || err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

///// WHENCE CLIENTS APP ENDPOITNS /////

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

app.post('/request-otp', async (req, res) => {
  try {
    let { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Identifier required' });
    }

    // Remove spaces
    identifier = identifier.trim();

    // Convert 0971234567 -> 260971234567
    let smsNumber = identifier;

    if (smsNumber.startsWith('0')) {
      smsNumber = '26' + smsNumber;
    }

    // Check if client exists using original number
    const [clients] = await pool.query(
      `SELECT * FROM clients WHERE mobile = ?`,
      [identifier]
    );

    if (clients.length === 0) {
      return res.status(400).json({
        error: 'This number is not registered with whence financial services'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete old OTPs
    await pool.query(
      'DELETE FROM clients_app_otp WHERE identifier = ?',
      [identifier]
    );

    // Save new OTP
    await pool.query(
      'INSERT INTO clients_app_otp (identifier, otp, expires_at) VALUES (?, ?, ?)',
      [identifier, otp, expiresAt]
    );

    // SMS text
    const message = `Your Whence Financial Services OTP is ${otp}. It expires in 5 minutes.`;

    // Send SMS
    // const smsResponse = await fetch(
    //   'https://mshastra.com/sendurl.aspx',
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify([
    //       {
    //         user: 'WHENCE',
    //         pwd: 'Lh4GyF3n',
    //         number: smsNumber,
    //         msg: message,
    //         sender: 'WHENCELTD',
    //         language: 'English'
    //       }
    //     ])
    //   }
    // );

    const smsResponse = fetch('https://whencefinancesystem.com/api/send-sms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    phone: smsNumber,
    message: message
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log('SMS result', data);
  })
  .catch((err) => {
    console.error('SMS error', err);
  });

    

    res.json({
      client_id: clients[0].id,
      message: 'success'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/send-sms', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      message: 'Phone and message are required.'
    });
  }

  try {
    const smsResponse = await fetch('https://whencefinancesystem.com/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        phone,
        message
      }),
    });

    const data = await smsResponse.json();

    return res.status(smsResponse.status).json(data);

  } catch (error) {
    console.error('SMS error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send SMS.',
      error: error.message
    });
  }
});



app.post('/verify-otp',async(req,res)=>{
  try{
    const {identifier,otp} = req.body;

      if (!identifier || !otp) {
      return res.status(400).json({ error: 'Missing fields' });
    }

        const [rows] = await pool.query(
      'SELECT * FROM clients_app_otp WHERE identifier = ? LIMIT 1',
      [identifier]
    );

       if (rows.length === 0) {
      return res.status(400).json({ error: 'No OTP found' });
    }


    const record = rows[0];

        if (new Date(record.expires_at) < new Date()) {
      await pool.query('DELETE FROM clients_app_otp WHERE identifier = ?', [identifier]);
      return res.status(400).json({ error: 'OTP expired' });
    }

    const isValid = String(record.otp) === String(otp);

        if (!isValid) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

     await pool.query('DELETE FROM clients_app_otp WHERE identifier = ?', [identifier]);

     var user;

  if (identifier.includes('@')) {
  // Treat as email
 user = await pool.query(`SELECT * FROM clients WHERE email = ? `,[identifier])
} else {
  // Treat as phone number
 user = await pool.query(`SELECT * FROM clients WHERE mobile = ? `,[identifier])
}

res.json(user[0][0])
  }catch(err){
    console.log(err)
  }
})




app.post("/clients-sign-up", async (req, res) => {
  try {
    const { email, password, verification_code, client_id } = req.body;

    const hashPassword = await bcrypt.hash(password, 11);

    const checkUser = await pool.query(
      "SELECT * FROM clientapp_users WHERE email = ?",
      [email]
    );

    // If user already exists
    if (checkUser[0].length > 0) {
      return res.json(checkUser[0][0]);
    }

    // Create user
    const newUser = await pool.query(
      "INSERT INTO clientapp_users (email, password, client_id) VALUES (?, ?, ?)",
      [email, hashPassword, client_id]
    );

    // Fetch the full created user
    const createdUser = await pool.query(
      "SELECT * FROM clientapp_users WHERE id = ?",
      [newUser[0].insertId]
    );

    return res.json({
      message: "User created successfully",
      user: createdUser[0][0]
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "an error occurred" });
  }
});

app.post("/clients-sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM clientapp_users WHERE email = ?",
      [email]
    );

    if (user[0].length === 0) {
      return res.json("wrong");
    }

    const isPasswordMatching = await bcrypt.compare(
      password,
      user[0][0].password
    );

    if (isPasswordMatching) {
      return res.json(user[0][0]);
    } else {
      return res.json("wrong");
    }
  } catch (err) {
    console.log(err);
    return res.json("2001");
  }
});

app.get("/client_active_loan_object/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [loans] = await pool.query(
      `SELECT * FROM loans WHERE id = ?`,
      [id]
    );

    if (loans.length === 0) {
      return res.status(404).json({ message: "No active loan found" });
    }

    const loan = loans[0];

    // Fetch related data AFTER loan is known
    const [[client]] = await pool.query(
      `SELECT first_name, last_name FROM clients WHERE id = ?`,
      [id]
    );

    const [[office]] = await pool.query(
      `SELECT id,name,withinhere_branch_id,withinhere_wallet_id  FROM offices WHERE id = ?`,
      [loan.office_id]
    );

    const [[user]] = await pool.query(
      `SELECT first_name, last_name, phone FROM users WHERE id = ?`,
      [loan.loan_officer_id]
    );

    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions WHERE loan_id = ?`,
      [loan.id]
    );

    // Calculate balance
    let totalDebit = 0;
    let totalCredit = 0;

    transactions.forEach(tx => {
      totalDebit += Number(tx.debit || 0);
      totalCredit += Number(tx.credit || 0);
    });

    const loanBalance = totalDebit - totalCredit;

    res.json({
      loan,
      transactions,
      loanBalance,
      client: client || null,
      office: office || null,
      user: user || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/client_active_loan/:client_id", async (req, res) => {
  try {
    const { client_id } = req.params;

    const [loans] = await pool.query(
      `SELECT * FROM loans WHERE client_id = ? AND status = 'disbursed'`,
      [client_id]
    );

    if (loans.length === 0) {
      return res.status(404).json({ message: "No active loan found" });
    }

    const loan = loans[0];

    // Fetch related data AFTER loan is known
    const [[client]] = await pool.query(
      `SELECT first_name, last_name FROM clients WHERE id = ?`,
      [client_id]
    );

    const [[office]] = await pool.query(
      `SELECT name, withinhere_branch_id, withinhere_wallet_id FROM offices WHERE id = ?`,
      [loan.office_id]
    );

    const [[user]] = await pool.query(
      `SELECT first_name, last_name, phone FROM users WHERE id = ?`,
      [loan.loan_officer_id]
    );

    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions WHERE loan_id = ?`,
      [loan.id]
    );

    // Calculate balance
    let totalDebit = 0;
    let totalCredit = 0;

    transactions.forEach(tx => {
      totalDebit += Number(tx.debit || 0);
      totalCredit += Number(tx.credit || 0);
    });

    const loanBalance = totalDebit - totalCredit;

    res.json({
      loan,
      transactions,
      loanBalance,
      client: client || null,
      office: office || null,
      user: user || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get("/client_transactions/:client_id", async (req, res) => {
  try {
    const { client_id } = req.params;

    const [loans] = await pool.query(
      `SELECT id FROM loans WHERE client_id = ?`,
      [client_id]
    );

    if (loans.length === 0) {
      return res.status(404).json({ message: "No loans found" });
    }

    const loanIds = loans.map(loan => loan.id);

    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions 
       WHERE loan_id IN (?) 
       ORDER BY date DESC`,
      [loanIds]
    );

    res.json(transactions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/transaction_app/:transaction_id", async (req, res) => {
  try {
    const { transaction_id } = req.params;

    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions WHERE id = ? LIMIT 1`,
      [transaction_id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transactions[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/client_loans_app/:client_id", async (req, res) => {
  try {
    const { client_id } = req.params;

 const [loans] = await pool.query(
  `SELECT * FROM loans 
   WHERE client_id = ? 
   ORDER BY created_date DESC`,
  [client_id]
);

    if (loans.length === 0) {
      return res.status(404).json({ message: "No active loans found" });
    }

    const results = await Promise.all(
      loans.map(async (loan) => {
        const [[office]] = await pool.query(
          `SELECT name FROM offices WHERE id = ?`,
          [loan.office_id]
        );

        const [[user]] = await pool.query(
          `SELECT first_name, last_name, phone FROM users WHERE id = ?`,
          [loan.loan_officer_id]
        );

        const [transactions] = await pool.query(
          `SELECT * FROM loan_transactions WHERE loan_id = ?`,
          [loan.id]
        );

        let totalDebit = 0;
        let totalCredit = 0;

        transactions.forEach(tx => {
          totalDebit += Number(tx.debit || 0);
          totalCredit += Number(tx.credit || 0);
        });

        const balance = totalDebit - totalCredit;

        return {
          loan,
          transactions,
          balance,
          office: office || null,
          loanOfficer: user || null
        };
      })
    );

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/loan_app/:loan_id", async (req, res) => {
  try {
    const { loan_id } = req.params;

    const [[loan]] = await pool.query(
      `SELECT * FROM loans WHERE id = ?`,
      [loan_id]
    );

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const [[office]] = await pool.query(
      `SELECT name FROM offices WHERE id = ?`,
      [loan.office_id]
    );

    const [[user]] = await pool.query(
      `SELECT first_name, last_name, phone FROM users WHERE id = ?`,
      [loan.loan_officer_id]
    );

    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions WHERE loan_id = ?`,
      [loan_id]
    );

    let totalDebit = 0;
    let totalCredit = 0;

    transactions.forEach(tx => {
      totalDebit += Number(tx.debit || 0);
      totalCredit += Number(tx.credit || 0);
    });

    const balance = totalDebit - totalCredit;

    res.json({
      loan,
      transactions,
      balance,
      office: office || null,
      loanOfficer: user || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/loan-monthly-balances-2025', async (req, res) => {
  try {
    // 1. Get all loan transactions for 2025
const [transactions] = await pool.query(`
  SELECT 
    loan_id,
    DATE_FORMAT(date, '%Y-%m') AS month,
    SUM(debit - credit) AS monthly_change
  FROM loan_transactions
  WHERE date BETWEEN '2025-01-01' AND '2025-12-31'
  GROUP BY loan_id, DATE_FORMAT(date, '%Y-%m')
  ORDER BY loan_id, month
`);

    // 2. Get all loans
    const [loans] = await pool.query(`SELECT id AS loan_id FROM loans`);

    const months = [
      '2025-01','2025-02','2025-03','2025-04',
      '2025-05','2025-06','2025-07','2025-08',
      '2025-09','2025-10','2025-11','2025-12'
    ];

    // 3. Organize transactions by loan
    const map = {};

    for (const t of transactions) {
      if (!map[t.loan_id]) map[t.loan_id] = {};
      map[t.loan_id][t.month] = Number(t.monthly_change);
    }

    const results = [];

    // 4. Compute running balance per loan
    for (const loan of loans) {
      let runningBalance = 0;

      for (const month of months) {
        runningBalance += map[loan.loan_id]?.[month] || 0;

        results.push({
          loan_id: loan.loan_id,
          month,
          balance: runningBalance
        });
      }
    }

    res.json(results);

  } catch (err) {
    console.error('Error fetching loan monthly balances:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/balances-after-part-payments', async (req, res) => {
  try {

    const months = [
      '2025-01','2025-02','2025-03','2025-04','2025-05','2025-06',
      '2025-07','2025-08','2025-09','2025-10','2025-11','2025-12'
    ];

    const results = await Promise.all(
      months.map(async (month) => {

        // 1. loans with part payments in that month
        const [loans] = await pool.query(`
          SELECT DISTINCT loan_id
          FROM loan_transactions
          WHERE transaction_type = 'repayment'
            AND payment_apply_to = 'part_payment'
            AND DATE_FORMAT(date, '%Y-%m') = ?
        `, [month]);

        if (loans.length === 0) {
          return { month, total_balance: 0 };
        }

        const loanBalances = await Promise.all(
          loans.map(async (l) => {

            // 2. cutoff date per loan per month
            const [cutoffRows] = await pool.query(`
              SELECT MIN(date) AS cutoff_date
              FROM loan_transactions
              WHERE loan_id = ?
                AND transaction_type = 'repayment'
                AND payment_apply_to = 'part_payment'
                AND DATE_FORMAT(date, '%Y-%m') = ?
            `, [l.loan_id, month]);

            const cutoffDate = cutoffRows[0]?.cutoff_date;

            if (!cutoffDate) return 0;

            // 3. balance before cutoff
            const [balanceRows] = await pool.query(`
              SELECT COALESCE(SUM(COALESCE(debit,0) - COALESCE(credit,0)), 0) AS balance
              FROM loan_transactions
              WHERE loan_id = ?
                AND date <= ?
            `, [l.loan_id, cutoffDate]);

            return Number(balanceRows[0].balance || 0);
          })
        );

        const total = loanBalances.reduce((a, b) => a + b, 0);

        return {
          month,
          total_balance: total
        };
      })
    );

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get('/company-pdua-2025', async (req, res) => {
  try {

    // 1. Get all loans once
    const [loans] = await pool.query(`
      SELECT id FROM loans
    `);

    const loanIds = loans.map(l => l.id);

    if (loanIds.length === 0) {
      return res.json([]);
    }

    const results = [];

    // 2. Loop through months
    for (let month = 0; month < 12; month++) {

      const start_date = new Date(2025, month, 1);
      const end_date = new Date(2025, month + 1, 0);

      const start = start_date.toISOString().slice(0, 10);
      const end = end_date.toISOString().slice(0, 10);

      // Transactions within month
      const [transactions] = await pool.query(`
        SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?) 
          AND date >= ? AND date <= ?
      `, [loanIds, start, end]);

      // Transactions before month (plus interest waivers)
      const [transactions_two] = await pool.query(`
        SELECT loan_id, debit, credit, transaction_type, payment_apply_to, balance_bf
        FROM loan_transactions
        WHERE loan_id IN (?)
          AND (
            date < ?
            OR transaction_type = 'interest_waiver'
          )
      `, [loanIds, start]);

      let total_collected = 0;
      let total_uncollected = 0;

      // Collected
      transactions.forEach(t => {
        const credit = Number(t.credit) || 0;

        if (t.transaction_type === 'repayment') {
          if (t.payment_apply_to === 'reloan_payment') {
            total_collected += Number(t.balance_bf) || 0;
          } else if (['full_payment', 'part_payment'].includes(t.payment_apply_to)) {
            total_collected += credit;
          }
        }
      });

      // Uncollected
      transactions_two.forEach(t => {
        const debit = Number(t.debit) || 0;
        const credit = Number(t.credit) || 0;

        if (t.transaction_type !== 'specified_due_date_fee') {
          total_uncollected += (debit - credit);
        }
      });

      const pdua = total_uncollected === 0
        ? 0
        : (total_collected / total_uncollected) * 100;

      results.push({
        month: start_date.toLocaleString('default', { month: 'long' }),
        pdua: pdua.toFixed(2)
      });
    }

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.get('/diversity-and-inclusion', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        gender,
        COUNT(*) AS count,
        totals.total_users,
        ROUND((COUNT(*) / totals.total_users) * 100, 2) AS percentage,
        ROUND(((COUNT(*) / totals.total_users) * 100) - 50, 2) AS difference_from_target
      FROM users
      CROSS JOIN (
        SELECT COUNT(*) AS total_users
        FROM users
        WHERE status = 'Active'
      ) AS totals
      WHERE status = 'Active'
      GROUP BY gender, totals.total_users
    `);

    res.json({
      total_users: results.length > 0 ? results[0].total_users : 0,
      breakdown: results
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


app.get('/tenure-and-stability', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        band,
        COUNT(*) AS count,
        totals.total_users,
        ROUND((COUNT(*) / totals.total_users) * 100, 2) AS percentage
      FROM (
        SELECT 
          CASE
            WHEN date_of_joining IS NULL THEN 'Unknown'
            WHEN TIMESTAMPDIFF(YEAR, date_of_joining, CURDATE()) < 1 THEN '<1 year'
            WHEN TIMESTAMPDIFF(YEAR, date_of_joining, CURDATE()) BETWEEN 1 AND 2 THEN '1-2 years'
            WHEN TIMESTAMPDIFF(YEAR, date_of_joining, CURDATE()) BETWEEN 3 AND 5 THEN '3-5 years'
            WHEN TIMESTAMPDIFF(YEAR, date_of_joining, CURDATE()) > 5 THEN '5+ years'
          END AS band
        FROM users
        WHERE status = 'Active'
      ) AS categorized
      CROSS JOIN (
        SELECT COUNT(*) AS total_users
        FROM users
        WHERE status = 'Active'
      ) AS totals
      GROUP BY band, totals.total_users
      ORDER BY 
        FIELD(band, '<1 year', '1-2 years', '3-5 years', '5+ years', 'Unknown');
    `);

    res.json({
      total_users: results.length > 0 ? results[0].total_users : 0,
      breakdown: results
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/office-workforce-insights', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        o.id AS office_id,
        o.name AS office_name,

        COUNT(u.id) AS total_users,

        -- Average tenure in years
        ROUND(AVG(
          CASE 
            WHEN u.date_of_joining IS NOT NULL 
            THEN TIMESTAMPDIFF(DAY, u.date_of_joining, CURDATE()) / 365
            ELSE NULL
          END
        ), 2) AS avg_tenure_years,

        -- Gender counts
        SUM(CASE WHEN u.gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
        SUM(CASE WHEN u.gender = 'Female' THEN 1 ELSE 0 END) AS female_count,

        -- Gender percentages
        ROUND(
          (SUM(CASE WHEN u.gender = 'Male' THEN 1 ELSE 0 END) / COUNT(u.id)) * 100, 2
        ) AS male_percentage,

        ROUND(
          (SUM(CASE WHEN u.gender = 'Female' THEN 1 ELSE 0 END) / COUNT(u.id)) * 100, 2
        ) AS female_percentage

      FROM offices o
      LEFT JOIN users u 
        ON u.office_id = o.id 
        AND u.status = 'Active'

      GROUP BY o.id, o.name
      ORDER BY o.name;
    `);

    res.json(results);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


app.post('/client_apply_loan',async(req,res)=>{
  try{
    const {
        amount,
  branch,
  client_id,
  client_name,
  payment_method,
  payment_id,
  loan_purpose
    } = req.body;

    const [result] = await pool.query(
       ` INSERT INTO client_app_loan_applications (
       amount,
       branch,
       client_name,
       client_id,
       payment_method,
       payment_id,
       loan_purpose
       ) VALUES (?,?,?,?,?,?,?)`,
        [
                  amount,
  branch,
  client_name,
  client_id,
  payment_method,
  payment_id,
  loan_purpose,
        ]
    );

  res.status(200).json({ message: "Loan application successfull"});
  }catch(err){
    console.log(err);
    res.status(500).json({ message: "Error applying for loan" });
  }

})


app.get('/pending_client_application/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;

    const [pending_client_applications] = await pool.query(
      `SELECT * FROM client_app_loan_applications 
       WHERE client_id = ? AND status = ?`,
      [client_id, 'pending']
    );

    res.json(pending_client_applications);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Error fetching pending applications'
    });
  }
});


app.post('/create_transaction_webhook', async (req, res) => {
  try {
    const status = 'closed'

    const {
      created_by_id,
      office_id,
      loan_id,
      payment_apply_to,
      payment_detail_id,
      transaction_type,
      date,
      credit,
      notes,
      temp_id
    } = req.body;

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const transaction = await pool.query(
      `INSERT INTO loan_transactions (
        created_by_id,
        office_id,
        loan_id,
        payment_apply_to,
        payment_detail_id,
        transaction_type,
        date,
        credit,
        notes,
        temp_id,
        created_at,
        updated_at,
        client_app
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        created_by_id,
        office_id,
        loan_id,
        payment_apply_to,
        payment_detail_id,
        transaction_type,
        date,
        credit,
        notes,
        null,
        now,
        now,
        'Yes'
      ]
    )

    if (payment_apply_to == 'full_payment') {
      const loan = await pool.query(
        `UPDATE loans SET status = ? WHERE id = ?`,
        [status, loan_id]
      )
    }

    res.json(transaction)

  } catch (err) {
    console.log(err)
  }
})


app.post('/create_reloan_transaction_webhook', async (req, res) => {
  try {

    const {
      created_by_id,
      office_id,
      loan_id,
      balance_bf,
      date,
      credit,
      interest,
      temp_id
    } = req.body;

    // Extract year and month from date
    const splitDate = date.split('-');
    const year = splitDate[0];
    const month = splitDate[1];

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // =========================
    // REPAYMENT TRANSACTION
    // =========================
    const repaymentTransaction = await pool.query(
      `INSERT INTO loan_transactions (
        created_by_id,
        office_id,
        loan_id,
        balance_bf,
        transaction_type,
        payment_apply_to,
        date,
        year,
        month,
        credit,
        temp_id,
        created_at,
        updated_at,
        client_app
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        created_by_id,
        office_id,
        loan_id,
        balance_bf,
        'repayment',
        'reloan_payment',
        date,
        year,
        month,
        credit,
        null,
        now,
        now,
        'Yes'
      ]
    );

    const interestTransaction = await pool.query(
      `INSERT INTO loan_transactions (
        created_by_id,
        office_id,
        loan_id,
        transaction_type,
        date,
        year,
        month,
        debit,
        created_at,
        updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        created_by_id,
        office_id,
        loan_id,
        'interest',
        date,
        year,
        month,
        interest,
        now,
        now
      ]
    );

    res.status(201).json({
      success: true,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});



app.post('/update_client_app_image',upload.single('client_picture'),async(req,res)=>{

    const mimeToExt = {
        'image/jpeg': '.jpeg',
        'image/png': '.png',
        'image/webp': '.webp',
      };


      const ext = mimeToExt[req.file.mimetype];
    if (!ext) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }
  
   
    var client_picture = imageName();
    const params = {
        Bucket: 'wfssystem',
        Key: client_picture + ext,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        region:'nyc3',
        ACL: 'public-read',
    }

    console.log(client_picture)

    const command = new s3Client.PutObjectCommand(params)
    await s3.send(command)
    client_picture = client_picture + ext;
    try{
        const {client_id,loan_officer,office} = req.body;
        const new_picture = await pool.query('INSERT INTO client_app_picture_requests (client_id,loan_officer,office,image) VALUES (?,?,?,?)' , [
          client_id,
          loan_officer,
          office,
          client_picture
        ]);
        res.json(new_picture)
    }
catch(err){
    console.log(err)
}
   
})


app.get("/client_app_image_request/:client_id",async(req,res)=>{
    try{
        const {client_id} = req.params;
        const request =  await pool.query(`SELECT * FROM client_app_picture_requests WHERE client_id = ? `,[client_id]);
       res.json(request)
    } catch(err){
        console.log(err)
    }
})


app.post("/clients-update-email", async (req, res) => {
  try {
    const { client_id, email } = req.body;

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM clientapp_users WHERE email = ?",
      [email]
    );

    if (existingUser[0].length > 0) {
      return res.json("email_exists");
    }

    // Update email
    await pool.query(
      "UPDATE clientapp_users SET email = ? WHERE client_id = ?",
      [email, client_id]
    );

    return res.json("success");
  } catch (err) {
    console.log(err);
    return res.json("2001");
  }
});


app.post("/clients-update-password", async (req, res) => {
  try {
    const { client_id, current_password, new_password } = req.body;

    // Find user
    const user = await pool.query(
      "SELECT * FROM clientapp_users WHERE client_id = ?",
      [client_id]
    );

    if (user[0].length === 0) {
      return res.json("user_not_found");
    }

    // Check current password
    const isPasswordMatching = await bcrypt.compare(
      current_password,
      user[0][0].password
    );

    if (!isPasswordMatching) {
      return res.json("wrong_password");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.query(
      "UPDATE clientapp_users SET password = ? WHERE client_id = ?",
      [hashedPassword, client_id]
    );

    return res.json("success");

  } catch (err) {
    console.log(err);
    return res.json("2001");
  }
});



app.get("/expense-dashboard", async (req, res) => {
    try {

        const { start_date, end_date } = req.query;

        let whereClause = "";
        let params = [];

        if (start_date && end_date) {
            whereClause = `
                WHERE DATE(e.date) BETWEEN ? AND ?
            `;
            params.push(start_date, end_date);
        }

        // =========================================
        // Institution Summary
        // =========================================

        const [institutionRows] = await pool.query(`
            SELECT
                COUNT(*) as transactions,
                COALESCE(SUM(e.amount),0) as total_expenses,
                COALESCE(AVG(e.amount),0) as average_expense
            FROM expenses e
            ${whereClause}
        `, params);

        const institution = institutionRows[0];

        // =========================================
        // Province Summary
        // =========================================

        const [provinces] = await pool.query(`
            SELECT
                p.id as province_id,
                p.name as province_name,
                COUNT(*) as transactions,
                COALESCE(SUM(e.amount),0) as total_expenses
            FROM expenses e
            INNER JOIN offices o
                ON o.id = e.office_id
            INNER JOIN province p
                ON p.id = o.province_id
            ${whereClause}
            GROUP BY p.id, p.name
            ORDER BY total_expenses DESC
        `, params);

        // =========================================
        // Branch Summary
        // =========================================

        const [branches] = await pool.query(`
            SELECT
                o.id as office_id,
                o.name as office_name,
                o.province_id,
                COUNT(*) as transactions,
                COALESCE(SUM(e.amount),0) as total_expenses
            FROM expenses e
            INNER JOIN offices o
                ON o.id = e.office_id
            ${whereClause}
            GROUP BY
                o.id,
                o.name,
                o.province_id
            ORDER BY total_expenses DESC
        `, params);

        // =========================================
        // Top Province
        // =========================================

        const topProvince =
            provinces.length > 0
                ? provinces[0]
                : null;

        // =========================================
        // Top Branch
        // =========================================

        const topBranch =
            branches.length > 0
                ? branches[0]
                : null;

        // =========================================
        // Category Breakdown
        // =========================================

        const [categoryBreakdown] = await pool.query(`
            SELECT
                et.id as expense_type_id,
                et.name as category,
                COUNT(*) as transactions,
                COALESCE(SUM(e.amount),0) as total
            FROM expenses e
            INNER JOIN expense_types et
                ON et.id = e.expense_type_id
            ${whereClause}
            GROUP BY et.id, et.name
            ORDER BY total DESC
        `, params);

        // =========================================
        // Category Summary Per Branch
        // =========================================

        const [categories] = await pool.query(`
            SELECT
                o.id as office_id,
                et.id as expense_type_id,
                et.name as expense_type,
                COUNT(*) as transactions,
                COALESCE(SUM(e.amount),0) as total_expenses
            FROM expenses e
            INNER JOIN offices o
                ON o.id = e.office_id
            INNER JOIN expense_types et
                ON et.id = e.expense_type_id
            ${whereClause}
            GROUP BY
                o.id,
                et.id,
                et.name
            ORDER BY total_expenses DESC
        `, params);

        // =========================================
        // Individual Expenses
        // =========================================

     const [expenses] = await pool.query(`
    SELECT
        e.id,
        e.office_id,
        o.name as office_name,
        o.withinhere_wallet_id,
        p.id as province_id,
        p.name as province_name,
        e.expense_type_id,
        et.name as expense_type,
        e.name,
        e.amount,
        e.date
            FROM expenses e
            INNER JOIN offices o
                ON o.id = e.office_id
            INNER JOIN province p
                ON p.id = o.province_id
            INNER JOIN expense_types et
                ON et.id = e.expense_type_id
            ${whereClause}
            ORDER BY e.date DESC
        `, params);


        // =========================================
// LMS Wallet Charges
// =========================================

const uniqueOffices = [
    ...new Map(
        expenses.map(item => [
            item.office_id,
            item
        ])
    ).values()
];

const lmsExpenses = [];

for (const office of uniqueOffices) {

    if (!office.withinhere_wallet_id) {
        continue;
    }

    try {
const response = await fetch(
    'https://withinheremobileapi.com/api/v1/lmsuser/transactions',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            wallet_id: office.withinhere_wallet_id,
            start_date,
            end_date
        })
    }
);

const data = await response.json();

if (!Array.isArray(data.transactions)) {
    continue;
}

data.transactions.forEach(tx => {

    const charge = Number(tx.charge || 0);

    if (charge <= 0) {
        return;
    }

    lmsExpenses.push({

        id: `wallet-${tx.transaction_id}`,

        office_id: office.office_id,

        office_name: office.office_name,

        province_id: office.province_id,

        province_name: office.province_name,

        expense_type_id: -999,

        expense_type: 'Withinhere Wallet Charges',

        name: tx.type,

        amount: charge,

        date: tx.created_at,
        reason: tx.reason,
        gateway_fee: tx.gateway_fee,
      withinhere_fee: tx.withinhere_fee


    });

});

    } catch (error) {

        console.log(
            'Wallet lookup failed:',
            office.withinhere_wallet_id
        );

    }

}

// Add LMS charges to normal expenses
// Add LMS charges to normal expenses
expenses.push(...lmsExpenses);

// =====================================================
// ADD THIS ENTIRE BLOCK HERE
// =====================================================

const totalWalletCharges =
    lmsExpenses.reduce(
        (sum, item) => sum + Number(item.amount),
        0
    );

if (lmsExpenses.length > 0) {

    // National category
    categoryBreakdown.push({

        expense_type_id: -999,

        category: 'Withinhere Wallet Charges',

        transactions: lmsExpenses.length,

        total: totalWalletCharges

    });

}

// Branch categories
const walletCategoryByOffice = {};

lmsExpenses.forEach(item => {

    if (!walletCategoryByOffice[item.office_id]) {

        walletCategoryByOffice[item.office_id] = {

            office_id: item.office_id,

            expense_type_id: -999,

            expense_type: 'Withinhere Wallet Charges',

            transactions: 0,

            total_expenses: 0

        };

    }

    walletCategoryByOffice[item.office_id]
        .transactions++;

    walletCategoryByOffice[item.office_id]
        .total_expenses += Number(item.amount);

});

categories.push(
    ...Object.values(walletCategoryByOffice)
);

// Institution totals
institution.total_expenses =
    Number(institution.total_expenses)
    + totalWalletCharges;

institution.transactions =
    Number(institution.transactions)
    + lmsExpenses.length;

institution.average_expense =
    institution.transactions > 0
        ? institution.total_expenses /
          institution.transactions
        : 0;

// Branch totals
branches.forEach(branch => {

    const branchCharges = lmsExpenses.filter(
        x => x.office_id === branch.office_id
    );

    branch.total_expenses =
        Number(branch.total_expenses)
        +
        branchCharges.reduce(
            (sum, item) =>
                sum + Number(item.amount),
            0
        );

    branch.transactions =
        Number(branch.transactions)
        +
        branchCharges.length;

});

// Province totals
provinces.forEach(province => {

    const provinceCharges = lmsExpenses.filter(
        x => x.province_id === province.province_id
    );

    province.total_expenses =
        Number(province.total_expenses)
        +
        provinceCharges.reduce(
            (sum, item) =>
                sum + Number(item.amount),
            0
        );

    province.transactions =
        Number(province.transactions)
        +
        provinceCharges.length;

});

// Recalculate top province
provinces.sort(
    (a, b) =>
        Number(b.total_expenses)
        -
        Number(a.total_expenses)
);

if (provinces.length > 0) {
    topProvince.province_name =
        provinces[0].province_name;

    topProvince.total_expenses =
        provinces[0].total_expenses;
}

// Recalculate top branch
branches.sort(
    (a, b) =>
        Number(b.total_expenses)
        -
        Number(a.total_expenses)
);

if (branches.length > 0) {
    topBranch.office_name =
        branches[0].office_name;

    topBranch.total_expenses =
        branches[0].total_expenses;
}

// =====================================================
// END BLOCK
// =====================================================

        // =========================================
        // Expense Trend
        // =========================================

        const [expenseTrend] = await pool.query(`
            SELECT
                DATE(e.date) as day,
                COALESCE(SUM(e.amount),0) as total
            FROM expenses e
            ${whereClause}
            GROUP BY DATE(e.date)
            ORDER BY DATE(e.date)
        `, params);

        // =========================================
        // Current Month Total
        // =========================================

        const [currentMonthRows] = await pool.query(`
            SELECT
                COALESCE(SUM(amount),0) as total
            FROM expenses
            WHERE YEAR(date)=YEAR(CURDATE())
            AND MONTH(date)=MONTH(CURDATE())
        `);

        // =========================================
        // Previous Month Total
        // =========================================

        const [previousMonthRows] = await pool.query(`
            SELECT
                COALESCE(SUM(amount),0) as total
            FROM expenses
            WHERE YEAR(date)=YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
            AND MONTH(date)=MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        `);

        const currentMonthTotal =
            Number(currentMonthRows[0].total || 0);

        const previousMonthTotal =
            Number(previousMonthRows[0].total || 0);

        const percentageChange =
            previousMonthTotal > 0
                ? (
                    (
                        (currentMonthTotal - previousMonthTotal)
                        /
                        previousMonthTotal
                    ) * 100
                )
                : 0;

        const monthlyComparison = {
            current: currentMonthTotal,
            previous: previousMonthTotal,
            percentage: percentageChange
        };

        // =========================================
        // Response
        // =========================================

        res.json({
         institution,

    topProvince,
    topBranch,

    monthlyComparison,

    monthlyTrend: expenseTrend,

    categoryBreakdown,

    provinces,
    branches,
    categories,
    expenses
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Failed to load expense dashboard"
        });

    }
});

app.get('/motor-vehicle-loans-info', async (req, res) => {
  try {

    const { start_date, end_date } = req.query;


    if (!start_date || !end_date) {
      return res.status(400).json({
        error: "start_date and end_date are required query params"
      });
    }


    /**
     * Get motor vehicle loans
     */
 const [loans] = await pool.query(
  `
SELECT 
    loans.*,
    users.id AS consultant_id,
    
    CONCAT(users.first_name, ' ', users.last_name) AS consultant_name,

    referrer.id AS referrer_id,
    CONCAT(referrer.first_name, ' ', referrer.last_name) AS referrer_name,

    offices.id AS branch_id,
    offices.name AS branch_name,

    province.name AS province_name

FROM loans

LEFT JOIN users 
    ON loans.loan_officer_id = users.id

LEFT JOIN users AS referrer
    ON loans.referrer = referrer.id

LEFT JOIN offices 
    ON loans.referrer_branch = offices.id

LEFT JOIN province
    ON offices.province_id = province.id

  WHERE loans.loan_product_id = ?
  AND loans.created_at >= ?
  AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

  `,
  [0, start_date, end_date]
);


    const loanIds = loans.map(l => l.id);



    /**
     * Get vehicles attached to loans
     */
   const [vehicles] = await pool.query(
  `
  SELECT 
      vehicles.*

  FROM vehicles

  INNER JOIN loans 
      ON vehicles.loan_id = loans.id

  WHERE loans.loan_product_id = ?
  AND loans.created_at >= ?
  AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

  `,
  [0, start_date, end_date]
);




    /**
     * Get repayment transactions
     */
    const [transactions] = await pool.query(
      `
      SELECT 
          loan_transactions.*

      FROM loan_transactions

      INNER JOIN loans
          ON loan_transactions.loan_id = loans.id

      WHERE loans.loan_product_id = ?
      AND loans.created_at BETWEEN ? AND ?

      AND loan_transactions.transaction_type = 'repayment'

      `,
      [0, start_date, end_date]
    );





    /**
     * Calculate summary
     */
 function calculateSummary(selectedLoans) {

    const selectedLoanIds = selectedLoans.map(l => l.id);

    const selectedVehicles = vehicles.filter(v =>
        selectedLoanIds.includes(v.loan_id)
    );

    const selectedTransactions = transactions.filter(t =>
        selectedLoanIds.includes(t.loan_id)
    );

    let collections = 0;

    selectedTransactions.forEach(t => {

        const credit = Number(t.credit || 0);

        if (t.transaction_type === 'repayment') {

            if (t.payment_apply_to === 'reloan_payment') {

                collections += Number(t.balance_bf || 0);

            } else if (
                ['full_payment', 'part_payment'].includes(t.payment_apply_to)
            ) {

                collections += credit;

            }

        }

    });

    // Calculate expected collections
    const expectedCollections = selectedLoans.reduce((sum, loan) => {
        const principal = Number(loan.principal || 0);
        const interestRate = Number(loan.interest_rate || 0);

        return sum + principal + (principal * (interestRate / 100));
    }, 0);

    const expectedInterest = selectedLoans.reduce((sum, loan) => {
         const principal = Number(loan.principal || 0);
        const interestRate = Number(loan.interest_rate || 0);

    return sum + (principal * (interestRate / 100));
}, 0);

const today = new Date();

const formattedLoans = selectedLoans.map(loan => {

    const dueDate = loan.expected_first_repayment_date
        ? new Date(loan.expected_first_repayment_date)
        : null;

    let daysInDefault = 0;

    if (dueDate && today > dueDate) {
        daysInDefault = Math.floor(
            (today - dueDate) / (1000 * 60 * 60 * 24)
        );
    }

    return {
        ...loan,
        due_date: loan.expected_first_repayment_date,
        days_in_default: daysInDefault
    };
});

    return {

        number_of_loans: selectedLoans.length,

        number_of_vehicles: selectedVehicles.length,

        total_vehicle_value: selectedVehicles.reduce(
            (sum, v) => sum + Number(v.market_value || 0),
            0
        ),

        total_loan_portfolion: selectedLoans.reduce((sum, loan) => {
    const principal = Number(loan.principal || 0);
    const interestRate = Number(loan.interest_rate || 0);

    return sum + principal + (principal * (interestRate / 100));
}, 0),

        expected_interest: expectedInterest,

        expected_collections: expectedCollections,

        total_collections: collections,

        loans_list: formattedLoans,

        vehicles_list: selectedVehicles,

        collections_list: selectedTransactions

    };

}





    /**
     * National level
     */
    const national = calculateSummary(loans);






    /**
     * Province level
     */
    const provinceGroups = {};


    loans.forEach(loan=>{


      const province =
          loan.province_name || "Unknown";


      if(!provinceGroups[province]){
          provinceGroups[province]=[];
      }


      provinceGroups[province].push(loan);


    });



    const provinces =
      Object.keys(provinceGroups)
      .map(province=>({


          province_name:province,


          ...calculateSummary(
              provinceGroups[province]
          ),



          branches:
          getBranches(
              provinceGroups[province]
          )


      }));





    /**
     * Branch grouping
     */
    function getBranches(branchLoans){


      const groups={};



      branchLoans.forEach(loan=>{


        const branch =
          loan.branch_name || "Unknown";



        if(!groups[branch]){
            groups[branch]=[];
        }


        groups[branch].push(loan);


      });



      return Object.keys(groups)
      .map(branch=>({


          branch_name:branch,


          ...calculateSummary(
              groups[branch]
          ),


          consultants:
              getConsultants(
                  groups[branch]
              )


      }));


    }





    /**
     * Consultant grouping
     */
    function getConsultants(consultantLoans){


      const groups={};



      consultantLoans.forEach(loan=>{


        const consultant =
          loan.consultant_name || "Unknown";



        if(!groups[consultant]){
            groups[consultant]=[];
        }


        groups[consultant].push(loan);


      });



      return Object.keys(groups)
      .map(consultant=>({


          consultant_name:consultant,


          ...calculateSummary(
              groups[consultant]
          )


      }));


    }






    return res.json({

      success:true,


      national,


      provinces


    });




  } catch(error){


    console.error(
      "Motor vehicle loans info error:",
      error
    );


    return res.status(500).json({

      error:
      "Failed to fetch motor vehicle loans information"

    });


  }

});

app.get('/mv-loan-consultant-info', async (req, res) => {
  try {

    const { start_date, end_date } = req.query;


    if (!start_date || !end_date) {
      return res.status(400).json({
        error: "start_date and end_date are required query params"
      });
    }


    /**
     * Get loans
     */
  const [loans] = await pool.query(
  `
  SELECT 
      loans.*,

      users.id AS consultant_id,

      CONCAT(
          users.first_name,
          ' ',
          users.last_name
      ) AS consultant_name,

      referrer.id AS referrer_id,

      CONCAT(
          referrer.first_name,
          ' ',
          referrer.last_name
      ) AS referrer_name,

      client.id AS client_id,

      CONCAT(
          client.first_name,
          ' ',
          client.last_name
      ) AS client_name,

      offices.id AS branch_id,
      offices.name AS branch_name,

      province.name AS province_name

  FROM loans

  LEFT JOIN users
      ON loans.loan_officer_id = users.id

  LEFT JOIN users AS referrer
      ON loans.referrer = referrer.id

  LEFT JOIN clients AS client
      ON loans.client_id = client.id

  LEFT JOIN offices
      ON loans.office_id = offices.id

  LEFT JOIN province
      ON offices.province_id = province.id

  WHERE loans.loan_product_id = ?
  AND loans.created_at >= ?
  AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

  `,
  [0, start_date, end_date]
);

    /**
     * Get vehicles attached to loans
     */
    const [vehicles] = await pool.query(
      `
      SELECT 
          vehicles.*

      FROM vehicles

      INNER JOIN loans
          ON vehicles.loan_id = loans.id

      WHERE loans.loan_product_id = ?
      AND loans.created_at >= ?
      AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

      `,
      [0, start_date, end_date]
    );


    /**
     * Get repayment transactions
     */
    const [transactions] = await pool.query(
      `
      SELECT
          loan_transactions.*

      FROM loan_transactions

      INNER JOIN loans
          ON loan_transactions.loan_id = loans.id

      WHERE loans.loan_product_id = ?
      AND loans.created_at >= ?
      AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

      AND loan_transactions.transaction_type = 'repayment'

      `,
      [0, start_date, end_date]
    );


    /**
     * Calculate consultant summary
     */
    function calculateSummary(selectedLoans) {

      const selectedLoanIds =
        selectedLoans.map(loan => loan.id);


      const selectedVehicles =
        vehicles.filter(vehicle =>
          selectedLoanIds.includes(vehicle.loan_id)
        );


      const selectedTransactions =
        transactions.filter(transaction =>
          selectedLoanIds.includes(transaction.loan_id)
        );


      /**
       * Collections
       */
      let collections = 0;


      selectedTransactions.forEach(t => {

        const credit =
          Number(t.credit || 0);


        if (
          t.payment_apply_to === 'reloan_payment'
        ) {

          collections +=
            Number(t.balance_bf || 0);


        } else if (
          [
            'full_payment',
            'part_payment'
          ].includes(t.payment_apply_to)
        ) {

          collections += credit;

        }

      });


      /**
       * Given out
       */
      const givenOut =
        selectedLoans.reduce(
          (sum, loan) =>
            sum + Number(loan.principal || 0),
          0
        );


      /**
       * Expected interest
       */
      const expectedInterest =
        selectedLoans.reduce(
          (sum, loan) => {

            const principal =
              Number(loan.principal || 0);

            const interestRate =
              Number(loan.interest_rate || 0);

            return sum +
              (
                principal *
                (interestRate / 100)
              );

          },
          0
        );


      /**
       * Expected collections / portfolio
       */
      const expectedCollections =
        selectedLoans.reduce(
          (sum, loan) => {

            const principal =
              Number(loan.principal || 0);

            const interestRate =
              Number(loan.interest_rate || 0);

            return sum +
              principal +
              (
                principal *
                (interestRate / 100)
              );

          },
          0
        );


      /**
       * Format loans
       */
      const today = new Date();


      const formattedLoans =
        selectedLoans.map(loan => {

          const principal =
            Number(loan.principal || 0);


          const interestRate =
            Number(loan.interest_rate || 0);


          const expectedLoanCollections =
            principal +
            (
              principal *
              (interestRate / 100)
            );


          const dueDate =
            loan.expected_first_repayment_date
              ? new Date(
                  loan.expected_first_repayment_date
                )
              : null;


          let daysInDefault = 0;


          if (dueDate && today > dueDate) {

            daysInDefault =
              Math.floor(
                (
                  today - dueDate
                ) /
                (
                  1000 *
                  60 *
                  60 *
                  24
                )
              );

          }


          /**
           * Collections for this loan
           */
          const loanTransactions =
            selectedTransactions.filter(
              transaction =>
                transaction.loan_id === loan.id
            );


          let loanCollections = 0;


          loanTransactions.forEach(t => {

            const credit =
              Number(t.credit || 0);


            if (
              t.payment_apply_to ===
              'reloan_payment'
            ) {

              loanCollections +=
                Number(t.balance_bf || 0);


            } else if (
              [
                'full_payment',
                'part_payment'
              ].includes(
                t.payment_apply_to
              )
            ) {

              loanCollections += credit;

            }

          });


          /**
           * Vehicles for this loan
           */
          const loanVehicles =
            selectedVehicles.filter(
              vehicle =>
                vehicle.loan_id === loan.id
            );


          return {

            loan_id:
              loan.id,

                client_name:
    loan.client_name || "Unknown",

  referrer_name:
    loan.referrer_name || "Unknown",

    status:
    loan.status,

    date:
    loan.created_at,

            principal:
              principal,

            interest_rate:
              interestRate,

            given_out:
              principal,

            expected_interest:
              principal *
              (interestRate / 100),

            expected_collections:
              expectedLoanCollections,

            total_collections:
              loanCollections,

            total_uncollected:
              Math.max(
                expectedLoanCollections -
                loanCollections,
                0
              ),

            due_date:
              loan.expected_first_repayment_date,

            days_in_default:
              daysInDefault,

            vehicles:
              loanVehicles

          };

        });


      return {

        consultant_id:
          selectedLoans[0]
            ?.consultant_id || null,

        consultant_name:
          selectedLoans[0]
            ?.consultant_name || "Unknown",

        branch_id:
          selectedLoans[0]
            ?.branch_id || null,

        branch_name:
          selectedLoans[0]
            ?.branch_name || "Unknown",

        province_name:
          selectedLoans[0]
            ?.province_name || "Unknown",

        number_of_loans:
          selectedLoans.length,

        number_of_vehicles:
          selectedVehicles.length,

        given_out:
          givenOut,

        expected_interest:
          expectedInterest,

        expected_collections:
          expectedCollections,

        total_collections:
          collections,

        total_uncollected:
          Math.max(
            expectedCollections -
            collections,
            0
          ),

        loans_list:
          formattedLoans

      };

    }


    /**
     * Group loans by consultant
     */
    const consultantGroups = {};


    loans.forEach(loan => {

      const consultantId =
        loan.consultant_id || "unknown";


      if (!consultantGroups[consultantId]) {

        consultantGroups[consultantId] = [];

      }


      consultantGroups[consultantId].push(loan);

    });


    /**
     * Build consultant results
     */
    const consultants =
      Object.keys(consultantGroups)
        .map(consultantId =>
          calculateSummary(
            consultantGroups[consultantId]
          )
        );


    /**
     * National totals
     */
    const national = {

      number_of_loans:
        loans.length,

      number_of_vehicles:
        vehicles.length,

      given_out:
        loans.reduce(
          (sum, loan) =>
            sum +
            Number(loan.principal || 0),
          0
        ),

      expected_interest:
        loans.reduce(
          (sum, loan) => {

            const principal =
              Number(loan.principal || 0);

            const interestRate =
              Number(loan.interest_rate || 0);

            return sum +
              (
                principal *
                (interestRate / 100)
              );

          },
          0
        ),

      expected_collections:
        loans.reduce(
          (sum, loan) => {

            const principal =
              Number(loan.principal || 0);

            const interestRate =
              Number(loan.interest_rate || 0);

            return sum +
              principal +
              (
                principal *
                (interestRate / 100)
              );

          },
          0
        ),

      total_collections:
        transactions.reduce(
          (sum, t) => {

            const credit =
              Number(t.credit || 0);


            if (
              t.payment_apply_to ===
              'reloan_payment'
            ) {

              return sum +
                Number(t.balance_bf || 0);

            }


            if (
              [
                'full_payment',
                'part_payment'
              ].includes(
                t.payment_apply_to
              )
            ) {

              return sum + credit;

            }


            return sum;

          },
          0
        )

    };


    national.total_uncollected =
      Math.max(
        national.expected_collections -
        national.total_collections,
        0
      );


    /**
     * Return response
     */
    return res.json({

      success: true,

      national,

      consultants

    });


  } catch (error) {

    console.error(
      "Motor vehicle loan consultant info error:",
      error
    );


    return res.status(500).json({

      error:
        "Failed to fetch motor vehicle loan consultant information"

    });

  }

});


app.get('/motor-vehicle-loans-analytics', async (req, res) => {

try {

const {start_date, end_date} = req.query;


if(!start_date || !end_date){

return res.status(400).json({
error:"start_date and end_date are required"
});

}


// Get loans
const [loans] = await pool.query(
`
SELECT

loans.*,

CONCAT(users.first_name,' ',users.last_name) AS consultant_name,

offices.name AS branch_name,

province.name AS province_name


FROM loans


LEFT JOIN users
ON loans.loan_officer_id = users.id


LEFT JOIN offices
ON loans.office_id = offices.id


LEFT JOIN province
ON offices.province_id = province.id


WHERE loans.loan_product_id = 0

AND loans.created_at >= ?

AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

`,
[start_date,end_date]
);



// Vehicles

const [vehicles] = await pool.query(

`
SELECT

vehicles.*,

loans.id AS loan_id


FROM vehicles


INNER JOIN loans

ON vehicles.loan_id = loans.id


WHERE loans.loan_product_id = 0

AND loans.created_at >= ?

AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

`,
[start_date,end_date]

);



// Transactions

const [transactions] = await pool.query(

`
SELECT

loan_transactions.*


FROM loan_transactions


INNER JOIN loans

ON loan_transactions.loan_id = loans.id


WHERE loans.loan_product_id = 0


AND loan_transactions.transaction_type='repayment'

`,
[]


);




let today = new Date();


// Combine data

let loanData = loans.map(loan=>{


let vehicle =
vehicles.find(v=>v.loan_id===loan.id);


let loanTransactions =
transactions.filter(t=>t.loan_id===loan.id);


let collected = loanTransactions.reduce(
(sum,t)=>sum + Number(t.credit || 0),
0
);


let expected =
Number(loan.principal || 0)
+
(
Number(loan.principal || 0)
*
(Number(loan.interest_rate || 0)/100)
);



let dueDate =
loan.expected_first_repayment_date
?
new Date(loan.expected_first_repayment_date)
:null;



let daysDefault=0;


if(dueDate && today > dueDate){

daysDefault=Math.floor(
(today-dueDate)/(1000*60*60*24)
);

}



return {

...loan,

vehicle,

expected,

collected,

balance:
expected-collected,

is_default:
daysDefault>0,

days_in_default:
daysDefault

};


});




// ============================
// SUMMARY
// ============================


const summary={

total_loans:
loanData.length,


total_vehicles:
vehicles.length,


portfolio_value:
loanData.reduce(
(s,l)=>s+Number(l.principal||0),0
),


expected_collections:
loanData.reduce(
(s,l)=>s+l.expected,0
),


collections:
loanData.reduce(
(s,l)=>s+l.collected,0
),


default_loans:
loanData.filter(l=>l.is_default).length,


default_rate:

(
loanData.filter(l=>l.is_default).length
/
loanData.length
*100
).toFixed(2)


};





// ============================
// GROUP FUNCTION
// ============================

function groupBy(data,key){

let groups={};


data.forEach(item=>{


let value=item[key] || "Unknown";


if(!groups[value])
groups[value]=[];


groups[value].push(item);


});


return Object.keys(groups).map(name=>{


let items=groups[name];


return {

name,


loans:items.length,


defaults:
items.filter(x=>x.is_default).length,


default_rate:
(
items.filter(x=>x.is_default).length /
items.length *100
).toFixed(2),


default_amount:
items
.filter(x=>x.is_default)
.reduce((s,x)=>s+x.balance,0)

};


});


}





return res.json({

success:true,


summary,


default_by_consultant:
groupBy(loanData,'consultant_name'),


default_by_branch:
groupBy(loanData,'branch_name'),


default_by_province:
groupBy(loanData,'province_name'),


default_by_vehicle:
groupBy(
loanData.map(l=>({

...l,

vehicle_type:
l.vehicle?.make || "Unknown"

})),
'vehicle_type'
),


aging:{


"0-30":
loanData.filter(
l=>l.days_in_default<=30
).length,


"31-60":
loanData.filter(
l=>l.days_in_default>30 &&
l.days_in_default<=60
).length,


"61-90":
loanData.filter(
l=>l.days_in_default>60 &&
l.days_in_default<=90
).length,


"90+":
loanData.filter(
l=>l.days_in_default>90
).length


},


high_risk_loans:

loanData
.filter(l=>l.is_default)
.sort(
(a,b)=>b.balance-a.balance
)
.slice(0,20)


});


}

catch(error){

console.log(error);

res.status(500).json({
error:"Analytics failed"
});


}

});


app.get('/payroll-loans-info', async (req, res) => {
    try {

        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                error: "start_date and end_date are required query params"
            });
        }


        /**
         * Get payroll loans
         */
        const [loans] = await pool.query(
            `
            SELECT
                loans.*,

                users.id AS consultant_id,
                CONCAT(users.first_name, ' ', users.last_name) AS consultant_name,

                referrer.id AS referrer_id,
                CONCAT(referrer.first_name, ' ', referrer.last_name) AS referrer_name,

                offices.id AS branch_id,
                offices.name AS branch_name,

                province.name AS province_name

            FROM loans

            LEFT JOIN users
                ON loans.loan_officer_id = users.id

            LEFT JOIN users AS referrer
                ON loans.referrer = referrer.id

            LEFT JOIN offices
                ON loans.office_id = offices.id

            LEFT JOIN province
                ON offices.province_id = province.id

            WHERE loans.loan_product_id = ?
            AND loans.created_at >= ?
            AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

            `,
            [1, start_date, end_date]
        );


        /**
         * Get repayment transactions
         */
        const [transactions] = await pool.query(
            `
            SELECT
                loan_transactions.*

            FROM loan_transactions

            INNER JOIN loans
                ON loan_transactions.loan_id = loans.id

            WHERE loans.loan_product_id = ?
            AND loans.created_at >= ?
            AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

            AND loan_transactions.transaction_type = 'repayment'

            `,
            [1, start_date, end_date]
        );


        /**
         * Calculate summary
         */
        function calculateSummary(selectedLoans) {

            const selectedLoanIds = selectedLoans.map(l => l.id);

            const selectedTransactions = transactions.filter(t =>
                selectedLoanIds.includes(t.loan_id)
            );


            /**
             * Calculate collections
             */
            let collections = 0;

            selectedTransactions.forEach(t => {

                const credit = Number(t.credit || 0);

                if (t.transaction_type === 'repayment') {

                    if (t.payment_apply_to === 'reloan_payment') {

                        collections += Number(t.balance_bf || 0);

                    } else if (
                        ['full_payment', 'part_payment'].includes(
                            t.payment_apply_to
                        )
                    ) {

                        collections += credit;

                    }

                }

            });


            /**
             * Expected collections
             *
             * Principal + interest
             */
            const expectedCollections = selectedLoans.reduce(
                (sum, loan) => {

                    const principal =
                        Number(loan.principal || 0);

                    const interestRate =
                        Number(loan.interest_rate || 0);

                    return sum +
                        principal +
                        (principal * (interestRate / 100));

                },
                0
            );


            /**
             * Expected interest
             */
            const expectedInterest = selectedLoans.reduce(
                (sum, loan) => {

                    const principal =
                        Number(loan.principal || 0);

                    const interestRate =
                        Number(loan.interest_rate || 0);

                    return sum +
                        (principal * (interestRate / 100));

                },
                0
            );


            /**
             * Calculate days in default
             */
            const today = new Date();

            const formattedLoans = selectedLoans.map(loan => {

                const dueDate =
                    loan.expected_first_repayment_date
                        ? new Date(loan.expected_first_repayment_date)
                        : null;

                let daysInDefault = 0;

                if (dueDate && today > dueDate) {

                    daysInDefault = Math.floor(
                        (today - dueDate) /
                        (1000 * 60 * 60 * 24)
                    );

                }

                return {
                    ...loan,

                    due_date:
                        loan.expected_first_repayment_date,

                    days_in_default:
                        daysInDefault
                };

            });


            /**
             * Return summary
             */
            return {

                number_of_loans:
                    selectedLoans.length,

                total_loan_portfolion:
                    selectedLoans.reduce(
                        (sum, loan) => {

                            const principal =
                                Number(loan.principal || 0);

                            const interestRate =
                                Number(loan.interest_rate || 0);

                            return sum +
                                principal +
                                (principal * (interestRate / 100));

                        },
                        0
                    ),

                expected_interest:
                    expectedInterest,

                expected_collections:
                    expectedCollections,

                total_collections:
                    collections,

                loans_list:
                    formattedLoans,

                collections_list:
                    selectedTransactions

            };

        }


        /**
         * National level
         */
        const national =
            calculateSummary(loans);


        /**
         * Province grouping
         */
        const provinceGroups = {};


        loans.forEach(loan => {

            const province =
                loan.province_name || "Unknown";


            if (!provinceGroups[province]) {
                provinceGroups[province] = [];
            }


            provinceGroups[province].push(loan);

        });


        const provinces =
            Object.keys(provinceGroups)
                .map(province => ({

                    province_name:
                        province,

                    ...calculateSummary(
                        provinceGroups[province]
                    ),

                    branches:
                        getBranches(
                            provinceGroups[province]
                        )

                }));


        /**
         * Branch grouping
         */
        function getBranches(branchLoans) {

            const groups = {};


            branchLoans.forEach(loan => {

                const branch =
                    loan.branch_name || "Unknown";


                if (!groups[branch]) {
                    groups[branch] = [];
                }


                groups[branch].push(loan);

            });


            return Object.keys(groups)
                .map(branch => ({

                    branch_name:
                        branch,

                    ...calculateSummary(
                        groups[branch]
                    ),

                    consultants:
                        getConsultants(
                            groups[branch]
                        )

                }));

        }


        /**
         * Consultant grouping
         */
        function getConsultants(consultantLoans) {

            const groups = {};


            consultantLoans.forEach(loan => {

                const consultant =
                    loan.consultant_name || "Unknown";


                if (!groups[consultant]) {
                    groups[consultant] = [];
                }


                groups[consultant].push(loan);

            });


            return Object.keys(groups)
                .map(consultant => ({

                    consultant_name:
                        consultant,

                    ...calculateSummary(
                        groups[consultant]
                    )

                }));

        }


        /**
         * Return response
         */
        return res.json({

            success: true,

            national,

            provinces

        });


    } catch (error) {

        console.error(
            "Payroll loans info error:",
            error
        );


        return res.status(500).json({

            error:
                "Failed to fetch payroll loans information"

        });

    }

});



app.get('/payroll-loan-consultant-info', async (req, res) => {
  try {

    const { start_date, end_date } = req.query;


    if (!start_date || !end_date) {
      return res.status(400).json({
        error: "start_date and end_date are required query params"
      });
    }


    /**
     * Get payroll loans
     */
    const [loans] = await pool.query(
      `
      SELECT 
          loans.*,

          users.id AS consultant_id,

          CONCAT(
              users.first_name,
              ' ',
              users.last_name
          ) AS consultant_name,

          referrer.id AS referrer_id,

          CONCAT(
              referrer.first_name,
              ' ',
              referrer.last_name
          ) AS referrer_name,

          client.id AS client_id,

          CONCAT(
              client.first_name,
              ' ',
              client.last_name
          ) AS client_name,

          offices.id AS branch_id,
          offices.name AS branch_name,

          province.name AS province_name

      FROM loans

      LEFT JOIN users
          ON loans.loan_officer_id = users.id

      LEFT JOIN users AS referrer
          ON loans.referrer = referrer.id

      LEFT JOIN clients AS client
          ON loans.client_id = client.id

      LEFT JOIN offices
          ON loans.office_id = offices.id

      LEFT JOIN province
          ON offices.province_id = province.id

      WHERE loans.loan_product_id = ?
      AND loans.created_at >= ?
      AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

      `,
      [1, start_date, end_date]
    );


    /**
     * Get repayment transactions
     */
    const [transactions] = await pool.query(
      `
      SELECT
          loan_transactions.*

      FROM loan_transactions

      INNER JOIN loans
          ON loan_transactions.loan_id = loans.id

      WHERE loans.loan_product_id = ?
      AND loans.created_at >= ?
      AND loans.created_at < DATE_ADD(?, INTERVAL 1 DAY)

      AND loan_transactions.transaction_type = 'repayment'

      `,
      [1, start_date, end_date]
    );


    /**
     * Calculate consultant summary
     */
    function calculateSummary(selectedLoans) {

      const selectedLoanIds =
        selectedLoans.map(loan => loan.id);


      const selectedTransactions =
        transactions.filter(transaction =>
          selectedLoanIds.includes(transaction.loan_id)
        );


      /**
       * Collections
       */
      let collections = 0;


      selectedTransactions.forEach(t => {

        const credit =
          Number(t.credit || 0);


        if (
          t.payment_apply_to === 'reloan_payment'
        ) {

          collections +=
            Number(t.balance_bf || 0);


        } else if (
          [
            'full_payment',
            'part_payment'
          ].includes(t.payment_apply_to)
        ) {

          collections += credit;

        }

      });


      /**
       * Given out
       */
      const givenOut =
        selectedLoans.reduce(
          (sum, loan) =>
            sum + Number(loan.principal || 0),
          0
        );


      /**
       * Expected interest
       */
      const expectedInterest =
        selectedLoans.reduce(
          (sum, loan) => {

            const principal =
              Number(loan.principal || 0);

            const interestRate =
              Number(loan.interest_rate || 0);

            return sum +
              (
                principal *
                (interestRate / 100)
              );

          },
          0
        );


      /**
       * Expected collections / portfolio
       */
      const expectedCollections =
        selectedLoans.reduce(
          (sum, loan) => {

            const principal =
              Number(loan.principal || 0);

            const interestRate =
              Number(loan.interest_rate || 0);

            return sum +
              principal +
              (
                principal *
                (interestRate / 100)
              );

          },
          0
        );


      /**
       * Format loans
       */
      const today = new Date();


      const formattedLoans =
        selectedLoans.map(loan => {

          const principal =
            Number(loan.principal || 0);


          const interestRate =
            Number(loan.interest_rate || 0);


          const expectedLoanCollections =
            principal +
            (
              principal *
              (interestRate / 100)
            );


          const dueDate =
            loan.expected_first_repayment_date
              ? new Date(
                  loan.expected_first_repayment_date
                )
              : null;


          let daysInDefault = 0;


          if (dueDate && today > dueDate) {

            daysInDefault =
              Math.floor(
                (
                  today - dueDate
                ) /
                (
                  1000 *
                  60 *
                  60 *
                  24
                )
              );

          }


          /**
           * Collections for this loan
           */
          const loanTransactions =
            selectedTransactions.filter(
              transaction =>
                transaction.loan_id === loan.id
            );


          let loanCollections = 0;


          loanTransactions.forEach(t => {

            const credit =
              Number(t.credit || 0);


            if (
              t.payment_apply_to ===
              'reloan_payment'
            ) {

              loanCollections +=
                Number(t.balance_bf || 0);


            } else if (
              [
                'full_payment',
                'part_payment'
              ].includes(
                t.payment_apply_to
              )
            ) {

              loanCollections += credit;

            }

          });


          return {

            loan_id:
              loan.id,

            client_name:
              loan.client_name || "Unknown",

            referrer_name:
              loan.referrer_name || "Unknown",

            status:
              loan.status,

            date:
              loan.created_at,

            principal:
              principal,

            interest_rate:
              interestRate,

            given_out:
              principal,

            expected_interest:
              principal *
              (interestRate / 100),

            expected_collections:
              expectedLoanCollections,

            total_collections:
              loanCollections,

            total_uncollected:
              Math.max(
                expectedLoanCollections -
                loanCollections,
                0
              ),

            due_date:
              loan.expected_first_repayment_date,

            days_in_default:
              daysInDefault

          };

        });


      return {

        consultant_id:
          selectedLoans[0]
            ?.consultant_id || null,

        consultant_name:
          selectedLoans[0]
            ?.consultant_name || "Unknown",

        branch_id:
          selectedLoans[0]
            ?.branch_id || null,

        branch_name:
          selectedLoans[0]
            ?.branch_name || "Unknown",

        province_name:
          selectedLoans[0]
            ?.province_name || "Unknown",

        number_of_loans:
          selectedLoans.length,

        given_out:
          givenOut,

        expected_interest:
          expectedInterest,

        expected_collections:
          expectedCollections,

        total_collections:
          collections,

        total_uncollected:
          Math.max(
            expectedCollections -
            collections,
            0
          ),

        loans_list:
          formattedLoans

      };

    }


    /**
     * Group loans by consultant
     */
    const consultantGroups = {};


    loans.forEach(loan => {

      const consultantId =
        loan.consultant_id || "unknown";


      if (!consultantGroups[consultantId]) {

        consultantGroups[consultantId] = [];

      }


      consultantGroups[consultantId].push(loan);

    });


    /**
     * Build consultant results
     */
    const consultants =
      Object.keys(consultantGroups)
        .map(consultantId =>
          calculateSummary(
            consultantGroups[consultantId]
          )
        );


    /**
     * National totals
     */
    const national = {

      number_of_loans:
        loans.length,

      given_out:
        loans.reduce(
          (sum, loan) =>
            sum +
            Number(loan.principal || 0),
          0
        ),

      expected_interest:
        loans.reduce(
          (sum, loan) => {

            const principal =
              Number(loan.principal || 0);

            const interestRate =
              Number(loan.interest_rate || 0);

            return sum +
              (
                principal *
                (interestRate / 100)
              );

          },
          0
        ),

      expected_collections:
        loans.reduce(
          (sum, loan) => {

            const principal =
              Number(loan.principal || 0);

            const interestRate =
              Number(loan.interest_rate || 0);

            return sum +
              principal +
              (
                principal *
                (interestRate / 100)
              );

          },
          0
        ),

      total_collections:
        transactions.reduce(
          (sum, t) => {

            const credit =
              Number(t.credit || 0);


            if (
              t.payment_apply_to ===
              'reloan_payment'
            ) {

              return sum +
                Number(t.balance_bf || 0);

            }


            if (
              [
                'full_payment',
                'part_payment'
              ].includes(
                t.payment_apply_to
              )
            ) {

              return sum + credit;

            }


            return sum;

          },
          0
        )

    };


    national.total_uncollected =
      Math.max(
        national.expected_collections -
        national.total_collections,
        0
      );


    /**
     * Return response
     */
    return res.json({

      success: true,

      national,

      consultants

    });


  } catch (error) {

    console.error(
      "Payroll loan consultant info error:",
      error
    );


    return res.status(500).json({

      error:
        "Failed to fetch payroll loan consultant information"

    });

  }

});

app.get("/clients_count", async (req, res) => {
    try {
        const [result] = await pool.query(
            `SELECT COUNT(*) AS client_count FROM clients`
        );

        res.json({
            client_count: result[0].client_count
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});


app.get("/client-app-applications", async (req, res) => {
    try {

        const { start_date, end_date } = req.query;

        // Provinces
        const [provinces] = await pool.query(`
            SELECT
                id,
                name
            FROM province
        `);

        // Client app users + client details
        const [clientUsers] = await pool.query(`
            SELECT
                clientapp_users.id,
                clients.id AS client_id,
                clients.office_id,
                clients.staff_id,
                offices.province_id
            FROM clientapp_users
            INNER JOIN clients
                ON clientapp_users.client_id = clients.id
            INNER JOIN offices
                ON clients.office_id = offices.id
        `);

        // Offices
        const [offices] = await pool.query(`
            SELECT
                id,
                name,
                province_id
            FROM offices
        `);

        // Loan consultants
        const [consultants] = await pool.query(`
            SELECT
                id,
                first_name,
                last_name,
                office_id
            FROM users
        `);

        // Loan applications
        const [applications] = await pool.query(`
            SELECT
                id,
                client_id,
                amount,
                status,
                date
            FROM client_app_loan_applications
            WHERE date BETWEEN ? AND ?
        `, [
            `${start_date} 00:00:00`,
            `${end_date} 23:59:59`
        ]);

        const provinceApplicationCounts = provinces.map(province => {

            // Province applications
            const provinceApplications = applications.filter(application => {
                const client = clientUsers.find(c => c.client_id === application.client_id);

                return client && client.province_id === province.id;
            });

            return {

                id: province.id,

                province: province.name,

                application_count: provinceApplications.length,

                offices: offices
                    .filter(office => office.province_id === province.id)
                    .map(office => {

                        // Office applications
                        const officeApplications = applications.filter(application => {
                            const client = clientUsers.find(c => c.client_id === application.client_id);

                            return client && client.office_id === office.id;
                        });

                        return {

                            id: office.id,

                            name: office.name,

                            application_count: officeApplications.length,

                            loan_consultants: consultants
                                .filter(consultant => consultant.office_id === office.id)
                                .map(consultant => {

                                    // Consultant applications
                                    const consultantApplications = applications.filter(application => {
                                        const client = clientUsers.find(c => c.client_id === application.client_id);

                                        return client && client.staff_id === consultant.id;
                                    });

                                    return {

                                        id: consultant.id,

                                        name: `${consultant.first_name} ${consultant.last_name}`,

                                        application_count: consultantApplications.length,

                                        loan_applications: consultantApplications.map(application => ({
                                            id: application.id,
                                            amount: application.amount,
                                            status: application.status,
                                            created_at: application.date
                                        }))

                                    };

                                })

                        };

                    })

            };

        });

        return res.json({
            success: true,
            data: provinceApplicationCounts
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });

    }
});


app.get("/client-app-users", async (req, res) => {
    try {

        const { start_date, end_date } = req.query;

        const [provinces] = await pool.query(`
            SELECT
                id,
                name
            FROM province
        `);


        const [clientUsers] = await pool.query(`
            SELECT
                clientapp_users.id,
                clientapp_users.created_at,
                clients.id AS client_id,
                clients.first_name,
                clients.last_name,
                clients.phone,
                clients.office_id,
                clients.staff_id,
                offices.province_id
            FROM clientapp_users
            INNER JOIN clients
                ON clientapp_users.client_id = clients.id
            INNER JOIN offices
                ON clients.office_id = offices.id
            WHERE clientapp_users.created_at BETWEEN ? AND ?
        `, [
            `${start_date} 00:00:00`,
            `${end_date} 23:59:59`
        ]);


        const [offices] = await pool.query(`
            SELECT
                id,
                name,
                province_id
            FROM offices
        `);


        const [consultants] = await pool.query(`
            SELECT
                id,
                first_name,
                last_name,
                office_id
            FROM users
        `);



        const provinceClientUsers = provinces.map(province => {


            const provinceUsers = clientUsers.filter(user =>
                user.province_id === province.id
            );


            return {

                id: province.id,

                province: province.name,

                client_count: provinceUsers.length,


                offices: offices
                    .filter(office =>
                        office.province_id === province.id
                    )
                    .map(office => {


                        const officeUsers = clientUsers.filter(user =>
                            user.office_id === office.id
                        );


                        return {

                            id: office.id,

                            name: office.name,

                            client_count: officeUsers.length,


                            loan_consultants: consultants
                                .filter(consultant =>
                                    consultant.office_id === office.id
                                )
                                .map(consultant => {


                                    const consultantUsers = clientUsers.filter(user =>
                                        user.staff_id === consultant.id
                                    );


                                    return {

                                        id: consultant.id,

                                        name: `${consultant.first_name} ${consultant.last_name}`,

                                        client_count: consultantUsers.length,


                                        clients: consultantUsers.map(user => ({
                                            id: user.id,
                                            client_id: user.client_id,
                                            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                                            phone: user.phone,
                                            registered_at: user.created_at
                                        }))

                                    };


                                })

                        };


                    })

            };


        });


        return res.json({
            success: true,
            data: provinceClientUsers
        });


    } catch(error) {

        console.error(error);

        return res.status(500).json({
            success:false,
            message:"Server error",
            error:error.message
        });

    }
});


app.get("/client-app-transactions", async (req, res) => {
    try {

        // Provinces
        const [provinces] = await pool.query(`
            SELECT
                id,
                name
            FROM province
        `);


        // Offices
        const [offices] = await pool.query(`
            SELECT
                id,
                name,
                province_id
            FROM offices
        `);


        // Consultants
        const [consultants] = await pool.query(`
            SELECT
                id,
                first_name,
                last_name,
                office_id
            FROM users
        `);


const { start_date, end_date } = req.query;

// Client app transactions
const [transactions] = await pool.query(`
    SELECT
        loan_transactions.id,
        loan_transactions.loan_id,
        loan_transactions.amount,
        loan_transactions.credit,
        loan_transactions.debit,
        loan_transactions.date,
        loan_transactions.transaction_type,
        loan_transactions.payment_apply_to,

        loans.client_id,
        loans.office_id,
        loans.loan_officer_id

    FROM loan_transactions

    INNER JOIN loans
        ON loan_transactions.loan_id = loans.id

    WHERE loan_transactions.client_app = 'Yes'
      AND loan_transactions.date BETWEEN ? AND ?
`, [
    `${start_date} 00:00:00`,
    `${end_date} 23:59:59`
]);


        const transactionBreakdown = provinces.map(province => {


            const provinceTransactions = transactions.filter(transaction => {

                const office = offices.find(o => o.id === transaction.office_id);

                return office &&
                    office.province_id === province.id;

            });


            return {

                id: province.id,

                province: province.name,

                transaction_count: provinceTransactions.length,

                total_amount: provinceTransactions.reduce(
                    (sum, transaction) =>
                        sum + Number(transaction.amount || 0),
                    0
                ),


                offices: offices
                    .filter(office =>
                        office.province_id === province.id
                    )
                    .map(office => {


                        const officeTransactions = transactions.filter(transaction =>
                            transaction.office_id === office.id
                        );


                        return {

                            id: office.id,

                            name: office.name,


                            transaction_count: officeTransactions.length,


                            total_amount: officeTransactions.reduce(
                                (sum, transaction) =>
                                    sum + Number(transaction.amount || 0),
                                0
                            ),


                            loan_consultants: consultants
                                .filter(consultant =>
                                    consultant.office_id === office.id
                                )
                                .map(consultant => {


                                    const consultantTransactions =
                                        transactions.filter(transaction =>
                                            transaction.loan_officer_id === consultant.id
                                        );


                                    return {

                                        id: consultant.id,

                                        name:
                                            `${consultant.first_name} ${consultant.last_name}`,


                                        transaction_count:
                                            consultantTransactions.length,


                                        total_amount:
                                            consultantTransactions.reduce(
                                                (sum, transaction) =>
                                                    sum + Number(transaction.amount || 0),
                                                0
                                            ),


                                        transactions:
                                            consultantTransactions.map(transaction => ({
                                                id: transaction.id,
                                                loan_id: transaction.loan_id,
                                                client_id: transaction.client_id,
                                                amount: transaction.amount,
                                                credit: transaction.credit,
                                                debit: transaction.debit,
                                                transaction_type: transaction.transaction_type,
                                                payment_apply_to: transaction.payment_apply_to,
                                                date: transaction.date
                                            }))

                                    };


                                })

                        };


                    })

            };


        });


        return res.json({
            success: true,
            data: transactionBreakdown
        });


    } catch(error) {

        console.error(error);

        return res.status(500).json({
            success:false,
            message:"Server error",
            error:error.message
        });

    }
});






// //CASH MODULE ENDPOINT
app.get("/cash-module/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ============================================================
    // FIXED CYCLE DAY: 25th -> 24th
    // ============================================================
    const cycleEndDay = 24;
    const today = dayjs();

    let currentMonth = dayjs().startOf("month");

    let cycleDay = Math.min(
      cycleEndDay,
      currentMonth.daysInMonth()
    );

    let cycleDate = currentMonth
      .date(cycleDay)
      .add(1, "day"); // 25th

    if (today.isBefore(cycleDate)) {
      const prevMonth = dayjs()
        .subtract(1, "month")
        .startOf("month");

      cycleDay = Math.min(
        cycleEndDay,
        prevMonth.daysInMonth()
      );

      cycleDate = prevMonth
        .date(cycleDay)
        .add(1, "day"); // 25th
    }

    const start_date = cycleDate.format("YYYY-MM-DD");

    const end_date = cycleDate
      .add(1, "month")
      .subtract(1, "day")
      .format("YYYY-MM-DD"); // 24th

    // ============================================================
    // GET OFFICE
    // ============================================================
    const [officeRows] = await pool.query(
      `
      SELECT *
      FROM offices
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (officeRows.length === 0) {
      return res.status(404).json({
        error: "Office not found"
      });
    }

    const office = officeRows[0];

    // ============================================================
    // GET OFFICE LOANS
    // ============================================================
    const [loans] = await pool.query(
      `
      SELECT id
      FROM loans
      WHERE office_id = ?
      `,
      [id]
    );

    const loanIds = loans.map(l => l.id);

    let total_collected = 0;
    let given_out = 0;

    // ============================================================
// PREVIOUS CYCLE DATES FOR GIVEN OUT
// ============================================================

const previous_cycle_start = cycleDate
  .subtract(1, "month")
  .format("YYYY-MM-DD");

const previous_cycle_end = cycleDate
  .subtract(1, "day")
  .format("YYYY-MM-DD");


// ============================================================
// GET TRANSACTIONS
// ============================================================

if (loanIds.length > 0) {

  const placeholders = loanIds.map(() => "?").join(",");

  // ==========================================================
  // CURRENT CYCLE TRANSACTIONS
  // Used for TOTAL COLLECTED
  // ==========================================================

  const [currentTransactions] = await pool.query(
    `
    SELECT
      loan_id,
      debit,
      credit,
      transaction_type,
      payment_apply_to,
      balance_bf
    FROM loan_transactions
    WHERE loan_id IN (${placeholders})
      AND date >= ?
      AND date <= ?
    `,
    [
      ...loanIds,
      start_date,
      end_date
    ]
  );


  // ==========================================================
  // PREVIOUS CYCLE TRANSACTIONS
  // Used for GIVEN OUT
  // ==========================================================

  const [previousTransactions] = await pool.query(
    `
    SELECT
      loan_id,
      debit,
      credit,
      transaction_type,
      payment_apply_to,
      balance_bf
    FROM loan_transactions
    WHERE loan_id IN (${placeholders})
      AND date >= ?
      AND date <= ?
    `,
    [
      ...loanIds,
      previous_cycle_start,
      previous_cycle_end
    ]
  );


  // ==========================================================
  // CURRENT CYCLE COLLECTIONS
  // ==========================================================

  currentTransactions.forEach(t => {

    const credit = Number(t.credit) || 0;
    const balance_bf = Number(t.balance_bf) || 0;

    if (t.transaction_type === "repayment") {

      if (t.payment_apply_to === "reloan_payment") {

        total_collected += balance_bf;

      } else if (
        ["full_payment", "part_payment"].includes(
          t.payment_apply_to
        )
      ) {

        total_collected += credit;
      }
    }

  });


  // ==========================================================
  // PREVIOUS CYCLE GIVEN OUT
  // ==========================================================

  previousTransactions.forEach(t => {

    const debit = Number(t.debit) || 0;

    // Normal disbursements
    if (t.transaction_type === "disbursement") {

      given_out += debit;
    }

    // Reloan given out
    if (
      t.transaction_type === "repayment" &&
      t.payment_apply_to === "reloan_payment"
    ) {

      const balance_bf =
        Number(t.balance_bf) || 0;

      const credit =
        Number(t.credit) || 0;

      const reloan_amount =
        balance_bf - credit;

      // Add reloan amount to previous-cycle given out
    //  given_out += reloan_amount;
    }

  });

}
    // ============================================================
    // GET CASH MODULE PARAMETERS BY ID
    // ============================================================
    const [parameterRows] = await pool.query(
      `
      SELECT id, value
      FROM cash_module_parameters
      WHERE id IN (1,2, 3,4,5, 6, 7,8, 9, 10)
      `
    );

    const parameters = {};

    parameterRows.forEach(parameter => {
      parameters[parameter.id] =
        Number(parameter.value) || 0;
    });

    // Make sure all required parameters exist
    const requiredParameterIds = [1,2, 3,4,5, 6,7, 8, 9, 10];

    const missingParameters = requiredParameterIds.filter(
      parameterId => !(parameterId in parameters)
    );

    if (missingParameters.length > 0) {
      return res.status(500).json({
        error: "Cash module parameters are incomplete",
        missing_parameter_ids: missingParameters
      });
    }

    // ============================================================
    // PARAMETERS
    // ============================================================

    // Parameter ID 2
    const workstationTarget = parameters[1];

    // Parameter ID 3
    const maximumExpectedRepaymentRate = parameters[2];

    // Parameter IDs 8, 9, 10 and 6
    const mandatory_fixed_cost =
      parameters[7] +
      parameters[8] +
      parameters[9] +
      parameters[6];

      console.log('PARAMETERS:' ,
      parameters[7],
      parameters[8] ,
      parameters[9] ,
      parameters[6])

    // ============================================================
    // CASH MODULE CALCULATIONS
    // ============================================================

    // Minimum loan target based on office workstations
    const minimum_loan_target =
      (Number(office.workstations) || 0) *
      workstationTarget;

    // Maximum expected repayment
    const maximum_expected_repayment =
      given_out *
      (1 + (maximumExpectedRepaymentRate/100));

    // Expected cash requirement
    const expected_cash_requirement =
      minimum_loan_target +
      mandatory_fixed_cost;

    // Surplus / deficit
    const cash_surplus_or_deficit =
      maximum_expected_repayment -
      expected_cash_requirement;

    // ============================================================
    // RESPONSE
    // ============================================================
    return res.json({
      office: {
        id: office.id,
        name: office.name,
        workstations: Number(office.workstations) || 0
      },

      cycle: {
        start_date,
        end_date
      },

      loans: {
        number_of_loans: loanIds.length,
        given_out,
        total_collected
      },

      cash_module: {
        minimum_loan_target,
        maximum_expected_repayment,
        mandatory_fixed_cost,
        expected_cash_requirement,
        cash_surplus_or_deficit,

        status:
          cash_surplus_or_deficit >= 0
            ? "surplus"
            : "deficit"
      }
    });

  } catch (error) {
    console.error("Cash module error:", error);

    return res.status(500).json({
      error: "Unable to load cash module",
      message: error.message
    });
  }
});




app.get('/salary-predictor/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // 1. Get consultants in the office
    // --------------------------------------------------
    const [consultants] = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name
      FROM users u
      JOIN role_users ru 
        ON ru.user_id = u.id
      WHERE ru.role_id IN (3, 4, 6)
        AND u.office_id = ?
        AND u.status = 'active'
    `, [id]);

    if (consultants.length === 0) {
      return res.json({
        office_id: id,
        consultants: [],
        total_salary: 0
      });
    }

    // --------------------------------------------------
    // 2. Get cycle end day
    //
    // Use the office consultants' cycle_end_date where
    // available. Default = 24.
    // --------------------------------------------------
    const cycleEndDay = consultants[0].cycle_end_date
      ? parseInt(consultants[0].cycle_end_date)
      : 24;

    const today = dayjs();

    let currentMonth = dayjs().startOf('month');

    let cycleDay = Math.min(
      cycleEndDay,
      currentMonth.daysInMonth()
    );

    let cycleDate = currentMonth
      .date(cycleDay)
      .add(1, 'day');

    if (today.isBefore(cycleDate)) {
      let prevMonth = dayjs()
        .subtract(1, 'month')
        .startOf('month');

      cycleDay = Math.min(
        cycleEndDay,
        prevMonth.daysInMonth()
      );

      cycleDate = prevMonth
        .date(cycleDay)
        .add(1, 'day');
    }

    const start_date = cycleDate.format('YYYY-MM-DD');

    // --------------------------------------------------
    // 3. Get the current target for all consultants
    // --------------------------------------------------
    const consultantIds = consultants.map(c => c.id);

    const placeholders = consultantIds
      .map(() => '?')
      .join(',');

    const [targets] = await pool.query(`
      SELECT
        user_id,
        cycle_start,
        target_level
      FROM targets_met
      WHERE cycle_start = ?
        AND user_id IN (${placeholders})
    `, [
      start_date,
      ...consultantIds
    ]);

    // --------------------------------------------------
    // 4. Get previous 3 cycles for the consultants
    //
    // We need to determine whether they reached at least
    // 40,000 for each of the previous 3 cycles.
    // --------------------------------------------------
    const [previousTargets] = await pool.query(`
      SELECT
        user_id,
        cycle_start,
        target_level
      FROM targets_met
      WHERE user_id IN (${placeholders})
        AND cycle_start < ?
      ORDER BY cycle_start DESC
    `, [
      ...consultantIds,
      start_date
    ]);

    // --------------------------------------------------
    // 5. Group current targets by consultant
    // --------------------------------------------------
    const currentTargetMap = {};

    targets.forEach(target => {
      currentTargetMap[target.user_id] = parseFloat(
        target.target_level || 0
      );
    });

    // --------------------------------------------------
    // 6. Group previous targets by consultant
    // --------------------------------------------------
    const previousTargetMap = {};

    previousTargets.forEach(target => {
      if (!previousTargetMap[target.user_id]) {
        previousTargetMap[target.user_id] = [];
      }

      // Only keep the latest 3 cycles
      if (previousTargetMap[target.user_id].length < 3) {
        previousTargetMap[target.user_id].push({
          cycle_start: target.cycle_start,
          target_level: parseFloat(target.target_level || 0)
        });
      }
    });

    // --------------------------------------------------
    // 7. Salary prediction
    // --------------------------------------------------
    let totalSalary = 0;

    const salaryPredictions = consultants.map(consultant => {

      const currentTarget =
        currentTargetMap[consultant.id] || 0;

      const previousThree =
        previousTargetMap[consultant.id] || [];

      // Has the consultant achieved at least 40,000
      // in ALL of the previous 3 cycles?
      const reached40kForLast3Months =
        previousThree.length === 3 &&
        previousThree.every(
          target => target.target_level >= 40000
        );

      let predictedSalary;

      // ------------------------------------------------
      // Current target salary mapping
      // ------------------------------------------------
      if (currentTarget >= 120000) {
        predictedSalary = 12000;
      } 
      else if (currentTarget >= 80000) {
        predictedSalary = 9000;
      } 
      else if (currentTarget >= 50000) {
        predictedSalary = 8000;
      } 
      else if (currentTarget >= 40000) {
        predictedSalary = 7000;
      } 
      else {
        // Below 40k
        //
        // If they have reached at least 40k for the
        // previous 3 cycles, default salary is 7000.
        // Otherwise salary is 5000.
        predictedSalary = reached40kForLast3Months
          ? 7000
          : 5000;
      }

      totalSalary += predictedSalary;

      return {
        user_id: consultant.id,
        name: `${consultant.first_name || ''} ${consultant.last_name || ''}`.trim(),
        current_target_level: currentTarget,
        previous_3_targets: previousThree,
        reached_40000_last_3_months: reached40kForLast3Months,
        predicted_salary: predictedSalary
      };
    });

    // --------------------------------------------------
    // 8. Return result
    // --------------------------------------------------
    return res.json({
      office_id: id,
      cycle_start: start_date,
      consultants: salaryPredictions,
      total_salary: totalSalary
    });

  } catch (error) {
    console.error('Salary predictor error:', error);

    return res.status(500).json({
      error: 'Unable to predict salaries',
      message: error.message
    });
  }
});

///
app.get('/uncollected-amounts/:id', async (req, res) => {
  try {

      const { id } = req.params;
    const { office_id } = id;

    if (!office_id) {
      return res.status(400).json({
        error: "office_id is required"
      });
    }

    // Fixed cycle: 25th -> 24th
    const cycleEndDay = 24;
    const today = dayjs();

    let currentMonth = dayjs().startOf('month');
    let cycleDay = Math.min(
      cycleEndDay,
      currentMonth.daysInMonth()
    );

    let cycleDate = currentMonth
      .date(cycleDay)
      .add(1, 'day'); // 25th

    if (today.isBefore(cycleDate)) {
      let prevMonth = dayjs()
        .subtract(1, 'month')
        .startOf('month');

      cycleDay = Math.min(
        cycleEndDay,
        prevMonth.daysInMonth()
      );

      cycleDate = prevMonth
        .date(cycleDay)
        .add(1, 'day');
    }

    const start_date = cycleDate.format('YYYY-MM-DD');

    const end_date = cycleDate
      .add(1, 'month')
      .subtract(1, 'day')
      .format('YYYY-MM-DD');

    // Get loans for this office
    const [loans] = await pool.query(
      `
      SELECT id
      FROM loans
      WHERE office_id = ?
      `,
      [office_id]
    );

    const loanIds = loans.map(l => l.id);

    // No loans = nothing uncollected
    if (loanIds.length === 0) {
      return res.json({
        office_id,
        start_date,
        end_date,
        still_uncollected: "0.00"
      });
    }

    // Transactions within current cycle
    const [transactions] = await pool.query(
      `
      SELECT
        loan_id,
        debit,
        credit,
        transaction_type,
        payment_apply_to,
        balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND date >= ?
        AND date <= ?
      `,
      [loanIds, start_date, end_date]
    );

    // Transactions before the current cycle
    // Interest waivers are always included
    const [transactions_two] = await pool.query(
      `
      SELECT
        loan_id,
        debit,
        credit,
        transaction_type,
        payment_apply_to,
        balance_bf
      FROM loan_transactions
      WHERE loan_id IN (?)
        AND (
          date < ?
          OR transaction_type = 'interest_waiver'
        )
      `,
      [loanIds, start_date]
    );

    let total_uncollected = 0;
    let total_collected = 0;

    // Calculate collections during the current cycle
    transactions.forEach(t => {

      const debit = Number(t.debit) || 0;
      const credit = Number(t.credit) || 0;

      if (t.transaction_type === 'repayment') {

        if (t.payment_apply_to === 'reloan_payment') {

          total_collected += Number(t.balance_bf) || 0;

        } else if (
          ['full_payment', 'part_payment'].includes(
            t.payment_apply_to
          )
        ) {

          total_collected += credit;
        }
      }
    });

    // Calculate amount that was already outstanding
    transactions_two.forEach(t => {

      const debit = Number(t.debit) || 0;
      const credit = Number(t.credit) || 0;

      if (t.transaction_type !== 'specified_due_date_fee') {
        total_uncollected += debit - credit;
      }
    });

    // Final still uncollected amount
    const still_uncollected =
      total_uncollected - total_collected;

    return res.json({
      office_id,
      start_date,
      end_date,
      still_uncollected: still_uncollected.toFixed(2)
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Something went wrong."
    });
  }
});

app.get('/irregular-cost-reserve/:id', async (req, res) => {
  try {

    const { id } = req.params;
    const office_id  = id;

    if (!office_id) {
      return res.status(400).json({
        error: "office_id is required"
      });
    }

    const officeId = Number(office_id);

    // ---------------------------------------------------------
    // 1. Get office information
    // ---------------------------------------------------------

    const [officeRows] = await pool.query(
      `
      SELECT
        o.id,
        o.name,
        o.district_id
      FROM offices o
      WHERE o.id = ?
      LIMIT 1
      `,
      [officeId]
    );

    if (officeRows.length === 0) {
      return res.status(404).json({
        error: "Office not found"
      });
    }

    const office = officeRows[0];

    // ---------------------------------------------------------
    // 2. Date boundaries
    // ---------------------------------------------------------

    const today = dayjs();

    const twelveMonthsAgo = today
      .subtract(12, 'month')
      .startOf('month')
      .format('YYYY-MM-DD');

    const threeMonthsAgo = today
      .subtract(3, 'month')
      .startOf('month')
      .format('YYYY-MM-DD');

    const oneMonthAgo = today
      .subtract(1, 'month')
      .startOf('month')
      .format('YYYY-MM-DD');

    const todayDate = today.format('YYYY-MM-DD');

    // ---------------------------------------------------------
    // 3. Get all relevant expenses for this branch
    //
    // We deliberately retrieve expense_type AND name.
    // Classification happens in JavaScript because your
    // database does not have dedicated types for every
    // irregular cost.
    // ---------------------------------------------------------

    const [branchExpenses] = await pool.query(
      `
      SELECT
        e.id,
        e.office_id,
        e.expense_type_id,
        e.name,
        e.amount,
        e.date,
        e.status,
        et.name AS expense_type_name
      FROM expenses e
      LEFT JOIN expense_types et
        ON et.id = e.expense_type_id
      WHERE e.office_id = ?
        AND e.date >= ?
        AND e.date <= ?
        AND (
          e.status IS NULL
          OR LOWER(e.status) IN ('approved', 'paid')
        )
      ORDER BY e.date ASC
      `,
      [
        officeId,
        twelveMonthsAgo,
        todayDate
      ]
    );

    // ---------------------------------------------------------
    // 4. Get system-wide expenses
    //
    // Used when branch history is insufficient.
    // ---------------------------------------------------------

    const [systemExpenses] = await pool.query(
      `
      SELECT
        e.id,
        e.office_id,
        e.expense_type_id,
        e.name,
        e.amount,
        e.date,
        e.status,
        et.name AS expense_type_name
      FROM expenses e
      LEFT JOIN expense_types et
        ON et.id = e.expense_type_id
      WHERE e.date >= ?
        AND e.date <= ?
        AND (
          e.status IS NULL
          OR LOWER(e.status) IN ('approved', 'paid')
        )
      ORDER BY e.date ASC
      `,
      [
        twelveMonthsAgo,
        todayDate
      ]
    );

    // ---------------------------------------------------------
    // Helper: normalize text
    // ---------------------------------------------------------

    function normalize(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // ---------------------------------------------------------
    // Helper: keyword matching
    // ---------------------------------------------------------

    function containsAny(text, keywords) {
      return keywords.some(keyword => {
        return text.includes(keyword);
      });
    }

    // ---------------------------------------------------------
    // 5. Classify each expense
    // ---------------------------------------------------------

    function classifyExpense(expense) {

      const type = normalize(expense.expense_type_name);
      const name = normalize(expense.name);

      const text = `${type} ${name}`;

      // ---------------------------------------------
      // RENT
      // ---------------------------------------------

      if (
        type.includes('office rentals') ||
        containsAny(name, [
          'rent',
          'rental',
          'office rent',
          'building rent',
          'premises rent'
        ])
      ) {
        return 'rent';
      }

      // ---------------------------------------------
      // VEHICLE REPAIRS / MAINTENANCE
      // ---------------------------------------------

  const vehicleRepairName =
  containsAny(name, [
    'vehicle repair',
    'vehicle repairs',
    'vehicle maintenance',
    'vehicle service',
    'mechanical repair',
    'mechanical',
    'tyre',
    'tire',
    'puncture',
    'brake',
    'engine repair',
    'gearbox',
    'suspension',
    'vehicle battery',
    'car repair',
    'truck repair'
  ]);

const vehicleExcluded =
  containsAny(name, [
    'fuel',
    'petrol',
    'diesel',
    'insurance',
    'registration',
    'licence',
    'license',
    'vehicle purchase'
  ]);

if (
  vehicleRepairName &&
  !vehicleExcluded
) {
  return 'vehicle_repairs';
}

      // ---------------------------------------------
      // CONSUMABLES / PETTY CASH
      // ---------------------------------------------

      if (
        type.includes('petty cash') ||
        containsAny(name, [
          'petty cash',
          'consumable',
          'consumables',
          'stationery',
          'office supplies',
          'cleaning supplies',
          'drinking water',
          'refreshments',
          'office refreshments'
        ])
      ) {
        return 'consumables_petty_cash';
      }

      // ---------------------------------------------
      // FIELD / COLLATERAL / SEIZURE TRANSPORT
      // ---------------------------------------------

      if (
        type.includes('recovery unit expense') ||
        containsAny(text, [
          'recovery',
          'collateral seizure',
          'collateral transport',
          'seizure transport',
          'repossession',
          'repossess',
          'towing',
          'tow truck',
          'tow ',
          'field transport',
          'recovery transport'
        ])
      ) {
        return 'field_collateral_transport';
      }

      // ---------------------------------------------
      // STAFF WELFARE / FUNERAL
      // ---------------------------------------------

      if (
        containsAny(text, [
          'staff welfare',
          'employee welfare',
          'welfare assistance',
          'funeral',
          'funeral assistance',
          'burial',
          'bereavement',
          'condolence',
          'death assistance'
        ])
      ) {
        return 'staff_welfare_funeral';
      }

      return null;
    }

    // ---------------------------------------------------------
    // 6. Classify branch expenses
    // ---------------------------------------------------------

    const classifiedBranchExpenses = branchExpenses
      .map(expense => ({
        ...expense,
        category: classifyExpense(expense),
        amount: Number(expense.amount) || 0
      }))
      .filter(expense => expense.category);

    // ---------------------------------------------------------
    // 7. Classify system-wide expenses
    // ---------------------------------------------------------

    const classifiedSystemExpenses = systemExpenses
      .map(expense => ({
        ...expense,
        category: classifyExpense(expense),
        amount: Number(expense.amount) || 0
      }))
      .filter(expense => expense.category);

    // ---------------------------------------------------------
    // Helper: average monthly spend
    //
    // Divides by the number of months that actually have
    // elapsed in the requested period, rather than blindly
    // dividing by 12.
    // ---------------------------------------------------------

    function monthlyAverage(expenses, months) {

      if (!expenses.length) {
        return 0;
      }

      const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      return total / months;
    }

    // ---------------------------------------------------------
    // 8. RENT
    //
    // Find the most recent rent payment.
    //
    // A quarterly payment is spread over 3 months.
    // The next payment effectively starts a new 3-month
    // accrual cycle.
    // ---------------------------------------------------------

    const rentExpenses = classifiedBranchExpenses
      .filter(e => e.category === 'rent')
      .sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

    let rentReserve = 0;
    let lastRentPayment = 0;
    let lastRentPaymentDate = null;

    if (rentExpenses.length > 0) {

      const latestRent = rentExpenses[0];

      lastRentPayment = latestRent.amount;
      lastRentPaymentDate = latestRent.date;

      // One third of the latest quarterly payment
      rentReserve = lastRentPayment / 3;
    }

    // ---------------------------------------------------------
    // 9. VEHICLE REPAIRS
    //
    // Branch trailing 12 months.
    //
    // If branch has less than 12 months of history,
    // use system-wide monthly average.
    // ---------------------------------------------------------

    const branchVehicleRepairs =
      classifiedBranchExpenses.filter(
        e => e.category === 'vehicle_repairs'
      );

    const systemVehicleRepairs =
      classifiedSystemExpenses.filter(
        e => e.category === 'vehicle_repairs'
      );

    const branchVehicleMonths = new Set(
      branchVehicleRepairs.map(e =>
        dayjs(e.date).format('YYYY-MM')
      )
    ).size;

let vehicleRepairsReserve = 0;

if (branchVehicleMonths >= 12) {

  vehicleRepairsReserve =
    monthlyAverage(
      branchVehicleRepairs,
      12
    );

} else {

  // Use the system-wide trailing 12-month average
  vehicleRepairsReserve =
    systemVehicleRepairs.length > 0
      ? monthlyAverage(
          systemVehicleRepairs,
          12
        )
      : 0;
}

    // ---------------------------------------------------------
    // 10. CONSUMABLES / PETTY CASH
    //
    // Trailing 3-month branch average.
    //
    // If there is no branch history, use configured estimate.
    // ---------------------------------------------------------

    const branchConsumables =
      classifiedBranchExpenses.filter(
        e =>
          e.category === 'consumables_petty_cash' &&
          dayjs(e.date).isAfter(
            dayjs(threeMonthsAgo).subtract(1, 'day')
          )
      );

    const systemConsumables =
      classifiedSystemExpenses.filter(
        e =>
          e.category === 'consumables_petty_cash'
      );

    let consumablesReserve = 0;

    if (branchConsumables.length > 0) {

      consumablesReserve =
        monthlyAverage(
          branchConsumables,
          3
        );

    } else {

      // Replace this with your configured parameter later.
      const configuredMonthlyEstimate = 0;

      consumablesReserve =
        configuredMonthlyEstimate;
    }

    // ---------------------------------------------------------
    // 11. FIELD / COLLATERAL TRANSPORT
    //
    // Trailing 12-month rolling average.
    // ---------------------------------------------------------

    const branchTransport =
      classifiedBranchExpenses.filter(
        e =>
          e.category === 'field_collateral_transport'
      );

    const fieldCollateralTransportReserve =
      monthlyAverage(
        branchTransport,
        12
      );

    // ---------------------------------------------------------
    // 12. STAFF WELFARE / FUNERAL
    //
    // Monthly smoothing based on actual historical
    // payments.
    //
    // Branch history first.
    // If insufficient, use system-wide history.
    // ---------------------------------------------------------

    const branchWelfare =
      classifiedBranchExpenses.filter(
        e =>
          e.category === 'staff_welfare_funeral'
      );

    const systemWelfare =
      classifiedSystemExpenses.filter(
        e =>
          e.category === 'staff_welfare_funeral'
      );

    let staffWelfareReserve = 0;

    if (branchWelfare.length > 0) {

      staffWelfareReserve =
        monthlyAverage(
          branchWelfare,
          12
        );

    } else {

      const systemWelfareMonths = new Set(
        systemWelfare.map(e =>
          dayjs(e.date).format('YYYY-MM')
        )
      ).size;

      if (systemWelfareMonths > 0) {

        staffWelfareReserve =
          monthlyAverage(
            systemWelfare,
            systemWelfareMonths
          );
      }
    }

    // ---------------------------------------------------------
    // 13. TOTAL IRREGULAR COST RESERVE
    // ---------------------------------------------------------

    const irregularCostReserve =
      rentReserve +
      vehicleRepairsReserve +
      consumablesReserve +
      fieldCollateralTransportReserve +
      staffWelfareReserve;

    // ---------------------------------------------------------
    // 14. Response
    // ---------------------------------------------------------

    return res.json({

      office_id: office.id,
      office: office.name,

      irregular_cost_reserve:
        Number(irregularCostReserve.toFixed(2)),

      breakdown: {

        rent:
          Number(rentReserve.toFixed(2)),

        vehicle_repairs:
          Number(vehicleRepairsReserve.toFixed(2)),

        consumables_petty_cash:
          Number(consumablesReserve.toFixed(2)),

        field_collateral_transport:
          Number(
            fieldCollateralTransportReserve.toFixed(2)
          ),

        staff_welfare_funeral:
          Number(
            staffWelfareReserve.toFixed(2)
          )
      },

      details: {

        rent: {
          last_payment:
            Number(lastRentPayment.toFixed(2)),

          last_payment_date:
            lastRentPaymentDate,

          monthly_accrual:
            Number(rentReserve.toFixed(2)),

          rule:
            "1/3 of latest quarterly payment"
        },

        vehicle_repairs: {
          rule:
            branchVehicleMonths >= 12
              ? "Branch trailing 12-month average"
              : "System-wide average because branch has less than 12 months history",

          months_of_branch_history:
            branchVehicleMonths
        },

        consumables_petty_cash: {
          rule:
            branchConsumables.length > 0
              ? "Branch trailing 3-month average"
              : "Configured monthly estimate"
        },

        field_collateral_transport: {
          rule:
            "Branch trailing 12-month rolling average"
        },

        staff_welfare_funeral: {
          rule:
            branchWelfare.length > 0
              ? "Branch historical monthly smoothing"
              : "System-wide historical monthly smoothing"
        }
      }
    });

  } catch (error) {

    console.error(
      'Irregular Cost Reserve Error:',
      error
    );

    return res.status(500).json({
      error: "Unable to calculate irregular cost reserve",
      message: error.message
    });
  }
});


app.get('/salary-advance-reserve/:id', async (req, res) => {
  try {

    const { id: office_id } = req.params;

    if (!office_id) {
      return res.status(400).json({
        error: "office_id is required"
      });
    }

    // Get all outstanding salary advances for this office
    const [advances] = await pool.query(
      `
      SELECT
        user_id,
        office_id,
        full_name,
        first_name,
        last_name,
        amount,
        installments,
        installment_amount,
        status,
        mode_of_payment,
        purpose,
        date_requested,
        date_approved,
        amount_paid,
        remaining_amount,
        expected_repayment_dates,
        last_update_date
      FROM advances
      WHERE office_id = ?
        AND status = 'approved'
        AND remaining_amount > 0
      ORDER BY remaining_amount DESC
      `,
      [office_id]
    );

    // Calculate total outstanding salary advances
    const salaryAdvanceReserve = advances.reduce(
      (total, advance) =>
        total + (Number(advance.remaining_amount) || 0),
      0
    );

    return res.json({
      office_id: Number(office_id),

      salary_advances: Number(
        salaryAdvanceReserve.toFixed(2)
      ),

      advance_count: advances.length,

      advances: advances.map(advance => ({
        user_id: advance.user_id,
        full_name:
          advance.full_name ||
          `${advance.first_name || ''} ${advance.last_name || ''}`.trim(),

        original_amount: Number(
          advance.amount || 0
        ).toFixed(2),

        amount_paid: Number(
          advance.amount_paid || 0
        ).toFixed(2),

        remaining_amount: Number(
          advance.remaining_amount || 0
        ).toFixed(2),

        installment_amount: Number(
          advance.installment_amount || 0
        ).toFixed(2),

        status: advance.status,

        purpose: advance.purpose,

        date_requested: advance.date_requested,

        date_approved: advance.date_approved,

        expected_repayment_dates:
          advance.expected_repayment_dates
      }))
    });

  } catch (error) {

    console.error(
      'Salary Advance Reserve Error:',
      error
    );

    return res.status(500).json({
      error: "Unable to calculate salary advance reserve",
      message: error.message
    });
  }
});



app.get('/defaulted-loans', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required.'
      });
    }

    const [loans] = await pool.query(`
    SELECT
    l.id AS loan_id,
    l.client_id,

    DATE_FORMAT(l.created_date, '%Y-%m-%d') AS created_date,

    l.loan_officer_id,
    CONCAT(lo.first_name, ' ', lo.last_name) AS loan_officer_name,

    l.vetted_by,
    CONCAT(v.first_name, ' ', v.last_name) AS vetted_by_name,

    l.verified_by,
    CONCAT(ver.first_name, ' ', ver.last_name) AS verified_by_name,

    DATE_FORMAT(l.first_repayment_date, '%Y-%m-%d') AS first_repayment_date,

    l.principal,

    l.office_id,
    o.name AS office_name

FROM loans l

LEFT JOIN users lo
    ON lo.id = l.loan_officer_id

LEFT JOIN users v
    ON v.id = l.vetted_by

LEFT JOIN users ver
    ON ver.id = l.verified_by

LEFT JOIN offices o
    ON o.id = l.office_id

WHERE
    (
        l.vetted_by = ?
        OR l.verified_by = ?
    )

    AND l.status = 'disbursed'

    AND CURDATE() > DATE_ADD(DATE(l.created_date), INTERVAL 1 MONTH)

    AND NOT EXISTS (
        SELECT 1
        FROM loan_transactions lt
        WHERE lt.loan_id = l.id
          AND lt.transaction_type = 'repayment'
          AND lt.payment_apply_to IN ('full_payment', 'reloan_payment')
    )

ORDER BY l.id DESC
    `, [user_id, user_id]);

    // If there are no loans
    if (loans.length === 0) {
      return res.json({
        success: true,
        total_loans: 0,
        loans: []
      });
    }

    // Get all transactions for the returned loans
    const loanIds = loans.map(loan => loan.loan_id);

    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions WHERE loan_id IN (?)`,
      [loanIds]
    );

    // Calculate balance for each loan
    const loansWithBalance = loans.map(loan => {
      let debit = 0;
      let credit = 0;

      const filteredTransactions = transactions.filter(
        t => t.loan_id === loan.loan_id
      );

      filteredTransactions.forEach(t => {
        debit += Number(t.debit) || 0;

        if (t.payment_apply_to === 'reloan_payment') {
          const reloanAmount =
            Number(loan.principal) + (Number(loan.principal) * 0.4);

          credit += reloanAmount;
        } else {
          credit += Number(t.credit) || 0;
        }
      });

      return {
        ...loan,
        balance: debit - credit
      };
    });

    res.json({
      success: true,
      total_loans: loansWithBalance.length,
      loans: loansWithBalance
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});


app.get('/defaulted-loans-all', async (req, res) => {
  try {

    const [loans] = await pool.query(`
      SELECT
        l.id AS loan_id,
        l.client_id,

        DATE_FORMAT(l.created_date, '%Y-%m-%d') AS created_date,

        l.loan_officer_id,
        CONCAT(lo.first_name, ' ', lo.last_name) AS loan_officer_name,

        l.vetted_by,
        CONCAT(v.first_name, ' ', v.last_name) AS vetted_by_name,

        l.verified_by,
        CONCAT(ver.first_name, ' ', ver.last_name) AS verified_by_name,

        DATE_FORMAT(l.first_repayment_date, '%Y-%m-%d') AS first_repayment_date,

        l.principal,

        l.office_id,
        o.name AS office_name

      FROM loans l

      LEFT JOIN users lo
        ON lo.id = l.loan_officer_id

      LEFT JOIN users v
        ON v.id = l.vetted_by

      LEFT JOIN users ver
        ON ver.id = l.verified_by

      LEFT JOIN offices o
        ON o.id = l.office_id

      WHERE
        l.status = 'disbursed'

        AND CURDATE() > DATE_ADD(DATE(l.created_date), INTERVAL 1 MONTH)

        AND NOT EXISTS (
          SELECT 1
          FROM loan_transactions lt
          WHERE lt.loan_id = l.id
            AND lt.transaction_type = 'repayment'
            AND lt.payment_apply_to IN ('full_payment', 'reloan_payment')
        )

      ORDER BY l.id DESC
    `);

    // If there are no loans
    if (loans.length === 0) {
      return res.json({
        success: true,
        total_loans: 0,
        loans: []
      });
    }

    // Get all transactions for the returned loans
    const loanIds = loans.map(loan => loan.loan_id);

    const [transactions] = await pool.query(
      `SELECT * FROM loan_transactions WHERE loan_id IN (?)`,
      [loanIds]
    );

    // Calculate balance for each loan
    const loansWithBalance = loans.map(loan => {

      let debit = 0;
      let credit = 0;

      const filteredTransactions = transactions.filter(
        t => t.loan_id === loan.loan_id
      );

      filteredTransactions.forEach(t => {

        debit += Number(t.debit) || 0;

        if (t.payment_apply_to === 'reloan_payment') {

          const reloanAmount =
            Number(loan.principal) +
            (Number(loan.principal) * 0.4);

          credit += reloanAmount;

        } else {

          credit += Number(t.credit) || 0;

        }

      });

      return {
        ...loan,
        balance: debit - credit
      };

    });

    res.json({
      success: true,
      total_loans: loansWithBalance.length,
      loans: loansWithBalance
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });

  }
});


//THIS IS THE OG CODE

server.listen(5000, "0.0.0.0", () => console.log("🚀 Server running"))



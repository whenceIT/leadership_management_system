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
    require('./services/cashHealthService');
   

   
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

 const cashHealthService = createCashHealthService(pool);



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





});







//THIS IS THE OG CODE

server.listen(5000, "0.0.0.0", () => console.log("🚀 Server running"))
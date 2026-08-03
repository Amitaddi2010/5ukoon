import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../artifacts/api-server/sqlite.db").replace(/\\/g, '/');
const url = `file:${dbPath}`;

const sqlite = createClient({ url });

const rawData = `Amit Raj Saraswat
Anaesthesia
researchpgimer@gmail.com
7006613064
Definitely (100%)
Jul 30, 10:09 AM
APPROVED
WhatsApp Pass
Email Pass
Reset
Kavita
Other PGIMER Dept
kavitachanaliya1@gmail.com
9053475327
Definitely (100%)
Jul 31, 2:58 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Prabhjot Kaur
Other PGIMER Dept
prabh.99.dhaliwal@gmail.com
8427255484
Definitely (100%)
Jul 31, 2:58 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Mridul Sharma
Other PGIMER Dept
mridulsharma947@gmail.com
08544782911
Definitely (100%)
Jul 31, 3:03 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Snigdha Reddy
Other PGIMER Dept
snigdhamowli@yahoo.co.in
9490494550
Likely (75%)
Jul 31, 3:06 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Ajay
Admin / Staff
ajjurao96@gmail.com
8168400638
50-50 / Unsure
Jul 31, 3:06 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Himanshi Khera
Other PGIMER Dept
kherahimanshi740@gmail.con
9779761637
Likely (75%)
Jul 31, 3:07 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Pulkit Gautam
Other PGIMER Dept
pulkitgautam2@gmail.com
8076435379
Definitely (100%)
Jul 31, 3:08 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Muskan
Other PGIMER Dept
uniyalmuskan@gmail.com
6284063681
Definitely (100%)
Jul 31, 3:10 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Ruby
Surgery
siddiquiruby0102@gmail.com
9855444220
50-50 / Unsure
Jul 31, 3:14 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Monika
Other PGIMER Dept
0001monikabhamaniya@gmail.com
9350189107
Likely (75%)
Jul 31, 3:16 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
prachi
Other PGIMER Dept
prachisingh.shekhawat@gmail.com
9814411135
Likely (75%)
Jul 31, 3:18 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Dhinesh
Other PGIMER Dept
dhineshp008@gmail.com
9442693029
50-50 / Unsure
Jul 31, 3:31 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Namarta Negi
Other PGIMER Dept
neginamarta1@gmail.com
7018914544
50-50 / Unsure
Jul 31, 3:34 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
PARAMPREET KAUR
Other PGIMER Dept
parampreetkaurbains2001@gmail.com
7901899895
Definitely (100%)
Jul 31, 3:35 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Narender Saroha
Other PGIMER Dept
narendersaroha717@gmail.com
7206246212
Likely (75%)
Jul 31, 3:43 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Priyanka yadav
Other PGIMER Dept
priyankayadav63819@gmail.com
9015368059
50-50 / Unsure
Jul 31, 3:51 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Nikita
Other PGIMER Dept
nikishreshta135@gmail.com
9056616628
Likely (75%)
Jul 31, 4:07 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
RAVINDER KUMAR THAKUR
Cardiology
ravikthakur777@gmail.com
09805899977
Definitely (100%)
Jul 31, 4:41 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Nedhi
Admin / Staff
nedhikumari0191@gmail.com
9149575656
Likely (75%)
Jul 31, 4:56 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Amit Chauhan
Pediatrics
chauhanamit871999@gmail.com
9592251968
Definitely (100%)
Jul 31, 5:19 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Abhishek Chandel
Other PGIMER Dept
abhichandel1995@gmail.com
9459015960
Likely (75%)
Jul 31, 5:33 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
sandeep sandhu
Other PGIMER Dept
kaursk.221998@gmail.com
8837848686
Definitely (100%)
Jul 31, 5:37 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Harsh Srivastava
Other PGIMER Dept
harsh08sri@gmail.com
09650656981
Definitely (100%)
Jul 31, 5:37 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Aniket Agrahari
Other PGIMER Dept
aniket.agrahari2000@gmail.com
7249838898
Definitely (100%)
Jul 31, 6:20 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Muskan Saini
Other PGIMER Dept
muskansaini2801@gmail.com
8920265665
Definitely (100%)
Jul 31, 6:26 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Satvik
Other PGIMER Dept
satvikkalra9@gmail.com
7814823936
Definitely (100%)
Jul 31, 8:01 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Bharti Dandora
Pediatrics
dandora.bharti@gmail.com
8629059307
Definitely (100%)
Jul 31, 8:55 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Gaurav
Other PGIMER Dept
gk1.aquarious@gmail.com
7355336367
Definitely (100%)
Jul 31, 9:13 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Riya Pandey
Other PGIMER Dept
rp0261411@gmail.com
9501650665
Definitely (100%)
Jul 31, 10:45 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
MANISH KUMAR
Other PGIMER Dept
manish19298kumar@gmail.com
9263828158
Definitely (100%)
Jul 31, 11:00 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Jaspreet
Nursing
jaspreetkaurbains2001@gmail.com
7696422099
Definitely (100%)
Jul 31, 11:16 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
keshav
Other PGIMER Dept
keshavgoyal213@gmail.com
9914203813
Likely (75%)
Jul 31, 11:42 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Nisha Thakur
Other PGIMER Dept
nishathakurweb@gmail.com
08146301250
Definitely (100%)
Aug 1, 5:34 AM
APPROVED
WhatsApp Pass
Email Pass
Reset
Naveen Negi
Other PGIMER Dept
neveennegi104@gmail.com
07814712127
Definitely (100%)
Aug 1, 9:38 AM
APPROVED
WhatsApp Pass
Email Pass
Reset
Binu
Admin / Staff
sharmabinu329@gmail.com
8288860069
Definitely (100%)
Aug 1, 9:55 AM
APPROVED
WhatsApp Pass
Email Pass
Reset
Mr. Aswin S
Other PGIMER Dept
aswinsachidanandan71@gmail.com
9895226261
Likely (75%)
Aug 1, 10:04 AM
APPROVED
WhatsApp Pass
Email Pass
Reset
Neha
Admin / Staff
nehurajput6@gmail.com
7018642017
Likely (75%)
Aug 1, 10:08 AM
APPROVED
WhatsApp Pass
Email Pass
Reset
Paras Soni
Pediatrics
parassoni663@gmail.com
09670108585
Definitely (100%)
Aug 1, 10:12 AM
APPROVED
WhatsApp Pass
Email Pass
Reset
Anmol
Admin / Staff
aniket33u@gmail.com
8307626716
Definitely (100%)
Aug 1, 10:39 AM
APPROVED
WhatsApp Pass
Email Pass
Reset
Kusum
Other PGIMER Dept
kusumpanchal80@gmail.com
7206460506
Definitely (100%)
Aug 1, 10:42 AM
APPROVED
WhatsApp Pass
Email Pass
Reset
Sujata
Nursing
sujataparjapati814@gmail.com
6283023577
50-50 / Unsure
Aug 1, 10:53 AM
APPROVED
WhatsApp Pass
Email Pass
Reset
CHANDAN KUMAR
Pediatrics
chandan.pgimer12@gmail.com
9418469403
Definitely (100%)
Aug 1, 1:32 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Rohit Choudhary
Other PGIMER Dept
rohitchard3@gmail.com
8699480396
Definitely (100%)
Aug 1, 1:58 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Sakshi
Other PGIMER Dept
msakshimadaan@gmail.com
6283120189
Unlikely
Aug 1, 1:59 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Sarasija
Other PGIMER Dept
sarasija209@gmail.com
9176069869
Definitely (100%)
Aug 1, 4:17 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Saksham Thakur
Other PGIMER Dept
sakshamthakur2334@gmail.com
7807030436
50-50 / Unsure
Aug 1, 5:23 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Rinku Pal
Anaesthesia
rinkupal9694955@gmail.com
8383056019
Definitely (100%)
Aug 1, 5:24 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Jasminepreet Kaur
Nursing
jasminepreetkaur12@gmail.com
8146429168
Definitely (100%)
Aug 1, 6:37 PM
APPROVED
WhatsApp Pass
Email Pass
Reset
Abhinav sharma
Other PGIMER Dept
abhinavmodgil7@gmail.com
9459836679
Definitely (100%)
Aug 1, 6:40 PM
APPROVED
WhatsApp Pass
Email Pass
Reset`;

function parseDateStr(dateStr) {
  // e.g. "Jul 30, 10:09 AM" -> "Jul 30, 2026 10:09 AM"
  // Assuming year is 2026
  const withYear = dateStr.replace(',', ', 2026');
  return new Date(withYear).getTime();
}

async function main() {
  const chunks = rawData.split('Reset').filter(c => c.trim().length > 0);
  
  for (const chunk of chunks) {
    const lines = chunk.split('\n').map(l => l.trim()).filter(l => l.length > 0 && l !== 'WhatsApp Pass' && l !== 'Email Pass');
    if (lines.length < 7) continue;
    
    const email = lines[2];
    const dateStr = lines[5]; // e.g. "Jul 31, 3:03 PM"
    
    const timestamp = parseDateStr(dateStr);
    
    if (timestamp) {
      try {
        await sqlite.execute({
          sql: `UPDATE attendance_requests SET created_at = ? WHERE email = ? AND event_id = 1`,
          args: [timestamp, email]
        });
        console.log(`Updated ${email} with timestamp ${timestamp} (${new Date(timestamp).toLocaleString()})`);
      } catch (e) {
        console.error(`Failed to update ${email}: `, e);
      }
    }
  }
  
  console.log("Done updating timings!");
  process.exit(0);
}

main();

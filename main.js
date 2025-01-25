const fs = require('fs');
const {getWalletInfo, daylyCheckin, sendTx} = require('./config/api');
const logger = require('./config/logger');
const colors = require('./config/colors');

const CONSTANTS = {
    DELAYS: {
      MIN: 500000,
      MAX: 1000000,
    },
    AMOUNTS: {
      MIN: 0.01,
      MAX: 0.5,
    },
}

const getRandomDelay = () => {
    return Math.floor(
      Math.random() * (CONSTANTS.DELAYS.MAX - CONSTANTS.DELAYS.MIN + 1) +
        CONSTANTS.DELAYS.MIN
    );
};

function shortDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getRandomAmount = () => {
    return (Math.random() * (CONSTANTS.AMOUNTS.MAX - CONSTANTS.AMOUNTS.MIN) + CONSTANTS.AMOUNTS.MIN).toFixed(3); 
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getAccountFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    console.error("Error reading or parsing file:", error);
    return [];
  }
}

function getRandomAddress() {
    return new Promise((resolve, reject) => {
      fs.readFile('wallet.txt', 'utf8', (err, data) => {
        if (err) {
          reject('Error membaca file: ' + err);
          return;
        }
  
        const wallets = data.split('\n').map(line => line.trim()).filter(line => line !== '');
  
        const randomIndex = Math.floor(Math.random() * wallets.length);
        const randomWallet = wallets[randomIndex];
  
        resolve(randomWallet);
      });
    });
  }

async function processWalletInfo() {
    const emails = getAccountFromFile('account.json');
    for (let account of emails) {
        try {
            await getWalletInfo(account.email);

        } catch (error) {
            console.error(`Error processing email ${account.email}:`, error);
        }
    }
}

async function processDaylyCheckin() {
    const addreses = getAccountFromFile('account.json');
    for (let account of addreses) {
        try {
            await daylyCheckin(account.address);

            logger.info(`${colors.timerCount} Waiting 5 seconds${colors.reset}`);
            await shortDelay(5000);

            const randomAdress = await getRandomAddress();
            await sendTx(account.email, getRandomAmount(), randomAdress, account.pw);

            const RandomDelay = getRandomDelay();
            logger.info(`${colors.timerCount} Waiting ${RandomDelay}ms...${colors.reset}`);
            await delay(RandomDelay);
        } catch (error) {
            console.error(`Error processing address ${account.address}:`, error);
        }
    }
}

async function main() {
    await processWalletInfo();
    await processDaylyCheckin();
}

main();

function getRandomTime() {
    const startHour = 1;
    const endHour = 14; 
    const randomHour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
    const randomMinute = Math.floor(Math.random() * 60);

    return {
        hour: randomHour,
        minute: randomMinute
    };
}

function getTimeUntilNextRun(targetHour, targetMinute) {
    const now = new Date();
    const targetTime = new Date(now);

    targetTime.setHours(targetHour, targetMinute, 0, 0); 

    if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    return targetTime - now;
}

async function scheduleMain() {
    const { hour, minute } = getRandomTime();  
    console.log(`Next run scheduled for ${hour}:${minute < 10 ? '0' : ''}${minute}`);

    const timeUntilNextRun = getTimeUntilNextRun(hour, minute);

    setTimeout(async () => {
        await main(); 
        scheduleMain(); 
    }, timeUntilNextRun);
}

scheduleMain();
const axios = require('axios');
const colors = require('./colors');
const logger = require('./logger');

const BASE_URL = 'https://arichain.io';
const WALLET_INFO = `${BASE_URL}/api/wallet/get_list_mobile`;
const DAILY_CHECKIN = `${BASE_URL}/api/event/checkin`;

const RequestHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Dart/3.3 (dart:io)',
    'host': 'arichain.io'
}

async function getWalletInfo(email) {
    try {
        const data = new URLSearchParams();
        data.append('email', email);
        data.append('blockchain', 'tesnet');
        data.append('lang', 'id');
        data.append('device', 'app');
        data.append('is_mobile', 'Y');

        const response = await axios({
            url: WALLET_INFO,
            method: 'POST',
            data: data, 
            headers: RequestHeaders
        });

        logger.info(
            `${colors.accountInfo}\r
            Email: ${email.toString()}
            Account: ${JSON.stringify(response.data.result[0].account)}
            Balance: ${JSON.stringify(response.data.result[0].balance)}
            ${colors.reset}`
        )

        return response.data;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function daylyCheckin(walletAddress) {
    try {
        const data = new URLSearchParams();
        data.append('address', walletAddress);
        data.append('blockchain', 'tesnet');
        data.append('lang', 'id');
        data.append('device', 'app');
        data.append('is_mobile', 'Y');

        const response = await axios({
            url: DAILY_CHECKIN,
            method: 'POST',
            data: data, 
            headers: RequestHeaders
        });

        if (response.data.status === 'fail') {
            logger.error(
                `${colors.warning} Email: ${walletAddress} ${colors.reset} ${colors.error} ${response.data.msg} ${colors.reset}`
            )
        } else if (response.data.status === 'success') {
            logger.success(
                `${colors.success} Email: ${walletAddress}${colors.reset} Combo ${colors.success} ${response.data.result.history.combo} ${colors.reset}`
            )
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = {
    getWalletInfo,
    daylyCheckin
};
const axios = require('axios');
const colors = require('./colors');
const logger = require('./logger');

const BASE_URL = 'https://arichain.io';
const WALLET_INFO = `${BASE_URL}/api/wallet/get_list_mobile`;
const DAILY_CHECKIN = `${BASE_URL}/api/event/checkin`;
const GET_QUIZ = `${BASE_URL}/api/event/quiz_q`;
const ANSWER_QUIZ = `${BASE_URL}/api/event/quiz_a`;

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

async function getQuiz(walletAddress) {
    try {
        const data = new URLSearchParams();
        data.append('address', walletAddress);
        data.append('blockchain', 'tesnet');
        data.append('lang', 'id');
        data.append('device', 'app');
        data.append('is_mobile', 'Y');

        const response = await axios({
            url: GET_QUIZ,
            method: 'POST',
            data: data, 
            headers: RequestHeaders
        });

        logger.info(
            `${colors.accountInfo}\r
            Quiz: ${response.data.result.quiz_title}\n${response.data.result.quiz_q.map((q) => `${q.q_idx}: ${q.question}`).join('\n')}
            ${colors.reset}`
        );
        

        return response.data;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function answerQuiz(walletAddress, quizId, answerId) {
    try {
        const data = new URLSearchParams();
        data.append('address', walletAddress);
        data.append('blockchain', 'tesnet');
        data.append('lang', 'id');
        data.append('device', 'app');
        data.append('is_mobile', 'Y');
        data.append('quiz_idx', quizId);
        data.append('answer_idx', answerId);

        const response = await axios({
            url: ANSWER_QUIZ,
            method: 'POST',
            data: data, 
            headers: RequestHeaders
        });

        if (response.data.result.code === '1') {
            logger.error(
                `${colors.warning} Wallet: ${walletAddress} ${colors.reset} ${colors.error} ${response.data.result.msg} ${colors.reset}`
            )
        } else if (response.data.code === '0') {
            logger.success(
                `${colors.success} Wallet: ${walletAddress}${colors.reset} Is Answer? ${colors.success} ${response.data.result.history.is_answer} ${colors.reset}`
            )
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = {
    getWalletInfo,
    daylyCheckin,
    getQuiz,
    answerQuiz
};
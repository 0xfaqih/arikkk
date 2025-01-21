const fs = require("fs");
const { getQuiz, answerQuiz } = require("./config/api");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

function questionAsync(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

getQuiz("ARW6XF81aNWLeyXUQ9aMwjcJhx1cJRzVj9czNVMbFno3xNzUztuyu")
  .then(async (quizData) => {

    const addresses = getAccountFromFile("account.json");

    const answer = await questionAsync("Answer id: ");

    for (let account of addresses) {
      try {

        await answerQuiz(account.address, quizData.result.quiz_idx, answer);
      } catch (error) {
        console.error(`Error processing account ${account.address}:`, error);
      }
    }
  })
  .catch((error) => {
    console.error("Error fetching quiz data:", error);
  });

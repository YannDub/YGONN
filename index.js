const brain = require("brain.js")
    , request = require("request-promise-native")
    , {imread, imwrite} = require("./src/ImageProcessor")
    , fs = require('fs');

const hostListCard = "https://db.ygoprodeck.com";

let net = new brain.recurrent.RNN();

let getApiRequest = async function(url, map) {
  let res = await request({uri: url});
  return map(res);
}

let listAllCard = async function() {
  return await getApiRequest(`${hostListCard}/api/v2/cardinfo.php`, JSON.parse);
}

let training = async function(nbTrain, cards) {
  let testSet = [];
  for (var i = 0; i < nbTrain; i++) {
    let name = cards[getRandomInt(0, cards.length)];
    try {
      let card = (await getInfoFromCardName(name)).card;
      let image = (await getImageCard(card)).data;
      testSet.push({input: image, output: card.type});
    } catch(err) {
      console.log(err, name);
    }
  }
  net.train(testSet);
}

let check = async function(n, cards) {
  let sat = 0;

  for (var i = 0; i < n; i++) {
    let name = cards[i];
    try {
      let card = (await getInfoFromCardName(name)).card;
      let image = (await getImageCard(card)).data;
      let output = net.run(image);
      console.log(output);
      if(output === card.type) {
        sat++;
      }
    } catch(err) {
      console.log(err, name);
    }
  }
  console.log("Result:");
  console.log("Good: ", sat / n);
  console.log("Bad: ", (n - sat0) / n);
}

const downloadSpecificCard = async (id) => {
  try {
    if(!fs.existsSync('./static/' + id + '.jpg')) {
      let options = {
        uri: `https://ygoprodeck.com/pics/${id}.jpg`,
        encoding: null
      }
      let res = await request.get(options);
        fs.writeFileSync('./static/' + id + '.jpg', res);
      }
  } catch(err) {
    console.error(err);
  }
}

let main = async function() {
  // let allCards = (await listAllCard()).cards;
  // training(200, allCards);
  // check(10, allCards);
  let allCards = (await listAllCard());
  let cardsById = []

  for(let i = 0; i < allCards[0].length; i++) {
    let elem = allCards[0][i];
    cardsById[elem.id] = elem;
    await downloadSpecificCard(elem.id);
  }

  //matrix : [channel, x, y]
  let matrix = await imread(`./static/${Object.keys(cardsById)[0]}.jpg`);
  imwrite(matrix, "res.jpg")
}

main();

// net.train([
//   {input: [0,0], output: [0]},
//   {input: [0,1], output: [1]},
//   {input: [1,0], output: [1]},
//   {input: [1,1], output: [0]}
// ])
//
// let output = net.run([0,0]);
// console.log(output);

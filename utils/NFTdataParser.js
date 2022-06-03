module.exports = function NFTdataParser (data) {
  let bigObj = data.split('BIG OBJECT')[1]
  console.log("This is a bigOBJ",bigObj)
  return JSON.parse(bigObj)
}
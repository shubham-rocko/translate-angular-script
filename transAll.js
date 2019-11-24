const path = require('path');
const fs = require('fs');
//joining path of directory 
const src = "" //add directory name
const regEx = new RegExp(/\^*.html/); // create regEx to matach file with extension
const directoryPath = path.join(__dirname, src);
const jsonFileName = "en-US.json";
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (fileName) {
        if(fileName.match(regEx)){
            readFileData(fileName)
        }
    });
});

//readFile Data in UTF-8 format
function readFileData(fileName){
    fs.readFile(`./${fileName}`, {encoding: 'utf-8'}, (err,data) => {
        !err ? findBtwnData(data, fileName) : console.log('ErrorMessage: ', err);
    })
}

//Find all the data which exists in between angle brackets(><)
function findBtwnData(fileData, fileName){
    let textArray = [];
    let ci = -1;
    let textMode = false;
    
    for(let i=0; i<fileData.length; i++){
        let cc = fileData.charAt(i);
        if(cc === ">"){
            textMode = true;
            continue;
        }else if(cc === "<"){
            textMode = false;
            ci++;
            textArray.push("");
            continue;
        }
        if(textMode){
            textArray[ci] += cc; 
        }
    }
    createJsonObject(textArray, fileData, fileName);
}

function createJsonObject(textArray, fileData, fileName){
    let jsonData = '';
    textArray.forEach((text) => {
        if(text && !text.match(/\n/)){
            let replacementString = '{{"' + text.trim().split(' ').join('_').toUpperCase() + '" | translate }}';
            fileData = fileData.split(text).join(replacementString);
            let key = text.trim().split(' ').join("_").toUpperCase();
            jsonData += `"${key}": "${text}",\n`;
        }
    });
    jsonData = `{${jsonData}}`
    writeOrCreateFile(jsonData);
    console.log("fileData", fileData)
    fs.writeFile(fileName, fileData, function(err) {
        if (err) {
            console.log(err);
            return;
        }
    });
}

function writeOrCreateFile(jsonObj){
    fs.access(jsonFileName, fs.constants.W_OK, (err) => {
        if(err){
            console.log(err);
            createNewFile(jsonObj);
            return;
        }
        // fs.appendFile(jsonFileName, 'wx', (err, fd) => {
        //     if (err) throw err;
        //     writeMyData(jsonObj);
        //   });
        createNewFile(jsonObj)
      });
}

function createNewFile(jsonObj){
    fs.writeFile(jsonFileName, jsonObj, (err, fd) => {
        if (err) throw err;
        // writeMyData(jsonObj);
    });
}
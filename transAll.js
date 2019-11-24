const path = require('path');
const fs = require('fs');
//joining path of directory 
const src = "" //add directory name
const regEx = new RegExp(/\^*.html/); // create regEx to matach file with extension
const directoryPath = path.join(__dirname, src);
const jsonFileName = "en-US.json";
//passsing directoryPath and callback function
function readAllFileAndDir(directoryPath){
    directoryPath = path.join(__dirname, directoryPath);
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        files.forEach(function (fileName) {
            fs.stat(directoryPath+ "/" + fileName, function(err, stat) {
                if (stat) {
                    if(stat.isDirectory()){
                        readAllFileAndDir(fileName)
                    }else{
                        if(fileName.match(regEx)){
                            readFileData(directoryPath+"/"+fileName , fileName)
                        }
                    }
                }
            });
        });
    });
}

//readFile Data in UTF-8 format
function readFileData(filePath, fileName){
    fs.readFile(`${filePath}`, {encoding: 'utf-8'}, (err,data) => {
        !err ? findBtwnData(data, fileName, filePath) : console.log('ErrorMessage: ', err);
    })
}

//Find all the data which exists in between angle brackets(><)
function findBtwnData(fileData, fileName, filePath){
    let textArray = [];
    let ci = -1;
    let textMode = false;
    if(!fileData.match(/\| translate/)){
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
    createJsonObject(textArray, fileData, fileName, filePath);
    console.log(textArray)
    }
}

function createJsonObject(textArray, fileData, fileName, filePath){
    let jsonData = '';
    textArray.forEach((text) => {
        if(text && !text.match(/\n/)){
            let replacementString = '{{"' + text.trim().split(' ').join('_').toUpperCase() + '" | translate }}';
            fileData = fileData.split(text).join(replacementString);
            let key = text.trim().split(' ').join("_").toUpperCase();
            jsonData += `"${key}": "${text}",\n`;
        }
    });
    console.log(jsonData);
    writeOrCreateFile(jsonData);
    fs.writeFile(filePath, fileData, function(err) {
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
        appendFileData(jsonObj)
      });
}

function createNewFile(jsonObj){
    fs.writeFile(jsonFileName, jsonObj, (err, fd) => {
        if (err) throw err;
        // writeMyData(jsonObj);
    });
}

function appendFileData(jsonData){
    // console.log(jsonData);
    fs.appendFile(jsonFileName, jsonData, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
}

readAllFileAndDir("");
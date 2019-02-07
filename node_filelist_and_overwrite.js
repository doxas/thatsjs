
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

let pathArray = [];
let promises = [];

// root になるパスだけをコマンドライン引数から受け取る
// read(process.argv[2], (err, pathArray) => {
//     console.log(pathArray);
// });

// root になるパスをもとにファイル一覧を生成
// さらに第二引数で指定されたファイルで連続上書きする
overwrite(process.argv[2], process.argv[3], () => {});

/**
 * 指定されたディレクトリ内に存在するファイルの一覧を取得する
 * @param {string} root - パス
 * @param {function} [callback] - コールバック
 */
function read(root, callback){
    if(root == null || root == ''){
        if(callback != null){
            callback('[read] invalid arguments');
        }
        return;
    }
    fs.readdir(root, {withFileTypes: true}, (err, dirEntry) => {
        if(err != null){
            if(callback != null){
                callback(err);
            };
            return;
        }
        let dirs = [];
        dirEntry.map((dir) => {
            if(dir.isDirectory() !== true){
                // どういうファイルを抽出するかはここの正規表現で決まる
                if(dir.name.match(/.+\.gltf$/) != null){
                    dirs.push(dir.name);
                }
            }
        });
        if(callback != null){
            callback(null, dirs);
        }
    });
}

/**
 * 指定されたディレクトリ内に存在するファイルの一覧を取得する
 * @param {string} root - ルートとなるディレクトリのパス
 * @param {string} source - 元ソースとなるファイルのパス
 * @param {function} [callback] - コールバック
 */
function overwrite(root, source, callback){
    if(root == null || root == ''){
        if(callback != null){
            callback('[overwrite] invalid arguments');
        }
        return;
    }
    read(root, (err, pathArray) => {
        if(err != null){
            if(callback != null){
                callback(err);
            }
            return;
        }
        if(pathArray.length === 0){
            if(callback != null){
                callback('empty directory');
            }
            return;
        }
        Promise.all(pathArray.map((v) => {
            if(v === source){return Promise.resolve();}
            return new Promise((resolve, reject) => {
                fs.copyFile(source, v, (err) => {
                    if(err != null){
                        reject(err);
                    }else{
                        resolve(v);
                    }
                });
            });
        }))
        .then((res) => {
            if(callback != null){
                callback(null, res);
            }
        })
        .catch((e) => {
            if(e != null){
                if(callback != null){
                    callback(e);
                }
            }
        });
    });
}


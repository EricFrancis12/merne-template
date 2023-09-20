const crypto = require('crypto');
const fs = require('fs');
const path = require('path');



(function () {
    const defaultEnvVariables = [
        `APP_NAME=My First App`,
        `PROTOCOL=http://`,
        `DOMAIN=`,
        `PORT=3000`,
        `COOKIE_SECRET=${crypto.randomUUID()}`,
        `MONGODB_URI=`,
        `MONGODB_URI_LOCAL=mongodb://127.0.0.1/${path.dirname(__dirname).split('\\').pop()}`,
        `BREVO_API_KEY=`
    ];

    const dirsToMake = ['../tmp'];
    const txtFilesToWrite = [
        { file: '../.env', data: defaultEnvVariables.join('\n') }
    ];

    dirsToMake.forEach(dir => {
        makeDirectory(dir);
    });

    txtFilesToWrite.forEach(item => {
        writeTxtFile(item.file, item.data);
    });

    function makeDirectory(dir) {
        const dirPath = path.resolve(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath);
            } catch (err) {
                console.error(`Unable to create directory: ${dirPath}`);
            }
        }
    }

    function writeTxtFile(file, data) {
        const filePath = path.resolve(__dirname, file);
        if (!fs.existsSync(filePath)) {
            try {
                fs.writeFileSync(filePath, data, { encoding: 'utf8' });
            } catch (err) {
                console.error(`Unable to write file: ${filePath}`);
            }
        }
    }
})();

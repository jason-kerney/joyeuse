const spawn = require('child_process').spawn;
const fs = require('fs');

function statPath(filePath) {
    try {
        return fs.lstatSync(filePath);
    } catch (e) {
        return false;
    }
}

function BeyondCompare4() {
    return {
        name: 'BeyondCompare4',
        canReportOn: function () {
            return true;
        },
        report: function (approvedFilePath, receivedFilePath) {
            const executionPath = '/Program Files/Beyond Compare 4/BCompare.exe';
            const approvedPath = './' + approvedFilePath;
            const receivedPath = './' + receivedFilePath;

            const approvedStat = statPath(approvedPath);

            if (!approvedStat) {
                fs.writeFileSync(approvedPath, '');
            }

            spawn(executionPath, [receivedPath, approvedPath], { detached: true });
        }
    };
}

function BeyondCompare3() {
    return {
        name: 'BeyondCompare3',
        canReportOn: function () {
            return true;
        },
        report: function (approvedFilePath, receivedFilePath) {
            const executionPath = 'c:/Program Files (x86)/Beyond Compare 3/BCompare.exe';
            const approvedPath = './' + approvedFilePath;
            const receivedPath = './' + receivedFilePath;

            const approvedStat = statPath(approvedPath);

            if (!approvedStat) {
                fs.writeFileSync(approvedPath, '');
            }

            spawn(executionPath, [receivedPath, approvedPath], { detached: true });

        }
    };
}

module.exports = {
    BeyondCompare4: BeyondCompare4,
    BeyondCompare3: BeyondCompare3
};
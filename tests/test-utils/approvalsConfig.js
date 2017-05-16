var BeyondCompare4 = require('./BeyondCompareReporters').BeyondCompare4;

module.exports = {
    reporters: [new BeyondCompare4()],
    normalizeLineEndingsTo: '\n',
    appendEOL: true,
    EOL: require('os').EOL,
    errorOnStaleApprovedFiles: false,
    shouldIgnoreStaleApprovedFile: function (/*fileName*/) { return false; },
    stripBOM: false,
    forceApproveAll: false,
    failOnLineEndingDifferences: false
}
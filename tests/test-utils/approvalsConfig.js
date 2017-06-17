const BeyondCompare4 = require('./BeyondCompareReporters').BeyondCompare4;

const approvalsConfig = {
    reporters: [new BeyondCompare4()],
    normalizeLineEndingsTo: '\n',
    appendEOL: true,
    EOL: require('os').EOL,
    errorOnStaleApprovedFiles: false,
    shouldIgnoreStaleApprovedFile: function (/*fileName*/) { return false; },
    stripBOM: false,
    forceApproveAll: false,
    failOnLineEndingDifferences: false
};

// const approvalsPath = './tests/approvals';
// const approvals = require('approvals').configure(approvalsConfig).mocha(approvalsPath);

module.exports = approvalsConfig;
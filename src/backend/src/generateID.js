function generateUserId() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(100 + Math.random() * 900);
    return `USR${timestamp}${random}`;
}

function generateJobId() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(100 + Math.random() * 900);
    return `JOB${timestamp}${random}`;
}

function generatePersonalInfoId() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(100 + Math.random() * 900);
    return `PER${timestamp}${random}`;
}

function generateApplicationId() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(100 + Math.random() * 900);
    return `APP${timestamp}${random}`;
}

function generateInterviewId() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(100 + Math.random() * 900);
    return `INT${timestamp}${random}`;
}

function generateResumeId() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(100 + Math.random() * 900);
    return `RE${timestamp}${random}`;
}

module.exports = {
    generateUserId,
    generateJobId,
    generatePersonalInfoId,
    generateApplicationId,
    generateInterviewId,
    generateResumeId
};
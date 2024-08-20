//This file is used to detect key phrases and then send a response to the member that triggered the check
const { helpChannelId } = require('./config');
function createResponses() {
    return {
        'help me': `It looks like you need help! Please ask your question in the designated help channel: <#${helpChannelId}>`,
        'I need help': `For assistance, please post your question in our help channel: <#${helpChannelId}>`,
        'assist me': `Need assistance? Drop your question in the help channel: <#${helpChannelId}>`,
        'support': `For support, please use the help channel: <#${helpChannelId}>`
    };
}

module.exports = createResponses;
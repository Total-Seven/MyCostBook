// {app_root}/app/extend/helper.js

module.exports = {
    parseMsg(action, payload = {}, metadata = {}) {
        const meta = Object.assign(
            {},
            {
                timestamp: Date.now(),
            },
            metadata,
        );

        return {
            meta,
            data: {
                action,
                payload,
            },
        };
    },
};
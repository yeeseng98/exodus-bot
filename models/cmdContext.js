function CmdContext(message, args, db, rtdb, client, cache) {
    this.message = message;
    this.args = args;
    this.db = db;
    this.rtdb = rtdb;
    this.client = client;
    this.cache = cache;
}

module.exports = CmdContext;

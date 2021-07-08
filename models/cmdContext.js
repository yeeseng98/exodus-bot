function CmdContext(message, args, db, client, cache) {
    this.message = message;
    this.args = args;
    this.db = db;
    this.client = client;
    this.cache = cache;
}

module.exports = CmdContext;

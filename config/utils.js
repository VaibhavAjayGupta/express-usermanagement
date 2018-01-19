'use strict'

// Capitalize first letter of a string/word
let capitalize=exports.capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Extract index name from mongoDB duplicate key error
exports.indexName = function (str) {
    let regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i,
        match = str.message.match(regex),
        indexName = match[1] || match[2];
    return capitalize(indexName);
}


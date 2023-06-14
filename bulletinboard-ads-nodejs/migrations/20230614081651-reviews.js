'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function ({ dbmigrate }, seedLink) {
  dbm = dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = async db => {
  await db.createTable('reviews', {
    contact: {
      type: 'string',
      primaryKey: true,
      length: 256,
      notNull: true
    },
    review: {
      type: 'real',
      notNull: true
    },
  })
}

exports.down = async db => {
  await db.dropTable('reviews')
}


exports._meta = {
  "version": 1
};

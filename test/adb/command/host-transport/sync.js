var Chai, MockConnection, Protocol, Sinon, SyncCommand, expect;

Sinon = require('sinon');

Chai = require('chai');

Chai.use(require('sinon-chai'));

({expect} = Chai);

MockConnection = require('../../../mock/connection');

Protocol = require('../../../../lib/adb/protocol');

SyncCommand = require('../../../../lib/adb/command/host-transport/sync');

describe('SyncCommand', function() {
  return it("should send 'sync:'", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new SyncCommand(conn);
    conn.socket.on('write', function(chunk) {
      expect(chunk.toString()).to.equal(Protocol.encodeData('sync:').toString());
      conn.socket.causeRead(Protocol.OKAY);
      return conn.socket.causeEnd();
    });
    cmd.execute().then(function() {
      return done();
    });
  });
});

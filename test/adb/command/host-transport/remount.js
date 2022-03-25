var Chai, MockConnection, Protocol, RemountCommand, Sinon, expect;

Sinon = require('sinon');

Chai = require('chai');

Chai.use(require('sinon-chai'));

({expect} = Chai);

MockConnection = require('../../../mock/connection');

Protocol = require('../../../../lib/adb/protocol');

RemountCommand = require('../../../../lib/adb/command/host-transport/remount');

describe('RemountCommand', function() {
  return it("should send 'remount:'", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new RemountCommand(conn);
    conn.socket.on('write', function(chunk) {
      expect(chunk.toString()).to.equal(Protocol.encodeData('remount:').toString());
      conn.socket.causeRead(Protocol.OKAY);
      return conn.socket.causeEnd();
    });
    cmd.execute().then(function() {
      return done();
    });
  });
});

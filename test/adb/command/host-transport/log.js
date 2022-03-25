var Chai, LogCommand, MockConnection, Protocol, Sinon, Stream, expect;

Stream = require('stream');

Sinon = require('sinon');

Chai = require('chai');

Chai.use(require('sinon-chai'));

({expect} = Chai);

MockConnection = require('../../../mock/connection');

Protocol = require('../../../../lib/adb/protocol');

LogCommand = require('../../../../lib/adb/command/host-transport/log');

describe('LogCommand', function() {
  it("should send 'log:<log>'", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new LogCommand(conn);
    conn.socket.on('write', function(chunk) {
      return expect(chunk.toString()).to.equal(Protocol.encodeData('log:main').toString());
    });
    setImmediate(function() {
      conn.socket.causeRead(Protocol.OKAY);
      return conn.socket.causeEnd();
    });
    cmd.execute('main').then(function(stream) {
      return done();
    });
  });
  return it("should resolve with the log stream", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new LogCommand(conn);
    setImmediate(function() {
      return conn.socket.causeRead(Protocol.OKAY);
    });
    cmd.execute('main').then(function(stream) {
      stream.end();
      expect(stream).to.be.an.instanceof(Stream.Readable);
      return done();
    });
  });
});

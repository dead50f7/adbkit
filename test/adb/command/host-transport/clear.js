var Chai, ClearCommand, MockConnection, Protocol, Sinon, Stream, expect;

Stream = require('stream');

Sinon = require('sinon');

Chai = require('chai');

Chai.use(require('sinon-chai'));

({expect} = Chai);

MockConnection = require('../../../mock/connection');

Protocol = require('../../../../lib/adb/protocol');

ClearCommand = require('../../../../lib/adb/command/host-transport/clear');

describe('ClearCommand', function() {
  it("should send 'pm clear <pkg>'", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new ClearCommand(conn);
    conn.socket.on('write', function(chunk) {
      expect(chunk.toString()).to.equal(Protocol.encodeData('shell:pm clear foo.bar.c').toString());
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead('Success\r\n');
      return conn.socket.causeEnd();
    });
    cmd.execute('foo.bar.c').then(function() {
      return done();
    });
  });
  it("should succeed on 'Success'", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new ClearCommand(conn);
    conn.socket.on('write', function(chunk) {
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead('Success\r\n');
      return conn.socket.causeEnd();
    });
    cmd.execute('foo.bar.c').then(function() {
      return done();
    });
  });
  it("should error on 'Failed'", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new ClearCommand(conn);
    conn.socket.on('write', function(chunk) {
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead('Failed\r\n');
      return conn.socket.causeEnd();
    });
    cmd.execute('foo.bar.c').catch(function(err) {
      expect(err).to.be.an.instanceof(Error);
      return done();
    });
  });
  it("should error on 'Failed' even if connection not closed by device", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new ClearCommand(conn);
    conn.socket.on('write', function(chunk) {
      conn.socket.causeRead(Protocol.OKAY);
      return conn.socket.causeRead('Failed\r\n');
    });
    cmd.execute('foo.bar.c').catch(function(err) {
      expect(err).to.be.an.instanceof(Error);
      return done();
    });
  });
  return it("should ignore irrelevant lines", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new ClearCommand(conn);
    conn.socket.on('write', function(chunk) {
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead('Open: foo error\n\n');
      conn.socket.causeRead('Success\r\n');
      return conn.socket.causeEnd();
    });
    cmd.execute('foo.bar.c').then(function() {
      return done();
    });
  });
});

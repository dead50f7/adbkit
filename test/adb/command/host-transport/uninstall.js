var Chai, MockConnection, Parser, Protocol, Sinon, Stream, UninstallCommand, expect;

Stream = require('stream');

Sinon = require('sinon');

Chai = require('chai');

Chai.use(require('sinon-chai'));

({expect} = Chai);

MockConnection = require('../../../mock/connection');

Protocol = require('../../../../lib/adb/protocol');

Parser = require('../../../../lib/adb/parser');

UninstallCommand = require('../../../../lib/adb/command/host-transport/uninstall');

describe('UninstallCommand', function() {
  it("should succeed when command responds with 'Success'", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new UninstallCommand(conn);
    conn.socket.on('write', function(chunk) {
      return expect(chunk.toString()).to.equal(Protocol.encodeData('shell:pm uninstall foo').toString());
    });
    setImmediate(function() {
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead('Success\r\n');
      return conn.socket.causeEnd();
    });
    cmd.execute('foo').then(function() {
      return done();
    });
  });
  it("should succeed even if command responds with 'Failure'", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new UninstallCommand(conn);
    conn.socket.on('write', function(chunk) {
      return expect(chunk.toString()).to.equal(Protocol.encodeData('shell:pm uninstall foo').toString());
    });
    setImmediate(function() {
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead('Failure\r\n');
      return conn.socket.causeEnd();
    });
    cmd.execute('foo').then(function() {
      return done();
    });
  });
  it("should succeed even if command responds with 'Failure' with info in standard format", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new UninstallCommand(conn);
    conn.socket.on('write', function(chunk) {
      return expect(chunk.toString()).to.equal(Protocol.encodeData('shell:pm uninstall foo').toString());
    });
    setImmediate(function() {
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead('Failure [DELETE_FAILED_INTERNAL_ERROR]\r\n');
      return conn.socket.causeEnd();
    });
    cmd.execute('foo').then(function() {
      return done();
    });
  });
  it("should succeed even if command responds with 'Failure' with info info in weird format", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new UninstallCommand(conn);
    setImmediate(function() {
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead('Failure - not installed for 0\r\n');
      return conn.socket.causeEnd();
    });
    cmd.execute('foo').then(function() {
      return done();
    });
  });
  it("should succeed even if command responds with a buggy exception", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new UninstallCommand(conn);
    setImmediate(function() {
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead(`
Exception occurred while dumping:
java.lang.IllegalArgumentException: Unknown package: foo
	at com.android.server.pm.Settings.isOrphaned(Settings.java:4134)
	at com.android.server.pm.PackageManagerService.isOrphaned(PackageManagerService.java:18066)
	at com.android.server.pm.PackageManagerService.deletePackage(PackageManagerService.java:15483)
	at com.android.server.pm.PackageInstallerService.uninstall(PackageInstallerService.java:888)
	at com.android.server.pm.PackageManagerShellCommand.runUninstall(PackageManagerShellCommand.java:765)
	at com.android.server.pm.PackageManagerShellCommand.onCommand(PackageManagerShellCommand.java:113)
	at android.os.ShellCommand.exec(ShellCommand.java:94)
	at com.android.server.pm.PackageManagerService.onShellCommand(PackageManagerService.java:18324)
	at android.os.Binder.shellCommand(Binder.java:468)
	at android.os.Binder.onTransact(Binder.java:367)
	at android.content.pm.IPackageManager$Stub.onTransact(IPackageManager.java:2387)
	at com.android.server.pm.PackageManagerService.onTransact(PackageManagerService.java:3019)
	at android.os.Binder.execTransact(Binder.java:565)`);
      return conn.socket.causeEnd();
    });
    cmd.execute('foo').then(function() {
      return done();
    });
  });
  it("should reject with Parser.PrematureEOFError if stream ends before match", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new UninstallCommand(conn);
    setImmediate(function() {
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead('Hello. Is it me you are looking for?\r\n');
      return conn.socket.causeEnd();
    });
    cmd.execute('foo').catch(Parser.PrematureEOFError, function(err) {
      return done();
    });
  });
  return it("should ignore any other data", function(done) {
    var cmd, conn;
    conn = new MockConnection();
    cmd = new UninstallCommand(conn);
    conn.socket.on('write', function(chunk) {
      return expect(chunk.toString()).to.equal(Protocol.encodeData('shell:pm uninstall foo').toString());
    });
    setImmediate(function() {
      conn.socket.causeRead(Protocol.OKAY);
      conn.socket.causeRead('open: Permission failed\r\n');
      conn.socket.causeRead('Failure\r\n');
      return conn.socket.causeEnd();
    });
    cmd.execute('foo').then(function() {
      return done();
    });
  });
});

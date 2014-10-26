import SimpleHTTPServer
import SocketServer

PORT = 8000

class MyHTTPServer(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if "." not in self.path:
            self.path = "/"
        return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

httpd = SocketServer.TCPServer(("", PORT), MyHTTPServer)

print "serving at port", PORT
httpd.serve_forever()

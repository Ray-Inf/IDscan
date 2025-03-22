import uvicorn
from asgiref.wsgi import WsgiToAsgi
from app import app

if __name__ == "__main__":
    asgi_app = WsgiToAsgi(app)
    uvicorn.run(asgi_app, host="127.0.0.1", port=5000)
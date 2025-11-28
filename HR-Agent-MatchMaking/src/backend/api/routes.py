from flask import jsonify

def init_routes(app):
    @app.route('/test', methods=['GET'])
    def test():
        return jsonify({"message": "Flask app is running"})
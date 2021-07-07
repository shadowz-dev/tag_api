from flask import Flask, request, jsonify
from flask_restful import Resource, Api


#declare the requests methods inherited from flask_restful resources
class LicenseManager(Resource):
    @staticmethod
    def get():
        try: id = request.args['id']
        except Exception as _: id = None

        if not id:
            license = license.query.all()
            return jsonify(licences_Schema.dump(licenses))
        license = license.query.get(id)
        return jsonify(license_Schema.dump(license))

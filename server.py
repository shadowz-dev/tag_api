from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_restful import Resource, Api
import json



app = Flask(__name__)

api = Api(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///licenses.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)


class licenses(db.Model):   #declare Database table to create columns (inherited from SQLALCHEMY)
    id = db.Column(db.Integer, primary_key=True)
    license_number = db.Column(db.Integer, unique=True)
    Establishment_Name = db.Column(db.String(32), unique=True)
    TradeName_EN = db.Column(db.String(120), unique=True)
    TradeName_AR = db.Column(db.String(120), unique=True)
    Registration_Number = db.Column(db.Integer, unique=True)
    Chamber_Number = db.Column(db.Integer, unique=True)
    expiry_date = db.Column(db.Date())
    first_name = db.Column(db.String(32))
    last_name = db.Column(db.String(32))
    age = db.Column(db.Integer)

# Passing the arguments through the constractor of the class
    def __init__(self, license_number, Establishment_Name, TradeName_EN, TradeName_AR, Registration_Number, Chamber_Number,  expiry_date, first_name, last_name, age):
        self.license_number = license_number
        self.Establishment_Name = Establishment_Name
        self.TradeName_EN = TradeName_EN
        self.TradeName_AR = TradeName_AR
        self.Registration_Number = Registration_Number
        self.Chamber_Number = Chamber_Number
        self.expiry_date = expiry_date
        self.first_name = first_name
        self.last_name = last_name
        self.age = age

# Declare a schema for licenses (inherited from Marshmallow) to avoid JSON parsing
class licensesSchema(ma.Schema):
    class Meta:
        fields = ('id', 'license_number', 'Establishment_Name', 'TradeName_EN', 'TradeName_AR', 'Registration_Number', 'Chamber_Number', 'expiry_date', 'password', 'first_name', 'last_name', 'age')

license_Schema = licensesSchema()   # Declare variable for fetching single
licences_Schema = licensesSchema(many=True) # Declare variable for fetching multiple

'''
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
'''
file = open('test_data.json', "r", encoding='UTF-8')
data = json.loads(file.read())


@app.route('/', methods= ['GET'])
def home():
    return "Welcome to Basic Flask Server :) "

#@app.route('/licenses', methods=['GET'])   # Call all data in Json format
#def all():
#    return jsonify(data)
class licenses_handler(Resource):
    def get(self, license, Id):
        return data[license[Id]]
api.add_resource(licenses_handler, "/<string:license>/<int:Id>")

if __name__ == '__main__':
    app.run(debug=True)
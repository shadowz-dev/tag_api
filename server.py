from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_restful import Resource, Api



app = Flask(__name__)

api = Api(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///licenses.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)


class licenses(db.Model):   #declare Database table to create columns (inherited from SQLALCHEMY)
    id = db.Column(db.Integer, primary_key=True)
    license_number = db.Column(db.Integer, unique=True)
    company_name = db.Column(db.String(32), unique=True)
    expiry_date = db.Column(db.Date())
    password = db.Column(db.String(32))
    first_name = db.Column(db.String(32))
    last_name = db.Column(db.String(32))
    age = db.Column(db.Integer)

# Passing the arguments through the constractor of the class
    def __init__(self, license_number, company_name, expiry_date, password, first_name, last_name, age):
        self.license_number = license_number
        self.company_name = company_name
        self.expiry_date = expiry_date
        self.password = password
        self.first_name = first_name
        self.last_name = last_name
        self.age = age

# Declare a schema for licenses (inherited from Marshmallow) to avoid JSON parsing
class licensesSchema(ma.Schema):
    class Meta:
        fields = ('id', 'license_number', 'company_name', 'expiry_date', 'password', 'first_name', 'last_name', 'age')

license_Schema = licensesSchema()   # Declare variable for fetching single
licences_Schema = license_Schema(many=True) # Declare variable for fetching multiple


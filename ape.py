import requests


API = 'https://eservices.ajmanded.ae/ar/APIS/GetEntity'


re = requests.post(API)

print(re.text)
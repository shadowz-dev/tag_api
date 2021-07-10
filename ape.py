import requests


'''
curl "https://eservices.ajmanded.ae/en/APIS/GetEntity" 
-H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0" 
-H "Accept: application/json, text/javascript, */*; q=0.01" 
-H "Accept-Language: en-US,en;q=0.5" --compressed 
-H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" 
-H "X-Requested-With: XMLHttpRequest" 
-H "Origin: https://eservices.ajmanded.ae" 
-H "DNT: 1" 
-H "Connection: keep-alive" 
-H "Cookie: ASP.NET_SessionId=crwoikyzfhpzo134lqgg1ku0; TS0188275f=01445fedf9f421d5f7726f603aac9a48b3f8ea4233711ab0db55bbf4e5ef3696a5073ce6e9dac0d23f5d1f5f40c32699307c75898db73556711c5e1bffedf7a53ef4fb98489f4f025129bfb35d3485753a141a62a2; TawkConnectionTime=1625749039598; __RequestVerificationToken=4Hx4xuF88EFOXMkUZAsJVRkpb2gLoj2qG1U3vb3XS2h1SgOBvdrxuzmYPp-1PoHZfAgDBFyoolzVruDQm6zODEa3Vdsq5Z8m6MGWwVbDQYU1; TS0188275f031=01256d5e3261e3ae71543045ac5fcce8cbc0bccdac9360cc6c7396b16b53053254723be0622046285c76272e9cb05925705486817b" 
--data-raw "EntityDefId=6fc4c303-9628-4c28-971d-630547cc55c9&ConditionStr="%"7B"%"22ItemType"%"22"%"3A2"%"2C"%"22IsRootGroup"%"22"%"3Atrue"%"2C"%"22Queries"%"22"%"3A"%"5B"%"7B"%"22ItemType"%"22"%"3A1"%"2C"%"22Operator"%"22"%"3A1"%"2C"%"22ColumnName"%"22"%"3A"%"22Id"%"22"%"2C"%"22Value1"%"22"%"3A"%"22f8607f13-a94a-4572-b330-7c06b441701a"%"22"%"2C"%"22Value2"%"22"%"3A"%"22"%"22"%"7D"%"5D"%"7D"
'''

API = 'https://eservices.ajmanded.ae/ar/APIS/GetEntity'

header = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",

}

payload = {
    {"EntityDefId":"6fc4c303-9628-4c28-971d-630547cc55c9"},
    {"ConditionStr":{"ItemType":2,"IsRootGroup":True,"Queries":[{"ItemType":1,"Operator":1,"ColumnName":"Id","Value1":"f8607f13-a94a-4572-b330-7c06b441701a","Value2":""}]}}
}

re = requests.post(API)

print(re.text)